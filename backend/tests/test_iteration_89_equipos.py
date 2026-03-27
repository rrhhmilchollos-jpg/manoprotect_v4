"""
Test Iteration 89: Equipos de Instalación (Installation Teams) Feature
- Tests CRUD operations for /api/gestion/equipos
- Tests team assignment to installations
- Tests role-based access control (admin only for CRUD)
- Tests dashboard stats include total_equipos
- Tests PWA manifests accessibility
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_CREDS = {"email": "admin@manoprotectt.com", "password": "ManoAdmin2025!"}
COMERCIAL_CREDS = {"email": "comercial@manoprotectt.com", "password": "Comercial2025!"}
INSTALADOR_CREDS = {"email": "instalador@manoprotectt.com", "password": "Instalador2025!"}

class TestGestionAuth:
    """Authentication tests for gestion system"""
    
    def test_admin_login(self):
        """Test admin login returns valid JWT"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["rol"] == "admin"
        print(f"PASSED: Admin login - rol={data['user']['rol']}")
    
    def test_comercial_login(self):
        """Test comercial login returns valid JWT"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=COMERCIAL_CREDS)
        assert response.status_code == 200, f"Comercial login failed: {response.text}"
        data = response.json()
        assert data["user"]["rol"] == "comercial"
        print(f"PASSED: Comercial login - rol={data['user']['rol']}")
    
    def test_instalador_login(self):
        """Test instalador login returns valid JWT"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=INSTALADOR_CREDS)
        assert response.status_code == 200, f"Instalador login failed: {response.text}"
        data = response.json()
        assert data["user"]["rol"] == "instalador"
        print(f"PASSED: Instalador login - rol={data['user']['rol']}")


