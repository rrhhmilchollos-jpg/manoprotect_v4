"""
ManoProtect - Iteration 41 Backend Tests
Tests for: ReviewForm in Dashboard, Export CSV APIs, 2FA for Enterprise Employees

Endpoints tested:
- /api/reviews/can-review - Check if user can review
- /api/reviews/my-review - GET/PUT/DELETE user's review
- /api/reviews - POST create review
- /api/export/users/csv - Export users CSV
- /api/export/dashboard-summary/csv - Export dashboard summary CSV
- /api/export/reviews/csv - Export reviews CSV
- /api/2fa/status - Get 2FA status
- /api/2fa/setup - Start 2FA setup
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://secure-gateway-33.preview.emergentagent.com')
if BASE_URL.endswith('/'):
    BASE_URL = BASE_URL.rstrip('/')

# Enterprise credentials
ENTERPRISE_EMAIL = "ceo@manoprotect.com"
ENTERPRISE_PASSWORD = "Admin2026!"


class TestHealthCheck:
    """Verify API is running"""
    
    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"API unhealthy: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy", f"API status: {data}"
        print("✅ API health check passed")


class TestReviewsEndpoints:
    """Tests for user review functionality in Dashboard"""
    
    def test_can_review_unauthenticated(self):
        """Unauthenticated users should get 401 or can_review=false"""
        response = requests.get(f"{BASE_URL}/api/reviews/can-review")
        # Either 401 or a response with can_review=false is acceptable
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            # Free users can't review
            assert "can_review" in data
        print("✅ can-review endpoint works for unauthenticated users")
    
    def test_my_review_unauthenticated(self):
        """Unauthenticated access to my-review should fail"""
        response = requests.get(f"{BASE_URL}/api/reviews/my-review")
        assert response.status_code in [401, 403], f"Expected 401/403, got: {response.status_code}"
        print("✅ my-review endpoint requires authentication")
    
    def test_public_reviews_endpoint(self):
        """Public reviews endpoint should work without auth"""
        response = requests.get(f"{BASE_URL}/api/reviews/public")
        assert response.status_code == 200, f"Public reviews failed: {response.text}"
        data = response.json()
        assert "reviews" in data
        assert "total" in data
        print(f"✅ Public reviews: {data.get('total', 0)} reviews available")
    
    def test_reviews_stats_endpoint(self):
        """Reviews stats should be public"""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert response.status_code == 200, f"Reviews stats failed: {response.text}"
        data = response.json()
        assert "average_rating" in data
        assert "total_reviews" in data
        print(f"✅ Review stats: avg={data.get('average_rating')}, total={data.get('total_reviews')}")


class TestExportCSVEndpoints:
    """Tests for CSV export functionality in Enterprise Portal"""
    
    @pytest.fixture(scope="class")
    def enterprise_session(self):
        """Login to enterprise portal and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ENTERPRISE_EMAIL, "password": ENTERPRISE_PASSWORD}
        )
        if login_response.status_code != 200:
            pytest.skip(f"Enterprise login failed: {login_response.text}")
        print(f"✅ Enterprise login successful: {login_response.json().get('name')}")
        return session
    
    def test_export_users_requires_auth(self):
        """Export users CSV should require authentication"""
        response = requests.get(f"{BASE_URL}/api/export/users/csv")
        assert response.status_code == 401, f"Expected 401, got: {response.status_code}"
        print("✅ export/users/csv requires enterprise authentication")
    
    def test_export_dashboard_summary_requires_auth(self):
        """Export dashboard summary should require authentication"""
        response = requests.get(f"{BASE_URL}/api/export/dashboard-summary/csv")
        assert response.status_code == 401, f"Expected 401, got: {response.status_code}"
        print("✅ export/dashboard-summary/csv requires enterprise authentication")
    
    def test_export_reviews_requires_auth(self):
        """Export reviews CSV should require authentication"""
        response = requests.get(f"{BASE_URL}/api/export/reviews/csv")
        assert response.status_code == 401, f"Expected 401, got: {response.status_code}"
        print("✅ export/reviews/csv requires enterprise authentication")
    
    def test_export_users_csv_with_auth(self, enterprise_session):
        """Export users CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/users/csv")
        assert response.status_code == 200, f"Export users failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        # Verify CSV has headers
        content = response.text
        assert 'ID' in content or 'Nombre' in content or 'Email' in content, "CSV missing expected headers"
        print(f"✅ Export users CSV successful ({len(content)} bytes)")
    
    def test_export_dashboard_summary_with_auth(self, enterprise_session):
        """Export dashboard summary CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/dashboard-summary/csv")
        assert response.status_code == 200, f"Export dashboard summary failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        content = response.text
        # Should contain metrics like "Métrica" or "Usuarios"
        assert 'Métrica' in content or 'Usuarios' in content or 'Total' in content, f"Unexpected CSV content: {content[:200]}"
        print(f"✅ Export dashboard summary CSV successful ({len(content)} bytes)")
    
    def test_export_reviews_csv_with_auth(self, enterprise_session):
        """Export reviews CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/reviews/csv")
        assert response.status_code == 200, f"Export reviews failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        content = response.text
        # Should have review-related headers
        assert 'Estrellas' in content or 'Rating' in content or 'ID' in content, f"CSV missing expected headers: {content[:200]}"
        print(f"✅ Export reviews CSV successful ({len(content)} bytes)")
    
    def test_export_alerts_csv_with_auth(self, enterprise_session):
        """Export alerts CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/alerts/csv")
        assert response.status_code == 200, f"Export alerts failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        print(f"✅ Export alerts CSV successful ({len(response.text)} bytes)")
    
    def test_export_sos_csv_with_auth(self, enterprise_session):
        """Export SOS events CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/sos/csv")
        assert response.status_code == 200, f"Export SOS failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        print(f"✅ Export SOS CSV successful ({len(response.text)} bytes)")
    
    def test_export_payments_csv_with_auth(self, enterprise_session):
        """Export payments CSV with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/export/payments/csv")
        assert response.status_code == 200, f"Export payments failed: {response.text}"
        assert 'text/csv' in response.headers.get('content-type', ''), "Expected CSV content-type"
        print(f"✅ Export payments CSV successful ({len(response.text)} bytes)")


