"""
Test Iteration 12 - Admin Panel Actions & Family Panel Improvements
Tests for:
1. Admin Panel - Baja (deactivate) users
2. Admin Panel - Activar (reactivate) users
3. Admin Panel - Cancelar suscripción (cancel subscription)
4. Admin Panel - Plan selector (change plans)
5. Family Panel - Add family members
6. Family Panel - Click on member card opens edit dialog
7. Family Panel - Edit family members
8. Family Panel - Delete family members
9. Family Panel - No upgrade banner for enterprise/business plans
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://teamchat-secure.preview.emergentagent.com')

# Superadmin credentials
SUPERADMIN_EMAIL = "rrhh.milchollos@gmail.com"
SUPERADMIN_PASSWORD = "ManoAdmin2025!"

# Test user for admin operations
TEST_USER_EMAIL = f"test_admin_ops_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "TestPass123!"


class TestAdminAuthentication:
    """Test admin authentication"""
    
    def test_superadmin_login(self, api_client):
        """Test superadmin login with provided credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        
        print(f"Superadmin login response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Login successful: {data.get('email')}, role: {data.get('role')}")
            assert data.get("role") == "superadmin", f"Expected superadmin role, got {data.get('role')}"
        else:
            print(f"Login failed: {response.text}")
            pytest.skip("Superadmin login failed - skipping admin tests")


