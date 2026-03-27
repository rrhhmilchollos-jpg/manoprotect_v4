"""
Stripe Payment Lookup and Refund Tests - Separate from 2FA tests
"""
import pytest
import requests
import pyotp
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

TEST_EMAIL = "ceo@manoprotectt.com"
TEST_PASSWORD = "Admin2026!"
TOTP_SECRET = "EGURNUTLWW7XVKREBAMKIC6Y4LQ7CHKB"


class TestStripePaymentEndpoints:
    """Test Stripe payment lookup and refund endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session for all tests in class"""
        session = requests.Session()
        
        # Initial login
        res = session.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if res.status_code == 200:
            data = res.json()
            if data.get("requires_2fa"):
                totp = pyotp.TOTP(TOTP_SECRET)
                valid_code = totp.now()
                
                res2 = session.post(f"{BASE_URL}/api/enterprise/auth/login-2fa", json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "totp_code": valid_code
                })
                
                if res2.status_code != 200:
                    print(f"❌ 2FA auth failed: {res2.json().get('detail')}")
                    return None
                print(f"✅ Authenticated with 2FA")
            else:
                print(f"✅ Authenticated without 2FA")
        else:
            print(f"❌ Login failed: {res.status_code}")
            return None
        
        return session
    
    def test_payment_lookup_requires_auth(self, auth_session):
        """Test that payment lookup endpoint requires authentication"""
        new_session = requests.Session()
        res = new_session.get(f"{BASE_URL}/api/enterprise/admin/payments/pi_test123")
        
        assert res.status_code in [401, 403], f"Should require auth, got {res.status_code}"
        print(f"✅ Payment lookup requires auth (status {res.status_code})")
    
    def test_payment_lookup_with_invalid_id(self, auth_session):
        """Test payment lookup with invalid payment ID"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.get(f"{BASE_URL}/api/enterprise/admin/payments/pi_nonexistent_12345")
        
        # Should return error for invalid payment ID
        assert res.status_code in [400, 404, 500], f"Should reject invalid ID, got {res.status_code}"
        data = res.json()
        print(f"✅ Invalid payment ID handled: {res.status_code} - {data.get('detail', '')[:50]}")
    
    def test_refund_endpoint_requires_auth(self, auth_session):
        """Test that refund endpoint requires authentication"""
        new_session = requests.Session()
        res = new_session.post(
            f"{BASE_URL}/api/enterprise/admin/payments/pi_test123/refund",
            json={"reason": "Test refund reason here"}
        )
        
        assert res.status_code in [401, 403], f"Refund should require auth, got {res.status_code}"
        print(f"✅ Refund endpoint requires auth (status {res.status_code})")
    
    def test_refund_validation_short_reason(self, auth_session):
        """Test that refund with short reason is rejected"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.post(
            f"{BASE_URL}/api/enterprise/admin/payments/pi_test123/refund",
            json={"reason": "ab"}  # Less than 5 chars
        )
        
        # Should fail validation (422) or be rejected
        assert res.status_code in [422, 400], f"Should reject short reason, got {res.status_code}"
        print(f"✅ Short reason rejected (status {res.status_code})")
    
    def test_refund_with_valid_reason_invalid_payment(self, auth_session):
        """Test refund with valid reason but invalid payment ID"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.post(
            f"{BASE_URL}/api/enterprise/admin/payments/pi_test_nonexistent/refund",
            json={"reason": "Test refund for invalid payment testing"}
        )
        
        # Should fail due to invalid payment ID
        assert res.status_code in [400, 404, 500], f"Should fail for invalid payment, got {res.status_code}"
        data = res.json()
        print(f"✅ Invalid payment refund rejected: {res.status_code} - {data.get('detail', '')[:50]}")
    
    def test_payment_logs_requires_auth(self, auth_session):
        """Test that payment logs endpoint requires authentication"""
        new_session = requests.Session()
        res = new_session.get(f"{BASE_URL}/api/enterprise/admin/payment-logs")
        
        assert res.status_code in [401, 403], f"Payment logs should require auth, got {res.status_code}"
        print(f"✅ Payment logs requires auth (status {res.status_code})")
    
    def test_payment_logs_with_auth(self, auth_session):
        """Test payment logs with authenticated session"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.get(f"{BASE_URL}/api/enterprise/admin/payment-logs?limit=10")
        
        if res.status_code == 200:
            data = res.json()
            assert "logs" in data, "Response should have 'logs' key"
            assert "total" in data, "Response should have 'total' key"
            print(f"✅ Payment logs accessible, {data.get('total', 0)} total logs, {len(data.get('logs', []))} returned")
        elif res.status_code == 403:
            print(f"ℹ️ Payment logs access denied (role restriction)")
        else:
            pytest.fail(f"Unexpected status: {res.status_code}")
    
    def test_payment_logs_pagination(self, auth_session):
        """Test payment logs pagination parameters"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.get(f"{BASE_URL}/api/enterprise/admin/payment-logs?page=1&limit=5")
        
        if res.status_code == 200:
            data = res.json()
            assert "page" in data, "Response should have 'page' key"
            assert "pages" in data, "Response should have 'pages' key"
            print(f"✅ Payment logs pagination works: page {data.get('page')}/{data.get('pages')}")
        elif res.status_code == 403:
            print(f"ℹ️ Payment logs access denied (role restriction)")
    
    def test_check_user_permissions(self, auth_session):
        """Check current user role and permissions"""
        if not auth_session:
            pytest.skip("No authenticated session available")
        
        res = auth_session.get(f"{BASE_URL}/api/enterprise/auth/me")
        
        if res.status_code == 200:
            data = res.json()
            role = data.get("role")
            name = data.get("name")
            permissions = data.get("permissions", [])
            
            print(f"✅ Authenticated as: {name} (role: {role})")
            print(f"   Permissions: {permissions[:5]}..." if len(permissions) > 5 else f"   Permissions: {permissions}")
            
            # Verify role can access payment endpoints
            can_view_payments = role in ["super_admin", "admin", "finance", "supervisor"]
            can_process_refunds = role in ["super_admin", "admin", "finance"]
            
            print(f"   Can view payments: {can_view_payments}")
            print(f"   Can process refunds: {can_process_refunds}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
