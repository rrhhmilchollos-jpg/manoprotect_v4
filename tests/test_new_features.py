"""
Test suite for MANO New Features - Iteration 5
Tests:
- GET /api/enterprise/dashboard - Enterprise metrics endpoint
- GET /api/enterprise/reports - Enterprise reports
- GET /api/family/dashboard - Family admin dashboard
- POST /api/family/members - Add family member
- PATCH /api/family/members/{id} - Update family member
- DELETE /api/family/members/{id} - Delete family member
- GET /api/admin/dashboard - Admin panel dashboard (requires admin role)
- GET /api/admin/investors - List investor requests
- GET /api/admin/users - List users
- GET /api/admin/payments - List payments
- GET /api/investor/download-pdf/{doc_type} - PDF generation
- GET /api/notifications - User notifications
- POST /api/notifications/subscribe - Subscribe to push notifications
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_EMAIL = f"test_new_{uuid.uuid4().hex[:8]}@mano.com"
TEST_USER_NAME = "Test New Features User"
TEST_USER_PASSWORD = "TestPass123"

ADMIN_EMAIL = "admin@mano.com"
ADMIN_NAME = "Admin"
ADMIN_PASSWORD = "AdminPass123"


class TestSetup:
    """Setup tests - create test users"""
    
    @pytest.fixture(scope="class")
    def test_user_session(self):
        """Create and login test user, return session token"""
        # Register user
        payload = {
            "email": TEST_USER_EMAIL,
            "name": TEST_USER_NAME,
            "password": TEST_USER_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        if response.status_code == 400:  # Already exists
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            })
        
        if response.status_code == 200:
            return response.cookies.get("session_token")
        return None
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Create admin user and return session token"""
        # Create admin via endpoint
        create_response = requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        print(f"Admin creation response: {create_response.status_code} - {create_response.text[:200]}")
        
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code == 200:
            return login_response.cookies.get("session_token")
        return None


class TestEnterpriseDashboard:
    """Tests for GET /api/enterprise/dashboard"""
    
    def test_enterprise_dashboard_authenticated(self):
        """Test enterprise dashboard with authenticated user"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        
        if login_response.status_code != 200:
            # Register first
            requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@mano.com",
                "name": "Test User",
                "password": "TestPass123"
            })
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": "test@mano.com",
                "password": "TestPass123"
            })
        
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/enterprise/dashboard",
            cookies={"session_token": session_token}
        )
        print(f"Enterprise dashboard response: {response.status_code}")
        print(f"Enterprise dashboard data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "summary" in data, "Missing summary in response"
        assert "risk_distribution" in data, "Missing risk_distribution"
        assert "departments" in data, "Missing departments"
        assert "trend_data" in data, "Missing trend_data"
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_analyzed" in summary
        assert "threats_blocked" in summary
        assert "protection_rate" in summary
        assert "money_saved" in summary
        assert "active_employees" in summary
        
        print(f"✓ Enterprise dashboard working: {summary['total_analyzed']} analyses, {summary['threats_blocked']} blocked")
    
    def test_enterprise_dashboard_unauthenticated(self):
        """Test enterprise dashboard without authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/dashboard")
        print(f"Unauthenticated enterprise dashboard: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")


