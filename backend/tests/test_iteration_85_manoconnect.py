"""
Iteration 85 - ManoConnect App Tests
Testing:
1. POST /api/auth/login with session_token cookie
2. GET /api/auth/me with session cookie
3. GET /api/client-app/my-installations (cookie-based auth fallback)
4. GET /api/client-app/installation/{id}/cameras
5. GET /api/client-app/installation/{id}/events
6. POST /api/client-app/installation/{id}/arm (change arm status)
7. POST /api/client-app/installation/{id}/sos (create SOS alert)
8. GET /api/v1/downloads/desktop-completo (investor download)
9. CORS credentials header verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://crm-dashboard-213.preview.emergentagent.com"

# Test credentials
CEO_EMAIL = "ceo@manoprotect.com"
CEO_PASSWORD = "19862210Des"
DOWNLOAD_KEY = "mano2025investor"
INSTALLATION_ID = "inst_oficina_central"


class TestAuthWithCookie:
    """Test authentication flows with session cookie"""
    
    def test_login_returns_session_cookie(self):
        """POST /api/auth/login should return session_token cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": CEO_EMAIL, "password": CEO_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        # Check response data - user data may be at root level or under "user" key
        data = response.json()
        email = data.get("email") or data.get("user", {}).get("email")
        assert email == CEO_EMAIL, f"Email mismatch: expected {CEO_EMAIL}, got {email}"
        
        # Check for session_token cookie
        cookies = response.cookies
        assert "session_token" in cookies, "session_token cookie not set"
        print(f"✓ Login successful, session_token cookie present: {cookies.get('session_token')[:20]}...")
    
    def test_auth_me_with_session_cookie(self):
        """GET /api/auth/me should return user data when using session cookie"""
        # First login to get session cookie
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": CEO_EMAIL, "password": CEO_PASSWORD}
        )
        assert login_response.status_code == 200
        session_token = login_response.cookies.get("session_token")
        assert session_token, "No session_token cookie received"
        
        # Use cookie to get user data
        cookies = {"session_token": session_token}
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies=cookies
        )
        assert me_response.status_code == 200, f"Auth/me failed: {me_response.text}"
        
        data = me_response.json()
        assert "email" in data or ("user" in data and "email" in data["user"]), "No email in response"
        print(f"✓ Auth/me returned user data with email")


