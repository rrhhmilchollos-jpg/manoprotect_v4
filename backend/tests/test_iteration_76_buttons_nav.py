"""
Iteration 76: Full Navigation and Button Testing
Tests for:
1. Dashboard Barrio - Gamified ranking with badges endpoint
2. Panel Vecinal - Referral code validation endpoint  
3. Panel Vecinal - Referral redemption endpoint
4. Enterprise Central - All existing endpoints still work
5. All navigation links verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDashboardBarrioRanking:
    """Tests for new gamified ranking endpoint with badges"""
    
    def test_ranking_endpoint_exists(self):
        """GET /api/dashboard-barrio/ranking should return ranking data"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify structure
        assert "scores" in data, "Missing 'scores' in response"
        assert "overall_rank" in data, "Missing 'overall_rank' in response"
        assert "badges" in data, "Missing 'badges' in response"
        assert "next_milestone" in data, "Missing 'next_milestone' in response"
        assert "stats" in data, "Missing 'stats' in response"
        print(f"PASS: Ranking endpoint returns valid structure")
        
    def test_ranking_scores_structure(self):
        """Verify scores have community, vigilance, response, total"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking")
        data = response.json()
        
        scores = data["scores"]
        assert "community" in scores, "Missing community score"
        assert "vigilance" in scores, "Missing vigilance score"
        assert "response" in scores, "Missing response score"
        assert "total" in scores, "Missing total score"
        
        # All scores should be 0-100
        for key, value in scores.items():
            assert 0 <= value <= 100, f"{key} score {value} out of 0-100 range"
        print(f"PASS: Scores structure valid: community={scores['community']}, vigilance={scores['vigilance']}, response={scores['response']}, total={scores['total']}")
        
    def test_ranking_overall_rank_structure(self):
        """Verify overall_rank has rank and tier"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking")
        data = response.json()
        
        overall = data["overall_rank"]
        assert "rank" in overall, "Missing rank name"
        assert "tier" in overall, "Missing tier"
        assert overall["tier"] in ["gold", "silver", "bronze", "starter"], f"Invalid tier: {overall['tier']}"
        print(f"PASS: Overall rank: {overall['rank']} ({overall['tier']})")
        
    def test_ranking_badges_is_list(self):
        """Verify badges is a list with proper structure"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking")
        data = response.json()
        
        badges = data["badges"]
        assert isinstance(badges, list), "badges should be a list"
        
        if len(badges) > 0:
            badge = badges[0]
            assert "id" in badge, "Badge missing id"
            assert "name" in badge, "Badge missing name"
            assert "description" in badge, "Badge missing description"
            assert "tier" in badge, "Badge missing tier"
        print(f"PASS: {len(badges)} badges found")
        
    def test_ranking_next_milestone_structure(self):
        """Verify next_milestone has action, reward, progress"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/ranking")
        data = response.json()
        
        milestone = data["next_milestone"]
        assert "action" in milestone, "Missing action in next_milestone"
        assert "reward" in milestone, "Missing reward in next_milestone"
        assert "progress" in milestone, "Missing progress in next_milestone"
        assert 0 <= milestone["progress"] <= 100, "Progress out of range"
        print(f"PASS: Next milestone: {milestone['action']} ({milestone['progress']}%)")


class TestPanelVecinalReferrals:
    """Tests for referral code validation and redemption"""
    
    def test_validate_fake_referral_code(self):
        """Validate endpoint returns valid:false for fake codes"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/referrals/validate/FAKE123")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "valid" in data, "Missing 'valid' field"
        assert data["valid"] == False, f"Expected valid=false for fake code, got {data['valid']}"
        print(f"PASS: Fake code validation returns valid=false")
        
    def test_validate_empty_code(self):
        """Validate endpoint handles empty/short codes"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/referrals/validate/AB")
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == False, "Short code should be invalid"
        print(f"PASS: Short code returns valid=false")
        
    def test_validate_random_code_formats(self):
        """Test various code formats"""
        codes = ["VEC-123456", "NEIGHBOR2024", "TEST-CODE-1", "invalid"]
        for code in codes:
            response = requests.get(f"{BASE_URL}/api/panel-vecinal/referrals/validate/{code}")
            assert response.status_code == 200, f"Failed for code: {code}"
            data = response.json()
            assert "valid" in data
        print(f"PASS: All code formats handled correctly")
        
    def test_redeem_requires_auth(self):
        """POST /api/panel-vecinal/referrals/redeem should require auth"""
        response = requests.post(
            f"{BASE_URL}/api/panel-vecinal/referrals/redeem",
            json={"referral_code": "VEC-TEST123", "new_subscriber_email": "test@test.com"}
        )
        # Should return 401 for unauthenticated
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"PASS: Redeem endpoint requires authentication (401)")


