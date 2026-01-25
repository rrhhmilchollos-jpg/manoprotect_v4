"""
ManoBank Registration Flow Tests - Iteration 20
Tests for:
1. Director General login at /banco → navigate to /banco/sistema
2. New customer registration form at /manobank/registro (5 steps)
3. POST /api/manobank/registro/nuevo-cliente endpoint
4. GET /api/manobank/admin/registrations endpoint
5. POST /api/manobank/admin/registrations/{id}/approve endpoint
6. Employee portal /banco/sistema Aperturas tab
7. Field validation in registration form
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://neo-banking-5.preview.emergentagent.com').rstrip('/')

# Test credentials
DIRECTOR_EMAIL = "rrhh.milchollos@gmail.com"
DIRECTOR_PASSWORD = "19862210Des"


class TestDirectorLogin:
    """Test Director General login flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_director_login_success(self):
        """Test Director General can login successfully"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify response contains expected fields
        assert "user_id" in data or "id" in data, "Response should contain user_id"
        assert data.get("email") == DIRECTOR_EMAIL or data.get("user", {}).get("email") == DIRECTOR_EMAIL
        print(f"✓ Director login successful: {data.get('name', data.get('email'))}")
    
    def test_director_access_admin_dashboard(self):
        """Test Director can access admin dashboard after login"""
        # First login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        # Access admin dashboard
        dashboard_response = self.session.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        
        assert dashboard_response.status_code == 200, f"Dashboard access failed: {dashboard_response.text}"
        data = dashboard_response.json()
        
        # Verify dashboard data
        assert "employee" in data, "Dashboard should contain employee info"
        assert "stats" in data, "Dashboard should contain stats"
        
        employee = data["employee"]
        assert employee.get("role") == "director" or employee.get("is_superadmin") == True, \
            f"User should be director or superadmin, got: {employee.get('role')}"
        
        print(f"✓ Admin dashboard accessible - Employee: {employee.get('name')}, Role: {employee.get('role')}")
    
    def test_invalid_credentials_rejected(self):
        """Test invalid credentials are rejected"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code in [401, 400], f"Expected 401/400, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")


