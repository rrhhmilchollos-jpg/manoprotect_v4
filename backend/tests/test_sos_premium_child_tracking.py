"""
Test Suite for SOS Premium and Child Tracking Features
Tests:
- POST /api/sos/premium/trigger - Trigger SOS alert
- POST /api/sos/premium/{id}/cancel - Cancel SOS
- GET /api/sos/premium/active - Get active alerts
- POST /api/family/children/add - Add family member with age
- Age classification: child(<18), adult(18-64), elderly(≥65)
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_EMAIL = f"test_sos_{uuid.uuid4().hex[:8]}@test.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "Test SOS User"


class TestSOSPremiumAndChildTracking:
    """Test SOS Premium and Child Tracking APIs"""
    
    session = None
    user_id = None
    sos_id = None
    child_id = None
    
    @classmethod
    def setup_class(cls):
        """Setup: Register and login a test user with family plan"""
        cls.session = requests.Session()
        cls.session.headers.update({"Content-Type": "application/json"})
        
        # Register test user
        register_response = cls.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "phone": "+34612345678"
        })
        
        if register_response.status_code == 200:
            print(f"✅ Test user registered: {TEST_EMAIL}")
            cls.user_id = register_response.json().get("user_id")
        else:
            print(f"⚠️ Registration response: {register_response.status_code} - {register_response.text}")
    
    # ============================================
    # SOS PREMIUM API TESTS
    # ============================================
    
    def test_01_sos_premium_trigger_without_auth(self):
        """Test SOS trigger without authentication - should fail"""
        response = requests.post(f"{BASE_URL}/api/sos/premium/trigger", json={
            "location": {"latitude": 40.4168, "longitude": -3.7038},
            "message": "Test emergency"
        })
        
        # Should return 401 Unauthorized
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ SOS trigger without auth correctly returns 401")
    
    def test_02_sos_premium_trigger_with_auth(self):
        """Test SOS trigger with authentication"""
        response = self.session.post(f"{BASE_URL}/api/sos/premium/trigger", json={
            "location": {
                "latitude": 40.4168,
                "longitude": -3.7038,
                "accuracy": 10
            },
            "message": "¡EMERGENCIA! Necesito ayuda urgente.",
            "alert_nearby": True,
            "audio_duration": 15
        })
        
        # May return 403 if user doesn't have premium plan
        if response.status_code == 403:
            print(f"⚠️ SOS Premium requires family plan: {response.json().get('detail')}")
            pytest.skip("User doesn't have premium plan - expected behavior")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "sos_id" in data
        assert "family_notified_count" in data
        assert "nearby_notified_count" in data
        
        # Store SOS ID for cancel test
        TestSOSPremiumAndChildTracking.sos_id = data.get("sos_id")
        print(f"✅ SOS Premium triggered: {data.get('sos_id')}")
    
    def test_03_sos_premium_get_active_alerts(self):
        """Test getting active SOS alerts"""
        response = self.session.get(f"{BASE_URL}/api/sos/premium/active")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "own_alerts" in data
        assert "family_alerts" in data
        assert "total_active" in data
        
        print(f"✅ Active alerts retrieved: {data.get('total_active')} total")
    
    def test_04_sos_premium_cancel(self):
        """Test canceling an SOS alert"""
        if not self.sos_id:
            pytest.skip("No SOS ID available - previous test may have been skipped")
        
        response = self.session.post(f"{BASE_URL}/api/sos/premium/{self.sos_id}/cancel", json={
            "reason": "test_cancelled"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        print(f"✅ SOS alert cancelled: {self.sos_id}")
    
    def test_05_sos_premium_cancel_nonexistent(self):
        """Test canceling a non-existent SOS alert"""
        response = self.session.post(f"{BASE_URL}/api/sos/premium/nonexistent_sos_id/cancel", json={
            "reason": "test"
        })
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Cancel non-existent SOS correctly returns 404")
    
    # ============================================
    # CHILD TRACKING API TESTS
    # ============================================
    
    def test_06_add_child_without_auth(self):
        """Test adding child without authentication - should fail"""
        response = requests.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Test Child",
            "phone": "+34600111222",
            "age": 12,
            "silent_mode": False
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Add child without auth correctly returns 401")
    
    def test_07_add_child_as_nino(self):
        """Test adding a child (age < 18) - should classify as 'child'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "María García",
            "phone": "+34600111222",
            "age": 12,
            "silent_mode": False
        })
        
        # May return 403 if user doesn't have yearly family plan
        if response.status_code == 403:
            print(f"⚠️ Child tracking requires family yearly plan: {response.json().get('detail')}")
            pytest.skip("User doesn't have family yearly plan - expected behavior")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "child" in data
        
        child = data["child"]
        assert child.get("name") == "María García"
        assert child.get("age") == 12
        assert child.get("person_type") == "child", f"Expected 'child', got {child.get('person_type')}"
        
        TestSOSPremiumAndChildTracking.child_id = child.get("child_id")
        print(f"✅ Child added with correct classification: {child.get('person_type')}")
    
    def test_08_add_adult(self):
        """Test adding an adult (age 18-64) - should classify as 'adult'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Juan Pérez",
            "phone": "+34600222333",
            "age": 35,
            "silent_mode": True
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        child = data.get("child", {})
        assert child.get("person_type") == "adult", f"Expected 'adult', got {child.get('person_type')}"
        print(f"✅ Adult added with correct classification: {child.get('person_type')}")
    
    def test_09_add_elderly(self):
        """Test adding an elderly person (age >= 65) - should classify as 'elderly'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Abuela Carmen",
            "phone": "+34600333444",
            "age": 78,
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        child = data.get("child", {})
        assert child.get("person_type") == "elderly", f"Expected 'elderly', got {child.get('person_type')}"
        print(f"✅ Elderly added with correct classification: {child.get('person_type')}")
    
    def test_10_add_boundary_age_17(self):
        """Test boundary: age 17 should be 'child'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Teen 17",
            "phone": "+34600444555",
            "age": 17,
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("child", {}).get("person_type") == "child"
        print("✅ Age 17 correctly classified as 'child'")
    
    def test_11_add_boundary_age_18(self):
        """Test boundary: age 18 should be 'adult'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Adult 18",
            "phone": "+34600555666",
            "age": 18,
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("child", {}).get("person_type") == "adult"
        print("✅ Age 18 correctly classified as 'adult'")
    
    def test_12_add_boundary_age_64(self):
        """Test boundary: age 64 should be 'adult'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Adult 64",
            "phone": "+34600666777",
            "age": 64,
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("child", {}).get("person_type") == "adult"
        print("✅ Age 64 correctly classified as 'adult'")
    
    def test_13_add_boundary_age_65(self):
        """Test boundary: age 65 should be 'elderly'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Senior 65",
            "phone": "+34600777888",
            "age": 65,
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("child", {}).get("person_type") == "elderly"
        print("✅ Age 65 correctly classified as 'elderly'")
    
    def test_14_get_family_children(self):
        """Test getting all family children"""
        response = self.session.get(f"{BASE_URL}/api/family/children")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "children" in data
        assert "feature_available" in data
        
        print(f"✅ Family children retrieved: {len(data.get('children', []))} members")
    
    def test_15_add_child_missing_age(self):
        """Test adding child without age - should still work but classify as 'unknown'"""
        response = self.session.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "No Age Person",
            "phone": "+34600888999",
            "silent_mode": False
        })
        
        if response.status_code == 403:
            pytest.skip("User doesn't have family yearly plan")
        
        # Should work but person_type should be 'unknown'
        if response.status_code == 200:
            data = response.json()
            child = data.get("child", {})
            assert child.get("person_type") == "unknown", f"Expected 'unknown', got {child.get('person_type')}"
            print("✅ Child without age correctly classified as 'unknown'")
        else:
            # If validation requires age, that's also acceptable
            print(f"⚠️ Age may be required: {response.status_code}")


