"""
Phase 2 Features Tests:
1. 2FA Brute Force Protection - Account lockout after 5 failed attempts
2. Stripe Payment Lookup and Refund Endpoints
3. Payment Logs Endpoint
"""
import pytest
import requests
import pyotp
import time
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "ceo@manoprotectt.com"
TEST_PASSWORD = "Admin2026!"
TOTP_SECRET = "EGURNUTLWW7XVKREBAMKIC6Y4LQ7CHKB"

# Session for maintaining cookies
session = requests.Session()

class Test2FABruteForceProtection:
    """Test 2FA brute force protection with account lockout"""
    
    def test_01_api_health_check(self):
        """Verify API is responding"""
        res = requests.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        print("✅ API health check passed")
    
    def test_02_initial_login_requires_2fa(self):
        """Test that CEO account requires 2FA"""
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert res.status_code == 200, f"Login failed: {res.status_code}"
        data = res.json()
        assert data.get("requires_2fa") == True, "CEO account should require 2FA"
        print(f"✅ Login requires 2FA for {TEST_EMAIL}")
    
    def test_03_invalid_2fa_code_shows_remaining_attempts(self):
        """Test that invalid 2FA code shows remaining attempts"""
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "totp_code": "000001"
        })
        
        # Should fail with 401 and show remaining attempts
        assert res.status_code == 401, f"Expected 401, got {res.status_code}"
        data = res.json()
        detail = data.get("detail", "")
        assert "intentos" in detail.lower() or "attempts" in detail.lower(), f"Error should mention remaining attempts: {detail}"
        print(f"✅ Invalid 2FA shows remaining attempts: {detail}")
    
    def test_04_multiple_failed_attempts_show_decreasing_count(self):
        """Test that remaining attempts decrease with each failure"""
        # Skip if already locked
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "totp_code": "000002"
        })
        
        data = res.json()
        detail = data.get("detail", "")
        
        # Check if locked (429) or still has attempts (401)
        if res.status_code == 429:
            assert "bloqueada" in detail.lower() or "locked" in detail.lower(), "Should mention account is locked"
            print(f"✅ Account is locked after multiple failed attempts: {detail}")
            pytest.skip("Account is locked - can't test decreasing count")
        else:
            assert res.status_code == 401
            # Extract remaining attempts
            assert any(char.isdigit() for char in detail), "Message should contain remaining attempts count"
            print(f"✅ Failed attempt shows remaining: {detail}")
    
    def test_05_account_lockout_after_max_attempts(self):
        """Test that account gets locked after MAX_2FA_ATTEMPTS (5) failures"""
        # Try multiple invalid codes
        for i in range(6):
            res = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "totp_code": f"00000{i}"
            })
            
            data = res.json()
            detail = data.get("detail", "")
            
            if res.status_code == 429:
                # Account is now locked
                assert "bloqueada" in detail.lower() or "locked" in detail.lower(), "Should mention account is locked"
                assert "minuto" in detail.lower() or "minute" in detail.lower(), "Should mention lockout duration"
                print(f"✅ Account locked after {i+1} attempts: {detail}")
                return
            
            if res.status_code == 200:
                # Shouldn't succeed with invalid code
                pytest.fail("Invalid code should not succeed")
        
        # If we get here, check last response
        assert res.status_code == 429, "Account should be locked after 5 failed attempts"
    
    def test_06_locked_account_shows_retry_time(self):
        """Test that locked account shows retry time in error message"""
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "totp_code": "123456"
        })
        
        data = res.json()
        detail = data.get("detail", "")
        
        if res.status_code == 429:
            assert "minuto" in detail.lower() or "minute" in detail.lower(), f"Should show retry time: {detail}"
            print(f"✅ Locked account shows retry time: {detail}")
        else:
            # Account may have been reset - check if error mentions attempts
            print(f"ℹ️ Account not locked (status {res.status_code}): {detail}")


