"""
Test Suite for ManoProtect Sistema de Gestión CRA
Tests all CRUD operations for stock, pedidos, instalaciones, usuarios, and logs
Tests role-based access control for admin, comercial, and instalador roles
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@manoprotect.com"
ADMIN_PASSWORD = "ManoAdmin2025!"
COMERCIAL_EMAIL = "comercial@manoprotect.com"
COMERCIAL_PASSWORD = "Comercial2025!"
INSTALADOR_EMAIL = "instalador@manoprotect.com"
INSTALADOR_PASSWORD = "Instalador2025!"


class TestGestionAuth:
    """Authentication tests for the gestion system"""
    
    def test_seed_admin_already_exists(self):
        """POST /api/gestion/seed-admin - Should indicate admin already exists"""
        response = requests.post(f"{BASE_URL}/api/gestion/seed-admin")
        assert response.status_code == 200
        data = response.json()
        # Admin should already exist from prior seeding
        assert "message" in data
        print(f"Seed admin response: {data}")
    
    def test_admin_login_success(self):
        """POST /api/gestion/auth/login - Admin login"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["rol"] == "admin"
        print(f"Admin login successful: {data['user']['nombre']}")
    
    def test_comercial_login_success(self):
        """POST /api/gestion/auth/login - Comercial login"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "comercial"
        print(f"Comercial login successful: {data['user']['nombre']}")
    
    def test_instalador_login_success(self):
        """POST /api/gestion/auth/login - Instalador login"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["rol"] == "instalador"
        print(f"Instalador login successful: {data['user']['nombre']}")
    
    def test_invalid_credentials(self):
        """POST /api/gestion/auth/login - Invalid credentials should fail"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """GET /api/gestion/auth/me - Get current user info"""
        # Login first
        login_res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_res.json()["token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/gestion/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["rol"] == "admin"
        print(f"Current user: {data}")


class TestGestionDashboard:
    """Dashboard stats tests"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    def test_dashboard_stats(self, admin_token):
        """GET /api/gestion/dashboard/stats - Get system statistics"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/dashboard/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_usuarios" in data
        assert "total_comerciales" in data
        assert "total_instaladores" in data
        assert "total_stock" in data
        assert "total_pedidos" in data
        assert "stock_bajo" in data
        print(f"Dashboard stats: {data}")


class TestGestionStock:
    """Stock CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def comercial_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        return res.json()["token"]
    
    def test_list_stock(self, admin_token):
        """GET /api/gestion/stock - List all stock items"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/stock",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stock" in data
        assert "total" in data
        assert data["total"] >= 0
        print(f"Stock items: {data['total']}")
    
    def test_create_stock_admin_only(self, admin_token):
        """POST /api/gestion/stock - Create stock (admin only)"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/stock",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "TEST_Sensor de Prueba",
                "producto_tipo": "sensor_pir",
                "cantidad_disponible": 100,
                "ubicacion": "Almacén Test",
                "precio_unitario": 49.99,
                "descripcion": "Producto de prueba"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "producto_id" in data
        print(f"Stock created: {data}")
        return data["producto_id"]
    
    def test_create_stock_comercial_forbidden(self, comercial_token):
        """POST /api/gestion/stock - Comercial cannot create stock"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/stock",
            headers={"Authorization": f"Bearer {comercial_token}"},
            json={
                "nombre": "Sensor Prohibido",
                "producto_tipo": "sensor_pir",
                "cantidad_disponible": 10
            }
        )
        assert response.status_code == 403
        print("Comercial correctly denied stock creation")
    
    def test_update_stock_admin(self, admin_token):
        """PUT /api/gestion/stock/{id} - Update stock (admin only)"""
        # First get stock list to find an item
        list_res = requests.get(
            f"{BASE_URL}/api/gestion/stock",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        stock = list_res.json()["stock"]
        if not stock:
            pytest.skip("No stock items to update")
        
        producto_id = stock[0]["producto_id"]
        response = requests.put(
            f"{BASE_URL}/api/gestion/stock/{producto_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"cantidad_disponible": 999}
        )
        assert response.status_code == 200
        print(f"Stock updated: {producto_id}")


class TestGestionPedidos:
    """Pedidos (Orders) CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def comercial_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def instalador_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        return res.json()["token"]
    
    def test_create_pedido_comercial(self, comercial_token):
        """POST /api/gestion/pedidos - Comercial can create orders"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            headers={"Authorization": f"Bearer {comercial_token}"},
            json={
                "cliente_nombre": "TEST_Cliente Prueba",
                "cliente_telefono": "612345678",
                "cliente_email": "test@cliente.com",
                "cliente_direccion": "Calle Test 123",
                "productos": [{"producto_id": "test123", "cantidad": 2}],
                "notas": "Pedido de prueba"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "pedido_id" in data
        assert data["pedido_id"].startswith("PED-")
        print(f"Pedido created: {data['pedido_id']}")
        return data["pedido_id"]
    
    def test_create_pedido_instalador_forbidden(self, instalador_token):
        """POST /api/gestion/pedidos - Instalador cannot create orders"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            headers={"Authorization": f"Bearer {instalador_token}"},
            json={
                "cliente_nombre": "Cliente Prohibido",
                "cliente_telefono": "600000000"
            }
        )
        assert response.status_code == 403
        print("Instalador correctly denied order creation")
    
    def test_list_pedidos_comercial(self, comercial_token):
        """GET /api/gestion/pedidos - List orders (filtered by role)"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/pedidos",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "pedidos" in data
        print(f"Comercial pedidos: {data['total']}")
    
    def test_update_pedido_status(self, comercial_token):
        """PUT /api/gestion/pedidos/{id} - Update order status"""
        # First create a pedido
        create_res = requests.post(
            f"{BASE_URL}/api/gestion/pedidos",
            headers={"Authorization": f"Bearer {comercial_token}"},
            json={"cliente_nombre": "TEST_Update Status", "cliente_telefono": "611111111"}
        )
        pedido_id = create_res.json()["pedido_id"]
        
        # Update status
        response = requests.put(
            f"{BASE_URL}/api/gestion/pedidos/{pedido_id}",
            headers={"Authorization": f"Bearer {comercial_token}"},
            json={"estado": "confirmado"}
        )
        assert response.status_code == 200
        print(f"Pedido {pedido_id} updated to confirmado")


class TestGestionInstalaciones:
    """Instalaciones CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def comercial_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def instalador_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": INSTALADOR_EMAIL, "password": INSTALADOR_PASSWORD}
        )
        return res.json()["token"]
    
    def test_create_instalacion(self, comercial_token):
        """POST /api/gestion/instalaciones - Create installation"""
        response = requests.post(
            f"{BASE_URL}/api/gestion/instalaciones",
            headers={"Authorization": f"Bearer {comercial_token}"},
            json={
                "pedido_id": "PED-TEST001",
                "direccion": "Calle Instalación 456",
                "cliente_nombre": "TEST_Cliente Instalación",
                "cliente_telefono": "622222222",
                "fecha_programada": "2026-02-15",
                "notas": "Instalación de prueba"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "instalacion_id" in data
        assert data["instalacion_id"].startswith("INS-")
        print(f"Instalación created: {data['instalacion_id']}")
        return data["instalacion_id"]
    
    def test_list_instalaciones_admin(self, admin_token):
        """GET /api/gestion/instalaciones - Admin sees all"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/instalaciones",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "instalaciones" in data
        print(f"Admin instalaciones: {data['total']}")
    
    def test_list_instalaciones_instalador(self, instalador_token):
        """GET /api/gestion/instalaciones - Instalador sees only assigned"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/instalaciones",
            headers={"Authorization": f"Bearer {instalador_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "instalaciones" in data
        print(f"Instalador assigned instalaciones: {data['total']}")
    
    def test_update_instalacion_status(self, admin_token, instalador_token):
        """PUT /api/gestion/instalaciones/{id} - Update installation status"""
        # First create an installation
        create_res = requests.post(
            f"{BASE_URL}/api/gestion/instalaciones",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "pedido_id": "PED-STATUS",
                "direccion": "Calle Status 789",
                "cliente_nombre": "TEST_Status Update"
            }
        )
        instalacion_id = create_res.json()["instalacion_id"]
        
        # Update status
        response = requests.put(
            f"{BASE_URL}/api/gestion/instalaciones/{instalacion_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"estado": "asignado"}
        )
        assert response.status_code == 200
        print(f"Instalación {instalacion_id} updated to asignado")
    
    def test_assign_installer_admin_only(self, admin_token):
        """PUT /api/gestion/instalaciones/{id}/asignar - Assign installer (admin)"""
        # Get instalador user_id
        usuarios_res = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        usuarios = usuarios_res.json()["usuarios"]
        instalador = next((u for u in usuarios if u["rol"] == "instalador" and u["activo"]), None)
        
        if not instalador:
            pytest.skip("No active instalador found")
        
        # Create installation to assign
        create_res = requests.post(
            f"{BASE_URL}/api/gestion/instalaciones",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "pedido_id": "PED-ASSIGN",
                "direccion": "Calle Asignar 101",
                "cliente_nombre": "TEST_Asignar Instalador"
            }
        )
        instalacion_id = create_res.json()["instalacion_id"]
        
        # Assign installer
        response = requests.put(
            f"{BASE_URL}/api/gestion/instalaciones/{instalacion_id}/asignar",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"instalador_id": instalador["user_id"]}
        )
        assert response.status_code == 200
        print(f"Installer {instalador['nombre']} assigned to {instalacion_id}")


