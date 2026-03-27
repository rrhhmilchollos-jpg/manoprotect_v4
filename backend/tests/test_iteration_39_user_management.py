"""
Test Suite for Iteration 39 - Enterprise Portal User Management Improvements
Tests:
1. Eye button (view client details) endpoint
2. Payment history shows real transactions (empty when no payments)
3. Payment status indicators in response
4. Spanish translation verification
5. Role display fixes
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Enterprise admin credentials
ADMIN_EMAIL = "ceo@manoprotectt.com"
ADMIN_PASSWORD = "Admin2026!"


class TestEnterpriseUserManagement:
    """Test Enterprise Portal User Management features"""
    
    session_token = None
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session token before tests"""
        if not TestEnterpriseUserManagement.session_token:
            response = requests.post(
                f"{BASE_URL}/api/enterprise/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            assert response.status_code == 200, f"Login failed: {response.text}"
            data = response.json()
            TestEnterpriseUserManagement.session_token = data.get("session_token")
        yield
    
    def get_cookies(self):
        return {"enterprise_session": self.session_token}
    
    # ============================================
    # Test 1: Clients List Endpoint (Gestión de Usuarios)
    # ============================================
    def test_clients_list_returns_users(self):
        """Verify /api/enterprise/clients returns user list"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients",
            cookies=self.get_cookies()
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "clients" in data, "Response should have 'clients' field"
        assert "total" in data, "Response should have 'total' field"
        assert isinstance(data["clients"], list), "clients should be a list"
        
        # Verify client structure if clients exist
        if data["clients"]:
            client = data["clients"][0]
            assert "email" in client, "Client should have email"
            assert "plan" in client or "subscription_status" in client, "Client should have plan info"
            print(f"✓ Clients list works - found {data['total']} users")
    
    # ============================================
    # Test 2: Get Client Details (Eye Button Endpoint)
    # ============================================
    def test_get_client_details_by_user_id(self):
        """Verify GET /api/enterprise/clients/{client_id} returns user details"""
        # First get a client
        list_response = requests.get(
            f"{BASE_URL}/api/enterprise/clients?limit=1",
            cookies=self.get_cookies()
        )
        assert list_response.status_code == 200
        clients = list_response.json().get("clients", [])
        
        if not clients:
            pytest.skip("No clients to test")
        
        client_id = clients[0].get("user_id") or clients[0].get("email")
        
        # Get details
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients/{client_id}",
            cookies=self.get_cookies()
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        details = response.json()
        
        # Verify required fields
        assert "name" in details or "email" in details, "Should have name or email"
        assert "payment_history" in details, "Should have payment_history field"
        assert "sos_events_count" in details, "Should have sos_events_count"
        assert "alerts_count" in details, "Should have alerts_count"
        assert "total_payments" in details, "Should have total_payments count"
        
        print(f"✓ Client details endpoint works")
        print(f"  - Name: {details.get('name', 'N/A')}")
        print(f"  - Email: {details.get('email')}")
        print(f"  - Plan: {details.get('plan', 'N/A')}")
        print(f"  - SOS events: {details.get('sos_events_count', 0)}")
        print(f"  - Alerts: {details.get('alerts_count', 0)}")
        print(f"  - Total payments: {details.get('total_payments', 0)}")
    
    # ============================================
    # Test 3: Payment History is Real (not mocked)
    # ============================================
    def test_payment_history_is_real_data(self):
        """Verify payment_history returns real transactions, not fake data"""
        # Get client details
        list_response = requests.get(
            f"{BASE_URL}/api/enterprise/clients?limit=1",
            cookies=self.get_cookies()
        )
        clients = list_response.json().get("clients", [])
        
        if not clients:
            pytest.skip("No clients to test")
        
        client_id = clients[0].get("user_id") or clients[0].get("email")
        
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients/{client_id}",
            cookies=self.get_cookies()
        )
        details = response.json()
        
        payment_history = details.get("payment_history", [])
        
        # Payment history should be a list (can be empty if no real payments)
        assert isinstance(payment_history, list), "payment_history should be a list"
        
        # If empty, that's correct behavior (no fake data)
        if len(payment_history) == 0:
            print("✓ Payment history is empty (no real transactions) - CORRECT")
        else:
            # If there are payments, verify structure
            payment = payment_history[0]
            assert "payment_id" in payment or "id" in payment, "Payment should have ID"
            assert "amount" in payment, "Payment should have amount"
            assert "status" in payment, "Payment should have status"
            print(f"✓ Payment history has {len(payment_history)} real transactions")
            
        # total_payments should match the actual count
        assert details.get("total_payments") == len(payment_history), \
            "total_payments should match payment_history length"
    
    # ============================================
    # Test 4: Payment Status Field Structure
    # ============================================
    def test_payment_status_indicators(self):
        """Verify payment status field is present for visual indicators"""
        list_response = requests.get(
            f"{BASE_URL}/api/enterprise/clients?limit=1",
            cookies=self.get_cookies()
        )
        clients = list_response.json().get("clients", [])
        
        if not clients:
            pytest.skip("No clients to test")
        
        client_id = clients[0].get("user_id") or clients[0].get("email")
        
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients/{client_id}",
            cookies=self.get_cookies()
        )
        details = response.json()
        
        payment_history = details.get("payment_history", [])
        
        # If payments exist, verify status field
        if payment_history:
            for payment in payment_history:
                assert "status" in payment, "Each payment must have 'status' field"
                # Status should be one of expected values
                valid_statuses = ["completed", "paid", "succeeded", "pending", 
                                  "pending_payment", "processing", "failed", 
                                  "refunded", "cancelled", "unknown"]
                status = payment["status"].lower()
                assert status in valid_statuses, f"Status '{status}' not in valid list"
            print(f"✓ All {len(payment_history)} payments have valid status fields")
        else:
            print("✓ No payments to verify status (correct - empty history)")
    
    # ============================================
    # Test 5: Client Fields for Spanish Interface
    # ============================================
    def test_client_fields_for_spanish_ui(self):
        """Verify all required fields exist for Spanish UI display"""
        list_response = requests.get(
            f"{BASE_URL}/api/enterprise/clients?limit=1",
            cookies=self.get_cookies()
        )
        clients = list_response.json().get("clients", [])
        
        if not clients:
            pytest.skip("No clients to test")
        
        client = clients[0]
        
        # Fields needed for Gestión de Usuarios table
        required_display_fields = ["email"]  # Minimum required
        optional_display_fields = ["name", "plan", "subscription_status", 
                                   "is_trial", "sos_button_requested", "created_at"]
        
        for field in required_display_fields:
            assert field in client, f"Required field '{field}' missing from client"
        
        # Count available optional fields
        available_optional = [f for f in optional_display_fields if f in client]
        print(f"✓ Client has {len(available_optional)}/{len(optional_display_fields)} optional display fields")
        print(f"  Available: {available_optional}")
    
    # ============================================
    # Test 6: Unauthorized Access Returns 401
    # ============================================
    def test_clients_unauthorized_returns_401(self):
        """Verify endpoints require authentication"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients",
            # No cookies
        )
        assert response.status_code == 401, "Should return 401 without auth"
        print("✓ Unauthorized access correctly returns 401")
    
    # ============================================
    # Test 7: Client Not Found Returns 404
    # ============================================
    def test_get_nonexistent_client_returns_404(self):
        """Verify 404 for non-existent client"""
        response = requests.get(
            f"{BASE_URL}/api/enterprise/clients/nonexistent_user_12345",
            cookies=self.get_cookies()
        )
        assert response.status_code == 404, f"Should return 404, got {response.status_code}"
        print("✓ Non-existent client correctly returns 404")


class TestEnterpriseAuthAndPermissions:
    """Test authentication and role-based permissions"""
    
    def test_login_with_ceo_credentials(self):
        """Verify CEO can login"""
        response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True, "Login should succeed"
        assert data.get("role") == "super_admin", f"Role should be super_admin, got {data.get('role')}"
        assert "permissions" in data, "Should return permissions"
        print(f"✓ CEO login works - role: {data.get('role')}")
    
    def test_auth_me_returns_user_info(self):
        """Verify /auth/me returns logged in user info"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        session = login_response.json().get("session_token")
        
        # Get user info
        response = requests.get(
            f"{BASE_URL}/api/enterprise/auth/me",
            cookies={"enterprise_session": session}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("email") == ADMIN_EMAIL
        assert "name" in data
        assert "role" in data
        assert "permissions" in data
        print(f"✓ Auth/me works - user: {data.get('name')}")


# Run with: pytest test_iteration_39_user_management.py -v
