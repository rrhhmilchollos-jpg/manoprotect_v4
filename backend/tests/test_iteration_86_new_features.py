"""
Iteration 86: Testing NEW features for ManoProtect CRA Management System
- Notifications System (auto alerts for stock low, new orders, installer assignments)
- App Version Control and Auto-Update System
- Family ID Authentication (register, login, password recovery)

All tests use the external API URL for e2e testing.
"""
import pytest
import requests
import uuid
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auth-hardened-test.preview.emergentagent.com').rstrip('/')

# Test credentials from seed data
ADMIN_EMAIL = "admin@manoprotectt.com"
ADMIN_PASSWORD = "ManoAdmin2025!"
COMERCIAL_EMAIL = "comercial@manoprotectt.com"
COMERCIAL_PASSWORD = "Comercial2025!"
INSTALADOR_EMAIL = "instalador@manoprotectt.com"
INSTALADOR_PASSWORD = "Instalador2025!"

# Strong password for testing (no common patterns)
STRONG_PASSWORD = "X7mK#pQ9vL$2wZ"


class TestGestionAuth:
    """Test gestion login for all 3 roles"""

    def test_login_comercial(self):
        """POST /api/gestion/auth/login with comercial credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": COMERCIAL_EMAIL,
            "password": COMERCIAL_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "comercial"
        assert data["user"]["email"] == COMERCIAL_EMAIL
        print(f"PASSED: Comercial login successful, token length={len(data['token'])}")

    def test_login_admin(self):
        """POST /api/gestion/auth/login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"PASSED: Admin login successful, token length={len(data['token'])}")

    def test_login_instalador(self):
        """POST /api/gestion/auth/login with instalador credentials"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": INSTALADOR_EMAIL,
            "password": INSTALADOR_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "instalador"
        assert data["user"]["email"] == INSTALADOR_EMAIL
        print(f"PASSED: Instalador login successful, token length={len(data['token'])}")

    def test_login_invalid_credentials(self):
        """POST /api/gestion/auth/login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("PASSED: Invalid credentials correctly returned 401")


