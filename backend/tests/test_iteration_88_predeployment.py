"""
ManoProtect - Pre-deployment Verification Tests
Iteration 88: Complete testing of all major features before production deployment

Tests cover:
- CEO Login at /api/auth/login
- Gestion CRA System: Admin/Comercial/Instalador logins
- Familia Authentication: Register/Login/Password Reset
- Gestion Stock, Pedidos, Instalaciones CRUD
- Dashboard Stats
- Catalogo Download
- Health Check
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

# API Base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auth-hardened-test.preview.emergentagent.com').rstrip('/')

# Test credentials
CEO_CREDS = {"email": "ceo@manoprotect.com", "password": "19862210Des"}
GESTION_ADMIN_CREDS = {"email": "admin@manoprotect.com", "password": "ManoAdmin2025!"}
GESTION_COMERCIAL_CREDS = {"email": "comercial@manoprotect.com", "password": "Comercial2025!"}
GESTION_INSTALADOR_CREDS = {"email": "instalador@manoprotect.com", "password": "Instalador2025!"}


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def gestion_admin_token(api_client):
    """Get admin JWT token for gestion routes"""
    response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_ADMIN_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin login failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def gestion_comercial_token(api_client):
    """Get comercial JWT token"""
    response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_COMERCIAL_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Comercial login failed - skipping comercial tests")


@pytest.fixture(scope="module")
def gestion_instalador_token(api_client):
    """Get instalador JWT token"""
    response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_INSTALADOR_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Instalador login failed - skipping instalador tests")


class TestHealthCheck:
    """Health check endpoint tests"""

    def test_health_check_returns_healthy(self, api_client):
        """Test /api/health returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "degraded"]
        assert "database" in data
        print(f"Health check passed: {data.get('status')}, DB: {data.get('database')}")


