"""
Test Iteration 10: Family Panel, Enterprise Dashboard, Admin Subscriptions
Features to test:
1. Panel Familiar (/family-admin): debe mostrar estadísticas y miembros
2. Añadir miembro familiar: POST /api/family/members debe crear miembro correctamente
3. Dashboard Empresarial (/enterprise): debe mostrar métricas de seguridad
4. Endpoint /api/enterprise/dashboard debe devolver summary con métricas
5. Panel Admin - Pestaña Suscripciones: debe mostrar usuarios y permitir cambiar planes
6. PATCH /api/admin/users/{user_id}/plan debe cambiar el plan del usuario
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://manoprotect-v2.preview.emergentagent.com')

class TestAdminAuth:
    """Test admin authentication"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert data.get("role") == "admin", "User is not admin"
        return session
    
    def test_admin_login_success(self, admin_session):
        """Test admin login works"""
        # Session already created in fixture
        assert admin_session is not None


class TestFamilyDashboard:
    """Test Family Dashboard API endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_family_dashboard_requires_auth(self):
        """Test family dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/family/dashboard")
        assert response.status_code == 401, "Should require authentication"
    
    def test_family_dashboard_returns_data(self, admin_session):
        """Test family dashboard returns proper structure"""
        response = admin_session.get(f"{BASE_URL}/api/family/dashboard")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        # Verify structure
        assert "members" in data, "Missing 'members' field"
        assert "alerts" in data, "Missing 'alerts' field"
        assert "stats" in data, "Missing 'stats' field"
        assert "has_family_plan" in data, "Missing 'has_family_plan' field"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_members" in stats, "Missing 'total_members' in stats"
        assert "senior_members" in stats, "Missing 'senior_members' in stats"
        assert "total_threats_blocked" in stats, "Missing 'total_threats_blocked' in stats"
        assert "unread_alerts" in stats, "Missing 'unread_alerts' in stats"


class TestFamilyMembers:
    """Test Family Members CRUD operations"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_add_family_member_requires_auth(self):
        """Test adding family member requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/family/members",
            json={"name": "Test Member", "relationship": "hijo"}
        )
        assert response.status_code == 401, "Should require authentication"
    
    def test_add_family_member_success(self, admin_session):
        """Test adding a family member successfully"""
        unique_name = f"TEST_Miembro_{uuid.uuid4().hex[:6]}"
        member_data = {
            "name": unique_name,
            "email": f"test_{uuid.uuid4().hex[:6]}@test.com",
            "phone": "+34 600 123 456",
            "relationship": "hijo",
            "is_senior": False,
            "simplified_mode": False,
            "alert_level": "all"
        }
        
        response = admin_session.post(
            f"{BASE_URL}/api/family/members",
            json=member_data
        )
        assert response.status_code == 200, f"Failed to add member: {response.text}"
        
        data = response.json()
        assert "member_id" in data, "Missing member_id in response"
        assert "message" in data, "Missing message in response"
        
        # Store member_id for cleanup
        self.created_member_id = data["member_id"]
        
        # Verify member appears in dashboard
        dashboard_response = admin_session.get(f"{BASE_URL}/api/family/dashboard")
        assert dashboard_response.status_code == 200
        dashboard_data = dashboard_response.json()
        
        member_names = [m.get("name") for m in dashboard_data.get("members", [])]
        assert unique_name in member_names, f"Created member not found in dashboard. Members: {member_names}"
    
    def test_add_senior_family_member(self, admin_session):
        """Test adding a senior family member with simplified mode"""
        unique_name = f"TEST_Abuelo_{uuid.uuid4().hex[:6]}"
        member_data = {
            "name": unique_name,
            "phone": "+34 600 789 012",
            "relationship": "abuelo",
            "is_senior": True,
            "simplified_mode": True,
            "alert_level": "critical"
        }
        
        response = admin_session.post(
            f"{BASE_URL}/api/family/members",
            json=member_data
        )
        assert response.status_code == 200, f"Failed to add senior member: {response.text}"
        
        data = response.json()
        assert "member_id" in data
    
    def test_update_family_member(self, admin_session):
        """Test updating a family member"""
        # First create a member
        unique_name = f"TEST_Update_{uuid.uuid4().hex[:6]}"
        create_response = admin_session.post(
            f"{BASE_URL}/api/family/members",
            json={"name": unique_name, "relationship": "hermano"}
        )
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Update the member
        update_data = {
            "name": f"{unique_name}_Updated",
            "relationship": "hermano",
            "is_senior": True,
            "alert_level": "high"
        }
        
        update_response = admin_session.patch(
            f"{BASE_URL}/api/family/members/{member_id}",
            json=update_data
        )
        assert update_response.status_code == 200, f"Failed to update member: {update_response.text}"
    
    def test_delete_family_member(self, admin_session):
        """Test deleting a family member"""
        # First create a member to delete
        unique_name = f"TEST_Delete_{uuid.uuid4().hex[:6]}"
        create_response = admin_session.post(
            f"{BASE_URL}/api/family/members",
            json={"name": unique_name, "relationship": "otro"}
        )
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Delete the member
        delete_response = admin_session.delete(
            f"{BASE_URL}/api/family/members/{member_id}"
        )
        assert delete_response.status_code == 200, f"Failed to delete member: {delete_response.text}"
        
        # Verify member is gone
        dashboard_response = admin_session.get(f"{BASE_URL}/api/family/dashboard")
        dashboard_data = dashboard_response.json()
        member_ids = [m.get("id") for m in dashboard_data.get("members", [])]
        assert member_id not in member_ids, "Deleted member still appears in dashboard"


