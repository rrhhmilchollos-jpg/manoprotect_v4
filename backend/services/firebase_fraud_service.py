"""
Firebase Firestore - Servicio de Detección de Fraude en Tiempo Real
Sistema cloud-based para verificación pública de estafas con algoritmo automático
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Thread pool for async Firestore operations
_executor = ThreadPoolExecutor(max_workers=10)

# Initialize Firebase Admin SDK
_firebase_app = None
_firestore_client = None

def init_firebase():
    """Initialize Firebase Admin SDK - call once at startup"""
    global _firebase_app, _firestore_client
    
    if _firebase_app is not None:
        return _firestore_client
    
    try:
        # Try to get credentials from environment variables first
        firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID')
        firebase_private_key = os.environ.get('FIREBASE_PRIVATE_KEY')
        firebase_client_email = os.environ.get('FIREBASE_CLIENT_EMAIL')
        
        if firebase_project_id and firebase_private_key and firebase_client_email:
            # Use environment variables
            cred_dict = {
                "type": "service_account",
                "project_id": firebase_project_id,
                "private_key": firebase_private_key.replace('\\n', '\n'),  # Handle escaped newlines
                "client_email": firebase_client_email,
                "token_uri": "https://oauth2.googleapis.com/token"
            }
            cred = credentials.Certificate(cred_dict)
            print("[Firebase] Using credentials from environment variables")
        else:
            # Fallback to file for local development
            cred_path = os.path.join(os.path.dirname(__file__), '..', 'secrets', 'firebase-admin.json')
            
            if not os.path.exists(cred_path):
                print(f"[Firebase] Warning: No credentials found (set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL env vars or provide {cred_path})")
                return None
            
            cred = credentials.Certificate(cred_path)
            print("[Firebase] Using credentials from file")
        
        _firebase_app = firebase_admin.initialize_app(cred)
        _firestore_client = firestore.client()
        
        print("[Firebase] Successfully initialized Firebase Admin SDK")
        return _firestore_client
    except Exception as e:
        print(f"[Firebase] Error initializing: {e}")
        return None

def get_firestore():
    """Get Firestore client"""
    global _firestore_client
    if _firestore_client is None:
        init_firebase()
    return _firestore_client

# ============================================
# SCAM DATABASE OPERATIONS (Firestore)
# ============================================

async def verify_scam(value: str, scam_type: str = "phone") -> Dict[str, Any]:
    """
    Verify if a phone number or email is in the scam database
    Returns real-time data from Firestore
    """
    db = get_firestore()
    if not db:
        return {"found": False, "error": "Firebase not initialized"}
    
    # Normalize value
    search_value = value.strip()
    if scam_type == "phone":
        search_value = search_value.replace(" ", "").replace("-", "")
        if not search_value.startswith("+"):
            search_value = "+34" + search_value.lstrip("0")
    elif scam_type == "email":
        search_value = search_value.lower()
    
    try:
        # Query Firestore
        def _query():
            scams_ref = db.collection('scam_reports')
            query = scams_ref.where('value', '==', search_value).where('type', '==', scam_type).limit(1)
            docs = query.get()
            return list(docs)
        
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(_executor, _query)
        
        if docs:
            doc = docs[0]
            data = doc.to_dict()
            return {
                "found": True,
                "is_scam": True,
                "severity": data.get("severity", "medium"),
                "category": data.get("category", "unknown"),
                "status": data.get("status", "pending"),
                "report_count": data.get("report_count", 1),
                "first_reported": data.get("created_at"),
                "last_updated": data.get("updated_at"),
                "warning": "⚠️ ATENCIÓN: Este número/email ha sido reportado como posible estafa. NO proporcione datos personales ni realice pagos.",
                "advice": [
                    "No responda a llamadas o mensajes de este número/email",
                    "No proporcione datos bancarios ni personales",
                    "No realice ningún tipo de pago o transferencia",
                    "Denuncie a las autoridades si ha sido víctima",
                    "Contacte con ManoProtect si tiene dudas: 900 123 456"
                ]
            }
        
        return {
            "found": False,
            "is_scam": False,
            "message": "Este número/email NO está en nuestra base de datos de estafas conocidas.",
            "disclaimer": "Esto no garantiza que sea seguro. Siempre verifique la identidad de quien le contacta.",
            "tips": [
                "ManoProtect nunca le pedirá contraseñas por teléfono o email",
                "Verifique siempre la URL oficial: manoprotect.es",
                "En caso de duda, contacte directamente con nosotros"
            ]
        }
    except Exception as e:
        print(f"[Firebase] Error verifying scam: {e}")
        return {"found": False, "error": str(e)}


async def report_scam(
    value: str,
    scam_type: str = "phone",
    description: str = "",
    category: str = "unknown",
    reporter_email: str = "",
    source: str = "public"
) -> Dict[str, Any]:
    """
    Report a scam to Firestore database
    """
    db = get_firestore()
    if not db:
        return {"success": False, "error": "Firebase not initialized"}
    
    # Normalize value
    if scam_type == "phone":
        value = value.replace(" ", "").replace("-", "")
        if not value.startswith("+"):
            value = "+34" + value.lstrip("0")
    elif scam_type == "email":
        value = value.lower()
    
    try:
        def _report():
            scams_ref = db.collection('scam_reports')
            
            # Check if already exists
            existing = scams_ref.where('value', '==', value).where('type', '==', scam_type).limit(1).get()
            existing_list = list(existing)
            
            timestamp = datetime.now(timezone.utc).isoformat()
            
            if existing_list:
                # Update existing report
                doc_ref = existing_list[0].reference
                doc_ref.update({
                    'report_count': firestore.Increment(1),
                    'public_reports': firestore.Increment(1) if source == 'public' else firestore.Increment(0),
                    'updated_at': timestamp,
                    'reports': firestore.ArrayUnion([{
                        'reported_by': 'Usuario público' if source == 'public' else 'ManoProtect',
                        'reporter_email': reporter_email,
                        'reason': description,
                        'source': source,
                        'date': timestamp
                    }])
                })
                return {"success": True, "message": "Gracias por tu reporte. Este número/email ya estaba en nuestra base de datos.", "already_reported": True}
            
            # Create new report
            new_report = {
                'type': scam_type,
                'value': value,
                'severity': 'medium',
                'category': category,
                'description': description,
                'source': source,
                'status': 'pending' if source == 'public' else 'verified',
                'report_count': 1,
                'public_reports': 1 if source == 'public' else 0,
                'reports': [{
                    'reported_by': 'Usuario público' if source == 'public' else 'ManoProtect',
                    'reporter_email': reporter_email,
                    'reason': description,
                    'source': source,
                    'date': timestamp
                }],
                'created_at': timestamp,
                'updated_at': timestamp
            }
            
            scams_ref.add(new_report)
            return {"success": True, "message": "Gracias por tu reporte. Nuestro equipo lo revisará pronto.", "already_reported": False}
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, _report)
        return result
        
    except Exception as e:
        print(f"[Firebase] Error reporting scam: {e}")
        return {"success": False, "error": str(e)}


async def get_scam_stats() -> Dict[str, Any]:
    """Get public statistics from the scam database"""
    db = get_firestore()
    if not db:
        return {"total_reports": 0, "error": "Firebase not initialized"}
    
    try:
        def _get_stats():
            scams_ref = db.collection('scam_reports')
            
            # Get all documents for counting
            all_docs = list(scams_ref.get())
            
            total = len(all_docs)
            phones = sum(1 for d in all_docs if d.to_dict().get('type') == 'phone')
            emails = sum(1 for d in all_docs if d.to_dict().get('type') == 'email')
            verified = sum(1 for d in all_docs if d.to_dict().get('status') == 'verified')
            critical = sum(1 for d in all_docs if d.to_dict().get('severity') == 'critical')
            
            # Recent (last 24h)
            yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
            recent = sum(1 for d in all_docs if d.to_dict().get('created_at', '') >= yesterday)
            
            return {
                "total_reports": total,
                "phone_scams": phones,
                "email_scams": emails,
                "verified": verified,
                "critical_threats": critical,
                "last_24h": recent,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "source": "firebase_cloud"
            }
        
        loop = asyncio.get_event_loop()
        stats = await loop.run_in_executor(_executor, _get_stats)
        return stats
        
    except Exception as e:
        error_msg = str(e)
        print(f"[Firebase] Error getting stats: {e}")
        # Return helpful error for database not created
        if "does not exist" in error_msg:
            return {
                "total_reports": 0,
                "phone_scams": 0,
                "email_scams": 0,
                "verified": 0,
                "critical_threats": 0,
                "last_24h": 0,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "error": error_msg,
                "setup_required": True,
                "setup_url": "https://console.firebase.google.com/project/manoprotect-f889b/firestore"
            }
        return {"total_reports": 0, "error": error_msg}


# ============================================
# AUTOMATED FRAUD DETECTION ALGORITHM
# ============================================

class FraudDetectionAlgorithm:
    """
    Algoritmo automático de detección de fraude en tiempo real
    Analiza patrones de transacciones, logins y actividad sospechosa
    """
    
    # Thresholds for automatic detection
    HIGH_FREQUENCY_THRESHOLD = 10  # Max actions per minute from same IP
    HIGH_AMOUNT_THRESHOLD = 5000   # Amount that triggers review
    SUSPICIOUS_COUNTRY_CODES = ['+7', '+86', '+91', '+234', '+212']  # High-risk country codes
    BLACKLISTED_DOMAINS = ['tempmail', 'guerrilla', 'mailinator', '10minute', 'throwaway']
    
    def __init__(self):
        self.db = get_firestore()
    
    async def analyze_login_attempt(
        self,
        ip_address: str,
        user_email: str,
        user_agent: str,
        success: bool
    ) -> Dict[str, Any]:
        """
        Analyze a login attempt for suspicious patterns
        Returns risk assessment and recommended actions
        """
        risk_score = 0
        risk_factors = []
        
        if not self.db:
            return {"risk_score": 0, "risk_factors": [], "action": "allow"}
        
        try:
            def _analyze():
                nonlocal risk_score, risk_factors
                
                # 1. Check for high frequency login attempts from same IP
                attempts_ref = self.db.collection('login_attempts')
                one_minute_ago = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
                
                recent_attempts = list(attempts_ref
                    .where('ip_address', '==', ip_address)
                    .where('timestamp', '>=', one_minute_ago)
                    .get())
                
                if len(recent_attempts) > self.HIGH_FREQUENCY_THRESHOLD:
                    risk_score += 50
                    risk_factors.append(f"Alta frecuencia de intentos: {len(recent_attempts)} en 1 minuto")
                
                # 2. Check for multiple failed attempts
                failed_attempts = [a for a in recent_attempts if not a.to_dict().get('success', True)]
                if len(failed_attempts) >= 5:
                    risk_score += 30
                    risk_factors.append(f"Múltiples intentos fallidos: {len(failed_attempts)}")
                
                # 3. Check if email domain is suspicious
                email_domain = user_email.split('@')[-1].lower() if '@' in user_email else ''
                for blacklisted in self.BLACKLISTED_DOMAINS:
                    if blacklisted in email_domain:
                        risk_score += 20
                        risk_factors.append(f"Dominio de email sospechoso: {email_domain}")
                        break
                
                # 4. Log this attempt
                attempts_ref.add({
                    'ip_address': ip_address,
                    'user_email': user_email,
                    'user_agent': user_agent,
                    'success': success,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'risk_score': risk_score
                })
                
                # Determine action
                if risk_score >= 70:
                    action = "block"
                elif risk_score >= 40:
                    action = "require_2fa"
                else:
                    action = "allow"
                
                return {
                    "risk_score": risk_score,
                    "risk_factors": risk_factors,
                    "action": action,
                    "is_suspicious": risk_score >= 40
                }
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(_executor, _analyze)
            return result
            
        except Exception as e:
            print(f"[FraudDetection] Error analyzing login: {e}")
            return {"risk_score": 0, "risk_factors": [], "action": "allow"}
    
    async def analyze_transaction(
        self,
        user_id: str,
        amount: float,
        destination: str,
        ip_address: str,
        transaction_type: str = "transfer"
    ) -> Dict[str, Any]:
        """
        Analyze a transaction for suspicious patterns
        """
        risk_score = 0
        risk_factors = []
        
        if not self.db:
            return {"risk_score": 0, "risk_factors": [], "action": "allow"}
        
        try:
            def _analyze():
                nonlocal risk_score, risk_factors
                
                # 1. High amount check
                if amount > self.HIGH_AMOUNT_THRESHOLD:
                    risk_score += 25
                    risk_factors.append(f"Importe elevado: {amount}€")
                
                if amount > 10000:
                    risk_score += 25
                    risk_factors.append(f"Importe muy elevado (>10,000€)")
                
                # 2. Check transaction frequency
                tx_ref = self.db.collection('transaction_analysis')
                one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
                
                recent_txs = list(tx_ref
                    .where('user_id', '==', user_id)
                    .where('timestamp', '>=', one_hour_ago)
                    .get())
                
                if len(recent_txs) > 5:
                    risk_score += 20
                    risk_factors.append(f"Alta frecuencia: {len(recent_txs)} transacciones en 1 hora")
                
                # 3. Check if destination is in scam database
                scams_ref = self.db.collection('scam_reports')
                scam_match = list(scams_ref.where('value', '==', destination).limit(1).get())
                
                if scam_match:
                    risk_score += 60
                    risk_factors.append(f"Destino reportado como fraude")
                
                # 4. International transfer check (non-ES IBAN)
                if destination and not destination.upper().startswith('ES'):
                    risk_score += 15
                    risk_factors.append("Transferencia internacional")
                
                # 5. Log for analysis
                tx_ref.add({
                    'user_id': user_id,
                    'amount': amount,
                    'destination': destination,
                    'ip_address': ip_address,
                    'transaction_type': transaction_type,
                    'risk_score': risk_score,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })
                
                # Auto-report to scam database if very suspicious
                if risk_score >= 80:
                    # Create automatic fraud alert in Firestore
                    alerts_ref = self.db.collection('fraud_alerts')
                    alerts_ref.add({
                        'type': 'automatic_detection',
                        'user_id': user_id,
                        'amount': amount,
                        'destination': destination,
                        'risk_score': risk_score,
                        'risk_factors': risk_factors,
                        'status': 'pending_review',
                        'created_at': datetime.now(timezone.utc).isoformat()
                    })
                
                # Determine action
                if risk_score >= 70:
                    action = "block"
                elif risk_score >= 40:
                    action = "require_verification"
                else:
                    action = "allow"
                
                return {
                    "risk_score": risk_score,
                    "risk_factors": risk_factors,
                    "action": action,
                    "is_suspicious": risk_score >= 40
                }
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(_executor, _analyze)
            return result
            
        except Exception as e:
            print(f"[FraudDetection] Error analyzing transaction: {e}")
            return {"risk_score": 0, "risk_factors": [], "action": "allow"}
    
    async def get_fraud_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get pending fraud alerts from Firestore"""
        if not self.db:
            return []
        
        try:
            def _get_alerts():
                alerts_ref = self.db.collection('fraud_alerts')
                docs = alerts_ref.where('status', '==', 'pending_review').order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).get()
                return [{'id': doc.id, **doc.to_dict()} for doc in docs]
            
            loop = asyncio.get_event_loop()
            alerts = await loop.run_in_executor(_executor, _get_alerts)
            return alerts
            
        except Exception as e:
            print(f"[FraudDetection] Error getting alerts: {e}")
            return []
    
    async def resolve_alert(self, alert_id: str, resolution: str, resolved_by: str) -> bool:
        """Mark a fraud alert as resolved"""
        if not self.db:
            return False
        
        try:
            def _resolve():
                alerts_ref = self.db.collection('fraud_alerts')
                alerts_ref.document(alert_id).update({
                    'status': 'resolved',
                    'resolution': resolution,
                    'resolved_by': resolved_by,
                    'resolved_at': datetime.now(timezone.utc).isoformat()
                })
                return True
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(_executor, _resolve)
            return result
            
        except Exception as e:
            print(f"[FraudDetection] Error resolving alert: {e}")
            return False


# Singleton instance
_fraud_algorithm = None

def get_fraud_algorithm() -> FraudDetectionAlgorithm:
    """Get the singleton fraud detection algorithm instance"""
    global _fraud_algorithm
    if _fraud_algorithm is None:
        _fraud_algorithm = FraudDetectionAlgorithm()
    return _fraud_algorithm
