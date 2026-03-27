"""
Iteration 135: Test real backend data integration for all 3 PWA apps + CRA Dashboard
Tests: Client App login, Comercial App login, Instalador App login, CRA Dashboard endpoints
All apps now use real MongoDB data instead of mock data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from main agent
CLIENT_EMAIL = "cliente@demo.manoprotectt.com"
CLIENT_PASSWORD = "Cliente2025!"
COMERCIAL_EMAIL = "comercial@manoprotectt.com"
COMERCIAL_PASSWORD = "Comercial2025!"
INSTALADOR_EMAIL = "instalador@manoprotectt.com"
INSTALADOR_PASSWORD = "Instalador2025!"


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health check passed")


class TestClientAppLogin:
    """Client App authentication and data loading"""
    
    def test_client_login_success(self):
        """Test client app login with demo credentials"""
        response = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        print(f"Client login response: {response.status_code} - {response.text[:200]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == CLIENT_EMAIL
        assert data["user"].get("installation_id"), "User should have installation_id"
        print(f"✓ Client login success - installation_id: {data['user']['installation_id']}")
        return data["token"], data["user"]["installation_id"]
    
    def test_client_login_wrong_password(self):
        """Test client login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Client login rejects wrong password")
    
    def test_client_installation_data(self):
        """Test fetching installation data after login"""
        # First login
        login_res = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        assert login_res.status_code == 200
        token = login_res.json()["token"]
        install_id = login_res.json()["user"]["installation_id"]
        
        # Fetch installation
        headers = {"Authorization": f"Bearer {token}"}
        inst_res = requests.get(f"{BASE_URL}/api/client-app/installation/{install_id}", headers=headers)
        print(f"Installation response: {inst_res.status_code} - {inst_res.text[:300]}")
        assert inst_res.status_code == 200
        
        data = inst_res.json()
        assert "devices" in data, "Installation should have devices"
        assert "armed_status" in data, "Installation should have armed_status"
        assert "address" in data, "Installation should have address"
        print(f"✓ Installation data loaded - {len(data.get('devices', []))} devices, status: {data.get('armed_status')}")
    
    def test_client_events(self):
        """Test fetching events for installation"""
        login_res = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        token = login_res.json()["token"]
        install_id = login_res.json()["user"]["installation_id"]
        
        headers = {"Authorization": f"Bearer {token}"}
        events_res = requests.get(f"{BASE_URL}/api/client-app/installation/{install_id}/events", headers=headers)
        print(f"Events response: {events_res.status_code}")
        assert events_res.status_code == 200
        
        data = events_res.json()
        assert "events" in data
        print(f"✓ Events loaded - {len(data.get('events', []))} events")


