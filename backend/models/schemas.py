"""
MANO - Pydantic Models
All data models for the application
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
    risk_score: float = 0.0  # ML risk score 0-100
    is_threat: bool
    threat_types: List[str]
    recommendation: str
    analysis: str
    reported_false_positive: bool = False
    shared_count: int = 0
    ml_confidence: float = 0.0  # ML model confidence
    patterns_detected: List[str] = []  # Detected threat patterns
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
# CONTACTS & SOS MODELS
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


# ============================================
# COMMUNITY & ALERTS MODELS
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
# FAMILY MODELS
# ============================================

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Primary user
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: str
    is_senior: bool = False
    simplified_mode: bool = False
    alert_level: str = "all"  # "all", "critical", "none"
    protection_enabled: bool = True
    last_activity: Optional[datetime] = None
    threats_blocked: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FamilyMemberCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: str
    is_senior: Optional[bool] = False
    simplified_mode: Optional[bool] = False
    alert_level: Optional[str] = "all"


# ============================================
# NOTIFICATION MODELS
# ============================================

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    body: str
    notification_type: str  # "threat", "family", "sos", "system", "bank"
    data: Dict = {}
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PushSubscription(BaseModel):
    endpoint: str
    keys: Dict[str, str]


# ============================================
# WHATSAPP MODELS
# ============================================

class WhatsAppMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    phone_number: str
    message: str
    message_type: str = "alert"  # "alert", "notification", "custom"
    status: str = "pending"  # "pending", "sent", "failed"
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WhatsAppSendRequest(BaseModel):
    phone_number: str
    message: str


# ============================================
# API KEY MODELS
# ============================================

class APIKey(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"key_{uuid.uuid4().hex}")
    user_id: str
    name: str
    key: str = Field(default_factory=lambda: f"mano_pk_{uuid.uuid4().hex}")
    permissions: List[str] = ["read:threats", "write:analyze"]
    rate_limit: int = 1000  # requests per day
    is_active: bool = True
    last_used: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class APIKeyCreate(BaseModel):
    name: str
    permissions: Optional[List[str]] = None


# ============================================
# BANKING INTEGRATION MODELS
# ============================================

class BankAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bank_name: str
    account_type: str  # "checking", "savings", "credit"
    last_four: str  # Last 4 digits
    is_monitored: bool = True
    alert_threshold: float = 500.0  # Alert for transactions above this
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BankTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    account_id: str
    amount: float
    description: str
    merchant: Optional[str] = None
    category: str = "other"
    is_suspicious: bool = False
    risk_score: float = 0.0
    risk_factors: List[str] = []
    status: str = "pending"  # "pending", "approved", "blocked", "flagged"
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BankTransactionAnalyze(BaseModel):
    amount: float
    description: str
    merchant: Optional[str] = None
    account_id: Optional[str] = None


# ============================================
# ML/FRAUD DETECTION MODELS
# ============================================

class FraudScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    entity_type: str  # "message", "transaction", "call", "email"
    entity_id: str
    risk_score: float  # 0-100
    confidence: float  # 0-1
    risk_factors: List[str]
    recommendation: str
    model_version: str = "1.0"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserBehaviorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    avg_transaction_amount: float = 0.0
    typical_merchants: List[str] = []
    typical_hours: List[int] = []  # Hours when user is typically active
    typical_locations: List[str] = []
    risk_tolerance: str = "medium"  # "low", "medium", "high"
    anomaly_threshold: float = 2.0  # Standard deviations for anomaly
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
