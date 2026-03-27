"""
ManoProtect Production Readiness Tests
Tests all critical APIs and flows for production deployment
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from the request
SUPERADMIN_CREDS = {
    "email": "info@manoprotectt.com",
    "password": "19862210Des"
}

TEST_USER_CREDS = {
    "email": "reviewer@manoprotectt.com",
    "password": "ReviewMano2025!"
}


class TestHealthAndBasicAPIs:
    """Test basic API health and public endpoints"""
    
    def test_api_health(self):
        """Test API is responding"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print(f"✅ API Health: {response.status_code}")
    
    def test_plans_endpoint(self):
        """Test /api/plans returns subscription plans"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=10)
        assert response.status_code == 200, f"Plans endpoint failed: {response.status_code}"
        data = response.json()
        
        # Verify structure
        assert "individual_plans" in data, "Missing individual_plans"
        assert "family_plans" in data, "Missing family_plans"
        assert "business_plans" in data, "Missing business_plans"
        assert data.get("currency") == "EUR", "Currency should be EUR"
        
        # Verify plans exist
        assert len(data["individual_plans"]) > 0, "No individual plans"
        assert len(data["family_plans"]) > 0, "No family plans"
        
        print(f"✅ Plans API: {len(data['individual_plans'])} individual, {len(data['family_plans'])} family plans")
    
    def test_knowledge_base(self):
        """Test knowledge base endpoint"""
        response = requests.get(f"{BASE_URL}/api/knowledge-base", timeout=10)
        assert response.status_code == 200, f"Knowledge base failed: {response.status_code}"
        data = response.json()
        assert "threat_types" in data, "Missing threat_types"
        print(f"✅ Knowledge Base: {len(data['threat_types'])} threat types")
    
    def test_community_alerts(self):
        """Test community alerts endpoint"""
        response = requests.get(f"{BASE_URL}/api/community-alerts", timeout=10)
        assert response.status_code == 200, f"Community alerts failed: {response.status_code}"
        print(f"✅ Community Alerts: {response.status_code}")


class TestAuthentication:
    """Test authentication flows"""
    
    @pytest.fixture
    def session(self):
        return requests.Session()
    
    def test_login_superadmin(self, session):
        """Test superadmin login"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        assert response.status_code == 200, f"Superadmin login failed: {response.status_code} - {response.text}"
        data = response.json()
        
        assert "user_id" in data, "Missing user_id in response"
        assert data.get("email") == SUPERADMIN_CREDS["email"], "Email mismatch"
        assert data.get("role") in ["admin", "superadmin"], f"Expected admin role, got {data.get('role')}"
        
        print(f"✅ Superadmin Login: {data.get('email')} - Role: {data.get('role')}")
        return session
    
    def test_login_test_user(self, session):
        """Test regular user login"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_USER_CREDS,
            timeout=10
        )
        
        # User might not exist yet, so we handle both cases
        if response.status_code == 401:
            print(f"⚠️ Test user not found - may need to register first")
            pytest.skip("Test user not registered")
        
        assert response.status_code == 200, f"Test user login failed: {response.status_code}"
        data = response.json()
        assert "user_id" in data, "Missing user_id"
        print(f"✅ Test User Login: {data.get('email')} - Plan: {data.get('plan')}")
    
    def test_auth_me_endpoint(self, session):
        """Test /api/auth/me returns user data after login"""
        # First login
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        assert login_response.status_code == 200, "Login failed"
        
        # Then check /auth/me
        me_response = session.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert me_response.status_code == 200, f"Auth/me failed: {me_response.status_code}"
        data = me_response.json()
        assert data.get("email") == SUPERADMIN_CREDS["email"], "Email mismatch in /auth/me"
        print(f"✅ Auth/me: {data.get('name')} ({data.get('email')})")


class TestDashboardAndProfile:
    """Test dashboard and profile endpoints"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_profile_endpoint(self, authenticated_session):
        """Test /api/profile returns user profile"""
        response = authenticated_session.get(f"{BASE_URL}/api/profile", timeout=10)
        assert response.status_code == 200, f"Profile failed: {response.status_code}"
        data = response.json()
        
        assert "user_id" in data, "Missing user_id"
        assert "email" in data, "Missing email"
        assert "stats" in data, "Missing stats"
        
        print(f"✅ Profile: {data.get('name')} - Plan: {data.get('plan')}")
    
    def test_notifications_endpoint(self, authenticated_session):
        """Test /api/notifications returns notifications"""
        response = authenticated_session.get(f"{BASE_URL}/api/notifications", timeout=10)
        assert response.status_code == 200, f"Notifications failed: {response.status_code}"
        data = response.json()
        
        assert "notifications" in data, "Missing notifications array"
        assert "unread_count" in data, "Missing unread_count"
        
        print(f"✅ Notifications: {len(data['notifications'])} total, {data['unread_count']} unread")
    
    def test_alerts_history(self, authenticated_session):
        """Test /api/alerts/history returns alert history"""
        response = authenticated_session.get(f"{BASE_URL}/api/alerts/history?limit=5", timeout=10)
        assert response.status_code == 200, f"Alerts history failed: {response.status_code}"
        print(f"✅ Alerts History: {response.status_code}")
    
    def test_threats_endpoint(self, authenticated_session):
        """Test /api/threats returns threats"""
        response = authenticated_session.get(f"{BASE_URL}/api/threats", timeout=10)
        assert response.status_code == 200, f"Threats failed: {response.status_code}"
        print(f"✅ Threats: {response.status_code}")
    
    def test_stats_endpoint(self, authenticated_session):
        """Test /api/stats returns user stats"""
        response = authenticated_session.get(f"{BASE_URL}/api/stats", timeout=10)
        assert response.status_code == 200, f"Stats failed: {response.status_code}"
        print(f"✅ Stats: {response.status_code}")


