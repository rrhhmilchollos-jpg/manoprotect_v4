"""
MANO - Banking Integration Service
Simulated banking integration for fraud detection
"""
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
import uuid
import random
from core.config import db
from services.fraud_detection import fraud_service


class BankingService:
    """
    Banking integration service for transaction monitoring
    and fraud detection. Currently simulated for demo purposes.
    """
    
    def __init__(self):
        self.supported_banks = [
            "Santander", "BBVA", "CaixaBank", "Sabadell", 
            "Bankinter", "ING", "Unicaja", "Kutxabank",
            "N26", "Imagin", "Nickel"
        ]
    
    async def connect_bank_account(
        self, 
        user_id: str, 
        bank_name: str,
        account_type: str = "checking"
    ) -> Dict:
        """
        Simulate connecting a bank account
        In production, this would use Open Banking APIs
        """
        if bank_name not in self.supported_banks:
            return {
                "success": False,
                "error": f"Banco no soportado. Bancos disponibles: {', '.join(self.supported_banks)}"
            }
        
        # Generate simulated account
        account_id = str(uuid.uuid4())
        last_four = str(random.randint(1000, 9999))
        
        account = {
            "id": account_id,
            "user_id": user_id,
            "bank_name": bank_name,
            "account_type": account_type,
            "last_four": last_four,
            "is_monitored": True,
            "alert_threshold": 500.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "connected"
        }
        
        await db.bank_accounts.insert_one(account)
        
        # Create some sample transactions for demo
        await self._create_sample_transactions(user_id, account_id)
        
        return {
            "success": True,
            "account_id": account_id,
            "bank_name": bank_name,
            "last_four": last_four,
            "message": f"Cuenta {bank_name} ****{last_four} conectada correctamente"
        }
    
    async def _create_sample_transactions(self, user_id: str, account_id: str):
        """Create sample transactions for demo"""
        merchants = [
            ("Mercadona", "groceries", 45.67),
            ("Amazon.es", "shopping", 89.99),
            ("Spotify", "subscription", 9.99),
            ("Gasolinera Repsol", "fuel", 65.00),
            ("Netflix", "subscription", 12.99),
            ("Restaurante La Tasca", "dining", 32.50),
            ("El Corte Inglés", "shopping", 156.78),
        ]
        
        for merchant, category, amount in merchants:
            tx = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "account_id": account_id,
                "amount": amount,
                "description": f"Compra en {merchant}",
                "merchant": merchant,
                "category": category,
                "is_suspicious": False,
                "risk_score": random.uniform(0, 20),
                "risk_factors": [],
                "status": "approved",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
            }
            await db.bank_transactions.insert_one(tx)
    
    async def get_accounts(self, user_id: str) -> List[Dict]:
        """Get all connected bank accounts for a user"""
        accounts = await db.bank_accounts.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        return accounts
    
    async def get_transactions(
        self, 
        user_id: str, 
        account_id: Optional[str] = None,
        days: int = 30,
        suspicious_only: bool = False
    ) -> List[Dict]:
        """Get transactions for a user"""
        query = {
            "user_id": user_id,
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()}
        }
        
        if account_id:
            query["account_id"] = account_id
        
        if suspicious_only:
            query["is_suspicious"] = True
        
        transactions = await db.bank_transactions.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return transactions
    
    async def analyze_transaction(
        self, 
        user_id: str,
        amount: float,
        description: str,
        merchant: Optional[str] = None,
        account_id: Optional[str] = None
    ) -> Dict:
        """
        Analyze a transaction for fraud
        Returns risk assessment and recommendation
        """
        # Use fraud detection service
        risk_score, risk_factors, recommendation = await fraud_service.analyze_transaction_risk(
            user_id, amount, merchant, description
        )
        
        risk_level = fraud_service.get_risk_level(risk_score)
        is_suspicious = risk_score >= 50
        
        # Save transaction
        tx_id = str(uuid.uuid4())
        status = "flagged" if is_suspicious else "approved"
        
        transaction = {
            "id": tx_id,
            "user_id": user_id,
            "account_id": account_id or "unknown",
            "amount": amount,
            "description": description,
            "merchant": merchant,
            "category": self._categorize_merchant(merchant or description),
            "is_suspicious": is_suspicious,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "status": status,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.bank_transactions.insert_one(transaction)
        
        # Update user profile for ML learning
        await fraud_service.update_user_profile(user_id, amount, merchant)
        
        # Create alert if suspicious
        if is_suspicious:
            await self._create_alert(user_id, transaction, risk_score, risk_factors)
        
        return {
            "transaction_id": tx_id,
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "is_suspicious": is_suspicious,
            "risk_factors": risk_factors,
            "recommendation": recommendation,
            "status": status,
            "action_required": is_suspicious
        }
    
    def _categorize_merchant(self, merchant: str) -> str:
        """Categorize merchant based on name"""
        merchant_lower = merchant.lower()
        
        categories = {
            "groceries": ["mercadona", "carrefour", "lidl", "dia", "alcampo"],
            "fuel": ["repsol", "cepsa", "bp", "shell", "gasolinera"],
            "dining": ["restaurante", "bar", "café", "mcdonald", "burger"],
            "subscription": ["netflix", "spotify", "hbo", "disney", "prime"],
            "shopping": ["amazon", "zara", "corte inglés", "mediamarkt"],
            "transport": ["uber", "cabify", "taxi", "renfe", "iberia"],
            "utilities": ["iberdrola", "endesa", "naturgy", "vodafone", "movistar"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in merchant_lower for keyword in keywords):
                return category
        
        return "other"
    
    async def _create_alert(
        self, 
        user_id: str, 
        transaction: Dict, 
        risk_score: float,
        risk_factors: List[str]
    ):
        """Create notification for suspicious transaction"""
        alert = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": "⚠️ Transacción Sospechosa Detectada",
            "body": f"Se ha detectado una transacción de {transaction['amount']}€ con riesgo {fraud_service.get_risk_level(risk_score)}. Factores: {', '.join(risk_factors[:3])}",
            "notification_type": "bank",
            "data": {
                "transaction_id": transaction["id"],
                "amount": transaction["amount"],
                "risk_score": risk_score
            },
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.notifications.insert_one(alert)
    
    async def get_account_summary(self, user_id: str) -> Dict:
        """Get summary of all accounts and recent activity"""
        accounts = await self.get_accounts(user_id)
        
        # Get transaction stats
        total_transactions = await db.bank_transactions.count_documents({"user_id": user_id})
        suspicious_count = await db.bank_transactions.count_documents({
            "user_id": user_id, 
            "is_suspicious": True
        })
        
        # Calculate total monitored
        pipeline = [
            {"$match": {"user_id": user_id, "status": "approved"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        result = await db.bank_transactions.aggregate(pipeline).to_list(1)
        total_amount = result[0]["total"] if result else 0
        
        # Get recent suspicious
        recent_suspicious = await db.bank_transactions.find(
            {"user_id": user_id, "is_suspicious": True},
            {"_id": 0}
        ).sort("created_at", -1).limit(5).to_list(5)
        
        return {
            "accounts_connected": len(accounts),
            "accounts": accounts,
            "total_transactions": total_transactions,
            "suspicious_transactions": suspicious_count,
            "total_amount_monitored": round(total_amount, 2),
            "protection_rate": round((1 - suspicious_count / max(total_transactions, 1)) * 100, 1),
            "recent_suspicious": recent_suspicious,
            "supported_banks": self.supported_banks
        }
    
    async def block_transaction(self, user_id: str, transaction_id: str) -> Dict:
        """Block a suspicious transaction"""
        result = await db.bank_transactions.update_one(
            {"id": transaction_id, "user_id": user_id},
            {"$set": {"status": "blocked", "reviewed_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        if result.modified_count == 0:
            return {"success": False, "error": "Transacción no encontrada"}
        
        return {
            "success": True,
            "message": "Transacción bloqueada correctamente",
            "transaction_id": transaction_id
        }
    
    async def approve_transaction(self, user_id: str, transaction_id: str) -> Dict:
        """Approve a flagged transaction"""
        result = await db.bank_transactions.update_one(
            {"id": transaction_id, "user_id": user_id},
            {"$set": {"status": "approved", "reviewed_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        if result.modified_count == 0:
            return {"success": False, "error": "Transacción no encontrada"}
        
        return {
            "success": True,
            "message": "Transacción aprobada",
            "transaction_id": transaction_id
        }


# Global instance
banking_service = BankingService()
