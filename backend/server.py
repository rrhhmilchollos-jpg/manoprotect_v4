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
import csv
import io

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
    dark_mode: bool = False
    notifications_enabled: bool = True
    auto_block: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    auto_block: Optional[bool] = None

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
    reported_false_positive: bool = False
    shared_count: int = 0
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
    is_emergency: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrustedContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str
    is_emergency: Optional[bool] = False

class SOSAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location: Optional[str] = None
    message: Optional[str] = None
    contacts_notified: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SOSRequest(BaseModel):
    user_id: str
    location: Optional[str] = None
    message: Optional[str] = None

class CommunityAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    threat_type: str
    description: str
    affected_users: int = 0
    severity: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
    
    # Create community alert if critical
    if threat_obj.is_threat and threat_obj.risk_level in ["critical", "high"]:
        community_alert = CommunityAlert(
            threat_type=", ".join(threat_obj.threat_types[:2]),
            description=threat_obj.recommendation[:100],
            severity=threat_obj.risk_level,
            affected_users=1
        )
        alert_doc = community_alert.model_dump()
        alert_doc['created_at'] = alert_doc['created_at'].isoformat()
        await db.community_alerts.insert_one(alert_doc)
    
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

@api_router.post("/threats/{threat_id}/share")
async def share_threat(threat_id: str):
    result = await db.threats.update_one(
        {"id": threat_id},
        {"$inc": {"shared_count": 1}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    return {"message": "Threat shared successfully"}

@api_router.post("/threats/{threat_id}/report")
async def report_false_positive(threat_id: str):
    result = await db.threats.update_one(
        {"id": threat_id},
        {"$set": {"reported_false_positive": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    return {"message": "False positive reported"}

@api_router.get("/export/threats")
async def export_threats(user_id: str = "demo-user", format: str = "csv"):
    threats = await db.threats.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    if format == "csv":
        output = io.StringIO()
        if threats:
            # Define consistent fieldnames for CSV export
            fieldnames = ['id', 'user_id', 'content', 'content_type', 'risk_level', 'is_threat', 
                         'threat_types', 'recommendation', 'analysis', 'created_at', 
                         'reported_false_positive', 'shared_count']
            writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(threats)
        return {"data": output.getvalue(), "format": "csv"}
    else:
        return {"data": threats, "format": "json"}

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
        relationship=contact.relationship,
        is_emergency=contact.is_emergency
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

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}

@api_router.post("/sos", response_model=SOSAlert)
async def trigger_sos(request: SOSRequest):
    contacts = await db.contacts.find(
        {"user_id": request.user_id, "is_emergency": True},
        {"_id": 0}
    ).to_list(10)
    
    contact_ids = [c["id"] for c in contacts]
    
    sos_obj = SOSAlert(
        user_id=request.user_id,
        location=request.location,
        message=request.message,
        contacts_notified=contact_ids
    )
    
    doc = sos_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sos_alerts.insert_one(doc)
    
    return sos_obj

@api_router.get("/community-alerts", response_model=List[CommunityAlert])
async def get_community_alerts(limit: int = 20):
    alerts = await db.community_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for alert in alerts:
        if isinstance(alert['created_at'], str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    
    return alerts

@api_router.get("/knowledge-base")
async def get_knowledge_base():
    return {
        "threat_types": [
            {
                "id": "phishing",
                "name": "Phishing",
                "description": "Correos electrónicos fraudulentos que intentan robar información personal o credenciales.",
                "indicators": ["Enlaces sospechosos", "Urgencia artificial", "Errores ortográficos", "Remitente desconocido"],
                "prevention": "Verifica siempre el remitente, no hagas clic en enlaces sospechosos, contacta directamente a la empresa."
            },
            {
                "id": "smishing",
                "name": "Smishing",
                "description": "Mensajes SMS fraudulentos que buscan engañarte para revelar información o hacer clic en enlaces maliciosos.",
                "indicators": ["Premios falsos", "Enlaces acortados", "Solicitudes urgentes", "Números desconocidos"],
                "prevention": "No respondas a SMS de números desconocidos, no hagas clic en enlaces, verifica con la entidad oficial."
            },
            {
                "id": "vishing",
                "name": "Vishing",
                "description": "Llamadas telefónicas fraudulentas que se hacen pasar por entidades legítimas para obtener información.",
                "indicators": ["Presión para actuar rápido", "Solicitud de datos sensibles", "Números ocultos", "Amenazas"],
                "prevention": "Cuelga y llama tú al número oficial, nunca des información por teléfono, desconfía de la urgencia."
            },
            {
                "id": "identity-theft",
                "name": "Suplantación de Identidad",
                "description": "Cuando alguien se hace pasar por una persona u organización legítima para engañarte.",
                "indicators": ["Perfiles falsos", "Solicitudes inusuales", "Cambios en servicios", "Transacciones no autorizadas"],
                "prevention": "Verifica la identidad por canales oficiales, usa autenticación de dos factores, monitorea tus cuentas."
            }
        ]
    }

@api_router.post("/users", response_model=User)
async def create_or_update_user(user: UserCreate, user_id: Optional[str] = None):
    if user_id:
        # Update existing
        update_data = user.model_dump(exclude_unset=True)
        await db.users.update_one({"id": user_id}, {"$set": update_data})
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    else:
        # Create new
        user_obj = User(
            email=user.email,
            name=user.name
        )
        doc = user_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        # Return default demo user
        return User(
            id=user_id,
            email="demo@mano.com",
            name="Usuario Demo",
            plan="free"
        )
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.patch("/users/{user_id}", response_model=User)
async def update_user_settings(user_id: str, updates: UserUpdate):
    update_data = updates.model_dump(exclude_unset=True)
    
    # Check if user exists, if not create a default user first
    existing_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not existing_user:
        # Create default user
        default_user = User(
            id=user_id,
            email="demo@mano.com",
            name="Usuario Demo"
        )
        doc = default_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
    
    # Now update with the provided data
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

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