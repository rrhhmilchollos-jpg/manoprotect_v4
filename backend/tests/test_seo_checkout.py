"""
Test SEO/SEM features and checkout with company info for ManoProtect
Tests: SEO meta tags, robots.txt, sitemap.xml, checkout endpoint with STARTBOOKING SL info
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSEOFeatures:
    """Test SEO/SEM implementation"""
    
    def test_robots_txt_accessible(self):
        """Test robots.txt is accessible and has correct content"""
        response = requests.get(f"{BASE_URL}/robots.txt")
        assert response.status_code == 200, f"robots.txt not accessible: {response.status_code}"
        
        content = response.text
        assert "User-agent:" in content, "robots.txt missing User-agent directive"
        assert "Sitemap:" in content, "robots.txt missing Sitemap directive"
        assert "manoprotect.com" in content.lower(), "robots.txt should reference manoprotect.com"
        print("✅ robots.txt is accessible and properly configured")
    
    def test_sitemap_xml_accessible(self):
        """Test sitemap.xml is accessible and valid"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        assert response.status_code == 200, f"sitemap.xml not accessible: {response.status_code}"
        
        content = response.text
        assert '<?xml version="1.0"' in content, "sitemap.xml missing XML declaration"
        assert '<urlset' in content, "sitemap.xml missing urlset element"
        assert '<loc>' in content, "sitemap.xml missing loc elements"
        assert 'manoprotect.com' in content, "sitemap.xml should reference manoprotect.com"
        print("✅ sitemap.xml is accessible and valid")
    
    def test_sitemap_contains_key_pages(self):
        """Test sitemap contains key pages"""
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        content = response.text
        
        key_pages = [
            "manoprotect.com/",
            "verificar-estafa",
            "pricing",
            "login",
            "registro"
        ]
        
        for page in key_pages:
            assert page in content, f"sitemap.xml missing page: {page}"
        print("✅ sitemap.xml contains all key pages")


class TestCheckoutWithCompanyInfo:
    """Test checkout endpoint returns correct company info"""
    
    def test_checkout_returns_company_info(self):
        """Test POST /api/create-checkout-session returns STARTBOOKING SL info"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "monthly",
                "origin_url": "https://manoprotect.com"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Checkout failed: {response.status_code} - {response.text}"
        
        data = response.json()
        
        # Verify company info is present
        assert "company" in data, "Response missing company info"
        company = data["company"]
        
        assert company.get("name") == "STARTBOOKING SL", f"Wrong company name: {company.get('name')}"
        assert company.get("cif") == "B19427723", f"Wrong CIF: {company.get('cif')}"
        assert company.get("country") == "ES", f"Wrong country: {company.get('country')}"
        
        print("✅ Checkout returns correct company info: STARTBOOKING SL, CIF B19427723")
    
    def test_checkout_returns_product_info(self):
        """Test checkout returns product description"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "family-yearly",
                "origin_url": "https://manoprotect.com"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify product info
        assert "product" in data, "Response missing product info"
        product = data["product"]
        
        assert "name" in product, "Product missing name"
        assert "description" in product, "Product missing description"
        assert "amount" in product, "Product missing amount"
        assert "ManoProtect" in product["description"], "Product description should mention ManoProtect"
        
        print(f"✅ Checkout returns product info: {product['name']} - €{product['amount']}")
    
    def test_checkout_returns_stripe_url(self):
        """Test checkout returns valid Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "weekly",
                "origin_url": "https://manoprotect.com"
            },
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "checkout_url" in data, "Response missing checkout_url"
        assert "session_id" in data, "Response missing session_id"
        assert "stripe.com" in data["checkout_url"], "checkout_url should be a Stripe URL"
        
        print("✅ Checkout returns valid Stripe URL")


class TestPlansEndpoint:
    """Test plans endpoint returns all plans correctly"""
    
    def test_get_plans(self):
        """Test GET /api/plans returns all plan types"""
        response = requests.get(f"{BASE_URL}/api/plans")
        
        assert response.status_code == 200, f"Plans endpoint failed: {response.status_code}"
        
        data = response.json()
        
        # Verify plan categories exist
        assert "individual_plans" in data, "Missing individual_plans"
        assert "family_plans" in data, "Missing family_plans"
        assert "business_plans" in data, "Missing business_plans"
        
        # Verify individual plans
        individual_ids = [p["id"] for p in data["individual_plans"]]
        assert "free" in individual_ids, "Missing free plan"
        assert "weekly" in individual_ids, "Missing weekly plan"
        assert "monthly" in individual_ids, "Missing monthly plan"
        assert "yearly" in individual_ids, "Missing yearly plan"
        
        # Verify family plans
        family_ids = [p["id"] for p in data["family_plans"]]
        assert "family-monthly" in family_ids, "Missing family-monthly plan"
        assert "family-yearly" in family_ids, "Missing family-yearly plan"
        
        # Verify business plans
        business_ids = [p["id"] for p in data["business_plans"]]
        assert "business" in business_ids, "Missing business plan"
        assert "enterprise" in business_ids, "Missing enterprise plan"
        
        print(f"✅ Plans endpoint returns {len(individual_ids)} individual, {len(family_ids)} family, {len(business_ids)} business plans")
    
    def test_plans_have_prices(self):
        """Test all plans have valid prices"""
        response = requests.get(f"{BASE_URL}/api/plans")
        data = response.json()
        
        all_plans = data["individual_plans"] + data["family_plans"] + data["business_plans"]
        
        for plan in all_plans:
            assert "price" in plan, f"Plan {plan['id']} missing price"
            assert isinstance(plan["price"], (int, float)), f"Plan {plan['id']} has invalid price type"
            assert plan["price"] >= 0, f"Plan {plan['id']} has negative price"
        
        print("✅ All plans have valid prices")


class TestNoManoBankReferences:
    """Test that ManoBank references are not present"""
    
    def test_plans_no_manobank(self):
        """Test plans endpoint doesn't reference ManoBank"""
        response = requests.get(f"{BASE_URL}/api/plans")
        content = response.text.lower()
        
        assert "manobank" not in content, "Plans endpoint contains ManoBank reference"
        print("✅ Plans endpoint has no ManoBank references")
    
    def test_checkout_no_manobank(self):
        """Test checkout endpoint doesn't reference ManoBank"""
        response = requests.post(
            f"{BASE_URL}/api/create-checkout-session",
            json={
                "plan_type": "monthly",
                "origin_url": "https://manoprotect.com"
            },
            headers={"Content-Type": "application/json"}
        )
        content = response.text.lower()
        
        assert "manobank" not in content, "Checkout endpoint contains ManoBank reference"
        print("✅ Checkout endpoint has no ManoBank references")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
