from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
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
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    plan: str = "free"
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
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

class CheckoutRequest(BaseModel):
    plan_type: str
    user_id: str
    email: str

# Stripe Price IDs (crear en Stripe Dashboard)
STRIPE_PRICES = {
    "weekly": "price_weekly_999",
    "monthly": "price_monthly_2999",
    "quarterly": "price_quarterly_7499",
    "yearly": "price_yearly_24999",
    "family-monthly": "price_family_monthly_4999",
    "family-quarterly": "price_family_quarterly_12999",
    "family-yearly": "price_family_yearly_39999"
}

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
            writer = csv.DictWriter(output, fieldnames=threats[0].keys())
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
        update_data = user.model_dump(exclude_unset=True)
        await db.users.update_one({"id": user_id}, {"$set": update_data})
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    else:
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
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

# Stripe Integration
@api_router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    try:
        # Create or get Stripe customer
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        
        if user and user.get('stripe_customer_id'):
            customer_id = user['stripe_customer_id']
        else:
            customer = stripe.Customer.create(
                email=request.email,
                metadata={"user_id": request.user_id}
            )
            customer_id = customer.id
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {"stripe_customer_id": customer_id}}
            )
        
        # Create checkout session
        price_id = STRIPE_PRICES.get(request.plan_type)
        if not price_id:
            raise HTTPException(status_code=400, detail="Invalid plan type")
        
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard?success=true",
            cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/pricing?canceled=true",
            metadata={
                'user_id': request.user_id,
                'plan_type': request.plan_type
            }
        )
        
        return {"checkout_url": session.url, "session_id": session.id}
    
    except Exception as e:
        logging.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']
        plan_type = session['metadata']['plan_type']
        
        # Update user subscription
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "plan": plan_type,
                "stripe_subscription_id": session.get('subscription'),
                "subscription_status": "active"
            }}
        )
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await db.users.update_one(
            {"stripe_subscription_id": subscription['id']},
            {"$set": {
                "plan": "free",
                "subscription_status": "canceled"
            }}
        )
    
    return {"status": "success"}

@api_router.post("/cancel-subscription")
async def cancel_subscription(user_id: str):
    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user or not user.get('stripe_subscription_id'):
            raise HTTPException(status_code=404, detail="No active subscription")
        
        stripe.Subscription.delete(user['stripe_subscription_id'])
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "plan": "free",
                "subscription_status": "canceled",
                "stripe_subscription_id": None
            }}
        )
        
        return {"message": "Subscription canceled successfully"}
    except Exception as e:
        logging.error(f"Cancel subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/download/{doc_type}")
async def download_document(doc_type: str):
    from fastapi.responses import Response
    
    doc_map = {
        "business-plan": "/app/memory/plan-de-negocio-completo.md",
        "financial-model": "/app/memory/financial-model.md",
        "pitch-deck": "/app/memory/pitch-deck-inversores.md",
        "dossier-b2b": "/app/memory/dossier-comercial-b2b.md"
    }
    
    file_path = doc_map.get(doc_type)
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Read markdown content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Return as downloadable markdown file
    filename = f"MANO_{doc_type.replace('-', '_')}_2025.md"
    
    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

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