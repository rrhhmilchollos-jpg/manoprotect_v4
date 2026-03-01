"""
ManoProtect CEO Dashboard V2 Tests - Enterprise Overhaul
Tests: Chart data, notifications, security overview, inventory, SEO files
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mano-ops-workspace.preview.emergentagent.com').rstrip('/')

# CEO credentials
CEO_EMAIL = "ceo@manoprotect.com"
CEO_PASSWORD = "19862210Des"


class TestChartData:
    """Chart data endpoint tests - New in Enterprise Edition"""

    def test_chart_data_returns_all_charts(self, authenticated_client):
        """GET /api/ceo/chart-data should return all chart data"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/chart-data")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure - all 3 chart data arrays
        assert "users_by_month" in data, "Missing users_by_month"
        assert "plan_distribution" in data, "Missing plan_distribution"
        assert "revenue_by_month" in data, "Missing revenue_by_month"
        
        # Verify users_by_month array structure
        assert isinstance(data["users_by_month"], list)
        if len(data["users_by_month"]) > 0:
            assert "month" in data["users_by_month"][0]
            assert "users" in data["users_by_month"][0]
        
        # Verify plan_distribution array structure
        assert isinstance(data["plan_distribution"], list)
        
        # Verify revenue_by_month array structure
        assert isinstance(data["revenue_by_month"], list)
        if len(data["revenue_by_month"]) > 0:
            assert "month" in data["revenue_by_month"][0]
            assert "revenue" in data["revenue_by_month"][0]
        
        print(f"✅ Chart Data OK - users_by_month:{len(data['users_by_month'])}, plan_dist:{len(data['plan_distribution'])}, revenue:{len(data['revenue_by_month'])}")


class TestNotifications:
    """Notifications endpoint tests - New in Enterprise Edition"""

    def test_notifications_returns_array(self, authenticated_client):
        """GET /api/ceo/notifications should return notification list"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/notifications")
        assert response.status_code == 200
        data = response.json()
        
        assert "notifications" in data
        assert isinstance(data["notifications"], list)
        
        # Verify notification structure if any exist
        if len(data["notifications"]) > 0:
            notif = data["notifications"][0]
            assert "type" in notif or "title" in notif
            assert "severity" in notif or "created_at" in notif
        
        print(f"✅ Notifications OK - count:{len(data['notifications'])}")

    def test_notifications_auto_generated(self, authenticated_client):
        """GET /api/ceo/notifications should auto-generate from pending items"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/notifications")
        assert response.status_code == 200
        data = response.json()
        
        # Auto-generated notifications should have severity levels
        for notif in data["notifications"]:
            if "severity" in notif:
                assert notif["severity"] in ["error", "warning", "info", "success"]
        
        print(f"✅ Auto-generated notifications verified")


class TestSecurityOverview:
    """Security overview endpoint tests - New in Enterprise Edition"""

    def test_security_overview_returns_stats(self, authenticated_client):
        """GET /api/ceo/security-overview should return security stats"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/security-overview")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "admin_users" in data, "Missing admin_users"
        assert "two_factor_enabled_count" in data, "Missing two_factor_enabled_count"
        assert "failed_login_attempts" in data, "Missing failed_login_attempts"
        assert "total_admins" in data, "Missing total_admins"
        
        # Verify types
        assert isinstance(data["admin_users"], list)
        assert isinstance(data["two_factor_enabled_count"], int)
        assert isinstance(data["failed_login_attempts"], int)
        assert isinstance(data["total_admins"], int)
        
        # Verify admin user structure
        if len(data["admin_users"]) > 0:
            admin = data["admin_users"][0]
            assert "email" in admin
            assert "role" in admin
        
        print(f"✅ Security Overview OK - admins:{data['total_admins']}, 2FA:{data['two_factor_enabled_count']}, failed_logins:{data['failed_login_attempts']}")


class TestInventory:
    """Inventory endpoint tests - New in Enterprise Edition"""

    def test_inventory_returns_paginated_items(self, authenticated_client):
        """GET /api/ceo/inventory should return paginated inventory"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/inventory?page=1")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        
        assert isinstance(data["items"], list)
        assert isinstance(data["total"], int)
        
        print(f"✅ Inventory OK - total:{data['total']}, page:{data['page']}/{data['pages']}")

    def test_inventory_filter_by_product(self, authenticated_client):
        """GET /api/ceo/inventory?product=sentinel_x should filter"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/inventory?page=1&product=sentinel_x")
        assert response.status_code == 200
        data = response.json()
        
        # All returned items should be sentinel_x (if any)
        for item in data["items"]:
            assert item.get("product") == "sentinel_x"
        
        print(f"✅ Inventory filter OK - filtered count:{len(data['items'])}")


class TestSecurityLogs:
    """Security logs endpoint tests"""

    def test_security_logs_returns_paginated_logs(self, authenticated_client):
        """GET /api/ceo/security-logs should return admin logs"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/security-logs?page=1")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "logs" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        
        print(f"✅ Security Logs OK - total:{data['total']}")


class TestSEOFiles:
    """SEO files tests - robots.txt and sitemap.xml"""

    def test_robots_txt_accessible(self):
        """GET /robots.txt should be accessible"""
        response = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
        assert response.status_code == 200
        content = response.text
        
        # Verify key directives
        assert "User-agent:" in content
        assert "Allow:" in content
        assert "Disallow:" in content
        assert "Sitemap:" in content
        
        # Verify protected routes are disallowed
        assert "Disallow: /api/" in content
        assert "Disallow: /ceo" in content
        assert "Disallow: /admin/" in content
        
        print(f"✅ robots.txt OK - contains Allow/Disallow directives")

    def test_sitemap_xml_accessible(self):
        """GET /sitemap.xml should be accessible and valid"""
        response = requests.get(f"{BASE_URL}/sitemap.xml", timeout=10)
        assert response.status_code == 200
        content = response.text
        
        # Verify XML structure
        assert '<?xml version="1.0"' in content
        assert '<urlset' in content
        assert '<url>' in content
        assert '<loc>' in content
        
        # Verify key pages are included
        assert 'manoprotect.com/' in content
        assert 'productos' in content
        assert 'plans' in content
        
        # Verify SEO landing pages
        assert 'reloj-sos-ancianos' in content
        assert 'reloj-gps-mayores' in content
        assert 'boton-sos-senior' in content
        assert 'proteccion-phishing' in content
        assert 'proteccion-fraude-online' in content
        assert 'seguridad-digital-familiar' in content
        assert 'seguridad-mayores' in content
        
        print(f"✅ sitemap.xml OK - contains all SEO landing pages")


class TestExportEndpoints:
    """CSV Export endpoint tests"""

    def test_export_users_csv(self, authenticated_client):
        """GET /api/ceo/export/users should return CSV"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/export/users")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "text/csv; charset=utf-8"
        assert "attachment" in response.headers.get("content-disposition", "")
        print(f"✅ Users CSV export OK")

    def test_export_payments_csv(self, authenticated_client):
        """GET /api/ceo/export/payments should return CSV"""
        response = authenticated_client.get(f"{BASE_URL}/api/ceo/export/payments")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "text/csv; charset=utf-8"
        assert "attachment" in response.headers.get("content-disposition", "")
        print(f"✅ Payments CSV export OK")


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