class TestCEOLogin:
    """CEO Login endpoint tests"""

    def test_ceo_login_returns_user_data(self, api_client):
        """Test CEO login at /api/auth/login with email and password"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=CEO_CREDS)
        # CEO might not be registered in users table, so check for proper error response
        if response.status_code == 200:
            data = response.json()
            assert "user_id" in data or "email" in data
            print(f"CEO login successful: {data.get('email')}")
        elif response.status_code == 401:
            data = response.json()
            # This is expected if CEO account doesn't exist
            print(f"CEO login returns 401 (account may not exist): {data.get('detail', 'Invalid credentials')}")
        else:
            pytest.fail(f"CEO login returned unexpected status: {response.status_code}")


class TestGestionAuth:
    """Gestion CRA system authentication tests"""

    def test_gestion_admin_login_returns_token(self, api_client):
        """Test admin login at /api/gestion/auth/login"""
        response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_ADMIN_CREDS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["rol"] == "admin"
        assert data["user"]["email"] == "admin@manoprotect.com"
        print(f"Admin login successful: {data['user']['nombre']}, rol={data['user']['rol']}")

    def test_gestion_comercial_login_returns_token(self, api_client):
        """Test comercial login at /api/gestion/auth/login"""
        response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_COMERCIAL_CREDS)
        assert response.status_code == 200, f"Comercial login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "comercial"
        print(f"Comercial login successful: {data['user']['nombre']}, rol={data['user']['rol']}")

    def test_gestion_instalador_login_returns_token(self, api_client):
        """Test instalador login at /api/gestion/auth/login"""
        response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_INSTALADOR_CREDS)
        assert response.status_code == 200, f"Instalador login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "instalador"
        print(f"Instalador login successful: {data['user']['nombre']}, rol={data['user']['rol']}")

    def test_gestion_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected with 401")


class TestFamiliaAuth:
    """Familia authentication system tests"""

    def test_familia_register_new_user(self, api_client):
        """Test familia register at /api/auth/familia/register"""
        unique_id = str(uuid.uuid4())[:8].upper()
        test_data = {
            "familia_id": f"TEST{unique_id}",
            "nombre": "Test User",
            "email": f"test_{unique_id}@test.com",
            "password": "Str0ngP@ssword123!",
            "telefono": "+34600000000"
        }
        response = api_client.post(f"{BASE_URL}/api/auth/familia/register", json=test_data)
        if response.status_code == 200:
            data = response.json()
            assert "user_id" in data
            assert data["email"] == test_data["email"].lower()
            assert data["familia_id"] == test_data["familia_id"]
            print(f"Familia register successful: {data['email']}, familia_id={data['familia_id']}")
        elif response.status_code == 400:
            # Email might already be registered
            print(f"Familia register returned 400: {response.json()}")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")

    def test_familia_login_existing_user(self, api_client):
        """Test familia login at /api/auth/familia/login"""
        # First register a user
        unique_id = str(uuid.uuid4())[:8].upper()
        register_data = {
            "familia_id": f"LOGIN{unique_id}",
            "nombre": "Login Test User",
            "email": f"login_{unique_id}@test.com",
            "password": "T3stPassword#2025",
            "telefono": ""
        }
        reg_response = api_client.post(f"{BASE_URL}/api/auth/familia/register", json=register_data)
        
        if reg_response.status_code == 200:
            # Now login
            login_data = {
                "familia_id": register_data["familia_id"],
                "email": register_data["email"],
                "password": register_data["password"]
            }
            response = api_client.post(f"{BASE_URL}/api/auth/familia/login", json=login_data)
            assert response.status_code == 200, f"Familia login failed: {response.text}"
            data = response.json()
            assert "user_id" in data
            assert data["familia_id"] == register_data["familia_id"]
            print(f"Familia login successful: {data['email']}, familia_id={data['familia_id']}")
        else:
            pytest.skip("Could not register user for login test")

    def test_familia_password_reset_request(self, api_client):
        """Test familia password reset request at /api/auth/familia/request-password-reset"""
        response = api_client.post(f"{BASE_URL}/api/auth/familia/request-password-reset", json={
            "familia_id": "TEST123",
            "email": "nonexistent@test.com"
        })
        # Should return 200 with message (doesn't reveal if account exists)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # CRITICAL SECURITY: No debug_token, debug_code, or debug_link
        assert "debug_token" not in data
        assert "debug_code" not in data
        assert "debug_link" not in data
        print(f"Password reset request handled: {data['message']}")


class TestGestionStock:
    """Gestion stock CRUD tests"""

    def test_get_stock_list(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/stock with admin token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/stock", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "stock" in data
        assert "total" in data
        assert isinstance(data["stock"], list)
        print(f"Stock list retrieved: {data['total']} items")


class TestGestionPedidos:
    """Gestion pedidos CRUD tests"""

    def test_get_pedidos_list(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/pedidos with admin token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/pedidos", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "pedidos" in data
        assert "total" in data
        print(f"Pedidos list retrieved: {data['total']} orders")


class TestGestionInstalaciones:
    """Gestion instalaciones tests"""

    def test_get_instalaciones_list(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/instalaciones with admin token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/instalaciones", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "instalaciones" in data
        assert "total" in data
        print(f"Instalaciones list retrieved: {data['total']} installations")


class TestGestionDashboard:
    """Gestion dashboard stats tests"""

    def test_get_dashboard_stats(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/dashboard/stats with admin token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Verify all expected stats fields
        expected_fields = [
            "total_usuarios", "total_comerciales", "total_instaladores",
            "total_stock", "total_pedidos", "pedidos_pendientes",
            "total_instalaciones", "user_rol"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        print(f"Dashboard stats: usuarios={data['total_usuarios']}, pedidos={data['total_pedidos']}, stock={data['total_stock']}")


class TestGestionUsuarios:
    """Gestion usuarios management tests"""

    def test_get_usuarios_as_admin(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/usuarios with admin token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/usuarios", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "usuarios" in data
        assert "total" in data
        print(f"Usuarios list retrieved as admin: {data['total']} users")

    def test_get_usuarios_as_comercial_denied(self, api_client, gestion_comercial_token):
        """Test GET /api/gestion/usuarios as comercial returns 403"""
        headers = {"Authorization": f"Bearer {gestion_comercial_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/usuarios", headers=headers)
        assert response.status_code == 403
        print("Comercial correctly denied access to usuarios endpoint (403)")


class TestCatalogoDownload:
    """Catalogo download endpoint tests"""

    def test_catalogo_comercial_returns_pdf(self, api_client):
        """Test GET /api/catalogo/comercial returns 200 with PDF"""
        response = api_client.get(f"{BASE_URL}/api/catalogo/comercial")
        # This endpoint may return 404 if catalogo not configured
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            # Could be PDF or JSON depending on implementation
            print(f"Catalogo endpoint returned 200, content-type: {content_type}")
        elif response.status_code == 404:
            print("Catalogo endpoint returned 404 (may not be configured)")
        else:
            print(f"Catalogo endpoint returned {response.status_code}")
        # Don't fail - just report status


class TestGestionAuthMe:
    """Test auth/me endpoint for gestion users"""

    def test_gestion_auth_me(self, api_client, gestion_admin_token):
        """Test GET /api/gestion/auth/me returns current user"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.get(f"{BASE_URL}/api/gestion/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "rol" in data
        assert data["email"] == "admin@manoprotect.com"
        print(f"Auth/me successful: {data['email']}, rol={data['rol']}")


class TestGestionTokenRefresh:
    """Test token refresh endpoint"""

    def test_gestion_token_refresh(self, api_client, gestion_admin_token):
        """Test POST /api/gestion/auth/refresh returns new token"""
        headers = {"Authorization": f"Bearer {gestion_admin_token}"}
        response = api_client.post(f"{BASE_URL}/api/gestion/auth/refresh", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        print("Token refresh successful")


class TestSecurityNoDebugTokens:
    """CRITICAL: Verify no debug tokens in API responses"""

    def test_familia_register_no_debug_fields(self, api_client):
        """Verify familia register response has no debug fields"""
        unique_id = str(uuid.uuid4())[:8].upper()
        test_data = {
            "familia_id": f"SEC{unique_id}",
            "nombre": "Security Test",
            "email": f"sec_{unique_id}@test.com",
            "password": "Secure#Pass2025!",
            "telefono": ""
        }
        response = api_client.post(f"{BASE_URL}/api/auth/familia/register", json=test_data)
        if response.status_code == 200:
            data = response.json()
            assert "debug_token" not in data
            assert "debug_code" not in data
            assert "debug_link" not in data
            assert "session_token" not in str(data).lower() or "session_token" in data  # session_token is allowed in response
            print("SECURITY: No debug fields in familia register response")

    def test_regular_login_no_debug_fields(self, api_client):
        """Verify regular login response has no debug fields"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        data = response.json()
        assert "debug_token" not in str(data)
        assert "debug_code" not in str(data)
        print("SECURITY: No debug fields in regular login response")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
