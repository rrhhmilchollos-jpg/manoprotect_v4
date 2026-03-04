"""
ManoProtect - CRA Operations & Client App Modules Tests
Testing: CRA dashboard, alarms, protocols, installations, client app arm/disarm, events, users
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "ceo@manoprotect.com"
ADMIN_PASSWORD = "19862210Des"
TEST_INSTALLATION_ID = "030a0734-d116-4802-9052-5be831830c0e"

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestCRADashboard:
    """CRA Dashboard stats endpoint tests"""
    
    def test_cra_dashboard_returns_stats(self, api_client):
        """GET /api/cra/dashboard returns all required stats"""
        response = api_client.get(f"{BASE_URL}/api/cra/dashboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields exist
        assert "total_installations" in data, "Missing total_installations"
        assert "pending_alarms" in data, "Missing pending_alarms"
        assert "total_devices" in data, "Missing total_devices"
        assert "in_progress" in data, "Missing in_progress"
        assert "today_events" in data, "Missing today_events"
        assert "resolved_today" in data, "Missing resolved_today"
        assert "recent_alarms" in data, "Missing recent_alarms"
        
        # Verify types
        assert isinstance(data["total_installations"], int)
        assert isinstance(data["pending_alarms"], int)
        assert isinstance(data["recent_alarms"], list)
        print(f"Dashboard stats: {data['total_installations']} installations, {data['pending_alarms']} pending alarms")


class TestCRAAlarms:
    """CRA Alarms CRUD tests"""
    
    def test_get_alarms_list(self, api_client):
        """GET /api/cra/alarms returns alarm list with enriched client data"""
        response = api_client.get(f"{BASE_URL}/api/cra/alarms?limit=50")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "alarms" in data
        assert "total" in data
        assert isinstance(data["alarms"], list)
        print(f"Got {data['total']} alarms")
        
        # Verify enriched data if alarms exist
        if data["alarms"]:
            alarm = data["alarms"][0]
            assert "id" in alarm
            assert "installation_id" in alarm
            assert "event_type" in alarm
            assert "status" in alarm
            # Enriched fields from installation
            if alarm.get("client_name"):
                print(f"Alarm enriched with client_name: {alarm['client_name']}")
    
    def test_create_alarm_and_log_action(self, api_client):
        """POST /api/cra/alarms creates alarm, POST action logs and updates status"""
        # Create a test alarm
        alarm_data = {
            "installation_id": TEST_INSTALLATION_ID,
            "event_type": "intrusion",
            "zone": "TEST_Zone_A",
            "severity": "high",
            "description": "TEST alarm for automated testing"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/cra/alarms", json=alarm_data)
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        
        created = create_response.json()
        assert "id" in created
        assert created["event_type"] == "intrusion"
        assert created["status"] == "pending"
        alarm_id = created["id"]
        print(f"Created alarm: {alarm_id}")
        
        # Log action: verify_video
        action_response = api_client.post(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/action",
            json={"action": "verify_video", "notes": "TEST video verification"}
        )
        assert action_response.status_code == 200, f"Action failed: {action_response.text}"
        
        action_data = action_response.json()
        assert action_data["status"] == "action_logged"
        print(f"Logged action verify_video on alarm {alarm_id}")
        
        # Log action: resolved to cleanup
        resolve_response = api_client.post(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/action",
            json={"action": "resolved", "notes": "TEST resolved"}
        )
        assert resolve_response.status_code == 200
        print(f"Resolved alarm {alarm_id}")
    
    def test_assign_alarm_to_operator(self, api_client):
        """PATCH /api/cra/alarms/{id}/assign assigns operator to pending alarm"""
        # First create a pending alarm
        alarm_data = {
            "installation_id": TEST_INSTALLATION_ID,
            "event_type": "panic",
            "zone": "TEST_Living_Room",
            "severity": "critical",
            "description": "TEST panic alarm for assignment test"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/cra/alarms", json=alarm_data)
        assert create_response.status_code == 200
        alarm_id = create_response.json()["id"]
        
        # Assign operator
        assign_response = api_client.patch(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/assign",
            json={"operator_id": "operator-test-1"}
        )
        assert assign_response.status_code == 200, f"Assign failed: {assign_response.text}"
        
        assign_data = assign_response.json()
        assert assign_data["status"] == "assigned"
        assert assign_data["operator_id"] == "operator-test-1"
        print(f"Assigned alarm {alarm_id} to operator-test-1")
        
        # Cleanup: resolve the alarm
        api_client.post(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/action",
            json={"action": "resolved", "notes": "TEST cleanup"}
        )
    
    def test_action_updates_status_correctly(self, api_client):
        """POST action with call_police updates status to police_dispatched"""
        # Create alarm
        create_response = api_client.post(
            f"{BASE_URL}/api/cra/alarms",
            json={
                "installation_id": TEST_INSTALLATION_ID,
                "event_type": "sabotage",
                "zone": "TEST_Entry",
                "severity": "critical",
                "description": "TEST sabotage for status update test"
            }
        )
        alarm_id = create_response.json()["id"]
        
        # Log call_police action
        action_response = api_client.post(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/action",
            json={"action": "call_police", "notes": "Police notified"}
        )
        assert action_response.status_code == 200
        
        # Verify status changed
        alarms_response = api_client.get(f"{BASE_URL}/api/cra/alarms")
        alarms = alarms_response.json()["alarms"]
        test_alarm = next((a for a in alarms if a["id"] == alarm_id), None)
        
        if test_alarm:
            assert test_alarm["status"] == "police_dispatched", f"Expected police_dispatched, got {test_alarm['status']}"
            print(f"Status correctly updated to police_dispatched")
        
        # Cleanup
        api_client.post(
            f"{BASE_URL}/api/cra/alarms/{alarm_id}/action",
            json={"action": "resolved", "notes": "TEST cleanup"}
        )


class TestCRAProtocols:
    """CRA Protocols endpoint tests"""
    
    def test_get_protocols_returns_4_protocols(self, api_client):
        """GET /api/cra/protocols returns 4 protocols with steps"""
        response = api_client.get(f"{BASE_URL}/api/cra/protocols")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "protocols" in data
        protocols = data["protocols"]
        
        assert len(protocols) == 4, f"Expected 4 protocols, got {len(protocols)}"
        
        # Verify each protocol has required structure
        expected_ids = ["intrusion", "panic", "sabotage", "fire"]
        for proto in protocols:
            assert "id" in proto
            assert "name" in proto
            assert "steps" in proto
            assert isinstance(proto["steps"], list)
            assert len(proto["steps"]) > 0, f"Protocol {proto['id']} has no steps"
            
            # Verify step structure
            step = proto["steps"][0]
            assert "num" in step
            assert "action" in step
            assert "desc" in step
        
        protocol_ids = [p["id"] for p in protocols]
        for exp_id in expected_ids:
            assert exp_id in protocol_ids, f"Missing protocol: {exp_id}"
        
        print(f"Got {len(protocols)} protocols: {protocol_ids}")


class TestCRAInstallations:
    """CRA Installations CRUD tests"""
    
    def test_get_installations_list(self, api_client):
        """GET /api/cra/installations returns installations list"""
        response = api_client.get(f"{BASE_URL}/api/cra/installations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "installations" in data
        assert "total" in data
        assert isinstance(data["installations"], list)
        
        print(f"Got {data['total']} installations")
        
        if data["installations"]:
            inst = data["installations"][0]
            assert "id" in inst
            assert "client_name" in inst
            assert "address" in inst
            assert "armed_status" in inst
    
    def test_arm_installation(self, api_client):
        """POST /api/cra/installations/{id}/arm changes armed_status"""
        # Get installation first
        inst_response = api_client.get(f"{BASE_URL}/api/cra/installations/{TEST_INSTALLATION_ID}")
        if inst_response.status_code == 404:
            pytest.skip("Test installation not found")
        
        # Arm to total
        arm_response = api_client.post(
            f"{BASE_URL}/api/cra/installations/{TEST_INSTALLATION_ID}/arm",
            json={"mode": "total", "code": ""}
        )
        assert arm_response.status_code == 200, f"Arm failed: {arm_response.text}"
        
        arm_data = arm_response.json()
        assert arm_data["status"] == "ok"
        assert arm_data["armed_status"] == "total"
        print(f"Armed installation to total mode")
        
        # Disarm back
        disarm_response = api_client.post(
            f"{BASE_URL}/api/cra/installations/{TEST_INSTALLATION_ID}/arm",
            json={"mode": "disarmed", "code": ""}
        )
        assert disarm_response.status_code == 200
        print(f"Disarmed installation")


class TestClientAppInstallations:
    """Client App routes tests - uses x-user-email header for auth"""
    
    def test_my_installations_returns_user_installations(self, api_client):
        """GET /api/client-app/my-installations returns installations for authenticated user"""
        response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "installations" in data
        assert isinstance(data["installations"], list)
        
        print(f"User {ADMIN_EMAIL} has {len(data['installations'])} installations")
        
        if data["installations"]:
            inst = data["installations"][0]
            assert "id" in inst
            assert "client_name" in inst
            assert "user_role" in inst
            assert "device_count" in inst
            print(f"First installation: {inst['client_name']}, role: {inst['user_role']}")
    
    def test_my_installations_requires_auth(self, api_client):
        """GET /api/client-app/my-installations returns 401 without email header"""
        response = api_client.get(f"{BASE_URL}/api/client-app/my-installations")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestClientAppArmDisarm:
    """Client app arm/disarm functionality"""
    
    def test_client_arm_changes_mode(self, api_client):
        """POST /api/client-app/installation/{id}/arm changes arm mode from client app"""
        # First verify we have access
        my_inst_response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        installations = my_inst_response.json().get("installations", [])
        
        if not installations:
            pytest.skip("No installations for test user")
        
        install_id = installations[0]["id"]
        
        # Arm to partial
        arm_response = api_client.post(
            f"{BASE_URL}/api/client-app/installation/{install_id}/arm",
            headers={"x-user-email": ADMIN_EMAIL},
            json={"mode": "partial", "code": ""}
        )
        assert arm_response.status_code == 200, f"Arm failed: {arm_response.text}"
        
        arm_data = arm_response.json()
        assert arm_data["status"] == "ok"
        assert arm_data["armed_status"] == "partial"
        print(f"Client armed installation to partial mode")
        
        # Disarm back
        disarm_response = api_client.post(
            f"{BASE_URL}/api/client-app/installation/{install_id}/arm",
            headers={"x-user-email": ADMIN_EMAIL},
            json={"mode": "disarmed", "code": ""}
        )
        assert disarm_response.status_code == 200
        print(f"Client disarmed installation")
    
    def test_client_arm_without_access_fails(self, api_client):
        """POST arm without access returns 403"""
        response = api_client.post(
            f"{BASE_URL}/api/client-app/installation/{TEST_INSTALLATION_ID}/arm",
            headers={"x-user-email": "unauthorized@test.com"},
            json={"mode": "total", "code": ""}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"


class TestClientAppEvents:
    """Client app events history"""
    
    def test_get_installation_events(self, api_client):
        """GET /api/client-app/installation/{id}/events returns event history"""
        # First get user's installation
        my_inst_response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        installations = my_inst_response.json().get("installations", [])
        
        if not installations:
            pytest.skip("No installations for test user")
        
        install_id = installations[0]["id"]
        
        response = api_client.get(
            f"{BASE_URL}/api/client-app/installation/{install_id}/events",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "events" in data
        assert "total" in data
        assert isinstance(data["events"], list)
        
        print(f"Got {data['total']} events for installation")
        
        if data["events"]:
            event = data["events"][0]
            assert "id" in event
            assert "event_type" in event
            assert "created_at" in event


class TestClientAppCameras:
    """Client app cameras endpoint"""
    
    def test_get_installation_cameras(self, api_client):
        """GET /api/client-app/installation/{id}/cameras returns cameras with stream URLs"""
        my_inst_response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        installations = my_inst_response.json().get("installations", [])
        
        if not installations:
            pytest.skip("No installations for test user")
        
        install_id = installations[0]["id"]
        
        response = api_client.get(
            f"{BASE_URL}/api/client-app/installation/{install_id}/cameras",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cameras" in data
        print(f"Got {len(data['cameras'])} cameras")


class TestClientAppUsers:
    """Client app users management"""
    
    def test_list_users(self, api_client):
        """GET /api/client-app/installation/{id}/users returns users list (owner only)"""
        my_inst_response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        installations = my_inst_response.json().get("installations", [])
        
        if not installations:
            pytest.skip("No installations for test user")
        
        install_id = installations[0]["id"]
        user_role = installations[0].get("user_role", "")
        
        response = api_client.get(
            f"{BASE_URL}/api/client-app/installation/{install_id}/users",
            headers={"x-user-email": ADMIN_EMAIL}
        )
        
        if user_role in ["owner", "admin"]:
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert "users" in data
            print(f"Got {len(data['users'])} users for installation")
        else:
            # Non-owner/admin should get 403
            assert response.status_code == 403


class TestCRAProvisionFromCRM:
    """CRA provision-from-crm endpoint"""
    
    def test_provision_from_crm_creates_installation_and_access(self, api_client):
        """POST /api/cra/provision-from-crm creates installation + client access"""
        unique_email = f"TEST_provision_{uuid.uuid4().hex[:8]}@test.com"
        
        response = api_client.post(
            f"{BASE_URL}/api/cra/provision-from-crm",
            json={
                "client_name": "TEST Provision Client",
                "client_email": unique_email,
                "client_phone": "+34600000000",
                "address": "TEST Calle Provision 123",
                "city": "Madrid",
                "postal_code": "28001",
                "plan_type": "hogar-premium"
            }
        )
        assert response.status_code == 200, f"Provision failed: {response.text}"
        
        data = response.json()
        assert data["status"] == "provisioned"
        assert "installation_id" in data
        assert "access_code" in data
        
        print(f"Provisioned installation: {data['installation_id']} with access code: {data['access_code']}")
        
        # Verify client can now access their installation
        my_inst_response = api_client.get(
            f"{BASE_URL}/api/client-app/my-installations",
            headers={"x-user-email": unique_email}
        )
        assert my_inst_response.status_code == 200
        
        installations = my_inst_response.json().get("installations", [])
        assert len(installations) >= 1, "Client should have at least 1 installation after provision"
        
        provisioned_inst = next((i for i in installations if i["id"] == data["installation_id"]), None)
        assert provisioned_inst is not None, "Provisioned installation not found in client's list"
        assert provisioned_inst["user_role"] == "owner", "Client should be owner of provisioned installation"
        
        print(f"Verified client {unique_email} has access to provisioned installation as owner")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
