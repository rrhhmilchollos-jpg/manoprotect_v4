"""
Test Mobile App Backend Endpoints
Tests all endpoints used by the React Native mobile app:
1. POST /api/auth/login - Login with email/password (returns session_token in cookie)
2. POST /api/auth/register - Register new users
3. GET /api/auth/me - Get authenticated user data
4. GET /api/threats - List of threats (requires auth)
5. GET /api/banking/supported-banks - List of supported banks
6. GET /api/banking/accounts - User's bank accounts
7. GET /api/family/members - Family members
8. GET /api/notifications - User notifications
9. GET /api/stats - Public statistics
10. POST /api/analyze - Threat analysis
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-portal-353.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@mano.com"
ADMIN_PASSWORD = "Admin123!"


class TestAuthLogin:
    """Test POST /api/auth/login endpoint"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "user_id" in data, "Missing 'user_id' in response"
        assert "email" in data, "Missing 'email' in response"
        assert "name" in data, "Missing 'name' in response"
        assert "role" in data, "Missing 'role' in response"
        assert "plan" in data, "Missing 'plan' in response"
        
        # Verify values
        assert data["email"] == ADMIN_EMAIL, "Email mismatch"
        assert data["role"] == "admin", "Role should be admin"
        
        # Check for session cookie
        cookies = response.cookies
        # Note: HTTPOnly cookies may not be visible in requests library
        print(f"Login response data: {data}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Should return 401, got {response.status_code}"
    
    def test_login_missing_fields(self):
        """Test login with missing fields returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL}  # Missing password
        )
        assert response.status_code == 422, f"Should return 422, got {response.status_code}"


class TestAuthRegister:
    """Test POST /api/auth/register endpoint"""
    
    def test_register_success(self):
        """Test successful registration"""
        unique_email = f"test_mobile_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "name": "Test Mobile User",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "user_id" in data, "Missing 'user_id' in response"
        assert "email" in data, "Missing 'email' in response"
        assert data["email"] == unique_email, "Email mismatch"
        assert "role" in data, "Missing 'role' in response"
        assert data["role"] == "user", "New user should have 'user' role"
    
    def test_register_duplicate_email(self):
        """Test registration with existing email returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": ADMIN_EMAIL,  # Already exists
                "name": "Duplicate User",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 400, f"Should return 400, got {response.status_code}"
    
    def test_register_weak_password(self):
        """Test registration with weak password returns 422"""
        unique_email = f"test_weak_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "name": "Weak Password User",
                "password": "123"  # Too short
            }
        )
        assert response.status_code == 422, f"Should return 422, got {response.status_code}"


class TestAuthMe:
    """Test GET /api/auth/me endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_auth_me_requires_auth(self):
        """Test /auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Should return 401, got {response.status_code}"
    
    def test_auth_me_returns_user_data(self, auth_session):
        """Test /auth/me returns user data when authenticated"""
        response = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify all expected fields
        expected_fields = ["user_id", "email", "name", "role", "plan", "dark_mode", "notifications_enabled", "auto_block"]
        for field in expected_fields:
            assert field in data, f"Missing '{field}' in response"
        
        assert data["email"] == ADMIN_EMAIL, "Email mismatch"


class TestThreats:
    """Test GET /api/threats endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_threats_returns_list(self, auth_session):
        """Test /threats returns list of threats"""
        response = auth_session.get(f"{BASE_URL}/api/threats")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # If there are threats, verify structure
        if len(data) > 0:
            threat = data[0]
            expected_fields = ["id", "content_type", "risk_level", "is_threat", "recommendation"]
            for field in expected_fields:
                assert field in threat, f"Missing '{field}' in threat"
    
    def test_threats_with_limit(self, auth_session):
        """Test /threats with limit parameter"""
        response = auth_session.get(f"{BASE_URL}/api/threats?limit=5")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert len(data) <= 5, "Should return at most 5 threats"


class TestBankingSupportedBanks:
    """Test GET /api/banking/supported-banks endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_supported_banks_returns_list(self, auth_session):
        """Test /banking/supported-banks returns list of banks"""
        response = auth_session.get(f"{BASE_URL}/api/banking/supported-banks")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "banks" in data, "Missing 'banks' field"
        assert isinstance(data["banks"], list), "Banks should be a list"
        
        # Banks are returned as simple strings (bank names)
        if len(data["banks"]) > 0:
            bank = data["banks"][0]
            assert isinstance(bank, str), "Bank should be a string (bank name)"
            # Verify some expected Spanish banks are present
            expected_banks = ["Santander", "BBVA", "CaixaBank"]
            found_banks = [b for b in expected_banks if b in data["banks"]]
            assert len(found_banks) > 0, f"Expected at least one of {expected_banks} in banks list"


class TestBankingAccounts:
    """Test GET /api/banking/accounts endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_banking_accounts_requires_auth(self):
        """Test /banking/accounts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/banking/accounts")
        assert response.status_code == 401, f"Should return 401, got {response.status_code}"
    
    def test_banking_accounts_returns_data(self, auth_session):
        """Test /banking/accounts returns account data"""
        response = auth_session.get(f"{BASE_URL}/api/banking/accounts")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Response should be a list or have accounts field
        assert isinstance(data, (list, dict)), "Response should be list or dict"


