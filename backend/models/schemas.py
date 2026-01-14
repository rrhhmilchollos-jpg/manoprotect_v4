"""
MANO - Pydantic Models / Schemas
All shared data models for the application
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid
import re


# ============================================
# USER MODELS
# ============================================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = None
    auth_provider: str = "email"
    password_hash: Optional[str] = None
    plan: str = "free"
    role: str = "user"
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    dark_mode: bool = False
    notifications_enabled: bool = True
    auto_block: bool = False
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    auto_block: Optional[bool] = None


class SessionData(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# INVESTOR MODELS
# ============================================

class InvestorRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    request_id: str = Field(default_factory=lambda: f"inv_{uuid.uuid4().hex[:12]}")
    cif: str
    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str
    reason: str
    status: str = "pending"
    user_id: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InvestorRegisterRequest(BaseModel):
    cif: str
    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    position: str
    reason: str
    
    @field_validator('cif')
    @classmethod
    def validate_cif(cls, v):
        cif_pattern = r'^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$'
        if not re.match(cif_pattern, v.upper()):
            raise ValueError('CIF inválido. Formato esperado: letra + 7 dígitos + letra/dígito')
        return v.upper()


# ============================================
# THREAT MODELS
# ============================================

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


class FalsePositiveReport(BaseModel):
    threat_id: str
    reason: str
    additional_info: Optional[str] = None


class ShareRequest(BaseModel):
    threat_id: str
    share_type: str
    recipient: Optional[str] = None


# ============================================
# CONTACT & FAMILY MODELS
# ============================================

class TrustedContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    relationship: str
    is_emergency: bool = False
    receive_alerts: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TrustedContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str
    is_emergency: Optional[bool] = False
    receive_alerts: Optional[bool] = True


class SOSAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    location: Optional[str] = None
    message: Optional[str] = None
    contacts_notified: List[str] = []
    status: str = "sent"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SOSRequest(BaseModel):
    location: Optional[str] = None
    message: Optional[str] = None


class FamilyMemberInvite(BaseModel):
    email: EmailStr
    name: str
    relationship: str


# ============================================
# PAYMENT MODELS
# ============================================

class CheckoutRequest(BaseModel):
    plan_type: str
    origin_url: str


class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    email: str
    plan_type: str
    amount: float
    currency: str = "eur"
    status: str = "pending"
    payment_status: str = "initiated"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# COMMUNITY MODELS
# ============================================

class CommunityAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    threat_type: str
    description: str
    affected_users: int = 0
    severity: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# ENTERPRISE MODELS
# ============================================

class EnterpriseStats(BaseModel):
    total_employees: int = 0
    threats_blocked: int = 0
    protection_rate: float = 0.0
    active_alerts: int = 0


# ============================================
# CONSTANTS
# ============================================

SUBSCRIPTION_PACKAGES = {
    "weekly": {"amount": 9.99, "name": "Premium Semanal", "period": "semana"},
    "monthly": {"amount": 29.99, "name": "Premium Mensual", "period": "mes"},
    "quarterly": {"amount": 74.99, "name": "Premium Trimestral", "period": "3 meses"},
    "yearly": {"amount": 249.99, "name": "Premium Anual", "period": "año"},
    "family-monthly": {"amount": 49.99, "name": "Familiar Mensual", "period": "mes"},
    "family-quarterly": {"amount": 129.99, "name": "Familiar Trimestral", "period": "3 meses"},
    "family-yearly": {"amount": 399.99, "name": "Familiar Anual", "period": "año"},
    "personal": {"amount": 9.99, "name": "Personal", "period": "mes"},
    "family": {"amount": 19.99, "name": "Familiar", "period": "mes"},
    "business": {"amount": 49.99, "name": "Business", "period": "mes"},
    "enterprise": {"amount": 199.99, "name": "Enterprise", "period": "mes"}
}
