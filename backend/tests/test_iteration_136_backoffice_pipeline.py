"""
Iteration 136: Back Office Admin Panel & Pipeline CRM Tests
Tests for:
- Back Office login with admin credentials
- User management (create, list, deactivate, reset password)
- Pipeline CRM (create lead, list, advance stages, estudio, propuesta, activate client)
- Audit trail
- ZIP Downloads
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auth-hardened-test.preview.emergentagent.com').rstrip('/')

# Admin credentials from test request
ADMIN_EMAIL = "admin@manoprotectt.com"
ADMIN_PASSWORD = "ManoAdmin2025!"


class TestBackOfficeAuth:
    """Back Office authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login returns token with rol 'admin'"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["rol"] in ("admin", "superadmin"), f"Expected admin role, got {data['user']['rol']}"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"PASSED: Admin login successful, rol={data['user']['rol']}")
    
    def test_admin_login_wrong_password(self):
        """Test login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASSED: Wrong password returns 401")
    
    def test_admin_login_nonexistent_user(self):
        """Test login with nonexistent user returns 401"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "anypassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASSED: Nonexistent user returns 401")


class TestBackOfficeUserManagement:
    """Back Office user management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping user management tests")
        self.token = response.json()["token"]
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
    
    def test_create_user_comercial(self):
        """Test creating a new comercial user returns password_temporal"""
        unique_email = f"test_comercial_{int(time.time())}@test.com"
        response = requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Test Comercial",
                "email": unique_email,
                "rol": "comercial",
                "telefono": "612345678",
                "zona": "Madrid"
            }
        )
        assert response.status_code == 200, f"Create user failed: {response.text}"
        data = response.json()
        assert "password_temporal" in data, "No password_temporal in response"
        assert "user_id" in data, "No user_id in response"
        assert data["rol"] == "comercial"
        print(f"PASSED: Created comercial user, temp password: {data['password_temporal'][:3]}***")
        return data["user_id"]
    
    def test_create_user_instalador(self):
        """Test creating a new instalador user"""
        unique_email = f"test_instalador_{int(time.time())}@test.com"
        response = requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Test Instalador",
                "email": unique_email,
                "rol": "instalador",
                "telefono": "623456789",
                "zona": "Barcelona"
            }
        )
        assert response.status_code == 200, f"Create user failed: {response.text}"
        data = response.json()
        assert "password_temporal" in data
        assert data["rol"] == "instalador"
        print(f"PASSED: Created instalador user")
    
    def test_create_user_invalid_rol(self):
        """Test creating user with invalid rol returns 400"""
        response = requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Test Invalid",
                "email": f"test_invalid_{int(time.time())}@test.com",
                "rol": "invalid_role"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Invalid rol returns 400")
    
    def test_list_usuarios(self):
        """Test listing users returns usuarios array with stats"""
        response = requests.get(f"{BASE_URL}/api/backoffice/usuarios", headers=self.headers)
        assert response.status_code == 200, f"List users failed: {response.text}"
        data = response.json()
        assert "usuarios" in data, "No usuarios in response"
        assert "stats" in data, "No stats in response"
        assert isinstance(data["usuarios"], list)
        assert "total" in data["stats"]
        assert "comerciales" in data["stats"]
        assert "instaladores" in data["stats"]
        print(f"PASSED: Listed {data['stats']['total']} users ({data['stats']['comerciales']} comerciales, {data['stats']['instaladores']} instaladores)")
    
    def test_deactivate_user(self):
        """Test deactivating a user"""
        # First create a user to deactivate
        unique_email = f"test_deactivate_{int(time.time())}@test.com"
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Test Deactivate",
                "email": unique_email,
                "rol": "comercial"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create user to deactivate")
        user_id = create_resp.json()["user_id"]
        
        # Deactivate the user
        response = requests.put(f"{BASE_URL}/api/backoffice/usuarios/{user_id}/desactivar", 
            headers=self.headers
        )
        assert response.status_code == 200, f"Deactivate failed: {response.text}"
        print(f"PASSED: Deactivated user {user_id}")
    
    def test_reset_password(self):
        """Test resetting user password returns new temp password"""
        # First create a user
        unique_email = f"test_reset_{int(time.time())}@test.com"
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Test Reset",
                "email": unique_email,
                "rol": "comercial"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create user for password reset")
        user_id = create_resp.json()["user_id"]
        
        # Reset password
        response = requests.put(f"{BASE_URL}/api/backoffice/usuarios/{user_id}/resetear-password", 
            headers=self.headers
        )
        assert response.status_code == 200, f"Reset password failed: {response.text}"
        data = response.json()
        assert "password_temporal" in data, "No password_temporal in response"
        print(f"PASSED: Reset password, new temp: {data['password_temporal'][:3]}***")


class TestPipelineCRM:
    """Pipeline CRM tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping pipeline tests")
        self.token = response.json()["token"]
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
    
    def test_create_lead(self):
        """Test creating a new lead in pipeline"""
        response = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Test Lead {int(time.time())}",
                "telefono": "612345678",
                "email": f"lead_{int(time.time())}@test.com",
                "direccion": "Calle Test 123, Madrid",
                "tipo_inmueble": "piso",
                "canal": "web",
                "notas": "Test lead from automated tests"
            }
        )
        assert response.status_code == 200, f"Create lead failed: {response.text}"
        data = response.json()
        assert "lead_id" in data, "No lead_id in response"
        assert data["etapa"] == "lead"
        print(f"PASSED: Created lead {data['lead_id']}")
        return data["lead_id"]
    
    def test_create_lead_minimal(self):
        """Test creating lead with only required fields (nombre, telefono)"""
        response = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Minimal Lead {int(time.time())}",
                "telefono": "623456789"
            }
        )
        assert response.status_code == 200, f"Create minimal lead failed: {response.text}"
        print("PASSED: Created lead with minimal fields")
    
    def test_create_lead_missing_required(self):
        """Test creating lead without required fields returns 400"""
        response = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": "Test Lead"
                # Missing telefono
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Missing required field returns 400")
    
    def test_list_pipeline(self):
        """Test listing pipeline returns leads array with stage_counts"""
        response = requests.get(f"{BASE_URL}/api/backoffice/pipeline", headers=self.headers)
        assert response.status_code == 200, f"List pipeline failed: {response.text}"
        data = response.json()
        assert "leads" in data, "No leads in response"
        assert "stage_counts" in data, "No stage_counts in response"
        assert "stages" in data, "No stages in response"
        assert isinstance(data["leads"], list)
        print(f"PASSED: Listed {data['total']} leads, stage_counts: {data['stage_counts']}")
    
    def test_advance_lead_stage(self):
        """Test advancing lead to next stage"""
        # Create a lead first
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Advance Test {int(time.time())}",
                "telefono": "634567890"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead for advance test")
        lead_id = create_resp.json()["lead_id"]
        
        # Advance to contacto
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/avanzar", 
            headers=self.headers,
            json={"etapa": "contacto", "notas": "Contacted via phone"}
        )
        assert response.status_code == 200, f"Advance failed: {response.text}"
        data = response.json()
        assert data["etapa"] == "contacto"
        print(f"PASSED: Advanced lead to contacto")
    
    def test_advance_lead_invalid_stage(self):
        """Test advancing lead to invalid stage returns 400"""
        # Create a lead first
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Invalid Stage Test {int(time.time())}",
                "telefono": "645678901"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead")
        lead_id = create_resp.json()["lead_id"]
        
        # Try invalid stage
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/avanzar", 
            headers=self.headers,
            json={"etapa": "invalid_stage"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Invalid stage returns 400")
    
    def test_save_estudio(self):
        """Test saving estudio de seguridad"""
        # Create a lead first
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Estudio Test {int(time.time())}",
                "telefono": "656789012"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead")
        lead_id = create_resp.json()["lead_id"]
        
        # Save estudio
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/estudio", 
            headers=self.headers,
            json={
                "tipo_inmueble": "piso",
                "metros": 80,
                "accesos": 2,
                "ventanas": 6,
                "garaje": False,
                "jardin": False,
                "mascotas": True,
                "puntos_vulnerables": "Ventana trasera sin rejas",
                "equipamiento": ["panel", "2 camaras", "4 sensores PIR"],
                "notas": "Piso en 3a planta"
            }
        )
        assert response.status_code == 200, f"Save estudio failed: {response.text}"
        print("PASSED: Saved estudio de seguridad")
    
    def test_save_propuesta(self):
        """Test saving propuesta personalizada"""
        # Create a lead first
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Propuesta Test {int(time.time())}",
                "telefono": "667890123"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead")
        lead_id = create_resp.json()["lead_id"]
        
        # Save propuesta
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/propuesta", 
            headers=self.headers,
            json={
                "equipos": ["Panel Central", "2 Camaras HD", "4 Sensores PIR", "Sirena"],
                "cuota_mensual": 44.90,
                "coste_instalacion": 0,
                "duracion_meses": 24,
                "descuento": 10,
                "total_primer_pago": 44.90,
                "notas": "Promocion primeros 200 clientes"
            }
        )
        assert response.status_code == 200, f"Save propuesta failed: {response.text}"
        print("PASSED: Saved propuesta")
    
    def test_activate_client_wrong_stage(self):
        """Test activating client in wrong stage returns 400"""
        # Create a lead (in 'lead' stage)
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Wrong Stage Activate {int(time.time())}",
                "telefono": "678901234",
                "email": f"wrongstage_{int(time.time())}@test.com"
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead")
        lead_id = create_resp.json()["lead_id"]
        
        # Try to activate (should fail - not in instalacion/activacion stage)
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/activar-cliente", 
            headers=self.headers,
            json={}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Activate client in wrong stage returns 400")
    
    def test_activate_client_full_flow(self):
        """Test full flow: create lead -> advance to instalacion -> activate client"""
        # Create a lead with email
        unique_email = f"activate_test_{int(time.time())}@test.com"
        create_resp = requests.post(f"{BASE_URL}/api/backoffice/pipeline", 
            headers=self.headers,
            json={
                "nombre": f"Full Flow Test {int(time.time())}",
                "telefono": "689012345",
                "email": unique_email
            }
        )
        if create_resp.status_code != 200:
            pytest.skip("Could not create lead")
        lead_id = create_resp.json()["lead_id"]
        
        # Advance through stages to instalacion
        for stage in ["contacto", "estudio", "propuesta", "contrato", "instalacion"]:
            adv_resp = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/avanzar", 
                headers=self.headers,
                json={"etapa": stage}
            )
            assert adv_resp.status_code == 200, f"Failed to advance to {stage}: {adv_resp.text}"
        
        # Now activate client
        response = requests.put(f"{BASE_URL}/api/backoffice/pipeline/{lead_id}/activar-cliente", 
            headers=self.headers,
            json={}
        )
        assert response.status_code == 200, f"Activate client failed: {response.text}"
        data = response.json()
        assert "email" in data, "No email in response"
        assert "password_temporal" in data, "No password_temporal in response"
        assert data["email"] == unique_email.lower()
        print(f"PASSED: Full flow - client activated with email {data['email']}")


