"""
Test iteration 58: Emergency 112 Integration + Trial Reminders + Analytics Export
Tests for new features added after iteration 57:
- POST /api/emergency/112 - triggers emergency with coordinates
- GET /api/emergency/112/history - returns emergency history  
- GET /api/admin/trial-status - returns trial user counts
- POST /api/admin/send-trial-reminders - sends trial reminders (admin only)
- GET /api/admin/analytics/export - returns analytics data with users, orders, safety metrics
- GET /api/admin/analytics/users-csv - returns CSV file
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "ceo@manoprotectt.com"
ADMIN_PASSWORD = "19862210Des"


class TestEmergency112Integration:
    """Tests for 112 Emergency Integration endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_emergency_112_requires_auth(self):
        """POST /api/emergency/112 requires authentication"""
        response = requests.post(f"{BASE_URL}/api/emergency/112", json={
            "latitude": 40.4168,
            "longitude": -3.7038,
            "message": "Test emergency"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_emergency_112_trigger_success(self, admin_session):
        """POST /api/emergency/112 triggers emergency and returns expected fields"""
        response = admin_session.post(f"{BASE_URL}/api/emergency/112", json={
            "latitude": 40.4168,
            "longitude": -3.7038,
            "accuracy": 10.5,
            "message": "Test emergency from pytest"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify required response fields
        assert data.get("success") == True, "Response should have success=True"
        assert "call_url" in data, "Response should contain call_url"
        assert data["call_url"] == "tel:112", "call_url should be tel:112"
        assert "maps_url" in data, "Response should contain maps_url"
        assert "maps.google.com" in data["maps_url"], "maps_url should be a Google Maps link"
        assert "contacts_notified" in data, "Response should contain contacts_notified count"
        assert isinstance(data["contacts_notified"], int), "contacts_notified should be integer"
        assert "emergency_id" in data, "Response should contain emergency_id"
        assert "coordinates" in data, "Response should contain coordinates"
        assert data["coordinates"]["latitude"] == 40.4168
        assert data["coordinates"]["longitude"] == -3.7038
    
    def test_emergency_112_history_requires_auth(self):
        """GET /api/emergency/112/history requires authentication"""
        response = requests.get(f"{BASE_URL}/api/emergency/112/history")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_emergency_112_history_returns_list(self, admin_session):
        """GET /api/emergency/112/history returns emergency history"""
        response = admin_session.get(f"{BASE_URL}/api/emergency/112/history")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "emergencies" in data, "Response should contain emergencies array"
        assert isinstance(data["emergencies"], list), "emergencies should be a list"


class TestTrialReminders:
    """Tests for Trial Reminder endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_trial_status_requires_auth(self):
        """GET /api/admin/trial-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/trial-status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_trial_status_returns_counts(self, admin_session):
        """GET /api/admin/trial-status returns trial user counts"""
        response = admin_session.get(f"{BASE_URL}/api/admin/trial-status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify expected fields
        assert "total_trial_users" in data, "Should have total_trial_users"
        assert "expiring_in_3_days" in data, "Should have expiring_in_3_days"
        assert "already_expired" in data, "Should have already_expired"
        assert "active_trials" in data, "Should have active_trials"
        
        # All counts should be integers
        assert isinstance(data["total_trial_users"], int)
        assert isinstance(data["expiring_in_3_days"], int)
        assert isinstance(data["already_expired"], int)
        assert isinstance(data["active_trials"], int)
    
    def test_send_trial_reminders_requires_auth(self):
        """POST /api/admin/send-trial-reminders requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/send-trial-reminders", json={
            "days_before_expiry": 3
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_send_trial_reminders_admin_only(self, admin_session):
        """POST /api/admin/send-trial-reminders works for admin"""
        response = admin_session.post(f"{BASE_URL}/api/admin/send-trial-reminders", json={
            "days_before_expiry": 3
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should have success=True"
        assert "reminders_sent" in data, "Should have reminders_sent count"
        assert "expired_notified" in data, "Should have expired_notified count"


class TestAnalyticsExport:
    """Tests for BigQuery/Looker Analytics Export endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Login as admin and return session with cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_analytics_export_requires_auth(self):
        """GET /api/admin/analytics/export requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/export")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_analytics_export_returns_data(self, admin_session):
        """GET /api/admin/analytics/export returns analytics data"""
        response = admin_session.get(f"{BASE_URL}/api/admin/analytics/export")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify users section
        assert "users" in data, "Should have users section"
        users = data["users"]
        assert "total" in users, "users should have total"
        assert "subscribers" in users, "users should have subscribers"
        assert "trial" in users, "users should have trial"
        
        # Verify orders section
        assert "orders" in data, "Should have orders section"
        orders = data["orders"]
        assert "total" in orders, "orders should have total"
        
        # Verify safety section
        assert "safety" in data, "Should have safety section"
        safety = data["safety"]
        assert "total_sos_alerts" in safety, "safety should have total_sos_alerts"
        assert "emergency_112_total" in safety, "safety should have emergency_112_total"
        
        # Verify BigQuery schema included
        assert "bigquery_schema" in data, "Should include bigquery_schema"
    
    def test_users_csv_requires_auth(self):
        """GET /api/admin/analytics/users-csv requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/users-csv")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_users_csv_returns_csv(self, admin_session):
        """GET /api/admin/analytics/users-csv returns CSV file"""
        response = admin_session.get(f"{BASE_URL}/api/admin/analytics/users-csv")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type is CSV
        content_type = response.headers.get("content-type", "")
        assert "text/csv" in content_type, f"Expected text/csv, got {content_type}"
        
        # Check content-disposition header for file download
        content_disposition = response.headers.get("content-disposition", "")
        assert "attachment" in content_disposition, "Should be an attachment download"
        assert ".csv" in content_disposition, "Filename should have .csv extension"
        
        # Verify CSV has headers
        csv_content = response.text
        first_line = csv_content.split('\n')[0] if csv_content else ""
        assert "user_id" in first_line, "CSV should have user_id column"
        assert "email" in first_line, "CSV should have email column"


class TestRegressionHealthCheck:
    """Regression tests for basic functionality"""
    
    def test_api_health(self):
        """Backend API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
    
    def test_login_endpoint_exists(self):
        """Login endpoint works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user" in data or "user_id" in data or "success" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