class TestNewCustomerRegistration:
    """Test new customer registration endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Generate unique test data
        self.test_dni = f"TEST{uuid.uuid4().hex[:4].upper()}"
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        self.test_phone = f"6{uuid.uuid4().hex[:8][:8]}"[:9]  # Spanish mobile format
    
    def test_registration_endpoint_exists(self):
        """Test that registration endpoint exists and accepts POST"""
        # Test with minimal data to check endpoint exists
        response = self.session.post(f"{BASE_URL}/api/manobank/registro/nuevo-cliente", json={})
        
        # Should return 422 (validation error) not 404
        assert response.status_code != 404, "Registration endpoint should exist"
        print(f"✓ Registration endpoint exists (status: {response.status_code})")
    
    def test_registration_validation_required_fields(self):
        """Test that required fields are validated"""
        # Missing required fields
        response = self.session.post(f"{BASE_URL}/api/manobank/registro/nuevo-cliente", json={
            "nombre": "Test"
        })
        
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("✓ Required field validation working")
    
    def test_registration_creates_solicitud(self):
        """Test complete registration creates a solicitud"""
        registration_data = {
            "tipo_documento": "DNI",
            "numero_documento": self.test_dni,
            "letra_documento": "X",
            "nombre": "Test",
            "primer_apellido": "Usuario",
            "segundo_apellido": "Prueba",
            "fecha_nacimiento": "1990-01-15",
            "sexo": "H",
            "nacionalidad": "Española",
            "email": self.test_email,
            "telefono_movil": self.test_phone,
            "direccion": "Calle Test",
            "numero": "123",
            "codigo_postal": "46001",
            "localidad": "Valencia",
            "provincia": "Valencia",
            "pais": "España",
            "situacion_laboral": "empleado",
            "origen_fondos": "nomina",
            "proposito_cuenta": "gastos_diarios",
            "acepta_terminos": True,
            "acepta_privacidad": True,
            "acepta_comunicaciones": False,
            "persona_politica": False,
            "titular_real": True
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/manobank/registro/nuevo-cliente",
            json=registration_data
        )
        
        assert response.status_code in [200, 201], f"Registration failed: {response.text}"
        data = response.json()
        
        # Verify response contains solicitud_id
        assert "solicitud_id" in data, f"Response should contain solicitud_id: {data}"
        
        solicitud_id = data["solicitud_id"]
        assert solicitud_id.startswith("SOL-"), f"Solicitud ID should start with SOL-: {solicitud_id}"
        
        print(f"✓ Registration created successfully - Solicitud ID: {solicitud_id}")
        return solicitud_id
    
    def test_duplicate_dni_rejected(self):
        """Test that duplicate DNI is rejected"""
        # First registration
        registration_data = {
            "tipo_documento": "DNI",
            "numero_documento": f"DUP{uuid.uuid4().hex[:4].upper()}",
            "letra_documento": "Y",
            "nombre": "Duplicate",
            "primer_apellido": "Test",
            "fecha_nacimiento": "1990-01-15",
            "nacionalidad": "Española",
            "email": f"dup1_{uuid.uuid4().hex[:8]}@test.com",
            "telefono_movil": f"6{uuid.uuid4().hex[:8][:8]}"[:9],
            "direccion": "Calle Test",
            "codigo_postal": "46001",
            "localidad": "Valencia",
            "provincia": "Valencia",
            "pais": "España",
            "situacion_laboral": "empleado",
            "origen_fondos": "nomina",
            "proposito_cuenta": "gastos_diarios",
            "acepta_terminos": True,
            "acepta_privacidad": True
        }
        
        # First registration should succeed
        response1 = self.session.post(
            f"{BASE_URL}/api/manobank/registro/nuevo-cliente",
            json=registration_data
        )
        
        if response1.status_code in [200, 201]:
            # Second registration with same DNI should fail
            registration_data["email"] = f"dup2_{uuid.uuid4().hex[:8]}@test.com"
            registration_data["telefono_movil"] = f"6{uuid.uuid4().hex[:8][:8]}"[:9]
            
            response2 = self.session.post(
                f"{BASE_URL}/api/manobank/registro/nuevo-cliente",
                json=registration_data
            )
            
            assert response2.status_code == 400, f"Duplicate DNI should be rejected: {response2.text}"
            print("✓ Duplicate DNI correctly rejected")
        else:
            print(f"⚠ First registration failed, skipping duplicate test: {response1.text}")


class TestAdminRegistrationsEndpoint:
    """Test admin registrations management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login as director
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        assert login_response.status_code == 200, f"Director login failed: {login_response.text}"
    
    def test_get_registrations_list(self):
        """Test GET /api/manobank/admin/registrations returns list"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/registrations")
        
        assert response.status_code == 200, f"Failed to get registrations: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "registrations" in data, "Response should contain registrations list"
        assert "stats" in data, "Response should contain stats"
        
        stats = data["stats"]
        assert "total" in stats, "Stats should contain total count"
        assert "pending" in stats, "Stats should contain pending count"
        
        print(f"✓ Registrations list retrieved - Total: {stats['total']}, Pending: {stats['pending']}")
        return data
    
    def test_get_registrations_filter_by_status(self):
        """Test filtering registrations by status"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/registrations?status=pending")
        
        assert response.status_code == 200, f"Failed to filter registrations: {response.text}"
        data = response.json()
        
        # All returned registrations should be pending
        for reg in data.get("registrations", []):
            assert reg.get("status") == "pending", f"Expected pending status, got: {reg.get('status')}"
        
        print(f"✓ Registrations filtered by status - Found {len(data.get('registrations', []))} pending")