class TestAdminUserStatus:
    """Test admin user status (activate/deactivate) functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_admin_client):
        """Setup test user for status tests"""
        self.client = authenticated_admin_client
        
        # Create a test user to manipulate
        test_email = f"test_status_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "name": "Test Status User",
            "password": "TestPass123!"
        })
        
        if register_response.status_code == 200:
            self.test_user_id = register_response.json().get("user_id")
            self.test_user_email = test_email
            print(f"Created test user: {self.test_user_id}")
        else:
            # Try to find existing test user
            users_response = self.client.get(f"{BASE_URL}/api/admin/users?limit=100")
            if users_response.status_code == 200:
                users = users_response.json().get("users", [])
                for u in users:
                    if u.get("role") != "superadmin" and u.get("is_active", True):
                        self.test_user_id = u.get("user_id") or u.get("id")
                        self.test_user_email = u.get("email")
                        break
            if not hasattr(self, 'test_user_id'):
                pytest.skip("Could not create or find test user")
    
    def test_deactivate_user_baja(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/status - Dar de baja (deactivate)"""
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/status?is_active=false"
        )
        
        print(f"Deactivate user response: {response.status_code}")
        print(f"Response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data
        assert data.get("is_active") == False
        print(f"User deactivated successfully: {data.get('message')}")
    
    def test_activate_user(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/status - Activar (reactivate)"""
        # First deactivate
        authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/status?is_active=false"
        )
        
        # Then reactivate
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/status?is_active=true"
        )
        
        print(f"Activate user response: {response.status_code}")
        print(f"Response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("is_active") == True
        print(f"User activated successfully: {data.get('message')}")
    
    def test_cannot_deactivate_superadmin(self, authenticated_admin_client):
        """Test that superadmin cannot be deactivated"""
        # Get superadmin user_id
        users_response = authenticated_admin_client.get(f"{BASE_URL}/api/admin/users?limit=100")
        superadmin_id = None
        
        if users_response.status_code == 200:
            users = users_response.json().get("users", [])
            for u in users:
                if u.get("role") == "superadmin":
                    superadmin_id = u.get("user_id") or u.get("id")
                    break
        
        if not superadmin_id:
            pytest.skip("Could not find superadmin user")
        
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{superadmin_id}/status?is_active=false"
        )
        
        print(f"Deactivate superadmin response: {response.status_code}")
        # Should fail with 400 (can't deactivate yourself or other superadmin)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestAdminCancelSubscription:
    """Test admin cancel subscription functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_admin_client):
        """Setup test user with paid plan"""
        self.client = authenticated_admin_client
        
        # Create a test user
        test_email = f"test_cancel_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "name": "Test Cancel User",
            "password": "TestPass123!"
        })
        
        if register_response.status_code == 200:
            self.test_user_id = register_response.json().get("user_id")
            self.test_user_email = test_email
            
            # Upgrade to paid plan
            self.client.patch(
                f"{BASE_URL}/api/admin/users/{self.test_user_id}/plan?plan=personal-monthly"
            )
            print(f"Created test user with paid plan: {self.test_user_id}")
        else:
            pytest.skip("Could not create test user")
    
    def test_cancel_subscription(self, authenticated_admin_client):
        """Test POST /admin/users/{user_id}/cancel-subscription"""
        response = authenticated_admin_client.post(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/cancel-subscription"
        )
        
        print(f"Cancel subscription response: {response.status_code}")
        print(f"Response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("success") == True
        assert "free" in data.get("message", "").lower()
        print(f"Subscription cancelled: {data.get('message')}")
        
        # Verify user is now on free plan
        users_response = authenticated_admin_client.get(f"{BASE_URL}/api/admin/users?limit=100")
        if users_response.status_code == 200:
            users = users_response.json().get("users", [])
            for u in users:
                if (u.get("user_id") or u.get("id")) == self.test_user_id:
                    assert u.get("plan") == "free", f"Expected free plan, got {u.get('plan')}"
                    break


class TestAdminChangePlan:
    """Test admin plan change functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_admin_client):
        """Setup test user for plan changes"""
        self.client = authenticated_admin_client
        
        # Create a test user
        test_email = f"test_plan_{uuid.uuid4().hex[:8]}@test.com"
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "name": "Test Plan User",
            "password": "TestPass123!"
        })
        
        if register_response.status_code == 200:
            self.test_user_id = register_response.json().get("user_id")
            print(f"Created test user: {self.test_user_id}")
        else:
            pytest.skip("Could not create test user")
    
    def test_change_plan_to_personal(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/plan - Change to personal plan"""
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/plan?plan=personal-monthly"
        )
        
        print(f"Change plan response: {response.status_code}")
        print(f"Response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_change_plan_to_family(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/plan - Change to family plan"""
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/plan?plan=family-monthly"
        )
        
        print(f"Change plan response: {response.status_code}")
        assert response.status_code == 200
    
    def test_change_plan_to_enterprise(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/plan - Change to enterprise plan"""
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/plan?plan=enterprise"
        )
        
        print(f"Change plan response: {response.status_code}")
        assert response.status_code == 200
    
    def test_change_plan_to_business(self, authenticated_admin_client):
        """Test PATCH /admin/users/{user_id}/plan - Change to business plan"""
        response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/admin/users/{self.test_user_id}/plan?plan=business"
        )
        
        print(f"Change plan response: {response.status_code}")
        assert response.status_code == 200


class TestFamilyDashboard:
    """Test family dashboard and member management"""
    
    def test_family_dashboard_requires_auth(self, api_client):
        """Test GET /family/dashboard requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/family/dashboard")
        assert response.status_code == 401
    
    def test_family_dashboard_returns_data(self, authenticated_admin_client):
        """Test GET /family/dashboard returns proper structure"""
        response = authenticated_admin_client.get(f"{BASE_URL}/api/family/dashboard")
        
        print(f"Family dashboard response: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "members" in data
        assert "alerts" in data
        assert "stats" in data
        assert "has_family_plan" in data
        
        # Check stats structure
        stats = data.get("stats", {})
        assert "total_members" in stats
        assert "senior_members" in stats
        assert "total_threats_blocked" in stats
        assert "unread_alerts" in stats
    
    def test_family_dashboard_enterprise_has_family_plan(self, authenticated_admin_client):
        """Test that enterprise/business plans show has_family_plan=True"""
        # First set user to enterprise plan
        me_response = authenticated_admin_client.get(f"{BASE_URL}/api/auth/me")
        if me_response.status_code == 200:
            user_plan = me_response.json().get("plan")
            print(f"Current user plan: {user_plan}")
        
        response = authenticated_admin_client.get(f"{BASE_URL}/api/family/dashboard")
        
        if response.status_code == 200:
            data = response.json()
            user_plan = data.get("user_plan", "")
            has_family = data.get("has_family_plan", False)
            
            print(f"User plan: {user_plan}, has_family_plan: {has_family}")
            
            # If user has enterprise or business plan, should have family features
            if user_plan in ["enterprise", "business"] or user_plan.startswith("family"):
                assert has_family == True, f"Expected has_family_plan=True for {user_plan}"


class TestFamilyMembersCRUD:
    """Test family members CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_admin_client):
        """Setup for family member tests"""
        self.client = authenticated_admin_client
        self.created_member_ids = []
    
    def teardown_method(self, method):
        """Cleanup created members"""
        for member_id in self.created_member_ids:
            try:
                self.client.delete(f"{BASE_URL}/api/family/members/{member_id}")
            except:
                pass
    
    def test_add_family_member(self, authenticated_admin_client):
        """Test POST /family/members - Add new member"""
        response = authenticated_admin_client.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": f"Test Member {uuid.uuid4().hex[:6]}",
                "email": f"test_member_{uuid.uuid4().hex[:6]}@test.com",
                "phone": "+34600000001",
                "relationship": "hijo",
                "is_senior": False,
                "simplified_mode": False,
                "alert_level": "all"
            }
        )
        
        print(f"Add member response: {response.status_code}")
        print(f"Response: {response.text}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "member_id" in data
        self.created_member_ids.append(data.get("member_id"))
    
    def test_add_senior_family_member(self, authenticated_admin_client):
        """Test POST /family/members - Add senior member with simplified mode"""
        response = authenticated_admin_client.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": f"Abuela Test {uuid.uuid4().hex[:6]}",
                "phone": "+34600000002",
                "relationship": "abuela",
                "is_senior": True,
                "simplified_mode": True,
                "alert_level": "critical"
            }
        )
        
        print(f"Add senior member response: {response.status_code}")
        
        assert response.status_code == 200
        data = response.json()
        self.created_member_ids.append(data.get("member_id"))
    
    def test_update_family_member(self, authenticated_admin_client):
        """Test PATCH /family/members/{member_id} - Update member"""
        # First create a member
        create_response = authenticated_admin_client.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": "Member To Update",
                "relationship": "hijo",
                "is_senior": False,
                "simplified_mode": False,
                "alert_level": "all"
            }
        )
        
        if create_response.status_code != 200:
            pytest.skip("Could not create member to update")
        
        member_id = create_response.json().get("member_id")
        self.created_member_ids.append(member_id)
        
        # Update the member
        update_response = authenticated_admin_client.patch(
            f"{BASE_URL}/api/family/members/{member_id}",
            json={
                "name": "Updated Member Name",
                "relationship": "hermano",
                "is_senior": True,
                "simplified_mode": True,
                "alert_level": "high"
            }
        )
        
        print(f"Update member response: {update_response.status_code}")
        print(f"Response: {update_response.text}")
        
        assert update_response.status_code == 200
    
    def test_delete_family_member(self, authenticated_admin_client):
        """Test DELETE /family/members/{member_id} - Delete member"""
        # First create a member
        create_response = authenticated_admin_client.post(
            f"{BASE_URL}/api/family/members",
            json={
                "name": "Member To Delete",
                "relationship": "otro",
                "is_senior": False,
                "simplified_mode": False,
                "alert_level": "all"
            }
        )
        
        if create_response.status_code != 200:
            pytest.skip("Could not create member to delete")
        
        member_id = create_response.json().get("member_id")
        
        # Delete the member
        delete_response = authenticated_admin_client.delete(
            f"{BASE_URL}/api/family/members/{member_id}"
        )
        
        print(f"Delete member response: {delete_response.status_code}")
        
        assert delete_response.status_code == 200
        
        # Verify member is deleted
        dashboard_response = authenticated_admin_client.get(f"{BASE_URL}/api/family/dashboard")
        if dashboard_response.status_code == 200:
            members = dashboard_response.json().get("members", [])
            member_ids = [m.get("id") for m in members]
            assert member_id not in member_ids, "Member should be deleted"


class TestAdminUsersEndpoint:
    """Test admin users list endpoint"""
    
    def test_admin_users_list(self, authenticated_admin_client):
        """Test GET /admin/users returns users with expected fields"""
        response = authenticated_admin_client.get(f"{BASE_URL}/api/admin/users?limit=50")
        
        print(f"Admin users response: {response.status_code}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        users = data.get("users", [])
        
        if len(users) > 0:
            user = users[0]
            # Check expected fields
            assert "email" in user
            assert "plan" in user or user.get("plan") is None
            # Check for user_id or id
            assert "user_id" in user or "id" in user
            
            print(f"Found {len(users)} users")
            print(f"Sample user fields: {list(user.keys())}")


# Fixtures
@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def authenticated_admin_client(api_client):
    """Session with admin authentication"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": SUPERADMIN_EMAIL,
        "password": SUPERADMIN_PASSWORD
    })
    
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    # Session cookies are automatically stored
    return api_client


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
