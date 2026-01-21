import requests
import sys
import json
from datetime import datetime

class MANOAPITester:
    def __init__(self, base_url="https://modern-bank-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                result["error"] = response.text

            self.test_results.append(result)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_analyze_threat(self):
        """Test threat analysis endpoint"""
        test_data = {
            "content": "Hola, soy del banco. Necesito que me confirmes tu número de tarjeta urgentemente.",
            "content_type": "sms",
            "user_id": "demo-user"
        }
        return self.run_test("Analyze Threat", "POST", "analyze", 200, data=test_data, timeout=45)

    def test_get_threats(self):
        """Test get threats endpoint"""
        return self.run_test("Get Threats", "GET", "threats?user_id=demo-user", 200)

    def test_get_stats(self):
        """Test get stats endpoint"""
        return self.run_test("Get Stats", "GET", "stats?user_id=demo-user", 200)

    def test_create_contact(self):
        """Test create trusted contact"""
        test_data = {
            "name": "Test Contact",
            "phone": "+34666123456",
            "relationship": "family"
        }
        return self.run_test("Create Contact", "POST", "contacts?user_id=demo-user", 200, data=test_data)

    def test_get_contacts(self):
        """Test get contacts endpoint"""
        return self.run_test("Get Contacts", "GET", "contacts?user_id=demo-user", 200)

    def test_analyze_safe_content(self):
        """Test analysis of safe content"""
        test_data = {
            "content": "Hola mamá, llegué bien al trabajo. Te llamo luego.",
            "content_type": "sms",
            "user_id": "demo-user"
        }
        return self.run_test("Analyze Safe Content", "POST", "analyze", 200, data=test_data, timeout=45)

    def test_sos_alert(self):
        """Test SOS alert functionality"""
        test_data = {
            "user_id": "demo-user",
            "location": "Test Location",
            "message": "Test SOS message"
        }
        return self.run_test("SOS Alert", "POST", "sos", 200, data=test_data)

    def test_community_alerts(self):
        """Test community alerts endpoint"""
        return self.run_test("Community Alerts", "GET", "community-alerts?limit=10", 200)

    def test_export_threats(self):
        """Test export threats functionality"""
        return self.run_test("Export Threats", "GET", "export/threats?user_id=demo-user&format=csv", 200)

    def test_knowledge_base(self):
        """Test knowledge base endpoint"""
        return self.run_test("Knowledge Base", "GET", "knowledge-base", 200)

    def test_get_user(self):
        """Test get user endpoint"""
        return self.run_test("Get User", "GET", "users/demo-user", 200)

    def test_update_user_settings(self):
        """Test update user settings"""
        test_data = {
            "dark_mode": True,
            "notifications_enabled": False,
            "auto_block": True
        }
        return self.run_test("Update User Settings", "PATCH", "users/demo-user", 200, data=test_data)

    def test_share_threat(self):
        """Test share threat functionality"""
        # First get a threat ID
        success, threats_response = self.test_get_threats()
        if success and threats_response and len(threats_response) > 0:
            threat_id = threats_response[0]['id']
            return self.run_test("Share Threat", "POST", f"threats/{threat_id}/share", 200)
        else:
            print("⚠️  Skipping share threat test - no threats available")
            return False, {}

    def test_report_false_positive(self):
        """Test report false positive functionality"""
        # First get a threat ID
        success, threats_response = self.test_get_threats()
        if success and threats_response and len(threats_response) > 0:
            threat_id = threats_response[0]['id']
            return self.run_test("Report False Positive", "POST", f"threats/{threat_id}/report", 200)
        else:
            print("⚠️  Skipping false positive test - no threats available")
            return False, {}

    def test_delete_contact(self):
        """Test delete contact functionality"""
        # First get a contact ID
        success, contacts_response = self.test_get_contacts()
        if success and contacts_response and len(contacts_response) > 0:
            contact_id = contacts_response[0]['id']
            return self.run_test("Delete Contact", "DELETE", f"contacts/{contact_id}", 200)
        else:
            print("⚠️  Skipping delete contact test - no contacts available")
            return False, {}

def main():
    print("🛡️  MANO API Testing Suite")
    print("=" * 50)
    
    tester = MANOAPITester()
    
    # Test sequence
    print("\n📡 Testing API connectivity...")
    tester.test_root_endpoint()
    
    print("\n📊 Testing statistics endpoint...")
    tester.test_get_stats()
    
    print("\n📋 Testing threats history...")
    tester.test_get_threats()
    
    print("\n🔍 Testing threat analysis (malicious content)...")
    success, response = tester.test_analyze_threat()
    if success and response:
        print(f"   Analysis result: {'THREAT' if response.get('is_threat') else 'SAFE'}")
        print(f"   Risk level: {response.get('risk_level', 'unknown')}")
    
    print("\n✅ Testing safe content analysis...")
    success, response = tester.test_analyze_safe_content()
    if success and response:
        print(f"   Analysis result: {'THREAT' if response.get('is_threat') else 'SAFE'}")
        print(f"   Risk level: {response.get('risk_level', 'unknown')}")
    
    print("\n👥 Testing contacts management...")
    tester.test_create_contact()
    tester.test_get_contacts()
    
    print("\n🚨 Testing SOS functionality...")
    tester.test_sos_alert()
    
    print("\n🌐 Testing community alerts...")
    tester.test_community_alerts()
    
    print("\n📤 Testing export functionality...")
    tester.test_export_threats()
    
    print("\n📚 Testing knowledge base...")
    tester.test_knowledge_base()
    
    print("\n👤 Testing user management...")
    tester.test_get_user()
    tester.test_update_user_settings()
    
    print("\n🔗 Testing threat sharing...")
    tester.test_share_threat()
    
    print("\n🚩 Testing false positive reporting...")
    tester.test_report_false_positive()
    
    print("\n🗑️ Testing contact deletion...")
    tester.test_delete_contact()
    
    # Print final results
    print(f"\n📊 Test Results Summary")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())