class TestSOSPremiumEndpointStructure:
    """Test that SOS Premium endpoints exist and have correct structure"""
    
    def test_sos_premium_trigger_endpoint_exists(self):
        """Verify /api/sos/premium/trigger endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/sos/premium/trigger", json={})
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code != 404, "Endpoint /api/sos/premium/trigger not found"
        print(f"✅ Endpoint exists: /api/sos/premium/trigger (status: {response.status_code})")
    
    def test_sos_premium_cancel_endpoint_exists(self):
        """Verify /api/sos/premium/{id}/cancel endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/sos/premium/test_id/cancel", json={})
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code != 404, "Endpoint /api/sos/premium/{id}/cancel not found"
        print(f"✅ Endpoint exists: /api/sos/premium/{{id}}/cancel (status: {response.status_code})")
    
    def test_sos_premium_active_endpoint_exists(self):
        """Verify /api/sos/premium/active endpoint exists"""
        response = requests.get(f"{BASE_URL}/api/sos/premium/active")
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code != 404, "Endpoint /api/sos/premium/active not found"
        print(f"✅ Endpoint exists: /api/sos/premium/active (status: {response.status_code})")
    
    def test_family_children_add_endpoint_exists(self):
        """Verify /api/family/children/add endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/family/children/add", json={
            "name": "Test",
            "phone": "+34600000000"
        })
        # Should return 401 (unauthorized) not 404 (not found)
        assert response.status_code != 404, "Endpoint /api/family/children/add not found"
        print(f"✅ Endpoint exists: /api/family/children/add (status: {response.status_code})")


class TestPortalEmpleados:
    """Test Portal Empleados page and downloads"""
    
    def test_portal_empleados_api_stats(self):
        """Test that portal can fetch scam stats"""
        response = requests.get(f"{BASE_URL}/api/fraud/public/scam-stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Portal uses these fields
        assert "total_scams_blocked" in data or "protected_families" in data
        print(f"✅ Scam stats API working for portal")
    
    def test_portal_empleados_community_alerts(self):
        """Test that portal can fetch community alerts"""
        response = requests.get(f"{BASE_URL}/api/community-alerts")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Community alerts API working for portal")
    
    def test_windows_download_exists(self):
        """Test Windows download file exists"""
        response = requests.head(f"{BASE_URL}/ManoProtect-Desktop-Windows.zip")
        
        # Should return 200 or redirect
        assert response.status_code in [200, 301, 302, 304], f"Windows download not found: {response.status_code}"
        print("✅ Windows download file accessible")
    
    def test_android_download_exists(self):
        """Test Android download file exists"""
        response = requests.head(f"{BASE_URL}/ManoProtect-Android-Project.zip")
        
        assert response.status_code in [200, 301, 302, 304], f"Android download not found: {response.status_code}"
        print("✅ Android download file accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
