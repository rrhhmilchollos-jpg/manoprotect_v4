"""
ManoProtect - Gestion Auth & Service Worker Tests
Tests for bcrypt auth hardening and service worker v5 SPA app-shell pattern
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auth-hardened-test.preview.emergentagent.com').rstrip('/')

class TestGestionAuth:
    """Test management login endpoints with bcrypt auth"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "admin@manoprotect.com",
            "password": "ManoAdmin2025!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@manoprotect.com"
        assert data["user"]["rol"] == "admin"
        assert data["user"]["nombre"] == "Administrador ManoProtect"
        assert len(data["token"]) > 0
        print(f"Admin login successful: {data['user']['nombre']}")
    
    def test_comercial_login_success(self):
        """Test comercial login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "comercial@manoprotect.com",
            "password": "Comercial2025!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "comercial"
        assert data["user"]["email"] == "comercial@manoprotect.com"
        print(f"Comercial login successful: {data['user']['nombre']}")
    
    def test_instalador_login_success(self):
        """Test instalador login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "instalador@manoprotect.com",
            "password": "Instalador2025!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "instalador"
        assert data["user"]["email"] == "instalador@manoprotect.com"
        print(f"Instalador login successful: {data['user']['nombre']}")
    
    def test_wrong_password_returns_error(self):
        """Test that wrong password returns 401 error"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "admin@manoprotect.com",
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Contraseña incorrecta"
        print("Wrong password correctly rejected")
    
    def test_nonexistent_user_returns_error(self):
        """Test that non-existent user returns 401 error"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "nonexistent@manoprotect.com",
            "password": "AnyPassword123!"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("Non-existent user correctly rejected")


class TestCEOAuth:
    """Test CEO main auth login"""
    
    def test_ceo_login_success(self):
        """Test CEO login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "ceo@manoprotect.com",
            "password": "19862210Des"
        })
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert data["email"] == "ceo@manoprotect.com"
        assert data["role"] == "admin"
        print(f"CEO login successful: {data['name']}")


class TestServiceWorker:
    """Test service worker v5 with SPA app-shell pattern"""
    
    def test_sw_returns_v5(self):
        """Test that /sw.js returns version 5.0"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        assert "Version 5.0" in content or "CACHE_VERSION = 'v5'" in content
        print("Service worker v5 confirmed")
    
    def test_sw_contains_spa_app_shell_pattern(self):
        """Test that sw.js contains app shell fallback logic"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        # Check for SPA app-shell pattern logic
        assert "app shell" in content.lower() or "handleNavigationRequest" in content
        assert "/index.html" in content
        # The key pattern: serving cached index.html for navigation requests when offline
        assert "caches.match('/index.html')" in content or "caches.match('/')" in content
        print("SPA app-shell pattern confirmed in service worker")
    
    def test_sw_precaches_index_html(self):
        """Test that sw.js precaches index.html for offline use"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        # Check for precache of app shell assets
        assert "'/index.html'" in content or '"/index.html"' in content
        assert "PRECACHE_ASSETS" in content
        print("index.html precaching confirmed")


class TestOfflinePage:
    """Test offline fallback page"""
    
    def test_offline_html_exists(self):
        """Test that offline.html is accessible"""
        response = requests.get(f"{BASE_URL}/offline.html")
        assert response.status_code == 200
        content = response.text
        assert "<!DOCTYPE html>" in content
        assert "Sin conexión" in content
        print("offline.html page exists and is valid")
    
    def test_offline_html_has_retry_button(self):
        """Test that offline.html has retry functionality"""
        response = requests.get(f"{BASE_URL}/offline.html")
        assert response.status_code == 200
        content = response.text
        assert "Reintentar" in content
        assert "location.reload()" in content
        print("offline.html has retry functionality")


class TestAPIHealth:
    """Test API health endpoints"""
    
    def test_health_endpoint(self):
        """Test API health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"API health: {data['status']}")


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
        "email": "admin@manoprotect.com",
        "password": "ManoAdmin2025!"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin authentication failed - skipping authenticated tests")
