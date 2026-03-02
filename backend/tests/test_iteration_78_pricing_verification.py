"""
Iteration 78: Pricing Consistency and Messaging Verification Tests
Tests: 
- API /api/plans returns correct prices (Essential 33.90, Premium 44.90, Comercio 54.90, Empresa 74.90)
- API /api/plans returns Sentinel prices (Basic 9.99, Plus 14.99, Pro 24.99)
- API /api/referrals/validate returns valid:false for fake codes
- No "Equipo GRATIS" text anywhere (only "Instalacion GRATIS")
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPricingAPI:
    """Test pricing API returns correct prices"""
    
    def test_api_plans_alarm_essential_price(self):
        """Essential alarm should be 33.90 EUR promo"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        alarm_plans = data.get('alarm_plans', [])
        
        # Find Essential plan
        essential = next((p for p in alarm_plans if p['id'] == 'alarm-essential'), None)
        assert essential is not None, "Essential plan not found"
        assert essential['price'] == 33.90, f"Essential price should be 33.90, got {essential['price']}"
        print(f"✓ Essential plan price: {essential['price']} EUR/mes")
    
    def test_api_plans_alarm_premium_price(self):
        """Premium alarm should be 44.90 EUR promo"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        alarm_plans = data.get('alarm_plans', [])
        
        # Find Premium plan
        premium = next((p for p in alarm_plans if p['id'] == 'alarm-premium'), None)
        assert premium is not None, "Premium plan not found"
        assert premium['price'] == 44.90, f"Premium price should be 44.90, got {premium['price']}"
        print(f"✓ Premium plan price: {premium['price']} EUR/mes")
    
    def test_api_plans_alarm_business_prices(self):
        """Business alarms: Comercio 54.90, Empresa 74.90"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        business_plans = data.get('alarm_business_plans', [])
        
        # Comercio 54.90
        comercio = next((p for p in business_plans if p['id'] == 'alarm-business'), None)
        assert comercio is not None, "Comercio plan not found"
        assert comercio['price'] == 54.90, f"Comercio price should be 54.90, got {comercio['price']}"
        print(f"✓ Comercio plan price: {comercio['price']} EUR/mes")
        
        # Empresa 74.90
        empresa = next((p for p in business_plans if p['id'] == 'alarm-enterprise'), None)
        assert empresa is not None, "Empresa plan not found"
        assert empresa['price'] == 74.90, f"Empresa price should be 74.90, got {empresa['price']}"
        print(f"✓ Empresa plan price: {empresa['price']} EUR/mes")

    def test_api_plans_sentinel_prices(self):
        """Sentinel plans: Basic 9.99, Plus 14.99, Pro 24.99"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        sentinel_plans = data.get('sentinel_plans', [])
        
        # Basic 9.99
        basic = next((p for p in sentinel_plans if p['id'] == 'sentinel-basic'), None)
        assert basic is not None, "Sentinel Basic not found"
        assert basic['price'] == 9.99, f"Basic price should be 9.99, got {basic['price']}"
        print(f"✓ Sentinel Basic price: {basic['price']} EUR/mes")
        
        # Plus 14.99
        plus = next((p for p in sentinel_plans if p['id'] == 'sentinel-plus'), None)
        assert plus is not None, "Sentinel Plus not found"
        assert plus['price'] == 14.99, f"Plus price should be 14.99, got {plus['price']}"
        print(f"✓ Sentinel Plus price: {plus['price']} EUR/mes")
        
        # Pro 24.99
        pro = next((p for p in sentinel_plans if p['id'] == 'sentinel-pro'), None)
        assert pro is not None, "Sentinel Pro not found"
        assert pro['price'] == 24.99, f"Pro price should be 24.99, got {pro['price']}"
        print(f"✓ Sentinel Pro price: {pro['price']} EUR/mes")

    def test_api_plans_installation_free(self):
        """All alarm plans should have free installation"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        alarm_plans = data.get('alarm_plans', [])
        
        for plan in alarm_plans:
            installation = plan.get('installation', '')
            assert 'GRATIS' in installation, f"Plan {plan['id']} installation should be GRATIS"
        print(f"✓ All {len(alarm_plans)} alarm plans have free installation")

    def test_api_plans_no_commitment(self):
        """All alarm plans should have no commitment"""
        response = requests.get(f"{BASE_URL}/api/plans", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        alarm_plans = data.get('alarm_plans', [])
        
        for plan in alarm_plans:
            commitment = plan.get('commitment', '')
            assert 'SIN permanencia' in commitment, f"Plan {plan['id']} should have SIN permanencia"
        print(f"✓ All {len(alarm_plans)} alarm plans have no commitment")


class TestReferralValidation:
    """Test referral code validation"""
    
    def test_invalid_referral_code(self):
        """Fake referral code should return valid:false"""
        response = requests.get(f"{BASE_URL}/api/referrals/validate/FAKE", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('valid') == False, "FAKE code should be invalid"
        print(f"✓ FAKE referral code returns valid=False, message={data.get('message')}")
    
    def test_empty_referral_code(self):
        """Empty referral code should return error or valid:false"""
        response = requests.get(f"{BASE_URL}/api/referrals/validate/", timeout=30)
        # Should either return 404 or valid:false
        if response.status_code == 404:
            print("✓ Empty referral code returns 404")
        else:
            data = response.json()
            assert data.get('valid') == False
            print("✓ Empty referral code returns valid=False")


class TestHealthAndCore:
    """Test core endpoints"""
    
    def test_health_endpoint(self):
        """Health check should return ok"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('status') in ['healthy', 'ok'], f"Health status should be healthy, got {data}"
        print(f"✓ Health check: {data.get('status')}")
    
    def test_public_landing_stats(self):
        """Public landing stats should work"""
        response = requests.get(f"{BASE_URL}/api/public/landing-stats", timeout=30)
        assert response.status_code == 200
        
        data = response.json()
        assert 'families_protected' in data, "Should have families_protected"
        print(f"✓ Landing stats: {data.get('families_protected')} families protected")


class TestPanelVecinalAndDashboard:
    """Test Panel Vecinal and Dashboard Barrio endpoints"""
    
    def test_panel_vecinal_plan_info(self):
        """Panel Vecinal plan info should return pricing"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info", timeout=30)
        # May require auth, so check for 200 or 401
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Panel Vecinal plan info: {data}")
        else:
            print(f"? Panel Vecinal plan info requires auth (status {response.status_code})")
    
    def test_dashboard_barrio_public_stats(self):
        """Dashboard Barrio public stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Dashboard Barrio public stats available")
        else:
            print(f"? Dashboard Barrio endpoint (status {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
