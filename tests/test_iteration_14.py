"""
MANO - Iteration 14 Backend Tests
Testing new integration endpoints: Banking, Email, WhatsApp
Also verifying existing routes (auth, payments, admin) still work

NOTE: Login returns user data directly, session_token is set as HTTP cookie
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
SUPERADMIN_EMAIL = "rrhh.milchollos@gmail.com"
SUPERADMIN_PASSWORD = "ManoAdmin2025!"


class TestIntegrationStatus:
    """Test new integration status endpoints (MOCKED mode)"""
    
    def test_banking_status_returns_200(self):
        """GET /api/banking/status should return 200"""
        response = requests.get(f"{BASE_URL}/api/banking/status")
        assert response.status_code == 200
        print(f"✓ Banking status endpoint returns 200")
    
    def test_banking_status_shows_not_configured(self):
        """Banking should show configured: false (no API keys)"""
        response = requests.get(f"{BASE_URL}/api/banking/status")
        data = response.json()
        assert "configured" in data
        assert data["configured"] == False
        assert "provider" in data
        assert data["provider"] == "Nordigen (GoCardless)"
        assert "message" in data
        assert "NORDIGEN_SECRET_ID" in data["message"] or "Configura" in data["message"]
        print(f"✓ Banking status shows not configured with correct message")
    
    def test_email_status_returns_200(self):
        """GET /api/email/status should return 200"""
        response = requests.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        print(f"✓ Email status endpoint returns 200")
    
    def test_email_status_shows_not_configured(self):
        """Email should show configured: false (no API key)"""
        response = requests.get(f"{BASE_URL}/api/email/status")
        data = response.json()
        assert "configured" in data
        assert data["configured"] == False
        assert "provider" in data
        assert data["provider"] == "SendGrid"
        assert "sender" in data
        assert "message" in data
        assert "MOCKED" in data["message"] or "SENDGRID_API_KEY" in data["message"]
        print(f"✓ Email status shows not configured with MOCKED message")
    
    def test_whatsapp_status_returns_200(self):
        """GET /api/whatsapp/status should return 200"""
        response = requests.get(f"{BASE_URL}/api/whatsapp/status")
        assert response.status_code == 200
        print(f"✓ WhatsApp status endpoint returns 200")
    
    def test_whatsapp_status_shows_not_configured(self):
        """WhatsApp should show configured: false (no API keys)"""
        response = requests.get(f"{BASE_URL}/api/whatsapp/status")
        data = response.json()
        assert "configured" in data
        assert data["configured"] == False
        assert "provider" in data
        assert "WhatsApp Cloud API" in data["provider"]
        assert "message" in data
        assert "MOCKED" in data["message"] or "WHATSAPP_TOKEN" in data["message"]
        print(f"✓ WhatsApp status shows not configured with MOCKED message")


class TestExistingAuthRoutes:
    """Verify existing auth routes still work"""
    
    def test_root_endpoint(self):
        """GET /api/ should return welcome message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "MANO" in data["message"]
        print(f"✓ Root endpoint working: {data['message']}")
    
    def test_login_with_valid_credentials(self):
        """POST /api/auth/login should work with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        # Login returns user data directly, session_token is in cookie
        assert "email" in data
        assert data["email"] == SUPERADMIN_EMAIL
        # Check for session cookie
        assert "session_token" in response.cookies or "user_id" in data
        print(f"✓ Login successful for user: {data['email']}")
    
    def test_login_with_invalid_credentials(self):
        """POST /api/auth/login should return 401 for invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Login correctly rejects invalid credentials")
    
    def test_auth_me_without_token(self):
        """GET /api/auth/me should return 401 without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✓ /auth/me correctly requires authentication")
    
    def test_auth_me_with_cookie(self):
        """GET /api/auth/me should return user data with valid session cookie"""
        # Create session to get cookie
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        
        # Use same session to get user info (cookies are preserved)
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == SUPERADMIN_EMAIL
        print(f"✓ /auth/me returns correct user data with session cookie")


class TestExistingPaymentRoutes:
    """Verify existing payment routes still work"""
    
    def test_plans_endpoint(self):
        """GET /api/plans should return all plan types"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        assert "individual_plans" in data
        assert "family_plans" in data
        assert "business_plans" in data
        assert len(data["individual_plans"]) > 0
        assert len(data["family_plans"]) > 0
        print(f"✓ Plans endpoint returns all plan types")
    
    def test_plans_prices_correct(self):
        """Verify plan prices are correct"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        # Check individual plans
        individual = {p["id"]: p["price"] for p in data["individual_plans"]}
        assert individual.get("weekly") == 9.99
        assert individual.get("monthly") == 29.99
        assert individual.get("quarterly") == 74.99
        assert individual.get("yearly") == 249.99
        
        # Check family plans
        family = {p["id"]: p["price"] for p in data["family_plans"]}
        assert family.get("family-monthly") == 49.99
        assert family.get("family-quarterly") == 129.99
        assert family.get("family-yearly") == 399.99
        
        print(f"✓ All plan prices are correct")
    
    def test_create_checkout_session_weekly(self):
        """POST /api/create-checkout-session should work for weekly plan"""
        response = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "weekly",
            "origin_url": "https://safeguarder-1.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "stripe.com" in data["url"]
        print(f"✓ Checkout session created for weekly plan")
    
    def test_create_checkout_session_monthly(self):
        """POST /api/create-checkout-session should work for monthly plan"""
        response = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "monthly",
            "origin_url": "https://safeguarder-1.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "stripe.com" in data["url"]
        print(f"✓ Checkout session created for monthly plan")
    
    def test_create_checkout_session_invalid_plan(self):
        """POST /api/create-checkout-session should return 400 for invalid plan"""
        response = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "invalid_plan",
            "origin_url": "https://safeguarder-1.preview.emergentagent.com"
        })
        assert response.status_code == 400
        print(f"✓ Checkout correctly rejects invalid plan")


class TestExistingAdminRoutes:
    """Verify existing admin routes still work"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session with cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200
        return session
    
    def test_admin_stats(self, admin_session):
        """GET /api/admin/stats should work for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_threats" in data
        print(f"✓ Admin stats endpoint working")
    
    def test_admin_users_list(self, admin_session):
        """GET /api/admin/users should work for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin users list endpoint working, found {len(data)} users")
    
    def test_admin_investors_list(self, admin_session):
        """GET /api/admin/investors should work for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/investors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin investors list endpoint working")


class TestExistingThreatRoutes:
    """Verify existing threat analysis routes still work"""
    
    def test_stats_endpoint(self):
        """GET /api/stats should return statistics"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_analyzed" in data
        assert "threats_blocked" in data
        assert "protection_rate" in data
        print(f"✓ Stats endpoint working")
    
    def test_community_alerts(self):
        """GET /api/community-alerts should return alerts"""
        response = requests.get(f"{BASE_URL}/api/community-alerts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Community alerts endpoint working")
    
    def test_knowledge_base(self):
        """GET /api/knowledge-base should return threat info"""
        response = requests.get(f"{BASE_URL}/api/knowledge-base")
        assert response.status_code == 200
        data = response.json()
        assert "threat_types" in data
        print(f"✓ Knowledge base endpoint working")


