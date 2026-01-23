"""
ManoBank S.A. - Banking Core API Tests (Iteration 18)
Tests for Ledger, AML, KYC, and Regulatory Reporting APIs
"""
import pytest
import requests
import os
from datetime import datetime, timezone

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable not set")

# Test credentials
DIRECTOR_EMAIL = "rrhh.milchollos@gmail.com"
DIRECTOR_PASSWORD = "19862210Des"

# Test customer from context
TEST_CUSTOMER_ID = "cust_78ae3108d778"
TEST_CUSTOMER_NAME = "María García López"


class TestSession:
    """Shared session for authenticated requests"""
    session = None
    session_token = None


@pytest.fixture(scope="module")
def api_session():
    """Create authenticated session for all tests"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Login to get session token
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": DIRECTOR_EMAIL,
        "password": DIRECTOR_PASSWORD
    })
    
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    
    # Extract session token from cookies
    session_token = response.cookies.get("session_token")
    if session_token:
        session.cookies.set("session_token", session_token)
        TestSession.session_token = session_token
    
    TestSession.session = session
    return session


# ============================================
# LEDGER API TESTS
# ============================================

class TestLedgerAPIs:
    """Tests for Ledger Service APIs"""
    
    def test_ledger_summary(self, api_session):
        """GET /api/ledger/summary - Get ledger statistics"""
        response = api_session.get(f"{BASE_URL}/api/ledger/summary")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total_entries" in data, "Response should contain total_entries"
        assert "by_type" in data, "Response should contain by_type breakdown"
        assert "generated_at" in data, "Response should contain generated_at timestamp"
        
        print(f"✅ Ledger Summary: {data['total_entries']} total entries")
        print(f"   Entry types: {list(data.get('by_type', {}).keys())}")
    
    def test_ledger_verify_integrity(self, api_session):
        """GET /api/ledger/verify - Verify ledger integrity (blockchain-style)"""
        response = api_session.get(f"{BASE_URL}/api/ledger/verify")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "verified" in data, "Response should contain verified status"
        assert "checked" in data, "Response should contain checked count"
        
        if data.get("checked", 0) > 0:
            assert "first_sequence" in data, "Response should contain first_sequence"
            assert "last_sequence" in data, "Response should contain last_sequence"
        
        print(f"✅ Ledger Integrity: verified={data['verified']}, checked={data['checked']} entries")
        if data.get("errors"):
            print(f"   ⚠️ Errors found: {len(data['errors'])}")
    
    def test_ledger_verify_with_range(self, api_session):
        """GET /api/ledger/verify with sequence range"""
        response = api_session.get(f"{BASE_URL}/api/ledger/verify?start_sequence=1&end_sequence=10")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "verified" in data
        print(f"✅ Ledger Verify Range: verified={data['verified']}")
    
    def test_ledger_summary_unauthorized(self):
        """GET /api/ledger/summary - Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/ledger/summary")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Ledger Summary correctly requires authentication")


# ============================================
# AML API TESTS
# ============================================

