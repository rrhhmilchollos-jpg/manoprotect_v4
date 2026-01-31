"""
ManoProtect Public API Tests
Tests all public endpoints without authentication
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicAPIs:
    """Test health and basic public endpoints"""
    
    def test_scam_stats_endpoint(self):
        """Test public scam statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/fraud/public/scam-stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_scams_blocked" in data
        assert "scams_today" in data
        assert "detection_rate" in data
        assert isinstance(data["total_scams_blocked"], int)
        assert isinstance(data["detection_rate"], (int, float))
    
    def test_plans_endpoint(self):
        """Test subscription plans endpoint"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        assert "individual_plans" in data
        assert "family_plans" in data
        assert len(data["individual_plans"]) > 0
        assert len(data["family_plans"]) > 0
        # Verify plan structure
        plan = data["individual_plans"][0]
        assert "id" in plan
        assert "name" in plan
        assert "price" in plan
    
    def test_community_alerts_endpoint(self):
        """Test community alerts endpoint"""
        response = requests.get(f"{BASE_URL}/api/community-alerts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            alert = data[0]
            assert "id" in alert
            assert "threat_type" in alert
            assert "description" in alert
            assert "severity" in alert


class TestStaticFiles:
    """Test static file downloads"""
    
    def test_android_zip_download(self):
        """Test Android project ZIP is downloadable"""
        response = requests.head(f"{BASE_URL}/ManoProtect-Android-Project.zip")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/zip"
        content_length = int(response.headers.get("content-length", 0))
        assert content_length > 1000000  # Should be > 1MB
    
    def test_ios_zip_download(self):
        """Test iOS project ZIP is downloadable"""
        response = requests.head(f"{BASE_URL}/ManoProtect-iOS-Project.zip")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/zip"
        content_length = int(response.headers.get("content-length", 0))
        assert content_length > 1000000  # Should be > 1MB
    
    def test_desktop_zip_download(self):
        """Test Desktop project ZIP is downloadable"""
        response = requests.head(f"{BASE_URL}/ManoProtect-Desktop-Windows.zip")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/zip"
        content_length = int(response.headers.get("content-length", 0))
        assert content_length > 1000000  # Should be > 1MB
    
    def test_manifest_json(self):
        """Test PWA manifest.json is valid"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "short_name" in data
        assert "icons" in data
        assert "start_url" in data
        assert "display" in data
        # Check orientation is present (PWA requirement)
        assert "orientation" in data
        assert data["orientation"] in ["portrait", "landscape", "any"]


class TestPublicPages:
    """Test that public pages return 200"""
    
    @pytest.mark.parametrize("path", [
        "/",
        "/how-it-works",
        "/pricing",
        "/knowledge",
        "/community",
        "/faq",
        "/verificar-estafa",
        "/login",
        "/registro",
        "/privacy-policy",
        "/terms-of-service",
        "/refund-policy",
        "/legal-notice",
        "/empleados/descargar",
        "/desarrolladores/descargas"
    ])
    def test_public_page_loads(self, path):
        """Test that public pages return 200 status"""
        response = requests.get(f"{BASE_URL}{path}")
        assert response.status_code == 200, f"Page {path} returned {response.status_code}"


class TestFraudVerification:
    """Test fraud verification public endpoint"""
    
    def test_verify_phone_number(self):
        """Test phone number verification"""
        response = requests.post(
            f"{BASE_URL}/api/fraud/public/verify",
            json={"type": "phone", "value": "+34612345678"}
        )
        # Should return 200 even for unknown numbers
        assert response.status_code == 200
        data = response.json()
        assert "risk_level" in data or "result" in data or "is_scam" in data
    
    def test_verify_email(self):
        """Test email verification"""
        response = requests.post(
            f"{BASE_URL}/api/fraud/public/verify",
            json={"type": "email", "value": "test@example.com"}
        )
        assert response.status_code == 200
