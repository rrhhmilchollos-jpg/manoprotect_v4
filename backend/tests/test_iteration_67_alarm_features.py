"""
Iteration 67 - Backend Tests for New Alarm Features
- Budget Calculator API (/api/budget-calculator)
- Alarm Plans API (/api/alarm-plans)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://manoprotect-desktop.preview.emergentagent.com')

class TestAlarmPlansAPI:
    """Test /api/alarm-plans endpoint"""
    
    def test_get_alarm_plans_success(self):
        """GET /api/alarm-plans returns 3 alarm plans"""
        response = requests.get(f"{BASE_URL}/api/alarm-plans")
        assert response.status_code == 200
        
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) == 3
        
    def test_alarm_plans_essential_details(self):
        """Verify alarm-essential plan details"""
        response = requests.get(f"{BASE_URL}/api/alarm-plans")
        data = response.json()
        
        essential = next((p for p in data["plans"] if p["id"] == "alarm-essential"), None)
        assert essential is not None
        assert essential["name"] == "ManoProtect Essential"
        assert essential["target"] == "Pisos y apartamentos"
        assert essential["promo_price"] == 24.99
        assert essential["regular_price"] == 34.99
        assert essential["camera_count"] == 2
        assert essential["sentinel_count"] == 1
        
    def test_alarm_plans_premium_details(self):
        """Verify alarm-premium plan details"""
        response = requests.get(f"{BASE_URL}/api/alarm-plans")
        data = response.json()
        
        premium = next((p for p in data["plans"] if p["id"] == "alarm-premium"), None)
        assert premium is not None
        assert premium["name"] == "ManoProtect Premium"
        assert premium["target"] == "Chalets, adosados y casas"
        assert premium["promo_price"] == 39.99
        assert premium["regular_price"] == 49.99
        assert premium["camera_count"] == 6
        assert premium["sentinel_count"] == 2
        assert premium.get("popular") == True
        
    def test_alarm_plans_business_details(self):
        """Verify alarm-business plan details"""
        response = requests.get(f"{BASE_URL}/api/alarm-plans")
        data = response.json()
        
        business = next((p for p in data["plans"] if p["id"] == "alarm-business"), None)
        assert business is not None
        assert business["name"] == "ManoProtect Business"
        assert business["target"] == "Locales, naves y oficinas"
        assert business["promo_price"] == 54.99
        assert business["regular_price"] == 69.99
        assert business["camera_count"] == 10
        assert business["sentinel_count"] == 3


class TestBudgetCalculatorAPI:
    """Test /api/budget-calculator endpoint"""
    
    def test_budget_calculator_piso(self):
        """POST /api/budget-calculator with piso returns Essential plan"""
        payload = {
            "space_type": "piso",
            "sqm": 80,
            "accesses": 2,
            "floors": 1
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Essential"
        assert data["plan_id"] == "alarm-essential"
        assert data["promo_price"] == 24.99
        assert data["regular_price"] == 34.99
        assert "savings_vs_securitas" in data
        assert data["savings_vs_securitas"] > 0
        
        # Verify details structure
        assert "details" in data
        assert "sensors" in data["details"]
        assert "cameras" in data["details"]
        assert "sirens" in data["details"]
        assert "contacts" in data["details"]
        assert "sentinel_included" in data["details"]
        
    def test_budget_calculator_chalet(self):
        """POST /api/budget-calculator with chalet returns Premium plan"""
        payload = {
            "space_type": "chalet",
            "sqm": 200,
            "accesses": 3,
            "floors": 2
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Premium"
        assert data["plan_id"] == "alarm-premium"
        assert data["promo_price"] == 39.99
        assert data["regular_price"] == 49.99
        
    def test_budget_calculator_local(self):
        """POST /api/budget-calculator with local returns Business plan"""
        payload = {
            "space_type": "local",
            "sqm": 300,
            "accesses": 4,
            "floors": 1
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Business"
        assert data["plan_id"] == "alarm-business"
        assert data["promo_price"] == 54.99
        assert data["regular_price"] == 69.99
        
    def test_budget_calculator_with_garden(self):
        """POST /api/budget-calculator with garden adds extra cameras/sirens"""
        payload_without_garden = {
            "space_type": "chalet",
            "sqm": 150,
            "accesses": 2,
            "floors": 1,
            "has_garden": False
        }
        payload_with_garden = {
            "space_type": "chalet",
            "sqm": 150,
            "accesses": 2,
            "floors": 1,
            "has_garden": True
        }
        
        response_no_garden = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload_without_garden)
        response_garden = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload_with_garden)
        
        assert response_no_garden.status_code == 200
        assert response_garden.status_code == 200
        
        data_no_garden = response_no_garden.json()
        data_garden = response_garden.json()
        
        # Garden should add +1 camera and +1 siren
        assert data_garden["details"]["cameras"] > data_no_garden["details"]["cameras"]
        assert data_garden["details"]["sirens"] > data_no_garden["details"]["sirens"]
        
    def test_budget_calculator_extra_cameras(self):
        """POST /api/budget-calculator with extra cameras increases camera count"""
        payload_no_extra = {
            "space_type": "piso",
            "sqm": 80,
            "accesses": 2,
            "floors": 1,
            "cameras_extra": 0
        }
        payload_extra = {
            "space_type": "piso",
            "sqm": 80,
            "accesses": 2,
            "floors": 1,
            "cameras_extra": 3
        }
        
        response_no_extra = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload_no_extra)
        response_extra = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload_extra)
        
        assert response_no_extra.status_code == 200
        assert response_extra.status_code == 200
        
        data_no_extra = response_no_extra.json()
        data_extra = response_extra.json()
        
        # Extra cameras should increase count by 3
        assert data_extra["details"]["cameras"] == data_no_extra["details"]["cameras"] + 3
        
    def test_budget_calculator_adosado(self):
        """POST /api/budget-calculator with adosado returns Premium plan"""
        payload = {
            "space_type": "adosado",
            "sqm": 120,
            "accesses": 2,
            "floors": 2
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Premium"
        assert data["plan_id"] == "alarm-premium"
        
    def test_budget_calculator_nave(self):
        """POST /api/budget-calculator with nave returns Business plan"""
        payload = {
            "space_type": "nave",
            "sqm": 500,
            "accesses": 5,
            "floors": 1
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Business"
        assert data["plan_id"] == "alarm-business"
        
    def test_budget_calculator_oficina(self):
        """POST /api/budget-calculator with oficina returns Business plan"""
        payload = {
            "space_type": "oficina",
            "sqm": 200,
            "accesses": 3,
            "floors": 1
        }
        response = requests.post(f"{BASE_URL}/api/budget-calculator", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["recommended_plan"] == "Business"
        assert data["plan_id"] == "alarm-business"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
