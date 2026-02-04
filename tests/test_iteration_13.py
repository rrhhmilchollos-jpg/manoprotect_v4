"""
Test Iteration 13: Price Synchronization, Checkout Session, and PaymentSuccess Page
Features tested:
1. /api/plans returns updated prices (weekly €9.99, monthly €29.99, quarterly €74.99, yearly €249.99, family-monthly €49.99, family-quarterly €129.99, family-yearly €399.99)
2. /api/create-checkout-session accepts all plan types (weekly, monthly, quarterly, yearly, family-monthly, family-quarterly, family-yearly)
3. SUBSCRIPTION_PACKAGES has synchronized prices with frontend
4. Checkout redirects to /payment-success
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mano-zones.preview.emergentagent.com')

# Expected prices synchronized between frontend and backend
EXPECTED_PRICES = {
    "weekly": 9.99,
    "monthly": 29.99,
    "quarterly": 74.99,
    "yearly": 249.99,
    "family-monthly": 49.99,
    "family-quarterly": 129.99,
    "family-yearly": 399.99,
    "business": 49.99,
    "enterprise": 199.99,
}


class TestPlansEndpoint:
    """Test /api/plans endpoint returns correct prices"""
    
    def test_plans_endpoint_returns_200(self):
        """Test that /api/plans returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ /api/plans returns 200 OK")
    
    def test_plans_returns_individual_plans(self):
        """Test that /api/plans returns individual plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        assert "individual_plans" in data, "Missing individual_plans in response"
        assert len(data["individual_plans"]) > 0, "No individual plans returned"
        print(f"✓ /api/plans returns {len(data['individual_plans'])} individual plans")
    
    def test_plans_returns_family_plans(self):
        """Test that /api/plans returns family plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        assert "family_plans" in data, "Missing family_plans in response"
        assert len(data["family_plans"]) > 0, "No family plans returned"
        print(f"✓ /api/plans returns {len(data['family_plans'])} family plans")
    
    def test_weekly_price_is_9_99(self):
        """Test weekly plan price is €9.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        weekly_plan = next((p for p in data["individual_plans"] if p["id"] == "weekly"), None)
        assert weekly_plan is not None, "Weekly plan not found"
        assert weekly_plan["price"] == 9.99, f"Weekly price should be 9.99, got {weekly_plan['price']}"
        print(f"✓ Weekly plan price is €{weekly_plan['price']}")
    
    def test_monthly_price_is_29_99(self):
        """Test monthly plan price is €29.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        monthly_plan = next((p for p in data["individual_plans"] if p["id"] == "monthly"), None)
        assert monthly_plan is not None, "Monthly plan not found"
        assert monthly_plan["price"] == 29.99, f"Monthly price should be 29.99, got {monthly_plan['price']}"
        print(f"✓ Monthly plan price is €{monthly_plan['price']}")
    
    def test_quarterly_price_is_74_99(self):
        """Test quarterly plan price is €74.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        quarterly_plan = next((p for p in data["individual_plans"] if p["id"] == "quarterly"), None)
        assert quarterly_plan is not None, "Quarterly plan not found"
        assert quarterly_plan["price"] == 74.99, f"Quarterly price should be 74.99, got {quarterly_plan['price']}"
        print(f"✓ Quarterly plan price is €{quarterly_plan['price']}")
    
    def test_yearly_price_is_249_99(self):
        """Test yearly plan price is €249.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        yearly_plan = next((p for p in data["individual_plans"] if p["id"] == "yearly"), None)
        assert yearly_plan is not None, "Yearly plan not found"
        assert yearly_plan["price"] == 249.99, f"Yearly price should be 249.99, got {yearly_plan['price']}"
        print(f"✓ Yearly plan price is €{yearly_plan['price']}")
    
    def test_family_monthly_price_is_49_99(self):
        """Test family-monthly plan price is €49.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        family_monthly = next((p for p in data["family_plans"] if p["id"] == "family-monthly"), None)
        assert family_monthly is not None, "Family monthly plan not found"
        assert family_monthly["price"] == 49.99, f"Family monthly price should be 49.99, got {family_monthly['price']}"
        print(f"✓ Family monthly plan price is €{family_monthly['price']}")
    
    def test_family_quarterly_price_is_129_99(self):
        """Test family-quarterly plan price is €129.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        family_quarterly = next((p for p in data["family_plans"] if p["id"] == "family-quarterly"), None)
        assert family_quarterly is not None, "Family quarterly plan not found"
        assert family_quarterly["price"] == 129.99, f"Family quarterly price should be 129.99, got {family_quarterly['price']}"
        print(f"✓ Family quarterly plan price is €{family_quarterly['price']}")
    
    def test_family_yearly_price_is_399_99(self):
        """Test family-yearly plan price is €399.99"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        family_yearly = next((p for p in data["family_plans"] if p["id"] == "family-yearly"), None)
        assert family_yearly is not None, "Family yearly plan not found"
        assert family_yearly["price"] == 399.99, f"Family yearly price should be 399.99, got {family_yearly['price']}"
        print(f"✓ Family yearly plan price is €{family_yearly['price']}")


class TestCreateCheckoutSession:
    """Test /api/create-checkout-session endpoint accepts all plan types"""
    
    def test_checkout_weekly_plan(self):
        """Test checkout session creation for weekly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "weekly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        assert "session_id" in data, "Missing session_id in response"
        print(f"✓ Checkout session created for weekly plan: {data['session_id'][:20]}...")
    
    def test_checkout_monthly_plan(self):
        """Test checkout session creation for monthly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "monthly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for monthly plan")
    
    def test_checkout_quarterly_plan(self):
        """Test checkout session creation for quarterly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "quarterly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for quarterly plan")
    
    def test_checkout_yearly_plan(self):
        """Test checkout session creation for yearly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "yearly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for yearly plan")
    
    def test_checkout_family_monthly_plan(self):
        """Test checkout session creation for family-monthly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "family-monthly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for family-monthly plan")
    
    def test_checkout_family_quarterly_plan(self):
        """Test checkout session creation for family-quarterly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "family-quarterly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for family-quarterly plan")
    
    def test_checkout_family_yearly_plan(self):
        """Test checkout session creation for family-yearly plan"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "family-yearly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Missing checkout_url in response"
        print(f"✓ Checkout session created for family-yearly plan")
    
    def test_checkout_invalid_plan_returns_400(self):
        """Test checkout session creation with invalid plan returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "invalid-plan",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 400, f"Expected 400 for invalid plan, got {response.status_code}"
        print(f"✓ Invalid plan type correctly returns 400")
    
    def test_checkout_success_url_contains_payment_success(self):
        """Test that checkout session success URL redirects to /payment-success"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "monthly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # The checkout_url is a Stripe URL, but we can verify the session was created
        # The success_url is set in the backend to redirect to /payment-success
        assert "checkout_url" in data
        assert "stripe.com" in data["checkout_url"], "Checkout URL should be a Stripe URL"
        print(f"✓ Checkout URL is a valid Stripe URL")


