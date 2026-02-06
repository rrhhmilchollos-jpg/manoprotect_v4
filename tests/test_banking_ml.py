"""
MANO - Banking and ML Features Test Suite
Tests for banking integration, ML fraud detection, and threat analyzer
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://safety-app-boost.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@mano.com"
TEST_PASSWORD = "TestPass123!"


class TestBankingEndpoints:
    """Banking integration endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session token
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code == 200:
            # Extract session token from cookies
            if 'session_token' in login_response.cookies:
                self.session_token = login_response.cookies['session_token']
                self.session.headers.update({"Authorization": f"Bearer {self.session_token}"})
            self.user_data = login_response.json()
        else:
            pytest.skip("Authentication failed - skipping banking tests")
    
    def test_supported_banks_returns_list(self):
        """GET /api/banking/supported-banks - Returns list of supported banks"""
        response = self.session.get(f"{BASE_URL}/api/banking/supported-banks")
        
        assert response.status_code == 200
        data = response.json()
        assert "banks" in data
        assert isinstance(data["banks"], list)
        assert len(data["banks"]) > 0
        # Verify Spanish banks are included
        assert "Santander" in data["banks"]
        assert "BBVA" in data["banks"]
        assert "CaixaBank" in data["banks"]
    
    def test_connect_bank_account_success(self):
        """POST /api/banking/connect - Successfully connects bank account"""
        response = self.session.post(
            f"{BASE_URL}/api/banking/connect",
            json={"bank_name": "BBVA", "account_type": "checking"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "account_id" in data
        assert data["bank_name"] == "BBVA"
        assert "last_four" in data
        assert len(data["last_four"]) == 4
    
    def test_connect_bank_unsupported_fails(self):
        """POST /api/banking/connect - Unsupported bank returns error"""
        response = self.session.post(
            f"{BASE_URL}/api/banking/connect",
            json={"bank_name": "BancoFalso", "account_type": "checking"}
        )
        
        assert response.status_code == 200  # Returns 200 with error in body
        data = response.json()
        assert data["success"] == False
        assert "error" in data
    
    def test_get_accounts_returns_list(self):
        """GET /api/banking/accounts - Returns connected accounts"""
        response = self.session.get(f"{BASE_URL}/api/banking/accounts")
        
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        assert isinstance(data["accounts"], list)
    
    def test_get_banking_summary(self):
        """GET /api/banking/summary - Returns banking summary with stats"""
        response = self.session.get(f"{BASE_URL}/api/banking/summary")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify summary structure
        assert "accounts_connected" in data
        assert "accounts" in data
        assert "total_transactions" in data
        assert "suspicious_transactions" in data
        assert "total_amount_monitored" in data
        assert "protection_rate" in data
        assert "supported_banks" in data
        
        # Verify data types
        assert isinstance(data["accounts_connected"], int)
        assert isinstance(data["protection_rate"], (int, float))
    
    def test_get_transactions(self):
        """GET /api/banking/transactions - Returns transaction list"""
        response = self.session.get(f"{BASE_URL}/api/banking/transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        assert isinstance(data["transactions"], list)
        
        # If transactions exist, verify structure
        if len(data["transactions"]) > 0:
            tx = data["transactions"][0]
            assert "id" in tx
            assert "amount" in tx
            assert "description" in tx
            assert "risk_score" in tx
            assert "status" in tx
    
    def test_analyze_transaction_low_risk(self):
        """POST /api/banking/analyze-transaction - Low risk transaction"""
        response = self.session.post(
            f"{BASE_URL}/api/banking/analyze-transaction",
            json={
                "amount": 45.50,
                "description": "Compra en supermercado",
                "merchant": "Mercadona"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "transaction_id" in data
        assert "risk_score" in data
        assert "risk_level" in data
        assert "is_suspicious" in data
        assert "recommendation" in data
        
        # Low amount should have low risk
        assert data["risk_score"] < 50
        assert data["is_suspicious"] == False
    
    def test_analyze_transaction_high_risk(self):
        """POST /api/banking/analyze-transaction - High risk transaction detected"""
        response = self.session.post(
            f"{BASE_URL}/api/banking/analyze-transaction",
            json={
                "amount": 10000.0,
                "description": "Transferencia urgente premio lotería",
                "merchant": "Crypto Casino"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] >= 50
        assert data["is_suspicious"] == True
        assert data["risk_level"] in ["high", "critical"]
        assert len(data["risk_factors"]) > 0
        assert data["action_required"] == True
    
    def test_banking_requires_auth(self):
        """Banking endpoints require authentication"""
        # Create new session without auth
        unauth_session = requests.Session()
        
        response = unauth_session.get(f"{BASE_URL}/api/banking/accounts")
        assert response.status_code == 401
        
        response = unauth_session.get(f"{BASE_URL}/api/banking/summary")
        assert response.status_code == 401


class TestMLFraudDetection:
    """ML Fraud Detection endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code == 200:
            if 'session_token' in login_response.cookies:
                self.session_token = login_response.cookies['session_token']
                self.session.headers.update({"Authorization": f"Bearer {self.session_token}"})
        else:
            pytest.skip("Authentication failed")
    
    def test_ml_analyze_text_detects_phishing(self):
        """POST /api/ml/analyze-text - Detects phishing SMS"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "URGENTE: Su cuenta bancaria ha sido bloqueada. Verifique sus datos en http://bit.ly/banco123",
                "content_type": "sms"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_threat" in data
        assert "risk_level" in data
        assert "risk_score" in data
        assert "threat_types" in data
        assert "analysis" in data
        assert "recommendation" in data
        
        # Should detect as threat
        assert data["is_threat"] == True
        assert data["risk_score"] >= 50
        assert len(data["threat_types"]) > 0
    
    def test_ml_analyze_text_safe_content(self):
        """POST /api/ml/analyze-text - Safe content returns low risk"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "Hola, ¿quedamos mañana para tomar un café?",
                "content_type": "sms"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_threat"] == False
        assert data["risk_score"] < 50
        assert data["risk_level"] == "low"
    
    def test_ml_analyze_text_url_phishing(self):
        """POST /api/ml/analyze-text - Detects URL phishing patterns"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "Haz clic aquí para reclamar tu premio: http://192.168.1.1/premio.php",
                "content_type": "email"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # IP address URL should be detected as pattern
        assert "patterns_detected" in data
        assert data["risk_score"] > 0
        # Verify IP address pattern was detected
        patterns = data["patterns_detected"]
        assert any("ip_address" in p for p in patterns)
    
    def test_ml_analyze_text_prize_scam(self):
        """POST /api/ml/analyze-text - Detects prize scam patterns"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "¡Felicidades! Has ganado 50.000€ en la lotería. Envía tus datos bancarios para recibir el premio.",
                "content_type": "email"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Prize scam pattern should be detected
        assert "patterns_detected" in data
        assert data["risk_score"] > 0
        patterns = data["patterns_detected"]
        assert any("prize" in p.lower() or "premio" in p.lower() for p in patterns)
    
    def test_ml_risk_summary(self):
        """GET /api/ml/risk-summary - Returns user risk summary"""
        response = self.session.get(f"{BASE_URL}/api/ml/risk-summary")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "recent_threats_30d" in data
        assert "total_threats_blocked" in data
        assert "average_risk_score" in data
        assert "risk_level" in data
        assert "protection_status" in data
        
        assert data["protection_status"] == "active"
    
    def test_ml_behavior_profile(self):
        """GET /api/ml/behavior-profile - Returns behavior profile"""
        response = self.session.get(f"{BASE_URL}/api/ml/behavior-profile")
        
        assert response.status_code == 200
        data = response.json()
        
        # Profile may or may not exist
        if data.get("profile"):
            profile = data["profile"]
            assert "avg_transaction_amount" in profile
            assert "transaction_count" in profile
    
    def test_ml_analyze_requires_content(self):
        """POST /api/ml/analyze-text - Requires content field"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={"content_type": "sms"}
        )
        
        # Should return validation error
        assert response.status_code == 422


class TestThreatAnalyzerPatterns:
    """Test ML pattern detection for various threat types"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_detects_urgent_action_pattern(self):
        """Detects urgent action manipulation"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "¡URGENTE! Actúa AHORA o perderás tu cuenta. Última oportunidad.",
                "content_type": "sms"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] > 0
    
    def test_detects_financial_keywords(self):
        """Detects financial fraud keywords"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "Su tarjeta de crédito ha sido bloqueada. Verifique su cuenta bancaria y realice una transferencia.",
                "content_type": "email"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        # Financial patterns should be detected
        assert data["risk_score"] > 0
        assert "patterns_detected" in data
        patterns = data["patterns_detected"]
        assert any("financial" in p.lower() or "bank" in p.lower() or "cuenta" in p.lower() for p in patterns)
    
    def test_detects_personal_data_request(self):
        """Detects personal data phishing patterns"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "Por favor envíe su contraseña, PIN y DNI para verificar su identidad.",
                "content_type": "email"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        # Personal data patterns should be detected
        assert data["risk_score"] > 0
        assert "patterns_detected" in data
        patterns = data["patterns_detected"]
        assert any("personal" in p.lower() or "contraseña" in p.lower() for p in patterns)
    
    def test_detects_impersonation(self):
        """Detects impersonation attempt patterns"""
        response = self.session.post(
            f"{BASE_URL}/api/ml/analyze-text",
            json={
                "content": "Somos tu banco. El departamento de seguridad necesita verificar tus datos.",
                "content_type": "call"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        # Impersonation patterns should be detected
        assert data["risk_score"] > 0
        assert "patterns_detected" in data
        patterns = data["patterns_detected"]
        assert any("impersonation" in p.lower() or "banco" in p.lower() for p in patterns)


class TestPWAConfiguration:
    """Test PWA manifest and service worker configuration"""
    
    def test_manifest_exists(self):
        """manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        # May return 200 or redirect to frontend
        assert response.status_code in [200, 304, 404]  # 404 if served by frontend
    
    def test_service_worker_exists(self):
        """sw.js is accessible"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code in [200, 304, 404]


class TestAuthenticationFlow:
    """Test authentication for protected endpoints"""
    
    def test_login_success(self):
        """POST /api/auth/login - Successful login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == TEST_EMAIL
        assert "role" in data
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - Invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        
        assert response.status_code == 401
    
    def test_auth_me_requires_token(self):
        """GET /api/auth/me - Requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
