"""
MANO Platform - Iteration 9 Tests
Testing: Banking supported banks (11 banks including N26, Imagin, Nickel),
Admin panel tabs (Suscripciones, Base de Datos), Admin login, 
Admin subscriptions endpoint, Admin user plan update endpoint
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://payment-dashboard-70.preview.emergentagent.com').rstrip('/')

class TestBankingSupportedBanks:
    """Test /api/banking/supported-banks endpoint - should return 11 banks including N26, Imagin, Nickel"""
    
    def test_supported_banks_returns_11_banks(self):
        """Verify endpoint returns exactly 11 supported banks"""
        response = requests.get(f"{BASE_URL}/api/banking/supported-banks")
        assert response.status_code == 200
        
        data = response.json()
        assert "banks" in data
        assert len(data["banks"]) == 11
        print(f"SUCCESS: Returned {len(data['banks'])} banks")
    
    def test_supported_banks_includes_new_banks(self):
        """Verify N26, Imagin, and Nickel are in the list"""
        response = requests.get(f"{BASE_URL}/api/banking/supported-banks")
        assert response.status_code == 200
        
        data = response.json()
        banks = data["banks"]
        
        # Check for new banks
        assert "N26" in banks, "N26 should be in supported banks"
        assert "Imagin" in banks, "Imagin should be in supported banks"
        assert "Nickel" in banks, "Nickel should be in supported banks"
        print("SUCCESS: N26, Imagin, Nickel all present in supported banks")
    
    def test_supported_banks_includes_original_banks(self):
        """Verify original Spanish banks are still present"""
        response = requests.get(f"{BASE_URL}/api/banking/supported-banks")
        assert response.status_code == 200
        
        data = response.json()
        banks = data["banks"]
        
        original_banks = ["Santander", "BBVA", "CaixaBank", "Sabadell", 
                         "Bankinter", "ING", "Unicaja", "Kutxabank"]
        
        for bank in original_banks:
            assert bank in banks, f"{bank} should be in supported banks"
        print("SUCCESS: All original 8 Spanish banks present")


class TestAdminLogin:
    """Test admin login with credentials admin@mano.com / Admin123!"""
    
    def test_admin_login_success(self):
        """Verify admin can login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == "admin@mano.com"
        assert data["role"] == "admin"
        print(f"SUCCESS: Admin login successful, user_id: {data['user_id']}")
    
    def test_admin_login_invalid_password(self):
        """Verify login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "WrongPassword123!"}
        )
        assert response.status_code == 401
        print("SUCCESS: Invalid password correctly rejected")


class TestAdminSubscriptions:
    """Test /api/admin/subscriptions endpoint"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_subscriptions_requires_auth(self):
        """Verify endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 401
        print("SUCCESS: Subscriptions endpoint requires authentication")
    
    def test_subscriptions_returns_data(self, admin_session):
        """Verify endpoint returns subscription data structure"""
        response = admin_session.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 200
        
        data = response.json()
        assert "subscribers" in data
        assert "stats" in data
        assert "recent_changes" in data
        
        # Verify stats structure
        assert "total_premium" in data["stats"]
        assert "by_plan" in data["stats"]
        
        print(f"SUCCESS: Subscriptions endpoint returned {data['stats']['total_premium']} premium users")


class TestAdminUserPlanUpdate:
    """Test PATCH /api/admin/users/{user_id}/plan endpoint"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    @pytest.fixture
    def test_user(self, admin_session):
        """Create a test user for plan update testing"""
        # Register a new test user
        test_email = f"test_plan_{uuid.uuid4().hex[:8]}@mano.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "name": "Test Plan User",
                "password": "TestPass123!"
            }
        )
        if response.status_code == 200:
            return response.json()
        # If user exists, try to find them
        return {"user_id": None, "email": test_email}
    
    def test_plan_update_requires_auth(self):
        """Verify endpoint requires authentication"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/users/test_user_id/plan?plan=personal"
        )
        assert response.status_code == 401
        print("SUCCESS: Plan update endpoint requires authentication")
    
    def test_plan_update_invalid_plan(self, admin_session):
        """Verify invalid plan is rejected"""
        # Get a user first
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users?limit=1")
        assert users_response.status_code == 200
        users = users_response.json()["users"]
        
        if users:
            user_id = users[0].get("user_id") or users[0].get("id")
            response = admin_session.patch(
                f"{BASE_URL}/api/admin/users/{user_id}/plan?plan=invalid_plan"
            )
            assert response.status_code == 400
            print("SUCCESS: Invalid plan correctly rejected")
    
    def test_plan_update_success(self, admin_session, test_user):
        """Verify plan can be updated successfully"""
        if not test_user.get("user_id"):
            pytest.skip("Could not create test user")
        
        user_id = test_user["user_id"]
        
        # Update to personal plan
        response = admin_session.patch(
            f"{BASE_URL}/api/admin/users/{user_id}/plan?plan=personal"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["new_plan"] == "personal"
        print(f"SUCCESS: Plan updated to personal for user {user_id}")
        
        # Verify in subscriptions
        subs_response = admin_session.get(f"{BASE_URL}/api/admin/subscriptions")
        assert subs_response.status_code == 200
        
        # Revert to free
        revert_response = admin_session.patch(
            f"{BASE_URL}/api/admin/users/{user_id}/plan?plan=free"
        )
        assert revert_response.status_code == 200
        print("SUCCESS: Plan reverted to free")
    
    def test_plan_update_all_valid_plans(self, admin_session, test_user):
        """Verify all valid plans can be set"""
        if not test_user.get("user_id"):
            pytest.skip("Could not create test user")
        
        user_id = test_user["user_id"]
        valid_plans = ["free", "personal", "family", "business", "enterprise"]
        
        for plan in valid_plans:
            response = admin_session.patch(
                f"{BASE_URL}/api/admin/users/{user_id}/plan?plan={plan}"
            )
            assert response.status_code == 200
            assert response.json()["new_plan"] == plan
            print(f"SUCCESS: Plan '{plan}' set successfully")
        
        # Revert to free
        admin_session.patch(f"{BASE_URL}/api/admin/users/{user_id}/plan?plan=free")


class TestAdminDashboard:
    """Test admin dashboard endpoint"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_dashboard_requires_auth(self):
        """Verify dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401
        print("SUCCESS: Dashboard requires authentication")
    
    def test_dashboard_returns_stats(self, admin_session):
        """Verify dashboard returns statistics"""
        response = admin_session.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "stats" in data
        assert "total_users" in data["stats"]
        assert "premium_users" in data["stats"]
        assert "pending_investors" in data["stats"]
        assert "approved_investors" in data["stats"]
        
        print(f"SUCCESS: Dashboard stats - {data['stats']['total_users']} total users, {data['stats']['premium_users']} premium")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