class TestFamilyFeatures:
    """Test family panel and SOS features"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_family_dashboard(self, authenticated_session):
        """Test /api/family/dashboard returns family data"""
        response = authenticated_session.get(f"{BASE_URL}/api/family/dashboard", timeout=10)
        assert response.status_code == 200, f"Family dashboard failed: {response.status_code}"
        data = response.json()
        
        assert "members" in data, "Missing members"
        assert "stats" in data, "Missing stats"
        
        print(f"✅ Family Dashboard: {len(data['members'])} members")
    
    def test_family_members(self, authenticated_session):
        """Test /api/family/members returns family members"""
        response = authenticated_session.get(f"{BASE_URL}/api/family/members", timeout=10)
        assert response.status_code == 200, f"Family members failed: {response.status_code}"
        data = response.json()
        
        print(f"✅ Family Members: {len(data)} members")
    
    def test_sos_history(self, authenticated_session):
        """Test /api/sos/history returns SOS history"""
        response = authenticated_session.get(f"{BASE_URL}/api/sos/history", timeout=10)
        assert response.status_code == 200, f"SOS history failed: {response.status_code}"
        print(f"✅ SOS History: {response.status_code}")


class TestContactsFeatures:
    """Test contacts management"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_get_contacts(self, authenticated_session):
        """Test /api/contacts returns contacts list"""
        response = authenticated_session.get(f"{BASE_URL}/api/contacts", timeout=10)
        assert response.status_code == 200, f"Get contacts failed: {response.status_code}"
        data = response.json()
        
        assert isinstance(data, list), "Contacts should be a list"
        print(f"✅ Contacts: {len(data)} contacts")
    
    def test_add_contact(self, authenticated_session):
        """Test adding a trusted contact"""
        contact_data = {
            "name": f"TEST_Contact_{datetime.now().strftime('%H%M%S')}",
            "phone": "+34600000000",
            "relationship": "familiar",
            "is_emergency": True,
            "receive_alerts": True
        }
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/contacts",
            json=contact_data,
            timeout=10
        )
        assert response.status_code == 200, f"Add contact failed: {response.status_code}"
        data = response.json()
        
        assert "id" in data, "Missing contact id"
        assert data.get("name") == contact_data["name"], "Name mismatch"
        
        print(f"✅ Add Contact: {data.get('name')} created")
        
        # Cleanup - delete the test contact
        contact_id = data.get("id")
        if contact_id:
            authenticated_session.delete(f"{BASE_URL}/api/contacts/{contact_id}", timeout=10)


class TestHealthProfile:
    """Test health profile features"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_health_profile(self, authenticated_session):
        """Test /api/health/profile returns health data"""
        response = authenticated_session.get(f"{BASE_URL}/api/health/profile", timeout=10)
        assert response.status_code == 200, f"Health profile failed: {response.status_code}"
        print(f"✅ Health Profile: {response.status_code}")


class TestAdminFeatures:
    """Test admin panel features"""
    
    @pytest.fixture
    def admin_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate as admin")
        return session
    
    def test_admin_users(self, admin_session):
        """Test /api/admin/users returns user list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users", timeout=10)
        assert response.status_code == 200, f"Admin users failed: {response.status_code}"
        data = response.json()
        
        assert "users" in data, "Missing users array"
        assert "total" in data, "Missing total count"
        
        print(f"✅ Admin Users: {data.get('total')} total users")
    
    def test_admin_dashboard(self, admin_session):
        """Test /api/admin/dashboard returns admin stats"""
        response = admin_session.get(f"{BASE_URL}/api/admin/dashboard", timeout=10)
        assert response.status_code == 200, f"Admin dashboard failed: {response.status_code}"
        data = response.json()
        
        assert "stats" in data, "Missing stats"
        
        print(f"✅ Admin Dashboard: {data['stats'].get('total_users')} users, {data['stats'].get('premium_users')} premium")


class TestSOSQuickButton:
    """Test SOS Quick Button functionality"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_sos_premium_active(self, authenticated_session):
        """Test /api/sos/premium/active returns active SOS alerts"""
        response = authenticated_session.get(f"{BASE_URL}/api/sos/premium/active", timeout=10)
        assert response.status_code == 200, f"SOS premium active failed: {response.status_code}"
        data = response.json()
        
        assert "own_alerts" in data, "Missing own_alerts"
        assert "family_alerts" in data, "Missing family_alerts"
        
        print(f"✅ SOS Premium Active: {data.get('total_active', 0)} active alerts")
    
    def test_sos_premium_history(self, authenticated_session):
        """Test /api/sos/premium/history returns SOS history"""
        response = authenticated_session.get(f"{BASE_URL}/api/sos/premium/history", timeout=10)
        assert response.status_code == 200, f"SOS premium history failed: {response.status_code}"
        print(f"✅ SOS Premium History: {response.status_code}")


class TestPushNotifications:
    """Test push notification endpoints"""
    
    @pytest.fixture
    def authenticated_session(self):
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json=SUPERADMIN_CREDS,
            timeout=10
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return session
    
    def test_notification_preferences(self, authenticated_session):
        """Test /api/notifications/preferences returns preferences"""
        response = authenticated_session.get(f"{BASE_URL}/api/notifications/preferences", timeout=10)
        assert response.status_code == 200, f"Notification preferences failed: {response.status_code}"
        data = response.json()
        
        # Should have default preferences
        assert "email_notifications" in data or "push_notifications" in data, "Missing notification preferences"
        
        print(f"✅ Notification Preferences: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
