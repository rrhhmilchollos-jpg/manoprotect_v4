"""
Iteration 138: AppCliente Security Features Tests
Tests for ManoProtect AppCliente: zones, events, SOS, emergency contacts, alarm status, cameras, settings
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSetup:
    """Shared fixtures for authenticated requests"""
    
    @staticmethod
    def create_test_user():
        """Create a test user and return token"""
        unique_email = f"test_appcliente_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "AppCliente Test User"
        })
        if response.status_code == 200:
            return response.json().get("token")
        # If user exists, try login
        login_resp = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": unique_email,
            "password": "TestPass123"
        })
        return login_resp.json().get("token") if login_resp.status_code == 200 else None


@pytest.fixture(scope="module")
def auth_token():
    """Module-scoped auth token for all tests"""
    return TestSetup.create_test_user()


# ============ ALARM STATUS TESTS ============
class TestAlarmStatus:
    """Tests for GET/POST /api/client-trial/alarm-status - arm/disarm with PIN"""
    
    def test_get_alarm_status(self, auth_token):
        """GET alarm status returns current mode"""
        response = requests.get(f"{BASE_URL}/api/client-trial/alarm-status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "mode" in data, "Should have mode field"
        assert data["mode"] in ["disarmed", "total", "partial"], f"Invalid mode: {data['mode']}"
        assert "updated_at" in data, "Should have updated_at field"
    
    def test_arm_total_with_pin(self, auth_token):
        """POST arm total mode with correct PIN"""
        response = requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "total", "pin": "1234"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["mode"] == "total", "Mode should be total"
        assert "updated_at" in data, "Should have updated_at"
    
    def test_arm_partial_with_pin(self, auth_token):
        """POST arm partial mode with correct PIN"""
        response = requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "partial", "pin": "1234"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["mode"] == "partial", "Mode should be partial"
    
    def test_disarm_with_correct_pin(self, auth_token):
        """POST disarm with correct PIN succeeds"""
        response = requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "disarmed", "pin": "1234"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["mode"] == "disarmed", "Mode should be disarmed"
    
    def test_disarm_with_wrong_pin_fails(self, auth_token):
        """POST disarm with wrong PIN fails with 403"""
        response = requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "disarmed", "pin": "9999"}
        )
        
        assert response.status_code == 403, f"Expected 403 for wrong PIN, got {response.status_code}"
    
    def test_alarm_status_no_auth_fails(self):
        """GET alarm status without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/alarm-status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ SECURITY ZONES TESTS ============