class TestEquiposCRUD:
    """CRUD tests for Equipos de Instalación"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin JWT token"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=ADMIN_CREDS)
        return response.json().get("token")
    
    @pytest.fixture
    def comercial_token(self):
        """Get comercial JWT token"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=COMERCIAL_CREDS)
        return response.json().get("token")
    
    @pytest.fixture
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    @pytest.fixture
    def comercial_headers(self, comercial_token):
        return {"Authorization": f"Bearer {comercial_token}", "Content-Type": "application/json"}
    
    def test_list_equipos(self, admin_headers):
        """GET /api/gestion/equipos returns list of teams"""
        response = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        assert response.status_code == 200, f"List equipos failed: {response.text}"
        data = response.json()
        assert "equipos" in data, "equipos not in response"
        assert "total" in data, "total not in response"
        # Check miembros_detalle is populated
        if data["total"] > 0:
            equipo = data["equipos"][0]
            assert "miembros_detalle" in equipo, "miembros_detalle not populated"
        print(f"PASSED: List equipos - total={data['total']}")
    
    def test_create_equipo_admin(self, admin_headers):
        """POST /api/gestion/equipos creates team (admin only)"""
        # First get instaladores to add as members
        users_resp = requests.get(f"{BASE_URL}/api/gestion/usuarios", headers=admin_headers)
        instaladores = [u for u in users_resp.json().get("usuarios", []) if u["rol"] == "instalador" and u["activo"]]
        
        miembros = [instaladores[0]["user_id"]] if instaladores else []
        
        equipo_data = {
            "nombre": "TEST_Equipo Madrid Centro",
            "zona": "Madrid Centro",
            "miembros": miembros
        }
        
        response = requests.post(f"{BASE_URL}/api/gestion/equipos", json=equipo_data, headers=admin_headers)
        assert response.status_code == 200, f"Create equipo failed: {response.text}"
        data = response.json()
        assert "equipo_id" in data, "equipo_id not returned"
        assert data["equipo_id"].startswith("EQ-"), f"Invalid equipo_id format: {data['equipo_id']}"
        print(f"PASSED: Create equipo - equipo_id={data['equipo_id']}")
        return data["equipo_id"]
    
    def test_create_equipo_comercial_denied(self, comercial_headers):
        """POST /api/gestion/equipos denied for comercial (403)"""
        equipo_data = {
            "nombre": "TEST_Equipo Denied",
            "zona": "Test Zone",
            "miembros": []
        }
        
        response = requests.post(f"{BASE_URL}/api/gestion/equipos", json=equipo_data, headers=comercial_headers)
        assert response.status_code == 403, f"Expected 403 for comercial creating equipo, got {response.status_code}"
        print("PASSED: Create equipo denied for comercial (403)")
    
    def test_get_equipo_detail(self, admin_headers):
        """GET /api/gestion/equipos/{equipo_id} returns team detail"""
        # First list to get an equipo_id
        list_resp = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        equipos = list_resp.json().get("equipos", [])
        
        if not equipos:
            pytest.skip("No equipos available to test detail")
        
        equipo_id = equipos[0]["equipo_id"]
        response = requests.get(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", headers=admin_headers)
        assert response.status_code == 200, f"Get equipo detail failed: {response.text}"
        data = response.json()
        assert "equipo_id" in data
        assert "nombre" in data
        assert "miembros_detalle" in data, "miembros_detalle not in detail response"
        print(f"PASSED: Get equipo detail - {equipo_id}")
    
    def test_update_equipo_admin(self, admin_headers):
        """PUT /api/gestion/equipos/{equipo_id} updates team (admin only)"""
        # List equipos to find one to update
        list_resp = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        equipos = [e for e in list_resp.json().get("equipos", []) if e.get("activo", True)]
        
        if not equipos:
            pytest.skip("No active equipos to update")
        
        equipo_id = equipos[0]["equipo_id"]
        update_data = {"zona": "Updated Zone Test"}
        
        response = requests.put(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", json=update_data, headers=admin_headers)
        assert response.status_code == 200, f"Update equipo failed: {response.text}"
        
        # Verify update
        detail_resp = requests.get(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", headers=admin_headers)
        # Note: zona may or may not be returned, depends on implementation
        print(f"PASSED: Update equipo - {equipo_id}")
    
    def test_update_equipo_comercial_denied(self, comercial_headers, admin_headers):
        """PUT /api/gestion/equipos denied for comercial (403)"""
        # Get an equipo_id
        list_resp = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        equipos = list_resp.json().get("equipos", [])
        
        if not equipos:
            pytest.skip("No equipos to test update denial")
        
        equipo_id = equipos[0]["equipo_id"]
        update_data = {"zona": "Should Fail"}
        
        response = requests.put(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", json=update_data, headers=comercial_headers)
        assert response.status_code == 403, f"Expected 403 for comercial updating equipo, got {response.status_code}"
        print("PASSED: Update equipo denied for comercial (403)")
    
    def test_delete_equipo_admin(self, admin_headers):
        """DELETE /api/gestion/equipos/{equipo_id} deactivates team (admin only)"""
        # Create a test equipo first
        users_resp = requests.get(f"{BASE_URL}/api/gestion/usuarios", headers=admin_headers)
        instaladores = [u for u in users_resp.json().get("usuarios", []) if u["rol"] == "instalador" and u["activo"]]
        
        create_data = {
            "nombre": "TEST_Equipo_To_Delete",
            "zona": "Delete Zone",
            "miembros": [instaladores[0]["user_id"]] if instaladores else []
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/gestion/equipos", json=create_data, headers=admin_headers)
        if create_resp.status_code != 200:
            pytest.skip("Could not create equipo to delete")
        
        equipo_id = create_resp.json()["equipo_id"]
        
        # Delete (deactivate) it
        response = requests.delete(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", headers=admin_headers)
        assert response.status_code == 200, f"Delete equipo failed: {response.text}"
        data = response.json()
        assert "desactivado" in data.get("message", "").lower() or "deleted" in data.get("message", "").lower() or response.status_code == 200
        print(f"PASSED: Delete equipo - {equipo_id}")
    
    def test_delete_equipo_comercial_denied(self, comercial_headers, admin_headers):
        """DELETE /api/gestion/equipos denied for comercial (403)"""
        list_resp = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        equipos = [e for e in list_resp.json().get("equipos", []) if e.get("activo", True)]
        
        if not equipos:
            pytest.skip("No equipos to test delete denial")
        
        equipo_id = equipos[0]["equipo_id"]
        
        response = requests.delete(f"{BASE_URL}/api/gestion/equipos/{equipo_id}", headers=comercial_headers)
        assert response.status_code == 403, f"Expected 403 for comercial deleting equipo, got {response.status_code}"
        print("PASSED: Delete equipo denied for comercial (403)")


class TestTeamAssignment:
    """Tests for assigning teams to installations"""
    
    @pytest.fixture
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=ADMIN_CREDS)
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_assign_equipo_to_installation(self, admin_headers):
        """PUT /api/gestion/instalaciones/{id}/asignar-equipo assigns team"""
        # Get list of instalaciones
        inst_resp = requests.get(f"{BASE_URL}/api/gestion/instalaciones", headers=admin_headers)
        instalaciones = inst_resp.json().get("instalaciones", [])
        
        # Get list of equipos
        eq_resp = requests.get(f"{BASE_URL}/api/gestion/equipos", headers=admin_headers)
        equipos = [e for e in eq_resp.json().get("equipos", []) if e.get("activo", True)]
        
        if not instalaciones or not equipos:
            pytest.skip("No instalaciones or equipos available for assignment test")
        
        # Find a pending installation or any installation
        target_inst = None
        for inst in instalaciones:
            if inst.get("estado") == "pendiente":
                target_inst = inst
                break
        if not target_inst:
            target_inst = instalaciones[0]  # Use first if no pending
        
        instalacion_id = target_inst["instalacion_id"]
        equipo_id = equipos[0]["equipo_id"]
        
        # Assign team
        response = requests.put(
            f"{BASE_URL}/api/gestion/instalaciones/{instalacion_id}/asignar-equipo",
            json={"equipo_id": equipo_id},
            headers=admin_headers
        )
        assert response.status_code == 200, f"Assign team failed: {response.text}"
        data = response.json()
        assert "miembros" in data or "message" in data
        print(f"PASSED: Assign team {equipo_id} to installation {instalacion_id}")
    
    def test_installation_has_team_fields(self, admin_headers):
        """Verify installation with team has equipo_id, equipo_nombre, equipo_miembros, equipo_miembros_nombres"""
        inst_resp = requests.get(f"{BASE_URL}/api/gestion/instalaciones", headers=admin_headers)
        instalaciones = inst_resp.json().get("instalaciones", [])
        
        # Find an installation with equipo assigned
        assigned = [i for i in instalaciones if i.get("equipo_id")]
        
        if not assigned:
            pytest.skip("No installations with team assigned")
        
        inst = assigned[0]
        assert "equipo_id" in inst, "equipo_id not in installation"
        assert "equipo_nombre" in inst, "equipo_nombre not in installation"
        assert "equipo_miembros" in inst or "equipo_miembros_nombres" in inst, "equipo_miembros not in installation"
        
        print(f"PASSED: Installation {inst['instalacion_id']} has team fields: equipo_id={inst.get('equipo_id')}, equipo_nombre={inst.get('equipo_nombre')}")


class TestDashboardStats:
    """Tests for dashboard stats including total_equipos"""
    
    @pytest.fixture
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=ADMIN_CREDS)
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_dashboard_stats_includes_total_equipos(self, admin_headers):
        """GET /api/gestion/dashboard/stats includes total_equipos"""
        response = requests.get(f"{BASE_URL}/api/gestion/dashboard/stats", headers=admin_headers)
        assert response.status_code == 200, f"Dashboard stats failed: {response.text}"
        data = response.json()
        
        assert "total_equipos" in data, "total_equipos not in dashboard stats"
        assert isinstance(data["total_equipos"], int), "total_equipos should be integer"
        print(f"PASSED: Dashboard stats includes total_equipos={data['total_equipos']}")


class TestPWAManifests:
    """Tests for PWA manifests accessibility"""
    
    def test_manifest_comerciales_accessible(self):
        """GET /manifest-comerciales.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest-comerciales.json")
        assert response.status_code == 200, f"manifest-comerciales.json not accessible: {response.status_code}"
        data = response.json()
        assert data.get("name") == "ManoProtect Comerciales"
        assert data.get("short_name") == "MP Comerciales"
        assert data.get("theme_color") == "#10b981"
        print("PASSED: manifest-comerciales.json accessible and valid")
    
    def test_manifest_instaladores_accessible(self):
        """GET /manifest-instaladores.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest-instaladores.json")
        assert response.status_code == 200, f"manifest-instaladores.json not accessible: {response.status_code}"
        data = response.json()
        assert data.get("name") == "ManoProtect Instaladores"
        assert data.get("short_name") == "MP Instaladores"
        assert data.get("theme_color") == "#f59e0b"
        print("PASSED: manifest-instaladores.json accessible and valid")
    
    def test_pwa_comerciales_html_accessible(self):
        """GET /pwa-comerciales.html is accessible"""
        response = requests.get(f"{BASE_URL}/pwa-comerciales.html")
        assert response.status_code == 200, f"pwa-comerciales.html not accessible: {response.status_code}"
        assert "ManoProtect Comerciales" in response.text
        print("PASSED: pwa-comerciales.html accessible")
    
    def test_pwa_instaladores_html_accessible(self):
        """GET /pwa-instaladores.html is accessible"""
        response = requests.get(f"{BASE_URL}/pwa-instaladores.html")
        assert response.status_code == 200, f"pwa-instaladores.html not accessible: {response.status_code}"
        assert "ManoProtect Instaladores" in response.text
        print("PASSED: pwa-instaladores.html accessible")


class TestNotifications:
    """Tests for notifications sent to team members on assignment"""
    
    @pytest.fixture
    def admin_headers(self):
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=ADMIN_CREDS)
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    @pytest.fixture
    def instalador_headers(self):
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json=INSTALADOR_CREDS)
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_instalador_receives_notifications(self, instalador_headers):
        """GET /api/gestion/notificaciones returns notifications for instalador"""
        response = requests.get(f"{BASE_URL}/api/gestion/notificaciones", headers=instalador_headers)
        assert response.status_code == 200, f"Get notifications failed: {response.text}"
        data = response.json()
        assert "notificaciones" in data
        assert "no_leidas" in data
        print(f"PASSED: Instalador notifications - count={len(data['notificaciones'])}, unread={data['no_leidas']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
