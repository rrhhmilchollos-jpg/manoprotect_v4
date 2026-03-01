"""
Test Panel Vecinal Premium Feature - Iteration 73
Tests the most expensive plan (499.99 EUR/year, annual only, per family)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPanelVecinalPlanInfo:
    """Test /api/panel-vecinal/plan-info - PUBLIC endpoint"""
    
    def test_plan_info_returns_correct_price(self):
        """Verify plan price is 499.99 EUR"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["price"] == 499.99
        assert data["period"] == "ano"
        print(f"PASS: Plan price is {data['price']} EUR/{data['period']}")
    
    def test_plan_info_annual_only(self):
        """Verify plan is annual only"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["annual_only"] == True
        print("PASS: Plan is annual only")
    
    def test_plan_info_per_family(self):
        """Verify plan is per family unit"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["per_family"] == True
        print("PASS: Plan is per family unit")
    
    def test_plan_info_has_features(self):
        """Verify features list is returned"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert "features" in data
        assert isinstance(data["features"], list)
        assert len(data["features"]) > 0
        print(f"PASS: Plan has {len(data['features'])} features")
        # Check some expected features
        features_lower = [f.lower() for f in data["features"]]
        assert any("tiempo real" in f or "24/7" in f for f in features_lower)
        print("PASS: Features include real-time/24/7 monitoring")
    
    def test_plan_info_plan_id(self):
        """Verify plan_id is vecinal-anual"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["plan_id"] == "vecinal-anual"
        print("PASS: plan_id is vecinal-anual")


class TestPanelVecinalCheckAccess:
    """Test /api/panel-vecinal/check-access - checks subscription status"""
    
    def test_check_access_without_auth_returns_not_logged_in(self):
        """Without cookies, should return has_access=False, reason=not_logged_in"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/check-access")
        assert r.status_code == 200
        data = r.json()
        assert data["has_access"] == False
        assert data["reason"] == "not_logged_in"
        print("PASS: Without auth - has_access=False, reason=not_logged_in")


class TestPanelVecinalProtectedEndpoints:
    """Test protected endpoints - should return 401 without auth"""
    
    def test_dashboard_without_auth_returns_401(self):
        """GET /api/panel-vecinal/dashboard without auth returns 401"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/dashboard")
        assert r.status_code == 401
        print("PASS: Dashboard returns 401 without auth")
    
    def test_alerts_get_without_auth_returns_401(self):
        """GET /api/panel-vecinal/alerts without auth returns 401"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/alerts")
        assert r.status_code == 401
        print("PASS: GET alerts returns 401 without auth")
    
    def test_alerts_post_without_auth_returns_401(self):
        """POST /api/panel-vecinal/alerts without auth returns 401"""
        r = requests.post(f"{BASE_URL}/api/panel-vecinal/alerts", json={
            "type": "sospechoso",
            "title": "Test alert",
            "description": "Test",
            "latitude": 39.47,
            "longitude": -0.37,
            "urgency": "media"
        })
        # Should be 401 (unauthorized) not 422 (validation) or 200 (success)
        assert r.status_code == 401
        print("PASS: POST alerts returns 401 without auth")
    
    def test_neighbors_without_auth_returns_401(self):
        """GET /api/panel-vecinal/neighbors without auth returns 401"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/neighbors")
        assert r.status_code == 401
        print("PASS: Neighbors returns 401 without auth")


class TestVecinalCheckout:
    """Test Stripe checkout for vecinal-anual plan"""
    
    def test_create_checkout_vecinal_anual(self):
        """POST /api/create-checkout-session with plan_type='vecinal-anual' returns checkout URL"""
        r = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "vecinal-anual",
            "origin_url": "https://mano-ops-workspace.preview.emergentagent.com"
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"PASS: Vecinal-anual checkout URL: {data['checkout_url'][:80]}...")
        # Verify product details
        assert data["product"]["name"] == "Escudo Vecinal Premium"
        assert data["product"]["period"] == "ano"
        print(f"PASS: Product name={data['product']['name']}, period={data['product']['period']}")


class TestExistingAlarmCheckout:
    """Ensure existing alarm checkout still works"""
    
    def test_alarm_essential_checkout_still_works(self):
        """POST /api/create-checkout-session with alarm-essential returns URL"""
        r = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "alarm-essential",
            "origin_url": "https://mano-ops-workspace.preview.emergentagent.com"
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"PASS: Alarm-essential checkout still works: {data['checkout_url'][:60]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
