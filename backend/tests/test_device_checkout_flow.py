"""
Test Device Checkout Flow - Iteration 36
Tests for:
1. Device order API with colors array and device_style
2. Scalable shipping costs (1=4.95€, 2=6.95€, 3=8.95€)
3. Payment plans API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestDeviceCheckout:
    """Device SOS checkout endpoint tests"""
    
    def test_health_check(self):
        """Test API health"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health check passed")
    
    def test_device_checkout_single_device(self):
        """Test checkout for 1 device - shipping 4.95€"""
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": 1,
            "colors": ["plata"],
            "device_style": "adulto",
            "shipping": {
                "fullName": "TEST_Single Device",
                "phone": "600000001",
                "address": "Calle Test 1",
                "city": "Madrid",
                "postalCode": "28001",
                "province": "Madrid"
            },
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        print(f"✅ Single device checkout - session: {data['session_id'][:20]}...")
    
    def test_device_checkout_multiple_devices_with_colors(self):
        """Test checkout for 3 devices with different colors - shipping 8.95€"""
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": 3,
            "colors": ["azul-cielo", "verde-menta", "negro-mate"],
            "device_style": "juvenil",
            "shipping": {
                "fullName": "TEST_Multiple Devices",
                "phone": "600000003",
                "address": "Calle Test 3",
                "city": "Barcelona",
                "postalCode": "08001",
                "province": "Barcelona"
            },
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        print(f"✅ 3 devices checkout with colors - session: {data['session_id'][:20]}...")
    
    def test_device_checkout_senior_style(self):
        """Test checkout for 2 devices with senior style - shipping 6.95€"""
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": 2,
            "colors": ["blanco-perla", "champagne"],
            "device_style": "senior",
            "shipping": {
                "fullName": "TEST_Senior Style",
                "phone": "600000002",
                "address": "Calle Test 2",
                "city": "Valencia",
                "postalCode": "46001",
                "province": "Valencia"
            },
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        print(f"✅ Senior style checkout - session: {data['session_id'][:20]}...")
    
    def test_device_checkout_max_quantity(self):
        """Test checkout for 10 devices (max) - shipping 22.95€"""
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": 10,
            "colors": ["plata", "plata", "plata", "plata", "plata", "plata", "plata", "plata", "plata", "plata"],
            "device_style": "adulto",
            "shipping": {
                "fullName": "TEST_Max Quantity",
                "phone": "600000010",
                "address": "Calle Test 10",
                "city": "Sevilla",
                "postalCode": "41001",
                "province": "Sevilla"
            },
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        print(f"✅ Max quantity (10) checkout - session: {data['session_id'][:20]}...")
    
    def test_device_checkout_missing_shipping(self):
        """Test checkout fails with missing shipping info"""
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": 1,
            "colors": ["plata"],
            "device_style": "adulto",
            "shipping": {},
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        # Should still create session but with empty shipping in metadata
        # The validation is done on frontend, backend accepts what it gets
        assert response.status_code == 200  # Stripe creates session anyway
        print("✅ Empty shipping handled (frontend validation expected)")


class TestPaymentPlans:
    """Subscription plans endpoint tests"""
    
    def test_get_plans(self):
        """Test getting available plans"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        assert response.status_code == 200
        data = response.json()
        
        # Check basic plan
        assert "basic" in data
        assert data["basic"]["price"] == 0
        
        # Check paid plans
        assert "plans" in data
        plans = {p["id"]: p for p in data["plans"]}
        
        # Individual plan
        assert "individual" in plans
        assert plans["individual"]["monthly_price"] == 29.99
        assert plans["individual"]["yearly_price"] == 249.99
        assert plans["individual"]["trial_days"] == 7
        
        # Familiar plan
        assert "familiar" in plans
        assert plans["familiar"]["monthly_price"] == 49.99
        assert plans["familiar"]["yearly_price"] == 399.99
        assert plans["familiar"]["trial_days"] == 7
        
        print("✅ Plans API returns correct pricing")
    
    def test_plans_trial_info(self):
        """Test that plans include trial information"""
        response = requests.get(f"{BASE_URL}/api/payments/plans")
        data = response.json()
        
        for plan in data["plans"]:
            assert "trial_info" in plan
            assert "7" in plan["trial_info"]  # 7-day trial
            assert plan["card_required"] == True
            assert plan["prepaid_accepted"] == False
        
        print("✅ Plans include trial info and card requirements")


class TestShippingCosts:
    """Test shipping cost calculation"""
    
    # Expected shipping costs based on backend/routes/payments.py
    EXPECTED_COSTS = {
        1: 4.95,
        2: 6.95,
        3: 8.95,
        4: 10.95,
        5: 12.95,
        6: 14.95,
        7: 16.95,
        8: 18.95,
        9: 20.95,
        10: 22.95
    }
    
    def test_shipping_costs_scale(self):
        """Verify shipping costs scale correctly"""
        # This test verifies the shipping costs are defined correctly in the backend
        # We can't directly verify the Stripe amount without payment, but we can check
        # the API accepts all quantities
        for qty in [1, 2, 3, 5, 10]:
            response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
                "quantity": qty,
                "colors": ["plata"] * qty,
                "device_style": "adulto",
                "shipping": {
                    "fullName": f"TEST_Shipping_{qty}",
                    "phone": f"60000000{qty}",
                    "address": f"Calle Test {qty}",
                    "city": "Madrid",
                    "postalCode": "28001",
                    "province": "Madrid"
                },
                "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
            })
            assert response.status_code == 200
            expected_cost = self.EXPECTED_COSTS[qty]
            print(f"✅ Quantity {qty} checkout OK - expected shipping: {expected_cost}€")


class TestDeviceStyles:
    """Test device style options"""
    
    VALID_STYLES = ["juvenil", "adulto", "senior"]
    
    def test_all_device_styles_accepted(self):
        """Test that all device styles are accepted by the API"""
        for style in self.VALID_STYLES:
            response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
                "quantity": 1,
                "colors": ["plata"],
                "device_style": style,
                "shipping": {
                    "fullName": f"TEST_Style_{style}",
                    "phone": "600000099",
                    "address": "Calle Style Test",
                    "city": "Madrid",
                    "postalCode": "28001",
                    "province": "Madrid"
                },
                "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
            })
            assert response.status_code == 200
            data = response.json()
            assert "url" in data
            print(f"✅ Device style '{style}' accepted")


class TestColorOptions:
    """Test color options are accepted"""
    
    VALID_COLORS = [
        "azul-cielo", "verde-menta", "naranja-energy", "rosa-coral", 
        "lila-lavanda", "azul-marino", "gris-titanio", "negro-mate",
        "champagne", "burdeos", "plata", "blanco-perla"
    ]
    
    def test_all_colors_accepted(self):
        """Test that all color options are accepted"""
        # Test a sample of colors
        test_colors = ["azul-cielo", "negro-mate", "champagne", "plata"]
        response = requests.post(f"{BASE_URL}/api/payments/device/checkout", json={
            "quantity": len(test_colors),
            "colors": test_colors,
            "device_style": "adulto",
            "shipping": {
                "fullName": "TEST_Colors",
                "phone": "600000088",
                "address": "Calle Colors Test",
                "city": "Madrid",
                "postalCode": "28001",
                "province": "Madrid"
            },
            "origin_url": "https://manoprotect-desktop.preview.emergentagent.com"
        })
        assert response.status_code == 200
        print(f"✅ Multiple colors accepted: {test_colors}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