class TestGestionUsuarios:
    """Usuarios (Users) management tests - Admin only"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def comercial_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        return res.json()["token"]
    
    def test_list_usuarios_admin(self, admin_token):
        """GET /api/gestion/usuarios - Admin can list users"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "usuarios" in data
        assert len(data["usuarios"]) >= 3  # At least admin, comercial, instalador
        print(f"Users: {data['total']}")
    
    def test_list_usuarios_comercial_forbidden(self, comercial_token):
        """GET /api/gestion/usuarios - Comercial cannot list users"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert response.status_code == 403
        print("Comercial correctly denied user listing")
    
    def test_create_user_admin(self, admin_token):
        """POST /api/gestion/usuarios - Admin can create users"""
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "TEST_Usuario Nuevo",
                "email": unique_email,
                "password": "TestPassword123!",
                "rol": "comercial"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        print(f"User created: {data['user_id']}")
        return data["user_id"]
    
    def test_update_user_admin(self, admin_token):
        """PUT /api/gestion/usuarios/{id} - Admin can update users"""
        # Create a user first
        import uuid
        unique_email = f"test_update_{uuid.uuid4().hex[:8]}@test.com"
        
        create_res = requests.post(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "TEST_Para Actualizar",
                "email": unique_email,
                "password": "TestUpdate123!",
                "rol": "comercial"
            }
        )
        user_id = create_res.json()["user_id"]
        
        # Update user
        response = requests.put(
            f"{BASE_URL}/api/gestion/usuarios/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"nombre": "TEST_Usuario Actualizado", "rol": "instalador"}
        )
        assert response.status_code == 200
        print(f"User {user_id} updated")
    
    def test_delete_user_admin(self, admin_token):
        """DELETE /api/gestion/usuarios/{id} - Admin can deactivate users"""
        # Create a user first
        import uuid
        unique_email = f"test_delete_{uuid.uuid4().hex[:8]}@test.com"
        
        create_res = requests.post(
            f"{BASE_URL}/api/gestion/usuarios",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "nombre": "TEST_Para Eliminar",
                "email": unique_email,
                "password": "TestDelete123!",
                "rol": "comercial"
            }
        )
        user_id = create_res.json()["user_id"]
        
        # Delete (deactivate) user
        response = requests.delete(
            f"{BASE_URL}/api/gestion/usuarios/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"User {user_id} deactivated")


class TestGestionLogs:
    """Audit logs tests - Admin only"""
    
    @pytest.fixture
    def admin_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return res.json()["token"]
    
    @pytest.fixture
    def comercial_token(self):
        res = requests.post(
            f"{BASE_URL}/api/gestion/auth/login",
            json={"email": COMERCIAL_EMAIL, "password": COMERCIAL_PASSWORD}
        )
        return res.json()["token"]
    
    def test_get_logs_admin(self, admin_token):
        """GET /api/gestion/logs - Admin can view audit logs"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/logs",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        print(f"Audit logs: {data['total']}")
    
    def test_get_logs_comercial_forbidden(self, comercial_token):
        """GET /api/gestion/logs - Comercial cannot view logs"""
        response = requests.get(
            f"{BASE_URL}/api/gestion/logs",
            headers={"Authorization": f"Bearer {comercial_token}"}
        )
        assert response.status_code == 403
        print("Comercial correctly denied log access")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