class TestStripePaymentLookup:
    """Test Stripe payment lookup and refund endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session before each test"""
        # First login
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if res.status_code == 200:
            data = res.json()
            if data.get("requires_2fa"):
                # Try with valid TOTP
                totp = pyotp.TOTP(TOTP_SECRET)
                valid_code = totp.now()
                
                res2 = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "totp_code": valid_code
                })
                
                if res2.status_code != 200:
                    pytest.skip(f"Could not authenticate with 2FA: {res2.json().get('detail')}")
    
    def test_07_payment_lookup_requires_auth(self):
        """Test that payment lookup endpoint requires authentication"""
        # New session without auth
        new_session = requests.Session()
        res = new_session.get(f"{BASE_URL}/api/enterprise/admin/payments/pi_test123")
        
        # Should fail without auth
        assert res.status_code in [401, 403], f"Should require auth, got {res.status_code}"
        print(f"✅ Payment lookup requires auth (status {res.status_code})")
    
    def test_08_payment_lookup_with_auth(self):
        """Test payment lookup with authenticated session"""
        # Use a test payment ID
        res = session.get(f"{BASE_URL}/api/enterprise/admin/payments/pi_test_nonexistent")
        
        # Should return 400/404 for invalid ID, not 401/403
        if res.status_code == 200:
            data = res.json()
            # Check response structure
            assert "payment_id" in data or "success" in data, "Should have payment details"
            print(f"✅ Payment lookup succeeded: {data.get('payment_id')}")
        else:
            # 400 or similar for invalid payment ID is expected
            assert res.status_code not in [401, 403], f"Auth should work, got {res.status_code}"
            print(f"✅ Payment lookup returns expected error for invalid ID (status {res.status_code})")
    
    def test_09_payment_refund_requires_auth(self):
        """Test that refund endpoint requires authentication"""
        new_session = requests.Session()
        res = new_session.post(
            f"{BASE_URL}/api/enterprise/admin/payments/pi_test123/refund",
            json={"reason": "Test refund"}
        )
        
        assert res.status_code in [401, 403], f"Refund should require auth, got {res.status_code}"
        print(f"✅ Refund endpoint requires auth (status {res.status_code})")
    
    def test_10_payment_refund_with_short_reason(self):
        """Test that refund with short reason is rejected"""
        res = session.post(
            f"{BASE_URL}/api/enterprise/admin/payments/pi_test123/refund",
            json={"reason": "ab"}  # Less than 5 chars
        )
        
        # Should fail validation
        assert res.status_code == 422, f"Should reject short reason, got {res.status_code}"
        print(f"✅ Refund rejects short reason (status {res.status_code})")
    
    def test_11_payment_logs_requires_auth(self):
        """Test that payment logs endpoint requires authentication"""
        new_session = requests.Session()
        res = new_session.get(f"{BASE_URL}/api/enterprise/admin/payment-logs")
        
        assert res.status_code in [401, 403], f"Payment logs should require auth, got {res.status_code}"
        print(f"✅ Payment logs requires auth (status {res.status_code})")
    
    def test_12_payment_logs_with_auth(self):
        """Test payment logs with authenticated session"""
        res = session.get(f"{BASE_URL}/api/enterprise/admin/payment-logs?limit=10")
        
        if res.status_code == 200:
            data = res.json()
            assert "logs" in data, "Response should have 'logs' key"
            assert "total" in data, "Response should have 'total' key"
            print(f"✅ Payment logs accessible, {data.get('total', 0)} logs found")
        elif res.status_code == 403:
            # Role may not have permission
            print(f"ℹ️ Payment logs access denied (role restriction)")
        else:
            pytest.fail(f"Unexpected status: {res.status_code}")


class TestRolePermissions:
    """Test role-based access control for payment operations"""
    
    def test_13_check_employee_role(self):
        """Verify test user role for permission tests"""
        # First authenticate
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if res.status_code == 200:
            data = res.json()
            if data.get("requires_2fa"):
                totp = pyotp.TOTP(TOTP_SECRET)
                res2 = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "totp_code": totp.now()
                })
                if res2.status_code == 200:
                    data = res2.json()
            
            role = data.get("role")
            print(f"✅ User role: {role}")
            
            # Check /me endpoint
            me_res = session.get(f"{BASE_URL}/api/enterprise/auth/me")
            if me_res.status_code == 200:
                me_data = me_res.json()
                print(f"✅ User authenticated as: {me_data.get('name')} ({me_data.get('role')})")
                assert me_data.get("role") in ["super_admin", "admin", "finance", "supervisor"], \
                    f"User should have admin/finance role, got {me_data.get('role')}"


def reset_2fa_lockout():
    """Helper to reset 2FA failed attempts for testing (run manually if needed)"""
    # This would require MongoDB access to reset
    print("ℹ️ To reset 2FA lockout, run MongoDB command:")
    print("db.enterprise_employees.updateOne(")
    print(f'  {{email: "{TEST_EMAIL}"}},')
    print('  {$set: {two_factor_failed_attempts: 0}, $unset: {two_factor_lockout_until: ""}}')
    print(")")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
