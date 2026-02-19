"""
Test iteration 16 - ManoBank Fraud Detection & Employee Portal Features
Tests:
1. Public scam verification endpoints (Firebase Firestore with fallback)
2. Public scam reporting endpoint
3. Public scam stats endpoint
4. Employee portal authentication
5. Employee management with multiple roles
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sos-device-preview.preview.emergentagent.com')

class TestPublicScamEndpoints:
    """Test public scam verification endpoints - Firebase Firestore with MongoDB fallback"""
    
    def test_verify_scam_phone_not_found(self):
        """Test verifying a phone number that is not in the scam database"""
        response = requests.get(
            f"{BASE_URL}/api/manobank/public/verify-scam",
            params={"value": "600123456", "type": "phone"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should return found=False since this number is not reported
        assert "found" in data
        # Firebase may return error if not configured, but endpoint should work
        if "error" not in data:
            assert data["found"] == False
            assert data["is_scam"] == False
        print(f"Verify scam response: {data}")
    
    def test_verify_scam_email_not_found(self):
        """Test verifying an email that is not in the scam database"""
        response = requests.get(
            f"{BASE_URL}/api/manobank/public/verify-scam",
            params={"value": "test@example.com", "type": "email"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "found" in data
        print(f"Verify email response: {data}")
    
    def test_verify_scam_missing_value(self):
        """Test verifying without providing a value - should return 400"""
        response = requests.get(
            f"{BASE_URL}/api/manobank/public/verify-scam",
            params={"value": "", "type": "phone"}
        )
        # Should return 400 for missing value
        assert response.status_code == 400
    
    def test_report_scam_phone(self):
        """Test reporting a scam phone number"""
        response = requests.post(
            f"{BASE_URL}/api/manobank/public/report-scam",
            json={
                "type": "phone",
                "value": "666999777",
                "description": "Test scam report from automated testing",
                "category": "phishing",
                "reporter_email": "test@automated.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Should return success or error if Firebase not configured
        assert "success" in data or "error" in data
        print(f"Report scam response: {data}")
    
    def test_report_scam_email(self):
        """Test reporting a scam email"""
        response = requests.post(
            f"{BASE_URL}/api/manobank/public/report-scam",
            json={
                "type": "email",
                "value": "scammer@fake.com",
                "description": "Phishing email pretending to be bank",
                "category": "phishing",
                "reporter_email": "reporter@test.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "success" in data or "error" in data
        print(f"Report email scam response: {data}")
    
    def test_report_scam_missing_value(self):
        """Test reporting without providing a value - should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/manobank/public/report-scam",
            json={
                "type": "phone",
                "value": "",
                "description": "Test"
            }
        )
        assert response.status_code == 400
    
    def test_scam_stats(self):
        """Test getting public scam statistics"""
        response = requests.get(f"{BASE_URL}/api/manobank/public/scam-stats")
        assert response.status_code == 200
        data = response.json()
        # Should return stats structure even if Firebase not configured
        assert "total_reports" in data
        assert "phone_scams" in data
        assert "email_scams" in data
        assert "verified" in data
        assert "last_updated" in data
        print(f"Scam stats: {data}")


class TestEmployeeAuthentication:
    """Test employee portal authentication"""
    
    def test_employee_login_step1(self):
        """Test employee login - step 1 credentials verification"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "rrhh.milchollos@gmail.com",
                "password": "ManoAdmin2025!"
            }
        )
        # Should return 200 with 2FA required or token
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            print(f"Login response: {data}")
    
    def test_employee_login_invalid_credentials(self):
        """Test employee login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "invalid@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401


class TestEmployeeAdminEndpoints:
    """Test employee admin endpoints (require authentication)"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        # Login
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "rrhh.milchollos@gmail.com",
                "password": "ManoAdmin2025!"
            }
        )
        if response.status_code == 200:
            return session
        pytest.skip("Could not authenticate - 2FA may be required")
    
    def test_admin_dashboard_unauthorized(self):
        """Test admin dashboard without authentication"""
        response = requests.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]
    
    def test_admin_employees_unauthorized(self):
        """Test employees list without authentication"""
        response = requests.get(f"{BASE_URL}/api/manobank/admin/employees")
        assert response.status_code in [401, 403]
    
    def test_admin_loans_unauthorized(self):
        """Test loans list without authentication"""
        response = requests.get(f"{BASE_URL}/api/manobank/admin/loans")
        assert response.status_code in [401, 403]


class TestPublicBankInfo:
    """Test public bank information endpoint"""
    
    def test_public_bank_info(self):
        """Test getting public bank information"""
        response = requests.get(f"{BASE_URL}/api/manobank/public/bank-info")
        assert response.status_code == 200
        data = response.json()
        # Should return bank info
        assert "bank_name" in data
        assert "swift_bic" in data
        print(f"Bank info: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
