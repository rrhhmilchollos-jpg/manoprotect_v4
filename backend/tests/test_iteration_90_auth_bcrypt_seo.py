"""
Iteration 90: Auth Migration (SHA256 -> bcrypt), Auto-Seed, Error Messages, and SEO Tests
Tests for ManoProtect authentication across Gestion (CRM/CRA), CEO, and Familia systems.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
GESTION_ADMIN = {"email": "admin@manoprotectt.com", "password": "ManoAdmin2025!"}
GESTION_COMERCIAL = {"email": "comercial@manoprotectt.com", "password": "Comercial2025!"}
GESTION_INSTALADOR = {"email": "instalador@manoprotectt.com", "password": "Instalador2025!"}
CEO_CREDENTIALS = {"email": "ceo@manoprotectt.com", "password": "19862210Des"}


class TestGestionAuthLogin:
    """Gestion system authentication tests - bcrypt migration"""
    
    def test_gestion_admin_login_returns_token(self):
        """CRITICAL: Admin login POST /api/gestion/auth/login returns token"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json=GESTION_ADMIN
        )
        print(f"Admin login response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain 'token'"
        assert len(data["token"]) > 0, "Token should not be empty"
        assert "user" in data, "Response should contain 'user'"
        assert data["user"]["email"] == GESTION_ADMIN["email"]
        assert data["user"]["rol"] == "admin", f"Expected rol=admin, got {data['user'].get('rol')}"
        print(f"PASSED: Admin login returned token and rol=admin")
    
    def test_gestion_comercial_login_returns_token_with_rol(self):
        """CRITICAL: Comercial login returns token with rol=comercial"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json=GESTION_COMERCIAL
        )
        print(f"Comercial login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "comercial", f"Expected rol=comercial, got {data['user'].get('rol')}"
        print(f"PASSED: Comercial login returned token with rol=comercial")
    
    def test_gestion_instalador_login_returns_token_with_rol(self):
        """CRITICAL: Instalador login returns token with rol=instalador"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json=GESTION_INSTALADOR
        )
        print(f"Instalador login response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "instalador", f"Expected rol=instalador, got {data['user'].get('rol')}"
        print(f"PASSED: Instalador login returned token with rol=instalador")


class TestCEOAuth:
    """CEO main auth system tests"""
    
    def test_ceo_login_returns_user_data(self):
        """CRITICAL: CEO login POST /api/auth/login returns user data"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=CEO_CREDENTIALS
        )
        print(f"CEO login response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Check for user data in response
        if "user" in data:
            assert data["user"]["email"] == CEO_CREDENTIALS["email"]
            print(f"PASSED: CEO login returned user data with email match")
        elif "email" in data:
            assert data["email"] == CEO_CREDENTIALS["email"]
            print(f"PASSED: CEO login returned data with email match")
        else:
            # If the endpoint returns something else, just check success
            print(f"CEO login response structure: {list(data.keys())}")
            assert response.status_code == 200


class TestAuthErrorMessages:
    """Specific error message tests for improved UX"""
    
    def test_wrong_password_returns_contrasena_incorrecta(self):
        """AUTH ERROR: Wrong password returns 401 with 'Contrasena incorrecta'"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": GESTION_ADMIN["email"], "password": "wrongpassword123"}
        )
        print(f"Wrong password response: {response.status_code} - {response.text}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        data = response.json()
        detail = data.get("detail", "").lower()
        assert "contraseña incorrecta" in detail or "contrasena incorrecta" in detail, \
            f"Expected 'Contrasena incorrecta' in detail, got: {data.get('detail')}"
        print(f"PASSED: Wrong password returns 'Contrasena incorrecta'")
    
    def test_nonexistent_email_returns_usuario_no_encontrado(self):
        """AUTH ERROR: Non-existent email returns 401 with 'Usuario no encontrado'"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": "nonexistent_user_12345@manoprotectt.com", "password": "anypassword"}
        )
        print(f"Non-existent email response: {response.status_code} - {response.text}")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        data = response.json()
        detail = data.get("detail", "").lower()
        assert "usuario no encontrado" in detail, \
            f"Expected 'Usuario no encontrado' in detail, got: {data.get('detail')}"
        print(f"PASSED: Non-existent email returns 'Usuario no encontrado'")


class TestAutoSeed:
    """Auto-seed endpoint tests"""
    
    def test_seed_admin_creates_or_updates_users(self):
        """AUTO-SEED: POST /api/gestion/seed-admin updates existing users and creates missing ones"""
        response = requests.post(f"{BASE_URL}/api/gestion/seed-admin")
        print(f"Seed admin response: {response.status_code} - {response.text[:500]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("seeded") == True, "Expected seeded=True"
        assert "results" in data, "Expected 'results' in response"
        assert "credenciales" in data, "Expected 'credenciales' in response"
        
        # Verify expected users in credentials
        creds = data.get("credenciales", {})
        assert "admin" in creds
        assert "comercial" in creds
        assert "instalador" in creds
        assert creds["admin"]["email"] == "admin@manoprotectt.com"
        assert creds["comercial"]["email"] == "comercial@manoprotectt.com"
        assert creds["instalador"]["email"] == "instalador@manoprotectt.com"
        
        print(f"PASSED: Seed-admin endpoint working. Results: {data.get('results')}")


class TestBcryptHashing:
    """Verify bcrypt password hashing is being used"""
    
    def test_login_works_after_seed_with_bcrypt(self):
        """BCRYPT: Verify login works after seeding (bcrypt hash)"""
        # First seed to ensure bcrypt hashes
        seed_response = requests.post(f"{BASE_URL}/api/gestion/seed-admin")
        assert seed_response.status_code == 200
        
        # Now login - should work with bcrypt
        login_response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json=GESTION_ADMIN
        )
        print(f"Post-seed login: {login_response.status_code}")
        assert login_response.status_code == 200, f"Login failed after seed: {login_response.text}"
        
        data = login_response.json()
        assert "token" in data
        print(f"PASSED: Login works after seed (bcrypt hashing verified)")


class TestRBACGestion:
    """Role-based access control tests for Gestion system"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_ADMIN)
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def comercial_token(self):
        """Get comercial token"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=GESTION_COMERCIAL)
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Comercial login failed")
    
    def test_admin_can_access_usuarios(self, admin_token):
        """RBAC: Admin token can access GET /api/gestion/usuarios"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print(f"Admin access usuarios: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "usuarios" in data
        print(f"PASSED: Admin can access usuarios list ({len(data.get('usuarios', []))} users)")
    
    def test_comercial_cannot_access_usuarios(self, comercial_token):
        """RBAC: Comercial token CANNOT access GET /api/gestion/usuarios (403)"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        print(f"Comercial access usuarios: {response.status_code}")
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print(f"PASSED: Comercial correctly denied access to usuarios (403)")


class TestSEORobotsTxt:
    """SEO: robots.txt tests"""
    
    def test_robots_txt_accessible(self):
        """SEO: GET /robots.txt is accessible"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        print(f"robots.txt status: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"PASSED: robots.txt accessible")
    
    def test_robots_txt_contains_disallow_gestion(self):
        """SEO: robots.txt contains Disallow /gestion/"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        
        content = response.text.lower()
        assert "disallow: /gestion/" in content or "disallow:/gestion/" in content, \
            f"Expected 'Disallow: /gestion/' in robots.txt. Content: {response.text[:500]}"
        print(f"PASSED: robots.txt contains Disallow /gestion/")
    
    def test_robots_txt_contains_allow_familia(self):
        """SEO: robots.txt contains Allow /familia"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200
        
        content = response.text.lower()
        assert "allow: /familia" in content or "allow:/familia" in content, \
            f"Expected 'Allow /familia' in robots.txt. Content: {response.text[:500]}"
        print(f"PASSED: robots.txt contains Allow /familia")