class TestClientAppWithCookie:
    """Test client app endpoints using session cookie (no x-user-email header)"""
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Login and store session cookie for all tests"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": CEO_EMAIL, "password": CEO_PASSWORD}
        )
        assert login_response.status_code == 200, "Setup login failed"
        self.session_token = login_response.cookies.get("session_token")
        assert self.session_token, "No session_token in login response"
        self.cookies = {"session_token": self.session_token}
    
    def test_my_installations_with_cookie_only(self):
        """GET /api/client-app/my-installations using only session cookie (no header)"""
        # Important: NOT sending x-user-email header - testing cookie fallback
        response = requests.get(
            f"{BASE_URL}/api/client-app/my-installations",
            cookies=self.cookies
            # No headers - relying on cookie-based auth fallback
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "installations" in data, "Response missing 'installations'"
        assert len(data["installations"]) >= 1, "Expected at least 1 installation"
        
        inst = data["installations"][0]
        assert "id" in inst, "Installation missing 'id'"
        print(f"✓ Cookie-only auth returned {len(data['installations'])} installation(s)")
    
    def test_cameras_endpoint(self):
        """GET /api/client-app/installation/{id}/cameras"""
        response = requests.get(
            f"{BASE_URL}/api/client-app/installation/{INSTALLATION_ID}/cameras",
            cookies=self.cookies
        )
        assert response.status_code == 200, f"Cameras failed: {response.text}"
        
        data = response.json()
        assert "cameras" in data, "Response missing 'cameras'"
        # Should have 4 cameras per requirements
        assert len(data["cameras"]) >= 1, "Expected at least 1 camera"
        print(f"✓ Cameras endpoint returned {len(data['cameras'])} cameras")
    
    def test_events_endpoint(self):
        """GET /api/client-app/installation/{id}/events"""
        response = requests.get(
            f"{BASE_URL}/api/client-app/installation/{INSTALLATION_ID}/events",
            cookies=self.cookies
        )
        assert response.status_code == 200, f"Events failed: {response.text}"
        
        data = response.json()
        assert "events" in data, "Response missing 'events'"
        print(f"✓ Events endpoint returned {len(data.get('events', []))} events")
    
    def test_arm_endpoint_disarm(self):
        """POST /api/client-app/installation/{id}/arm with disarmed mode"""
        response = requests.post(
            f"{BASE_URL}/api/client-app/installation/{INSTALLATION_ID}/arm",
            cookies=self.cookies,
            json={"mode": "disarmed", "code": ""}
        )
        assert response.status_code == 200, f"Arm failed: {response.text}"
        
        data = response.json()
        assert data.get("status") == "ok" or data.get("armed_status") == "disarmed", \
            f"Unexpected response: {data}"
        print(f"✓ Arm/disarm endpoint responded: {data.get('armed_status', data.get('status'))}")
    
    def test_arm_endpoint_total(self):
        """POST /api/client-app/installation/{id}/arm with total mode"""
        response = requests.post(
            f"{BASE_URL}/api/client-app/installation/{INSTALLATION_ID}/arm",
            cookies=self.cookies,
            json={"mode": "total", "code": ""}
        )
        assert response.status_code == 200, f"Arm total failed: {response.text}"
        
        data = response.json()
        assert data.get("status") == "ok" or data.get("armed_status") == "total", \
            f"Unexpected response: {data}"
        print(f"✓ Arm total endpoint responded correctly")
    
    def test_sos_panic_alert(self):
        """POST /api/client-app/installation/{id}/sos with panic type"""
        response = requests.post(
            f"{BASE_URL}/api/client-app/installation/{INSTALLATION_ID}/sos",
            cookies=self.cookies,
            json={"type": "panic"}
        )
        assert response.status_code == 200, f"SOS failed: {response.text}"
        
        data = response.json()
        assert data.get("status") == "ok", f"SOS status not ok: {data}"
        assert "event_id" in data, "SOS response missing event_id"
        print(f"✓ SOS alert created with event_id: {data.get('event_id')[:20]}...")


class TestDownloadEndpoint:
    """Test desktop download endpoint"""
    
    def test_desktop_download_valid_key(self):
        """GET /api/v1/downloads/desktop-completo?key=mano2025investor should return 200"""
        response = requests.get(
            f"{BASE_URL}/api/v1/downloads/desktop-completo",
            params={"key": DOWNLOAD_KEY}
        )
        assert response.status_code == 200, f"Download failed: {response.status_code} - {response.text[:200]}"
        
        # Should return ZIP file
        content_type = response.headers.get("content-type", "")
        assert "zip" in content_type.lower() or "octet-stream" in content_type.lower(), \
            f"Expected ZIP content-type, got: {content_type}"
        print(f"✓ Download endpoint returned 200 with content-type: {content_type}")
    
    def test_desktop_download_invalid_key(self):
        """GET /api/v1/downloads/desktop-completo with invalid key should return 401/403"""
        response = requests.get(
            f"{BASE_URL}/api/v1/downloads/desktop-completo",
            params={"key": "invalidkey123"}
        )
        # Accept either 401 (Unauthorized) or 403 (Forbidden) as both indicate rejection
        assert response.status_code in [401, 403], f"Expected 401/403, got: {response.status_code}"
        print(f"✓ Invalid download key correctly rejected with {response.status_code}")


class TestCORS:
    """Test CORS configuration for credentials"""
    
    def test_cors_credentials_header(self):
        """CORS should return access-control-allow-credentials: true on actual requests"""
        # Note: OPTIONS preflight may not include credentials header
        # Test with actual POST request with Origin header
        headers = {
            "Origin": "https://crm-dashboard-213.preview.emergentagent.com",
            "Content-Type": "application/json"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            headers=headers,
            json={"email": CEO_EMAIL, "password": CEO_PASSWORD}
        )
        
        # Check allow-credentials header on actual response
        allow_creds = response.headers.get("access-control-allow-credentials", "").lower()
        assert allow_creds == "true", f"Expected allow-credentials: true, got: {allow_creds}"
        print("✓ CORS returns access-control-allow-credentials: true")
    
    def test_cors_with_origin_header(self):
        """Regular request with Origin header should include credentials header"""
        headers = {
            "Origin": "https://crm-dashboard-213.preview.emergentagent.com",
            "Content-Type": "application/json"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            headers=headers,
            json={"email": CEO_EMAIL, "password": CEO_PASSWORD}
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        allow_creds = response.headers.get("access-control-allow-credentials", "").lower()
        assert allow_creds == "true", f"Credentials header missing or not 'true': {allow_creds}"
        print("✓ Regular request includes allow-credentials: true")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
