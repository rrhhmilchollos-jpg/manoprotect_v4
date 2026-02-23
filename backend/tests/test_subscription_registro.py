"""
Test Subscription Registration System - /registro page backend APIs
Tests: GET /api/subscriptions/planes, POST /api/subscriptions/registrar
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestSubscriptionPlans:
    """Test subscription plans endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_get_planes_returns_all_plans(self):
        """Test GET /api/subscriptions/planes returns all 3 plans"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions/planes")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "planes" in data
        planes = data["planes"]
        assert len(planes) == 3
        
        # Verify plan IDs
        plan_ids = [p["id"] for p in planes]
        assert "basico" in plan_ids
        assert "individual" in plan_ids
        assert "familiar" in plan_ids
        
        print(f"✅ GET /api/subscriptions/planes returns {len(planes)} plans")
    
    def test_basico_plan_no_card_required(self):
        """Test that basico plan does not require card"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions/planes")
        assert response.status_code == 200
        data = response.json()
        
        basico = next((p for p in data["planes"] if p["id"] == "basico"), None)
        assert basico is not None
        assert basico["requires_card"] == False
        assert basico["trial_days"] == 7
        assert basico["max_users"] == 1
        print(f"✅ Basico plan: requires_card={basico['requires_card']}, trial_days={basico['trial_days']}")
    
    def test_individual_plan_requires_card(self):
        """Test that individual plan requires card"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions/planes")
        assert response.status_code == 200
        data = response.json()
        
        individual = next((p for p in data["planes"] if p["id"] == "individual"), None)
        assert individual is not None
        assert individual["requires_card"] == True
        assert individual["trial_days"] == 7
        assert individual["max_users"] == 2
        assert "precio_mensual" in individual
        assert "precio_anual" in individual
        print(f"✅ Individual plan: requires_card={individual['requires_card']}, precio_anual={individual['precio_anual']}€")
    
    def test_familiar_plan_requires_card(self):
        """Test that familiar plan requires card"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions/planes")
        assert response.status_code == 200
        data = response.json()
        
        familiar = next((p for p in data["planes"] if p["id"] == "familiar"), None)
        assert familiar is not None
        assert familiar["requires_card"] == True
        assert familiar["trial_days"] == 7
        assert familiar["max_users"] == 5
        assert "precio_mensual" in familiar
        assert "precio_anual" in familiar
        print(f"✅ Familiar plan: requires_card={familiar['requires_card']}, precio_anual={familiar['precio_anual']}€")


class TestBasicPlanRegistration:
    """Test basic plan registration without card"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_registrar_basico_success(self):
        """Test POST /api/subscriptions/registrar with basico plan succeeds without card"""
        unique_email = f"test_basico_{int(time.time())}@test.com"
        
        response = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario Basico",
            "plan": "basico",
            "periodo": "mensual"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data["success"] == True
        assert data["plan"] == "basico"
        assert data["email"] == unique_email
        assert data["requires_card"] == False
        assert "trial_end" in data
        assert "7 días" in data["message"] or "prueba gratuita" in data["message"]
        
        print(f"✅ Basico plan registration successful: {unique_email}")
        print(f"   Trial end: {data['trial_end']}")
    
    def test_registrar_basico_no_payment_method(self):
        """Test basico plan registration works without payment_method_id"""
        unique_email = f"test_basico_nocard_{int(time.time())}@test.com"
        
        response = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario Sin Tarjeta",
            "plan": "basico",
            "periodo": "anual",
            "payment_method_id": None
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["requires_card"] == False
        print(f"✅ Basico plan registration without card: SUCCESS")
    
    def test_registrar_duplicate_email_fails(self):
        """Test registration with duplicate email fails"""
        unique_email = f"test_duplicate_{int(time.time())}@test.com"
        
        # First registration
        response1 = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario 1",
            "plan": "basico",
            "periodo": "mensual"
        })
        assert response1.status_code == 200
        
        # Second registration with same email
        response2 = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario 2",
            "plan": "basico",
            "periodo": "mensual"
        })
        assert response2.status_code == 400
        data = response2.json()
        assert "registrado" in data["detail"].lower() or "email" in data["detail"].lower()
        print(f"✅ Duplicate email correctly rejected: {data['detail']}")
    
    def test_registrar_invalid_email_format(self):
        """Test registration with invalid email format fails"""
        response = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": "invalid-email-format",
            "password": "Test1234!",
            "nombre": "Test Usuario",
            "plan": "basico",
            "periodo": "mensual"
        })
        assert response.status_code == 422  # Pydantic validation error
        print(f"✅ Invalid email format correctly rejected")


class TestPremiumPlanRegistration:
    """Test premium plan registration (requires card)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_registrar_individual_without_card_fails(self):
        """Test POST /api/subscriptions/registrar with individual plan without card fails"""
        unique_email = f"test_individual_nocard_{int(time.time())}@test.com"
        
        response = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario Individual",
            "plan": "individual",
            "periodo": "mensual"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "método de pago" in data["detail"].lower() or "payment" in data["detail"].lower()
        print(f"✅ Individual plan without card correctly rejected: {data['detail']}")
    
    def test_registrar_familiar_without_card_fails(self):
        """Test POST /api/subscriptions/registrar with familiar plan without card fails"""
        unique_email = f"test_familiar_nocard_{int(time.time())}@test.com"
        
        response = self.session.post(f"{BASE_URL}/api/subscriptions/registrar", json={
            "email": unique_email,
            "password": "Test1234!",
            "nombre": "Test Usuario Familiar",
            "plan": "familiar",
            "periodo": "anual"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "método de pago" in data["detail"].lower() or "payment" in data["detail"].lower()
        print(f"✅ Familiar plan without card correctly rejected: {data['detail']}")


class TestMiSuscripcion:
    """Test mi-suscripcion endpoint (requires auth)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_mi_suscripcion_requires_auth(self):
        """Test GET /api/subscriptions/mi-suscripcion requires authentication"""
        response = self.session.get(f"{BASE_URL}/api/subscriptions/mi-suscripcion")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✅ mi-suscripcion endpoint requires auth: {data['detail']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
