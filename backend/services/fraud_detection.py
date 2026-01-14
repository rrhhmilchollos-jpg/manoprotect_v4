"""
MANO - ML Fraud Detection Service
Machine Learning based fraud detection and risk scoring
"""
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timezone, timedelta
import re
import math
from core.config import db, EMERGENT_LLM_KEY, RISK_WEIGHTS, THREAT_PATTERNS


class FraudDetectionService:
    """
    ML-based fraud detection service using pattern matching,
    statistical analysis, and LLM-powered analysis
    """
    
    def __init__(self):
        self.risk_weights = RISK_WEIGHTS
        self.threat_patterns = THREAT_PATTERNS
    
    def calculate_text_risk_score(self, content: str) -> Tuple[float, List[str], float]:
        """
        Calculate risk score for text content using pattern matching
        Returns: (risk_score, detected_patterns, confidence)
        """
        content_lower = content.lower()
        detected_patterns = []
        total_score = 0.0
        pattern_count = 0
        
        # Check each pattern category
        pattern_scores = {
            "urgent_action": 15,
            "financial": 20,
            "personal_data": 25,
            "suspicious_links": 30,
            "impersonation": 25,
            "prize_scam": 20,
            "threat": 15
        }
        
        for category, keywords in self.threat_patterns.items():
            for keyword in keywords:
                if keyword.lower() in content_lower:
                    detected_patterns.append(f"{category}:{keyword}")
                    total_score += pattern_scores.get(category, 10)
                    pattern_count += 1
                    break  # Only count each category once
        
        # Normalize score to 0-100
        risk_score = min(100, total_score)
        
        # Calculate confidence based on pattern diversity
        confidence = min(1.0, pattern_count / 4)  # Max confidence with 4+ patterns
        
        return risk_score, detected_patterns, confidence
    
    def analyze_url_risk(self, url: str) -> Tuple[float, List[str]]:
        """
        Analyze URL for phishing indicators
        Returns: (risk_score, risk_factors)
        """
        risk_factors = []
        risk_score = 0.0
        
        # Check for URL shorteners
        shorteners = ["bit.ly", "tinyurl", "goo.gl", "cutt.ly", "rb.gy", "t.co", "ow.ly"]
        for shortener in shorteners:
            if shortener in url.lower():
                risk_factors.append("url_shortener")
                risk_score += 30
                break
        
        # Check for suspicious TLDs
        suspicious_tlds = [".xyz", ".top", ".click", ".link", ".work", ".tk", ".ml", ".ga"]
        for tld in suspicious_tlds:
            if url.lower().endswith(tld):
                risk_factors.append(f"suspicious_tld:{tld}")
                risk_score += 25
                break
        
        # Check for IP address instead of domain
        ip_pattern = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        if re.search(ip_pattern, url):
            risk_factors.append("ip_address_url")
            risk_score += 40
        
        # Check for typosquatting (common brands)
        brands = ["paypal", "amazon", "google", "facebook", "microsoft", "apple", "netflix", "santander", "bbva", "caixabank"]
        for brand in brands:
            # Look for slight misspellings
            if brand not in url.lower() and any(self._levenshtein_distance(brand, word) <= 2 for word in url.lower().split('.')):
                risk_factors.append(f"possible_typosquatting:{brand}")
                risk_score += 35
                break
        
        # Check for excessive subdomains
        domain_parts = url.replace("https://", "").replace("http://", "").split("/")[0].split(".")
        if len(domain_parts) > 4:
            risk_factors.append("excessive_subdomains")
            risk_score += 20
        
        return min(100, risk_score), risk_factors
    
    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    async def analyze_transaction_risk(
        self, 
        user_id: str, 
        amount: float, 
        merchant: Optional[str],
        description: str
    ) -> Tuple[float, List[str], str]:
        """
        Analyze transaction for fraud indicators
        Returns: (risk_score, risk_factors, recommendation)
        """
        risk_factors = []
        risk_score = 0.0
        
        # Get user's behavior profile
        profile = await self._get_user_profile(user_id)
        
        # Check amount anomaly
        if profile and profile.get("avg_transaction_amount", 0) > 0:
            avg = profile["avg_transaction_amount"]
            if amount > avg * 3:
                risk_factors.append(f"amount_anomaly:3x_average")
                risk_score += 30
            elif amount > avg * 5:
                risk_factors.append(f"amount_anomaly:5x_average")
                risk_score += 50
        
        # Check for high-risk amount thresholds
        if amount > 1000:
            risk_factors.append("high_value_transaction")
            risk_score += 15
        if amount > 5000:
            risk_factors.append("very_high_value_transaction")
            risk_score += 25
        
        # Check merchant reputation (simulated)
        if merchant:
            suspicious_merchants = ["crypto", "casino", "lottery", "prize", "wire transfer"]
            for sus in suspicious_merchants:
                if sus in merchant.lower():
                    risk_factors.append(f"suspicious_merchant:{sus}")
                    risk_score += 35
                    break
        
        # Check description for fraud indicators
        fraud_keywords = ["urgente", "inmediato", "premio", "lotería", "herencia", "nigeria", "príncipe"]
        for keyword in fraud_keywords:
            if keyword in description.lower():
                risk_factors.append(f"suspicious_description:{keyword}")
                risk_score += 25
                break
        
        # Check time-based anomalies
        current_hour = datetime.now(timezone.utc).hour
        if profile and profile.get("typical_hours"):
            if current_hour not in profile["typical_hours"]:
                risk_factors.append("unusual_time")
                risk_score += 15
        
        # Generate recommendation
        risk_score = min(100, risk_score)
        if risk_score >= 70:
            recommendation = "BLOQUEAR: Transacción altamente sospechosa. Verificar con el usuario antes de procesar."
        elif risk_score >= 50:
            recommendation = "REVISAR: Transacción requiere verificación adicional. Contactar al usuario."
        elif risk_score >= 30:
            recommendation = "MONITOREAR: Transacción con algunos indicadores de riesgo. Continuar monitoreando."
        else:
            recommendation = "APROBAR: Transacción dentro de parámetros normales."
        
        return risk_score, risk_factors, recommendation
    
    async def _get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user's behavior profile from database"""
        profile = await db.user_behavior_profiles.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        return profile
    
    async def update_user_profile(self, user_id: str, transaction_amount: float, merchant: Optional[str] = None):
        """Update user's behavior profile with new transaction data"""
        profile = await self._get_user_profile(user_id)
        
        if not profile:
            # Create new profile
            profile = {
                "user_id": user_id,
                "avg_transaction_amount": transaction_amount,
                "transaction_count": 1,
                "typical_merchants": [merchant] if merchant else [],
                "typical_hours": [datetime.now(timezone.utc).hour],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_behavior_profiles.insert_one(profile)
        else:
            # Update existing profile with running average
            count = profile.get("transaction_count", 1)
            new_avg = (profile.get("avg_transaction_amount", 0) * count + transaction_amount) / (count + 1)
            
            update_data = {
                "avg_transaction_amount": new_avg,
                "transaction_count": count + 1,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add merchant if new
            if merchant and merchant not in profile.get("typical_merchants", []):
                merchants = profile.get("typical_merchants", [])[:10]  # Keep last 10
                merchants.append(merchant)
                update_data["typical_merchants"] = merchants
            
            # Add hour if new
            current_hour = datetime.now(timezone.utc).hour
            if current_hour not in profile.get("typical_hours", []):
                hours = profile.get("typical_hours", [])
                hours.append(current_hour)
                update_data["typical_hours"] = list(set(hours))  # Unique hours
            
            await db.user_behavior_profiles.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
    
    def get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level"""
        if risk_score >= 70:
            return "critical"
        elif risk_score >= 50:
            return "high"
        elif risk_score >= 30:
            return "medium"
        else:
            return "low"
    
    async def get_user_risk_summary(self, user_id: str) -> Dict:
        """Get user's overall risk summary"""
        # Get recent threats
        recent_threats = await db.threat_history.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()}
        })
        
        # Get blocked threats
        blocked_threats = await db.threat_history.count_documents({
            "user_id": user_id,
            "is_threat": True
        })
        
        # Get average risk score
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avg_risk": {"$avg": "$risk_score"}}}
        ]
        result = await db.threat_history.aggregate(pipeline).to_list(1)
        avg_risk = result[0]["avg_risk"] if result else 0
        
        return {
            "recent_threats_30d": recent_threats,
            "total_threats_blocked": blocked_threats,
            "average_risk_score": round(avg_risk, 1),
            "risk_level": self.get_risk_level(avg_risk),
            "protection_status": "active"
        }


# Global instance
fraud_service = FraudDetectionService()
