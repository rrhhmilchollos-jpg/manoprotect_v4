"""
MANO - Pydantic Models and Schemas
All data models for the application consolidated in one place
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
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
    is_active: bool = True
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
# THREAT ANALYSIS MODELS
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


class CommunityAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    threat_type: str
    description: str
    affected_users: int = 0
    severity: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================
# CONTACT MODELS
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


# ============================================
# SOS & LOCATION MODELS
# ============================================

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


class SOSAlertRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = 0
    message: Optional[str] = None
    silent: bool = False


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = 0


# ============================================
# PAYMENT MODELS
# ============================================

class CheckoutRequest(BaseModel):
    plan_type: str
    origin_url: str
    referral_code: Optional[str] = None


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
# FAMILY MODELS
# ============================================

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"member_{uuid.uuid4().hex[:8]}")
    family_owner_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str
    is_senior: bool = False
    simplified_mode: bool = False
    alert_level: str = "all"
    threats_count: int = 0
    last_activity: Optional[datetime] = None
    emergency_contact: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FamilyMemberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str
    is_senior: Optional[bool] = False
    simplified_mode: Optional[bool] = False
    alert_level: Optional[str] = "all"


class FamilyAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"falert_{uuid.uuid4().hex[:8]}")
    family_owner_id: str
    member_id: str
    member_name: str
    alert_type: str
    severity: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChildMember(BaseModel):
    name: str
    phone: str
    email: str  # Required - for sending invitation link
    age: Optional[int] = None
    silent_mode: bool = False
    
    @property
    def person_type(self) -> str:
        """Determina automáticamente el tipo de persona según la edad"""
        if self.age is None:
            return "unknown"
        if self.age < 18:
            return "child"  # niño
        elif self.age >= 65:
            return "elderly"  # anciano
        else:
            return "adult"  # adulto


class LocationRequest(BaseModel):
    silent: bool = False


# ============================================
# ENTERPRISE MODELS
# ============================================

class EnterpriseDepartment(BaseModel):
    name: str
    employee_count: int = 0
    protected_count: int = 0
    threats_blocked: int = 0
    last_threat: Optional[datetime] = None


# ============================================
# NOTIFICATION MODELS
# ============================================

class NotificationSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    endpoint: str
    keys: Dict[str, str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    body: str
    notification_type: str
    is_read: bool = False
    data: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SubscriptionRequest(BaseModel):
    subscription: Dict[str, Any]


class NotificationPreferences(BaseModel):
    email_threats: bool = True
    email_weekly_summary: bool = True
    email_promotions: bool = False
    push_threats: bool = True
    push_family_alerts: bool = True
    push_community: bool = True


class PushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]


# ============================================
# API & INTEGRATION MODELS
# ============================================

class APIKey(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"apikey_{uuid.uuid4().hex[:12]}")
    user_id: str
    key_name: str
    api_key: str = Field(default_factory=lambda: f"mano_{uuid.uuid4().hex}")
    permissions: List[str] = ["read"]
    rate_limit: int = 1000
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used: Optional[datetime] = None


class APIKeyCreate(BaseModel):
    key_name: str
    permissions: List[str] = ["read"]
    rate_limit: int = 1000


# ============================================
# WHATSAPP MODELS
# ============================================

class WhatsAppMessage(BaseModel):
    phone: str
    message: str


class WhatsAppAlert(BaseModel):
    phone: str
    threat_type: str
    risk_level: str


# ============================================
# BANKING MODELS
# ============================================

class BankAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    account_id: str
    alert_type: str
    severity: str
    title: str
    description: str
    amount: Optional[float] = None
    merchant: Optional[str] = None
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BankAccountConnect(BaseModel):
    bank_name: str
    account_type: str
    account_number: str


class TransactionAnalyze(BaseModel):
    transactions: List[Dict[str, Any]]


# ============================================
# EMAIL MODELS
# ============================================

class EmailPreferencesUpdate(BaseModel):
    threat_alerts: Optional[bool] = None
    transaction_alerts: Optional[bool] = None
    daily_summary: Optional[bool] = None
    weekly_summary: Optional[bool] = None
    reward_notifications: Optional[bool] = None
    family_alerts: Optional[bool] = None
    marketing: Optional[bool] = None
