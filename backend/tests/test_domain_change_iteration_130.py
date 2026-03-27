"""
Test Suite for Domain Change from manoprotect.com to manoprotectt.com
Iteration 130 - Testing domain migration and management login
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health check tests"""
    
    def test_health_endpoint_returns_healthy(self):
        """Test that health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        print(f"PASSED: Health endpoint returns healthy - {data}")


class TestDomainChangeInSEOFiles:
    """Tests to verify domain change in SEO files"""
    
    def test_sitemap_has_manoprotectt_domain(self):
        """Test that sitemap.xml uses manoprotectt.com domain"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        content = response.text
        assert "manoprotectt.com" in content, "Sitemap should contain manoprotectt.com"
        assert "manoprotect.com" not in content or "manoprotectt.com" in content, "Sitemap should use new domain"
        print(f"PASSED: Sitemap contains manoprotectt.com domain")
    
    def test_robots_txt_has_manoprotectt_sitemap(self):
        """Test that robots.txt references manoprotectt.com sitemap"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        content = response.text
        assert "manoprotectt.com/sitemap.xml" in content, "Robots.txt should reference manoprotectt.com sitemap"
        print(f"PASSED: Robots.txt references manoprotectt.com sitemap")


class TestGestionAuthLogin:
    """Tests for management portal authentication with new domain emails"""
    
    def test_admin_login_with_new_domain_email(self):
        """Test admin login with admin@manoprotectt.com"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={
                "email": "admin@manoprotectt.com",
                "password": "ManoAdmin2025!"
            }
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == "admin@manoprotectt.com"
        assert data["user"]["rol"] == "admin"
        print(f"PASSED: Admin login successful with manoprotectt.com email")
    
    def test_comercial_login_with_new_domain_email(self):
        """Test comercial login with comercial@manoprotectt.com"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={
                "email": "comercial@manoprotectt.com",
                "password": "Comercial2025!"
            }
        )
        assert response.status_code == 200, f"Comercial login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == "comercial@manoprotectt.com"
        assert data["user"]["rol"] == "comercial"
        print(f"PASSED: Comercial login successful with manoprotectt.com email")
    
    def test_instalador_login_with_new_domain_email(self):
        """Test instalador login with instalador@manoprotectt.com"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={
                "email": "instalador@manoprotectt.com",
                "password": "Instalador2025!"
            }
        )
        assert response.status_code == 200, f"Instalador login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == "instalador@manoprotectt.com"
        assert data["user"]["rol"] == "instalador"
        print(f"PASSED: Instalador login successful with manoprotectt.com email")
    
    def test_invalid_login_returns_error(self):
        """Test that invalid credentials return error"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={
                "email": "invalid@manoprotectt.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code in [401, 400], f"Invalid login should fail: {response.status_code}"
        print(f"PASSED: Invalid login correctly returns error")


class TestDesktopAppsConfiguration:
    """Tests to verify desktop apps point to correct domain (file-based verification)"""
    
    def test_cra_operador_main_js_has_correct_domain(self):
        """Verify CRA Operador main.js has manoprotectt.com"""
        main_js_path = "/app/desktop-apps/cra-operador/main.js"
        with open(main_js_path, 'r') as f:
            content = f.read()
        assert "https://manoprotectt.com" in content, "CRA main.js should have manoprotectt.com"
        assert "PRODUCTION_URL = 'https://manoprotectt.com'" in content, "PRODUCTION_URL should be manoprotectt.com"
        print(f"PASSED: CRA Operador main.js has correct manoprotectt.com domain")
    
    def test_crm_ventas_main_js_has_correct_domain(self):
        """Verify CRM Ventas main.js has manoprotectt.com"""
        main_js_path = "/app/desktop-apps/crm-ventas/main.js"
        with open(main_js_path, 'r') as f:
            content = f.read()
        assert "https://manoprotectt.com" in content, "CRM main.js should have manoprotectt.com"
        assert "PRODUCTION_URL = 'https://manoprotectt.com'" in content, "PRODUCTION_URL should be manoprotectt.com"
        print(f"PASSED: CRM Ventas main.js has correct manoprotectt.com domain")


class TestIndexHtmlSEO:
    """Tests to verify index.html has correct domain in SEO tags"""
    
    def test_index_html_canonical_url(self):
        """Verify index.html has manoprotectt.com in canonical URL"""
        index_path = "/app/frontend/public/index.html"
        with open(index_path, 'r') as f:
            content = f.read()
        assert 'href="https://manoprotectt.com"' in content, "Canonical URL should be manoprotectt.com"
        print(f"PASSED: index.html has correct canonical URL")
    
    def test_index_html_og_url(self):
        """Verify index.html has manoprotectt.com in og:url"""
        index_path = "/app/frontend/public/index.html"
        with open(index_path, 'r') as f:
            content = f.read()
        assert 'content="https://manoprotectt.com/' in content, "og:url should be manoprotectt.com"
        print(f"PASSED: index.html has correct og:url")
    
    def test_index_html_schema_org_urls(self):
        """Verify index.html has manoprotectt.com in schema.org structured data"""
        index_path = "/app/frontend/public/index.html"
        with open(index_path, 'r') as f:
            content = f.read()
        # Check for schema.org Organization URL
        assert '"url": "https://manoprotectt.com"' in content, "Schema.org should have manoprotectt.com URL"
        print(f"PASSED: index.html has correct schema.org URLs")


class TestWebsocketManagerCORS:
    """Tests to verify websocket manager has correct CORS origins"""
    
    def test_websocket_manager_has_manoprotectt_cors(self):
        """Verify websocket_manager.py has manoprotectt.com in CORS origins"""
        ws_path = "/app/backend/services/websocket_manager.py"
        with open(ws_path, 'r') as f:
            content = f.read()
        assert "manoprotectt.com" in content, "WebSocket manager should have manoprotectt.com in CORS"
        assert "https://manoprotectt.com" in content, "WebSocket manager should have https://manoprotectt.com"
        print(f"PASSED: WebSocket manager has correct manoprotectt.com CORS origins")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
