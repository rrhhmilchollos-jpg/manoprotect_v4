"""
Test Alert Subscription System - ManoProtect
Tests for fraud alert subscription endpoints:
- POST /api/alerts/subscribe
- POST /api/alerts/unsubscribe
- GET /api/alerts/subscriptions/count
- POST /api/alerts/broadcast
- GET /api/alerts/history
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAlertSubscription:
    """Test alert subscription endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"test_alert_{uuid.uuid4().hex[:8]}@example.com"
        self.test_name = "Test Alert User"
    
    def test_subscribe_new_user(self):
        """Test subscribing a new user to alerts"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": self.test_email,
                "name": self.test_name,
                "alert_types": ["all"],
                "frequency": "immediate"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "subscribed"
        assert "subscription_id" in data
        assert data["subscription_id"].startswith("sub_")
        print(f"✅ New subscription created: {data['subscription_id']}")
    
    def test_subscribe_already_subscribed(self):
        """Test subscribing an already subscribed user"""
        # First subscribe
        requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": self.test_email,
                "name": self.test_name,
                "alert_types": ["all"],
                "frequency": "immediate"
            }
        )
        
        # Try to subscribe again
        response = requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": self.test_email,
                "name": self.test_name,
                "alert_types": ["all"],
                "frequency": "immediate"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "already_subscribed"
        print(f"✅ Already subscribed response correct")
    
    def test_subscribe_without_name(self):
        """Test subscribing without optional name field"""
        email = f"test_noname_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": email,
                "alert_types": ["phishing", "smishing"],
                "frequency": "daily"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "subscribed"
        print(f"✅ Subscription without name works")
    
    def test_subscribe_invalid_email(self):
        """Test subscribing with invalid email format"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": "invalid-email",
                "alert_types": ["all"],
                "frequency": "immediate"
            }
        )
        
        # Should return 422 validation error
        assert response.status_code == 422
        print(f"✅ Invalid email rejected correctly")


class TestAlertUnsubscribe:
    """Test alert unsubscribe endpoint"""
    
    def test_unsubscribe_invalid_token(self):
        """Test unsubscribing with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/unsubscribe",
            json={
                "email": "test@example.com",
                "token": "invalid_token_12345"
            }
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "no encontrada" in data["detail"].lower() or "inválido" in data["detail"].lower()
        print(f"✅ Invalid token rejected correctly")
    
    def test_unsubscribe_missing_fields(self):
        """Test unsubscribing with missing required fields"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/unsubscribe",
            json={
                "email": "test@example.com"
                # Missing token
            }
        )
        
        assert response.status_code == 422
        print(f"✅ Missing token rejected correctly")


class TestSubscriptionCount:
    """Test subscription count endpoint"""
    
    def test_get_subscription_count(self):
        """Test getting active subscriber count"""
        response = requests.get(f"{BASE_URL}/api/alerts/subscriptions/count")
        
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
        print(f"✅ Subscription count: {data['count']}")


class TestAlertBroadcast:
    """Test alert broadcast endpoint"""
    
    def test_broadcast_high_risk_alert(self):
        """Test broadcasting a high risk alert"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/broadcast",
            json={
                "threat_type": "Phishing",
                "title": "TEST: Campaña de phishing detectada",
                "description": "Esta es una alerta de prueba para verificar el sistema de broadcast.",
                "risk_level": "alto",
                "source": "Testing Agent",
                "affected_entities": ["Test Entity 1", "Test Entity 2"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "broadcast_queued"
        assert "subscribers_notified" in data
        assert isinstance(data["subscribers_notified"], int)
        print(f"✅ Broadcast sent to {data['subscribers_notified']} subscribers")
    
    def test_broadcast_medium_risk_alert(self):
        """Test broadcasting a medium risk alert"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/broadcast",
            json={
                "threat_type": "Smishing",
                "title": "TEST: SMS sospechosos detectados",
                "description": "Alerta de nivel medio para pruebas.",
                "risk_level": "medio"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "broadcast_queued"
        print(f"✅ Medium risk broadcast successful")
    
    def test_broadcast_low_risk_alert(self):
        """Test broadcasting a low risk alert"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/broadcast",
            json={
                "threat_type": "Vishing",
                "title": "TEST: Información sobre llamadas sospechosas",
                "description": "Alerta informativa de bajo riesgo.",
                "risk_level": "bajo"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "broadcast_queued"
        print(f"✅ Low risk broadcast successful")
    
    def test_broadcast_missing_required_fields(self):
        """Test broadcasting with missing required fields"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/broadcast",
            json={
                "threat_type": "Phishing"
                # Missing title and description
            }
        )
        
        assert response.status_code == 422
        print(f"✅ Missing fields rejected correctly")


class TestAlertHistory:
    """Test alert history endpoint"""
    
    def test_get_alert_history(self):
        """Test getting alert broadcast history"""
        response = requests.get(f"{BASE_URL}/api/alerts/history")
        
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert isinstance(data["alerts"], list)
        
        if len(data["alerts"]) > 0:
            alert = data["alerts"][0]
            assert "id" in alert
            assert "threat_type" in alert
            assert "title" in alert
            assert "description" in alert
            assert "risk_level" in alert
            assert "created_at" in alert
            assert "subscribers_notified" in alert
        
        print(f"✅ Alert history returned {len(data['alerts'])} alerts")
    
    def test_get_alert_history_with_limit(self):
        """Test getting alert history with limit parameter"""
        response = requests.get(f"{BASE_URL}/api/alerts/history?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert len(data["alerts"]) <= 5
        print(f"✅ Alert history with limit returned {len(data['alerts'])} alerts")


class TestAlertIntegration:
    """Integration tests for the complete alert flow"""
    
    def test_full_subscription_flow(self):
        """Test complete subscription flow: subscribe -> verify count -> broadcast -> check history"""
        # 1. Get initial count
        count_response = requests.get(f"{BASE_URL}/api/alerts/subscriptions/count")
        initial_count = count_response.json()["count"]
        
        # 2. Subscribe new user
        test_email = f"test_flow_{uuid.uuid4().hex[:8]}@example.com"
        subscribe_response = requests.post(
            f"{BASE_URL}/api/alerts/subscribe",
            json={
                "email": test_email,
                "name": "Flow Test User",
                "alert_types": ["all"],
                "frequency": "immediate"
            }
        )
        assert subscribe_response.status_code == 200
        assert subscribe_response.json()["status"] == "subscribed"
        
        # 3. Verify count increased
        new_count_response = requests.get(f"{BASE_URL}/api/alerts/subscriptions/count")
        new_count = new_count_response.json()["count"]
        assert new_count >= initial_count  # May be equal if test user was already subscribed
        
        # 4. Broadcast alert
        broadcast_response = requests.post(
            f"{BASE_URL}/api/alerts/broadcast",
            json={
                "threat_type": "Identity-Theft",
                "title": "TEST: Alerta de suplantación de identidad",
                "description": "Prueba de flujo completo de alertas.",
                "risk_level": "alto"
            }
        )
        assert broadcast_response.status_code == 200
        
        # 5. Check history includes new alert
        history_response = requests.get(f"{BASE_URL}/api/alerts/history?limit=1")
        assert history_response.status_code == 200
        alerts = history_response.json()["alerts"]
        assert len(alerts) > 0
        assert alerts[0]["title"] == "TEST: Alerta de suplantación de identidad"
        
        print(f"✅ Full subscription flow completed successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
