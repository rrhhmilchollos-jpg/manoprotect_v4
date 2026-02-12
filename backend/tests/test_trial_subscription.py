"""
Test Trial Subscription System - 7 Days Free Trial with Stripe
Tests: POST /api/create-trial-subscription, GET /api/trial/status/{session_id}, 
       POST /api/trial/cancel, GET /api/trial/info
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTrialSubscriptionEndpoints:
    """Test trial subscription endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login with test user
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "ivanrubiosolas@gmail.com",
            "password": "TestMano123!"
        })
        if login_response.status_code == 200:
            self.logged_in = True
            self.user_data = login_response.json()
        else:
            self.logged_in = False
            self.user_data = None
    
    def test_plans_endpoint(self):
        """Test GET /api/plans returns all subscription plans"""
        response = self.session.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "individual_plans" in data
        assert "family_plans" in data
        assert "business_plans" in data
        assert "currency" in data
        assert data["currency"] == "EUR"
        
        # Verify individual plans include trial-related info
        individual_plans = data["individual_plans"]
        assert len(individual_plans) >= 5  # free, weekly, monthly, quarterly, yearly
        
        # Verify monthly plan exists (default for trial)
        monthly_plan = next((p for p in individual_plans if p["id"] == "monthly"), None)
        assert monthly_plan is not None
        assert monthly_plan["price"] == 29.99
        print(f"✅ Plans endpoint returns {len(individual_plans)} individual plans")
    
    def test_trial_info_requires_auth(self):
        """Test GET /api/trial/info requires authentication"""
        # Use a new session without auth
        new_session = requests.Session()
        response = new_session.get(f"{BASE_URL}/api/trial/info")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✅ Trial info endpoint correctly requires authentication")
    
    def test_trial_info_authenticated(self):
        """Test GET /api/trial/info with authenticated user"""
        if not self.logged_in:
            pytest.skip("Login failed - skipping authenticated test")
        
        response = self.session.get(f"{BASE_URL}/api/trial/info")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "has_trial" in data
        assert "can_start_trial" in data
        assert "message" in data
        
        if data["has_trial"]:
            assert "status" in data
            assert "days_remaining" in data
            assert "plan_after_trial" in data
            assert "amount_after_trial" in data
            print(f"✅ User has trial: status={data['status']}, days_remaining={data['days_remaining']}")
        else:
            print(f"✅ User can start trial: {data['can_start_trial']}")
    
    def test_create_trial_requires_auth(self):
        """Test POST /api/create-trial-subscription requires authentication"""
        new_session = requests.Session()
        new_session.headers.update({"Content-Type": "application/json"})
        response = new_session.post(f"{BASE_URL}/api/create-trial-subscription", json={
            "plan_after_trial": "monthly",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "iniciar sesión" in data["detail"].lower() or "autenticado" in data["detail"].lower()
        print("✅ Create trial endpoint correctly requires authentication")
    
    def test_create_trial_subscription(self):
        """Test POST /api/create-trial-subscription creates Stripe checkout session"""
        if not self.logged_in:
            pytest.skip("Login failed - skipping authenticated test")
        
        response = self.session.post(f"{BASE_URL}/api/create-trial-subscription", json={
            "plan_after_trial": "monthly",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        
        # Should return 200 with checkout URL or 400 if user already has trial
        assert response.status_code in [200, 400]
        data = response.json()
        
        if response.status_code == 200:
            assert "checkout_url" in data
            assert "session_id" in data
            assert "trial_days" in data
            assert data["trial_days"] == 7
            assert "plan_after_trial" in data
            assert "amount_after_trial" in data
            assert "message" in data
            assert "checkout.stripe.com" in data["checkout_url"]
            print(f"✅ Trial checkout created: session_id={data['session_id'][:30]}...")
        else:
            # User already has trial
            assert "detail" in data
            print(f"✅ User already has trial: {data['detail']}")
    
    def test_create_trial_invalid_plan(self):
        """Test POST /api/create-trial-subscription with invalid plan"""
        if not self.logged_in:
            pytest.skip("Login failed - skipping authenticated test")
        
        response = self.session.post(f"{BASE_URL}/api/create-trial-subscription", json={
            "plan_after_trial": "invalid_plan_xyz",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✅ Invalid plan correctly rejected: {data['detail']}")
    
    def test_trial_status_not_found(self):
        """Test GET /api/trial/status/{session_id} with invalid session"""
        response = self.session.get(f"{BASE_URL}/api/trial/status/invalid_session_id_12345")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        print("✅ Invalid session correctly returns 404")
    
    def test_trial_cancel_requires_auth(self):
        """Test POST /api/trial/cancel requires authentication"""
        new_session = requests.Session()
        new_session.headers.update({"Content-Type": "application/json"})
        response = new_session.post(f"{BASE_URL}/api/trial/cancel")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✅ Cancel trial endpoint correctly requires authentication")
    
    def test_trial_cancel_no_active_trial(self):
        """Test POST /api/trial/cancel when user has no active trial"""
        if not self.logged_in:
            pytest.skip("Login failed - skipping authenticated test")
        
        response = self.session.post(f"{BASE_URL}/api/trial/cancel")
        # Should return 404 if no active trial (status=trialing)
        # User may have pending_verification but not trialing
        assert response.status_code in [200, 404]
        data = response.json()
        
        if response.status_code == 404:
            assert "detail" in data
            print(f"✅ No active trial to cancel: {data['detail']}")
        else:
            assert "success" in data
            print(f"✅ Trial canceled successfully")


class TestTrialSubscriptionFlow:
    """Test complete trial subscription flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_complete_trial_flow_unauthenticated(self):
        """Test that unauthenticated users are redirected to login"""
        # 1. Try to create trial without auth
        response = self.session.post(f"{BASE_URL}/api/create-trial-subscription", json={
            "plan_after_trial": "monthly",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        assert response.status_code == 401
        
        # 2. Try to get trial info without auth
        response = self.session.get(f"{BASE_URL}/api/trial/info")
        assert response.status_code == 401
        
        # 3. Try to cancel trial without auth
        response = self.session.post(f"{BASE_URL}/api/trial/cancel")
        assert response.status_code == 401
        
        print("✅ All trial endpoints correctly require authentication")
    
    def test_trial_with_different_plans(self):
        """Test creating trial with different plan options"""
        # Login first
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "ivanrubiosolas@gmail.com",
            "password": "TestMano123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Login failed")
        
        # Test with different valid plans
        valid_plans = ["monthly", "quarterly", "yearly"]
        
        for plan in valid_plans:
            response = self.session.post(f"{BASE_URL}/api/create-trial-subscription", json={
                "plan_after_trial": plan,
                "origin_url": "https://family-safety-demo.preview.emergentagent.com"
            })
            # Should return 200 or 400 (if already has trial)
            assert response.status_code in [200, 400]
            data = response.json()
            
            if response.status_code == 200:
                assert "checkout_url" in data
                print(f"✅ Trial with plan '{plan}' created successfully")
                break  # Only one trial can be created
            else:
                print(f"✅ Trial with plan '{plan}': {data.get('detail', 'Already has trial')}")


class TestPaymentEndpoints:
    """Test regular payment endpoints (non-trial)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_create_checkout_session(self):
        """Test POST /api/create-checkout-session"""
        response = self.session.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "monthly",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "checkout_url" in data
        assert "session_id" in data
        assert "checkout.stripe.com" in data["checkout_url"]
        print(f"✅ Checkout session created: {data['session_id'][:30]}...")
    
    def test_create_checkout_invalid_plan(self):
        """Test POST /api/create-checkout-session with invalid plan"""
        response = self.session.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "invalid_plan",
            "origin_url": "https://family-safety-demo.preview.emergentagent.com"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✅ Invalid plan rejected: {data['detail']}")
    
    def test_checkout_status_invalid_session(self):
        """Test GET /api/checkout/status/{session_id} with invalid session"""
        response = self.session.get(f"{BASE_URL}/api/checkout/status/invalid_session_123")
        # Stripe will return error for invalid session (400, 500, or 520 from Cloudflare)
        assert response.status_code in [400, 500, 520]
        print("✅ Invalid checkout session handled correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