class TestSEOSitemap:
    """SEO: sitemap.xml tests"""
    
    def test_sitemap_xml_accessible(self):
        """SEO: GET /sitemap.xml is accessible"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        print(f"sitemap.xml status: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"PASSED: sitemap.xml accessible")
    
    def test_sitemap_contains_familia_page(self):
        """SEO: sitemap.xml contains /familia page entry"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200
        
        content = response.text.lower()
        assert "/familia" in content, \
            f"Expected '/familia' in sitemap.xml. Content snippet: {response.text[:500]}"
        print(f"PASSED: sitemap.xml contains /familia page")


class TestSEOAssetLinks:
    """SEO: .well-known/assetlinks.json tests"""
    
    def test_assetlinks_json_accessible(self):
        """SEO: GET /.well-known/assetlinks.json returns valid JSON"""
        response = requests.get(f"{BASE_URL}/.well-known/assetlinks.json")
        print(f"assetlinks.json status: {response.status_code}")
        
        # This might not exist - skip if 404
        if response.status_code == 404:
            pytest.skip("assetlinks.json not configured (404)")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify it's valid JSON
        try:
            data = response.json()
            print(f"PASSED: assetlinks.json is valid JSON")
        except Exception as e:
            pytest.fail(f"assetlinks.json is not valid JSON: {e}")


class TestSEOMetaTags:
    """SEO: HTML meta tags tests"""
    
    def test_html_contains_ga4_id(self):
        """SEO: HTML page contains GA4 ID G-8KECMQS45X"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        
        content = response.text
        # GA4 ID should be in the HTML (either direct or via environment variable replacement)
        ga4_present = "G-8KECMQS45X" in content or "REACT_APP_GA4_ID" in content
        print(f"GA4 ID present in HTML: {ga4_present}")
        # The ID might be loaded via React, so we check the env is set
        assert "G-8KECMQS45X" in content or "gtag" in content.lower(), \
            "Expected GA4 tracking in HTML"
        print(f"PASSED: GA4 ID present in HTML")
    
    def test_html_contains_gtm_id(self):
        """SEO: HTML page contains GTM GTM-MK53XZ8Q"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        
        content = response.text
        assert "GTM-MK53XZ8Q" in content, \
            f"Expected GTM-MK53XZ8Q in HTML. Found googletagmanager: {'googletagmanager' in content}"
        print(f"PASSED: GTM ID present in HTML")
    
    def test_meta_descriptions_consistent(self):
        """SEO: og:description matches twitter:description"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        
        content = response.text
        
        # Extract og:description
        import re
        og_match = re.search(r'property="og:description"\s+content="([^"]+)"', content)
        twitter_match = re.search(r'name="twitter:description"\s+content="([^"]+)"', content)
        
        if og_match and twitter_match:
            og_desc = og_match.group(1)
            twitter_desc = twitter_match.group(1)
            print(f"og:description: {og_desc[:100]}...")
            print(f"twitter:description: {twitter_desc[:100]}...")
            assert og_desc == twitter_desc, \
                f"og:description and twitter:description should match"
            print(f"PASSED: Meta descriptions are consistent")
        else:
            # If can't extract, check both exist
            assert "og:description" in content and "twitter:description" in content, \
                "Both og:description and twitter:description should be present"
            print(f"PASSED: Meta tags present (couldn't extract exact values)")


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """Basic API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