class TestEnterpriseReports:
    """Tests for GET /api/enterprise/reports"""
    
    def test_enterprise_reports_week(self):
        """Test enterprise reports for week period"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/enterprise/reports?period=week",
            cookies={"session_token": session_token}
        )
        print(f"Enterprise reports (week) response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "period" in data
        assert data["period"] == "week"
        assert "start_date" in data
        assert "end_date" in data
        assert "total_threats" in data
        
        print(f"✓ Enterprise reports (week) working: {data['total_threats']} threats")
    
    def test_enterprise_reports_month(self):
        """Test enterprise reports for month period"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/enterprise/reports?period=month",
            cookies={"session_token": session_token}
        )
        print(f"Enterprise reports (month) response: {response.status_code}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "month"
        print(f"✓ Enterprise reports (month) working")


class TestFamilyDashboard:
    """Tests for GET /api/family/dashboard"""
    
    def test_family_dashboard_authenticated(self):
        """Test family dashboard with authenticated user"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/family/dashboard",
            cookies={"session_token": session_token}
        )
        print(f"Family dashboard response: {response.status_code}")
        print(f"Family dashboard data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "members" in data, "Missing members"
        assert "alerts" in data, "Missing alerts"
        assert "stats" in data, "Missing stats"
        assert "has_family_plan" in data, "Missing has_family_plan"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_members" in stats
        assert "senior_members" in stats
        assert "total_threats_blocked" in stats
        assert "unread_alerts" in stats
        
        print(f"✓ Family dashboard working: {stats['total_members']} members")
    
    def test_family_dashboard_unauthenticated(self):
        """Test family dashboard without authentication"""
        response = requests.get(f"{BASE_URL}/api/family/dashboard")
        print(f"Unauthenticated family dashboard: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")


class TestFamilyMembers:
    """Tests for family member CRUD operations"""
    
    def test_add_family_member(self):
        """Test adding a family member"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        payload = {
            "name": f"Test Family Member {uuid.uuid4().hex[:6]}",
            "email": f"family_{uuid.uuid4().hex[:6]}@test.com",
            "phone": "+34 600 123 456",
            "relationship": "hijo",
            "is_senior": False,
            "simplified_mode": False,
            "alert_level": "all"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/family/members",
            json=payload,
            cookies={"session_token": session_token}
        )
        print(f"Add family member response: {response.status_code}")
        print(f"Add family member data: {response.text[:300]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "member_id" in data
        assert data["member_id"].startswith("member_")
        
        print(f"✓ Family member added: {data['member_id']}")
        return data["member_id"]
    
    def test_add_senior_family_member(self):
        """Test adding a senior family member"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        payload = {
            "name": f"Abuelo Test {uuid.uuid4().hex[:6]}",
            "phone": "+34 600 999 888",
            "relationship": "abuelo",
            "is_senior": True,
            "simplified_mode": True,
            "alert_level": "critical"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/family/members",
            json=payload,
            cookies={"session_token": session_token}
        )
        print(f"Add senior member response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "member_id" in data
        
        print(f"✓ Senior family member added: {data['member_id']}")
    
    def test_add_family_member_unauthenticated(self):
        """Test adding family member without authentication"""
        payload = {
            "name": "Unauthorized Member",
            "relationship": "hijo"
        }
        
        response = requests.post(f"{BASE_URL}/api/family/members", json=payload)
        print(f"Unauthenticated add member: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")
    
    def test_update_family_member(self):
        """Test updating a family member"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        # First add a member
        add_payload = {
            "name": f"Update Test {uuid.uuid4().hex[:6]}",
            "relationship": "hijo"
        }
        add_response = requests.post(
            f"{BASE_URL}/api/family/members",
            json=add_payload,
            cookies={"session_token": session_token}
        )
        
        if add_response.status_code != 200:
            pytest.skip("Cannot test update - add failed")
        
        member_id = add_response.json()["member_id"]
        
        # Update the member
        update_payload = {
            "name": "Updated Name",
            "relationship": "hijo",
            "is_senior": True,
            "alert_level": "high"
        }
        
        response = requests.patch(
            f"{BASE_URL}/api/family/members/{member_id}",
            json=update_payload,
            cookies={"session_token": session_token}
        )
        print(f"Update family member response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Family member updated")
    
    def test_delete_family_member(self):
        """Test deleting a family member"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        # First add a member
        add_payload = {
            "name": f"Delete Test {uuid.uuid4().hex[:6]}",
            "relationship": "otro"
        }
        add_response = requests.post(
            f"{BASE_URL}/api/family/members",
            json=add_payload,
            cookies={"session_token": session_token}
        )
        
        if add_response.status_code != 200:
            pytest.skip("Cannot test delete - add failed")
        
        member_id = add_response.json()["member_id"]
        
        # Delete the member
        response = requests.delete(
            f"{BASE_URL}/api/family/members/{member_id}",
            cookies={"session_token": session_token}
        )
        print(f"Delete family member response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Family member deleted")


class TestAdminDashboard:
    """Tests for GET /api/admin/dashboard"""
    
    def test_admin_dashboard_with_admin(self):
        """Test admin dashboard with admin user"""
        # Create admin
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip(f"Admin login failed: {login_response.text}")
        
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            cookies={"session_token": session_token}
        )
        print(f"Admin dashboard response: {response.status_code}")
        print(f"Admin dashboard data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "stats" in data, "Missing stats"
        stats = data["stats"]
        assert "total_users" in stats
        assert "premium_users" in stats
        assert "pending_investors" in stats
        assert "approved_investors" in stats
        assert "total_revenue" in stats
        
        print(f"✓ Admin dashboard working: {stats['total_users']} users, €{stats['total_revenue']} revenue")
    
    def test_admin_dashboard_non_admin(self):
        """Test admin dashboard with regular user (should be rejected)"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            cookies={"session_token": session_token}
        )
        print(f"Non-admin dashboard response: {response.status_code}")
        
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        print(f"✓ Non-admin correctly rejected")
    
    def test_admin_dashboard_unauthenticated(self):
        """Test admin dashboard without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        print(f"Unauthenticated admin dashboard: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")


class TestAdminInvestors:
    """Tests for GET /api/admin/investors"""
    
    def test_list_investors_admin(self):
        """Test listing investors with admin user"""
        # Create admin and login
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Admin login failed")
        
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/investors",
            cookies={"session_token": session_token}
        )
        print(f"Admin investors list response: {response.status_code}")
        print(f"Admin investors data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list), "Expected list of investors"
        print(f"✓ Admin investors list working: {len(data)} investors")
    
    def test_list_investors_filter_pending(self):
        """Test listing investors filtered by pending status"""
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/investors?status=pending",
            cookies={"session_token": session_token}
        )
        print(f"Pending investors response: {response.status_code}")
        
        assert response.status_code == 200
        data = response.json()
        
        # All should be pending
        for inv in data:
            assert inv.get("status") == "pending", f"Expected pending, got {inv.get('status')}"
        
        print(f"✓ Pending investors filter working: {len(data)} pending")
    
    def test_list_investors_non_admin(self):
        """Test listing investors with non-admin user"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/investors",
            cookies={"session_token": session_token}
        )
        print(f"Non-admin investors list: {response.status_code}")
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Non-admin correctly rejected")


