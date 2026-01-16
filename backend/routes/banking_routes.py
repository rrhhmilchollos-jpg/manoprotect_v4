"""
MANO - Nordigen Open Banking Integration
Connects to European banks for transaction analysis and fraud detection
"""
from fastapi import APIRouter, HTTPException, Request, Cookie, Depends
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import httpx
import os
import uuid

from core.database import db, require_auth

router = APIRouter(prefix="/banking", tags=["Open Banking"])

# Nordigen/GoCardless API Configuration
NORDIGEN_SECRET_ID = os.environ.get('NORDIGEN_SECRET_ID')
NORDIGEN_SECRET_KEY = os.environ.get('NORDIGEN_SECRET_KEY')
NORDIGEN_BASE_URL = "https://bankaccountdata.gocardless.com/api/v2"


class NordigenClient:
    """Client for Nordigen Open Banking API"""
    
    def __init__(self):
        self.secret_id = NORDIGEN_SECRET_ID
        self.secret_key = NORDIGEN_SECRET_KEY
        self.access_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
    
    async def get_access_token(self) -> str:
        """Generate new access token or return existing valid token"""
        if self.access_token and self.token_expiry and datetime.now(timezone.utc) < self.token_expiry:
            return self.access_token
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{NORDIGEN_BASE_URL}/token/new/",
                json={
                    "secret_id": self.secret_id,
                    "secret_key": self.secret_key
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            self.access_token = data["access"]
            # Token valid for ~24 hours, refresh every 10 minutes
            self.token_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
            return self.access_token
    
    async def get_institutions(self, country: str) -> List[Dict[str, Any]]:
        """Get list of supported banks in a country"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NORDIGEN_BASE_URL}/institutions/?country={country}",
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def create_requisition(
        self,
        institution_id: str,
        redirect_url: str,
        reference_id: str
    ) -> Dict[str, Any]:
        """Create a new requisition (bank connection request)"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{NORDIGEN_BASE_URL}/requisitions/",
                headers=headers,
                json={
                    "institution_id": institution_id,
                    "redirect": redirect_url,
                    "reference": reference_id,
                    "user_language": "es",
                    "account_selection": False
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_requisition(self, requisition_id: str) -> Dict[str, Any]:
        """Get requisition status and linked accounts"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NORDIGEN_BASE_URL}/requisitions/{requisition_id}/",
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_account_details(self, account_id: str) -> Dict[str, Any]:
        """Get account holder details"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NORDIGEN_BASE_URL}/accounts/{account_id}/details/",
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_balances(self, account_id: str) -> Dict[str, Any]:
        """Get account balances"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NORDIGEN_BASE_URL}/accounts/{account_id}/balances/",
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_transactions(
        self,
        account_id: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get account transactions"""
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        params = {}
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NORDIGEN_BASE_URL}/accounts/{account_id}/transactions/",
                headers=headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()


# Global client instance
nordigen_client = NordigenClient()


# Pydantic models
class BankLinkRequest(BaseModel):
    institution_id: str
    redirect_url: str


class TransactionAnalysis(BaseModel):
    account_id: str
    days_back: int = 30


# API Routes
@router.get("/status")
async def get_banking_status():
    """Check if Open Banking is configured"""
    is_configured = bool(NORDIGEN_SECRET_ID and NORDIGEN_SECRET_KEY)
    return {
        "configured": is_configured,
        "provider": "Nordigen (GoCardless)",
        "message": "Open Banking está configurado" if is_configured else "Configura NORDIGEN_SECRET_ID y NORDIGEN_SECRET_KEY en .env"
    }


@router.get("/institutions/{country}")
async def get_banks(country: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Get list of supported banks in a country (ES, DE, FR, etc.)"""
    await require_auth(request, session_token)
    
    if not NORDIGEN_SECRET_ID or not NORDIGEN_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Open Banking no está configurado. Contacta con el administrador."
        )
    
    try:
        institutions = await nordigen_client.get_institutions(country.upper())
        
        # Simplify response for frontend
        simplified = []
        for bank in institutions:
            simplified.append({
                "id": bank.get("id"),
                "name": bank.get("name"),
                "logo": bank.get("logo"),
                "countries": bank.get("countries", []),
                "transaction_days": bank.get("transaction_total_days", 90)
            })
        
        return {
            "country": country.upper(),
            "institutions": simplified,
            "total": len(simplified)
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error al obtener bancos")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/link-account")
async def link_bank_account(
    data: BankLinkRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Initialize bank account linking process"""
    user = await require_auth(request, session_token)
    
    if not NORDIGEN_SECRET_ID or not NORDIGEN_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Open Banking no está configurado"
        )
    
    try:
        reference_id = f"mano_{user.user_id}_{uuid.uuid4().hex[:8]}"
        
        requisition = await nordigen_client.create_requisition(
            institution_id=data.institution_id,
            redirect_url=data.redirect_url,
            reference_id=reference_id
        )
        
        # Store requisition in database
        await db.bank_requisitions.insert_one({
            "requisition_id": requisition["id"],
            "reference_id": reference_id,
            "user_id": user.user_id,
            "institution_id": data.institution_id,
            "status": "PENDING",
            "link": requisition.get("link"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        })
        
        return {
            "requisition_id": requisition["id"],
            "link": requisition.get("link"),
            "expires_in_hours": 24,
            "message": "Haz clic en el enlace para conectar tu banco"
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error al crear conexión")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/account-status/{requisition_id}")
async def check_account_status(
    requisition_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Check if bank account linking is complete"""
    user = await require_auth(request, session_token)
    
    try:
        requisition = await nordigen_client.get_requisition(requisition_id)
        
        # Update status in database
        await db.bank_requisitions.update_one(
            {"requisition_id": requisition_id, "user_id": user.user_id},
            {"$set": {
                "status": requisition.get("status"),
                "accounts": requisition.get("accounts", []),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        status = requisition.get("status")
        accounts = requisition.get("accounts", [])
        
        if status == "LN":  # Linked
            # Store linked accounts
            for account_id in accounts:
                await db.bank_accounts.update_one(
                    {"account_id": account_id},
                    {"$set": {
                        "account_id": account_id,
                        "user_id": user.user_id,
                        "requisition_id": requisition_id,
                        "linked_at": datetime.now(timezone.utc).isoformat()
                    }},
                    upsert=True
                )
            
            return {
                "status": "linked",
                "accounts": accounts,
                "message": f"¡Cuenta bancaria conectada! {len(accounts)} cuenta(s) vinculada(s)"
            }
        elif status == "EX":  # Expired
            return {
                "status": "expired",
                "message": "El enlace de conexión ha expirado. Intenta de nuevo."
            }
        else:
            return {
                "status": status.lower(),
                "message": "Esperando autorización del banco..."
            }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error al verificar estado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/accounts")
async def get_linked_accounts(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all linked bank accounts for user"""
    user = await require_auth(request, session_token)
    
    accounts = await db.bank_accounts.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(20)
    
    return {"accounts": accounts}


@router.get("/transactions/{account_id}")
async def get_account_transactions(
    account_id: str,
    days_back: int = 30,
    request: Request = None,
    session_token: Optional[str] = Cookie(None)
):
    """Fetch and analyze transactions for fraud detection"""
    user = await require_auth(request, session_token)
    
    # Verify user owns this account
    account = await db.bank_accounts.find_one({
        "account_id": account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    try:
        date_to = datetime.now(timezone.utc).date().isoformat()
        date_from = (datetime.now(timezone.utc) - timedelta(days=days_back)).date().isoformat()
        
        transactions = await nordigen_client.get_transactions(
            account_id=account_id,
            date_from=date_from,
            date_to=date_to
        )
        
        # Analyze transactions for fraud
        booked = transactions.get("transactions", {}).get("booked", [])
        pending = transactions.get("transactions", {}).get("pending", [])
        
        analysis = await analyze_transactions_for_fraud(booked, user.user_id, account_id)
        
        return {
            "account_id": account_id,
            "period": {"from": date_from, "to": date_to},
            "transactions": {
                "booked": len(booked),
                "pending": len(pending),
                "data": booked[:50]  # Limit to 50 most recent
            },
            "fraud_analysis": analysis
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error al obtener transacciones")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/balances/{account_id}")
async def get_account_balances(
    account_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get account balances"""
    user = await require_auth(request, session_token)
    
    # Verify user owns this account
    account = await db.bank_accounts.find_one({
        "account_id": account_id,
        "user_id": user.user_id
    })
    
    if not account:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    try:
        balances = await nordigen_client.get_balances(account_id)
        return {
            "account_id": account_id,
            "balances": balances.get("balances", [])
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error al obtener saldo")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def analyze_transactions_for_fraud(
    transactions: List[Dict],
    user_id: str,
    account_id: str
) -> Dict[str, Any]:
    """Analyze transactions for potential fraud patterns"""
    if not transactions:
        return {"alerts": [], "risk_score": 0, "summary": "Sin transacciones para analizar"}
    
    alerts = []
    
    # Calculate statistics
    amounts = []
    for tx in transactions:
        try:
            amount = float(tx.get("transactionAmount", {}).get("amount", 0))
            amounts.append(abs(amount))
        except (ValueError, TypeError):
            continue
    
    if not amounts:
        return {"alerts": [], "risk_score": 0, "summary": "No se pudieron analizar las transacciones"}
    
    import statistics
    mean_amount = statistics.mean(amounts)
    std_dev = statistics.stdev(amounts) if len(amounts) > 1 else 0
    
    # Detect anomalies
    for tx in transactions:
        try:
            amount = abs(float(tx.get("transactionAmount", {}).get("amount", 0)))
            
            # Flag unusually large transactions
            if std_dev > 0 and amount > mean_amount + (2 * std_dev):
                risk_score = min(1.0, (amount - mean_amount) / (3 * std_dev))
                alert = {
                    "type": "unusual_amount",
                    "severity": "high" if risk_score > 0.7 else "medium",
                    "transaction_id": tx.get("transactionId", "N/A"),
                    "amount": amount,
                    "description": f"Transacción de €{amount:.2f} significativamente superior a la media (€{mean_amount:.2f})",
                    "risk_score": round(risk_score, 2)
                }
                alerts.append(alert)
                
                # Store alert in database
                alert["user_id"] = user_id
                alert["account_id"] = account_id
                alert["created_at"] = datetime.now(timezone.utc).isoformat()
                alert["status"] = "open"
                await db.bank_fraud_alerts.insert_one(alert)
                
        except (ValueError, TypeError):
            continue
    
    # Calculate overall risk score
    overall_risk = sum(a.get("risk_score", 0) for a in alerts) / max(len(alerts), 1)
    
    return {
        "alerts": alerts[:10],  # Top 10 alerts
        "total_alerts": len(alerts),
        "risk_score": round(overall_risk, 2),
        "statistics": {
            "mean_amount": round(mean_amount, 2),
            "std_deviation": round(std_dev, 2),
            "total_transactions": len(transactions)
        },
        "summary": f"Se encontraron {len(alerts)} alertas de posible fraude" if alerts else "No se detectaron patrones sospechosos"
    }
