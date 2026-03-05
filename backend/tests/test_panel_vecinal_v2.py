"""
Test Panel Vecinal Premium Feature - Iteration 74
UPDATED PLAN: Price changed from 499.99 to 299.99 EUR/year
NEW FEATURES:
- standalone=True (independent plan, no other ManoProtect product required)
- requires_other_plan=False
- unlimited_families=True (any number of families can join)
- Referral system: invite neighbor, get 1 month free
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPanelVecinalPlanInfoUpdated:
    """Test /api/panel-vecinal/plan-info - UPDATED values"""
    
    def test_plan_info_returns_new_price_299_99(self):
        """Verify plan price is NOW 299.99 EUR (changed from 499.99)"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["price"] == 299.99, f"Expected price 299.99, got {data.get('price')}"
        assert data["period"] == "ano"
        print(f"PASS: Plan price is {data['price']} EUR/{data['period']} (updated from 499.99)")
    
    def test_plan_info_standalone_true(self):
        """Verify plan is STANDALONE (new feature)"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data.get("standalone") == True, f"Expected standalone=True, got {data.get('standalone')}"
        print("PASS: Plan is standalone (new feature)")
    
    def test_plan_info_requires_other_plan_false(self):
        """Verify requires_other_plan is False (new feature)"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data.get("requires_other_plan") == False, f"Expected requires_other_plan=False, got {data.get('requires_other_plan')}"
        print("PASS: requires_other_plan=False (new feature)")
    
    def test_plan_info_unlimited_families_true(self):
        """Verify unlimited_families is True (new feature)"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data.get("unlimited_families") == True, f"Expected unlimited_families=True, got {data.get('unlimited_families')}"
        print("PASS: unlimited_families=True (new feature)")
    
    def test_plan_info_referral_bonus_text(self):
        """Verify referral_bonus field exists with bonus description"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert "referral_bonus" in data, "referral_bonus field missing"
        # Should mention free month or similar
        referral_text = data.get("referral_bonus", "").lower()
        assert "mes" in referral_text or "month" in referral_text or "gratis" in referral_text or "free" in referral_text, \
            f"referral_bonus should mention free month, got: {data.get('referral_bonus')}"
        print(f"PASS: referral_bonus = '{data['referral_bonus']}'")
    
    def test_plan_info_features_include_referral(self):
        """Verify features array includes referral system mention"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        features = data.get("features", [])
        features_text = " ".join(features).lower()
        assert "referido" in features_text or "vecino" in features_text or "trae" in features_text or "invit" in features_text, \
            f"Features should mention referral system: {features}"
        print("PASS: Features include referral system mention")
    
    def test_plan_info_annual_only_unchanged(self):
        """Verify plan is still annual only"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["annual_only"] == True
        print("PASS: Plan is still annual only")
    
    def test_plan_info_per_family_unchanged(self):
        """Verify plan is still per family unit"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["per_family"] == True
        print("PASS: Plan is still per family unit")
    
    def test_plan_info_plan_id_unchanged(self):
        """Verify plan_id is still vecinal-anual"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert r.status_code == 200
        data = r.json()
        assert data["plan_id"] == "vecinal-anual"
        print("PASS: plan_id is vecinal-anual")


class TestPanelVecinalCheckAccess:
    """Test /api/panel-vecinal/check-access - checks subscription status"""
    
    def test_check_access_without_auth_returns_has_access_false(self):
        """Without cookies, should return has_access=False"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/check-access")
        assert r.status_code == 200
        data = r.json()
        assert data["has_access"] == False
        print(f"PASS: Without auth - has_access=False, reason={data.get('reason')}")


class TestPanelVecinalProtectedEndpoints:
    """Test protected endpoints - should return 401 without auth"""
    
    def test_dashboard_without_auth_returns_401(self):
        """GET /api/panel-vecinal/dashboard without auth returns 401"""
        r = requests.get(f"{BASE_URL}/api/panel-vecinal/dashboard")
        assert r.status_code == 401
        print("PASS: Dashboard returns 401 without auth")
    
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
        assert r.status_code == 401
        print("PASS: POST alerts returns 401 without auth")


class TestVecinalCheckoutUpdatedPrice:
    """Test Stripe checkout for vecinal-anual plan with NEW price"""
    
    def test_create_checkout_vecinal_anual_returns_checkout_url(self):
        """POST /api/create-checkout-session with plan_type='vecinal-anual' returns checkout URL"""
        r = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "vecinal-anual",
            "origin_url": "https://secure-gateway-33.preview.emergentagent.com"
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"PASS: Vecinal-anual checkout URL generated")
        # Verify product details
        assert data["product"]["name"] == "Escudo Vecinal Premium"
        assert data["product"]["period"] == "ano"
        print(f"PASS: Product name={data['product']['name']}, period={data['product']['period']}")


class TestRegressionAlarmCheckout:
    """Ensure existing alarm checkout still works"""
    
    def test_alarm_essential_checkout_still_works(self):
        """POST /api/create-checkout-session with alarm-essential returns URL"""
        r = requests.post(f"{BASE_URL}/api/create-checkout-session", json={
            "plan_type": "alarm-essential",
            "origin_url": "https://secure-gateway-33.preview.emergentagent.com"
        })
        assert r.status_code == 200
        data = r.json()
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print("PASS: Alarm-essential checkout still works")


class TestRegressionCommunityShieldStats:
    """Ensure community-shield stats endpoint still works"""
    
    def test_community_shield_stats_returns_200(self):
        """GET /api/community-shield/stats should return 200"""
        r = requests.get(f"{BASE_URL}/api/community-shield/stats")
        assert r.status_code == 200
        data = r.json()
        # Should have some expected fields
        assert "active_protectors" in data or "incidents_last_7_days" in data or "incidents_last_30_days" in data
        print(f"PASS: Community shield stats returns data: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