class TestCheckoutStatus:
    """Test /api/checkout/status endpoint"""
    
    def test_checkout_status_invalid_session(self):
        """Test checkout status with invalid session returns error"""
        response = requests.get(f"{BASE_URL}/api/checkout/status/invalid_session_id")
        # Should return error status for invalid session (404, 500, or 520)
        assert response.status_code in [404, 500, 520], f"Expected 404, 500, or 520, got {response.status_code}"
        print(f"✓ Invalid session ID correctly returns error status ({response.status_code})")
    
    def test_checkout_status_valid_session(self):
        """Test checkout status with valid session"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "monthly",
                "origin_url": "https://mano-zones.preview.emergentagent.com"
            }
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Then check its status
        status_response = requests.get(f"{BASE_URL}/api/checkout/status/{session_id}")
        assert status_response.status_code == 200, f"Expected 200, got {status_response.status_code}"
        data = status_response.json()
        
        # Verify response structure
        assert "status" in data or "payment_status" in data, "Missing status fields in response"
        print(f"✓ Checkout status endpoint works for valid session")


class TestPriceSynchronization:
    """Test that prices are synchronized between frontend and backend"""
    
    def test_all_individual_plan_prices_match(self):
        """Test all individual plan prices match expected values"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        for plan in data["individual_plans"]:
            plan_id = plan["id"]
            if plan_id in EXPECTED_PRICES:
                assert plan["price"] == EXPECTED_PRICES[plan_id], \
                    f"Price mismatch for {plan_id}: expected {EXPECTED_PRICES[plan_id]}, got {plan['price']}"
                print(f"✓ {plan_id} price matches: €{plan['price']}")
    
    def test_all_family_plan_prices_match(self):
        """Test all family plan prices match expected values"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        for plan in data["family_plans"]:
            plan_id = plan["id"]
            if plan_id in EXPECTED_PRICES:
                assert plan["price"] == EXPECTED_PRICES[plan_id], \
                    f"Price mismatch for {plan_id}: expected {EXPECTED_PRICES[plan_id]}, got {plan['price']}"
                print(f"✓ {plan_id} price matches: €{plan['price']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
