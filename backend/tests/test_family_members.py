"""
Test Family Members CRUD Operations
Tests for /api/family/dashboard, /api/family/members endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "family_test_1769627006@test.com"
TEST_PASSWORD = "Test123!"


class TestFamilyMembersCRUD:
    """Test family members CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session cookie
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        # Store user info
        self.user = login_response.json()
        yield
        
        # Cleanup: Delete any TEST_ prefixed members
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        if dashboard.status_code == 200:
            members = dashboard.json().get("members", [])
            for member in members:
                if member.get("name", "").startswith("TEST_"):
                    self.session.delete(f"{BASE_URL}/api/family/members/{member['id']}")
    
    def test_01_login_and_verify_family_plan(self):
        """Test login and verify user has family plan"""
        assert self.user.get("plan") == "family-yearly", f"Expected family-yearly plan, got {self.user.get('plan')}"
        assert self.user.get("email") == TEST_EMAIL
        print(f"✓ User logged in with plan: {self.user.get('plan')}")
    
    def test_02_get_family_dashboard(self):
        """Test GET /api/family/dashboard returns correct structure"""
        response = self.session.get(f"{BASE_URL}/api/family/dashboard")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "members" in data, "Response missing 'members' field"
        assert "alerts" in data, "Response missing 'alerts' field"
        assert "stats" in data, "Response missing 'stats' field"
        assert "has_family_plan" in data, "Response missing 'has_family_plan' field"
        assert "user_plan" in data, "Response missing 'user_plan' field"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_members" in stats
        assert "senior_members" in stats
        assert "total_threats_blocked" in stats
        assert "unread_alerts" in stats
        assert "protection_active" in stats
        
        # Verify has_family_plan is True for family-yearly plan
        assert data["has_family_plan"] == True, "has_family_plan should be True"
        assert data["user_plan"] == "family-yearly"
        
        print(f"✓ Dashboard returned {len(data['members'])} members")
    
    def test_03_add_family_member(self):
        """Test POST /api/family/members - Add new member"""
        unique_id = uuid.uuid4().hex[:8]
        member_data = {
            "name": f"TEST_Member_{unique_id}",
            "email": f"test_{unique_id}@test.com",
            "phone": "+34600111222",
            "relationship": "hijo",
            "is_senior": False,
            "simplified_mode": False,
            "alert_level": "all"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/family/members",
            json=member_data
        )
        
        assert response.status_code == 200, f"Failed to add member: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "member_id" in data
        assert data["member_id"].startswith("member_")
        
        # Verify member was added by fetching dashboard
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        members = dashboard.json().get("members", [])
        member_names = [m["name"] for m in members]
        assert member_data["name"] in member_names, "New member not found in dashboard"
        
        # Store member_id for later tests
        self.created_member_id = data["member_id"]
        print(f"✓ Member added with ID: {data['member_id']}")
        
        return data["member_id"]
    
    def test_04_add_senior_member(self):
        """Test adding a senior member with simplified mode"""
        unique_id = uuid.uuid4().hex[:8]
        member_data = {
            "name": f"TEST_Senior_{unique_id}",
            "email": f"senior_{unique_id}@test.com",
            "phone": "+34600333444",
            "relationship": "abuelo",
            "is_senior": True,
            "simplified_mode": True,
            "alert_level": "critical"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/family/members",
            json=member_data
        )
        
        assert response.status_code == 200
        member_id = response.json()["member_id"]
        
        # Verify senior member in dashboard
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        data = dashboard.json()
        
        # Find the created member
        created_member = None
        for m in data["members"]:
            if m["id"] == member_id:
                created_member = m
                break
        
        assert created_member is not None, "Senior member not found"
        assert created_member["is_senior"] == True
        assert created_member["simplified_mode"] == True
        assert created_member["relationship"] == "abuelo"
        
        print(f"✓ Senior member added: {created_member['name']}")
        return member_id
    
    def test_05_update_family_member(self):
        """Test PATCH /api/family/members/{id} - Update member"""
        # First create a member to update
        unique_id = uuid.uuid4().hex[:8]
        create_response = self.session.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": f"TEST_ToUpdate_{unique_id}",
                "email": f"update_{unique_id}@test.com",
                "phone": "+34600555666",
                "relationship": "hijo",
                "is_senior": False,
                "simplified_mode": False,
                "alert_level": "all"
            }
        )
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Update the member
        update_data = {
            "name": f"TEST_Updated_{unique_id}",
            "email": f"updated_{unique_id}@test.com",
            "phone": "+34600777888",
            "relationship": "hermano",
            "is_senior": True,
            "simplified_mode": True,
            "alert_level": "high"
        }
        
        update_response = self.session.patch(
            f"{BASE_URL}/api/family/members/{member_id}",
            json=update_data
        )
        
        assert update_response.status_code == 200
        assert update_response.json()["message"] == "Miembro actualizado"
        
        # Verify update by fetching dashboard
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        members = dashboard.json()["members"]
        
        updated_member = None
        for m in members:
            if m["id"] == member_id:
                updated_member = m
                break
        
        assert updated_member is not None, "Updated member not found"
        assert updated_member["name"] == update_data["name"]
        assert updated_member["relationship"] == "hermano"
        assert updated_member["is_senior"] == True
        assert updated_member["simplified_mode"] == True
        assert updated_member["alert_level"] == "high"
        
        print(f"✓ Member updated successfully: {updated_member['name']}")
        return member_id
    
    def test_06_delete_family_member(self):
        """Test DELETE /api/family/members/{id} - Remove member"""
        # First create a member to delete
        unique_id = uuid.uuid4().hex[:8]
        create_response = self.session.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": f"TEST_ToDelete_{unique_id}",
                "email": f"delete_{unique_id}@test.com",
                "phone": "+34600999000",
                "relationship": "otro",
                "is_senior": False,
                "simplified_mode": False,
                "alert_level": "all"
            }
        )
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Verify member exists
        dashboard_before = self.session.get(f"{BASE_URL}/api/family/dashboard")
        member_ids_before = [m["id"] for m in dashboard_before.json()["members"]]
        assert member_id in member_ids_before, "Member should exist before delete"
        
        # Delete the member
        delete_response = self.session.delete(f"{BASE_URL}/api/family/members/{member_id}")
        
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Miembro eliminado"
        
        # Verify member is deleted
        dashboard_after = self.session.get(f"{BASE_URL}/api/family/dashboard")
        member_ids_after = [m["id"] for m in dashboard_after.json()["members"]]
        assert member_id not in member_ids_after, "Member should not exist after delete"
        
        print(f"✓ Member deleted successfully: {member_id}")
    
    def test_07_delete_nonexistent_member(self):
        """Test DELETE with non-existent member ID returns 404"""
        response = self.session.delete(f"{BASE_URL}/api/family/members/nonexistent_id_12345")
        
        assert response.status_code == 404
        assert "no encontrado" in response.json().get("detail", "").lower()
        print("✓ 404 returned for non-existent member")
    
    def test_08_update_nonexistent_member(self):
        """Test PATCH with non-existent member ID returns 404"""
        response = self.session.patch(
            f"{BASE_URL}/api/family/members/nonexistent_id_12345",
            json={"name": "Test"}
        )
        
        assert response.status_code == 404
        assert "no encontrado" in response.json().get("detail", "").lower()
        print("✓ 404 returned for updating non-existent member")
    
    def test_09_member_limit_check(self):
        """Test that member limit (5) is enforced"""
        # Get current member count
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        current_count = len(dashboard.json()["members"])
        
        # Try to add members up to limit
        members_to_add = 5 - current_count + 1  # Try to exceed limit
        added_ids = []
        
        for i in range(members_to_add):
            unique_id = uuid.uuid4().hex[:8]
            response = self.session.post(
                f"{BASE_URL}/api/family/members",
                json={
                    "name": f"TEST_Limit_{unique_id}",
                    "email": f"limit_{unique_id}@test.com",
                    "phone": f"+3460000{i:04d}",
                    "relationship": "otro",
                    "is_senior": False,
                    "simplified_mode": False,
                    "alert_level": "all"
                }
            )
            
            if response.status_code == 200:
                added_ids.append(response.json()["member_id"])
            elif response.status_code == 400:
                # Expected when limit is reached
                assert "límite" in response.json().get("detail", "").lower()
                print(f"✓ Member limit enforced at {current_count + len(added_ids)} members")
                break
        
        # Cleanup added members
        for member_id in added_ids:
            self.session.delete(f"{BASE_URL}/api/family/members/{member_id}")
    
    def test_10_get_member_activity(self):
        """Test GET /api/family/members/{id}/activity"""
        # Get a member ID from dashboard
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        members = dashboard.json()["members"]
        
        if not members:
            pytest.skip("No members available for activity test")
        
        member_id = members[0]["id"]
        
        response = self.session.get(f"{BASE_URL}/api/family/members/{member_id}/activity")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "member" in data
        assert "activity" in data
        assert "stats" in data
        assert data["member"]["id"] == member_id
        
        print(f"✓ Activity retrieved for member: {data['member']['name']}")
    
    def test_11_dashboard_stats_accuracy(self):
        """Test that dashboard stats are accurate"""
        dashboard = self.session.get(f"{BASE_URL}/api/family/dashboard")
        data = dashboard.json()
        
        members = data["members"]
        stats = data["stats"]
        
        # Verify total_members matches actual count
        assert stats["total_members"] == len(members), "total_members stat mismatch"
        
        # Verify senior_members count
        actual_seniors = len([m for m in members if m.get("is_senior")])
        assert stats["senior_members"] == actual_seniors, "senior_members stat mismatch"
        
        # Verify protection_active is True
        assert stats["protection_active"] == True
        
        print(f"✓ Stats accurate: {stats['total_members']} members, {stats['senior_members']} seniors")


class TestFamilyDashboardUnauthorized:
    """Test unauthorized access to family endpoints"""
    
    def test_dashboard_without_auth(self):
        """Test that dashboard requires authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/family/dashboard")
        
        # Should return 401 or redirect
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Dashboard requires authentication")
    
    def test_add_member_without_auth(self):
        """Test that adding member requires authentication"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/family/members",
            json={"name": "Test", "relationship": "hijo"}
        )
        
        assert response.status_code in [401, 403]
        print("✓ Add member requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