class TestEnterpriseDashboard:
    """Test Enterprise Dashboard API endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_enterprise_dashboard_requires_auth(self):
        """Test enterprise dashboard requires authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 401, "Should require authentication"
    
    def test_enterprise_dashboard_returns_summary(self, admin_session):
        """Test enterprise dashboard returns summary with metrics"""
        response = admin_session.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        
        # Verify summary structure
        assert "summary" in data, "Missing 'summary' field"
        summary = data["summary"]
        assert "total_analyzed" in summary, "Missing 'total_analyzed' in summary"
        assert "threats_blocked" in summary, "Missing 'threats_blocked' in summary"
        assert "protection_rate" in summary, "Missing 'protection_rate' in summary"
        assert "money_saved" in summary, "Missing 'money_saved' in summary"
        assert "active_employees" in summary, "Missing 'active_employees' in summary"
    
    def test_enterprise_dashboard_returns_risk_distribution(self, admin_session):
        """Test enterprise dashboard returns risk distribution"""
        response = admin_session.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "risk_distribution" in data, "Missing 'risk_distribution' field"
        
        risk_dist = data["risk_distribution"]
        # Should have all risk levels
        expected_levels = ["critical", "high", "medium", "low"]
        for level in expected_levels:
            assert level in risk_dist, f"Missing '{level}' in risk_distribution"
    
    def test_enterprise_dashboard_returns_departments(self, admin_session):
        """Test enterprise dashboard returns departments data"""
        response = admin_session.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "departments" in data, "Missing 'departments' field"
        
        departments = data["departments"]
        assert len(departments) > 0, "No departments returned"
        
        # Verify department structure
        for dept in departments:
            assert "name" in dept, "Missing 'name' in department"
            assert "employee_count" in dept, "Missing 'employee_count' in department"
            assert "threats_blocked" in dept, "Missing 'threats_blocked' in department"
            assert "risk_score" in dept, "Missing 'risk_score' in department"
    
    def test_enterprise_dashboard_returns_trend_data(self, admin_session):
        """Test enterprise dashboard returns trend data for 30 days"""
        response = admin_session.get(f"{BASE_URL}/api/enterprise/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "trend_data" in data, "Missing 'trend_data' field"
        
        trend_data = data["trend_data"]
        assert len(trend_data) == 30, f"Expected 30 days of trend data, got {len(trend_data)}"
        
        # Verify trend data structure
        for day in trend_data:
            assert "date" in day, "Missing 'date' in trend data"
            assert "threats" in day, "Missing 'threats' in trend data"


class TestEnterpriseReports:
    """Test Enterprise Reports API endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_enterprise_reports_requires_auth(self):
        """Test enterprise reports requires authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/reports")
        assert response.status_code == 401, "Should require authentication"
    
    def test_enterprise_reports_default_period(self, admin_session):
        """Test enterprise reports with default period (month)"""
        response = admin_session.get(f"{BASE_URL}/api/enterprise/reports")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "period" in data, "Missing 'period' field"
        assert data["period"] == "month", "Default period should be 'month'"
        assert "total_threats" in data, "Missing 'total_threats' field"
        assert "blocked" in data, "Missing 'blocked' field"
        assert "by_type" in data, "Missing 'by_type' field"
        assert "by_risk" in data, "Missing 'by_risk' field"
    
    def test_enterprise_reports_different_periods(self, admin_session):
        """Test enterprise reports with different periods"""
        periods = ["week", "month", "quarter", "year"]
        
        for period in periods:
            response = admin_session.get(f"{BASE_URL}/api/enterprise/reports?period={period}")
            assert response.status_code == 200, f"Failed for period {period}: {response.text}"
            
            data = response.json()
            assert data["period"] == period, f"Period mismatch: expected {period}, got {data['period']}"


class TestAdminSubscriptions:
    """Test Admin Subscriptions management"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_admin_subscriptions_requires_auth(self):
        """Test admin subscriptions requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 401, "Should require authentication"
    
    def test_admin_subscriptions_returns_data(self, admin_session):
        """Test admin subscriptions returns proper structure"""
        response = admin_session.get(f"{BASE_URL}/api/admin/subscriptions")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "subscribers" in data, "Missing 'subscribers' field"
        assert "stats" in data, "Missing 'stats' field"
        assert "recent_changes" in data, "Missing 'recent_changes' field"
    
    def test_admin_users_list(self, admin_session):
        """Test admin users list endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users?limit=50")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "users" in data, "Missing 'users' field"
        
        # Verify user structure
        if len(data["users"]) > 0:
            user = data["users"][0]
            # Some users have 'id', some have 'user_id'
            assert "user_id" in user or "id" in user, "Missing 'user_id' or 'id' in user"
            assert "email" in user, "Missing 'email' in user"
            assert "name" in user, "Missing 'name' in user"


class TestAdminPlanUpdate:
    """Test Admin Plan Update functionality"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_plan_update_requires_auth(self):
        """Test plan update requires authentication"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/users/test_user/plan?plan=personal"
        )
        assert response.status_code == 401, "Should require authentication"
    
    def test_plan_update_invalid_plan(self, admin_session):
        """Test plan update rejects invalid plan"""
        # Get a user to test with
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users?limit=10")
        users_data = users_response.json()
        
        # Find a user with user_id field
        user_id = None
        for user in users_data.get("users", []):
            if "user_id" in user:
                user_id = user["user_id"]
                break
        
        if user_id:
            response = admin_session.patch(
                f"{BASE_URL}/api/admin/users/{user_id}/plan?plan=invalid_plan"
            )
            assert response.status_code == 400, f"Should reject invalid plan: {response.text}"
        else:
            pytest.skip("No user with user_id found")
    
    def test_plan_update_all_valid_plans(self, admin_session):
        """Test plan update works for all valid plans"""
        # Get admin user to test with
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users?limit=50")
        users_data = users_response.json()
        
        # Find admin user
        admin_user = None
        for user in users_data.get("users", []):
            if user.get("email") == "admin@mano.com":
                admin_user = user
                break
        
        if admin_user:
            user_id = admin_user["user_id"]
            original_plan = admin_user.get("plan", "free")
            
            valid_plans = ["personal", "family", "business", "enterprise", "free"]
            
            for plan in valid_plans:
                response = admin_session.patch(
                    f"{BASE_URL}/api/admin/users/{user_id}/plan?plan={plan}"
                )
                assert response.status_code == 200, f"Failed to update to {plan}: {response.text}"
                
                data = response.json()
                assert data.get("new_plan") == plan, f"Plan mismatch: expected {plan}"
            
            # Restore original plan
            admin_session.patch(
                f"{BASE_URL}/api/admin/users/{user_id}/plan?plan={original_plan}"
            )


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mano.com", "password": "Admin123!"}
        )
        assert response.status_code == 200
        return session
    
    def test_cleanup_test_members(self, admin_session):
        """Clean up TEST_ prefixed family members"""
        dashboard_response = admin_session.get(f"{BASE_URL}/api/family/dashboard")
        if dashboard_response.status_code == 200:
            data = dashboard_response.json()
            for member in data.get("members", []):
                if member.get("name", "").startswith("TEST_"):
                    admin_session.delete(
                        f"{BASE_URL}/api/family/members/{member['id']}"
                    )
        assert True  # Cleanup always passes


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
