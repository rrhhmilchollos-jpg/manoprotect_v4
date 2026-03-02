"""
ManoProtect - Iteration 32 Backend Tests
Testing: Health, Auth, Enterprise Dashboard, Employee Portal
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://escudo-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "info@manoprotect.com"
ADMIN_PASSWORD = "19862210Des"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_healthy(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "manoprotect-api"
        assert data["database"] == "healthy"
        assert "timestamp" in data
        print(f"✅ Health check passed: {data['status']}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Login returns user data directly with email field
        assert data.get("email") == ADMIN_EMAIL
        print(f"✅ Login successful for {ADMIN_EMAIL}")
        return response.cookies
    
    def test_login_with_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code in [401, 400]
        print("✅ Invalid credentials correctly rejected")
    
    def test_get_current_user_without_auth(self):
        """Test /api/auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ Unauthenticated request correctly rejected")
    
    def test_get_current_user_with_auth(self):
        """Test /api/auth/me with valid session"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        
        # Get user info with session cookie
        session = requests.Session()
        session.cookies.update(login_response.cookies)
        
        me_response = session.get(f"{BASE_URL}/api/auth/me")
        assert me_response.status_code == 200
        
        data = me_response.json()
        assert data.get("email") == ADMIN_EMAIL
        print(f"✅ Current user retrieved: {data.get('email')}")


class TestEnterpriseDashboard:
    """Enterprise dashboard endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        yield
    
    def test_enterprise_dashboard_requires_auth(self):
        """Test enterprise dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 401
        print("✅ Enterprise dashboard correctly requires auth")
    
    def test_enterprise_dashboard_with_auth(self):
        """Test enterprise dashboard returns data"""
        response = self.session.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "summary" in data
        assert "risk_distribution" in data
        assert "threat_types" in data
        assert "trend_data" in data
        assert "departments" in data
        print(f"✅ Enterprise dashboard loaded: {data['summary'].get('total_analyzed', 0)} threats analyzed")
    
    def test_enterprise_reports_endpoint(self):
        """Test enterprise reports endpoint"""
        response = self.session.get(f"{BASE_URL}/api/enterprise/reports?period=month")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("period") == "month"
        assert "total_threats" in data
        assert "by_type" in data
        assert "by_risk" in data
        print(f"✅ Enterprise reports loaded for period: {data['period']}")


class TestEmployeePortal:
    """Employee portal endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        yield
    
    def test_employee_connect(self):
        """Test employee connection endpoint"""
        response = self.session.post(
            f"{BASE_URL}/api/employees/connect",
            json={
                "employee_id": "test_employee_123",
                "device_info": "Desktop Web",
                "app_version": "2.0.0"
            }
        )
        # Should succeed or return appropriate error
        assert response.status_code in [200, 201, 400, 422]
        print(f"✅ Employee connect endpoint responded: {response.status_code}")
    
    def test_get_connected_employees(self):
        """Test getting connected employees list"""
        response = self.session.get(f"{BASE_URL}/api/employees/connected")
        assert response.status_code == 200
        
        data = response.json()
        assert "employees" in data
        print(f"✅ Connected employees: {len(data.get('employees', []))}")
    
    def test_get_unread_messages(self):
        """Test getting unread message count"""
        response = self.session.get(f"{BASE_URL}/api/employees/messages/unread")
        assert response.status_code == 200
        
        data = response.json()
        assert "unread_count" in data
        print(f"✅ Unread messages: {data.get('unread_count', 0)}")


class TestChatEndpoints:
    """AI Chat widget endpoint tests"""
    
    def test_chat_message_endpoint(self):
        """Test AI chat message endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            json={
                "message": "¿Cómo funciona el SOS?",
                "session_id": None
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert "response" in data
        assert "session_id" in data
        print(f"✅ AI Chat responded: {data.get('response', '')[:50]}...")


class TestCommunityAlerts:
    """Community alerts endpoint tests"""
    
    def test_get_community_alerts(self):
        """Test getting community alerts"""
        response = requests.get(f"{BASE_URL}/api/community-alerts")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Community alerts: {len(data)} alerts")


class TestPlansEndpoint:
    """Plans endpoint tests"""
    
    def test_get_available_plans(self):
        """Test getting available subscription plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        
        data = response.json()
        assert "individual_plans" in data
        assert "family_plans" in data
        assert "business_plans" in data
        assert data.get("currency") == "EUR"
        print(f"✅ Plans loaded: {len(data.get('individual_plans', []))} individual, {len(data.get('family_plans', []))} family")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
