"""
ManoProtect - Final Production Audit Tests
AUDITORÍA FINAL PARA PRODUCCIÓN - CERO ERRORES
Tests all critical APIs and features for production deployment
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://portal-test-2.preview.emergentagent.com')

# Test credentials
SUPERADMIN_EMAIL = "info@manoprotect.com"
SUPERADMIN_PASSWORD = "19862210Des"
TEST_USER_EMAIL = "reviewer@manoprotect.com"
TEST_USER_PASSWORD = "ReviewMano2025!"


class TestHealthAndPublicAPIs:
    """Test health check and public APIs"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy", f"Database not healthy: {data}"
        assert data.get("database") == "healthy", f"Database not healthy: {data}"
        print(f"✅ Health check passed: {data}")
    
    def test_plans_endpoint(self):
        """Test /api/plans returns subscription plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200, f"Plans endpoint failed: {response.text}"
        data = response.json()
        assert "individual_plans" in data, "Missing individual_plans"
        assert "family_plans" in data, "Missing family_plans"
        assert "business_plans" in data, "Missing business_plans"
        assert len(data["individual_plans"]) >= 3, "Not enough individual plans"
        assert len(data["family_plans"]) >= 3, "Not enough family plans"
        print(f"✅ Plans endpoint passed: {len(data['individual_plans'])} individual, {len(data['family_plans'])} family plans")
    
    def test_knowledge_base_endpoint(self):
        """Test /api/knowledge-base returns threat types"""
        response = requests.get(f"{BASE_URL}/api/knowledge-base")
        assert response.status_code == 200, f"Knowledge base failed: {response.text}"
        data = response.json()
        assert "threat_types" in data, "Missing threat_types"
        assert len(data["threat_types"]) >= 3, "Not enough threat types"
        print(f"✅ Knowledge base passed: {len(data['threat_types'])} threat types")
    
    def test_community_alerts_endpoint(self):
        """Test /api/community-alerts returns alerts"""
        response = requests.get(f"{BASE_URL}/api/community-alerts")
        assert response.status_code == 200, f"Community alerts failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Community alerts should be a list"
        print(f"✅ Community alerts passed: {len(data)} alerts")


class TestAuthentication:
    """Test authentication flows"""
    
    def test_superadmin_login(self):
        """Test superadmin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Superadmin login failed: {response.text}"
        data = response.json()
        assert data.get("email") == SUPERADMIN_EMAIL, "Email mismatch"
        assert data.get("role") in ["admin", "superadmin"], f"Expected admin role, got: {data.get('role')}"
        print(f"✅ Superadmin login passed: {data.get('name')} ({data.get('role')})")
    
    def test_test_user_login(self):
        """Test regular user login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Test user login failed: {response.text}"
        data = response.json()
        assert data.get("email") == TEST_USER_EMAIL, "Email mismatch"
        print(f"✅ Test user login passed: {data.get('name')}")
    
    def test_invalid_login(self):
        """Test invalid login returns error"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 404], f"Expected 401/404, got: {response.status_code}"
        print(f"✅ Invalid login correctly rejected")


class TestAuthenticatedAPIs:
    """Test APIs that require authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.user_data = response.json()
    
    def test_auth_me(self):
        """Test /api/auth/me returns current user"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200, f"Auth me failed: {response.text}"
        data = response.json()
        assert data.get("email") == SUPERADMIN_EMAIL, "Email mismatch"
        print(f"✅ Auth me passed: {data.get('email')}")
    
    def test_profile(self):
        """Test /api/profile returns user profile"""
        response = self.session.get(f"{BASE_URL}/api/profile")
        assert response.status_code == 200, f"Profile failed: {response.text}"
        data = response.json()
        assert "user" in data or "email" in data, "Missing user data in profile"
        print(f"✅ Profile endpoint passed")
    
    def test_notifications(self):
        """Test /api/notifications returns notifications"""
        response = self.session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200, f"Notifications failed: {response.text}"
        data = response.json()
        assert "notifications" in data, "Missing notifications"
        assert "unread_count" in data, "Missing unread_count"
        print(f"✅ Notifications passed: {data.get('unread_count')} unread")
    
    def test_notification_preferences(self):
        """Test /api/notifications/preferences"""
        response = self.session.get(f"{BASE_URL}/api/notifications/preferences")
        assert response.status_code == 200, f"Notification preferences failed: {response.text}"
        print(f"✅ Notification preferences passed")
    
    def test_alerts_history(self):
        """Test /api/alerts/history returns alert history"""
        response = self.session.get(f"{BASE_URL}/api/alerts/history")
        assert response.status_code == 200, f"Alerts history failed: {response.text}"
        print(f"✅ Alerts history passed")
    
    def test_threats(self):
        """Test /api/threats returns threats"""
        response = self.session.get(f"{BASE_URL}/api/threats")
        assert response.status_code == 200, f"Threats failed: {response.text}"
        print(f"✅ Threats endpoint passed")
    
    def test_stats(self):
        """Test /api/stats returns user stats"""
        response = self.session.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200, f"Stats failed: {response.text}"
        print(f"✅ Stats endpoint passed")


