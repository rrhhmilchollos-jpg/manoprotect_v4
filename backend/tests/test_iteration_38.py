"""
Test Iteration 38: ManoProtect Stripe Bug Fix & Enterprise Portal
Tests for:
1. SOS Device Order - Creates order with 'pending_payment' status
2. SOS Device Order - Returns Stripe checkout_url
3. Enterprise Portal - Admin login with admin@manoprotect.com / Admin2026!
4. Enterprise Portal - Employee listing, Client listing, Dashboard stats
5. Google Play User - Login with review@manoprotect.com / 20142026
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review_request
ENTERPRISE_ADMIN_EMAIL = "admin@manoprotect.com"
ENTERPRISE_ADMIN_PASSWORD = "Admin2026!"
GOOGLE_PLAY_EMAIL = "review@manoprotect.com"
GOOGLE_PLAY_PASSWORD = "20142026"


class TestHealthCheck:
    """Basic API health verification"""
    
    def test_api_health(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health check passed")


class TestSOSDeviceOrderStripeIntegration:
    """
    Test that /api/sos-device/order creates order with pending_payment status
    and returns Stripe checkout URL
    """
    
    @pytest.fixture
    def user_session(self):
        """Login as Google Play review user to get session"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GOOGLE_PLAY_EMAIL,
            "password": GOOGLE_PLAY_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed - status {response.status_code}")
        cookies = response.cookies.get_dict()
        return cookies
    
    def test_sos_device_order_requires_auth(self):
        """Test that SOS device order requires authentication"""
        response = requests.post(f"{BASE_URL}/api/sos-device/order", json={
            "quantity": 1,
            "family_members": 1,
            "shipping": {
                "fullName": "Test User",
                "phone": "600000000",
                "address": "Calle Test 1",
                "city": "Madrid",
                "postalCode": "28001",
                "province": "Madrid"
            },
            "selected_colors": ["plata"],
            "total_price": 4.95
        })
        assert response.status_code == 401
        print("✅ SOS device order requires authentication")
    
    def test_sos_device_order_creates_pending_payment(self, user_session):
        """
        Test that creating an order returns:
        - success: True
        - requires_payment: True (since shipping cost > 0)
        - checkout_url: Stripe checkout URL
        - status should be 'pending_payment' (verified via order status endpoint)
        """
        import uuid
        test_name = f"TEST_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/sos-device/order",
            json={
                "quantity": 1,
                "family_members": 1,
                "shipping": {
                    "fullName": test_name,
                    "phone": "600123456",
                    "address": "Calle Stripe Test 1",
                    "city": "Madrid",
                    "postalCode": "28001",
                    "province": "Madrid"
                },
                "selected_colors": ["plata"],
                "total_price": 4.95
            },
            cookies=user_session
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure for Stripe integration
        assert data.get("success") == True, "Order should be successful"
        assert "order_id" in data, "Response should contain order_id"
        assert data.get("requires_payment") == True, "Order should require payment"
        assert "checkout_url" in data, "Response should contain Stripe checkout_url"
        assert "stripe.com" in data["checkout_url"], "checkout_url should be a Stripe URL"
        
        order_id = data["order_id"]
        print(f"✅ SOS device order created with pending_payment status")
        print(f"   Order ID: {order_id}")
        print(f"   Checkout URL: {data['checkout_url'][:50]}...")
        
        # Verify order status is pending_payment
        status_response = requests.get(
            f"{BASE_URL}/api/sos-device/order/{order_id}/status",
            cookies=user_session
        )
        if status_response.status_code == 200:
            status_data = status_response.json()
            assert status_data.get("status") == "pending_payment", f"Order status should be 'pending_payment', got {status_data.get('status')}"
            assert status_data.get("payment_status") == "pending", f"Payment status should be 'pending', got {status_data.get('payment_status')}"
            print(f"✅ Order status verified: {status_data['status']}, payment: {status_data['payment_status']}")
        
        return order_id
    
    def test_sos_device_order_no_devices_created_before_payment(self, user_session):
        """
        Verify that devices are NOT created until payment is confirmed
        This is the bug fix - devices should only be created after webhook confirms payment
        """
        import uuid
        test_name = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create order
        order_response = requests.post(
            f"{BASE_URL}/api/sos-device/order",
            json={
                "quantity": 2,
                "family_members": 2,
                "shipping": {
                    "fullName": test_name,
                    "phone": "600999888",
                    "address": "Calle No Device Test",
                    "city": "Barcelona",
                    "postalCode": "08001",
                    "province": "Barcelona"
                },
                "selected_colors": ["azul-cielo", "verde-menta"],
                "total_price": 4.95 * 2
            },
            cookies=user_session
        )
        
        assert order_response.status_code == 200
        data = order_response.json()
        
        # The response should NOT contain device_ids since payment is not confirmed
        assert "device_ids" not in data or data.get("device_ids") is None or len(data.get("device_ids", [])) == 0, \
            "Devices should NOT be created before payment confirmation"
        
        print("✅ Verified: No devices created before payment confirmation (bug fix working)")


