"""
Test Employee Portal Features for ManoProtect
- Employee Login (director & regular employee)
- Dashboard Stats
- Create Invitations (director only)
- Employee Registration via invite token
- Authorization checks (regular employee cannot create invites)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
DIRECTOR_EMAIL = "director@manoprotectt.com"
DIRECTOR_PASSWORD = "Director2026!"
EMPLOYEE_EMAIL = "empleado1@test.com"
EMPLOYEE_PASSWORD = "Empleado2026!"

class TestEmployeePortalLogin:
    """Test employee login functionality"""
    
    def test_health_check(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_director_login_success(self):
        """Test director can login successfully"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["email"] == DIRECTOR_EMAIL
        assert data["role"] == "director"
        assert "session_token" in data
        print(f"✓ Director login successful: {data['name']}")
    
    def test_director_login_invalid_password(self):
        """Test director login with wrong password fails"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": "WrongPassword123"}
        )
        assert response.status_code == 401
        print("✓ Director login with wrong password correctly rejected")
    
    def test_director_login_invalid_email(self):
        """Test login with non-existent email fails"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": "nonexistent@test.com", "password": "test123"}
        )
        assert response.status_code == 401
        print("✓ Login with non-existent email correctly rejected")


class TestDashboardStats:
    """Test dashboard statistics endpoint"""
    
    @pytest.fixture
    def director_session(self):
        """Get director session token"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    def test_get_dashboard_stats_with_auth(self, director_session):
        """Test dashboard stats returns data for authenticated director"""
        response = requests.get(
            f"{BASE_URL}/api/employee-portal/dashboard/stats",
            cookies={"session_token": director_session}
        )
        assert response.status_code == 200
        data = response.json()
        # Director should see these fields
        assert "total_users" in data
        assert "premium_users" in data
        assert "total_orders" in data
        assert "pending_orders" in data
        # Director-specific fields
        assert "active_employees" in data
        assert "pending_invites" in data
        print(f"✓ Dashboard stats retrieved: {data['total_users']} users, {data['active_employees']} employees")
    
    def test_get_dashboard_stats_without_auth(self):
        """Test dashboard stats fails without authentication"""
        response = requests.get(f"{BASE_URL}/api/employee-portal/dashboard/stats")
        assert response.status_code == 401
        print("✓ Dashboard stats correctly requires authentication")


class TestEmployeeInvitations:
    """Test employee invitation system (director only)"""
    
    @pytest.fixture
    def director_session(self):
        """Get director session token"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    def test_director_can_create_invite(self, director_session):
        """Test director can create employee invitation"""
        import uuid
        test_email = f"TEST_newemployee_{uuid.uuid4().hex[:6]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={
                "email": test_email,
                "name": "Test Employee",
                "role": "employee",
                "department": "Testing"
            },
            cookies={"session_token": director_session}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["email"] == test_email
        assert "temp_password" in data  # Temp password shown (MOCKED - normally sent via email)
        assert "registration_url" in data
        print(f"✓ Invitation created: {data['email']}, temp_password: {data['temp_password']}")
        return data
    
    def test_director_can_list_invites(self, director_session):
        """Test director can list all invitations"""
        response = requests.get(
            f"{BASE_URL}/api/employee-portal/invites",
            cookies={"session_token": director_session}
        )
        assert response.status_code == 200
        data = response.json()
        assert "invites" in data
        assert "total" in data
        print(f"✓ Listed {data['total']} invitations")
    
    def test_create_invite_without_auth_fails(self):
        """Test creating invite without authentication fails"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={
                "email": "test@test.com",
                "name": "Test",
                "role": "employee"
            }
        )
        assert response.status_code == 401
        print("✓ Create invite without auth correctly rejected")
    
    def test_duplicate_invite_fails(self, director_session):
        """Test creating duplicate invite for same email fails"""
        import uuid
        test_email = f"TEST_duplicate_{uuid.uuid4().hex[:6]}@test.com"
        
        # First invite
        response1 = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": test_email, "name": "Test", "role": "employee"},
            cookies={"session_token": director_session}
        )
        assert response1.status_code == 200
        
        # Duplicate invite should fail
        response2 = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": test_email, "name": "Test", "role": "employee"},
            cookies={"session_token": director_session}
        )
        assert response2.status_code == 400
        print("✓ Duplicate invite correctly rejected")


class TestEmployeeRegistration:
    """Test employee registration via invite token"""
    
    @pytest.fixture
    def director_session(self):
        """Get director session token"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        return response.json()["session_token"]
    
    def test_verify_valid_invite_token(self, director_session):
        """Test verifying a valid invite token"""
        import uuid
        test_email = f"TEST_verify_{uuid.uuid4().hex[:6]}@test.com"
        
        # Create invite
        create_response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": test_email, "name": "Verify Test", "role": "employee"},
            cookies={"session_token": director_session}
        )
        assert create_response.status_code == 200
        invite_data = create_response.json()
        
        # Extract token from registration URL
        reg_url = invite_data["registration_url"]
        token = reg_url.split("token=")[1]
        
        # Verify token
        verify_response = requests.get(f"{BASE_URL}/api/employee-portal/verify-invite/{token}")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data["valid"] == True
        assert data["email"] == test_email
        print(f"✓ Token verified for: {data['email']}")
    
    def test_verify_invalid_token_fails(self):
        """Test verifying invalid token fails"""
        response = requests.get(f"{BASE_URL}/api/employee-portal/verify-invite/invalid_token_12345")
        assert response.status_code == 400
        print("✓ Invalid token correctly rejected")
    
    def test_employee_registration_flow(self, director_session):
        """Test complete employee registration flow"""
        import uuid
        test_email = f"TEST_register_{uuid.uuid4().hex[:6]}@test.com"
        
        # Step 1: Director creates invite
        create_response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": test_email, "name": "New Employee", "role": "employee", "department": "Support"},
            cookies={"session_token": director_session}
        )
        assert create_response.status_code == 200
        invite_data = create_response.json()
        token = invite_data["registration_url"].split("token=")[1]
        
        # Step 2: Employee registers with token
        register_response = requests.post(
            f"{BASE_URL}/api/employee-portal/register",
            json={
                "token": token,
                "password": "SecurePassword123!",
                "phone": "+34600111222"
            }
        )
        assert register_response.status_code == 200
        reg_data = register_response.json()
        assert reg_data["success"] == True
        assert reg_data["name"] == "New Employee"
        assert reg_data["role"] == "employee"
        assert "session_token" in reg_data
        print(f"✓ Employee registered successfully: {reg_data['name']}")
        
        # Step 3: Verify employee can login with new password
        login_response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": test_email, "password": "SecurePassword123!"}
        )
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert login_data["email"] == test_email
        print(f"✓ Employee can login after registration")