class TestBankingRoutesAuth:
    """Test banking routes that require authentication"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200
        return session
    
    def test_banking_institutions_requires_auth(self):
        """GET /api/banking/institutions/{country} should require auth"""
        response = requests.get(f"{BASE_URL}/api/banking/institutions/ES")
        assert response.status_code == 401
        print(f"✓ Banking institutions correctly requires auth")
    
    def test_banking_institutions_returns_503_when_not_configured(self, auth_session):
        """GET /api/banking/institutions/{country} should return 503 when not configured"""
        response = auth_session.get(f"{BASE_URL}/api/banking/institutions/ES")
        # Should return 503 because Nordigen is not configured
        assert response.status_code == 503
        data = response.json()
        assert "no está configurado" in data.get("detail", "").lower() or "not configured" in data.get("detail", "").lower()
        print(f"✓ Banking institutions returns 503 when not configured")
    
    def test_banking_accounts_requires_auth(self):
        """GET /api/banking/accounts should require auth"""
        response = requests.get(f"{BASE_URL}/api/banking/accounts")
        assert response.status_code == 401
        print(f"✓ Banking accounts correctly requires auth")
    
    def test_banking_accounts_returns_empty_list(self, auth_session):
        """GET /api/banking/accounts should return empty list for user without linked accounts"""
        response = auth_session.get(f"{BASE_URL}/api/banking/accounts")
        assert response.status_code == 200
        data = response.json()
        assert "accounts" in data
        assert isinstance(data["accounts"], list)
        print(f"✓ Banking accounts returns list for authenticated user")


class TestEmailRoutes:
    """Test email routes"""
    
    def test_send_welcome_email_queued(self):
        """POST /api/email/send/welcome should queue email (mocked)"""
        response = requests.post(f"{BASE_URL}/api/email/send/welcome", json={
            "to": "test@example.com",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ Welcome email queued successfully (mocked)")
    
    def test_send_threat_alert_email_queued(self):
        """POST /api/email/send/threat-alert should queue email (mocked)"""
        response = requests.post(f"{BASE_URL}/api/email/send/threat-alert", json={
            "to": "test@example.com",
            "threat_type": "phishing",
            "risk_level": "alto",
            "description": "Test threat alert"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ Threat alert email queued successfully (mocked)")
    
    def test_send_receipt_email_queued(self):
        """POST /api/email/send/receipt should queue email (mocked)"""
        response = requests.post(f"{BASE_URL}/api/email/send/receipt", json={
            "to": "test@example.com",
            "name": "Test User",
            "plan_name": "Premium Mensual",
            "amount": 29.99,
            "currency": "EUR"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ Receipt email queued successfully (mocked)")
    
    def test_send_custom_email_queued(self):
        """POST /api/email/send/custom should queue email (mocked)"""
        response = requests.post(f"{BASE_URL}/api/email/send/custom", json={
            "to": "test@example.com",
            "subject": "Test Subject",
            "content": "<h1>Test Content</h1>",
            "content_type": "html"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ Custom email queued successfully (mocked)")


class TestWhatsAppRoutes:
    """Test WhatsApp routes"""
    
    def test_send_whatsapp_message_mocked(self):
        """POST /api/whatsapp/send should return mocked response"""
        response = requests.post(f"{BASE_URL}/api/whatsapp/send", json={
            "phone": "34612345678",
            "message": "Test message"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "mocked"
        print(f"✓ WhatsApp message returns mocked status")
    
    def test_send_whatsapp_threat_alert_queued(self):
        """POST /api/whatsapp/send/threat-alert should queue message (mocked)"""
        response = requests.post(f"{BASE_URL}/api/whatsapp/send/threat-alert", json={
            "phone": "34612345678",
            "threat_type": "phishing",
            "risk_level": "alto",
            "description": "Test threat alert"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ WhatsApp threat alert queued successfully (mocked)")
    
    def test_send_whatsapp_sos_alert_queued(self):
        """POST /api/whatsapp/send/sos-alert should queue message (mocked)"""
        response = requests.post(f"{BASE_URL}/api/whatsapp/send/sos-alert", json={
            "phone": "34612345678",
            "sender_name": "Test User",
            "location_url": "https://maps.google.com/?q=40.4168,-3.7038",
            "message": "Test SOS"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        print(f"✓ WhatsApp SOS alert queued successfully (mocked)")
    
    def test_whatsapp_webhook_verification(self):
        """GET /api/whatsapp/webhook should handle verification"""
        response = requests.get(
            f"{BASE_URL}/api/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "mano_verify_token",
                "hub.challenge": "12345"
            }
        )
        assert response.status_code == 200
        # Should return the challenge
        assert response.text == "12345"
        print(f"✓ WhatsApp webhook verification working")
    
    def test_whatsapp_webhook_invalid_token(self):
        """GET /api/whatsapp/webhook should reject invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong_token",
                "hub.challenge": "12345"
            }
        )
        assert response.status_code == 403
        print(f"✓ WhatsApp webhook correctly rejects invalid token")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
