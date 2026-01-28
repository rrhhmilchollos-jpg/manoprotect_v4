"""
ManoBank - Iteration 17 Backend Tests
Testing: Auth, Dashboard, Compliance, and Loans endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://manobank.preview.emergentagent.com')

# Test credentials
DIRECTOR_EMAIL = "rrhh.milchollos@gmail.com"
DIRECTOR_PASSWORD = "19862210Des"


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a session for all tests in this class"""
        return requests.Session()
    
    def test_login_success(self, session):
        """Test successful login with Director credentials"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "user_id" in data
        assert data["email"] == DIRECTOR_EMAIL
        assert data["role"] == "director"
        assert "name" in data
        print(f"✅ Login successful - User: {data['name']}, Role: {data['role']}")
    
    def test_login_invalid_credentials(self, session):
        """Test login with invalid credentials returns 401"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpass"}
        )
        
        assert response.status_code == 401
        print("✅ Invalid credentials correctly rejected with 401")
    
    def test_login_missing_password(self, session):
        """Test login with missing password"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL}
        )
        
        assert response.status_code == 422  # Validation error
        print("✅ Missing password correctly rejected with 422")


class TestDashboardEndpoints:
    """Dashboard endpoint tests - requires authentication"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping dashboard tests")
        return session
    
    def test_dashboard_authenticated(self, authenticated_session):
        """Test dashboard returns data for authenticated user"""
        response = authenticated_session.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        
        data = response.json()
        
        # Verify employee info
        assert "employee" in data
        assert data["employee"]["email"] == DIRECTOR_EMAIL
        assert data["employee"]["role"] == "director"
        
        # Verify stats structure
        assert "stats" in data
        assert "total_customers" in data["stats"]
        assert "total_accounts" in data["stats"]
        assert "total_employees" in data["stats"]
        
        # Verify pending items
        assert "pending" in data
        assert "account_requests" in data["pending"]
        assert "loan_applications" in data["pending"]
        
        # Verify loans info
        assert "loans" in data
        assert "total" in data["loans"]
        
        print(f"✅ Dashboard loaded - Customers: {data['stats']['total_customers']}, Accounts: {data['stats']['total_accounts']}")
    
    def test_dashboard_unauthenticated(self):
        """Test dashboard returns 401/403 without authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/manobank/admin/dashboard")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Dashboard correctly requires authentication")


class TestComplianceEndpoints:
    """Compliance endpoint tests - requires admin authentication"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping compliance tests")
        return session
    
    def test_compliance_summary(self, authenticated_session):
        """Test compliance summary endpoint"""
        response = authenticated_session.get(f"{BASE_URL}/api/compliance/summary")
        
        assert response.status_code == 200, f"Compliance summary failed: {response.text}"
        
        data = response.json()
        
        # Verify entity info
        assert "entity" in data
        assert data["entity"]["name"] == "ManoBank S.A."
        assert data["entity"]["cif"] == "B19427723"
        assert data["entity"]["regulator"] == "Banco de España"
        
        # Verify stats
        assert "stats" in data
        assert "total_audit_events" in data["stats"]
        assert "events_today" in data["stats"]
        assert "high_risk_events" in data["stats"]
        
        # Verify timestamp
        assert "generated_at" in data
        
        print(f"✅ Compliance summary loaded - Entity: {data['entity']['name']}, Audit events: {data['stats']['total_audit_events']}")
    
    def test_compliance_policies(self, authenticated_session):
        """Test compliance policies list endpoint"""
        response = authenticated_session.get(f"{BASE_URL}/api/compliance/policies")
        
        assert response.status_code == 200, f"Compliance policies failed: {response.text}"
        
        data = response.json()
        
        # Verify policies structure
        assert "policies" in data
        assert isinstance(data["policies"], list)
        assert len(data["policies"]) > 0
        
        # Verify policy structure
        policy = data["policies"][0]
        assert "name" in policy
        assert "filename" in policy
        assert "path" in policy
        
        # Check for expected policies
        policy_names = [p["name"].lower() for p in data["policies"]]
        assert any("kyc" in name for name in policy_names), "KYC policy not found"
        assert any("aml" in name for name in policy_names), "AML policy not found"
        
        print(f"✅ Compliance policies loaded - {len(data['policies'])} policies found")
    
    def test_compliance_summary_unauthenticated(self):
        """Test compliance summary returns 401/403 without authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/compliance/summary")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Compliance summary correctly requires authentication")


class TestLoansEndpoints:
    """Loans endpoint tests - requires authentication"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping loans tests")
        return session
    
    def test_loans_list(self, authenticated_session):
        """Test loans list endpoint"""
        response = authenticated_session.get(f"{BASE_URL}/api/manobank/admin/loans")
        
        assert response.status_code == 200, f"Loans list failed: {response.text}"
        
        data = response.json()
        
        # Verify loans structure
        assert "loans" in data
        assert isinstance(data["loans"], list)
        
        # If there are loans, verify structure
        if len(data["loans"]) > 0:
            loan = data["loans"][0]
            assert "id" in loan
            assert "customer_id" in loan
            assert "loan_type" in loan
            assert "amount" in loan
            assert "status" in loan
            print(f"✅ Loans list loaded - {len(data['loans'])} loans found, First loan: {loan['loan_type']} - €{loan['amount']}")
        else:
            print("✅ Loans list loaded - No loans found")
    
    def test_loans_list_unauthenticated(self):
        """Test loans list returns 401/403 without authentication"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/manobank/admin/loans")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Loans list correctly requires authentication")


class TestEmployeesEndpoints:
    """Employees endpoint tests - requires director authentication"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping employees tests")
        return session
    
    def test_employees_list(self, authenticated_session):
        """Test employees list endpoint"""
        response = authenticated_session.get(f"{BASE_URL}/api/manobank/admin/employees")
        
        assert response.status_code == 200, f"Employees list failed: {response.text}"
        
        data = response.json()
        
        # Verify employees structure
        assert "employees" in data
        assert isinstance(data["employees"], list)
        
        print(f"✅ Employees list loaded - {len(data['employees'])} employees found")


class Test2FAEndpoints:
    """2FA endpoint tests"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create authenticated session and get user_id"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping 2FA tests")
        user_data = response.json()
        return session, user_data
    
    def test_2fa_send_code(self, authenticated_session):
        """Test 2FA send code endpoint"""
        session, user_data = authenticated_session
        
        response = session.post(
            f"{BASE_URL}/api/auth/2fa/send-code",
            json={
                "user_id": user_data["user_id"],
                "phone": "+34601510950"
            }
        )
        
        assert response.status_code == 200, f"2FA send code failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "expires_in_minutes" in data
        
        # Note: debug_code may not be present if Twilio is configured
        print(f"✅ 2FA code sent - Expires in {data['expires_in_minutes']} minutes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
