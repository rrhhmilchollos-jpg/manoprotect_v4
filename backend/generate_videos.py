"""Generate 4 marketing videos for ManoProtect using Sora 2"""
import os
import sys
import time
sys.path.insert(0, os.path.abspath(''))
from dotenv import load_dotenv
load_dotenv()
from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

VIDEOS = [
    {
        "prompt": "Cinematic 4K video of a happy Spanish grandmother (75 years old) walking through a sunny Mediterranean plaza with orange trees in Seville, Spain. She is wearing a modern elegant ceramic smartwatch on her left wrist. She waves confidently at the camera while her daughter watches her location on a phone in the background. Warm golden hour sunlight, shallow depth of field, professional color grading, no text overlays.",
        "output": "/app/frontend/public/videos/sentinel_s_senior.mp4",
        "name": "sentinel_s_senior"
    },
    {
        "prompt": "Cinematic 4K video of a young Spanish boy (8 years old) with brown hair running happily through a school playground in Madrid, Spain. He wears a colorful kids smartwatch on his wrist. His mother stands at the school gate smiling, checking her phone which shows a GPS tracking map. Morning sunlight, natural colors, joyful atmosphere, professional cinematography, no text overlays.",
        "output": "/app/frontend/public/videos/sentinel_j_school.mp4",
        "name": "sentinel_j_school"
    },
    {
        "prompt": "Cinematic 4K video of a complete Spanish family (grandmother, parents, two children, teenager) having dinner together in a warm Mediterranean terrace at sunset. Each family member wears a different style smartwatch. They laugh and pass food while the grandmother shows her watch to the children. Warm amber lighting, shallow depth of field, intimate family moment, professional color grading, no text overlays.",
        "output": "/app/frontend/public/videos/sentinel_x_family.mp4",
        "name": "sentinel_x_family"
    },
    {
        "prompt": "Cinematic 4K video of a Spanish teenage girl (16 years old) hiking on a beautiful coastal trail in Costa Brava, Spain, with the blue Mediterranean sea in the background. She wears a sleek modern sport smartwatch. She reaches a viewpoint and raises her arms in triumph. Camera reveals her parents following behind on the trail. Golden sunset light, sweeping landscape, adventure feeling, professional cinematography, no text overlays.",
        "output": "/app/frontend/public/videos/sentinel_x_teen.mp4",
        "name": "sentinel_x_teen"
    }
]

os.makedirs("/app/frontend/public/videos", exist_ok=True)

for v in VIDEOS:
    print(f"\n🎬 Generating: {v['name']}...")
    try:
        gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        video_bytes = gen.text_to_video(
            prompt=v["prompt"],
            model="sora-2",
            size="1280x720",
            duration=4,
            max_wait_time=600
        )
        if video_bytes:
            gen.save_video(video_bytes, v["output"])
            print(f"  ✅ Saved: {v['output']} ({os.path.getsize(v['output'])/1024/1024:.1f}MB)")
        else:
            print(f"  ❌ Failed: No video bytes returned")
    except Exception as e:
        print(f"  ❌ Error: {e}")

print("\n🎬 All video generation complete!")
