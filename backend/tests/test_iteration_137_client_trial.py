"""
Iteration 137: Client Trial, Anti-Abuse & Subscription System Tests
Tests for ManoProtect AppCliente trial, auth, subscription, referrals, and anti-abuse features
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestClientTrialRegistration:
    """Tests for POST /api/client-trial/register - creates user with 7-day trial"""
    
    def test_register_new_user_success(self):
        """Register a new user and verify 7-day trial is created"""
        unique_email = f"test_reg_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "Test User"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify token is returned
        assert "token" in data, "Token should be returned"
        assert len(data["token"]) > 0, "Token should not be empty"
        
        # Verify user data
        assert "user" in data, "User data should be returned"
        user = data["user"]
        assert user["email"] == unique_email.lower(), "Email should match"
        assert user["subscription_status"] == "trial", "Should be in trial status"
        assert user["trial_days_left"] == 7, "Should have 7 days trial"
        assert "referral_code" in user, "Should have referral code"
        assert len(user["referral_code"]) == 8, "Referral code should be 8 chars"
    
    def test_register_duplicate_email_fails(self):
        """Registering with existing email should fail with 409"""
        # First register
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "First User"
        })
        
        # Try to register again with same email
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "DifferentPass123",
            "nombre": "Second User"
        })
        
        assert response.status_code == 409, f"Expected 409 for duplicate, got {response.status_code}"
    
    def test_register_short_password_fails(self):
        """Password less than 6 chars should fail"""
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": f"test_short_{uuid.uuid4().hex[:8]}@test.com",
            "password": "12345",  # Only 5 chars
            "nombre": "Test"
        })
        
        assert response.status_code == 400, f"Expected 400 for short password, got {response.status_code}"
    
    def test_register_empty_email_fails(self):
        """Empty email should fail"""
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": "",
            "password": "TestPass123",
            "nombre": "Test"
        })
        
        assert response.status_code == 400, f"Expected 400 for empty email, got {response.status_code}"


class TestClientTrialLogin:
    """Tests for POST /api/client-trial/login - authenticates and returns trial status"""
    
    @pytest.fixture
    def registered_user(self):
        """Create a user for login tests"""
        unique_email = f"test_login_{uuid.uuid4().hex[:8]}@test.com"
        password = "TestPass123"
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": password,
            "nombre": "Login Test User"
        })
        data = response.json()
        return {"email": unique_email, "password": password, "user": data.get("user", {})}
    
    def test_login_success(self, registered_user):
        """Login with valid credentials returns token and trial status"""
        response = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"],
            "fingerprint": "test_fingerprint_123"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify token
        assert "token" in data, "Token should be returned"
        
        # Verify user data with trial status
        assert "user" in data, "User data should be returned"
        user = data["user"]
        assert user["subscription_status"] in ["trial", "active", "expired"], "Should have valid status"
        assert "trial_days_left" in user, "Should have trial_days_left"
        assert "referral_code" in user, "Should have referral code"
    
    def test_login_wrong_password_fails(self, registered_user):
        """Login with wrong password should fail with 401"""
        response = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": registered_user["email"],
            "password": "WrongPassword123"
        })
        
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
    
    def test_login_nonexistent_user_fails(self):
        """Login with non-existent email should fail with 401"""
        response = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": f"nonexistent_{uuid.uuid4().hex}@test.com",
            "password": "TestPass123"
        })
        
        assert response.status_code == 401, f"Expected 401 for non-existent user, got {response.status_code}"
    
    def test_login_with_fingerprint(self, registered_user):
        """Login with device fingerprint should succeed and store fingerprint"""
        fingerprint = f"fp_{uuid.uuid4().hex[:16]}"
        response = requests.post(f"{BASE_URL}/api/client-trial/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"],
            "fingerprint": fingerprint
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestClientTrialStatus:
    """Tests for GET /api/client-trial/status - returns subscription status and days left"""
    
    @pytest.fixture
    def auth_token(self):
        """Create user and get auth token"""
        unique_email = f"test_status_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "Status Test User"
        })
        return response.json().get("token")
    
    def test_get_status_authenticated(self, auth_token):
        """Get trial status with valid token"""
        response = requests.get(f"{BASE_URL}/api/client-trial/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify status fields
        assert "subscription_status" in data, "Should have subscription_status"
        assert data["subscription_status"] in ["trial", "active", "expired"], "Should have valid status"
        assert "trial_days_left" in data, "Should have trial_days_left"
        assert "show_expiry_warning" in data, "Should have show_expiry_warning"
        assert "price_monthly" in data, "Should have price_monthly"
        assert data["price_monthly"] == 9.99, "Price should be 9.99 EUR"
    
    def test_get_status_no_token_fails(self):
        """Get status without token should fail with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/status")
        
        assert response.status_code == 401, f"Expected 401 without token, got {response.status_code}"
    
    def test_get_status_invalid_token_fails(self):
        """Get status with invalid token should fail with 401"""
        response = requests.get(f"{BASE_URL}/api/client-trial/status", headers={
            "Authorization": "Bearer invalid_token_here"
        })
        
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"