class TestClientAppArm:
    """Test arm/disarm functionality"""
    
    def test_arm_total(self):
        """Test arming system in total mode"""
        login_res = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        token = login_res.json()["token"]
        install_id = login_res.json()["user"]["installation_id"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Test via CRA endpoint (as used in frontend)
        arm_res = requests.post(
            f"{BASE_URL}/api/cra/installations/{install_id}/arm",
            headers=headers,
            json={"mode": "total", "code": "1234"}
        )
        print(f"Arm total response: {arm_res.status_code} - {arm_res.text[:200]}")
        assert arm_res.status_code == 200
        print("✓ Arm total successful")
    
    def test_disarm(self):
        """Test disarming system"""
        login_res = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        token = login_res.json()["token"]
        install_id = login_res.json()["user"]["installation_id"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        disarm_res = requests.post(
            f"{BASE_URL}/api/cra/installations/{install_id}/arm",
            headers=headers,
            json={"mode": "disarmed", "code": "1234"}
        )
        print(f"Disarm response: {disarm_res.status_code}")
        assert disarm_res.status_code == 200
        print("✓ Disarm successful")


class TestClientAppSOS:
    """Test SOS panic button"""
    
    def test_sos_trigger(self):
        """Test triggering SOS alert"""
        login_res = requests.post(
            f"{BASE_URL}/api/client-app/login",
            json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        token = login_res.json()["token"]
        install_id = login_res.json()["user"]["installation_id"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        sos_res = requests.post(
            f"{BASE_URL}/api/client-app/installation/{install_id}/sos",
            headers=headers,
            json={"sos_type": "panic"}
        )
        print(f"SOS response: {sos_res.status_code} - {sos_res.text[:200]}")
        assert sos_res.status_code == 200
        
        data = sos_res.json()
        assert data.get("status") == "ok"
        assert "event_id" in data
        print(f"✓ SOS triggered - event_id: {data.get('event_id')}")


class TestComercialAppLogin:
    """Comercial App authentication and stats"""
    
    def test_comercial_login_success(self):
        """Test comercial login"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        print(f"Comercial login response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["rol"] in ["comercial", "admin"]
        print(f"✓ Comercial login success - rol: {data['user']['rol']}")
        return data["token"]
    
    def test_comercial_login_wrong_password(self):
        """Test comercial login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Comercial login rejects wrong password")
    
    def test_comercial_stats(self):
        """Test fetching comercial stats after login"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        assert login_res.status_code == 200
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        stats_res = requests.get(f"{BASE_URL}/api/gestion/comercial/mis-stats", headers=headers)
        print(f"Comercial stats response: {stats_res.status_code} - {stats_res.text[:300]}")
        assert stats_res.status_code == 200
        
        data = stats_res.json()
        assert "total" in data, "Stats should have total"
        assert "cerrados" in data, "Stats should have cerrados"
        assert "pendientes" in data, "Stats should have pendientes"
        assert "comisiones" in data, "Stats should have comisiones"
        print(f"✓ Comercial stats loaded - total: {data.get('total')}, cerrados: {data.get('cerrados')}, comisiones: {data.get('comisiones')}")


class TestComercialCreateLead:
    """Test creating new leads"""
    
    def test_create_lead(self):
        """Test creating a new lead/pedido"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        assert login_res.status_code == 200
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        lead_data = {
            "cliente_nombre": "TEST_Lead Automatico",
            "cliente_telefono": "600123456",
            "cliente_email": "test_lead@example.com",
            "cliente_direccion": "Calle Test 123",
            "notas": "Lead creado por test automatizado",
            "productos": [{"producto_id": "kit-plus", "cantidad": 1}]
        }
        
        create_res = requests.post(f"{BASE_URL}/api/gestion/pedidos", headers=headers, json=lead_data)
        print(f"Create lead response: {create_res.status_code} - {create_res.text[:300]}")
        assert create_res.status_code in [200, 201]
        
        data = create_res.json()
        assert "pedido_id" in data or "id" in data
        print(f"✓ Lead created successfully")


class TestInstaladorAppLogin:
    """Instalador App authentication and agenda"""
    
    def test_instalador_login_success(self):
        """Test instalador login"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        print(f"Instalador login response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["rol"] in ["instalador", "admin"]
        print(f"✓ Instalador login success - rol: {data['user']['rol']}")
        return data["token"]
    
    def test_instalador_agenda(self):
        """Test fetching instalador agenda"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        assert login_res.status_code == 200
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        agenda_res = requests.get(f"{BASE_URL}/api/gestion/instalador/mi-agenda", headers=headers)
        print(f"Instalador agenda response: {agenda_res.status_code} - {agenda_res.text[:300]}")
        assert agenda_res.status_code == 200
        
        data = agenda_res.json()
        assert "instalaciones" in data, "Agenda should have instalaciones"
        print(f"✓ Instalador agenda loaded - {len(data.get('instalaciones', []))} instalaciones")


class TestInstaladorChecklist:
    """Test checklist functionality"""
    
    def test_get_checklist(self):
        """Test getting checklist for an installation"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # First get agenda to find an installation
        agenda_res = requests.get(f"{BASE_URL}/api/gestion/instalador/mi-agenda", headers=headers)
        if agenda_res.status_code == 200:
            instalaciones = agenda_res.json().get("instalaciones", [])
            if instalaciones:
                inst_id = instalaciones[0].get("instalacion_id")
                checklist_res = requests.get(f"{BASE_URL}/api/gestion/instalaciones/{inst_id}/checklist", headers=headers)
                print(f"Checklist GET response: {checklist_res.status_code}")
                assert checklist_res.status_code == 200
                print(f"✓ Checklist GET successful for {inst_id}")
            else:
                print("⚠ No instalaciones found to test checklist")
        else:
            print("⚠ Could not get agenda to test checklist")
    
    def test_update_checklist(self):
        """Test updating checklist items"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        agenda_res = requests.get(f"{BASE_URL}/api/gestion/instalador/mi-agenda", headers=headers)
        if agenda_res.status_code == 200:
            instalaciones = agenda_res.json().get("instalaciones", [])
            if instalaciones:
                inst_id = instalaciones[0].get("instalacion_id")
                update_data = {"items": {"verificar_direccion": True, "contacto_cliente": True}}
                update_res = requests.put(
                    f"{BASE_URL}/api/gestion/instalaciones/{inst_id}/checklist",
                    headers=headers,
                    json=update_data
                )
                print(f"Checklist PUT response: {update_res.status_code}")
                assert update_res.status_code == 200
                print(f"✓ Checklist PUT successful")
            else:
                print("⚠ No instalaciones found to test checklist update")


class TestInstaladorEstado:
    """Test installation estado update"""
    
    def test_update_estado(self):
        """Test updating installation estado"""
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        token = login_res.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        agenda_res = requests.get(f"{BASE_URL}/api/gestion/instalador/mi-agenda", headers=headers)
        if agenda_res.status_code == 200:
            instalaciones = agenda_res.json().get("instalaciones", [])
            if instalaciones:
                inst_id = instalaciones[0].get("instalacion_id")
                # Update to en_progreso
                update_res = requests.put(
                    f"{BASE_URL}/api/gestion/instalaciones/{inst_id}/estado",
                    headers=headers,
                    json={"estado": "en_progreso"}
                )
                print(f"Estado update response: {update_res.status_code} - {update_res.text[:200]}")
                assert update_res.status_code == 200
                print(f"✓ Estado update successful")
            else:
                print("⚠ No instalaciones found to test estado update")


class TestCRADashboard:
    """CRA Dashboard endpoints"""
    
    def test_cra_dashboard(self):
        """Test CRA dashboard stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/cra/dashboard")
        print(f"CRA dashboard response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_installations" in data or "pending_alarms" in data
        print(f"✓ CRA dashboard loaded")
    
    def test_cra_alarms(self):
        """Test CRA alarms endpoint"""
        response = requests.get(f"{BASE_URL}/api/cra/alarms?limit=50")
        print(f"CRA alarms response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200
        
        data = response.json()
        assert "alarms" in data
        print(f"✓ CRA alarms loaded - {len(data.get('alarms', []))} alarms")
    
    def test_cra_installations(self):
        """Test CRA installations endpoint"""
        response = requests.get(f"{BASE_URL}/api/cra/installations")
        print(f"CRA installations response: {response.status_code} - {response.text[:300]}")
        assert response.status_code == 200
        
        data = response.json()
        assert "installations" in data
        print(f"✓ CRA installations loaded - {len(data.get('installations', []))} installations")
    
    def test_cra_protocols(self):
        """Test CRA protocols endpoint"""
        response = requests.get(f"{BASE_URL}/api/cra/protocols")
        print(f"CRA protocols response: {response.status_code}")
        assert response.status_code == 200
        print("✓ CRA protocols loaded")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
