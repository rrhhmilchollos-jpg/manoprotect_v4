"""
ManoProtect - Enterprise Employee Portal
Complete backend models for scalable employee management system
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ============================================
# ENUMS
# ============================================

class EmployeeRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    OPERATOR = "operator"
    AUDITOR = "auditor"
    EMERGENCY_SERVICE = "emergency_service"

class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    INACTIVE = "inactive"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SOSStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    FALSE_ALARM = "false_alarm"

class SOSPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(str, Enum):
    PHISHING = "phishing"
    SMS_FRAUD = "sms_fraud"
    CALL_FRAUD = "call_fraud"
    SUSPICIOUS_LOGIN = "suspicious_login"
    DATA_BREACH = "data_breach"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class DeviceOrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ============================================
# EMPLOYEE MODELS
# ============================================

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    role: EmployeeRole = EmployeeRole.OPERATOR
    status: EmployeeStatus = EmployeeStatus.PENDING

class EmployeeCreate(EmployeeBase):
    password: str
    permissions: List[str] = []

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[EmployeeRole] = None
    status: Optional[EmployeeStatus] = None
    permissions: Optional[List[str]] = None

class EmployeeInDB(EmployeeBase):
    employee_id: str
    company_id: str
    password_hash: str
    avatar_url: Optional[str] = None
    permissions: List[str] = []
    risk_score: int = 0
    risk_level: RiskLevel = RiskLevel.LOW
    failed_simulations: int = 0
    phishing_clicks: int = 0
    devices: List[Dict] = []
    two_factor_enabled: bool = False
    last_login: Optional[str] = None
    last_ip: Optional[str] = None
    login_history: List[Dict] = []
    created_at: str
    updated_at: str

class EmployeeResponse(BaseModel):
    employee_id: str
    name: str
    email: str
    phone: Optional[str]
    department: Optional[str]
    role: str
    status: str
    avatar_url: Optional[str]
    permissions: List[str]
    risk_score: int
    risk_level: str
    failed_simulations: int
    phishing_clicks: int
    two_factor_enabled: bool
    last_login: Optional[str]
    created_at: str

# ============================================
# CLIENT MODELS
# ============================================

class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None

class ClientCreate(ClientBase):
    plan: str = "free"
    emergency_contacts: List[Dict] = []

class ClientInDB(ClientBase):
    client_id: str
    plan: str
    subscription_status: str
    is_trial: bool = False
    trial_ends_at: Optional[str] = None
    emergency_contacts: List[Dict] = []
    devices: List[Dict] = []
    sos_button_requested: bool = False
    sos_button_status: Optional[str] = None
    sos_events_count: int = 0
    alerts_count: int = 0
    risk_score: int = 0
    last_activity: Optional[str] = None
    created_at: str
    updated_at: str

# ============================================
# SOS EVENT MODELS
# ============================================

class SOSEventCreate(BaseModel):
    client_id: str
    location: Optional[Dict] = None
    message: Optional[str] = None
    priority: SOSPriority = SOSPriority.HIGH

class SOSEventInDB(BaseModel):
    sos_id: str
    client_id: str
    client_name: str
    client_phone: str
    location: Optional[Dict] = None  # {lat, lng, address}
    message: Optional[str] = None
    priority: SOSPriority
    status: SOSStatus = SOSStatus.PENDING
    assigned_operator_id: Optional[str] = None
    assigned_operator_name: Optional[str] = None
    emergency_service_called: bool = False
    emergency_service_type: Optional[str] = None  # 112, policia, guardia_civil
    notes: List[Dict] = []  # {timestamp, author, content}
    response_time_seconds: Optional[int] = None
    resolution_time_seconds: Optional[int] = None
    created_at: str
    updated_at: str
    resolved_at: Optional[str] = None

class SOSResponse(BaseModel):
    action: str  # assign, escalate, call_emergency, add_note, resolve
    operator_id: Optional[str] = None
    emergency_service: Optional[str] = None  # 112, policia_nacional, policia_local, guardia_civil
    note: Optional[str] = None
    status: Optional[SOSStatus] = None

# ============================================
# ALERT MODELS
# ============================================

class AlertInDB(BaseModel):
    alert_id: str
    client_id: str
    client_name: str
    alert_type: AlertType
    severity: RiskLevel
    title: str
    description: str
    source: Optional[str] = None  # email, sms, call
    blocked: bool = False
    false_positive: bool = False
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str

# ============================================
# PAYMENT MODELS
# ============================================

class PaymentInDB(BaseModel):
    payment_id: str
    client_id: str
    client_name: str
    client_email: str
    amount: float
    currency: str = "EUR"
    plan: str
    payment_method: str
    status: PaymentStatus
    stripe_payment_id: Optional[str] = None
    invoice_url: Optional[str] = None
    created_at: str

# ============================================
# DEVICE ORDER MODELS
# ============================================

class DeviceOrderInDB(BaseModel):
    order_id: str
    client_id: str
    client_name: str
    client_email: str
    client_phone: str
    shipping_address: Dict
    quantity: int = 1
    status: DeviceOrderStatus
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None
    shipping_cost: float = 4.95
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    shipped_at: Optional[str] = None
    delivered_at: Optional[str] = None

# ============================================
# AUDIT LOG MODELS
# ============================================

class AuditLogInDB(BaseModel):
    log_id: str
    employee_id: str
    employee_name: str
    employee_role: str
    action: str
    resource_type: str  # employee, client, sos, payment, alert
    resource_id: str
    details: Dict = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: str

# ============================================
# DASHBOARD STATS MODELS
# ============================================

class DashboardStats(BaseModel):
    total_employees: int = 0
    active_employees: int = 0
    total_clients: int = 0
    premium_clients: int = 0
    trial_clients: int = 0
    pending_sos: int = 0
    resolved_sos_today: int = 0
    total_alerts_today: int = 0
    blocked_threats_today: int = 0
    revenue_today: float = 0
    revenue_month: float = 0
    pending_device_orders: int = 0
    shipped_device_orders: int = 0
    employees_at_risk: int = 0
    avg_response_time: int = 0  # seconds

class DepartmentRisk(BaseModel):
    department: str
    employee_count: int
    avg_risk_score: float
    high_risk_count: int

# ============================================
# PERMISSION DEFINITIONS
# ============================================

ROLE_PERMISSIONS = {
    EmployeeRole.SUPER_ADMIN: [
        "all"
    ],
    EmployeeRole.ADMIN: [
        "manage_employees", "view_employees",
        "manage_clients", "view_clients",
        "manage_sos", "view_sos", "respond_sos",
        "view_payments", "manage_payments",
        "view_alerts", "manage_alerts",
        "view_reports", "export_data",
        "manage_device_orders", "view_device_orders",
        "view_audit_logs"
    ],
    EmployeeRole.SUPERVISOR: [
        "view_employees",
        "view_clients", "manage_clients",
        "manage_sos", "view_sos", "respond_sos",
        "view_alerts", "manage_alerts",
        "view_reports",
        "view_device_orders"
    ],
    EmployeeRole.OPERATOR: [
        "view_sos", "respond_sos",
        "view_alerts",
        "view_clients"
    ],
    EmployeeRole.AUDITOR: [
        "view_employees", "view_clients",
        "view_sos", "view_alerts",
        "view_payments", "view_reports",
        "view_audit_logs", "export_data"
    ],
    EmployeeRole.EMERGENCY_SERVICE: [
        "view_sos", "respond_sos"
    ]
}