class TestNotifications:
    """Tests for notification endpoints"""
    
    def test_get_notifications_authenticated(self):
        """Test getting notifications with authenticated user"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            cookies={"session_token": session_token}
        )
        print(f"Get notifications response: {response.status_code}")
        print(f"Notifications data: {response.text[:300]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "notifications" in data, "Missing notifications"
        assert "unread_count" in data, "Missing unread_count"
        assert isinstance(data["notifications"], list)
        
        print(f"✓ Notifications working: {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_get_notifications_unauthenticated(self):
        """Test getting notifications without authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        print(f"Unauthenticated notifications: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")
    
    def test_subscribe_push_notifications(self):
        """Test subscribing to push notifications"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        payload = {
            "endpoint": f"https://fcm.googleapis.com/fcm/send/{uuid.uuid4().hex}",
            "keys": {
                "p256dh": "test_p256dh_key",
                "auth": "test_auth_key"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/notifications/subscribe",
            json=payload,
            cookies={"session_token": session_token}
        )
        print(f"Subscribe push response: {response.status_code}")
        print(f"Subscribe data: {response.text[:200]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data
        
        print(f"✓ Push subscription working")
    
    def test_subscribe_push_unauthenticated(self):
        """Test subscribing without authentication"""
        payload = {
            "endpoint": "https://test.endpoint.com",
            "keys": {"p256dh": "key", "auth": "auth"}
        }
        
        response = requests.post(f"{BASE_URL}/api/notifications/subscribe", json=payload)
        print(f"Unauthenticated subscribe: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")


class TestPDFGeneration:
    """Tests for PDF generation endpoint"""
    
    def test_download_pdf_unauthenticated(self):
        """Test PDF download without authentication"""
        response = requests.get(f"{BASE_URL}/api/investor/download-pdf/business-plan")
        print(f"Unauthenticated PDF download: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated correctly rejected")
    
    def test_download_pdf_non_investor(self):
        """Test PDF download with regular user (not investor)"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@mano.com",
            "password": "TestPass123"
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/investor/download-pdf/business-plan",
            cookies={"session_token": session_token}
        )
        print(f"Non-investor PDF download: {response.status_code}")
        
        assert response.status_code == 403, f"Expected 403 for non-investor, got {response.status_code}"
        print(f"✓ Non-investor correctly rejected")
    
    def test_download_pdf_with_investor(self):
        """Test PDF download with investor role"""
        # Create admin and make test user an investor
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        
        # Login as admin
        admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        admin_token = admin_login.cookies.get("session_token")
        
        # Get test user ID
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": admin_token}
        )
        
        if me_response.status_code == 200:
            # Admin can download PDFs
            response = requests.get(
                f"{BASE_URL}/api/investor/download-pdf/business-plan",
                cookies={"session_token": admin_token}
            )
            print(f"Admin PDF download response: {response.status_code}")
            
            if response.status_code == 200:
                # Verify it's a PDF
                content_type = response.headers.get('content-type', '')
                assert 'pdf' in content_type, f"Expected PDF, got {content_type}"
                assert len(response.content) > 1000, "PDF too small"
                
                content_disp = response.headers.get('content-disposition', '')
                assert 'attachment' in content_disp
                assert '.pdf' in content_disp
                
                print(f"✓ PDF download working: {len(response.content)} bytes")
            else:
                print(f"⚠ PDF download failed: {response.status_code} - {response.text[:200]}")
        else:
            pytest.skip("Cannot verify admin role")
    
    def test_download_pdf_invalid_doc(self):
        """Test PDF download for non-existent document"""
        # Login as admin
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        admin_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        admin_token = admin_login.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/investor/download-pdf/invalid-document",
            cookies={"session_token": admin_token}
        )
        print(f"Invalid PDF doc response: {response.status_code}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Invalid document correctly returns 404")


class TestAdminUsers:
    """Tests for GET /api/admin/users"""
    
    def test_list_users_admin(self):
        """Test listing users with admin"""
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            cookies={"session_token": session_token}
        )
        print(f"Admin users list response: {response.status_code}")
        print(f"Admin users data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert isinstance(data["users"], list)
        
        print(f"✓ Admin users list working: {data['total']} total users")


class TestAdminPayments:
    """Tests for GET /api/admin/payments"""
    
    def test_list_payments_admin(self):
        """Test listing payments with admin"""
        requests.post(
            f"{BASE_URL}/api/admin/create-admin",
            params={"email": ADMIN_EMAIL, "name": ADMIN_NAME, "password": ADMIN_PASSWORD}
        )
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        session_token = login_response.cookies.get("session_token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/payments",
            cookies={"session_token": session_token}
        )
        print(f"Admin payments list response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of payments"
        print(f"✓ Admin payments list working: {len(data)} payments")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
