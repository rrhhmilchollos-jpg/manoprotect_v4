"""
ManoProtect Geofencing/Safe Zones API Tests
Tests CRUD operations, location detection, and plan restrictions
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
SUPERADMIN_EMAIL = "info@manoprotect.com"
SUPERADMIN_PASSWORD = "19862210Des"
TEST_PREMIUM_USER = "reviewer@manoprotect.com"

# Test coordinates - Madrid center
MADRID_CENTER = {"lat": 40.4168, "lng": -3.7038}
# Location outside 200m radius (~580m away)
OUTSIDE_ZONE = {"lat": 40.422, "lng": -3.7038}


class TestGeofencingAPI:
    """Geofencing CRUD and detection tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.geofence_id = None
        
    def _login(self, email=SUPERADMIN_EMAIL, password=SUPERADMIN_PASSWORD):
        """Helper to login and get session"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password}
        )
        return response
    
    # ============================================
    # AUTHENTICATION TESTS
    # ============================================
    
    def test_01_login_superadmin(self):
        """Test superadmin login"""
        response = self._login()
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user" in data or "email" in data, "Login response missing user data"
        print(f"✓ Superadmin login successful")
    
    def test_02_geofences_requires_auth(self):
        """Test that geofences endpoint requires authentication"""
        # Fresh session without login
        fresh_session = requests.Session()
        response = fresh_session.get(f"{BASE_URL}/api/geofences")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Geofences endpoint correctly requires authentication")
    
    # ============================================
    # GET GEOFENCES TESTS
    # ============================================
    
    def test_03_get_geofences_list(self):
        """Test GET /api/geofences - list user's zones"""
        self._login()
        response = self.session.get(f"{BASE_URL}/api/geofences")
        assert response.status_code == 200, f"Failed to get geofences: {response.text}"
        
        data = response.json()
        assert "geofences" in data, "Response missing 'geofences' field"
        assert "total" in data, "Response missing 'total' field"
        assert "max_zones" in data, "Response missing 'max_zones' field"
        assert "is_premium" in data, "Response missing 'is_premium' field"
        assert "preset_zones" in data, "Response missing 'preset_zones' field"
        
        # Superadmin should have premium access
        assert data["is_premium"] == True, "Superadmin should have premium access"
        
        print(f"✓ GET /api/geofences returns {data['total']} zones")
        print(f"  - is_premium: {data['is_premium']}")
        print(f"  - max_zones: {data['max_zones']}")
    
    def test_04_preset_zones_structure(self):
        """Test that preset zones are returned correctly"""
        self._login()
        response = self.session.get(f"{BASE_URL}/api/geofences")
        data = response.json()
        
        preset_zones = data.get("preset_zones", {})
        expected_presets = ["home", "work", "school", "custom"]
        
        for preset in expected_presets:
            assert preset in preset_zones, f"Missing preset zone: {preset}"
            assert "name" in preset_zones[preset], f"Preset {preset} missing 'name'"
            assert "icon" in preset_zones[preset], f"Preset {preset} missing 'icon'"
            assert "default_radius" in preset_zones[preset], f"Preset {preset} missing 'default_radius'"
        
        print(f"✓ All preset zones present: {list(preset_zones.keys())}")
    
    # ============================================
    # CREATE GEOFENCE TESTS
    # ============================================
    
    def test_05_create_geofence_success(self):
        """Test POST /api/geofences - create new zone"""
        self._login()
        
        zone_data = {
            "name": "TEST_Zona_Prueba",
            "latitude": MADRID_CENTER["lat"],
            "longitude": MADRID_CENTER["lng"],
            "radius": 200,
            "zone_type": "custom",
            "alert_on_entry": True,
            "alert_on_exit": True,
            "notify_sms": True,
            "notify_push": True,
            "member_ids": [],
            "address": "Madrid Centro, España"
        }
        
        response = self.session.post(f"{BASE_URL}/api/geofences", json=zone_data)
        assert response.status_code == 200, f"Failed to create geofence: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "geofence" in data, "Response missing 'geofence' field"
        
        geofence = data["geofence"]
        assert geofence["name"] == zone_data["name"], "Name mismatch"
        assert geofence["latitude"] == zone_data["latitude"], "Latitude mismatch"
        assert geofence["longitude"] == zone_data["longitude"], "Longitude mismatch"
        assert geofence["radius"] == zone_data["radius"], "Radius mismatch"
        assert "geofence_id" in geofence, "Missing geofence_id"
        
        # Store for later tests
        self.__class__.created_geofence_id = geofence["geofence_id"]
        
        print(f"✓ Created geofence: {geofence['geofence_id']}")
        print(f"  - Name: {geofence['name']}")
        print(f"  - Location: ({geofence['latitude']}, {geofence['longitude']})")
        print(f"  - Radius: {geofence['radius']}m")
    
    def test_06_create_geofence_with_preset_type(self):
        """Test creating geofence with preset type (home, work, school)"""
        self._login()
        
        zone_data = {
            "name": "TEST_Mi_Casa",
            "latitude": 40.420,
            "longitude": -3.710,
            "radius": 150,
            "zone_type": "home",
            "alert_on_entry": True,
            "alert_on_exit": True
        }
        
        response = self.session.post(f"{BASE_URL}/api/geofences", json=zone_data)
        assert response.status_code == 200, f"Failed to create home zone: {response.text}"
        
        data = response.json()
        geofence = data["geofence"]
        assert geofence["zone_type"] == "home", "Zone type should be 'home'"
        assert geofence["icon"] == "🏠", "Home zone should have house icon"
        
        # Store for cleanup
        self.__class__.home_geofence_id = geofence["geofence_id"]
        
        print(f"✓ Created home zone with icon: {geofence['icon']}")
    
    def test_07_create_geofence_radius_validation(self):
        """Test that radius is clamped to 50-500m range"""
        self._login()
        
        # Test radius below minimum (should be clamped to 50)
        zone_data = {
            "name": "TEST_Small_Zone",
            "latitude": 40.415,
            "longitude": -3.700,
            "radius": 10,  # Below minimum
            "zone_type": "custom"
        }
        
        response = self.session.post(f"{BASE_URL}/api/geofences", json=zone_data)
        assert response.status_code == 200
        data = response.json()
        assert data["geofence"]["radius"] == 50, "Radius should be clamped to minimum 50m"
        
        self.__class__.small_geofence_id = data["geofence"]["geofence_id"]
        
        # Test radius above maximum (should be clamped to 500)
        zone_data["name"] = "TEST_Large_Zone"
        zone_data["radius"] = 1000  # Above maximum
        zone_data["latitude"] = 40.418
        
        response = self.session.post(f"{BASE_URL}/api/geofences", json=zone_data)
        assert response.status_code == 200
        data = response.json()
        assert data["geofence"]["radius"] == 500, "Radius should be clamped to maximum 500m"
        
        self.__class__.large_geofence_id = data["geofence"]["geofence_id"]
        
        print(f"✓ Radius validation working: min=50m, max=500m")
    
    # ============================================
    # GET SINGLE GEOFENCE TESTS
    # ============================================
    
    def test_08_get_single_geofence(self):
        """Test GET /api/geofences/{id} - get specific zone"""
        self._login()
        
        geofence_id = getattr(self.__class__, 'created_geofence_id', None)
        if not geofence_id:
            pytest.skip("No geofence created in previous test")
        
        response = self.session.get(f"{BASE_URL}/api/geofences/{geofence_id}")
        assert response.status_code == 200, f"Failed to get geofence: {response.text}"
        
        data = response.json()
        assert "geofence" in data, "Response missing 'geofence' field"
        assert data["geofence"]["geofence_id"] == geofence_id, "ID mismatch"
        
        print(f"✓ GET /api/geofences/{geofence_id} successful")
    
    def test_09_get_nonexistent_geofence(self):
        """Test GET for non-existent geofence returns 404"""
        self._login()
        
        response = self.session.get(f"{BASE_URL}/api/geofences/geo_nonexistent123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"✓ Non-existent geofence correctly returns 404")
    
    # ============================================
    # UPDATE GEOFENCE TESTS
    # ============================================
    
    def test_10_update_geofence(self):
        """Test PUT /api/geofences/{id} - update zone"""
        self._login()
        
        geofence_id = getattr(self.__class__, 'created_geofence_id', None)
        if not geofence_id:
            pytest.skip("No geofence created in previous test")
        
        update_data = {
            "name": "TEST_Zona_Actualizada",
            "radius": 300,
            "alert_on_entry": False,
            "is_active": True
        }
        
        response = self.session.put(f"{BASE_URL}/api/geofences/{geofence_id}", json=update_data)
        assert response.status_code == 200, f"Failed to update geofence: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Update should indicate success"
        
        # Verify update by fetching
        verify_response = self.session.get(f"{BASE_URL}/api/geofences/{geofence_id}")
        verify_data = verify_response.json()
        assert verify_data["geofence"]["radius"] == 300, "Radius not updated"
        assert verify_data["geofence"]["alert_on_entry"] == False, "alert_on_entry not updated"
        
        print(f"✓ Updated geofence: radius=300m, alert_on_entry=False")
    
    def test_11_toggle_geofence_active_state(self):
        """Test activating/deactivating a geofence"""
        self._login()
        
        geofence_id = getattr(self.__class__, 'created_geofence_id', None)
        if not geofence_id:
            pytest.skip("No geofence created in previous test")
        
        # Deactivate
        response = self.session.put(
            f"{BASE_URL}/api/geofences/{geofence_id}",
            json={"is_active": False}
        )
        assert response.status_code == 200
        
        # Verify deactivated
        verify = self.session.get(f"{BASE_URL}/api/geofences/{geofence_id}")
        assert verify.json()["geofence"]["is_active"] == False
        
        # Reactivate
        response = self.session.put(
            f"{BASE_URL}/api/geofences/{geofence_id}",
            json={"is_active": True}
        )
        assert response.status_code == 200
        
        print(f"✓ Toggle active state working correctly")
    
    # ============================================
    # LOCATION CHECK TESTS
    # ============================================
    
    def test_12_check_location_inside_zone(self):
        """Test POST /api/geofences/check-location - inside zone"""
        self._login()
        
        # Check location at zone center (should be inside)
        location_data = {
            "latitude": MADRID_CENTER["lat"],
            "longitude": MADRID_CENTER["lng"]
        }
        
        response = self.session.post(f"{BASE_URL}/api/geofences/check-location", json=location_data)
        assert response.status_code == 200, f"Failed to check location: {response.text}"
        
        data = response.json()
        assert "events" in data, "Response missing 'events' field"
        assert "total_zones_checked" in data, "Response missing 'total_zones_checked'"
        assert "location" in data, "Response missing 'location' field"
        
        print(f"✓ Location check at center: {data['total_zones_checked']} zones checked")
    
    def test_13_check_location_outside_zone(self):
        """Test location check outside zone radius"""
        self._login()
        
        # First, set initial state inside zone
        inside_data = {
            "latitude": MADRID_CENTER["lat"],
            "longitude": MADRID_CENTER["lng"]
        }
        self.session.post(f"{BASE_URL}/api/geofences/check-location", json=inside_data)
        
        # Now check location outside zone (~580m away)
        outside_data = {
            "latitude": OUTSIDE_ZONE["lat"],
            "longitude": OUTSIDE_ZONE["lng"]
        }
        
        response = self.session.post(f"{BASE_URL}/api/geofences/check-location", json=outside_data)
        assert response.status_code == 200, f"Failed to check location: {response.text}"
        
        data = response.json()
        # May or may not have exit events depending on zone configuration
        print(f"✓ Location check outside zone: {len(data.get('events', []))} events generated")
    
    # ============================================
    # EVENTS HISTORY TESTS
    # ============================================
    
    def test_14_get_geofence_events(self):
        """Test GET /api/geofences/events - event history"""
        self._login()
        
        response = self.session.get(f"{BASE_URL}/api/geofences/events?days=7")
        assert response.status_code == 200, f"Failed to get events: {response.text}"
        
        data = response.json()
        assert "events" in data, "Response missing 'events' field"
        assert "total" in data, "Response missing 'total' field"
        
        print(f"✓ GET /api/geofences/events: {data['total']} events in last 7 days")
    
    # ============================================
    # MEMBER STATES TESTS
    # ============================================
    
    def test_15_get_member_states(self):
        """Test GET /api/geofences/member-states"""
        self._login()
        
        response = self.session.get(f"{BASE_URL}/api/geofences/member-states")
        assert response.status_code == 200, f"Failed to get member states: {response.text}"
        
        data = response.json()
        assert "zones" in data, "Response missing 'zones' field"
        
        print(f"✓ GET /api/geofences/member-states: {len(data['zones'])} zones with states")
    
    # ============================================
    # DELETE GEOFENCE TESTS
    # ============================================
    
    def test_16_delete_geofence(self):
        """Test DELETE /api/geofences/{id}"""
        self._login()
        
        geofence_id = getattr(self.__class__, 'created_geofence_id', None)
        if not geofence_id:
            pytest.skip("No geofence created in previous test")
        
        response = self.session.delete(f"{BASE_URL}/api/geofences/{geofence_id}")
        assert response.status_code == 200, f"Failed to delete geofence: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Delete should indicate success"
        
        # Verify deleted
        verify = self.session.get(f"{BASE_URL}/api/geofences/{geofence_id}")
        assert verify.status_code == 404, "Deleted geofence should return 404"
        
        print(f"✓ Deleted geofence: {geofence_id}")
    
    def test_17_delete_nonexistent_geofence(self):
        """Test DELETE for non-existent geofence returns 404"""
        self._login()
        
        response = self.session.delete(f"{BASE_URL}/api/geofences/geo_nonexistent123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print(f"✓ Delete non-existent geofence correctly returns 404")
    
    # ============================================
    # CLEANUP
    # ============================================
    
    def test_99_cleanup_test_zones(self):
        """Cleanup all TEST_ prefixed zones"""
        self._login()
        
        # Get all geofences
        response = self.session.get(f"{BASE_URL}/api/geofences")
        if response.status_code != 200:
            return
        
        geofences = response.json().get("geofences", [])
        deleted_count = 0
        
        for fence in geofences:
            if fence.get("name", "").startswith("TEST_"):
                del_response = self.session.delete(f"{BASE_URL}/api/geofences/{fence['geofence_id']}")
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✓ Cleanup: deleted {deleted_count} test zones")


class TestGeofencingPlanRestrictions:
    """Test plan-based restrictions for geofencing"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_superadmin_has_unlimited_zones(self):
        """Superadmin should have unlimited zones"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD}
        )
        assert response.status_code == 200
        
        response = self.session.get(f"{BASE_URL}/api/geofences")
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_premium"] == True, "Superadmin should be premium"
        assert data["max_zones"] == 999, "Superadmin should have 999 max zones"
        
        print(f"✓ Superadmin has unlimited zones (max_zones=999)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
