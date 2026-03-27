"""
Iteration 133 - TikTok Promo Codes, Superadmin Login, Escudo Vecinal Dynamic Counter
Tests:
1. Superadmin login with rrhh.milchollos@gmail.com / 19862210De
2. TikTok codes list (50 codes, 50 available)
3. TikTok code validation (TIKTOK-9LWO63)
4. TikTok invalid code validation
5. TikTok code redeem (TIKTOK-7EK3QS)
6. Escudo Vecinal dynamic counter
7. Promo Sentinel S status
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSuperadminLogin:
    """Test superadmin authentication"""
    
    def test_superadmin_login_success(self):
        """POST /api/gestion/auth/login with superadmin credentials should return token with role admin"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "rrhh.milchollos@gmail.com",
            "password": "19862210De"
        })
        print(f"Superadmin login response: {response.status_code} - {response.text[:500]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data or "access_token" in data, f"No token in response: {data}"
        # Check role is admin (API uses 'rol' in Spanish)
        if "user" in data:
            user_role = data["user"].get("role") or data["user"].get("rol")
            assert user_role in ["admin", "superadmin"], f"Expected admin role, got: {user_role}"
        print(f"Superadmin login successful: {data.get('user', {}).get('email')}")

    def test_admin_login_success(self):
        """POST /api/gestion/auth/login with admin credentials should return token"""
        response = requests.post(f"{BASE_URL}/api/gestion/auth/login", json={
            "email": "admin@manoprotectt.com",
            "password": "ManoAdmin2025!"
        })
        print(f"Admin login response: {response.status_code} - {response.text[:500]}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data or "access_token" in data, f"No token in response: {data}"


class TestTikTokCodes:
    """Test TikTok promo codes endpoints"""
    
    def test_get_tiktok_codes_list(self):
        """GET /api/promo/tiktok-codes should return 50 codes"""
        response = requests.get(f"{BASE_URL}/api/promo/tiktok-codes")
        print(f"TikTok codes list response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total" in data, f"No total in response: {data}"
        assert "available" in data, f"No available in response: {data}"
        assert "codes" in data, f"No codes in response: {data}"
        
        print(f"TikTok codes: total={data['total']}, used={data.get('used', 0)}, available={data['available']}")
        assert data["total"] == 50, f"Expected 50 total codes, got {data['total']}"
        # Available should be 50 or close (some may have been used in previous tests)
        assert data["available"] >= 48, f"Expected at least 48 available codes, got {data['available']}"
    
    def test_validate_tiktok_code_valid(self):
        """POST /api/promo/tiktok-codes/validate with valid code should return valid=true"""
        response = requests.post(f"{BASE_URL}/api/promo/tiktok-codes/validate", json={
            "code": "TIKTOK-9LWO63"
        })
        print(f"TikTok validate response: {response.status_code} - {response.text}")
        
        # Code might be valid or already used
        if response.status_code == 200:
            data = response.json()
            assert data.get("valid") == True, f"Expected valid=true, got: {data}"
            print(f"Code TIKTOK-9LWO63 is valid")
        elif response.status_code == 400:
            # Code already used
            print(f"Code TIKTOK-9LWO63 already used (expected in subsequent tests)")
        else:
            assert False, f"Unexpected status {response.status_code}: {response.text}"
    
    def test_validate_tiktok_code_invalid(self):
        """POST /api/promo/tiktok-codes/validate with invalid code should return 404"""
        response = requests.post(f"{BASE_URL}/api/promo/tiktok-codes/validate", json={
            "code": "FAKE-CODE"
        })
        print(f"TikTok invalid code response: {response.status_code} - {response.text}")
        assert response.status_code == 404, f"Expected 404 for invalid code, got {response.status_code}: {response.text}"
    
    def test_redeem_tiktok_code(self):
        """POST /api/promo/tiktok-codes/redeem with valid code should return success"""
        response = requests.post(f"{BASE_URL}/api/promo/tiktok-codes/redeem", json={
            "code": "TIKTOK-7EK3QS",
            "email": "test@test.com"
        })
        print(f"TikTok redeem response: {response.status_code} - {response.text}")
        
        # Code might be valid or already used
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True, f"Expected success=true, got: {data}"
            print(f"Code TIKTOK-7EK3QS redeemed successfully")
        elif response.status_code == 400:
            # Code already used
            print(f"Code TIKTOK-7EK3QS already used (expected in subsequent tests)")
        else:
            assert False, f"Unexpected status {response.status_code}: {response.text}"


class TestEscudoVecinalDynamicCounter:
    """Test Escudo Vecinal dynamic counter endpoint"""
    
    def test_escudo_vecinal_status(self):
        """GET /api/promo/escudo-vecinal/status should return dynamic counter data"""
        response = requests.get(f"{BASE_URL}/api/promo/escudo-vecinal/status")
        print(f"Escudo Vecinal status response: {response.status_code} - {response.text}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required fields
        assert "total" in data, f"No total in response: {data}"
        assert "discount_percent" in data, f"No discount_percent in response: {data}"
        assert "max_neighbors" in data, f"No max_neighbors in response: {data}"
        
        # Verify expected values
        assert data["total"] == 50, f"Expected total=50, got {data['total']}"
        assert data["discount_percent"] == 20, f"Expected discount_percent=20, got {data['discount_percent']}"
        assert data["max_neighbors"] == 10, f"Expected max_neighbors=10, got {data['max_neighbors']}"
        
        print(f"Escudo Vecinal: total={data['total']}, remaining={data.get('remaining')}, discount={data['discount_percent']}%")


class TestPromoSentinelStatus:
    """Test Promo Sentinel S status endpoint"""
    
    def test_sentinel_s_status(self):
        """GET /api/promo/sentinel-s/status should return 93/100 remaining"""
        response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/status")
        print(f"Sentinel S status response: {response.status_code} - {response.text}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total" in data, f"No total in response: {data}"
        assert "remaining" in data, f"No remaining in response: {data}"
        assert "active" in data, f"No active in response: {data}"
        
        assert data["total"] == 100, f"Expected total=100, got {data['total']}"
        # Remaining should be around 93 (7 claimed)
        assert data["remaining"] >= 90, f"Expected remaining >= 90, got {data['remaining']}"
        
        print(f"Sentinel S: total={data['total']}, claimed={data.get('claimed')}, remaining={data['remaining']}")


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check response: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