class TestPanelVecinalBasicEndpoints:
    """Verify existing panel vecinal endpoints still work"""
    
    def test_plan_info_endpoint(self):
        """GET /api/panel-vecinal/plan-info should work"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/plan-info")
        assert response.status_code == 200
        
        data = response.json()
        assert data["price"] == 299.99, f"Price should be 299.99, got {data.get('price')}"
        assert data["standalone"] == True, "Plan should be standalone"
        assert "features" in data, "Missing features list"
        print(f"PASS: Plan info returns price={data['price']}, standalone={data['standalone']}")
        
    def test_check_access_unauthenticated(self):
        """GET /api/panel-vecinal/check-access without auth"""
        response = requests.get(f"{BASE_URL}/api/panel-vecinal/check-access")
        assert response.status_code == 200
        data = response.json()
        assert data["has_access"] == False
        assert data["reason"] == "not_logged_in"
        print(f"PASS: Unauthenticated check-access returns has_access=false")


class TestDashboardBarrioExistingEndpoints:
    """Verify existing dashboard barrio endpoints still work"""
    
    def test_public_stats(self):
        """GET /api/dashboard-barrio/public-stats should return full stats"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "security_overview" in data
        assert "alerts" in data
        assert "community" in data
        assert "plan_info" in data
        
        # Verify plan_info
        assert data["plan_info"]["price"] == 299.99
        print(f"PASS: Public stats returns full data structure")
        
    def test_leaderboard(self):
        """GET /api/dashboard-barrio/leaderboard should return leaderboard"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert "leaderboard" in data
        assert "message" in data
        print(f"PASS: Leaderboard endpoint works")


class TestEnterpriseCentralEndpoints:
    """Verify Enterprise Central endpoints still work"""
    
    def test_dashboard_endpoint(self):
        """GET /api/enterprise-central/dashboard should return overview"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert "overview" in data
        assert "revenue" in data
        assert "sales" in data
        assert "operations" in data
        print(f"PASS: Enterprise dashboard returns overview, revenue, sales, operations")
        
    def test_leads_list(self):
        """GET /api/enterprise-central/leads should return leads"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads")
        assert response.status_code == 200
        
        data = response.json()
        assert "leads" in data
        assert "total" in data
        print(f"PASS: Leads endpoint returns list with {data['total']} leads")
        
    def test_create_lead(self):
        """POST /api/enterprise-central/leads should create lead"""
        lead_data = {
            "name": "TEST_NavTest Lead",
            "email": "test_nav_76@test.com",
            "phone": "666111222",
            "source": "web",
            "interest": "alarma hogar",
            "neighborhood": "Test Barrio"
        }
        response = requests.post(
            f"{BASE_URL}/api/enterprise-central/leads",
            json=lead_data
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        data = response.json()
        assert "lead_id" in data
        assert data["status"] == "new"
        print(f"PASS: Lead created with id={data['lead_id']}")
        
    def test_installations_list(self):
        """GET /api/enterprise-central/installations should return list"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/installations")
        assert response.status_code == 200
        
        data = response.json()
        assert "installations" in data
        print(f"PASS: Installations endpoint returns list")
        
    def test_pipeline(self):
        """GET /api/enterprise-central/leads/pipeline should return stats"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads/pipeline")
        assert response.status_code == 200
        
        data = response.json()
        assert "pipeline" in data
        assert "total_value" in data
        print(f"PASS: Pipeline returns stats with total_value={data['total_value']}")


class TestCommunityShieldEndpoints:
    """Verify community shield endpoints for Escudo Vecinal"""
    
    def test_incidents_list(self):
        """GET /api/community-shield/incidents should work"""
        response = requests.get(f"{BASE_URL}/api/community-shield/incidents?lat=39.4699&lng=-0.3763&radius_km=5")
        assert response.status_code == 200
        data = response.json()
        assert "incidents" in data
        print(f"PASS: Community shield incidents returns {len(data['incidents'])} incidents")
        
    def test_stats_endpoint(self):
        """GET /api/community-shield/stats should work"""
        response = requests.get(f"{BASE_URL}/api/community-shield/stats")
        assert response.status_code == 200
        data = response.json()
        assert "active_protectors" in data or "total_incidents" in data
        print(f"PASS: Community shield stats endpoint works")
        
    def test_heatmap_endpoint(self):
        """GET /api/community-shield/heatmap should work"""
        response = requests.get(f"{BASE_URL}/api/community-shield/heatmap")
        assert response.status_code == 200
        data = response.json()
        assert "points" in data
        print(f"PASS: Heatmap returns {len(data['points'])} points")


class TestBasicNavigation:
    """Test that key pages load via API health"""
    
    def test_heartbeat(self):
        """Backend is running"""
        response = requests.get(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200
        print(f"PASS: Backend heartbeat OK")
