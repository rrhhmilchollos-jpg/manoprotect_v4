"""
ManoProtect CEO Dashboard Tests
Tests: Health endpoints, promo-status, CEO authentication, and CEO dashboard CRUD operations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://escudo-preview.preview.emergentagent.com').rstrip('/')

# CEO credentials
CEO_EMAIL = "ceo@manoprotect.com"
CEO_PASSWORD = "19862210Des"


class TestHealthEndpoints:
    """Health check endpoint tests"""

    def test_heartbeat_returns_alive(self):
        """GET /api/heartbeat should return alive:true"""
        response = requests.get(f"{BASE_URL}/api/heartbeat", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("alive") is True
        assert "ts" in data
        print(f"✅ Heartbeat OK - alive:{data['alive']}, ts:{data['ts']}")

    def test_health_returns_healthy(self):
        """GET /api/health should return status:healthy"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("database") == "healthy"
        assert data.get("service") == "manoprotect-api"
        print(f"✅ Health OK - status:{data['status']}, db:{data['database']}")


class TestPromoStatus:
    """Promo status endpoint tests (public - no auth required)"""

    def test_promo_status_returns_stock(self):
        """GET /api/ceo/promo-status should return promo counters"""
        response = requests.get(f"{BASE_URL}/api/ceo/promo-status", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "basic_stock_remaining" in data
        assert "basic_stock_total" in data
        assert "promo_200_remaining" in data
        assert "promo_200_total" in data
        assert "discount_pct" in data
        
        # Verify values are within expected range
        assert 0 <= data["basic_stock_remaining"] <= data["basic_stock_total"]
        assert data["basic_stock_total"] == 50
        assert 0 <= data["promo_200_remaining"] <= data["promo_200_total"]
        assert data["promo_200_total"] == 200
        assert data["discount_pct"] == 20
        
        print(f"✅ Promo Status OK - basic:{data['basic_stock_remaining']}/50, promo:{data['promo_200_remaining']}/200")


class TestCEOAuthentication:
    """CEO authentication tests"""

    def test_ceo_login_success(self, api_client):
        """POST /api/auth/login with CEO credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CEO_EMAIL,
            "password": CEO_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("email") == CEO_EMAIL
        assert data.get("role") == "admin"
        assert "user_id" in data
        print(f"✅ CEO Login OK - email:{data['email']}, role:{data['role']}")

    def test_ceo_login_wrong_password(self, api_client):
        """POST /api/auth/login with wrong password should fail"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CEO_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 403]
        print("✅ Wrong password correctly rejected")


class TestCEODashboard:
    """CEO Dashboard authenticated endpoint tests"""

    def test_ceo_stats(self, authenticated_client):
        """GET /api/ceo/stats should return dashboard stats"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "users" in data
        assert "subscriptions" in data
        assert "orders" in data
        assert "refunds" in data
        assert "promo" in data
        assert "revenue" in data
        assert "messages" in data
        
        # Verify nested structure
        assert "total" in data["users"]
        assert "today" in data["users"]
        assert "this_month" in data["users"]
        assert "active" in data["subscriptions"]
        assert "mrr" in data["revenue"]
        assert "basic_stock_remaining" in data["promo"]
        
        print(f"✅ Stats OK - users:{data['users']['total']}, subs:{data['subscriptions']['active']}, MRR:{data['revenue']['mrr']}")

    def test_ceo_users_list(self, authenticated_client):
        """GET /api/ceo/users should return paginated user list"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/users?page=1")
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert isinstance(data["users"], list)
        print(f"✅ Users list OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_ceo_users_search(self, authenticated_client):
        """GET /api/ceo/users?search=ceo should filter users"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/users?page=1&search=ceo")
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert data["total"] >= 1  # At least CEO user should match
        
        # Verify CEO user is in results
        ceo_found = any(u.get("email") == CEO_EMAIL for u in data["users"])
        assert ceo_found, "CEO user should be in search results"
        print(f"✅ Users search OK - found:{data['total']} matching 'ceo'")

    def test_ceo_subscriptions(self, authenticated_client):
        """GET /api/ceo/subscriptions should return paginated subscriptions"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/subscriptions?page=1")
        assert response.status_code == 200
        data = response.json()
        
        assert "subscriptions" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        print(f"✅ Subscriptions OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_ceo_orders(self, authenticated_client):
        """GET /api/ceo/orders should return paginated orders"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/orders?page=1")
        assert response.status_code == 200
        data = response.json()
        
        assert "orders" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        print(f"✅ Orders OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_ceo_refunds(self, authenticated_client):
        """GET /api/ceo/refunds should return paginated refunds"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/refunds?page=1")
        assert response.status_code == 200
        data = response.json()
        
        assert "refunds" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        print(f"✅ Refunds OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_ceo_messages(self, authenticated_client):
        """GET /api/ceo/messages should return paginated contact messages"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/messages?page=1")
        assert response.status_code == 200
        data = response.json()
        
        assert "messages" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        print(f"✅ Messages OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_ceo_activity(self, authenticated_client):
        """GET /api/ceo/activity should return recent activity"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/activity")
        assert response.status_code == 200
        data = response.json()
        
        assert "activities" in data
        assert isinstance(data["activities"], list)
        print(f"✅ Activity OK - count:{len(data['activities'])}")


class TestUnauthorizedAccess:
    """Test that unauthenticated requests are rejected"""

    def test_ceo_stats_requires_auth(self):
        """GET /api/ceo/stats without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/ceo/stats", timeout=10)
        assert response.status_code in [401, 403]
        print("✅ Stats correctly requires authentication")

    def test_ceo_users_requires_auth(self):
        """GET /api/ceo/users without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/ceo/users", timeout=10)
        assert response.status_code in [401, 403]
        print("✅ Users correctly requires authentication")


# ============================================
# FIXTURES
# ============================================

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def authenticated_client(api_client):
    """Session with CEO authentication (cookies)"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": CEO_EMAIL,
        "password": CEO_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip("CEO authentication failed - skipping authenticated tests")
    return api_client


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
