from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class ThreatAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content: str
    content_type: str
    risk_level: str
    is_threat: bool
    threat_types: List[str]
    recommendation: str
    analysis: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyzeRequest(BaseModel):
    content: str
    content_type: str
    user_id: Optional[str] = "demo-user"

class TrustedContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    relationship: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrustedContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str

# Fraud Detection Function
async def analyze_threat(content: str, content_type: str) -> dict:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"fraud-analysis-{uuid.uuid4()}",
            system_message="""Eres un experto en detección de fraudes y amenazas digitales.
Analiza el contenido proporcionado y determina si es una amenaza potencial.
Identifica: phishing, smishing, vishing, estafas, suplantación de identidad.
Responde en formato JSON con:
{
  "is_threat": boolean,
  "risk_level": "low"|"medium"|"high"|"critical",
  "threat_types": [lista de tipos de amenaza detectados],
  "recommendation": "recomendación clara en español",
  "analysis": "análisis detallado en español"
}"""
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"Tipo de contenido: {content_type}\n\nContenido a analizar:\n{content}"
        )
        
        response = await chat.send_message(user_message)
        
        import json
        result = json.loads(response)
        return result
    except Exception as e:
        logging.error(f"Error in threat analysis: {e}")
        return {
            "is_threat": False,
            "risk_level": "low",
            "threat_types": [],
            "recommendation": "No se pudo analizar el contenido",
            "analysis": f"Error en el análisis: {str(e)}"
        }

# Routes
@api_router.get("/")
async def root():
    return {"message": "MANO API - Protección contra fraudes"}

@api_router.post("/analyze", response_model=ThreatAnalysis)
async def analyze_content(request: AnalyzeRequest):
    analysis_result = await analyze_threat(request.content, request.content_type)
    
    threat_obj = ThreatAnalysis(
        user_id=request.user_id,
        content=request.content,
        content_type=request.content_type,
        risk_level=analysis_result["risk_level"],
        is_threat=analysis_result["is_threat"],
        threat_types=analysis_result.get("threat_types", []),
        recommendation=analysis_result["recommendation"],
        analysis=analysis_result["analysis"]
    )
    
    doc = threat_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.threats.insert_one(doc)
    
    return threat_obj

@api_router.get("/threats", response_model=List[ThreatAnalysis])
async def get_threats(user_id: str = "demo-user", limit: int = 50):
    threats = await db.threats.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for threat in threats:
        if isinstance(threat['created_at'], str):
            threat['created_at'] = datetime.fromisoformat(threat['created_at'])
    
    return threats

@api_router.get("/stats")
async def get_stats(user_id: str = "demo-user"):
    total = await db.threats.count_documents({"user_id": user_id})
    threats_blocked = await db.threats.count_documents({"user_id": user_id, "is_threat": True})
    
    critical = await db.threats.count_documents({"user_id": user_id, "risk_level": "critical"})
    high = await db.threats.count_documents({"user_id": user_id, "risk_level": "high"})
    medium = await db.threats.count_documents({"user_id": user_id, "risk_level": "medium"})
    low = await db.threats.count_documents({"user_id": user_id, "risk_level": "low"})
    
    return {
        "total_analyzed": total,
        "threats_blocked": threats_blocked,
        "risk_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        }
    }

@api_router.post("/contacts", response_model=TrustedContact)
async def create_contact(contact: TrustedContactCreate, user_id: str = "demo-user"):
    contact_obj = TrustedContact(
        user_id=user_id,
        name=contact.name,
        phone=contact.phone,
        relationship=contact.relationship
    )
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    
    return contact_obj

@api_router.get("/contacts", response_model=List[TrustedContact])
async def get_contacts(user_id: str = "demo-user"):
    contacts = await db.contacts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    for contact in contacts:
        if isinstance(contact['created_at'], str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()