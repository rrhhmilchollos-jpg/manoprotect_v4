"""
Test Promo Sentinel S TikTok Campaign - Iteration 126
Tests for the promotional campaign giving away 100 Sentinel S watches
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_EMAIL = f"test_promo_{uuid.uuid4().hex[:8]}@example.com"
TEST_EMAIL_DUPLICATE = f"test_dupe_{uuid.uuid4().hex[:8]}@example.com"

class TestPromoStatus:
    """Test GET /api/promo/sentinel-s/status endpoint"""
    
    def test_promo_status_returns_valid_data(self):
        """Status endpoint returns total, remaining, active fields"""
        response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "total" in data
        assert "remaining" in data
        assert "active" in data
        assert "claimed" in data
        assert data["total"] == 100
        assert isinstance(data["remaining"], int)
        assert isinstance(data["active"], bool)
        print(f"PASSED: Status endpoint returns valid data - Remaining: {data['remaining']}/{data['total']}")


class TestPromoCheckout:
    """Test POST /api/promo/sentinel-s/checkout endpoint"""
    
    def test_checkout_monthly_plan_returns_checkout_url(self):
        """Checkout with monthly plan returns valid checkout_url"""
        unique_email = f"test_monthly_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "plan_type": "sentinel-promo-monthly",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": unique_email
        }
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data
        assert "order_id" in data
        assert "gift_code" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        assert data["order_id"].startswith("PROMO-")
        assert data["gift_code"].startswith("SENTINEL-")
        print(f"PASSED: Monthly checkout returns valid URL - Order: {data['order_id']}")
        return data
    
    def test_checkout_yearly_plan_returns_checkout_url(self):
        """Checkout with yearly plan returns valid checkout_url"""
        unique_email = f"test_yearly_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "plan_type": "sentinel-promo-yearly",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": unique_email
        }
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data
        assert data["checkout_url"].startswith("https://checkout.stripe.com")
        print(f"PASSED: Yearly checkout returns valid URL - Order: {data['order_id']}")
        return data
    
    def test_checkout_invalid_plan_returns_400(self):
        """Checkout with invalid plan type returns 400 error"""
        payload = {
            "plan_type": "invalid-plan-type",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": "test@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"PASSED: Invalid plan returns 400 - Detail: {data['detail']}")
    
    def test_checkout_duplicate_email_returns_409(self):
        """Checkout with same email twice returns 409 conflict"""
        # First checkout - should succeed
        payload = {
            "plan_type": "sentinel-promo-monthly",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": TEST_EMAIL_DUPLICATE
        }
        response1 = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        assert response1.status_code == 200
        
        # Second checkout with same email - should fail with 409
        response2 = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        assert response2.status_code == 409
        data = response2.json()
        assert "detail" in data
        print(f"PASSED: Duplicate email returns 409 - Detail: {data['detail']}")


class TestPromoOrderAndShipping:
    """Test order retrieval, confirmation and shipping endpoints"""
    
    @pytest.fixture
    def created_order(self):
        """Create an order for testing"""
        unique_email = f"test_order_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "plan_type": "sentinel-promo-monthly",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": unique_email
        }
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=payload)
        assert response.status_code == 200
        return response.json()
    
    def test_get_order_by_id(self, created_order):
        """GET /api/promo/sentinel-s/order/{order_id} returns order details"""
        order_id = created_order["order_id"]
        response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/order/{order_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["order_id"] == order_id
        assert "plan_type" in data
        assert "status" in data
        print(f"PASSED: Get order returns valid data - Status: {data['status']}")
    
    def test_confirm_order(self, created_order):
        """POST /api/promo/sentinel-s/confirm/{order_id} confirms the order"""
        order_id = created_order["order_id"]
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/confirm/{order_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["order_id"] == order_id
        print(f"PASSED: Order confirmed - Message: {data['message']}")
    
    def test_shipping_form_saves_address(self, created_order):
        """POST /api/promo/sentinel-s/shipping saves shipping address after confirmation"""
        order_id = created_order["order_id"]
        
        # First confirm the order
        confirm_response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/confirm/{order_id}")
        assert confirm_response.status_code == 200
        
        # Then submit shipping
        shipping_payload = {
            "order_id": order_id,
            "nombre_completo": "Test User",
            "telefono": "+34600123456",
            "direccion": "Calle Test 123",
            "codigo_postal": "28001",
            "ciudad": "Madrid",
            "provincia": "Madrid",
            "pais": "España",
            "notas": "Test notes"
        }
        response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/shipping", json=shipping_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["order_id"] == order_id
        print(f"PASSED: Shipping saved - Message: {data['message']}")
        
        # Verify shipping was saved by getting order again
        get_response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/order/{order_id}")
        order_data = get_response.json()
        assert order_data["shipping"] is not None
        assert order_data["shipping"]["nombre_completo"] == "Test User"
        assert order_data["status"] == "pending_shipping"
        print(f"PASSED: Shipping data persisted - Status updated to: {order_data['status']}")


class TestPromoAdminEndpoints:
    """Test admin endpoints for promo orders"""
    
    def test_admin_orders_list_returns_orders_and_stats(self):
        """GET /api/promo/sentinel-s/admin/orders returns orders list and stats"""
        response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/admin/orders")
        
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert "stats" in data
        assert isinstance(data["orders"], list)
        assert "total_orders" in data["stats"]
        assert "paid" in data["stats"]
        assert "remaining" in data["stats"]
        print(f"PASSED: Admin orders returns list - Total: {data['stats']['total_orders']}, Remaining: {data['stats']['remaining']}")
    
    def test_admin_tracking_update(self):
        """PUT /api/promo/sentinel-s/admin/orders/{order_id}/tracking updates tracking info"""
        # First create and confirm an order with shipping
        unique_email = f"test_tracking_{uuid.uuid4().hex[:8]}@example.com"
        checkout_payload = {
            "plan_type": "sentinel-promo-monthly",
            "origin_url": "https://auth-hardened-test.preview.emergentagent.com",
            "email": unique_email
        }
        checkout_response = requests.post(f"{BASE_URL}/api/promo/sentinel-s/checkout", json=checkout_payload)
        assert checkout_response.status_code == 200
        order_id = checkout_response.json()["order_id"]
        
        # Confirm the order
        requests.post(f"{BASE_URL}/api/promo/sentinel-s/confirm/{order_id}")
        
        # Add shipping
        shipping_payload = {
            "order_id": order_id,
            "nombre_completo": "Tracking Test User",
            "telefono": "+34600111222",
            "direccion": "Calle Tracking 456",
            "codigo_postal": "08001",
            "ciudad": "Barcelona",
            "provincia": "Barcelona"
        }
        requests.post(f"{BASE_URL}/api/promo/sentinel-s/shipping", json=shipping_payload)
        
        # Now update tracking
        tracking_payload = {
            "tracking_number": "TRACK123456789",
            "carrier": "Correos",
            "status": "enviado"
        }
        response = requests.put(f"{BASE_URL}/api/promo/sentinel-s/admin/orders/{order_id}/tracking", json=tracking_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "shipped"
        print(f"PASSED: Tracking updated - Status: {data['status']}")
        
        # Verify tracking was saved
        get_response = requests.get(f"{BASE_URL}/api/promo/sentinel-s/order/{order_id}")
        order_data = get_response.json()
        assert order_data["tracking"] is not None
        assert order_data["tracking"]["tracking_number"] == "TRACK123456789"
        print(f"PASSED: Tracking data persisted - Number: {order_data['tracking']['tracking_number']}")


class TestServiceWorkerV5:
    """Test service worker version 5 with SPA App Shell Pattern"""
    
    def test_sw_returns_version_5(self):
        """GET /sw.js returns version 5.0"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        assert "Version 5.0" in content or "CACHE_VERSION = 'v5'" in content
        print("PASSED: Service worker version 5.0 verified")
    
    def test_sw_has_spa_app_shell_pattern(self):
        """sw.js contains SPA app-shell pattern"""
        response = requests.get(f"{BASE_URL}/sw.js")
        assert response.status_code == 200
        content = response.text
        assert "SPA App Shell Pattern" in content or "app shell" in content.lower()
        assert "/index.html" in content
        print("PASSED: SPA App Shell Pattern found in service worker")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