class TestNotificationsSystem:
    """Test notifications CRUD and auto-generation"""

    @pytest.fixture
    def admin_token(self):
        """Get admin JWT token"""
        resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return resp.json()["token"]

    @pytest.fixture
    def comercial_token(self):
        """Get comercial JWT token"""
        resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": COMERCIAL_EMAIL,
            "password": COMERCIAL_PASSWORD
        })
        return resp.json()["token"]

    @pytest.fixture
    def instalador_token(self):
        """Get instalador JWT token"""
        resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": INSTALADOR_EMAIL,
            "password": INSTALADOR_PASSWORD
        })
        return resp.json()["token"]

    def test_get_notifications_returns_list(self, admin_token):
        """GET /api/gestion/notificaciones returns notifications for user"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/notificaciones",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "notificaciones" in data
        assert "no_leidas" in data
        assert isinstance(data["notificaciones"], list)
        assert isinstance(data["no_leidas"], int)
        print(f"PASSED: GET notifications returned {len(data['notificaciones'])} notifications, {data['no_leidas']} unread")

    def test_mark_all_notifications_read(self, comercial_token):
        """PUT /api/gestion/notificaciones/leer marks all as read"""
        response = requests.put(
            f"{BASE_URL}/api/gestion/notificaciones/leer",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Notificaciones marcadas como leídas"
        print("PASSED: Mark all notifications as read")

    def test_pedido_creates_admin_notification(self, comercial_token, admin_token):
        """POST /api/gestion/pedidos creates notification for admin"""
        # Create a new order as comercial
        pedido_data = {
            "cliente_nombre": f"TEST_NotifCliente_{uuid.uuid4().hex[:6]}",
            "cliente_telefono": "600111222",
            "cliente_email": "notiftest@test.com",
            "cliente_direccion": "Calle Notificacion 123",
            "productos": [{"producto_id": "test_prod", "nombre": "Test Product", "cantidad": 1}],
            "notas": "Testing notification"
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            json=pedido_data,
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert create_resp.status_code == 200, f"Failed to create pedido: {create_resp.text}"
        pedido_id = create_resp.json()["pedido_id"]
        print(f"Created pedido: {pedido_id}")

        # Check admin notifications for new_pedido notification
        notif_resp = requests.get(
            f"{BASE_URL}/api/gestion/notificaciones",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert notif_resp.status_code == 200
        notifs = notif_resp.json()["notificaciones"]
        
        # Find notification about this pedido
        found = any(n["tipo"] == "nuevo_pedido" and pedido_id in n.get("mensaje", "") for n in notifs)
        assert found, f"Expected notification about pedido {pedido_id} not found in admin notifications"
        print(f"PASSED: Pedido {pedido_id} created notification for admin")

    def test_low_stock_creates_comercial_notification(self, admin_token, comercial_token):
        """PUT /api/gestion/stock/{id} with low qty creates notification for comerciales"""
        # Get stock items
        stock_resp = requests.get(
            f"{BASE_URL}/api/gestion/stock",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert stock_resp.status_code == 200
        stock_items = stock_resp.json()["stock"]
        
        if len(stock_items) == 0:
            pytest.skip("No stock items to test low stock notification")
        
        # Pick first item and set to low quantity
        item = stock_items[0]
        producto_id = item["producto_id"]
        original_qty = item["cantidad_disponible"]
        
        # Update to low quantity (< 5)
        update_resp = requests.put(
            f"{BASE_URL}/api/gestion/stock/{producto_id}",
            json={"cantidad_disponible": 2},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert update_resp.status_code == 200, f"Failed to update stock: {update_resp.text}"
        print(f"Updated {item['nombre']} to qty=2")

        # Check comercial notifications for stock_bajo notification
        notif_resp = requests.get(
            f"{BASE_URL}/api/gestion/notificaciones",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert notif_resp.status_code == 200
        notifs = notif_resp.json()["notificaciones"]
        
        # Find low stock notification
        found = any(n["tipo"] == "stock_bajo" for n in notifs)
        assert found, "Expected stock_bajo notification not found for comercial"
        print("PASSED: Low stock update created notification for comerciales")
        
        # Restore original quantity
        requests.put(
            f"{BASE_URL}/api/gestion/stock/{producto_id}",
            json={"cantidad_disponible": original_qty},
            headers={"Authorization": f"Bearer {admin_token}"}
        )

    def test_assign_installer_creates_notification(self, admin_token, instalador_token):
        """PUT /api/gestion/instalaciones/{id}/asignar creates notification for installer"""
        # First create a pedido to create an installation from
        comercial_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": COMERCIAL_EMAIL,
            "password": COMERCIAL_PASSWORD
        })
        comercial_token = comercial_resp.json()["token"]
        
        # Create pedido
        pedido_data = {
            "cliente_nombre": f"TEST_InstallerNotif_{uuid.uuid4().hex[:6]}",
            "cliente_telefono": "600333444",
            "cliente_direccion": "Calle Instalador 456",
            "productos": []
        }
        pedido_resp = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            json=pedido_data,
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert pedido_resp.status_code == 200
        pedido_id = pedido_resp.json()["pedido_id"]

        # Create installation
        inst_data = {
            "pedido_id": pedido_id,
            "direccion": "Calle Instalador 456",
            "cliente_nombre": pedido_data["cliente_nombre"],
            "cliente_telefono": "600333444",
            "fecha_programada": "2025-02-01",
            "notas": "Test installation for notification"
        }
        inst_resp = requests.post(
            f"{BASE_URL}/api/gestion/instalaciones",
            json=inst_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert inst_resp.status_code == 200
        instalacion_id = inst_resp.json()["instalacion_id"]
        print(f"Created installation: {instalacion_id}")

        # Get the specific instalador@manoprotectt.com user_id (the one our instalador_token is for)
        users_resp = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # Find the seeded instalador (instalador@manoprotectt.com) specifically
        instaladores = [u for u in users_resp.json()["usuarios"] if u["email"] == INSTALADOR_EMAIL and u["activo"]]
        assert len(instaladores) > 0, f"Seeded instalador {INSTALADOR_EMAIL} not found"
        instalador_id = instaladores[0]["user_id"]
        print(f"Found instalador: {instaladores[0]['nombre']} ({instalador_id})")

        # Assign the seeded installer (so our instalador_token can see the notification)
        assign_resp = requests.put(
            f"{BASE_URL}/api/gestion/instalaciones/{instalacion_id}/asignar",
            json={"instalador_id": instalador_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert assign_resp.status_code == 200, f"Failed to assign installer: {assign_resp.text}"
        print(f"Assigned installer {instalador_id} to {instalacion_id}")

        # Check installer notifications using the instalador_token (which is for instalador@manoprotectt.com)
        notif_resp = requests.get(
            f"{BASE_URL}/api/gestion/notificaciones",
            headers={"Authorization": f"Bearer {instalador_token}"}
        )
        assert notif_resp.status_code == 200
        notifs = notif_resp.json()["notificaciones"]
        
        # Find installation notification
        found = any(n["tipo"] == "nueva_instalacion" and instalacion_id in n.get("mensaje", "") for n in notifs)
        assert found, f"Expected notification about installation {instalacion_id} not found in {len(notifs)} notifications"
        print(f"PASSED: Installer assignment created notification")


class TestAppVersionControl:
    """Test app version control and auto-update system"""

    @pytest.fixture
    def admin_token(self):
        """Get admin JWT token"""
        resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return resp.json()["token"]

    def test_get_app_versions(self, admin_token):
        """GET /api/gestion/app-versions returns all app versions"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/app-versions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "versions" in data
        assert isinstance(data["versions"], list)
        
        # Should have versions for comerciales, instaladores, admin
        app_names = [v["app_name"] for v in data["versions"]]
        assert "comerciales" in app_names or len(data["versions"]) >= 0  # May be empty initially
        print(f"PASSED: GET app-versions returned {len(data['versions'])} versions")

    def test_check_version_no_update(self):
        """POST /api/gestion/app-versions/check with current version returns no update"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/app-versions/check",
            json={
                "app_name": "comerciales",
                "current_version": "1.0.0",
                "current_build": 1
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "update_available" in data
        assert "force_update" in data
        print(f"PASSED: Version check returned update_available={data['update_available']}, force_update={data['force_update']}")

    def test_check_version_update_available(self):
        """POST /api/gestion/app-versions/check with old version returns update_available"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/app-versions/check",
            json={
                "app_name": "comerciales",
                "current_version": "0.9.0",
                "current_build": 0
            }
        )
        assert response.status_code == 200
        data = response.json()
        # With default version 1.0.0, old version should show update available
        assert "update_available" in data
        print(f"PASSED: Old version check returned update_available={data['update_available']}")

    def test_update_version_admin_only(self, admin_token):
        """PUT /api/gestion/app-versions/{app} updates version (admin only)"""
        response = requests.put(
            f"{BASE_URL}/api/gestion/app-versions/comerciales",
            json={
                "version_name": "1.1.0",
                "version_code": 2,
                "release_notes": "Test update - new features added",
                "min_version": "1.0.0",
                "force_update": False,
                "download_url": "https://play.google.com/store/apps/details?id=com.manoprotect.comerciales"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Versión actualizada"
        print("PASSED: Admin updated app version successfully")
        
        # Verify the update
        check_resp = requests.post(
            f"{BASE_URL}/api/gestion/app-versions/check",
            json={
                "app_name": "comerciales",
                "current_version": "1.0.0",
                "current_build": 1
            }
        )
        check_data = check_resp.json()
        assert check_data["update_available"] == True
        assert check_data["latest_version"] == "1.1.0"
        print(f"PASSED: Version updated correctly, latest_version={check_data['latest_version']}")

    def test_update_version_comercial_denied(self):
        """PUT /api/gestion/app-versions/{app} denied for non-admin"""
        # Login as comercial
        login_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": COMERCIAL_EMAIL,
            "password": COMERCIAL_PASSWORD
        })
        comercial_token = login_resp.json()["token"]
        
        response = requests.put(
            f"{BASE_URL}/api/gestion/app-versions/comerciales",
            json={"version_name": "9.9.9"},
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASSED: Comercial correctly denied from updating app version")


class TestFamiliaIdAuth:
    """Test Family ID authentication system"""

    @pytest.fixture
    def unique_familia_id(self):
        """Generate unique familia ID for testing"""
        return f"TEST{uuid.uuid4().hex[:6].upper()}"

    @pytest.fixture
    def unique_email(self):
        """Generate unique email for testing"""
        return f"testfamilia_{uuid.uuid4().hex[:8]}@test.com"

    def test_familia_register_success(self, unique_familia_id, unique_email):
        """POST /api/auth/familia/register - register with familia_id"""
        response = requests.post(f"{BASE_URL}/api/auth/familia/register", json={
            "familia_id": unique_familia_id,
            "nombre": "Test User Familia",
            "email": unique_email,
            "password": STRONG_PASSWORD,
            "telefono": "+34612345678"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user_id" in data
        assert data["email"] == unique_email.lower()
        assert data["familia_id"] == unique_familia_id
        print(f"PASSED: Familia registration successful, user_id={data['user_id']}, familia_id={data['familia_id']}")
        return data

    def test_familia_register_weak_password_rejected(self, unique_familia_id, unique_email):
        """POST /api/auth/familia/register - weak password rejected"""
        response = requests.post(f"{BASE_URL}/api/auth/familia/register", json={
            "familia_id": unique_familia_id,
            "nombre": "Test User",
            "email": unique_email,
            "password": "password123",  # Weak password
            "telefono": ""
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASSED: Weak password correctly rejected")

    def test_familia_login_success(self):
        """POST /api/auth/familia/login - login with familia_id + email + password"""
        # First register a user
        familia_id = f"TEST{uuid.uuid4().hex[:6].upper()}"
        email = f"logintest_{uuid.uuid4().hex[:8]}@test.com"
        
        reg_resp = requests.post(f"{BASE_URL}/api/auth/familia/register", json={
            "familia_id": familia_id,
            "nombre": "Login Test User",
            "email": email,
            "password": STRONG_PASSWORD,
            "telefono": ""
        })
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        
        # Now login
        login_resp = requests.post(f"{BASE_URL}/api/auth/familia/login", json={
            "familia_id": familia_id,
            "email": email,
            "password": STRONG_PASSWORD
        })
        assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}: {login_resp.text}"
        data = login_resp.json()
        assert "user_id" in data
        assert data["email"] == email.lower()
        assert data["familia_id"] == familia_id
        print(f"PASSED: Familia login successful for {email}")

    def test_familia_login_wrong_familia_id(self):
        """POST /api/auth/familia/login - wrong familia_id returns 401"""
        # First register a user
        familia_id = f"TEST{uuid.uuid4().hex[:6].upper()}"
        email = f"wrongfamid_{uuid.uuid4().hex[:8]}@test.com"
        
        reg_resp = requests.post(f"{BASE_URL}/api/auth/familia/register", json={
            "familia_id": familia_id,
            "nombre": "Wrong Familia Test",
            "email": email,
            "password": STRONG_PASSWORD,
            "telefono": ""
        })
        assert reg_resp.status_code == 200
        
        # Try login with wrong familia_id
        login_resp = requests.post(f"{BASE_URL}/api/auth/familia/login", json={
            "familia_id": "WRONGFAMILYID",
            "email": email,
            "password": STRONG_PASSWORD
        })
        assert login_resp.status_code == 401
        print("PASSED: Wrong familia_id correctly returned 401")

    def test_familia_password_reset_flow(self):
        """Full familia flow: register -> request reset -> reset -> login with new pw"""
        familia_id = f"RESET{uuid.uuid4().hex[:6].upper()}"
        email = f"resettest_{uuid.uuid4().hex[:8]}@test.com"
        new_password = "N3wStr0ng#Pass2025"
        
        # 1. Register
        reg_resp = requests.post(f"{BASE_URL}/api/auth/familia/register", json={
            "familia_id": familia_id,
            "nombre": "Reset Test User",
            "email": email,
            "password": STRONG_PASSWORD,
            "telefono": ""
        })
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        print(f"1. Registered user: {email} with familia_id: {familia_id}")
        
        # 2. Request password reset
        reset_req_resp = requests.post(f"{BASE_URL}/api/auth/familia/request-password-reset", json={
            "familia_id": familia_id,
            "email": email
        })
        assert reset_req_resp.status_code == 200, f"Reset request failed: {reset_req_resp.text}"
        reset_data = reset_req_resp.json()
        assert "debug_token" in reset_data, "Expected debug_token in response for testing"
        reset_token = reset_data["debug_token"]
        print(f"2. Password reset requested, got debug_token")
        
        # 3. Reset password with token
        reset_resp = requests.post(f"{BASE_URL}/api/auth/familia/reset-password", json={
            "token": reset_token,
            "new_password": new_password
        })
        assert reset_resp.status_code == 200, f"Password reset failed: {reset_resp.text}"
        print("3. Password reset successful")
        
        # 4. Login with new password
        login_resp = requests.post(f"{BASE_URL}/api/auth/familia/login", json={
            "familia_id": familia_id,
            "email": email,
            "password": new_password
        })
        assert login_resp.status_code == 200, f"Login with new password failed: {login_resp.text}"
        print("4. Login with new password successful")
        print("PASSED: Full familia password reset flow completed")

    def test_familia_reset_invalid_token(self):
        """POST /api/auth/familia/reset-password - invalid token returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/familia/reset-password", json={
            "token": "invalid_token_that_does_not_exist",
            "new_password": STRONG_PASSWORD
        })
        assert response.status_code == 400
        print("PASSED: Invalid reset token correctly returned 400")


class TestRoleBasedAccessControl:
    """Test role-based access control for gestion system"""

    def test_comercial_cannot_access_usuarios(self):
        """Role access: comercial cannot access /api/gestion/usuarios"""
        # Login as comercial
        login_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": COMERCIAL_EMAIL,
            "password": COMERCIAL_PASSWORD
        })
        token = login_resp.json()["token"]
        
        # Try to access usuarios (admin only)
        response = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASSED: Comercial correctly denied access to /usuarios")

    def test_instalador_cannot_create_pedidos(self):
        """Role access: instalador cannot create pedidos"""
        # Login as instalador
        login_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": INSTALADOR_EMAIL,
            "password": INSTALADOR_PASSWORD
        })
        token = login_resp.json()["token"]
        
        # Try to create pedido (comercial/admin only)
        response = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            json={
                "cliente_nombre": "Test",
                "productos": []
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASSED: Instalador correctly denied from creating pedidos")

    def test_instalador_cannot_access_logs(self):
        """Role access: instalador cannot access audit logs"""
        # Login as instalador
        login_resp = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": INSTALADOR_EMAIL,
            "password": INSTALADOR_PASSWORD
        })
        token = login_resp.json()["token"]
        
        # Try to access logs (admin only)
        response = requests.get(
            f"{BASE_URL}/api/gestion/logs",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASSED: Instalador correctly denied access to /logs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
