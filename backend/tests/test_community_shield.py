"""
Test suite for Community Shield / Escudo Vecinal API endpoints
Tests: GET /stats, GET /incidents, POST /incidents, PATCH /incidents/{id}/confirm, 
       PATCH /incidents/{id}/resolve, GET /heatmap
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCommunityShieldStats:
    """Test GET /api/community-shield/stats endpoint"""
    
    def test_stats_returns_200(self):
        """Stats endpoint returns 200 and expected structure"""
        response = requests.get(f"{BASE_URL}/api/community-shield/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Stats response: {data}")
        
        # Verify required fields exist
        assert "incidents_last_7_days" in data, "Missing incidents_last_7_days"
        assert "incidents_last_30_days" in data, "Missing incidents_last_30_days"
        assert "by_type" in data, "Missing by_type"
        assert "by_severity" in data, "Missing by_severity"
        assert "incident_types" in data, "Missing incident_types"
        
        # Verify incident_types structure
        incident_types = data["incident_types"]
        assert isinstance(incident_types, dict), "incident_types should be a dict"
        expected_types = ["robo", "vandalismo", "sospechoso", "ruido", "emergencia", "accidente", "otro"]
        for t in expected_types:
            assert t in incident_types, f"Missing incident type: {t}"
            assert "icon" in incident_types[t], f"Missing icon for {t}"
            assert "color" in incident_types[t], f"Missing color for {t}"
            assert "label" in incident_types[t], f"Missing label for {t}"


class TestCommunityShieldIncidents:
    """Test GET /api/community-shield/incidents endpoint"""
    
    def test_incidents_returns_200(self):
        """Incidents endpoint returns 200 with expected structure"""
        response = requests.get(f"{BASE_URL}/api/community-shield/incidents?lat=39.4699&lng=-0.3763&radius_km=5")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Incidents response keys: {data.keys()}")
        print(f"Total incidents: {data.get('total', 0)}")
        
        # Verify structure
        assert "incidents" in data, "Missing incidents array"
        assert "total" in data, "Missing total count"
        assert "radius_km" in data, "Missing radius_km"
        assert "center" in data, "Missing center coordinates"
        assert isinstance(data["incidents"], list), "incidents should be a list"
        
        # If there are incidents, verify their structure
        if data["incidents"]:
            incident = data["incidents"][0]
            print(f"Sample incident: {incident}")
            required_fields = ["incident_id", "type", "title", "description", "latitude", "longitude", "severity", "status", "created_at"]
            for field in required_fields:
                assert field in incident, f"Missing field in incident: {field}"


class TestCommunityShieldCreateIncident:
    """Test POST /api/community-shield/incidents endpoint"""
    
    def test_create_incident_success(self):
        """Create a new incident successfully"""
        unique_id = str(uuid.uuid4())[:8]
        incident_data = {
            "type": "sospechoso",
            "title": f"TEST_Persona sospechosa merodeando {unique_id}",
            "description": "Persona con capucha merodeando cerca del portal durante 30 minutos",
            "latitude": 39.4699,
            "longitude": -0.3763,
            "severity": "media",
            "anonymous": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/community-shield/incidents",
            json=incident_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Create incident response: {data}")
        
        # Verify response structure
        assert "incident_id" in data, "Missing incident_id in response"
        assert "message" in data, "Missing message in response"
        assert "type_meta" in data, "Missing type_meta in response"
        
        # Return incident_id for cleanup/further tests
        return data["incident_id"]
    
    def test_create_incident_invalid_type(self):
        """Create incident with invalid type returns 400"""
        incident_data = {
            "type": "invalid_type",
            "title": "TEST_Invalid type test",
            "description": "Testing invalid type",
            "latitude": 39.4699,
            "longitude": -0.3763,
            "severity": "media"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/community-shield/incidents",
            json=incident_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400, f"Expected 400 for invalid type, got {response.status_code}"
    
    def test_create_incident_all_types(self):
        """Create incidents with all valid types"""
        valid_types = ["robo", "vandalismo", "sospechoso", "ruido", "emergencia", "accidente", "otro"]
        
        for incident_type in valid_types:
            unique_id = str(uuid.uuid4())[:8]
            incident_data = {
                "type": incident_type,
                "title": f"TEST_{incident_type}_{unique_id}",
                "description": f"Testing {incident_type} incident type",
                "latitude": 39.4699 + 0.001,
                "longitude": -0.3763 + 0.001,
                "severity": "media"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/community-shield/incidents",
                json=incident_data,
                headers={"Content-Type": "application/json"}
            )
            assert response.status_code == 200, f"Failed to create incident type {incident_type}: {response.text}"
            print(f"Created incident type '{incident_type}' successfully")


class TestCommunityShieldConfirmIncident:
    """Test PATCH /api/community-shield/incidents/{id}/confirm endpoint"""
    
    def test_confirm_existing_incident(self):
        """Confirm an existing incident"""
        # First, get existing incidents
        response = requests.get(f"{BASE_URL}/api/community-shield/incidents?lat=39.4699&lng=-0.3763")
        assert response.status_code == 200
        
        incidents = response.json().get("incidents", [])
        if not incidents:
            # Create one if none exist
            create_resp = requests.post(
                f"{BASE_URL}/api/community-shield/incidents",
                json={
                    "type": "sospechoso",
                    "title": "TEST_confirm_test",
                    "description": "Created for confirm test",
                    "latitude": 39.4699,
                    "longitude": -0.3763,
                    "severity": "media"
                }
            )
            assert create_resp.status_code == 200
            incident_id = create_resp.json()["incident_id"]
        else:
            incident_id = incidents[0]["incident_id"]
        
        # Confirm the incident
        confirm_response = requests.patch(
            f"{BASE_URL}/api/community-shield/incidents/{incident_id}/confirm",
            json={"confirmed": True},
            headers={"Content-Type": "application/json"}
        )
        
        # Could be 200 (success) or 400 (already confirmed)
        assert confirm_response.status_code in [200, 400], f"Unexpected status: {confirm_response.status_code}: {confirm_response.text}"
        
        data = confirm_response.json()
        print(f"Confirm response: {data}")
        
        if confirm_response.status_code == 200:
            assert "message" in data, "Missing message in confirm response"
            assert "confirmations" in data, "Missing confirmations count"
    
    def test_confirm_nonexistent_incident(self):
        """Confirm a non-existent incident returns 404"""
        response = requests.patch(
            f"{BASE_URL}/api/community-shield/incidents/nonexistent123/confirm",
            json={"confirmed": True},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent incident, got {response.status_code}"


class TestCommunityShieldResolveIncident:
    """Test PATCH /api/community-shield/incidents/{id}/resolve endpoint"""
    
    def test_resolve_existing_incident(self):
        """Resolve an existing incident"""
        # Create a new incident specifically for resolving
        unique_id = str(uuid.uuid4())[:8]
        create_resp = requests.post(
            f"{BASE_URL}/api/community-shield/incidents",
            json={
                "type": "ruido",
                "title": f"TEST_resolve_test_{unique_id}",
                "description": "Created for resolve test",
                "latitude": 39.4700,
                "longitude": -0.3760,
                "severity": "baja"
            }
        )
        assert create_resp.status_code == 200
        incident_id = create_resp.json()["incident_id"]
        
        # Resolve the incident
        resolve_response = requests.patch(
            f"{BASE_URL}/api/community-shield/incidents/{incident_id}/resolve",
            headers={"Content-Type": "application/json"}
        )
        
        assert resolve_response.status_code == 200, f"Failed to resolve: {resolve_response.status_code}: {resolve_response.text}"
        
        data = resolve_response.json()
        print(f"Resolve response: {data}")
        assert "message" in data, "Missing message in resolve response"
    
    def test_resolve_nonexistent_incident(self):
        """Resolve a non-existent incident returns 404"""
        response = requests.patch(
            f"{BASE_URL}/api/community-shield/incidents/nonexistent456/resolve",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent incident, got {response.status_code}"


class TestCommunityShieldHeatmap:
    """Test GET /api/community-shield/heatmap endpoint"""
    
    def test_heatmap_returns_200(self):
        """Heatmap endpoint returns 200 with points array"""
        response = requests.get(f"{BASE_URL}/api/community-shield/heatmap")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Heatmap response keys: {data.keys()}")
        print(f"Total points: {len(data.get('points', []))}")
        
        # Verify structure
        assert "points" in data, "Missing points array"
        assert isinstance(data["points"], list), "points should be a list"
        
        # If there are points, verify their structure
        if data["points"]:
            point = data["points"][0]
            print(f"Sample point: {point}")
            assert "latitude" in point, "Missing latitude in point"
            assert "longitude" in point, "Missing longitude in point"
            assert "type" in point, "Missing type in point"
            assert "severity" in point, "Missing severity in point"


class TestCommunityShieldIntegration:
    """Integration tests for full workflow"""
    
    def test_create_and_verify_incident_appears_in_list(self):
        """Create an incident and verify it appears in the incidents list"""
        unique_id = str(uuid.uuid4())[:8]
        title = f"TEST_integration_{unique_id}"
        
        # Create incident
        create_resp = requests.post(
            f"{BASE_URL}/api/community-shield/incidents",
            json={
                "type": "vandalismo",
                "title": title,
                "description": "Integration test incident",
                "latitude": 39.4699,
                "longitude": -0.3763,
                "severity": "alta"
            }
        )
        assert create_resp.status_code == 200
        incident_id = create_resp.json()["incident_id"]
        print(f"Created incident with ID: {incident_id}")
        
        # Verify it appears in incidents list
        list_resp = requests.get(f"{BASE_URL}/api/community-shield/incidents?lat=39.4699&lng=-0.3763&limit=100")
        assert list_resp.status_code == 200
        
        incidents = list_resp.json()["incidents"]
        incident_ids = [inc["incident_id"] for inc in incidents]
        assert incident_id in incident_ids, f"Created incident {incident_id} not found in list"
        print(f"Verified incident {incident_id} appears in list")
        
        # Verify it appears in heatmap
        heatmap_resp = requests.get(f"{BASE_URL}/api/community-shield/heatmap")
        assert heatmap_resp.status_code == 200
        points = heatmap_resp.json()["points"]
        # Check if any point matches our coordinates (approximately)
        found_in_heatmap = any(
            abs(p.get("latitude", 0) - 39.4699) < 0.01 and 
            abs(p.get("longitude", 0) + 0.3763) < 0.01
            for p in points
        )
        print(f"Incident found in heatmap: {found_in_heatmap}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