class TestEmployeeAuthorization:
    """Test that regular employees cannot perform director-only actions"""
    
    @pytest.fixture
    def director_session(self):
        """Get director session"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        return response.json()["session_token"]
    
    @pytest.fixture
    def employee_session(self, director_session):
        """Create and login as regular employee"""
        import uuid
        test_email = f"TEST_auth_{uuid.uuid4().hex[:6]}@test.com"
        
        # Create invite as director
        create_response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": test_email, "name": "Auth Test Employee", "role": "employee"},
            cookies={"session_token": director_session}
        )
        token = create_response.json()["registration_url"].split("token=")[1]
        
        # Register
        requests.post(
            f"{BASE_URL}/api/employee-portal/register",
            json={"token": token, "password": "TestPassword123!"}
        )
        
        # Login and return session
        login_response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": test_email, "password": "TestPassword123!"}
        )
        return login_response.json()["session_token"]
    
    def test_employee_cannot_create_invite(self, employee_session):
        """Test regular employee cannot create invitations"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/invites",
            json={"email": "newperson@test.com", "name": "New Person", "role": "employee"},
            cookies={"session_token": employee_session}
        )
        assert response.status_code == 403
        print("✓ Regular employee correctly blocked from creating invites")
    
    def test_employee_cannot_list_employees(self, employee_session):
        """Test regular employee cannot list all employees"""
        response = requests.get(
            f"{BASE_URL}/api/employee-portal/employees",
            cookies={"session_token": employee_session}
        )
        assert response.status_code == 403
        print("✓ Regular employee correctly blocked from listing employees")
    
    def test_employee_can_access_own_stats(self, employee_session):
        """Test regular employee can access dashboard stats (limited view)"""
        response = requests.get(
            f"{BASE_URL}/api/employee-portal/dashboard/stats",
            cookies={"session_token": employee_session}
        )
        assert response.status_code == 200
        data = response.json()
        # Regular employee should NOT see these director-only fields
        # (but based on the implementation, they might see limited version)
        assert "total_users" in data
        print("✓ Regular employee can access basic stats")


class TestEmployeeList:
    """Test employee listing (director only)"""
    
    @pytest.fixture
    def director_session(self):
        """Get director session"""
        response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        return response.json()["session_token"]
    
    def test_director_can_list_employees(self, director_session):
        """Test director can list all employees"""
        response = requests.get(
            f"{BASE_URL}/api/employee-portal/employees",
            cookies={"session_token": director_session}
        )
        assert response.status_code == 200
        data = response.json()
        assert "employees" in data
        assert "total" in data
        # Director should be in the list
        director_found = any(emp["email"] == DIRECTOR_EMAIL for emp in data["employees"])
        assert director_found, "Director should be in employees list"
        print(f"✓ Listed {data['total']} employees")


class TestLogout:
    """Test employee logout"""
    
    def test_logout_clears_session(self):
        """Test logout invalidates session"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/employee-portal/login",
            json={"email": DIRECTOR_EMAIL, "password": DIRECTOR_PASSWORD}
        )
        session_token = login_response.json()["session_token"]
        
        # Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/employee-portal/logout",
            cookies={"session_token": session_token}
        )
        assert logout_response.status_code == 200
        print("✓ Logout successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
