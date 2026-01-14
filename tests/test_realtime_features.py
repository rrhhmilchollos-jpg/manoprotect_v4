"""
Test suite for MANO Real-Time Features (Iteration 6)
Tests: Push Notifications, Notifications API, Metrics, WhatsApp, API Keys
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "testuser@mano.com"
TEST_PASSWORD = "TestPass123!"

class TestSetup:
    """Setup and authentication tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def auth_session(self, session):
        """Login and return authenticated session"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return session


class TestPushNotifications:
    """Web Push notification API tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return s
    
    def test_get_vapid_public_key(self, auth_session):
        """GET /api/push/vapid-public-key - Should return VAPID public key"""
        response = auth_session.get(f"{BASE_URL}/api/push/vapid-public-key")
        assert response.status_code == 200
        data = response.json()
        assert "public_key" in data
        assert len(data["public_key"]) > 0
        print(f"✓ VAPID public key returned: {data['public_key'][:20]}...")
    
    def test_subscribe_to_push(self, auth_session):
        """POST /api/push/subscribe - Should subscribe to push notifications"""
        response = auth_session.post(f"{BASE_URL}/api/push/subscribe", json={
            "endpoint": "https://test-push-endpoint.example.com/test123",
            "keys": {
                "p256dh": "test_p256dh_key_value",
                "auth": "test_auth_key_value"
            }
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True or "message" in data
        print(f"✓ Push subscription successful: {data}")
    
    def test_subscribe_push_unauthenticated(self):
        """POST /api/push/subscribe - Unauthenticated should return 401"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/push/subscribe", json={
            "endpoint": "https://test.example.com",
            "keys": {"p256dh": "test", "auth": "test"}
        })
        assert response.status_code == 401
        print("✓ Unauthenticated push subscribe returns 401")
    
    def test_unsubscribe_from_push(self, auth_session):
        """DELETE /api/push/unsubscribe - Should unsubscribe from push"""
        response = auth_session.delete(f"{BASE_URL}/api/push/unsubscribe")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Push unsubscribe successful: {data}")


class TestNotifications:
    """Notification center API tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return s
    
    def test_get_notifications(self, auth_session):
        """GET /api/notifications - Should return notifications list"""
        response = auth_session.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert "unread_count" in data
        assert isinstance(data["notifications"], list)
        assert isinstance(data["unread_count"], int)
        print(f"✓ Notifications returned: {len(data['notifications'])} items, {data['unread_count']} unread")
    
    def test_get_notifications_unauthenticated(self):
        """GET /api/notifications - Unauthenticated should return 401"""
        s = requests.Session()
        response = s.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401
        print("✓ Unauthenticated notifications returns 401")
    
    def test_mark_all_notifications_read(self, auth_session):
        """POST /api/notifications/read-all - Should mark all as read"""
        response = auth_session.post(f"{BASE_URL}/api/notifications/read-all")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Mark all read successful: {data}")
    
    def test_get_notification_preferences(self, auth_session):
        """GET /api/notifications/preferences - Should return preferences"""
        response = auth_session.get(f"{BASE_URL}/api/notifications/preferences")
        assert response.status_code == 200
        data = response.json()
        # Should have preference fields
        assert "email_notifications" in data or "push_notifications" in data or len(data) > 0
        print(f"✓ Notification preferences returned: {data}")
    
    def test_update_notification_preferences(self, auth_session):
        """PATCH /api/notifications/preferences - Should update preferences"""
        response = auth_session.patch(f"{BASE_URL}/api/notifications/preferences", json={
            "email_notifications": True,
            "push_notifications": True,
            "threat_alerts": True
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Preferences updated: {data}")


class TestMetrics:
    """Real-time metrics API tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return s
    
    def test_get_dashboard_metrics(self, auth_session):
        """GET /api/metrics/dashboard - Should return comprehensive metrics"""
        response = auth_session.get(f"{BASE_URL}/api/metrics/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "summary" in data
        assert "threat_types" in data
        assert "risk_levels" in data
        assert "last_updated" in data
        
        # Verify summary fields
        summary = data["summary"]
        assert "total_analyzed" in summary
        assert "threats_blocked" in summary
        
        print(f"✓ Dashboard metrics returned: {data['summary']}")
    
    def test_metrics_stream_connection(self, auth_session):
        """GET /api/metrics/stream - Should return SSE stream"""
        # Test that the endpoint responds (SSE connection)
        response = auth_session.get(
            f"{BASE_URL}/api/metrics/stream",
            stream=True,
            timeout=10
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("Content-Type", "")
        
        # Read first chunk
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data:"):
                import json
                data = json.loads(line[5:].strip())
                assert "timestamp" in data
                assert "user_metrics" in data
                assert "global_metrics" in data
                print(f"✓ SSE stream working, received metrics: {data['user_metrics']}")
                break
        
        response.close()


class TestWhatsApp:
    """WhatsApp integration API tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return s
    
    def test_send_whatsapp_message(self, auth_session):
        """POST /api/whatsapp/send - Should queue message (API not configured)"""
        response = auth_session.post(f"{BASE_URL}/api/whatsapp/send", json={
            "phone_number": "+34600000000",
            "message": "Test message from MANO testing"
        })
        assert response.status_code == 200
        data = response.json()
        # Since WhatsApp API is not configured, message should be queued
        assert "message" in data or "queue_id" in data
        print(f"✓ WhatsApp message queued: {data}")
    
    def test_send_whatsapp_unauthenticated(self):
        """POST /api/whatsapp/send - Unauthenticated should return 401"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/whatsapp/send", json={
            "phone_number": "+34600000000",
            "message": "Test"
        })
        assert response.status_code == 401
        print("✓ Unauthenticated WhatsApp send returns 401")
    
    def test_get_whatsapp_queue(self, auth_session):
        """GET /api/whatsapp/queue - Should return message queue"""
        response = auth_session.get(f"{BASE_URL}/api/whatsapp/queue")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ WhatsApp queue returned: {len(data)} messages")
    
    def test_get_whatsapp_queue_unauthenticated(self):
        """GET /api/whatsapp/queue - Unauthenticated should return 401"""
        s = requests.Session()
        response = s.get(f"{BASE_URL}/api/whatsapp/queue")
        assert response.status_code == 401
        print("✓ Unauthenticated WhatsApp queue returns 401")


class TestAPIKeys:
    """API Key management tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return s
    
    def test_list_api_keys(self, auth_session):
        """GET /api/api-keys - Should return list of API keys"""
        response = auth_session.get(f"{BASE_URL}/api/api-keys")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ API keys list returned: {len(data)} keys")
    
    def test_create_api_key(self, auth_session):
        """POST /api/api-keys - Should create new API key"""
        response = auth_session.post(f"{BASE_URL}/api/api-keys", json={
            "name": f"TEST_key_{int(time.time())}",
            "permissions": ["read:threats", "write:analyze"]
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "key" in data
        assert "name" in data
        assert "permissions" in data
        assert data["key"].startswith("mano_pk_")
        
        print(f"✓ API key created: {data['id']}, key: {data['key'][:20]}...")
        
        # Store for cleanup
        return data
    
    def test_create_api_key_unauthenticated(self):
        """POST /api/api-keys - Unauthenticated should return 401"""
        s = requests.Session()
        response = s.post(f"{BASE_URL}/api/api-keys", json={
            "name": "Test Key",
            "permissions": ["read:threats"]
        })
        assert response.status_code == 401
        print("✓ Unauthenticated API key creation returns 401")
    
    def test_revoke_api_key(self, auth_session):
        """DELETE /api/api-keys/{key_id} - Should revoke API key"""
        # First create a key to revoke
        create_response = auth_session.post(f"{BASE_URL}/api/api-keys", json={
            "name": f"TEST_to_revoke_{int(time.time())}",
            "permissions": ["read:threats"]
        })
        assert create_response.status_code == 200
        key_data = create_response.json()
        key_id = key_data["id"]
        
        # Now revoke it
        response = auth_session.delete(f"{BASE_URL}/api/api-keys/{key_id}")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API key revoked: {key_id}")
    
    def test_revoke_nonexistent_key(self, auth_session):
        """DELETE /api/api-keys/{key_id} - Nonexistent key should return 404"""
        response = auth_session.delete(f"{BASE_URL}/api/api-keys/nonexistent_key_id")
        assert response.status_code == 404
        print("✓ Revoking nonexistent key returns 404")


class TestPublicAPI:
    """Public API endpoint tests"""
    
    def test_public_api_status(self):
        """GET /api/v1/analyze/status - Should return API status (no auth)"""
        s = requests.Session()
        response = s.get(f"{BASE_URL}/api/v1/analyze/status")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "operational"
        assert "version" in data
        assert "endpoints" in data
        print(f"✓ Public API status: {data}")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        response = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return s
    
    def test_cleanup_test_api_keys(self, auth_session):
        """Cleanup TEST_ prefixed API keys"""
        response = auth_session.get(f"{BASE_URL}/api/api-keys")
        if response.status_code == 200:
            keys = response.json()
            for key in keys:
                if key.get("name", "").startswith("TEST_"):
                    auth_session.delete(f"{BASE_URL}/api/api-keys/{key['id']}")
                    print(f"  Cleaned up API key: {key['name']}")
        print("✓ Cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
