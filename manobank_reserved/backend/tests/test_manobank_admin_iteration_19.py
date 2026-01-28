"""
ManoBank Admin API Tests - Iteration 19
Tests for employee portal and banking operations
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "rrhh.milchollos@gmail.com"
TEST_PASSWORD = "19862210Des"
TEST_CUSTOMER_ID = "cust_78ae3108d778"
TEST_ACCOUNT_ID = "acc_27ec7ecfc24c"


class TestAuthLogin:
    """Test employee authentication"""
    
    def test_login_success(self):
        """POST /api/auth/login - Login de empleado"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # Response contains user data directly (email, name, etc.)
        assert "email" in data or "user" in data or "token" in data
        print(f"✓ Login successful for {data.get('email', TEST_EMAIL)}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login - Invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpass"}
        )
        assert response.status_code in [401, 400], f"Expected 401/400, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")


@pytest.fixture(scope="module")
def auth_session():
    """Get authenticated session for tests"""
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.text}")
    
    data = response.json()
    # Handle different auth response formats
    if "token" in data:
        session.headers.update({"Authorization": f"Bearer {data['token']}"})
    elif "session_token" in data:
        session.cookies.set("session_token", data["session_token"])
    
    return session


class TestAdminDashboard:
    """Test admin dashboard endpoint"""
    
    def test_dashboard_returns_stats(self, auth_session):
        """GET /api/manobank/admin/dashboard - Dashboard admin"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        # Verify dashboard structure
        assert "employee" in data, "Missing employee info"
        assert "stats" in data, "Missing stats"
        assert "pending" in data, "Missing pending info"
        
        # Verify stats fields
        stats = data["stats"]
        assert "total_customers" in stats
        assert "total_accounts" in stats
        assert "total_deposits" in stats
        
        print(f"✓ Dashboard loaded - {stats['total_customers']} customers, {stats['total_accounts']} accounts")
    
    def test_dashboard_requires_auth(self):
        """GET /api/manobank/admin/dashboard - Returns 401/403 without auth"""
        response = requests.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Dashboard correctly requires authentication")


class TestCustomerManagement:
    """Test customer management endpoints"""
    
    def test_list_customers(self, auth_session):
        """GET /api/manobank/admin/customers - Lista de clientes"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers")
        assert response.status_code == 200, f"List customers failed: {response.text}"
        data = response.json()
        
        assert "customers" in data
        assert isinstance(data["customers"], list)
        print(f"✓ Listed {len(data['customers'])} customers")
    
    def test_search_customers(self, auth_session):
        """GET /api/manobank/admin/customers?search=Maria - Search customers"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers?search=Maria")
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        
        assert "customers" in data
        print(f"✓ Search returned {len(data['customers'])} results for 'Maria'")
    
    def test_get_customer_accounts(self, auth_session):
        """GET /api/manobank/admin/customers/{id}/accounts - Cuentas de cliente"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers/{TEST_CUSTOMER_ID}/accounts")
        assert response.status_code == 200, f"Get accounts failed: {response.text}"
        data = response.json()
        
        assert "accounts" in data
        print(f"✓ Customer {TEST_CUSTOMER_ID} has {len(data['accounts'])} accounts")
    
    def test_get_customer_cards(self, auth_session):
        """GET /api/manobank/admin/customers/{id}/cards - Tarjetas de cliente"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers/{TEST_CUSTOMER_ID}/cards")
        assert response.status_code == 200, f"Get cards failed: {response.text}"
        data = response.json()
        
        assert "cards" in data
        print(f"✓ Customer {TEST_CUSTOMER_ID} has {len(data['cards'])} cards")
    
    def test_get_customer_transactions(self, auth_session):
        """GET /api/manobank/admin/customers/{id}/transactions - Movimientos"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers/{TEST_CUSTOMER_ID}/transactions")
        assert response.status_code == 200, f"Get transactions failed: {response.text}"
        data = response.json()
        
        assert "transactions" in data
        print(f"✓ Customer {TEST_CUSTOMER_ID} has {len(data['transactions'])} transactions")
    
    def test_get_customer_detail(self, auth_session):
        """GET /api/manobank/admin/customers/{id} - Customer detail with accounts, loans, cards"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/customers/{TEST_CUSTOMER_ID}")
        assert response.status_code == 200, f"Get customer detail failed: {response.text}"
        data = response.json()
        
        assert "customer" in data
        assert "accounts" in data
        assert "loans" in data
        assert "cards" in data
        
        customer = data["customer"]
        print(f"✓ Customer detail: {customer.get('name', 'N/A')}")


class TestTellerOperations:
    """Test teller/cashier operations - deposit and withdraw"""
    
    def test_deposit_to_account(self, auth_session):
        """POST /api/manobank/admin/accounts/{id}/deposit - Ingreso en ventanilla"""
        deposit_amount = 50.00
        response = auth_session.post(
            f"{BASE_URL}/api/manobank/admin/accounts/{TEST_ACCOUNT_ID}/deposit",
            json={"amount": deposit_amount, "concept": "TEST_Ingreso prueba pytest"}
        )
        assert response.status_code == 200, f"Deposit failed: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "new_balance" in data
        print(f"✓ Deposit of €{deposit_amount} successful. New balance: €{data['new_balance']}")
        
        return data["new_balance"]
    
    def test_withdraw_from_account(self, auth_session):
        """POST /api/manobank/admin/accounts/{id}/withdraw - Retirada en ventanilla"""
        withdraw_amount = 25.00
        response = auth_session.post(
            f"{BASE_URL}/api/manobank/admin/accounts/{TEST_ACCOUNT_ID}/withdraw",
            json={"amount": withdraw_amount, "concept": "TEST_Retirada prueba pytest"}
        )
        assert response.status_code == 200, f"Withdraw failed: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "new_balance" in data
        print(f"✓ Withdrawal of €{withdraw_amount} successful. New balance: €{data['new_balance']}")
    
    def test_withdraw_insufficient_funds(self, auth_session):
        """POST /api/manobank/admin/accounts/{id}/withdraw - Insufficient funds"""
        # Try to withdraw a very large amount
        response = auth_session.post(
            f"{BASE_URL}/api/manobank/admin/accounts/{TEST_ACCOUNT_ID}/withdraw",
            json={"amount": 999999999.00, "concept": "TEST_Should fail"}
        )
        # Should fail with 400 (insufficient funds) or similar
        assert response.status_code in [400, 422], f"Expected 400/422 for insufficient funds, got {response.status_code}"
        print("✓ Insufficient funds correctly rejected")


class TestComplianceEndpoints:
    """Test compliance-related endpoints"""
    
    def test_compliance_summary(self, auth_session):
        """GET /api/compliance/summary - Resumen compliance"""
        response = auth_session.get(f"{BASE_URL}/api/compliance/summary")
        assert response.status_code == 200, f"Compliance summary failed: {response.text}"
        data = response.json()
        
        # Verify entity info - nested under "entity" key
        assert "entity" in data, f"Missing entity in response: {data.keys()}"
        entity = data["entity"]
        assert "name" in entity or "cif" in entity
        print(f"✓ Compliance summary loaded: {entity.get('name', 'N/A')}")
    
    def test_aml_dashboard(self, auth_session):
        """GET /api/aml/dashboard - Dashboard AML"""
        response = auth_session.get(f"{BASE_URL}/api/aml/dashboard")
        assert response.status_code == 200, f"AML dashboard failed: {response.text}"
        data = response.json()
        
        assert "total_alerts" in data or "alerts_by_status" in data
        print(f"✓ AML dashboard loaded")
    
    def test_kyc_dashboard(self, auth_session):
        """GET /api/kyc/dashboard - Dashboard KYC"""
        response = auth_session.get(f"{BASE_URL}/api/kyc/dashboard")
        assert response.status_code == 200, f"KYC dashboard failed: {response.text}"
        data = response.json()
        
        assert "total_processes" in data or "by_status" in data
        print(f"✓ KYC dashboard loaded")
    
    def test_ledger_summary(self, auth_session):
        """GET /api/ledger/summary - Resumen ledger"""
        response = auth_session.get(f"{BASE_URL}/api/ledger/summary")
        assert response.status_code == 200, f"Ledger summary failed: {response.text}"
        data = response.json()
        
        assert "total_entries" in data or "by_type" in data
        print(f"✓ Ledger summary loaded")
    
    def test_reporting_dashboard(self, auth_session):
        """GET /api/reporting/dashboard - Dashboard reportes"""
        response = auth_session.get(f"{BASE_URL}/api/reporting/dashboard")
        assert response.status_code == 200, f"Reporting dashboard failed: {response.text}"
        data = response.json()
        
        assert "total_reports" in data or "by_status" in data
        print(f"✓ Reporting dashboard loaded")


class TestAccountManagement:
    """Test account management endpoints"""
    
    def test_list_accounts(self, auth_session):
        """GET /api/manobank/admin/accounts - List all accounts"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/accounts")
        assert response.status_code == 200, f"List accounts failed: {response.text}"
        data = response.json()
        
        assert "accounts" in data
        print(f"✓ Listed {len(data['accounts'])} accounts")
    
    def test_get_account_detail(self, auth_session):
        """GET /api/manobank/admin/accounts/{id} - Get account detail"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/accounts/{TEST_ACCOUNT_ID}")
        assert response.status_code == 200, f"Get account failed: {response.text}"
        data = response.json()
        
        assert "account" in data
        account = data["account"]
        assert "balance" in account
        assert "iban" in account
        print(f"✓ Account {TEST_ACCOUNT_ID}: Balance €{account['balance']}, IBAN: {account.get('iban', 'N/A')[:10]}...")


class TestCardsManagement:
    """Test cards management endpoints"""
    
    def test_list_cards(self, auth_session):
        """GET /api/manobank/admin/cards - List all cards"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/cards")
        assert response.status_code == 200, f"List cards failed: {response.text}"
        data = response.json()
        
        assert "cards" in data
        print(f"✓ Listed {len(data['cards'])} cards")


class TestLoansManagement:
    """Test loans management endpoints"""
    
    def test_list_loans(self, auth_session):
        """GET /api/manobank/admin/loans - List all loans"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/loans")
        assert response.status_code == 200, f"List loans failed: {response.text}"
        data = response.json()
        
        assert "loans" in data
        print(f"✓ Listed {len(data['loans'])} loans")


class TestEmployeeManagement:
    """Test employee management endpoints"""
    
    def test_list_employees(self, auth_session):
        """GET /api/manobank/admin/employees - List employees"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/employees")
        assert response.status_code == 200, f"List employees failed: {response.text}"
        data = response.json()
        
        assert "employees" in data
        print(f"✓ Listed {len(data['employees'])} employees")


class TestFraudAlerts:
    """Test fraud alerts endpoints"""
    
    def test_list_fraud_alerts(self, auth_session):
        """GET /api/manobank/admin/fraud-alerts - List fraud alerts"""
        response = auth_session.get(f"{BASE_URL}/api/manobank/admin/fraud-alerts")
        assert response.status_code == 200, f"List fraud alerts failed: {response.text}"
        data = response.json()
        
        assert "alerts" in data
        print(f"✓ Listed {len(data['alerts'])} fraud alerts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
