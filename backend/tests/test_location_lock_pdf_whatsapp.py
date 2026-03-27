"""
Test Location Lock, Heartbeat, PDF Generation and WhatsApp Share - ManoProtect
New features iteration_57:
- POST /api/location/lock - Lock location settings
- GET /api/location/status - Get lock status
- POST /api/admin/unlock-location - Admin unlock with DNI verification
- POST /api/family/location/update - Heartbeat location update
- GET /api/family/member/{id}/location - Get member's last location
- GET /api/documents/welcome-pdf - Generate welcome PDF
- GET /api/documents/setup-complete-pdf - Generate setup complete PDF
- GET /api/documents/whatsapp-share/{doc_type} - Get WhatsApp share link
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "ceo@manoprotectt.com"
ADMIN_PASSWORD = "19862210Des"

class TestLocationLockFeatures:
    """Test suite for parental location lock system"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login as admin and get session token"""
        self.session = requests.Session()
        
        # Login as admin
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.user_data = login_response.json()
        self.user_id = self.user_data.get("user_id")
    
    def test_01_location_status_endpoint(self):
        """GET /api/location/status - Check current lock status"""
        response = self.session.get(f"{BASE_URL}/api/location/status")
        
        assert response.status_code == 200, f"Status check failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "locked" in data, "Missing 'locked' field"
        assert "setup_completed" in data, "Missing 'setup_completed' field"
        assert "tracking_active" in data, "Missing 'tracking_active' field"
        
        print(f"Location status: locked={data['locked']}, setup_completed={data['setup_completed']}")
    
    def test_02_location_lock_endpoint(self):
        """POST /api/location/lock - Lock location settings"""
        response = self.session.post(
            f"{BASE_URL}/api/location/lock",
            json={}
        )
        
        assert response.status_code == 200, f"Lock failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Lock should succeed"
        assert "locked_at" in data, "Missing locked_at timestamp"
        assert "message" in data, "Missing confirmation message"
        
        print(f"Lock response: {data['message']}")
    
    def test_03_location_status_after_lock(self):
        """GET /api/location/status - Verify locked status after locking"""
        # First lock
        self.session.post(f"{BASE_URL}/api/location/lock", json={})
        
        # Then check status
        response = self.session.get(f"{BASE_URL}/api/location/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("locked") == True, "Location should be locked after lock call"
        assert data.get("setup_completed") == True, "Setup should be marked as completed"
        
        print("Location is now LOCKED - verified")
    
    def test_04_admin_unlock_requires_dni(self):
        """POST /api/admin/unlock-location - Should fail without DNI verification"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/unlock-location",
            json={
                "target_user_id": self.user_id,
                "dni_verified": False,  # Not verified
                "reason": "Test unlock attempt"
            }
        )
        
        # Should fail with 400 - DNI not verified
        assert response.status_code == 400, f"Should require DNI: {response.text}"
        data = response.json()
        assert "DNI" in data.get("detail", "").upper() or "dni" in data.get("detail", "").lower()
        
        print("Correctly requires DNI verification for unlock")
    
    def test_05_admin_unlock_requires_reason(self):
        """POST /api/admin/unlock-location - Should fail without reason"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/unlock-location",
            json={
                "target_user_id": self.user_id,
                "dni_verified": True,
                "reason": ""  # Empty reason
            }
        )
        
        # Should fail with 400 - no reason
        assert response.status_code == 400, f"Should require reason: {response.text}"
        
        print("Correctly requires reason for unlock")
    
    def test_06_admin_unlock_success(self):
        """POST /api/admin/unlock-location - Admin can unlock with proper params"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/unlock-location",
            json={
                "target_user_id": self.user_id,
                "dni_verified": True,
                "reason": "Testing unlock functionality - authorized by admin"
            }
        )
        
        assert response.status_code == 200, f"Admin unlock failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True
        assert "unlocked_at" in data
        
        print("Admin successfully unlocked location with DNI verification")


class TestHeartbeatLocation:
    """Test suite for heartbeat location tracking"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login as admin"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        self.user_data = login_response.json()
        self.user_id = self.user_data.get("user_id")
    
    def test_01_location_update_heartbeat(self):
        """POST /api/family/location/update - Receive location heartbeat"""
        # Simulate GPS heartbeat
        response = self.session.post(
            f"{BASE_URL}/api/family/location/update",
            json={
                "latitude": 40.4168,
                "longitude": -3.7038,
                "accuracy": 10.5,
                "altitude": 650.0,
                "speed": 0.0,
                "bearing": 0.0,
                "isBackground": True
            }
        )
        
        assert response.status_code == 200, f"Location update failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Location update should succeed"
        print("Heartbeat location update successful (Madrid coordinates)")
    
    def test_02_get_member_location(self):
        """GET /api/family/member/{id}/location - Get last known location"""
        # First update location
        self.session.post(
            f"{BASE_URL}/api/family/location/update",
            json={
                "latitude": 41.3851,
                "longitude": 2.1734,
                "accuracy": 5.0,
                "isBackground": False
            }
        )
        
        # Then get the location
        response = self.session.get(f"{BASE_URL}/api/family/member/{self.user_id}/location")
        
        assert response.status_code == 200, f"Get location failed: {response.text}"
        data = response.json()
        
        if data.get("found"):
            assert "latitude" in data, "Missing latitude"
            assert "longitude" in data, "Missing longitude"
            assert "maps_url" in data, "Missing Google Maps URL"
            print(f"Last location: {data.get('latitude')}, {data.get('longitude')}")
            print(f"Maps URL: {data.get('maps_url')}")
        else:
            print("No location available yet")
    
    def test_03_location_with_invalid_user(self):
        """GET /api/family/member/{id}/location - 404 for non-existent user"""
        response = self.session.get(f"{BASE_URL}/api/family/member/invalid-user-id-12345/location")
        
        assert response.status_code == 404, f"Should return 404: {response.text}"
        print("Correctly returns 404 for non-existent user")