class TestFamilyFeatures:
    """Test family-related features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_family_dashboard(self):
        """Test /api/family/dashboard"""
        response = self.session.get(f"{BASE_URL}/api/family/dashboard")
        assert response.status_code == 200, f"Family dashboard failed: {response.text}"
        data = response.json()
        assert "members" in data or "stats" in data, "Missing family data"
        print(f"✅ Family dashboard passed")
    
    def test_family_members(self):
        """Test /api/family/members"""
        response = self.session.get(f"{BASE_URL}/api/family/members")
        assert response.status_code == 200, f"Family members failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Family members should be a list"
        print(f"✅ Family members passed: {len(data)} members")
    
    def test_family_my_status(self):
        """Test /api/family/my-status"""
        response = self.session.get(f"{BASE_URL}/api/family/my-status")
        assert response.status_code == 200, f"Family status failed: {response.text}"
        print(f"✅ Family status passed")
    
    def test_family_linked_members(self):
        """Test /api/family/linked-members"""
        response = self.session.get(f"{BASE_URL}/api/family/linked-members")
        assert response.status_code == 200, f"Linked members failed: {response.text}"
        print(f"✅ Linked members passed")


class TestSOSFeatures:
    """Test SOS emergency features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_sos_history(self):
        """Test /api/sos/history"""
        response = self.session.get(f"{BASE_URL}/api/sos/history")
        assert response.status_code == 200, f"SOS history failed: {response.text}"
        data = response.json()
        assert "alerts" in data, "Missing alerts in SOS history"
        print(f"✅ SOS history passed: {len(data.get('alerts', []))} alerts")
    
    def test_sos_premium_active(self):
        """Test /api/sos/premium/active"""
        response = self.session.get(f"{BASE_URL}/api/sos/premium/active")
        assert response.status_code == 200, f"SOS premium active failed: {response.text}"
        print(f"✅ SOS premium active passed")
    
    def test_sos_premium_history(self):
        """Test /api/sos/premium/history"""
        response = self.session.get(f"{BASE_URL}/api/sos/premium/history")
        assert response.status_code == 200, f"SOS premium history failed: {response.text}"
        print(f"✅ SOS premium history passed")


class TestContactsFeatures:
    """Test contacts features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_get_contacts(self):
        """Test GET /api/contacts"""
        response = self.session.get(f"{BASE_URL}/api/contacts")
        assert response.status_code == 200, f"Get contacts failed: {response.text}"
        print(f"✅ Get contacts passed")
    
    def test_get_trusted_contacts(self):
        """Test GET /api/contacts/trusted"""
        response = self.session.get(f"{BASE_URL}/api/contacts/trusted")
        assert response.status_code == 200, f"Get trusted contacts failed: {response.text}"
        print(f"✅ Get trusted contacts passed")


class TestHealthProfile:
    """Test health profile features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_get_health_profile(self):
        """Test GET /api/health/profile"""
        response = self.session.get(f"{BASE_URL}/api/health/profile")
        assert response.status_code == 200, f"Get health profile failed: {response.text}"
        print(f"✅ Get health profile passed")


class TestAdminFeatures:
    """Test admin panel features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as superadmin"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_admin_dashboard(self):
        """Test /api/admin/dashboard"""
        response = self.session.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 200, f"Admin dashboard failed: {response.text}"
        data = response.json()
        assert "stats" in data, "Missing stats in admin dashboard"
        print(f"✅ Admin dashboard passed: {data.get('stats', {}).get('total_users', 0)} users")
    
    def test_admin_users(self):
        """Test /api/admin/users"""
        response = self.session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200, f"Admin users failed: {response.text}"
        data = response.json()
        assert "users" in data, "Missing users in admin response"
        assert "total" in data, "Missing total in admin response"
        print(f"✅ Admin users passed: {data.get('total', 0)} total users")
    
    def test_admin_subscriptions(self):
        """Test /api/admin/subscriptions"""
        response = self.session.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 200, f"Admin subscriptions failed: {response.text}"
        print(f"✅ Admin subscriptions passed")


class TestChildTracking:
    """Test child tracking features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_family_children(self):
        """Test /api/family/children"""
        response = self.session.get(f"{BASE_URL}/api/family/children")
        assert response.status_code == 200, f"Family children failed: {response.text}"
        data = response.json()
        assert "children" in data or "feature_available" in data, "Missing children data"
        print(f"✅ Family children passed")


class TestLocationFeatures:
    """Test location features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        self.session = requests.Session()
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
    
    def test_family_locations(self):
        """Test /api/location/family"""
        response = self.session.get(f"{BASE_URL}/api/location/family")
        assert response.status_code == 200, f"Family locations failed: {response.text}"
        print(f"✅ Family locations passed")


class TestRegistration:
    """Test user registration"""
    
    def test_register_endpoint_exists(self):
        """Test that registration endpoint exists"""
        # Test with invalid data to verify endpoint exists
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "",
            "password": "",
            "name": ""
        })
        # Should return 400 or 422 for validation error, not 404
        assert response.status_code in [400, 422, 200, 201], f"Register endpoint issue: {response.status_code}"
        print(f"✅ Register endpoint exists (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