class TestAuditTrail:
    """Audit trail tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping audit tests")
        self.token = response.json()["token"]
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
    
    def test_get_auditoria(self):
        """Test getting audit trail"""
        response = requests.get(f"{BASE_URL}/api/backoffice/auditoria", headers=self.headers)
        assert response.status_code == 200, f"Get auditoria failed: {response.text}"
        data = response.json()
        assert "logs" in data, "No logs in response"
        assert isinstance(data["logs"], list)
        print(f"PASSED: Got {data['total']} audit logs")
    
    def test_audit_logs_after_action(self):
        """Test that actions create audit logs"""
        # Get current audit count
        before_resp = requests.get(f"{BASE_URL}/api/backoffice/auditoria?limit=1", headers=self.headers)
        
        # Create a user (should create audit log)
        unique_email = f"audit_test_{int(time.time())}@test.com"
        requests.post(f"{BASE_URL}/api/backoffice/usuarios", 
            headers=self.headers,
            json={
                "nombre": "Audit Test User",
                "email": unique_email,
                "rol": "comercial"
            }
        )
        
        # Check audit logs
        after_resp = requests.get(f"{BASE_URL}/api/backoffice/auditoria?limit=5", headers=self.headers)
        assert after_resp.status_code == 200
        logs = after_resp.json()["logs"]
        
        # Find the alta_usuario log
        found = any(log.get("accion") == "alta_usuario" and unique_email in log.get("detalles", "") for log in logs)
        assert found, "No audit log found for user creation"
        print("PASSED: User creation logged in audit trail")


class TestZIPDownloads:
    """ZIP download tests"""
    
    def test_download_zip_endpoint(self):
        """Test ZIP download endpoint returns 200 with correct content type"""
        # First check if the file exists
        response = requests.get(f"{BASE_URL}/api/descargas/ManoProtect-Desktop-Apps-COMPLETO.zip", stream=True)
        
        if response.status_code == 404:
            pytest.skip("ZIP file not found - may not be deployed yet")
        
        assert response.status_code == 200, f"Download failed: {response.status_code}"
        assert "application/zip" in response.headers.get("Content-Type", ""), f"Wrong content type: {response.headers.get('Content-Type')}"
        print("PASSED: ZIP download returns 200 with application/zip content type")
    
    def test_download_nonexistent_zip(self):
        """Test downloading nonexistent ZIP returns 404"""
        response = requests.get(f"{BASE_URL}/api/descargas/nonexistent.zip")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASSED: Nonexistent ZIP returns 404")


class TestBackOfficeAuthorization:
    """Test authorization - non-admin users should not access backoffice"""
    
    def test_comercial_cannot_access_backoffice_usuarios(self):
        """Test that comercial user cannot access backoffice usuarios"""
        # Login as comercial
        login_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "comercial@manoprotectt.com",
            "password": "Comercial2025!"
        })
        if login_resp.status_code != 200:
            pytest.skip("Comercial login failed")
        
        token = login_resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to access backoffice usuarios
        response = requests.get(f"{BASE_URL}/api/backoffice/usuarios", headers=headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASSED: Comercial cannot access backoffice usuarios (403)")
    
    def test_no_token_returns_401(self):
        """Test that requests without token return 401"""
        response = requests.get(f"{BASE_URL}/api/backoffice/usuarios")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASSED: No token returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
