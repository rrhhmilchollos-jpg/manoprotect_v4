"""
Test Suite for Iteration 75 - Three New Features:
1. Dashboard de Barrio (Public Neighborhood Stats Dashboard)
2. Push Notification Service
3. Enterprise Central Management System (Sales CRM + Installations)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDashboardBarrioPublicStats:
    """Test Dashboard de Barrio - Public neighborhood statistics"""
    
    def test_public_stats_returns_200(self):
        """GET /api/dashboard-barrio/public-stats returns 200"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/dashboard-barrio/public-stats returns 200")
    
    def test_public_stats_has_security_overview(self):
        """Public stats include security_overview with level and resolution_rate"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "security_overview" in data, "Missing security_overview"
        overview = data["security_overview"]
        assert "level" in overview, "Missing security_overview.level"
        assert "resolution_rate" in overview, "Missing security_overview.resolution_rate"
        assert overview["level"] in ["alto", "medio", "bajo"], f"Invalid security level: {overview['level']}"
        print(f"PASS: security_overview has level={overview['level']}, resolution_rate={overview['resolution_rate']}%")
    
    def test_public_stats_has_alerts_data(self):
        """Public stats include alerts data (this_week, this_month, total_year, resolved)"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "alerts" in data, "Missing alerts"
        alerts = data["alerts"]
        for key in ["this_week", "this_month", "total_year", "resolved_this_month"]:
            assert key in alerts, f"Missing alerts.{key}"
            assert isinstance(alerts[key], int), f"alerts.{key} should be int"
        print(f"PASS: alerts data present - week={alerts['this_week']}, month={alerts['this_month']}")
    
    def test_public_stats_has_community_data(self):
        """Public stats include community data (active_premium_families, total_protectors)"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "community" in data, "Missing community"
        community = data["community"]
        for key in ["active_premium_families", "total_protectors", "community_incidents_month"]:
            assert key in community, f"Missing community.{key}"
        print(f"PASS: community data present - families={community['active_premium_families']}, protectors={community['total_protectors']}")
    
    def test_public_stats_has_by_type_breakdown(self):
        """Public stats include by_type breakdown for incident types"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "by_type" in data, "Missing by_type"
        assert isinstance(data["by_type"], dict), "by_type should be dict"
        print(f"PASS: by_type present with {len(data['by_type'])} types")
    
    def test_public_stats_has_plan_info(self):
        """Public stats include plan_info for Premium CTA"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/public-stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "plan_info" in data, "Missing plan_info"
        plan = data["plan_info"]
        assert plan["name"] == "Escudo Vecinal Premium", f"Unexpected plan name: {plan['name']}"
        assert plan["price"] == 299.99, f"Expected price 299.99, got {plan['price']}"
        print(f"PASS: plan_info correct - {plan['name']} at {plan['price']} EUR/{plan['period']}")


class TestDashboardBarrioLeaderboard:
    """Test Dashboard de Barrio - Neighborhood leaderboard"""
    
    def test_leaderboard_returns_200(self):
        """GET /api/dashboard-barrio/leaderboard returns 200"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/leaderboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/dashboard-barrio/leaderboard returns 200")
    
    def test_leaderboard_has_expected_structure(self):
        """Leaderboard response has leaderboard array and message"""
        response = requests.get(f"{BASE_URL}/api/dashboard-barrio/leaderboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "leaderboard" in data, "Missing leaderboard"
        assert isinstance(data["leaderboard"], list), "leaderboard should be list"
        assert "message" in data, "Missing message"
        print(f"PASS: leaderboard has {len(data['leaderboard'])} entries")


class TestEnterpriseCentralDashboard:
    """Test Enterprise Central - Dashboard"""
    
    def test_dashboard_returns_200(self):
        """GET /api/enterprise-central/dashboard returns 200"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/enterprise-central/dashboard returns 200")
    
    def test_dashboard_has_overview(self):
        """Dashboard includes overview with total_users, active_subscriptions"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "overview" in data, "Missing overview"
        overview = data["overview"]
        for key in ["total_users", "active_subscriptions", "active_employees"]:
            assert key in overview, f"Missing overview.{key}"
        print(f"PASS: overview - users={overview['total_users']}, subs={overview['active_subscriptions']}")
    
    def test_dashboard_has_revenue_data(self):
        """Dashboard includes revenue estimates"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "revenue" in data, "Missing revenue"
        revenue = data["revenue"]
        for key in ["estimated_monthly", "vecinal_subscribers", "alarm_subscribers"]:
            assert key in revenue, f"Missing revenue.{key}"
        print(f"PASS: revenue - MRR={revenue['estimated_monthly']} EUR")
    
    def test_dashboard_has_sales_pipeline(self):
        """Dashboard includes sales pipeline data"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "sales" in data, "Missing sales"
        sales = data["sales"]
        assert "leads_this_month" in sales, "Missing leads_this_month"
        assert "pipeline" in sales, "Missing pipeline"
        print(f"PASS: sales - {sales['leads_this_month']} leads this month")
    
    def test_dashboard_has_operations(self):
        """Dashboard includes operations (pending_installations)"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        assert "operations" in data, "Missing operations"
        assert "pending_installations" in data["operations"], "Missing pending_installations"
        print(f"PASS: operations - {data['operations']['pending_installations']} pending installations")


class TestEnterpriseCentralLeadsCRUD:
    """Test Enterprise Central - Sales CRM Leads CRUD"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Unique test data for each test"""
        self.test_lead_name = f"TEST_Lead_{int(time.time())}"
        self.test_lead_email = f"test_{int(time.time())}@test.com"
    
    def test_create_lead(self):
        """POST /api/enterprise-central/leads creates a new lead"""
        payload = {
            "name": self.test_lead_name,
            "email": self.test_lead_email,
            "phone": "+34666000000",
            "source": "web",
            "interest": "alarma hogar",
            "neighborhood": "Valencia Centro"
        }
        response = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "lead_id" in data, "Missing lead_id"
        assert data["status"] == "new", f"Expected status 'new', got {data['status']}"
        print(f"PASS: Created lead {data['lead_id']} with status={data['status']}")
        return data["lead_id"]
    
    def test_get_leads_list(self):
        """GET /api/enterprise-central/leads returns leads list"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads?limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "leads" in data, "Missing leads"
        assert isinstance(data["leads"], list), "leads should be list"
        assert "total" in data, "Missing total"
        print(f"PASS: Retrieved {len(data['leads'])} leads (total: {data['total']})")
    
    def test_get_leads_with_status_filter(self):
        """GET /api/enterprise-central/leads?status=new filters by status"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads?status=new&limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        for lead in data["leads"]:
            assert lead.get("status") == "new", f"Lead {lead.get('lead_id')} has status {lead.get('status')}, expected 'new'"
        print(f"PASS: Status filter working - {len(data['leads'])} leads with status='new'")
    
    def test_update_lead_status(self):
        """PATCH /api/enterprise-central/leads/{lead_id} updates lead status"""
        # First create a lead
        payload = {
            "name": f"TEST_Update_{int(time.time())}",
            "email": f"testupdate_{int(time.time())}@test.com",
            "phone": "+34666111111",
            "source": "web",
            "interest": "vecinal premium"
        }
        create_resp = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=payload)
        assert create_resp.status_code == 200
        lead_id = create_resp.json()["lead_id"]
        
        # Update status
        update_payload = {"status": "contacted"}
        response = requests.patch(f"{BASE_URL}/api/enterprise-central/leads/{lead_id}", json=update_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing message"
        print(f"PASS: Updated lead {lead_id} status to 'contacted'")
    
    def test_update_nonexistent_lead_returns_404(self):
        """PATCH /api/enterprise-central/leads/{bad_id} returns 404"""
        response = requests.patch(f"{BASE_URL}/api/enterprise-central/leads/nonexistent_lead_123", json={"status": "contacted"})
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Update nonexistent lead returns 404")
    
    def test_get_pipeline_stats(self):
        """GET /api/enterprise-central/leads/pipeline returns pipeline stats"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads/pipeline")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "pipeline" in data, "Missing pipeline"
        assert "stages" in data, "Missing stages"
        assert isinstance(data["stages"], list), "stages should be list"
        expected_stages = ["new", "contacted", "qualified", "proposal", "negotiation", "closed", "lost"]
        assert data["stages"] == expected_stages, f"Unexpected stages: {data['stages']}"
        print(f"PASS: Pipeline stats - {len(data['pipeline'])} active stages")


class TestEnterpriseCentralInstallations:
    """Test Enterprise Central - Installations Management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Unique test data for each test"""
        self.test_client = f"TEST_Client_{int(time.time())}"
    
    def test_create_installation(self):
        """POST /api/enterprise-central/installations schedules new installation"""
        payload = {
            "client_name": self.test_client,
            "address": "Calle Test 123, Valencia",
            "phone": "+34666222222",
            "plan_type": "alarm-essential",
            "scheduled_date": "2026-02-15T10:00:00",
            "notes": "Test installation"
        }
        response = requests.post(f"{BASE_URL}/api/enterprise-central/installations", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "install_id" in data, "Missing install_id"
        assert data["status"] == "pending", f"Expected status 'pending', got {data['status']}"
        print(f"PASS: Created installation {data['install_id']} with status={data['status']}")
        return data["install_id"]
    
    def test_get_installations_list(self):
        """GET /api/enterprise-central/installations returns installations list"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/installations?limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "installations" in data, "Missing installations"
        assert isinstance(data["installations"], list), "installations should be list"
        print(f"PASS: Retrieved {len(data['installations'])} installations")
    
    def test_update_installation_status(self):
        """PATCH /api/enterprise-central/installations/{id}?status=completed updates status"""
        # First create an installation
        payload = {
            "client_name": f"TEST_InstUpdate_{int(time.time())}",
            "address": "Calle Update 456, Valencia",
            "phone": "+34666333333",
            "plan_type": "alarm-premium",
            "scheduled_date": "2026-02-20T14:00:00"
        }
        create_resp = requests.post(f"{BASE_URL}/api/enterprise-central/installations", json=payload)
        assert create_resp.status_code == 200
        install_id = create_resp.json()["install_id"]
        
        # Update status to completed
        response = requests.patch(f"{BASE_URL}/api/enterprise-central/installations/{install_id}?status=completed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "completed" in data["message"].lower(), f"Unexpected message: {data['message']}"
        print(f"PASS: Updated installation {install_id} to completed")
    
    def test_update_installation_status_required(self):
        """PATCH without status parameter returns 400"""
        response = requests.patch(f"{BASE_URL}/api/enterprise-central/installations/any_id")
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("PASS: Update without status returns 400")
    
    def test_update_nonexistent_installation_returns_404(self):
        """PATCH /api/enterprise-central/installations/{bad_id} returns 404"""
        response = requests.patch(f"{BASE_URL}/api/enterprise-central/installations/nonexistent_inst_123?status=completed")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Update nonexistent installation returns 404")


class TestPushNotificationServiceExists:
    """Test Push Notification Service - Verify service exists and is integrated"""
    
    def test_push_service_file_exists(self):
        """Push notification service file exists at expected location"""
        service_path = "/app/backend/services/push_notification_service.py"
        assert os.path.exists(service_path), f"Push service not found at {service_path}"
        print(f"PASS: Push notification service exists at {service_path}")
    
    def test_push_service_has_required_functions(self):
        """Push service has required functions (send_push_to_all_premium, notify_vecinal_alert)"""
        service_path = "/app/backend/services/push_notification_service.py"
        with open(service_path, 'r') as f:
            content = f.read()
        
        assert "def init_push_service" in content or "async def init_push_service" in content, "Missing init_push_service"
        assert "async def send_push_to_all_premium" in content, "Missing send_push_to_all_premium"
        assert "async def notify_vecinal_alert" in content, "Missing notify_vecinal_alert"
        print("PASS: Push service has all required functions")
    
    def test_push_service_integrated_in_panel_vecinal(self):
        """Push service is integrated into panel_vecinal_routes.py for alerts"""
        routes_path = "/app/backend/routes/panel_vecinal_routes.py"
        with open(routes_path, 'r') as f:
            content = f.read()
        
        assert "from services.push_notification_service import notify_vecinal_alert" in content, \
            "Push service not imported in panel_vecinal_routes"
        assert "notify_vecinal_alert" in content, "notify_vecinal_alert not called in panel_vecinal_routes"
        print("PASS: Push service integrated in panel_vecinal_routes.py")


class TestFullCRUDWorkflow:
    """Test complete CRUD workflow for Enterprise Central"""
    
    def test_lead_lifecycle(self):
        """Test complete lead lifecycle: Create -> Read -> Update -> Verify"""
        timestamp = int(time.time())
        
        # CREATE
        create_payload = {
            "name": f"TEST_Lifecycle_{timestamp}",
            "email": f"lifecycle_{timestamp}@test.com",
            "phone": "+34666999999",
            "source": "telefono",
            "interest": "alarma business",
            "neighborhood": "Madrid Norte"
        }
        create_resp = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=create_payload)
        assert create_resp.status_code == 200
        lead_id = create_resp.json()["lead_id"]
        print(f"CREATE: Lead {lead_id} created")
        
        # READ - Verify in list
        list_resp = requests.get(f"{BASE_URL}/api/enterprise-central/leads?limit=100")
        assert list_resp.status_code == 200
        leads = list_resp.json()["leads"]
        created_lead = next((l for l in leads if l.get("lead_id") == lead_id), None)
        assert created_lead is not None, f"Lead {lead_id} not found in list"
        assert created_lead["name"] == create_payload["name"]
        assert created_lead["status"] == "new"
        print(f"READ: Lead {lead_id} found with status={created_lead['status']}")
        
        # UPDATE status
        update_resp = requests.patch(f"{BASE_URL}/api/enterprise-central/leads/{lead_id}", json={"status": "qualified"})
        assert update_resp.status_code == 200
        print(f"UPDATE: Lead {lead_id} status updated to qualified")
        
        # VERIFY update persisted
        list_resp2 = requests.get(f"{BASE_URL}/api/enterprise-central/leads?limit=100")
        leads2 = list_resp2.json()["leads"]
        updated_lead = next((l for l in leads2 if l.get("lead_id") == lead_id), None)
        assert updated_lead is not None
        assert updated_lead["status"] == "qualified", f"Status not updated, got {updated_lead['status']}"
        print(f"VERIFY: Lead {lead_id} persisted with status={updated_lead['status']}")
        
        print("PASS: Full lead lifecycle test complete")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
