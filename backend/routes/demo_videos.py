"""
Demo Videos API - Generate AI demo videos with Sora 2
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/demo-videos", tags=["Demo Videos"])

# In-memory storage for demo videos (in production, use database)
demo_videos_storage = {}

class VideoGenerationRequest(BaseModel):
    video_id: str
    prompt: str
    duration: int = 8

class VideoResponse(BaseModel):
    id: str
    url: str
    status: str
    created_at: str

@router.get("/list")
async def list_demo_videos():
    """List all generated demo videos"""
    videos = [
        {"id": vid, "url": data["url"], "status": "ready", "created_at": data["created_at"]}
        for vid, data in demo_videos_storage.items()
        if data.get("url")
    ]
    return {"videos": videos, "total": len(videos)}

@router.get("/file/{filename}")
async def get_video_file(filename: str):
    """Serve generated video file"""
    file_path = f"/app/backend/uploads/demo_videos/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/mp4", filename=filename)

@router.post("/generate")
async def generate_demo_video(request: VideoGenerationRequest):
    """Generate a demo video using Sora 2"""
    try:
        from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        # Create video generator
        video_gen = OpenAIVideoGeneration(api_key=api_key)
        
        # Generate video
        video_bytes = video_gen.text_to_video(
            prompt=request.prompt,
            model="sora-2",
            size="1280x720",
            duration=request.duration,
            max_wait_time=600
        )
        
        if not video_bytes:
            raise HTTPException(status_code=500, detail="Video generation failed")
        
        # Save video to uploads folder
        output_dir = "/app/backend/uploads/demo_videos"
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"{request.video_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        output_path = os.path.join(output_dir, filename)
        
        video_gen.save_video(video_bytes, output_path)
        
        # Get the public URL - use the file endpoint
        backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://emerald-shield-1.preview.emergentagent.com')
        video_url = f"{backend_url}/api/demo-videos/file/{filename}"
        
        # Store in memory
        demo_videos_storage[request.video_id] = {
            "url": video_url,
            "path": output_path,
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "id": request.video_id,
            "url": video_url,
            "message": "Video generado correctamente"
        }
        
    except ImportError:
        raise HTTPException(
            status_code=500, 
            detail="emergentintegrations library not installed. Run: pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{video_id}")
async def delete_demo_video(video_id: str):
    """Delete a generated demo video"""
    if video_id not in demo_videos_storage:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video_data = demo_videos_storage[video_id]
    
    # Delete file if exists
    if os.path.exists(video_data.get("path", "")):
        os.remove(video_data["path"])
    
    del demo_videos_storage[video_id]
    
    return {"success": True, "message": "Video deleted"}