class TestApproveRegistration:
    """Test registration approval flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login as director
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        assert login_response.status_code == 200, f"Director login failed: {login_response.text}"
    
    def _create_test_registration(self):
        """Helper to create a test registration"""
        test_dni = f"APR{uuid.uuid4().hex[:5].upper()}"
        registration_data = {
            "tipo_documento": "DNI",
            "numero_documento": test_dni,
            "letra_documento": "Z",
            "nombre": "Aprobar",
            "primer_apellido": "Test",
            "segundo_apellido": "Usuario",
            "fecha_nacimiento": "1985-06-20",
            "sexo": "M",
            "nacionalidad": "Española",
            "email": f"approve_{uuid.uuid4().hex[:8]}@test.com",
            "telefono_movil": f"6{uuid.uuid4().hex[:8][:8]}"[:9],
            "direccion": "Avenida Aprobación",
            "numero": "42",
            "codigo_postal": "28001",
            "localidad": "Madrid",
            "provincia": "Madrid",
            "pais": "España",
            "situacion_laboral": "autonomo",
            "profesion": "Ingeniero",
            "origen_fondos": "actividad_profesional",
            "proposito_cuenta": "negocio",
            "acepta_terminos": True,
            "acepta_privacidad": True,
            "acepta_comunicaciones": True,
            "persona_politica": False,
            "titular_real": True
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/manobank/registro/nuevo-cliente",
            json=registration_data
        )
        
        if response.status_code in [200, 201]:
            return response.json().get("solicitud_id")
        return None
    
    def test_approve_registration_creates_account(self):
        """Test approving a registration creates account with IBAN"""
        # Create a test registration first
        solicitud_id = self._create_test_registration()
        
        if not solicitud_id:
            # Try to find an existing pending registration
            registrations = self.session.get(f"{BASE_URL}/api/manobank/admin/registrations?status=pending")
            if registrations.status_code == 200:
                pending = registrations.json().get("registrations", [])
                if pending:
                    solicitud_id = pending[0].get("solicitud_id")
        
        if not solicitud_id:
            pytest.skip("No pending registration available for approval test")
        
        # Approve the registration
        response = self.session.post(
            f"{BASE_URL}/api/manobank/admin/registrations/{solicitud_id}/approve",
            json={"kyc_notes": "Test approval - KYC verified by automated test"}
        )
        
        assert response.status_code == 200, f"Approval failed: {response.text}"
        data = response.json()
        
        # Verify IBAN was generated
        assert "iban" in data, f"Response should contain IBAN: {data}"
        iban = data["iban"]
        assert iban.startswith("ES"), f"IBAN should start with ES: {iban}"
        assert len(iban) == 24, f"Spanish IBAN should be 24 characters: {iban}"
        
        # Verify customer_id was created
        assert "customer_id" in data, f"Response should contain customer_id: {data}"
        
        print(f"✓ Registration approved - IBAN: {iban}, Customer ID: {data.get('customer_id')}")
    
    def test_approve_already_approved_fails(self):
        """Test that approving an already approved registration fails"""
        # Get approved registrations
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/registrations?status=approved")
        
        if response.status_code == 200:
            approved = response.json().get("registrations", [])
            if approved:
                solicitud_id = approved[0].get("solicitud_id")
                
                # Try to approve again
                approve_response = self.session.post(
                    f"{BASE_URL}/api/manobank/admin/registrations/{solicitud_id}/approve",
                    json={"kyc_notes": "Duplicate approval attempt"}
                )
                
                assert approve_response.status_code == 400, \
                    f"Re-approving should fail: {approve_response.text}"
                print("✓ Re-approval correctly rejected")
            else:
                print("⚠ No approved registrations to test re-approval")
        else:
            print(f"⚠ Could not get approved registrations: {response.text}")


class TestRejectRegistration:
    """Test registration rejection flow"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login as director
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        assert login_response.status_code == 200
    
    def test_reject_registration_endpoint_exists(self):
        """Test that reject endpoint exists"""
        # Test with non-existent ID to verify endpoint exists
        response = self.session.post(
            f"{BASE_URL}/api/manobank/admin/registrations/NONEXISTENT/reject",
            json={"reason": "Test rejection"}
        )
        
        # Should return 404 (not found) not 405 (method not allowed)
        assert response.status_code in [404, 400], \
            f"Reject endpoint should exist, got: {response.status_code}"
        print("✓ Reject endpoint exists")


class TestEmployeePortalAperturas:
    """Test employee portal Aperturas tab functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Login as director
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": DIRECTOR_EMAIL,
            "password": DIRECTOR_PASSWORD
        })
        assert login_response.status_code == 200
    
    def test_account_requests_endpoint(self):
        """Test GET /api/manobank/admin/account-requests for legacy requests"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/account-requests")
        
        assert response.status_code == 200, f"Failed to get account requests: {response.text}"
        data = response.json()
        
        assert "requests" in data, "Response should contain requests list"
        print(f"✓ Account requests retrieved - Count: {len(data.get('requests', []))}")
    
    def test_combined_registrations_and_requests(self):
        """Test that both old requests and new BBVA registrations are accessible"""
        # Get old-style account requests
        requests_response = self.session.get(f"{BASE_URL}/api/manobank/admin/account-requests")
        
        # Get new BBVA-style registrations
        registrations_response = self.session.get(f"{BASE_URL}/api/manobank/admin/registrations")
        
        assert requests_response.status_code == 200, "Account requests should be accessible"
        assert registrations_response.status_code == 200, "Registrations should be accessible"
        
        old_requests = requests_response.json().get("requests", [])
        new_registrations = registrations_response.json().get("registrations", [])
        
        print(f"✓ Combined data accessible - Old requests: {len(old_requests)}, New registrations: {len(new_registrations)}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