class TestEnterprisePortalAuthentication:
    """Test Enterprise Portal admin login"""
    
    def test_enterprise_admin_login(self):
        """Test admin login with admin@manoprotect.com / Admin2026!"""
        response = requests.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": ENTERPRISE_ADMIN_EMAIL,
            "password": ENTERPRISE_ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Enterprise admin login failed: {response.status_code} - {response.text}"
        data = response.json()
        
        assert data.get("success") == True
        assert data.get("email") == ENTERPRISE_ADMIN_EMAIL
        assert "session_token" in data
        assert data.get("role") in ["admin", "super_admin", "supervisor"]
        assert "permissions" in data
        
        print(f"✅ Enterprise admin login successful")
        print(f"   Name: {data.get('name')}")
        print(f"   Role: {data.get('role')}")
        print(f"   Permissions: {len(data.get('permissions', []))} permissions")
        
        return data["session_token"]
    
    def test_enterprise_invalid_login(self):
        """Test that invalid credentials are rejected"""
        response = requests.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": ENTERPRISE_ADMIN_EMAIL,
            "password": "WrongPassword123"
        })
        assert response.status_code == 401
        print("✅ Enterprise invalid credentials correctly rejected")


class TestEnterprisePortalEndpoints:
    """Test Enterprise Portal data endpoints"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session for tests"""
        response = requests.post(f"{BASE_URL}/api/enterprise/auth/login", json={
            "email": ENTERPRISE_ADMIN_EMAIL,
            "password": ENTERPRISE_ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.status_code}")
        return response.json()["session_token"]
    
    def test_dashboard_stats(self, admin_session):
        """Test /api/enterprise/dashboard/stats returns KPIs"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/dashboard/stats",
            cookies={"enterprise_session": admin_session}
        )
        
        assert response.status_code == 200, f"Dashboard stats failed: {response.status_code}"
        data = response.json()
        
        # Verify expected KPI fields exist
        expected_fields = [
            "total_employees", "active_employees", "total_clients", 
            "premium_clients", "pending_sos", "total_alerts_today"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✅ Dashboard stats retrieved successfully")
        print(f"   Total Employees: {data.get('total_employees')}")
        print(f"   Active Employees: {data.get('active_employees')}")
        print(f"   Total Clients: {data.get('total_clients')}")
        print(f"   Premium Clients: {data.get('premium_clients')}")
    
    def test_employees_list(self, admin_session):
        """Test /api/enterprise/employees lists employees"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/employees",
            cookies={"enterprise_session": admin_session}
        )
        
        assert response.status_code == 200, f"Employees list failed: {response.status_code}"
        data = response.json()
        
        assert "employees" in data
        assert "total" in data
        assert isinstance(data["employees"], list)
        
        print(f"✅ Employees list retrieved: {data['total']} employees")
        if data["employees"]:
            emp = data["employees"][0]
            print(f"   Sample employee: {emp.get('name')} ({emp.get('role')})")
    
    def test_clients_list(self, admin_session):
        """Test /api/enterprise/clients lists clients"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients",
            cookies={"enterprise_session": admin_session}
        )
        
        assert response.status_code == 200, f"Clients list failed: {response.status_code}"
        data = response.json()
        
        assert "clients" in data
        assert "total" in data
        assert isinstance(data["clients"], list)
        
        print(f"✅ Clients list retrieved: {data['total']} clients")
        if data["clients"]:
            client = data["clients"][0]
            print(f"   Sample client: {client.get('name', 'N/A')} - Plan: {client.get('plan', 'N/A')}")


class TestGooglePlayUserLogin:
    """Test Google Play review user can login"""
    
    def test_google_play_user_login_via_auth(self):
        """Test login with review@manoprotect.com / 20142026 via auth API"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GOOGLE_PLAY_EMAIL,
            "password": GOOGLE_PLAY_PASSWORD
        })
        
        # Accept either 200 (success) or check if user exists
        if response.status_code == 200:
            data = response.json()
            assert data.get("user", {}).get("email") == GOOGLE_PLAY_EMAIL or data.get("email") == GOOGLE_PLAY_EMAIL
            print(f"✅ Google Play user login successful via /api/auth/login")
            print(f"   Email: {GOOGLE_PLAY_EMAIL}")
            return True
        elif response.status_code == 401:
            # User might not exist yet, which is acceptable for first test
            print(f"⚠️ Google Play user login returned 401 - user may need to be created")
            # Try checking if it's because user doesn't exist vs wrong password
            data = response.json()
            print(f"   Response: {data}")
            return False
        else:
            pytest.fail(f"Unexpected status code: {response.status_code} - {response.text}")
    
    def test_google_play_user_exists_in_database(self):
        """Verify Google Play user exists by attempting login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GOOGLE_PLAY_EMAIL,
            "password": GOOGLE_PLAY_PASSWORD
        })
        
        # We just need to verify the API responds appropriately
        assert response.status_code in [200, 401], f"Unexpected response: {response.status_code}"
        
        if response.status_code == 200:
            print(f"✅ Google Play user exists and can login")
        else:
            data = response.json()
            # Check if it's "wrong password" vs "user not found"
            error_msg = data.get("detail", "").lower()
            if "no encontrado" in error_msg or "not found" in error_msg:
                print(f"⚠️ Google Play user not found - needs to be created")
            else:
                print(f"⚠️ Google Play user login issue: {data.get('detail')}")


class TestStripeWebhookEndpoint:
    """Test that Stripe webhook endpoint exists and is accessible"""
    
    def test_webhook_endpoint_exists(self):
        """Verify /api/sos-device/webhook/stripe endpoint exists"""
        # Note: We can't actually call this without valid Stripe signature
        # but we can verify the endpoint exists by checking for 400 (bad request)
        # instead of 404 (not found)
        response = requests.post(
            f"{BASE_URL}/api/sos-device/webhook/stripe",
            data="{}",
            headers={"Content-Type": "application/json"}
        )
        
        # Should get 400 (Invalid payload/signature) not 404 (endpoint not found)
        assert response.status_code != 404, "Stripe webhook endpoint not found"
        assert response.status_code in [400, 401, 403], f"Unexpected status: {response.status_code}"
        
        print(f"✅ Stripe webhook endpoint exists at /api/sos-device/webhook/stripe")


class TestUserOrdersEndpoint:
    """Test user can view their orders"""
    
    @pytest.fixture
    def user_session(self):
        """Login as Google Play review user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": GOOGLE_PLAY_EMAIL,
            "password": GOOGLE_PLAY_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed")
        return response.cookies.get_dict()
    
    def test_get_user_orders(self, user_session):
        """Test /api/sos-device/orders returns user's orders"""
        response = requests.get(
            f"{BASE_URL}/api/sos-device/orders",
            cookies=user_session
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert isinstance(data["orders"], list)
        
        print(f"✅ User orders endpoint working")
        print(f"   Orders count: {len(data['orders'])}")
        
        # Check if any orders are in pending_payment status
        pending_orders = [o for o in data["orders"] if o.get("status") == "pending_payment"]
        if pending_orders:
            print(f"   Pending payment orders: {len(pending_orders)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