class TestSecurityZones:
    """Tests for GET /api/client-trial/zones - auto-seeds 6 default zones"""
    
    def test_get_zones_returns_list(self, auth_token):
        """GET zones returns list of security zones"""
        response = requests.get(f"{BASE_URL}/api/client-trial/zones", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
        assert len(data) >= 6, f"Should have at least 6 default zones, got {len(data)}"
    
    def test_zones_have_required_fields(self, auth_token):
        """Each zone has required fields: zone_id, name, type, status, battery"""
        response = requests.get(f"{BASE_URL}/api/client-trial/zones", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        data = response.json()
        for zone in data:
            assert "zone_id" in zone, "Zone should have zone_id"
            assert "name" in zone, "Zone should have name"
            assert "type" in zone, "Zone should have type"
            assert "status" in zone, "Zone should have status"
            assert "battery" in zone, "Zone should have battery"
    
    def test_zones_have_valid_types(self, auth_token):
        """Zones have valid sensor types"""
        valid_types = ["sensor_door", "sensor_pir", "smoke_detector", "camera", "siren", "keypad", "panel"]
        
        response = requests.get(f"{BASE_URL}/api/client-trial/zones", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        data = response.json()
        for zone in data:
            assert zone["type"] in valid_types, f"Invalid zone type: {zone['type']}"
    
    def test_zones_no_auth_fails(self):
        """GET zones without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/zones")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ CAMERAS TESTS ============
class TestCameras:
    """Tests for GET /api/client-trial/cameras - auto-seeds 3 default cameras"""
    
    def test_get_cameras_returns_list(self, auth_token):
        """GET cameras returns list of cameras"""
        response = requests.get(f"{BASE_URL}/api/client-trial/cameras", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
        assert len(data) >= 3, f"Should have at least 3 default cameras, got {len(data)}"
    
    def test_cameras_have_required_fields(self, auth_token):
        """Each camera has required fields: cam_id, name, location, status, type"""
        response = requests.get(f"{BASE_URL}/api/client-trial/cameras", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        data = response.json()
        for cam in data:
            assert "cam_id" in cam, "Camera should have cam_id"
            assert "name" in cam, "Camera should have name"
            assert "location" in cam, "Camera should have location"
            assert "status" in cam, "Camera should have status"
            assert "type" in cam, "Camera should have type"
    
    def test_cameras_no_auth_fails(self):
        """GET cameras without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/cameras")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ EVENTS TESTS ============
class TestEvents:
    """Tests for GET /api/client-trial/events - event history"""
    
    def test_get_events_returns_list(self, auth_token):
        """GET events returns list of events"""
        response = requests.get(f"{BASE_URL}/api/client-trial/events", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
    
    def test_events_created_after_arm_disarm(self, auth_token):
        """Events are created after arm/disarm actions"""
        # First arm the system
        requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "total", "pin": "1234"}
        )
        
        # Then disarm
        requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "disarmed", "pin": "1234"}
        )
        
        # Check events
        response = requests.get(f"{BASE_URL}/api/client-trial/events", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        data = response.json()
        assert len(data) > 0, "Should have events after arm/disarm"
        
        # Check event structure
        event = data[0]
        assert "type" in event, "Event should have type"
        assert "timestamp" in event, "Event should have timestamp"
    
    def test_events_no_auth_fails(self):
        """GET events without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/events")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ SOS TESTS ============
class TestSOS:
    """Tests for POST /api/client-trial/sos - SOS with geolocation"""
    
    def test_activate_sos_with_location(self, auth_token):
        """POST SOS with lat/lng creates alert"""
        response = requests.post(f"{BASE_URL}/api/client-trial/sos",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"lat": 40.4168, "lng": -3.7038}  # Madrid coordinates
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["status"] == "active", "SOS status should be active"
        assert "timestamp" in data, "Should have timestamp"
        assert "contacts_notified" in data, "Should have contacts_notified count"
    
    def test_activate_sos_without_location(self, auth_token):
        """POST SOS without location still works"""
        response = requests.post(f"{BASE_URL}/api/client-trial/sos",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["status"] == "active", "SOS status should be active"
    
    def test_sos_creates_event(self, auth_token):
        """SOS activation creates event in history"""
        # Activate SOS
        requests.post(f"{BASE_URL}/api/client-trial/sos",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"lat": 40.4168, "lng": -3.7038}
        )
        
        # Check events
        response = requests.get(f"{BASE_URL}/api/client-trial/events", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        data = response.json()
        sos_events = [e for e in data if e.get("type") == "sos"]
        assert len(sos_events) > 0, "Should have SOS event in history"
    
    def test_sos_no_auth_fails(self):
        """POST SOS without auth fails with 401"""
        response = requests.post(f"{BASE_URL}/api/client-trial/sos",
            headers={"Content-Type": "application/json"},
            json={"lat": 40.4168, "lng": -3.7038}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ EMERGENCY CONTACTS TESTS ============
class TestEmergencyContacts:
    """Tests for GET/POST/DELETE /api/client-trial/emergency-contacts"""
    
    def test_get_contacts_returns_list(self, auth_token):
        """GET emergency contacts returns list"""
        response = requests.get(f"{BASE_URL}/api/client-trial/emergency-contacts", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
    
    def test_add_emergency_contact(self, auth_token):
        """POST adds new emergency contact"""
        response = requests.post(f"{BASE_URL}/api/client-trial/emergency-contacts",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={
                "name": "Test Contact",
                "phone": "+34612345678",
                "relation": "familiar"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "contact_id" in data, "Should have contact_id"
        assert data["name"] == "Test Contact", "Name should match"
        assert data["phone"] == "+34612345678", "Phone should match"
        assert data["relation"] == "familiar", "Relation should match"
    
    def test_delete_emergency_contact(self, auth_token):
        """DELETE removes emergency contact"""
        # First add a contact
        add_resp = requests.post(f"{BASE_URL}/api/client-trial/emergency-contacts",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={
                "name": "To Delete",
                "phone": "+34600000000",
                "relation": "vecino"
            }
        )
        contact_id = add_resp.json().get("contact_id")
        
        # Delete the contact
        response = requests.delete(
            f"{BASE_URL}/api/client-trial/emergency-contacts/{contact_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "deleted", "Status should be deleted"
    
    def test_contacts_no_auth_fails(self):
        """GET contacts without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/emergency-contacts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ SETTINGS TESTS ============
class TestSettings:
    """Tests for GET/PUT /api/client-trial/settings - PIN change, night mode zones"""
    
    def test_get_settings(self, auth_token):
        """GET settings returns current settings"""
        response = requests.get(f"{BASE_URL}/api/client-trial/settings", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "pin" in data, "Should have pin"
        assert "night_mode_zones" in data, "Should have night_mode_zones"
    
    def test_change_pin(self, auth_token):
        """PUT settings changes PIN"""
        new_pin = "5678"
        response = requests.put(f"{BASE_URL}/api/client-trial/settings",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"pin": new_pin}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify PIN changed by trying to disarm with new PIN
        disarm_resp = requests.post(f"{BASE_URL}/api/client-trial/alarm-status",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"mode": "disarmed", "pin": new_pin}
        )
        assert disarm_resp.status_code == 200, "Should be able to disarm with new PIN"
        
        # Reset PIN back to 1234 for other tests
        requests.put(f"{BASE_URL}/api/client-trial/settings",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"pin": "1234"}
        )
    
    def test_update_night_mode_zones(self, auth_token):
        """PUT settings updates night mode zones"""
        response = requests.put(f"{BASE_URL}/api/client-trial/settings",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"night_mode_zones": ["z1", "z2", "z3"]}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify update
        get_resp = requests.get(f"{BASE_URL}/api/client-trial/settings", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        data = get_resp.json()
        assert "z1" in data["night_mode_zones"], "z1 should be in night mode zones"
    
    def test_settings_empty_update_fails(self, auth_token):
        """PUT settings with no valid fields fails with 400"""
        response = requests.put(f"{BASE_URL}/api/client-trial/settings",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"invalid_field": "value"}
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid fields, got {response.status_code}"
    
    def test_settings_no_auth_fails(self):
        """GET settings without auth fails with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/settings")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


# ============ EXISTING USER LOGIN TEST ============
class TestExistingUser:
    """Test with existing test user credentials"""
    
    def test_login_existing_user(self):
        """Login with existing test user: testclient_new@test.com / Test123!"""
        response = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": "testclient_new@test.com",
            "password": "Test123!",
            "fingerprint": "test_fingerprint"
        })
        
        # User may or may not exist, so we accept 200 or 401
        assert response.status_code in [200, 401], f"Expected 200 or 401, got {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data, "Should have token"
            assert "user" in data, "Should have user data"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
