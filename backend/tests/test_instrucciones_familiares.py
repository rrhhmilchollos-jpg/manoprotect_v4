"""
Test suite for InstruccionesFamiliares feature and Registration Error Handling
Tests the new /instrucciones-familiares page and improved error messages from /api/auth/register
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRegistrationErrorHandling:
    """Test registration API error responses"""
    
    def test_register_short_password_returns_specific_error(self):
        """Test that short password returns specific error message"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test_short_pw@test.com",
            "name": "Test User",
            "password": "123"
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        
        # Check that error contains password length message
        assert "detail" in data
        error_messages = str(data["detail"])
        assert "8 caracteres" in error_messages or "8 characters" in error_messages
        print(f"✅ Short password error: {data['detail']}")
    
    def test_register_duplicate_email_returns_specific_error(self):
        """Test that duplicate email returns specific error message"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "mrisolaz130@gmail.com",  # Existing email
            "name": "Test User",
            "password": "Xk9#mPq2vL!nR"  # Strong password to pass validation
        })
        
        assert response.status_code == 400  # Bad request for duplicate
        data = response.json()
        
        # Check that error contains duplicate email message
        assert "detail" in data
        detail_str = str(data["detail"])
        assert "ya está registrado" in detail_str or "already" in detail_str.lower()
        print(f"✅ Duplicate email error: {data['detail']}")
    
    def test_register_missing_fields_returns_validation_error(self):
        """Test that missing fields return validation errors"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@test.com"
            # Missing name and password
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data
        print(f"✅ Missing fields error: {data['detail']}")


class TestLoginAPI:
    """Test login API functionality"""
    
    def test_login_with_valid_credentials(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "mrisolaz130@gmail.com",
            "password": "19862210Des!"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == "mrisolaz130@gmail.com"
        print(f"✅ Login successful for user: {data['email']}")
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials returns error"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✅ Invalid login error: {data['detail']}")


class TestInstruccionesFamiliaresPage:
    """Test that the instrucciones-familiares page is accessible"""
    
    def test_page_is_accessible(self):
        """Test that the page loads (returns 200)"""
        # This tests the frontend route - should return HTML
        response = requests.get(f"{BASE_URL}/instrucciones-familiares")
        
        # Frontend routes return 200 with HTML
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        print("✅ /instrucciones-familiares page is accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
