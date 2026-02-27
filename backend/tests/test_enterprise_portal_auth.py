"""
Enterprise Portal Authentication and Dashboard Tests
Tests for the blank screen fix after login
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mano-protect-preview-2.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "ceo@manoprotect.com"
ADMIN_PASSWORD = "19862210Des"


class TestEnterpriseAuth:
    """Test enterprise authentication flow"""
    
    def test_login_returns_session_token(self):
        """Verify login returns session token for localStorage backup"""
        response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check login success
        assert data.get("success") == True
        
        # Critical: session_token must be returned for localStorage backup
        assert "session_token" in data
        assert isinstance(data["session_token"], str)
        assert len(data["session_token"]) > 10
        
        # Check employee data is returned
        assert data.get("employee_id") == "emp_superadmin001"
        assert data.get("name") == "CEO ManoProtect"
        assert data.get("role") == "super_admin"
        print(f"SUCCESS: Login returned session_token: {data['session_token'][:10]}...")
    
    def test_auth_me_with_header_token(self):
        """Verify /auth/me endpoint accepts X-Session-Token header"""
        # First, get a fresh session token
        login_response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        session_token = login_response.json().get("session_token")
        
        # Test /auth/me with X-Session-Token header (not cookie)
        response = requests.get(
            f"{BASE_URL}/api/enterprise/auth/me",
            headers={"X-Session-Token": session_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify employee data is returned
        assert data.get("employee_id") == "emp_superadmin001"
        assert data.get("name") == "CEO ManoProtect"
        assert data.get("email") == ADMIN_EMAIL
        assert data.get("role") == "super_admin"
        assert "permissions" in data
        print("SUCCESS: /auth/me accepts X-Session-Token header")
    
    def test_auth_me_without_token_returns_401(self):
        """Verify /auth/me returns 401 without valid token"""
        response = requests.get(f"{BASE_URL}/api/enterprise/auth/me")
        
        assert response.status_code == 401
        print("SUCCESS: /auth/me returns 401 without token")
    
    def test_auth_me_with_invalid_token_returns_401(self):
        """Verify /auth/me returns 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/auth/me",
            headers={"X-Session-Token": "invalid_token_12345"}
        )
        
        assert response.status_code == 401
        print("SUCCESS: /auth/me returns 401 with invalid token")


class TestEnterpriseDashboard:
    """Test enterprise dashboard endpoints (require auth)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get authenticated session for tests"""
        login_response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.session_token = login_response.json().get("session_token")
        self.headers = {"X-Session-Token": self.session_token}
    
    def test_dashboard_stats_returns_data(self):
        """Verify dashboard stats endpoint returns valid data"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/dashboard/stats",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required stat fields exist
        required_fields = [
            "total_employees", "active_employees", "employees_at_risk",
            "total_clients", "premium_clients", "pending_sos",
            "resolved_sos_today", "total_alerts_today", "blocked_threats_today",
            "revenue_today", "revenue_month", "pending_device_orders"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify stats are numbers
        assert isinstance(data["total_employees"], int)
        assert isinstance(data["total_clients"], int)
        assert isinstance(data["pending_sos"], int)
        print(f"SUCCESS: Dashboard stats returned with {len(data)} fields")
    
    def test_dashboard_charts_returns_data(self):
        """Verify dashboard charts endpoint returns valid chart data"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/dashboard/charts?days=7",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required chart data fields
        required_fields = ["phishing_trend", "sos_trend", "revenue_trend", "users_trend"]
        
        for field in required_fields:
            assert field in data, f"Missing chart field: {field}"
            assert isinstance(data[field], list), f"{field} should be a list"
        
        print(f"SUCCESS: Dashboard charts returned with trend data")
    
    def test_dashboard_stats_without_auth_returns_401(self):
        """Verify dashboard stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/dashboard/stats")
        
        assert response.status_code == 401
        print("SUCCESS: Dashboard stats returns 401 without auth")
    
    def test_dashboard_charts_without_auth_returns_401(self):
        """Verify dashboard charts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/enterprise/dashboard/charts")
        
        assert response.status_code == 401
        print("SUCCESS: Dashboard charts returns 401 without auth")


class TestLoginInvalidCredentials:
    """Test login with invalid credentials"""
    
    def test_login_wrong_email(self):
        """Verify login fails with wrong email"""
        response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": "wrong@example.com", "password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("SUCCESS: Login rejects wrong email")
    
    def test_login_wrong_password(self):
        """Verify login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("SUCCESS: Login rejects wrong password")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
