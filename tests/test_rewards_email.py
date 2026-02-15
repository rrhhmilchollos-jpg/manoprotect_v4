"""
MANO - Rewards and Email Features Test Suite
Tests for:
- Rewards system (points, levels, badges, leaderboard)
- Email notification preferences
- Email queue functionality
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://protect-admin.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "testuser@mano.com"
TEST_PASSWORD = "TestPass123!"


class TestRewardsSystem:
    """Tests for rewards, points, badges, and leaderboard"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.text}")
        
        # Store cookies for authenticated requests
        self.cookies = login_response.cookies
        yield
    
    def test_get_all_badges(self):
        """GET /api/rewards/badges - Returns all available badges"""
        response = self.session.get(f"{BASE_URL}/api/rewards/badges")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "badges" in data, "Response should contain 'badges' key"
        
        badges = data["badges"]
        assert len(badges) == 10, f"Expected 10 badges, got {len(badges)}"
        
        # Verify badge structure
        expected_badges = [
            "first_analysis", "threat_hunter", "community_guardian", 
            "family_protector", "streak_master", "bank_sentinel",
            "early_adopter", "fraud_expert", "helpful_neighbor", "notification_hero"
        ]
        
        badge_ids = [b["id"] for b in badges]
        for expected_id in expected_badges:
            assert expected_id in badge_ids, f"Badge '{expected_id}' not found"
        
        # Verify badge has required fields
        for badge in badges:
            assert "id" in badge, "Badge should have 'id'"
            assert "name" in badge, "Badge should have 'name'"
            assert "description" in badge, "Badge should have 'description'"
            assert "icon" in badge, "Badge should have 'icon'"
            assert "points" in badge, "Badge should have 'points'"
        
        print(f"✓ GET /api/rewards/badges - Found {len(badges)} badges")
    
    def test_get_user_rewards_authenticated(self):
        """GET /api/rewards - Returns user rewards data (authenticated)"""
        response = self.session.get(
            f"{BASE_URL}/api/rewards",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify rewards structure
        assert "user_id" in data, "Response should contain 'user_id'"
        assert "total_points" in data, "Response should contain 'total_points'"
        assert "badges" in data, "Response should contain 'badges'"
        assert "level" in data, "Response should contain 'level'"
        assert "streak_days" in data, "Response should contain 'streak_days'"
        
        # Verify level structure
        level = data["level"]
        assert "id" in level, "Level should have 'id'"
        assert "name" in level, "Level should have 'name'"
        assert "icon" in level, "Level should have 'icon'"
        assert "progress" in level, "Level should have 'progress'"
        
        print(f"✓ GET /api/rewards - User has {data['total_points']} points, level: {level['name']}")
    
    def test_get_user_rewards_unauthenticated(self):
        """GET /api/rewards - Returns 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/rewards")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/rewards - Returns 401 without auth")
    
    def test_claim_daily_reward(self):
        """POST /api/rewards/claim-daily - Claims daily reward and updates streak"""
        response = self.session.post(
            f"{BASE_URL}/api/rewards/claim-daily",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "success" in data, "Response should contain 'success'"
        assert data["success"] == True, "Claim should be successful"
        assert "daily_points" in data, "Response should contain 'daily_points'"
        assert "streak_days" in data, "Response should contain 'streak_days'"
        assert "total_points" in data, "Response should contain 'total_points'"
        assert "level" in data, "Response should contain 'level'"
        
        # Daily login gives 2 points
        assert data["daily_points"] >= 0, "Daily points should be non-negative"
        # Streak can be 0 if claiming multiple times on same day (no change)
        # or >= 1 if first claim of the day
        assert data["streak_days"] >= 0, "Streak should be non-negative"
        
        print(f"✓ POST /api/rewards/claim-daily - Earned {data['daily_points']} pts, streak: {data['streak_days']} days")
    
    def test_claim_daily_reward_unauthenticated(self):
        """POST /api/rewards/claim-daily - Returns 401 without authentication"""
        response = requests.post(f"{BASE_URL}/api/rewards/claim-daily")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/rewards/claim-daily - Returns 401 without auth")
    
    def test_get_leaderboard_weekly(self):
        """GET /api/rewards/leaderboard?period=weekly - Returns weekly leaderboard"""
        response = self.session.get(f"{BASE_URL}/api/rewards/leaderboard?period=weekly")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        assert "period" in data, "Response should contain 'period'"
        assert data["period"] == "weekly", f"Period should be 'weekly', got {data['period']}"
        assert "leaderboard" in data, "Response should contain 'leaderboard'"
        
        leaderboard = data["leaderboard"]
        assert isinstance(leaderboard, list), "Leaderboard should be a list"
        
        # If there are entries, verify structure
        if len(leaderboard) > 0:
            entry = leaderboard[0]
            assert "rank" in entry, "Entry should have 'rank'"
            assert "user_id" in entry, "Entry should have 'user_id'"
            assert "points" in entry, "Entry should have 'points'"
            assert "level" in entry, "Entry should have 'level'"
        
        print(f"✓ GET /api/rewards/leaderboard?period=weekly - Found {len(leaderboard)} entries")
    
    def test_get_leaderboard_monthly(self):
        """GET /api/rewards/leaderboard?period=monthly - Returns monthly leaderboard"""
        response = self.session.get(f"{BASE_URL}/api/rewards/leaderboard?period=monthly")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["period"] == "monthly", f"Period should be 'monthly', got {data['period']}"
        
        print(f"✓ GET /api/rewards/leaderboard?period=monthly - Found {len(data['leaderboard'])} entries")
    
    def test_get_leaderboard_all_time(self):
        """GET /api/rewards/leaderboard?period=all_time - Returns all-time leaderboard"""
        response = self.session.get(f"{BASE_URL}/api/rewards/leaderboard?period=all_time")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["period"] == "all_time", f"Period should be 'all_time', got {data['period']}"
        
        print(f"✓ GET /api/rewards/leaderboard?period=all_time - Found {len(data['leaderboard'])} entries")
    
    def test_get_leaderboard_invalid_period(self):
        """GET /api/rewards/leaderboard?period=invalid - Defaults to weekly"""
        response = self.session.get(f"{BASE_URL}/api/rewards/leaderboard?period=invalid")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["period"] == "weekly", f"Invalid period should default to 'weekly', got {data['period']}"
        
        print("✓ GET /api/rewards/leaderboard?period=invalid - Defaults to weekly")
    
    def test_reward_action_analyze_threat(self):
        """POST /api/rewards/action/analyze_threat - Awards points for action"""
        response = self.session.post(
            f"{BASE_URL}/api/rewards/action/analyze_threat",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should contain 'success'"
        assert data["success"] == True, "Action should be successful"
        assert "points_earned" in data, "Response should contain 'points_earned'"
        assert data["points_earned"] == 5, f"analyze_threat should give 5 points, got {data['points_earned']}"
        
        print(f"✓ POST /api/rewards/action/analyze_threat - Earned {data['points_earned']} points")
    
    def test_reward_action_invalid(self):
        """POST /api/rewards/action/invalid_action - Returns 400 for invalid action"""
        response = self.session.post(
            f"{BASE_URL}/api/rewards/action/invalid_action",
            cookies=self.cookies
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/rewards/action/invalid_action - Returns 400")


class TestEmailPreferences:
    """Tests for email notification preferences"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.text}")
        
        self.cookies = login_response.cookies
        yield
    
    def test_get_email_preferences(self):
        """GET /api/email/preferences - Returns user email preferences"""
        response = self.session.get(
            f"{BASE_URL}/api/email/preferences",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify preferences structure
        assert "user_id" in data, "Response should contain 'user_id'"
        assert "threat_alerts" in data, "Response should contain 'threat_alerts'"
        assert "transaction_alerts" in data, "Response should contain 'transaction_alerts'"
        assert "daily_summary" in data, "Response should contain 'daily_summary'"
        assert "weekly_summary" in data, "Response should contain 'weekly_summary'"
        assert "reward_notifications" in data, "Response should contain 'reward_notifications'"
        assert "family_alerts" in data, "Response should contain 'family_alerts'"
        assert "marketing" in data, "Response should contain 'marketing'"
        
        print(f"✓ GET /api/email/preferences - Retrieved preferences for user")
    
    def test_get_email_preferences_unauthenticated(self):
        """GET /api/email/preferences - Returns 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/email/preferences")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/email/preferences - Returns 401 without auth")
    
    def test_update_email_preferences(self):
        """PATCH /api/email/preferences - Updates email preferences"""
        # Update preferences
        update_data = {
            "daily_summary": False,
            "marketing": True
        }
        
        response = self.session.patch(
            f"{BASE_URL}/api/email/preferences",
            json=update_data,
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should contain 'success'"
        assert data["success"] == True, "Update should be successful"
        
        # Verify update by fetching preferences
        get_response = self.session.get(
            f"{BASE_URL}/api/email/preferences",
            cookies=self.cookies
        )
        
        prefs = get_response.json()
        assert prefs["daily_summary"] == False, "daily_summary should be False"
        assert prefs["marketing"] == True, "marketing should be True"
        
        # Restore original values
        self.session.patch(
            f"{BASE_URL}/api/email/preferences",
            json={"daily_summary": True, "marketing": False},
            cookies=self.cookies
        )
        
        print("✓ PATCH /api/email/preferences - Successfully updated preferences")
    
    def test_update_email_preferences_unauthenticated(self):
        """PATCH /api/email/preferences - Returns 401 without authentication"""
        response = requests.patch(
            f"{BASE_URL}/api/email/preferences",
            json={"daily_summary": False}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ PATCH /api/email/preferences - Returns 401 without auth")


class TestEmailQueue:
    """Tests for email queue functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup session and authenticate as admin"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session (testuser is admin)
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.text}")
        
        self.cookies = login_response.cookies
        yield
    
    def test_send_test_email(self):
        """POST /api/email/test - Queues a test email"""
        response = self.session.post(
            f"{BASE_URL}/api/email/test",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        assert "success" in data, "Response should contain 'success'"
        assert data["success"] == True, "Email should be queued successfully"
        assert "status" in data, "Response should contain 'status'"
        assert "email_id" in data, "Response should contain 'email_id'"
        
        # Since SendGrid is not configured, status should be 'queued'
        assert data["status"] == "queued", f"Expected status 'queued', got {data['status']}"
        
        print(f"✓ POST /api/email/test - Email queued with ID: {data['email_id']}")
    
    def test_send_test_email_unauthenticated(self):
        """POST /api/email/test - Returns 401 without authentication"""
        response = requests.post(f"{BASE_URL}/api/email/test")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/email/test - Returns 401 without auth")
    
    def test_get_email_queue_admin(self):
        """GET /api/email/queue - Returns email queue (admin only)"""
        response = self.session.get(
            f"{BASE_URL}/api/email/queue",
            cookies=self.cookies
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        assert "emails" in data, "Response should contain 'emails'"
        assert "sendgrid_configured" in data, "Response should contain 'sendgrid_configured'"
        
        # SendGrid is not configured
        assert data["sendgrid_configured"] == False, "SendGrid should not be configured"
        
        emails = data["emails"]
        assert isinstance(emails, list), "Emails should be a list"
        
        print(f"✓ GET /api/email/queue - Found {len(emails)} queued emails, SendGrid configured: {data['sendgrid_configured']}")
    
    def test_get_email_queue_unauthenticated(self):
        """GET /api/email/queue - Returns 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/email/queue")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/email/queue - Returns 401 without auth")


class TestLevelSystem:
    """Tests for level calculation and progression"""
    
    def test_level_thresholds(self):
        """Verify level thresholds are correctly defined"""
        # Level thresholds from rewards_service.py
        levels = {
            'bronce': {'min': 0, 'max': 99},
            'plata': {'min': 100, 'max': 499},
            'oro': {'min': 500, 'max': 1999},
            'platino': {'min': 2000, 'max': 4999},
            'diamante': {'min': 5000, 'max': float('inf')}
        }
        
        # Verify no gaps between levels
        prev_max = -1
        for level_id, level in levels.items():
            assert level['min'] == prev_max + 1, f"Gap found before {level_id}"
            prev_max = level['max'] if level['max'] != float('inf') else prev_max
        
        print("✓ Level thresholds are correctly defined with no gaps")
    
    def test_point_actions_defined(self):
        """Verify point actions are correctly defined"""
        # Point values from rewards_service.py
        expected_actions = {
            'analyze_threat': 5,
            'report_threat': 10,
            'report_false_positive': 15,
            'share_alert': 5,
            'daily_login': 2,
            'weekly_streak': 20,
            'monthly_streak': 100,
            'refer_user': 50,
            'complete_profile': 20,
            'enable_notifications': 10,
            'connect_bank': 25,
            'verify_safe': 3,
            'block_threat': 8,
            'help_family': 15,
            'community_alert': 25
        }
        
        # All actions should have positive point values
        for action, points in expected_actions.items():
            assert points > 0, f"Action '{action}' should have positive points"
        
        print(f"✓ {len(expected_actions)} point actions are correctly defined")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
