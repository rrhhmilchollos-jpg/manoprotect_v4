"""
ManoProtect Deploy Readiness Tests - Iteration 29
Tests: Admin services-status, SOS alerts, SEO files, AdMob integration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://protect-staging-1.preview.emergentagent.com').rstrip('/')

class TestSEOFiles:
    """Test SEO and AdMob configuration files"""
    
    def test_app_ads_txt_accessible(self):
        """Verify app-ads.txt is accessible and contains correct AdMob publisher ID"""
        response = requests.get(f"{BASE_URL}/app-ads.txt")
        assert response.status_code == 200, f"app-ads.txt not accessible: {response.status_code}"
        
        content = response.text
        assert "pub-7713974112203810" in content, "AdMob publisher ID not found in app-ads.txt"
        assert "google.com" in content, "google.com not found in app-ads.txt"
        assert "DIRECT" in content, "DIRECT not found in app-ads.txt"
        print(f"✅ app-ads.txt content: {content.strip()}")
    
    def test_sitemap_xml_accessible(self):
        """Verify sitemap.xml is accessible and contains ManoProtect URLs"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200, f"sitemap.xml not accessible: {response.status_code}"
        
        content = response.text
        assert "manoprotect.com" in content, "manoprotect.com not found in sitemap.xml"
        assert "urlset" in content, "urlset not found in sitemap.xml"
        assert "verificar-estafa" in content, "verificar-estafa page not in sitemap"
        assert "privacy-policy" in content, "privacy-policy page not in sitemap"
        print("✅ sitemap.xml contains ManoProtect URLs")
    
    def test_robots_txt_accessible(self):
        """Verify robots.txt is accessible and has correct SEO rules"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"robots.txt not accessible: {response.status_code}"
        
        content = response.text
        assert "User-agent:" in content, "User-agent directive not found"
        assert "Allow: /" in content, "Allow directive not found"
        assert "Sitemap:" in content, "Sitemap directive not found"
        assert "manoprotect.com/sitemap.xml" in content, "Sitemap URL not correct"
        assert "Disallow: /api/" in content, "API should be disallowed"
        print("✅ robots.txt has correct SEO rules")


class TestHealthAndServices:
    """Test health check and services status"""
    
    def test_health_endpoint(self):
        """Verify health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy", f"Health status not healthy: {data}"
        assert data["database"] == "healthy", f"Database not healthy: {data}"
        print(f"✅ Health check passed: {data['status']}")
    
    def test_admin_services_status_requires_auth(self):
        """Verify admin services-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/services-status")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Admin services-status requires authentication")


class TestAuthenticatedAdmin:
    """Test admin endpoints with authentication"""
    
    @pytest.fixture
    def admin_session(self):
        """Login as superadmin and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "info@manoprotect.com",
                "password": "19862210Des"
            }
        )
        assert login_response.status_code == 200, f"Admin login failed: {login_response.text}"
        return session
    
    def test_admin_services_status(self, admin_session):
        """Test admin services-status endpoint returns service statuses"""
        response = admin_session.get(f"{BASE_URL}/api/admin/services-status")
        assert response.status_code == 200, f"Services status failed: {response.text}"
        
        data = response.json()
        assert "services" in data, "services key not in response"
        assert "overall_status" in data, "overall_status key not in response"
        
        services = data["services"]
        assert "infobip" in services, "infobip not in services"
        assert "firebase" in services, "firebase not in services"
        assert "stripe" in services, "stripe not in services"
        assert "mongodb" in services, "mongodb not in services"
        
        # Check each service has required fields
        for service_name, service_data in services.items():
            assert "status" in service_data, f"{service_name} missing status"
            assert "configured" in service_data, f"{service_name} missing configured"
            assert "message" in service_data, f"{service_name} missing message"
        
        print(f"✅ Services status: {data['overall_status']}")
        for name, svc in services.items():
            print(f"   - {name}: {svc['status']} - {svc['message'][:50]}...")
        
        # MongoDB should always be OK
        assert services["mongodb"]["status"] == "ok", "MongoDB should be healthy"
        
        return data


class TestSOSAlert:
    """Test SOS alert functionality"""
    
    @pytest.fixture
    def user_session(self):
        """Login as superadmin and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "info@manoprotect.com",
                "password": "19862210Des"
            }
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        return session
    
    def test_sos_alert_endpoint_exists(self, user_session):
        """Verify SOS alert endpoint exists and responds"""
        response = user_session.post(
            f"{BASE_URL}/api/sos/alert",
            json={
                "latitude": 40.4168,
                "longitude": -3.7038,
                "message": "Test SOS alert from deploy readiness test"
            }
        )
        # Should return 200 (success) or 400 (no contacts) - both are valid
        assert response.status_code in [200, 400], f"SOS alert failed: {response.status_code} - {response.text}"
        
        data = response.json()
        if response.status_code == 200:
            assert "success" in data or "alert_id" in data, f"Unexpected response: {data}"
            print(f"✅ SOS alert sent successfully: {data}")
        else:
            print(f"✅ SOS alert endpoint working (no contacts configured): {data}")
    
    def test_contacts_endpoint(self, user_session):
        """Verify contacts endpoint works"""
        response = user_session.get(f"{BASE_URL}/api/contacts")
        assert response.status_code == 200, f"Contacts endpoint failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Contacts should return a list"
        print(f"✅ Contacts endpoint working, found {len(data)} contacts")


class TestFrontendPages:
    """Test frontend pages load correctly"""
    
    def test_homepage_loads(self):
        """Verify homepage loads"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200, f"Homepage failed: {response.status_code}"
        assert "ManoProtect" in response.text, "ManoProtect not found in homepage"
        print("✅ Homepage loads correctly")
    
    def test_index_html_has_adsense_meta(self):
        """Verify index.html has google-adsense-account meta tag"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        
        # Check for AdSense meta tag
        assert 'google-adsense-account' in response.text, "google-adsense-account meta tag not found"
        assert 'pub-7713974112203810' in response.text, "AdMob publisher ID not in index.html"
        print("✅ index.html has google-adsense-account meta tag with correct publisher ID")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
