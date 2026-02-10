"""
ManoProtect - DNA Digital & Advanced Security Models
Revolutionary cybersecurity features for B2C and B2B
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ============================================
# DNA DIGITAL - Unique Digital Identity
# ============================================

class DNADigitalType(str, Enum):
    PERSONAL = "personal"
    BUSINESS = "business"
    GOVERNMENT = "government"

class DNADigitalStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    SUSPENDED = "suspended"
    REVOKED = "revoked"

class DNADigitalCreate(BaseModel):
    owner_name: str
    owner_type: DNADigitalType
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_cif: Optional[str] = None
    website: Optional[str] = None

class DNADigitalResponse(BaseModel):
    id: str
    dna_code: str  # Unique code like "MP-DNA-XXXXXXXX"
    owner_name: str
    owner_type: DNADigitalType
    status: DNADigitalStatus
    trust_score: int = Field(ge=0, le=100)
    verified_at: Optional[datetime] = None
    created_at: datetime
    verification_count: int = 0
    last_verified: Optional[datetime] = None

class DNAVerificationRequest(BaseModel):
    dna_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

class DNAVerificationResponse(BaseModel):
    verified: bool
    dna_code: Optional[str] = None
    owner_name: Optional[str] = None
    owner_type: Optional[str] = None
    trust_score: int = 0
    is_legitimate: bool = False
    warning_message: Optional[str] = None
    verification_timestamp: datetime

# ============================================
# TRUST SEAL - Business Verification Badge
# ============================================

class TrustSealTier(str, Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    GOVERNMENT = "government"

class TrustSealCreate(BaseModel):
    business_name: str
    business_cif: str
    website: str
    email: str
    phone: str
    tier: TrustSealTier = TrustSealTier.BASIC

class TrustSealResponse(BaseModel):
    id: str
    seal_code: str  # Unique seal code for embedding
    business_name: str
    website: str
    tier: TrustSealTier
    trust_score: int
    verified: bool
    issued_at: datetime
    expires_at: datetime
    embed_code: str  # HTML/JS code to embed on website
    verification_url: str
    monthly_verifications: int = 0

class TrustSealVerifyRequest(BaseModel):
    seal_code: str
    referrer_url: Optional[str] = None

# ============================================
# UNIVERSAL VERIFIER
# ============================================

class VerificationType(str, Enum):
    URL = "url"
    PHONE = "phone"
    EMAIL = "email"
    BUSINESS = "business"
    QR_CODE = "qr_code"

class UniversalVerifyRequest(BaseModel):
    content: str
    verification_type: VerificationType
    context: Optional[str] = None  # Additional context

class UniversalVerifyResponse(BaseModel):
    is_safe: bool
    risk_level: str  # "safe", "low", "medium", "high", "critical"
    risk_score: int = Field(ge=0, le=100)
    verification_type: VerificationType
    details: Dict[str, Any]
    recommendations: List[str]
    known_reports: int = 0
    community_warnings: List[str] = []
    verified_entity: Optional[DNADigitalResponse] = None

# ============================================
# VOICE SHIELD AI - Call Protection
# ============================================

class ManipulationTactic(str, Enum):
    URGENCY = "urgency"
    AUTHORITY = "authority"
    SCARCITY = "scarcity"
    SOCIAL_PROOF = "social_proof"
    FEAR = "fear"
    GREED = "greed"
    RECIPROCITY = "reciprocity"

class VoiceAnalysisRequest(BaseModel):
    audio_base64: Optional[str] = None
    transcript: Optional[str] = None
    caller_number: Optional[str] = None

class VoiceAnalysisResponse(BaseModel):
    is_suspicious: bool
    risk_score: int = Field(ge=0, le=100)
    detected_tactics: List[ManipulationTactic]
    warnings: List[str]
    caller_verified: bool = False
    caller_dna: Optional[str] = None
    recommendation: str
    real_time_alerts: List[Dict[str, str]] = []

# ============================================
# ANTI-DEEPFAKE SHIELD
# ============================================

class DeepfakeAnalysisRequest(BaseModel):
    media_type: str  # "video", "audio", "image"
    media_base64: Optional[str] = None
    media_url: Optional[str] = None
    claimed_identity: Optional[str] = None

class DeepfakeAnalysisResponse(BaseModel):
    is_authentic: bool
    confidence: float = Field(ge=0.0, le=1.0)
    deepfake_probability: float = Field(ge=0.0, le=1.0)
    analysis_details: Dict[str, Any]
    warnings: List[str]
    recommendation: str

# ============================================
# DIGITAL INHERITANCE VAULT
# ============================================

class VaultItemType(str, Enum):
    PASSWORD = "password"
    DOCUMENT = "document"
    NOTE = "note"
    CRYPTO_KEY = "crypto_key"
    BANK_INFO = "bank_info"
    MEDICAL = "medical"

class VaultItemCreate(BaseModel):
    title: str
    item_type: VaultItemType
    encrypted_content: str
    notes: Optional[str] = None
    beneficiaries: List[str] = []  # User IDs who can access after trigger

class VaultItemResponse(BaseModel):
    id: str
    title: str
    item_type: VaultItemType
    created_at: datetime
    updated_at: datetime
    beneficiaries: List[str]

class InheritanceTrigger(str, Enum):
    INACTIVITY = "inactivity"  # No login for X days
    MANUAL = "manual"  # Manual trigger by beneficiary
    DEATH_CERTIFICATE = "death_certificate"
    MEDICAL_EMERGENCY = "medical_emergency"

class InheritanceConfig(BaseModel):
    inactivity_days: int = 30
    require_verification: bool = True
    notify_on_access: bool = True
    allowed_triggers: List[InheritanceTrigger]

# ============================================
# SILENT PANIC MODE
# ============================================

class PanicTriggerType(str, Enum):
    BUTTON_PRESS = "button_press"  # 5 rapid presses
    VOICE_KEYWORD = "voice_keyword"
    GESTURE = "gesture"
    SHAKE = "shake"

class PanicModeConfig(BaseModel):
    enabled: bool = True
    triggers: List[PanicTriggerType]
    keyword: Optional[str] = None  # Secret keyword
    emergency_contacts: List[str]
    auto_record: bool = True
    send_location: bool = True
    call_emergency: bool = False
    silent_mode: bool = True  # No sound/vibration

class PanicAlertResponse(BaseModel):
    alert_id: str
    triggered_at: datetime
    trigger_type: PanicTriggerType
    location: Optional[Dict[str, float]] = None
    recording_url: Optional[str] = None
    notified_contacts: List[str]
    emergency_called: bool

# ============================================
# SMART ZONES - Behavior Learning
# ============================================

class SmartZoneType(str, Enum):
    HOME = "home"
    WORK = "work"
    SCHOOL = "school"
    FREQUENT = "frequent"
    RISKY = "risky"
    CUSTOM = "custom"

class SmartZoneCreate(BaseModel):
    name: str
    zone_type: SmartZoneType
    latitude: float
    longitude: float
    radius_meters: int = 100
    schedule: Optional[Dict[str, Any]] = None  # Expected times
    alert_on_enter: bool = False
    alert_on_exit: bool = True
    alert_on_anomaly: bool = True

class BehaviorPattern(BaseModel):
    member_id: str
    typical_locations: List[Dict[str, Any]]
    typical_schedule: Dict[str, Any]
    anomaly_threshold: float = 0.7
    last_updated: datetime

# ============================================
# ENTERPRISE FEATURES
# ============================================

class PhishingSimulationCreate(BaseModel):
    company_id: str
    template_type: str  # "email", "sms", "call"
    target_employees: List[str]
    difficulty: str = "medium"
    schedule: Optional[datetime] = None

class PhishingSimulationResult(BaseModel):
    simulation_id: str
    company_id: str
    total_targets: int
    clicked: int
    reported: int
    no_action: int
    click_rate: float
    report_rate: float
    risk_score: int
    recommendations: List[str]

class TransactionVerifyRequest(BaseModel):
    amount: float
    currency: str = "EUR"
    recipient_iban: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_country: Optional[str] = None
    transaction_type: str = "transfer"

class TransactionVerifyResponse(BaseModel):
    is_safe: bool
    risk_level: str
    risk_score: int
    checks_passed: List[str]
    checks_failed: List[str]
    warnings: List[str]
    recipient_verified: bool
    recipient_dna: Optional[str] = None
    recommendation: str
    blockchain_certificate: Optional[str] = None

# ============================================
# SCAM PREDICTOR AI
# ============================================

class ScamPrediction(BaseModel):
    scam_type: str
    probability: float
    affected_region: str
    description: str
    prevention_tips: List[str]
    first_detected: datetime
    report_count: int
    trending: bool

class ScamAlertCreate(BaseModel):
    scam_type: str
    description: str
    evidence: Optional[str] = None
    contact_info: Optional[str] = None  # Phone/email of scammer
    amount_lost: Optional[float] = None
