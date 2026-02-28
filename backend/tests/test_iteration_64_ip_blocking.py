"""
Iteration 64 - IP Blocking System and New Features Tests
Tests:
- IP blocking/unblocking system for CEO dashboard
- Security overview with blocked_ips_count
- Mobile config files verification (AndroidManifest.xml, Info.plist)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CEO_EMAIL = "ceo@manoprotect.com"
CEO_PASSWORD = "19862210Des"
TEST_IP = "1.2.3.4"

class TestIPBlockingSystem:
    """Tests for IP blocking/unblocking system"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create authenticated session for CEO"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        # Login as CEO
        login_response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": CEO_EMAIL,
            "password": CEO_PASSWORD
        })
        assert login_response.status_code == 200, f"CEO login failed: {login_response.text}"
        return s
    
    def test_01_ceo_login(self, session):
        """Test CEO login works and has admin role"""
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data.get("role") in ["admin", "superadmin"], f"Expected admin role, got {data.get('role')}"
        print(f"✅ CEO login successful: {data.get('email')} with role {data.get('role')}")
    
    def test_02_block_ip(self, session):
        """Test POST /api/ceo/block-ip blocks an IP"""
        response = session.post(f"{BASE_URL}/api/ceo/block-ip", json={
            "ip": TEST_IP,
            "reason": "Test blocking from iteration 64"
        })
        assert response.status_code == 200, f"Block IP failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "bloqueada" in data.get("message", "").lower() or "blocked" in data.get("message", "").lower()
        print(f"✅ IP {TEST_IP} blocked successfully: {data.get('message')}")
    
    def test_03_get_blocked_ips(self, session):
        """Test GET /api/ceo/blocked-ips returns list including test IP"""
        response = session.get(f"{BASE_URL}/api/ceo/blocked-ips")
        assert response.status_code == 200, f"Get blocked IPs failed: {response.text}"
        data = response.json()
        assert "blocked_ips" in data
        blocked_ips = data["blocked_ips"]
        assert isinstance(blocked_ips, list)
        
        # Check if test IP is in the list
        test_ip_found = any(ip.get("ip") == TEST_IP and ip.get("active") == True for ip in blocked_ips)
        assert test_ip_found, f"Test IP {TEST_IP} not found in blocked list"
        print(f"✅ Blocked IPs list returned {len(blocked_ips)} IPs, test IP {TEST_IP} found")
    
    def test_04_security_overview_blocked_count(self, session):
        """Test GET /api/ceo/security-overview includes blocked_ips_count"""
        response = session.get(f"{BASE_URL}/api/ceo/security-overview")
        assert response.status_code == 200, f"Security overview failed: {response.text}"
        data = response.json()
        
        # Verify blocked_ips_count field exists
        assert "blocked_ips_count" in data, "blocked_ips_count field missing from security overview"
        assert isinstance(data["blocked_ips_count"], int)
        assert data["blocked_ips_count"] >= 1, "Expected at least 1 blocked IP"
        print(f"✅ Security overview shows {data['blocked_ips_count']} blocked IPs")
    
    def test_05_unblock_ip(self, session):
        """Test POST /api/ceo/unblock-ip unblocks the IP"""
        response = session.post(f"{BASE_URL}/api/ceo/unblock-ip", json={
            "ip": TEST_IP
        })
        assert response.status_code == 200, f"Unblock IP failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "desbloqueada" in data.get("message", "").lower() or "unblocked" in data.get("message", "").lower()
        print(f"✅ IP {TEST_IP} unblocked successfully: {data.get('message')}")
    
    def test_06_verify_unblocked(self, session):
        """Verify the IP is now marked as inactive in blocked list"""
        response = session.get(f"{BASE_URL}/api/ceo/blocked-ips")
        assert response.status_code == 200
        data = response.json()
        blocked_ips = data.get("blocked_ips", [])
        
        # Check if test IP is now inactive or removed
        test_ip_entry = next((ip for ip in blocked_ips if ip.get("ip") == TEST_IP), None)
        if test_ip_entry:
            assert test_ip_entry.get("active") == False, f"IP {TEST_IP} should be inactive after unblocking"
            print(f"✅ IP {TEST_IP} is now marked as inactive")
        else:
            print(f"✅ IP {TEST_IP} was removed from blocked list")


class TestMobileConfigFiles:
    """Verify mobile config files have correct permissions"""
    
    def test_android_manifest_background_location(self):
        """Verify AndroidManifest.xml has ACCESS_BACKGROUND_LOCATION permission"""
        manifest_path = "/app/mobile/android/AndroidManifest.xml"
        assert os.path.exists(manifest_path), "AndroidManifest.xml not found"
        
        with open(manifest_path, 'r') as f:
            content = f.read()
        
        assert "ACCESS_BACKGROUND_LOCATION" in content, "ACCESS_BACKGROUND_LOCATION permission missing"
        assert "ACCESS_FINE_LOCATION" in content, "ACCESS_FINE_LOCATION permission missing"
        assert "ACCESS_COARSE_LOCATION" in content, "ACCESS_COARSE_LOCATION permission missing"
        assert "FOREGROUND_SERVICE_LOCATION" in content, "FOREGROUND_SERVICE_LOCATION permission missing"
        print("✅ AndroidManifest.xml has all required location permissions")
    
    def test_ios_plist_background_modes(self):
        """Verify Info.plist has Background Modes for location"""
        plist_path = "/app/mobile/ios/Info.plist"
        assert os.path.exists(plist_path), "Info.plist not found"
        
        with open(plist_path, 'r') as f:
            content = f.read()
        
        assert "UIBackgroundModes" in content, "UIBackgroundModes key missing"
        assert "<string>location</string>" in content, "location background mode missing"
        assert "NSLocationAlwaysAndWhenInUseUsageDescription" in content, "Location always permission description missing"
        print("✅ Info.plist has Background Modes with location enabled")


class TestHealthAndBasicAPIs:
    """Basic API health checks"""
    
    def test_heartbeat(self):
        """Test /api/heartbeat returns alive:true"""
        response = requests.get(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200
        data = response.json()
        assert data.get("alive") == True
        print("✅ Heartbeat OK")
    
    def test_health_check(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "degraded"]
        print(f"✅ Health check: {data.get('status')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