class TestFamilyMembers:
    """Test GET /api/family/members endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_family_members_requires_auth(self):
        """Test /family/members requires authentication"""
        response = requests.get(f"{BASE_URL}/api/family/members")
        assert response.status_code == 401, f"Should return 401, got {response.status_code}"
    
    def test_family_members_returns_data(self, auth_session):
        """Test /family/members returns member data"""
        response = auth_session.get(f"{BASE_URL}/api/family/members")
        # May return 403 if user doesn't have family plan
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list), "Response should be a list"


class TestNotifications:
    """Test GET /api/notifications endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_notifications_requires_auth(self):
        """Test /notifications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Should return 401, got {response.status_code}"
    
    def test_notifications_returns_data(self, auth_session):
        """Test /notifications returns notification data"""
        response = auth_session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "notifications" in data, "Missing 'notifications' field"
        assert "unread_count" in data, "Missing 'unread_count' field"
        assert isinstance(data["notifications"], list), "Notifications should be a list"


class TestStats:
    """Test GET /api/stats endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_stats_returns_data(self, auth_session):
        """Test /stats returns statistics"""
        response = auth_session.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify expected fields
        expected_fields = ["total_analyzed", "threats_blocked", "protection_rate", "risk_distribution"]
        for field in expected_fields:
            assert field in data, f"Missing '{field}' in response"
        
        # Verify risk_distribution structure
        risk_dist = data["risk_distribution"]
        for level in ["critical", "high", "medium", "low"]:
            assert level in risk_dist, f"Missing '{level}' in risk_distribution"


class TestAnalyze:
    """Test POST /api/analyze endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_analyze_sms_returns_response(self, auth_session):
        """Test analyzing SMS content returns proper response structure"""
        response = auth_session.post(
            f"{BASE_URL}/api/analyze",
            json={
                "content": "URGENTE: Su cuenta bancaria ha sido bloqueada. Haga clic aquí para verificar: http://banco-falso.com/verify",
                "content_type": "sms"
            },
            timeout=60  # AI analysis may take time
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify response structure (regardless of AI analysis result)
        expected_fields = ["id", "risk_level", "is_threat", "recommendation", "analysis"]
        for field in expected_fields:
            assert field in data, f"Missing '{field}' in response"
        
        # Note: AI analysis may fail due to LLM issues, but endpoint should still work
        # The is_threat and risk_level values depend on AI response
        print(f"Analysis result: is_threat={data['is_threat']}, risk_level={data['risk_level']}")
        print(f"Analysis: {data['analysis'][:100]}...")
    
    def test_analyze_safe_content(self, auth_session):
        """Test analyzing safe content"""
        response = auth_session.post(
            f"{BASE_URL}/api/analyze",
            json={
                "content": "Hola, ¿quedamos mañana para tomar un café?",
                "content_type": "sms"
            },
            timeout=60
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "id" in data, "Missing 'id' in response"
        assert "is_threat" in data, "Missing 'is_threat' in response"
        assert "risk_level" in data, "Missing 'risk_level' in response"
        
        # Note: AI may or may not correctly classify this
        print(f"Safe content analysis: is_threat={data['is_threat']}, risk_level={data['risk_level']}")


class TestMobileAppIntegration:
    """Integration tests simulating mobile app flow"""
    
    def test_full_login_flow(self):
        """Test complete login flow as mobile app would do"""
        session = requests.Session()
        
        # Step 1: Login
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        user_data = login_response.json()
        print(f"Logged in as: {user_data['email']}")
        
        # Step 2: Get user profile
        me_response = session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200, f"Get me failed: {me_response.text}"
        
        # Step 3: Get stats
        stats_response = session.get(f"{BASE_URL}/api/stats")
        assert stats_response.status_code == 200, f"Get stats failed: {stats_response.text}"
        
        # Step 4: Get threats
        threats_response = session.get(f"{BASE_URL}/api/threats?limit=10")
        assert threats_response.status_code == 200, f"Get threats failed: {threats_response.text}"
        
        # Step 5: Get notifications
        notif_response = session.get(f"{BASE_URL}/api/notifications")
        assert notif_response.status_code == 200, f"Get notifications failed: {notif_response.text}"
        
        print("Full mobile app login flow completed successfully!")
    
    def test_register_and_use_flow(self):
        """Test registration and immediate use flow"""
        session = requests.Session()
        unique_email = f"test_flow_{uuid.uuid4().hex[:8]}@test.com"
        
        # Step 1: Register
        register_response = session.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "name": "Flow Test User",
                "password": "FlowTest123!"
            }
        )
        assert register_response.status_code == 200, f"Register failed: {register_response.text}"
        
        # Step 2: Verify can access protected endpoints
        me_response = session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200, f"Get me after register failed: {me_response.text}"
        
        me_data = me_response.json()
        assert me_data["email"] == unique_email, "Email mismatch after registration"
        
        print(f"New user registered and authenticated: {unique_email}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