class TestTwoFactorAuth:
    """Tests for 2FA functionality in Enterprise Portal"""
    
    @pytest.fixture(scope="class")
    def enterprise_session(self):
        """Login to enterprise portal and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ENTERPRISE_EMAIL, "password": ENTERPRISE_PASSWORD}
        )
        if login_response.status_code != 200:
            pytest.skip(f"Enterprise login failed: {login_response.text}")
        return session
    
    def test_2fa_status_requires_auth(self):
        """2FA status should require authentication"""
        response = requests.get(f"{BASE_URL}/api/2fa/status")
        assert response.status_code == 401, f"Expected 401, got: {response.status_code}"
        print("✅ 2FA status endpoint requires authentication")
    
    def test_2fa_setup_requires_auth(self):
        """2FA setup should require authentication"""
        response = requests.get(f"{BASE_URL}/api/2fa/setup")
        assert response.status_code == 401, f"Expected 401, got: {response.status_code}"
        print("✅ 2FA setup endpoint requires authentication")
    
    def test_2fa_status_with_auth(self, enterprise_session):
        """Get 2FA status with valid session"""
        response = enterprise_session.get(f"{BASE_URL}/api/2fa/status")
        assert response.status_code == 200, f"2FA status failed: {response.text}"
        data = response.json()
        assert "enabled" in data, "Missing 'enabled' field in 2FA status"
        print(f"✅ 2FA status: enabled={data.get('enabled')}, backup_codes={data.get('backup_codes_remaining', 0)}")
    
    def test_2fa_setup_with_auth(self, enterprise_session):
        """Start 2FA setup with valid session"""
        # First check current status
        status_response = enterprise_session.get(f"{BASE_URL}/api/2fa/status")
        status_data = status_response.json()
        
        if status_data.get("enabled"):
            print("⚠️ 2FA already enabled, skipping setup test")
            pytest.skip("2FA already enabled")
            return
        
        response = enterprise_session.get(f"{BASE_URL}/api/2fa/setup")
        assert response.status_code == 200, f"2FA setup failed: {response.text}"
        data = response.json()
        
        # Verify setup response contains required fields
        assert "secret" in data, "Missing secret in 2FA setup"
        assert "qr_code" in data, "Missing QR code in 2FA setup"
        assert data["qr_code"].startswith("data:image"), "QR code should be base64 image"
        print(f"✅ 2FA setup successful: secret length={len(data.get('secret', ''))}, has QR code")


class TestEnterprisePortalSections:
    """Tests for Enterprise Portal sections that use new features"""
    
    @pytest.fixture(scope="class")
    def enterprise_session(self):
        """Login to enterprise portal and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ENTERPRISE_EMAIL, "password": ENTERPRISE_PASSWORD}
        )
        if login_response.status_code != 200:
            pytest.skip(f"Enterprise login failed: {login_response.text}")
        return session
    
    def test_enterprise_auth_me(self, enterprise_session):
        """Verify enterprise auth returns employee info"""
        response = enterprise_session.get(f"{BASE_URL}/api/enterprise/auth/me")
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        data = response.json()
        assert "employee_id" in data or "email" in data
        print(f"✅ Enterprise auth/me: {data.get('name', data.get('email'))}")
    
    def test_enterprise_dashboard_stats(self, enterprise_session):
        """Dashboard stats endpoint should work"""
        response = enterprise_session.get(f"{BASE_URL}/api/enterprise/dashboard/stats")
        assert response.status_code == 200, f"Dashboard stats failed: {response.text}"
        data = response.json()
        # Should have various stat fields
        print(f"✅ Dashboard stats: {list(data.keys())[:5]}...")


class TestDashboardReviewTab:
    """Tests for Review tab in user Dashboard"""
    
    def test_landing_stats_includes_reviews(self):
        """Landing stats should include review data"""
        response = requests.get(f"{BASE_URL}/api/public/landing-stats")
        assert response.status_code == 200, f"Landing stats failed: {response.text}"
        data = response.json()
        assert "average_rating" in data, "Missing average_rating in landing stats"
        assert "total_reviews" in data, "Missing total_reviews in landing stats"
        print(f"✅ Landing stats include reviews: avg={data.get('average_rating')}, total={data.get('total_reviews')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