class TestAMLAPIs:
    """Tests for AML (Anti-Money Laundering) Service APIs"""
    
    def test_aml_dashboard(self, api_session):
        """GET /api/aml/dashboard - Get AML dashboard statistics"""
        response = api_session.get(f"{BASE_URL}/api/aml/dashboard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "alerts_by_status" in data, "Response should contain alerts_by_status"
        assert "alerts_by_type" in data, "Response should contain alerts_by_type"
        assert "total_alerts" in data, "Response should contain total_alerts"
        assert "pending_review" in data, "Response should contain pending_review count"
        assert "generated_at" in data, "Response should contain generated_at timestamp"
        
        print(f"✅ AML Dashboard: {data['total_alerts']} total alerts, {data['pending_review']} pending review")
        print(f"   SARs this month: {data.get('sars_this_month', 0)}")
    
    def test_aml_alerts_list(self, api_session):
        """GET /api/aml/alerts - Get pending AML alerts"""
        response = api_session.get(f"{BASE_URL}/api/aml/alerts")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "alerts" in data, "Response should contain alerts list"
        assert "count" in data, "Response should contain count"
        
        print(f"✅ AML Alerts: {data['count']} pending alerts")
        if data['alerts']:
            alert = data['alerts'][0]
            print(f"   Sample alert: {alert.get('alert_type')} - {alert.get('risk_level')}")
    
    def test_aml_alerts_with_limit(self, api_session):
        """GET /api/aml/alerts with limit parameter"""
        response = api_session.get(f"{BASE_URL}/api/aml/alerts?limit=5")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert len(data.get("alerts", [])) <= 5, "Should respect limit parameter"
        print(f"✅ AML Alerts with limit: {len(data.get('alerts', []))} alerts returned")
    
    def test_aml_screen_customer(self, api_session):
        """POST /api/aml/screen-customer - Screen customer for AML"""
        payload = {
            "customer_id": TEST_CUSTOMER_ID,
            "full_name": TEST_CUSTOMER_NAME,
            "nationality": "ES",
            "date_of_birth": "1985-03-15"
        }
        
        response = api_session.post(f"{BASE_URL}/api/aml/screen-customer", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "screening_id" in data, "Response should contain screening_id"
        assert "customer_id" in data, "Response should contain customer_id"
        assert "risk_score" in data, "Response should contain risk_score"
        assert "risk_level" in data, "Response should contain risk_level"
        assert "sanctions_hit" in data, "Response should contain sanctions_hit"
        assert "pep_match" in data, "Response should contain pep_match"
        assert "onboarding_allowed" in data, "Response should contain onboarding_allowed"
        
        print(f"✅ AML Customer Screening: {data['screening_id']}")
        print(f"   Risk: {data['risk_level']} (score: {data['risk_score']})")
        print(f"   Sanctions hit: {data['sanctions_hit']}, PEP match: {data['pep_match']}")
        print(f"   Onboarding allowed: {data['onboarding_allowed']}")
    
    def test_aml_screen_high_risk_nationality(self, api_session):
        """POST /api/aml/screen-customer - Screen customer with high-risk nationality"""
        payload = {
            "customer_id": "test_high_risk_customer",
            "full_name": "Test High Risk Customer",
            "nationality": "IR",  # Iran - high risk country
            "date_of_birth": "1980-01-01"
        }
        
        response = api_session.post(f"{BASE_URL}/api/aml/screen-customer", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # High-risk nationality should increase risk score
        assert data["risk_score"] >= 40, f"High-risk nationality should increase risk score, got {data['risk_score']}"
        assert "High-risk nationality" in str(data.get("risk_factors", [])), "Should flag high-risk nationality"
        
        print(f"✅ AML High-Risk Screening: risk_level={data['risk_level']}, score={data['risk_score']}")
    
    def test_aml_dashboard_unauthorized(self):
        """GET /api/aml/dashboard - Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/aml/dashboard")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ AML Dashboard correctly requires authentication")


# ============================================
# KYC API TESTS
# ============================================

class TestKYCAPIs:
    """Tests for KYC (Know Your Customer) Service APIs"""
    
    def test_kyc_dashboard(self, api_session):
        """GET /api/kyc/dashboard - Get KYC dashboard statistics"""
        response = api_session.get(f"{BASE_URL}/api/kyc/dashboard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "by_status" in data, "Response should contain by_status breakdown"
        assert "pending_review" in data, "Response should contain pending_review count"
        assert "total_processes" in data, "Response should contain total_processes"
        assert "generated_at" in data, "Response should contain generated_at timestamp"
        
        print(f"✅ KYC Dashboard: {data['total_processes']} total processes, {data['pending_review']} pending")
        print(f"   Today's submissions: {data.get('today_submissions', 0)}")
        if data.get('avg_processing_days'):
            print(f"   Avg processing time: {data['avg_processing_days']} days")
    
    def test_kyc_pending_list(self, api_session):
        """GET /api/kyc/pending - Get pending KYC reviews"""
        response = api_session.get(f"{BASE_URL}/api/kyc/pending")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "kyc_processes" in data, "Response should contain kyc_processes list"
        assert "count" in data, "Response should contain count"
        
        print(f"✅ KYC Pending: {data['count']} pending reviews")
        if data['kyc_processes']:
            kyc = data['kyc_processes'][0]
            print(f"   Sample KYC: {kyc.get('kyc_id')} - {kyc.get('status')}")
    
    def test_kyc_initiate(self, api_session):
        """POST /api/kyc/initiate - Initiate KYC process"""
        payload = {
            "customer_id": f"test_kyc_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "customer_name": "Test KYC Customer",
            "customer_email": "test.kyc@example.com",
            "verification_level": "standard"
        }
        
        response = api_session.post(f"{BASE_URL}/api/kyc/initiate", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "kyc_id" in data, "Response should contain kyc_id"
        assert "customer_id" in data, "Response should contain customer_id"
        assert "status" in data, "Response should contain status"
        assert "verification_level" in data, "Response should contain verification_level"
        assert "required_documents" in data, "Response should contain required_documents"
        
        assert data["status"] == "initiated", f"Initial status should be 'initiated', got {data['status']}"
        assert data["verification_level"] == "standard"
        
        print(f"✅ KYC Initiated: {data['kyc_id']}")
        print(f"   Status: {data['status']}, Level: {data['verification_level']}")
        print(f"   Required docs: {data['required_documents']}")
        
        # Store for later tests
        TestKYCAPIs.created_kyc_id = data['kyc_id']
    
    def test_kyc_initiate_enhanced(self, api_session):
        """POST /api/kyc/initiate - Initiate enhanced KYC process"""
        payload = {
            "customer_id": f"test_kyc_enhanced_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "customer_name": "Test Enhanced KYC Customer",
            "customer_email": "test.enhanced.kyc@example.com",
            "verification_level": "enhanced"
        }
        
        response = api_session.post(f"{BASE_URL}/api/kyc/initiate", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["verification_level"] == "enhanced"
        # Enhanced should require video verification
        assert data.get("video_verification", {}).get("required") == True, "Enhanced KYC should require video verification"
        
        print(f"✅ KYC Enhanced Initiated: {data['kyc_id']}")
        print(f"   Video verification required: {data.get('video_verification', {}).get('required')}")
    
    def test_kyc_dashboard_unauthorized(self):
        """GET /api/kyc/dashboard - Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/kyc/dashboard")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ KYC Dashboard correctly requires authentication")


# ============================================
# REPORTING API TESTS
# ============================================

class TestReportingAPIs:
    """Tests for Regulatory Reporting Service APIs"""
    
    def test_reporting_dashboard(self, api_session):
        """GET /api/reporting/dashboard - Get reporting dashboard"""
        response = api_session.get(f"{BASE_URL}/api/reporting/dashboard")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "by_status" in data, "Response should contain by_status breakdown"
        assert "by_type" in data, "Response should contain by_type breakdown"
        assert "total_reports" in data, "Response should contain total_reports"
        assert "pending_submission" in data, "Response should contain pending_submission count"
        assert "generated_at" in data, "Response should contain generated_at timestamp"
        
        print(f"✅ Reporting Dashboard: {data['total_reports']} total reports, {data['pending_submission']} pending")
        print(f"   Report types: {list(data.get('by_type', {}).keys())}")
    
    def test_generate_monthly_operations_report(self, api_session):
        """POST /api/reporting/monthly-operations - Generate monthly report"""
        now = datetime.now(timezone.utc)
        payload = {
            "year": now.year,
            "month": now.month
        }
        
        response = api_session.post(f"{BASE_URL}/api/reporting/monthly-operations", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "report_id" in data, "Response should contain report_id"
        assert "report_type" in data, "Response should contain report_type"
        assert "period" in data, "Response should contain period"
        assert "status" in data, "Response should contain status"
        assert "entity" in data, "Response should contain entity info"
        
        assert data["report_type"] == "monthly_operations"
        assert data["entity"]["name"] == "ManoBank S.A."
        assert data["entity"]["cif"] == "B19427723"
        
        print(f"✅ Monthly Operations Report: {data['report_id']}")
        print(f"   Period: {data['period']['year']}/{data['period']['month']}")
        print(f"   Status: {data['status']}")
        print(f"   Operations: {data.get('operations', {}).get('total_transactions', 0)} transactions")
        
        # Store for later tests
        TestReportingAPIs.created_report_id = data['report_id']
    
    def test_generate_daily_cash_report(self, api_session):
        """POST /api/reporting/daily-cash - Generate daily cash report"""
        payload = {}  # Use today's date
        
        response = api_session.post(f"{BASE_URL}/api/reporting/daily-cash", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "report_id" in data, "Response should contain report_id"
        assert "report_type" in data, "Response should contain report_type"
        assert "summary" in data, "Response should contain summary"
        assert "regulator" in data, "Response should contain regulator"
        
        assert data["report_type"] == "daily_cash"
        assert data["regulator"] == "SEPBLAC"
        
        print(f"✅ Daily Cash Report: {data['report_id']}")
        print(f"   Total transactions: {data['summary'].get('total_transactions', 0)}")
        print(f"   Total deposits: €{data['summary'].get('total_deposits', 0):,.2f}")
        print(f"   Total withdrawals: €{data['summary'].get('total_withdrawals', 0):,.2f}")
    
    def test_generate_daily_cash_report_with_date(self, api_session):
        """POST /api/reporting/daily-cash - Generate report for specific date"""
        payload = {
            "report_date": "2025-01-01T00:00:00+00:00"
        }
        
        response = api_session.post(f"{BASE_URL}/api/reporting/daily-cash", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "2025-01-01" in data.get("report_date", ""), "Report date should match requested date"
        
        print(f"✅ Daily Cash Report (specific date): {data['report_id']}")
    
    def test_reporting_dashboard_unauthorized(self):
        """GET /api/reporting/dashboard - Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/reporting/dashboard")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Reporting Dashboard correctly requires authentication")


# ============================================
# COMPLIANCE API TESTS
# ============================================

class TestComplianceAPIs:
    """Tests for Compliance Service APIs"""
    
    def test_compliance_summary(self, api_session):
        """GET /api/compliance/summary - Get compliance summary with entity info"""
        response = api_session.get(f"{BASE_URL}/api/compliance/summary")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "entity" in data, "Response should contain entity info"
        
        entity = data["entity"]
        assert entity.get("name") == "ManoBank S.A.", f"Entity name should be ManoBank S.A., got {entity.get('name')}"
        assert entity.get("cif") == "B19427723", f"CIF should be B19427723, got {entity.get('cif')}"
        assert entity.get("regulator") == "Banco de España", f"Regulator should be Banco de España"
        
        print(f"✅ Compliance Summary: {entity['name']} (CIF: {entity['cif']})")
        print(f"   Regulator: {entity['regulator']}")
        print(f"   License: {entity.get('license_type', 'N/A')}")
    
    def test_compliance_policies(self, api_session):
        """GET /api/compliance/policies - List compliance policies"""
        response = api_session.get(f"{BASE_URL}/api/compliance/policies")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "policies" in data, "Response should contain policies list"
        
        policies = data["policies"]
        assert len(policies) >= 1, "Should have at least one policy"
        
        # Check for expected policies
        policy_names = [p.get("name", "") for p in policies]
        print(f"✅ Compliance Policies: {len(policies)} policies found")
        for name in policy_names:
            print(f"   - {name}")
    
    def test_compliance_summary_unauthorized(self):
        """GET /api/compliance/summary - Should require authentication"""
        response = requests.get(f"{BASE_URL}/api/compliance/summary")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Compliance Summary correctly requires authentication")


# ============================================
# INTEGRATION TESTS
# ============================================

class TestIntegration:
    """Integration tests for banking core services"""
    
    def test_full_kyc_aml_flow(self, api_session):
        """Test complete KYC + AML screening flow"""
        # 1. Initiate KYC
        customer_id = f"test_integration_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        customer_name = "Integration Test Customer"
        
        kyc_response = api_session.post(f"{BASE_URL}/api/kyc/initiate", json={
            "customer_id": customer_id,
            "customer_name": customer_name,
            "customer_email": "integration.test@example.com",
            "verification_level": "standard"
        })
        
        assert kyc_response.status_code == 200, f"KYC initiation failed: {kyc_response.text}"
        kyc_data = kyc_response.json()
        
        # 2. Screen customer for AML
        aml_response = api_session.post(f"{BASE_URL}/api/aml/screen-customer", json={
            "customer_id": customer_id,
            "full_name": customer_name,
            "nationality": "ES"
        })
        
        assert aml_response.status_code == 200, f"AML screening failed: {aml_response.text}"
        aml_data = aml_response.json()
        
        # 3. Verify both processes completed
        assert kyc_data["kyc_id"].startswith("KYC_"), "KYC ID should have correct format"
        assert aml_data["screening_id"].startswith("CUS_"), "AML screening ID should have correct format"
        
        print(f"✅ Integration Test: KYC + AML flow completed")
        print(f"   KYC ID: {kyc_data['kyc_id']}")
        print(f"   AML Screening: {aml_data['screening_id']}")
        print(f"   AML Risk: {aml_data['risk_level']} (score: {aml_data['risk_score']})")
        print(f"   Onboarding allowed: {aml_data['onboarding_allowed']}")


# ============================================
# RUN TESTS
# ============================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
