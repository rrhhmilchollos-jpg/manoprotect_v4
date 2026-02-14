"""
Test 2FA Login Flow for Enterprise Portal
Tests login flow with and without 2FA enabled
Iteration 42 - 2FA mandatory verification
"""
import pytest
import requests
import pyotp
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# CEO user has 2FA enabled with known TOTP secret
ADMIN_WITH_2FA = {
    "email": "ceo@manoprotect.com",
    "password": "Admin2026!",
    "totp_secret": "EGURNUTLWW7XVKREBAMKIC6Y4LQ7CHKB",
    "backup_codes": ["J4WYBY6I", "YA54CMZ7", "MD3TPINO", "IMCC6I4L", "F4QAF7B2"]
}

# Note: admin@manoprotect.com doesn't exist in seed data
# operador@manoprotect.com exists but we don't have the password


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self, api_client):
        """Verify API is running"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✅ API health check passed")


class TestLoginWithInvalidCredentials:
    """Test login with invalid credentials"""
    
    def test_login_invalid_password(self, api_client):
        """Login with wrong password should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401, "Invalid credentials should return 401"
        print("✅ Invalid credentials rejected correctly")
    
    def test_login_invalid_email(self, api_client):
        """Login with non-existent email should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={
                "email": "nonexistent@manoprotect.com",
                "password": "Admin2026!"
            }
        )
        
        assert response.status_code == 401, "Non-existent user should return 401"
        print("✅ Non-existent user rejected correctly")


class TestLoginWith2FARequired:
    """Test login flow for user with 2FA enabled"""
    
    def test_login_with_2fa_requires_code(self, api_client):
        """Login with ceo@manoprotect.com should require 2FA"""
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": ADMIN_WITH_2FA["password"]
            }
        )
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should indicate 2FA is required
        assert data.get("requires_2fa") == True, "Should require 2FA"
        assert data.get("success") == False, "Success should be False until 2FA verified"
        assert "employee_id" in data, "Should return employee_id"
        assert "name" in data, "Should return employee name"
        assert "message" in data, "Should return message about 2FA"
        print("✅ Login correctly requires 2FA")
    
    def test_2fa_with_valid_totp_code(self, api_client):
        """Complete login with valid TOTP code"""
        # Generate current TOTP code
        totp = pyotp.TOTP(ADMIN_WITH_2FA["totp_secret"])
        current_code = totp.now()
        print(f"Generated TOTP code: {current_code}")
        
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login-2fa",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": ADMIN_WITH_2FA["password"],
                "totp_code": current_code
            }
        )
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("success") == True, "Login with valid TOTP should succeed"
        assert data.get("requires_2fa") == False, "Should not require 2FA after verification"
        assert "session_token" in data, "Should return session token"
        assert "employee_id" in data, "Should return employee_id"
        assert data.get("email") == ADMIN_WITH_2FA["email"], "Email should match"
        print("✅ Login with TOTP code successful")
    
    def test_2fa_with_invalid_totp_code(self, api_client):
        """Verify invalid TOTP code is rejected"""
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login-2fa",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": ADMIN_WITH_2FA["password"],
                "totp_code": "000000"  # Invalid code
            }
        )
        print(f"Response status: {response.status_code}")
        
        assert response.status_code == 401, "Invalid TOTP should return 401"
        data = response.json()
        assert "detail" in data, "Should return error detail"
        print("✅ Invalid TOTP code rejected correctly")
    
    def test_2fa_with_backup_code(self, api_client):
        """Verify backup codes work for 2FA login"""
        # Use a remaining backup code (some may have been used in previous runs)
        # Available: YA54CMZ7, MD3TPINO, IMCC6I4L, F4QAF7B2
        backup_code = "YA54CMZ7"
        print(f"Using backup code: {backup_code}")
        
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login-2fa",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": ADMIN_WITH_2FA["password"],
                "totp_code": backup_code
            }
        )
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data.get("success") == True, "Login with backup code should succeed"
        assert "session_token" in data, "Should return session token"
        print("✅ Login with backup code successful")
    
    def test_2fa_with_wrong_password(self, api_client):
        """2FA endpoint should still validate password"""
        totp = pyotp.TOTP(ADMIN_WITH_2FA["totp_secret"])
        current_code = totp.now()
        
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login-2fa",
            json={
                "email": ADMIN_WITH_2FA["email"],
                "password": "wrongpassword",
                "totp_code": current_code
            }
        )
        
        assert response.status_code == 401, "Wrong password should return 401 even with valid TOTP"
        print("✅ 2FA correctly rejects wrong password")


class TestNon2FAUserUsing2FAEndpoint:
    """Test edge case - user without 2FA using 2FA endpoint"""
    
    def test_2fa_endpoint_validates_credentials_first(self, api_client):
        """2FA endpoint should reject invalid credentials before checking 2FA status"""
        response = api_client.post(
            f"{BASE_URL}/api/enterprise/auth/login-2fa",
            json={
                "email": "nonexistent@manoprotect.com",
                "password": "somepassword",
                "totp_code": "123456"
            }
        )
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
        
        # Should return 401 for invalid credentials
        assert response.status_code == 401, "Should return 401 for invalid credentials"
        data = response.json()
        assert "detail" in data, "Should return error detail"
        print("✅ Invalid credentials rejected on 2FA endpoint")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
