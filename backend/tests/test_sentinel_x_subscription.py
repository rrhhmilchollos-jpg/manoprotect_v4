"""
Test Sentinel X checkout with subscription and full_payment modes
Tests new mandatory subscription feature for free watches (Basic, J, S)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSentinelXCheckout:
    """Tests for /api/checkout/sentinel-x endpoint"""
    
    def test_subscription_checkout_basic(self):
        """Test subscription checkout for Sentinel X Basic (free watch with mandatory plan)"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User Basic",
            "email": "test_basic@example.com",
            "phone": "+34600000001",
            "address": "Test Street 123",
            "city": "Madrid",
            "postalCode": "28001",
            "country": "ES",
            "paymentType": "subscription",
            "amount": 9.95,
            "product": "SENTINEL X Basic (Bluetooth)",
            "selectedProduct": "sentinel-x-basic",
            "subscriptionPlan": "mensual"
        })
        
        # Should return checkout URL for subscription mode
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data, "Response should contain checkout_url"
        assert "session_id" in data, "Response should contain session_id"
        assert "stripe.com" in data["checkout_url"], "Should redirect to Stripe"
        print(f"PASS: Subscription checkout for Basic created - session: {data['session_id']}")
    
    def test_subscription_checkout_anual(self):
        """Test subscription checkout with annual plan"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User Annual",
            "email": "test_annual@example.com",
            "phone": "+34600000002",
            "address": "Test Street 456",
            "city": "Barcelona",
            "postalCode": "08001",
            "country": "ES",
            "paymentType": "subscription",
            "amount": 9.95,
            "product": "SENTINEL X Basic (Bluetooth)",
            "selectedProduct": "sentinel-x-basic",
            "subscriptionPlan": "anual"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data
        print(f"PASS: Annual subscription checkout created - session: {data['session_id']}")
    
    def test_full_payment_fundadores(self):
        """Test full_payment checkout for Sentinel X Fundadores (149€)"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User Fundadores",
            "email": "test_fundadores@example.com",
            "phone": "+34600000003",
            "address": "Test Street 789",
            "city": "Valencia",
            "postalCode": "46001",
            "country": "ES",
            "paymentType": "full_payment",
            "amount": 149,
            "product": "SENTINEL X Fundadores (4G)",
            "selectedProduct": "sentinel-x-fundadores",
            "subscriptionPlan": None
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data
        assert "stripe.com" in data["checkout_url"]
        print(f"PASS: Full payment checkout for Fundadores created - session: {data['session_id']}")
    
    def test_full_payment_premium(self):
        """Test full_payment checkout for Sentinel X Premium (199€)"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User Premium",
            "email": "test_premium@example.com",
            "phone": "+34600000004",
            "address": "Test Street 101",
            "city": "Sevilla",
            "postalCode": "41001",
            "country": "ES",
            "paymentType": "full_payment",
            "amount": 199,
            "product": "SENTINEL X Premium (4G Titanio)",
            "selectedProduct": "sentinel-x-premium",
            "subscriptionPlan": None
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data
        print(f"PASS: Full payment checkout for Premium created - session: {data['session_id']}")
    
    def test_subscription_sentinel_j(self):
        """Test subscription checkout for Sentinel J (free watch with mandatory plan)"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User J",
            "email": "test_j@example.com",
            "phone": "+34600000005",
            "address": "Test Street 202",
            "city": "Bilbao",
            "postalCode": "48001",
            "country": "ES",
            "paymentType": "subscription",
            "amount": 4.95,
            "product": "SENTINEL J Junior",
            "selectedProduct": "sentinel-j",
            "subscriptionPlan": "mensual"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data
        print(f"PASS: Subscription checkout for Sentinel J created")
    
    def test_subscription_sentinel_s(self):
        """Test subscription checkout for Sentinel S (free watch with mandatory plan)"""
        response = requests.post(f"{BASE_URL}/api/checkout/sentinel-x", json={
            "name": "TEST_User S",
            "email": "test_s@example.com",
            "phone": "+34600000006",
            "address": "Test Street 303",
            "city": "Malaga",
            "postalCode": "29001",
            "country": "ES",
            "paymentType": "subscription",
            "amount": 4.95,
            "product": "SENTINEL S Ninos",
            "selectedProduct": "sentinel-s",
            "subscriptionPlan": "anual"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "checkout_url" in data
        print(f"PASS: Subscription checkout for Sentinel S created")


class TestHealthCheck:
    """Basic health checks"""
    
    def test_api_health(self):
        """Test API is running"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"API health check failed: {response.status_code}"
        print("PASS: API is healthy")
    
    def test_plans_endpoint(self):
        """Test plans endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200, f"Plans endpoint failed: {response.status_code}"
        data = response.json()
        assert "individual_plans" in data
        print("PASS: Plans endpoint returns data")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