class TestPDFGeneration:
    """Test suite for PDF document generation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login as admin"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
    
    def test_01_welcome_pdf_generation(self):
        """GET /api/documents/welcome-pdf - Generate welcome PDF"""
        response = self.session.get(f"{BASE_URL}/api/documents/welcome-pdf")
        
        assert response.status_code == 200, f"PDF generation failed: {response.text}"
        
        # Check content type is PDF
        content_type = response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type, f"Expected PDF, got: {content_type}"
        
        # Check has content disposition header
        content_disp = response.headers.get("Content-Disposition", "")
        assert "ManoProtect" in content_disp or "attachment" in content_disp, f"Missing proper filename: {content_disp}"
        
        # Verify PDF content (PDF files start with %PDF)
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF"
        
        print(f"Welcome PDF generated successfully ({len(response.content)} bytes)")
    
    def test_02_setup_complete_pdf_generation(self):
        """GET /api/documents/setup-complete-pdf - Generate setup complete PDF"""
        response = self.session.get(f"{BASE_URL}/api/documents/setup-complete-pdf")
        
        assert response.status_code == 200, f"PDF generation failed: {response.text}"
        
        # Check content type is PDF
        content_type = response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type, f"Expected PDF, got: {content_type}"
        
        # Verify PDF content
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF"
        
        print(f"Setup Complete PDF generated successfully ({len(response.content)} bytes)")
    
    def test_03_pdf_requires_auth(self):
        """PDF endpoints should require authentication"""
        # Use a fresh session without login
        fresh_session = requests.Session()
        
        response = fresh_session.get(f"{BASE_URL}/api/documents/welcome-pdf")
        
        # Should be 401 or 403
        assert response.status_code in [401, 403], f"Should require auth: {response.status_code}"
        print("PDF endpoints correctly require authentication")


class TestWhatsAppShare:
    """Test suite for WhatsApp sharing functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: login as admin"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
    
    def test_01_whatsapp_share_welcome(self):
        """GET /api/documents/whatsapp-share/welcome - Get WhatsApp share link for welcome"""
        response = self.session.get(f"{BASE_URL}/api/documents/whatsapp-share/welcome")
        
        assert response.status_code == 200, f"WhatsApp share failed: {response.text}"
        data = response.json()
        
        assert "whatsapp_url" in data, "Missing whatsapp_url"
        assert "text" in data, "Missing text"
        
        # Verify WhatsApp URL format
        assert data["whatsapp_url"].startswith("https://wa.me/"), f"Invalid WhatsApp URL: {data['whatsapp_url']}"
        
        # Verify text contains key info
        assert "ManoProtect" in data["text"], "Text should mention ManoProtect"
        
        print(f"WhatsApp share URL: {data['whatsapp_url'][:50]}...")
    
    def test_02_whatsapp_share_setup_complete(self):
        """GET /api/documents/whatsapp-share/setup-complete - Get WhatsApp share link for setup"""
        response = self.session.get(f"{BASE_URL}/api/documents/whatsapp-share/setup-complete")
        
        assert response.status_code == 200, f"WhatsApp share failed: {response.text}"
        data = response.json()
        
        assert "whatsapp_url" in data
        assert "text" in data
        assert data["whatsapp_url"].startswith("https://wa.me/")
        
        print(f"Setup complete WhatsApp share generated")
    
    def test_03_whatsapp_share_invalid_type(self):
        """GET /api/documents/whatsapp-share/{invalid} - Should return 400"""
        response = self.session.get(f"{BASE_URL}/api/documents/whatsapp-share/invalid-type")
        
        assert response.status_code == 400, f"Should fail for invalid type: {response.status_code}"
        print("Correctly returns 400 for invalid doc type")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
