"""
ManoBank Admin Portal - Backend API Tests
Tests for employee login, dashboard, and admin features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://neofinancia.preview.emergentagent.com')

# Test credentials for bank employee (superadmin/director)
EMPLOYEE_EMAIL = "rrhh.milchollos@gmail.com"
EMPLOYEE_PASSWORD = "ManoAdmin2025!"


class TestEmployeeLogin:
    """Test employee authentication flow"""
    
    def test_login_success(self):
        """Test successful login with employee credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user_id" in data or "email" in data, "Response should contain user data"
        print(f"✓ Login successful for {EMPLOYEE_EMAIL}")
        return response.cookies
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")


class TestAdminDashboard:
    """Test admin dashboard endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.cookies = response.cookies
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
    
    def test_dashboard_access(self):
        """Test dashboard access for authenticated employee"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        assert response.status_code == 200, f"Dashboard access failed: {response.text}"
        data = response.json()
        
        # Verify dashboard structure
        assert "employee" in data, "Dashboard should contain employee info"
        assert "stats" in data, "Dashboard should contain stats"
        assert "pending" in data, "Dashboard should contain pending items"
        assert "loans" in data, "Dashboard should contain loans info"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_customers" in stats, "Stats should have total_customers"
        assert "total_accounts" in stats, "Stats should have total_accounts"
        assert "total_employees" in stats, "Stats should have total_employees"
        assert "total_deposits" in stats, "Stats should have total_deposits"
        assert "loans_volume" in stats, "Stats should have loans_volume"
        
        print(f"✓ Dashboard loaded - Customers: {stats['total_customers']}, Accounts: {stats['total_accounts']}")
        print(f"  Employee: {data['employee']['name']} ({data['employee']['role']})")
    
    def test_dashboard_unauthorized(self):
        """Test dashboard access without authentication"""
        response = requests.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized access correctly rejected")


class TestEmployeesManagement:
    """Test employees management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        self.session = requests.Session()
        self.session.cookies.update(response.cookies)
    
    def test_get_employees(self):
        """Test listing employees"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/employees")
        assert response.status_code == 200, f"Get employees failed: {response.text}"
        data = response.json()
        assert "employees" in data, "Response should contain employees list"
        print(f"✓ Employees list retrieved - Count: {len(data['employees'])}")


class TestAccountRequests:
    """Test account opening requests endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        self.session = requests.Session()
        self.session.cookies.update(response.cookies)
    
    def test_get_account_requests(self):
        """Test listing account requests"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/account-requests")
        assert response.status_code == 200, f"Get account requests failed: {response.text}"
        data = response.json()
        assert "requests" in data, "Response should contain requests list"
        print(f"✓ Account requests retrieved - Count: {len(data['requests'])}")


class TestCustomers:
    """Test customers management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        self.session = requests.Session()
        self.session.cookies.update(response.cookies)
    
    def test_get_customers(self):
        """Test listing customers"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/customers")
        assert response.status_code == 200, f"Get customers failed: {response.text}"
        data = response.json()
        assert "customers" in data, "Response should contain customers list"
        print(f"✓ Customers list retrieved - Count: {len(data['customers'])}")
    
    def test_search_customers(self):
        """Test customer search"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/customers?search=test")
        assert response.status_code == 200, f"Customer search failed: {response.text}"
        data = response.json()
        assert "customers" in data, "Response should contain customers list"
        print(f"✓ Customer search works - Results: {len(data['customers'])}")


class TestLoans:
    """Test loans management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        self.session = requests.Session()
        self.session.cookies.update(response.cookies)
    
    def test_get_loans(self):
        """Test listing loans"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/loans")
        assert response.status_code == 200, f"Get loans failed: {response.text}"
        data = response.json()
        assert "loans" in data, "Response should contain loans list"
        print(f"✓ Loans list retrieved - Count: {len(data['loans'])}")


class TestCards:
    """Test cards management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookie"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        self.session = requests.Session()
        self.session.cookies.update(response.cookies)
    
    def test_get_cards(self):
        """Test listing cards"""
        response = self.session.get(f"{BASE_URL}/api/manobank/admin/cards")
        assert response.status_code == 200, f"Get cards failed: {response.text}"
        data = response.json()
        assert "cards" in data, "Response should contain cards list"
        print(f"✓ Cards list retrieved - Count: {len(data['cards'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
