"""
ManoProtect - Backend API Tests
Run with: pytest tests/ -v
"""
import pytest
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Test configuration
BASE_URL = os.environ.get("TEST_API_URL", "http://localhost:8001/api")
TEST_EMAIL = "test_pytest@manoprotectt.com"
TEST_PASSWORD = "TestPass123!"
ADMIN_EMAIL = "info@manoprotectt.com"
ADMIN_PASSWORD = "19862210Des"


@pytest.fixture
def client():
    """HTTP client fixture"""
    return httpx.Client(base_url=BASE_URL, timeout=30.0)


@pytest.fixture
def admin_cookies(client):
    """Get admin session cookies"""
    response = client.post("/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.cookies
    return None


class TestHealthEndpoints:
    """Test health and status endpoints"""
    
    def test_health_check(self, client):
        """Test /health endpoint returns healthy status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_plans_endpoint(self, client):
        """Test /plans returns available plans"""
        response = client.get("/plans")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) > 0


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_success(self, client):
        """Test successful login with admin credentials"""
        response = client.post("/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert data["email"] == ADMIN_EMAIL
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post("/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 404]
    
    def test_auth_me_without_session(self, client):
        """Test /auth/me without session returns error"""
        response = client.get("/auth/me")
        assert response.status_code in [401, 403]


class TestGeofencingEndpoints:
    """Test geofencing/safe zones endpoints"""
    
    def test_get_geofences_requires_auth(self, client):
        """Test /geofences requires authentication"""
        response = client.get("/geofences")
        assert response.status_code in [401, 403]
    
    def test_get_geofences_authenticated(self, client, admin_cookies):
        """Test /geofences with authentication"""
        if not admin_cookies:
            pytest.skip("Admin login failed")
        
        response = client.get("/geofences", cookies=admin_cookies)
        assert response.status_code == 200
        data = response.json()
        assert "geofences" in data
        assert "is_premium" in data
    
    def test_create_geofence(self, client, admin_cookies):
        """Test creating a geofence"""
        if not admin_cookies:
            pytest.skip("Admin login failed")
        
        response = client.post("/geofences", json={
            "name": "Test Zone",
            "zone_type": "custom",
            "latitude": 40.4168,
            "longitude": -3.7038,
            "radius": 200,
            "alert_on_entry": True,
            "alert_on_exit": True
        }, cookies=admin_cookies)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "geofence" in data


class TestChatEndpoints:
    """Test AI chat endpoints"""
    
    def test_chat_message(self, client):
        """Test sending a chat message"""
        response = client.post("/chat/message", json={
            "message": "¿Qué es ManoProtect?",
            "session_id": "pytest_session"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "response" in data
        assert len(data["response"]) > 0
    
    def test_quick_responses(self, client):
        """Test getting quick responses"""
        response = client.get("/chat/quick-responses")
        assert response.status_code == 200
        data = response.json()
        assert "responses" in data


class TestFamilyEndpoints:
    """Test family/SOS related endpoints"""
    
    def test_family_dashboard_requires_auth(self, client):
        """Test /family/dashboard requires authentication"""
        response = client.get("/family/dashboard")
        assert response.status_code in [401, 403]
    
    def test_family_children_authenticated(self, client, admin_cookies):
        """Test /family/children with authentication"""
        if not admin_cookies:
            pytest.skip("Admin login failed")
        
        response = client.get("/family/children", cookies=admin_cookies)
        assert response.status_code == 200
        data = response.json()
        assert "children" in data


class TestAdminEndpoints:
    """Test admin panel endpoints"""
    
    def test_admin_dashboard(self, client, admin_cookies):
        """Test admin dashboard access"""
        if not admin_cookies:
            pytest.skip("Admin login failed")
        
        response = client.get("/admin/dashboard", cookies=admin_cookies)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data or "users" in data
    
    def test_admin_users_list(self, client, admin_cookies):
        """Test getting users list"""
        if not admin_cookies:
            pytest.skip("Admin login failed")
        
        response = client.get("/admin/users", cookies=admin_cookies)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