class TestClientTrialCheckout:
    """Tests for POST /api/client-trial/checkout - creates Stripe checkout session"""
    
    @pytest.fixture
    def auth_token(self):
        """Create user and get auth token"""
        unique_email = f"test_checkout_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "Checkout Test User"
        })
        return response.json().get("token")
    
    def test_create_checkout_session(self, auth_token):
        """Create Stripe checkout session returns URL"""
        response = requests.post(f"{BASE_URL}/api/client-trial/checkout", 
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={"origin_url": "https://auth-hardened-test.preview.emergentagent.com"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify checkout session data
        assert "url" in data, "Should return checkout URL"
        assert "session_id" in data, "Should return session_id"
        assert "stripe.com" in data["url"], "URL should be Stripe checkout URL"
    
    def test_checkout_without_origin_fails(self, auth_token):
        """Checkout without origin_url should fail with 400"""
        response = requests.post(f"{BASE_URL}/api/client-trial/checkout", 
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            json={}
        )
        
        assert response.status_code == 400, f"Expected 400 without origin_url, got {response.status_code}"
    
    def test_checkout_no_auth_fails(self):
        """Checkout without auth should fail with 401"""
        response = requests.post(f"{BASE_URL}/api/client-trial/checkout", 
            headers={"Content-Type": "application/json"},
            json={"origin_url": "https://example.com"}
        )
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"


class TestClientTrialReferral:
    """Tests for POST /api/client-trial/referral/apply - applies referral code for +3 days"""
    
    @pytest.fixture
    def two_users(self):
        """Create two users - referrer and invitee"""
        # Create referrer
        referrer_email = f"test_referrer_{uuid.uuid4().hex[:8]}@test.com"
        referrer_resp = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": referrer_email,
            "password": "TestPass123",
            "nombre": "Referrer User"
        })
        referrer_data = referrer_resp.json()
        
        # Create invitee
        invitee_email = f"test_invitee_{uuid.uuid4().hex[:8]}@test.com"
        invitee_resp = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": invitee_email,
            "password": "TestPass123",
            "nombre": "Invitee User"
        })
        invitee_data = invitee_resp.json()
        
        return {
            "referrer": {
                "token": referrer_data.get("token"),
                "user": referrer_data.get("user", {}),
                "referral_code": referrer_data.get("user", {}).get("referral_code")
            },
            "invitee": {
                "token": invitee_data.get("token"),
                "user": invitee_data.get("user", {})
            }
        }
    
    def test_apply_referral_success(self, two_users):
        """Apply valid referral code gives +3 days to both users"""
        referral_code = two_users["referrer"]["referral_code"]
        invitee_token = two_users["invitee"]["token"]
        
        response = requests.post(f"{BASE_URL}/api/client-trial/referral/apply",
            headers={
                "Authorization": f"Bearer {invitee_token}",
                "Content-Type": "application/json"
            },
            json={"code": referral_code}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "message" in data, "Should have success message"
        assert "+3" in data["message"], "Message should mention +3 days"
        assert "new_trial_expires" in data, "Should return new trial expiry"
    
    def test_apply_invalid_referral_fails(self, two_users):
        """Apply invalid referral code should fail with 404"""
        invitee_token = two_users["invitee"]["token"]
        
        response = requests.post(f"{BASE_URL}/api/client-trial/referral/apply",
            headers={
                "Authorization": f"Bearer {invitee_token}",
                "Content-Type": "application/json"
            },
            json={"code": "INVALID123"}
        )
        
        assert response.status_code == 404, f"Expected 404 for invalid code, got {response.status_code}"
    
    def test_apply_own_referral_fails(self, two_users):
        """User cannot apply their own referral code"""
        referrer_token = two_users["referrer"]["token"]
        referral_code = two_users["referrer"]["referral_code"]
        
        response = requests.post(f"{BASE_URL}/api/client-trial/referral/apply",
            headers={
                "Authorization": f"Bearer {referrer_token}",
                "Content-Type": "application/json"
            },
            json={"code": referral_code}
        )
        
        assert response.status_code == 400, f"Expected 400 for own code, got {response.status_code}"
    
    def test_apply_referral_twice_fails(self, two_users):
        """User cannot apply referral code twice"""
        referral_code = two_users["referrer"]["referral_code"]
        invitee_token = two_users["invitee"]["token"]
        
        # First application
        requests.post(f"{BASE_URL}/api/client-trial/referral/apply",
            headers={
                "Authorization": f"Bearer {invitee_token}",
                "Content-Type": "application/json"
            },
            json={"code": referral_code}
        )
        
        # Second application should fail
        response = requests.post(f"{BASE_URL}/api/client-trial/referral/apply",
            headers={
                "Authorization": f"Bearer {invitee_token}",
                "Content-Type": "application/json"
            },
            json={"code": referral_code}
        )
        
        assert response.status_code == 400, f"Expected 400 for second referral, got {response.status_code}"


class TestClientTrialAntiAbuse:
    """Tests for POST /api/client-trial/check-abuse - returns abuse score"""
    
    def test_check_abuse_new_fingerprint(self):
        """Check abuse with new fingerprint should return low score"""
        unique_fp = f"fp_{uuid.uuid4().hex}"
        response = requests.post(f"{BASE_URL}/api/client-trial/check-abuse",
            headers={"Content-Type": "application/json"},
            json={"fingerprint": unique_fp}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "allowed" in data, "Should have allowed field"
        assert "score" in data, "Should have score field"
        assert isinstance(data["score"], int), "Score should be integer"
        # New fingerprint should have low score
        assert data["allowed"] == True, "New fingerprint should be allowed"
    
    def test_check_abuse_empty_fingerprint(self):
        """Check abuse with empty fingerprint"""
        response = requests.post(f"{BASE_URL}/api/client-trial/check-abuse",
            headers={"Content-Type": "application/json"},
            json={"fingerprint": ""}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "allowed" in data
        assert "score" in data


class TestCheckoutStatus:
    """Tests for GET /api/client-trial/checkout/status/{session_id}"""
    
    @pytest.fixture
    def checkout_session(self):
        """Create user and checkout session"""
        unique_email = f"test_checkout_status_{uuid.uuid4().hex[:8]}@test.com"
        reg_resp = requests.post(f"{BASE_URL}/api/client-trial/register", json={
            "email": unique_email,
            "password": "TestPass123",
            "nombre": "Checkout Status Test"
        })
        token = reg_resp.json().get("token")
        
        # Create checkout session
        checkout_resp = requests.post(f"{BASE_URL}/api/client-trial/checkout",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"origin_url": "https://auth-hardened-test.preview.emergentagent.com"}
        )
        checkout_data = checkout_resp.json()
        
        return {
            "token": token,
            "session_id": checkout_data.get("session_id")
        }
    
    def test_get_checkout_status(self, checkout_session):
        """Get checkout status for valid session"""
        response = requests.get(
            f"{BASE_URL}/api/client-trial/checkout/status/{checkout_session['session_id']}",
            headers={"Authorization": f"Bearer {checkout_session['token']}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "status" in data, "Should have status"
        assert "payment_status" in data, "Should have payment_status"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
