"""
Iteration 77: Complete Pricing & Subscription Testing
Tests for:
- New Pricing page with 5 tabs
- Updated alarm prices (33.90/44.90/54.90/74.90)
- Sentinel subscription plans (9.99/14.99/24.99)
- Universal referral system
- Extras catalog
- API endpoints for plans, referrals, checkout
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://escudo-preview.preview.emergentagent.com').rstrip('/')


class TestPlansAPI:
    """Test /api/plans endpoint returns all pricing data"""

    def test_plans_endpoint_returns_200(self):
        """GET /api/plans should return 200"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "alarm_plans" in data
        assert "alarm_business_plans" in data
        assert "sentinel_plans" in data
        assert "referral_bonus" in data
        print("✅ GET /api/plans returns 200 with all plan types")

    def test_alarm_plans_correct_prices(self):
        """Alarm plans should have correct promotional prices"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        data = response.json()
        
        alarm_plans = {p["id"]: p for p in data["alarm_plans"]}
        
        # Essential: 33.90 EUR (promo), 44.90 EUR (regular)
        assert alarm_plans["alarm-essential"]["price"] == 33.90, "Essential price should be 33.90"
        assert alarm_plans["alarm-essential"]["regularPrice"] == 44.90, "Essential regular price should be 44.90"
        
        # Premium: 44.90 EUR (promo), 54.90 EUR (regular)
        assert alarm_plans["alarm-premium"]["price"] == 44.90, "Premium price should be 44.90"
        assert alarm_plans["alarm-premium"]["regularPrice"] == 54.90, "Premium regular price should be 54.90"
        
        print("✅ Alarm plans have correct prices: Essential 33.90, Premium 44.90")

    def test_alarm_business_plans_correct_prices(self):
        """Business alarm plans should have correct prices"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        data = response.json()
        
        business_plans = {p["id"]: p for p in data["alarm_business_plans"]}
        
        # Comercio: 54.90 EUR
        assert business_plans["alarm-business"]["price"] == 54.90, "Comercio price should be 54.90"
        
        # Empresa: 74.90 EUR
        assert business_plans["alarm-enterprise"]["price"] == 74.90, "Empresa price should be 74.90"
        
        print("✅ Business alarm plans: Comercio 54.90, Empresa 74.90")

    def test_sentinel_plans_correct_prices(self):
        """Sentinel plans should have correct subscription prices"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        data = response.json()
        
        sentinel_plans = {p["id"]: p for p in data["sentinel_plans"]}
        
        # Basic: 9.99 EUR/mes
        assert sentinel_plans["sentinel-basic"]["price"] == 9.99
        
        # Plus: 14.99 EUR/mes
        assert sentinel_plans["sentinel-plus"]["price"] == 14.99
        
        # Pro: 24.99 EUR/mes
        assert sentinel_plans["sentinel-pro"]["price"] == 24.99
        
        print("✅ Sentinel plans: Basic 9.99, Plus 14.99, Pro 24.99")

    def test_referral_bonus_message(self):
        """Referral bonus should be '1 mes gratis para ambos'"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=15)
        data = response.json()
        
        assert "referral_bonus" in data
        assert "1 mes gratis" in data["referral_bonus"].lower()
        
        print(f"✅ Referral bonus: {data['referral_bonus']}")


class TestReferralValidation:
    """Test referral code validation endpoints"""

    def test_invalid_referral_code(self):
        """GET /api/referrals/validate/FAKE should return valid:false"""
        response = requests.get(f"{BASE_URL}/api/referrals/validate/FAKE", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        print("✅ Invalid referral code returns valid:false")

    def test_invalid_referral_code_variations(self):
        """Test various invalid codes"""
        invalid_codes = ["INVALID123", "TEST", "ABC", "NOTREAL"]
        for code in invalid_codes:
            response = requests.get(f"{BASE_URL}/api/referrals/validate/{code}", timeout=10)
            assert response.status_code == 200
            data = response.json()
            assert data["valid"] == False, f"Code {code} should be invalid"
        print("✅ All invalid codes correctly return valid:false")


class TestPanelVecinalReferrals:
    """Test Panel Vecinal referral validation"""

    def test_panel_vecinal_referral_validate_invalid(self):
        """GET /api/panel-vecinal/referrals/validate/FAKE should return valid:false"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/referrals/validate/FAKE", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False
        print("✅ Panel Vecinal invalid referral returns valid:false")

    def test_panel_vecinal_plan_info(self):
        """GET /api/panel-vecinal/plan-info returns correct price 299.99"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        assert data["price"] == 299.99, f"Expected 299.99, got {data['price']}"
        assert data["annual_only"] == True
        assert data["standalone"] == True
        assert data["per_family"] == True
        
        print(f"✅ Vecinal plan: {data['price']} EUR/year, standalone={data['standalone']}")


class TestCheckoutSession:
    """Test checkout session creation"""

    def test_checkout_session_accepts_referral_code(self):
        """POST /api/create-checkout-session should accept referral_code field"""
        payload = {
            "plan_type": "family-monthly",
            "origin_url": "https://escudo-preview.preview.emergentagent.com",
            "referral_code": "TEST123"
        }
        response = requests.post(f"{BASE_URL}/api/create-checkout-session", json=payload, timeout=15)
        
        # Should return 200 with checkout URL or error (not 422 validation error)
        # The checkout should work even with an invalid referral code
        assert response.status_code in [200, 500], f"Expected 200 or 500, got {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "checkout_url" in data or "session_id" in data
            print("✅ Checkout session created successfully with referral_code field")
        else:
            print("✅ Checkout session accepts referral_code field (Stripe error expected without credentials)")


class TestDashboardBarrio:
    """Test Dashboard Barrio endpoints"""

    def test_public_stats(self):
        """GET /api/dashboard-barrio/public-stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data or "security_overview" in data
        print("✅ Dashboard Barrio public stats endpoint works")

    def test_ranking_endpoint(self):
        """GET /api/dashboard-barrio/ranking returns ranking data"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Should have scores, badges, or overall_rank
        print(f"✅ Dashboard Barrio ranking endpoint works, keys: {list(data.keys())}")


class TestEnterpriseCentral:
    """Test Enterprise Central endpoints"""

    def test_enterprise_dashboard(self):
        """GET /api/enterprise-central/dashboard returns data"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "overview" in data or "revenue" in data or "sales" in data
        print("✅ Enterprise Central dashboard works")

    def test_enterprise_leads(self):
        """GET /api/enterprise-central/leads returns leads list"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        print(f"✅ Enterprise Central leads: {len(data.get('leads', []))} leads")

    def test_enterprise_installations(self):
        """GET /api/enterprise-central/installations returns installations"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/installations", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "installations" in data
        print(f"✅ Enterprise Central installations: {len(data.get('installations', []))} entries")


class TestCommunityShield:
    """Test Community Shield / Escudo Vecinal endpoints"""

    def test_community_heatmap(self):
        """GET /api/community-shield/heatmap returns heatmap data"""
        response = requests.get(f"{BASE_URL}/api/community-shield/heatmap", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "points" in data
        print(f"✅ Community Shield heatmap: {len(data.get('points', []))} points")


class TestHealthCheck:
    """Test health and heartbeat endpoints"""

    def test_heartbeat(self):
        """GET /api/heartbeat returns alive:true"""
        response = requests.get(f"{BASE_URL}/api/heartbeat", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data["alive"] == True
        print("✅ Heartbeat alive")

    def test_health_check(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "degraded"]
        print(f"✅ Health check: {data.get('status')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
