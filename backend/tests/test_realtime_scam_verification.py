"""
ManoProtect - Real-Time Scam Verification API Tests
Tests for LIVE threat intelligence APIs:
- Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX
- MongoDB community database for scam reports
"""
import pytest
import requests
import os
import time
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable is required")

print(f"Testing against: {BASE_URL}")


class TestAPIStatus:
    """Test API status and configuration"""
    
    def test_api_status_endpoint(self):
        """Test /api/realtime/status returns proper API configuration"""
        response = requests.get(f"{BASE_URL}/api/realtime/status")
        assert response.status_code == 200, f"Status API failed: {response.text}"
        
        data = response.json()
        
        # Verify overall status
        assert data.get("overall_status") == "LIVE", "APIs should be LIVE"
        
        # Verify all APIs are configured
        apis = data.get("apis", {})
        assert "google_safe_browsing" in apis, "Google Safe Browsing should be listed"
        assert "virustotal" in apis, "VirusTotal should be listed"
        assert "abuseipdb" in apis, "AbuseIPDB should be listed"
        assert "alienvault_otx" in apis, "AlienVault OTX should be listed"
        assert "manoprotect_community" in apis, "ManoProtect Community should be listed"
        
        # Verify all APIs are configured and LIVE
        for api_name, api_info in apis.items():
            assert api_info.get("configured") == True, f"{api_name} should be configured"
            assert "LIVE" in api_info.get("status", ""), f"{api_name} should be LIVE"
        
        print(f"API Status: {data['overall_status']}")
        print(f"Total verifications: {data.get('stats', {}).get('total_verifications', 0)}")


class TestURLVerification:
    """Test URL verification with REAL threat intelligence APIs"""
    
    def test_check_safe_url(self):
        """Test verification of a known safe URL (google.com)"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "https://www.google.com"}
        )
        assert response.status_code == 200, f"URL check failed: {response.text}"
        
        data = response.json()
        assert "is_safe" in data, "Response should include is_safe field"
        assert "risk_score" in data, "Response should include risk_score field"
        assert "checks" in data, "Response should include checks array"
        
        # Google.com should be safe
        assert data["is_safe"] == True, "google.com should be marked as safe"
        assert data["risk_score"] <= 20, f"google.com risk score should be low, got {data['risk_score']}"
        
        # Should have real API checks
        assert len(data["checks"]) >= 1, "Should have at least 1 API check"
        
        # Verify database status is LIVE
        assert data.get("database_status") == "LIVE", "Database status should be LIVE"
        
        print(f"Safe URL check: is_safe={data['is_safe']}, risk_score={data['risk_score']}")
        print(f"APIs consulted: {[c.get('source') for c in data['checks']]}")
    
    def test_check_suspicious_url(self):
        """Test verification of a suspicious/short URL pattern"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "https://bit.ly/suspicious-link"}
        )
        assert response.status_code == 200, f"URL check failed: {response.text}"
        
        data = response.json()
        
        # Short URLs should trigger warnings
        assert data["risk_score"] >= 20, "Short URL should have elevated risk score"
        assert len(data.get("warnings", [])) > 0, "Should have warnings for short URL"
        
        print(f"Suspicious URL check: risk_score={data['risk_score']}")
        print(f"Warnings: {data.get('warnings', [])}")
    
    def test_check_url_with_bank_pattern(self):
        """Test URL with suspicious banking pattern"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "https://login-santander-verify.fake.ru"}
        )
        assert response.status_code == 200, f"URL check failed: {response.text}"
        
        data = response.json()
        
        # Should detect bank phishing pattern
        assert data["risk_score"] >= 25, "Bank phishing URL should have high risk score"
        assert data["is_safe"] == False or data["risk_score"] >= 50, "Should be flagged as unsafe or high risk"
        
        print(f"Bank phishing URL: is_safe={data['is_safe']}, risk_score={data['risk_score']}")
    
    def test_url_normalization(self):
        """Test URL is properly normalized"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "example.com"}  # Without https://
        )
        assert response.status_code == 200, f"URL normalization failed: {response.text}"
        
        data = response.json()
        assert data["url"].startswith("https://"), "URL should be normalized with https://"


class TestPhoneVerification:
    """Test phone number verification"""
    
    def test_check_spanish_phone(self):
        """Test verification of a Spanish phone number"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "612345678", "country_code": "ES"}
        )
        assert response.status_code == 200, f"Phone check failed: {response.text}"
        
        data = response.json()
        assert "is_safe" in data, "Response should include is_safe field"
        assert "risk_score" in data, "Response should include risk_score field"
        assert "phone" in data, "Response should include normalized phone"
        
        # Should be normalized with +34 prefix
        assert data["phone"].startswith("+34"), "Spanish phone should have +34 prefix"
        assert data.get("database_status") == "LIVE", "Database status should be LIVE"
        
        print(f"Spanish phone check: phone={data['phone']}, risk_score={data['risk_score']}")
    
    def test_check_premium_rate_number(self):
        """Test detection of Spanish premium rate numbers"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "803123456", "country_code": "ES"}
        )
        assert response.status_code == 200, f"Phone check failed: {response.text}"
        
        data = response.json()
        
        # Premium rate numbers should have warnings
        assert data["risk_score"] >= 25, "Premium rate number should have elevated risk"
        warnings_text = " ".join(data.get("warnings", []))
        assert "tarificacion" in warnings_text.lower() or "coste" in warnings_text.lower(), \
            "Should warn about premium rate"
        
        print(f"Premium rate number: risk_score={data['risk_score']}")
        print(f"Warnings: {data.get('warnings', [])}")
    
    def test_check_nigerian_phone(self):
        """Test high-risk country prefix detection (Nigeria +234)"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "+2341234567890", "country_code": "NG"}
        )
        assert response.status_code == 200, f"Phone check failed: {response.text}"
        
        data = response.json()
        
        # Nigerian numbers should have country risk warning
        assert data["risk_score"] >= 15, "Nigerian number should have some risk score"
        
        print(f"Nigerian phone check: risk_score={data['risk_score']}")
    
    def test_phone_normalization(self):
        """Test phone normalization with various formats"""
        # Test with spaces and dashes
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "612-345-678", "country_code": "ES"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should strip non-numeric characters
        assert "-" not in data["phone"], "Phone should be normalized without dashes"


class TestEmailVerification:
    """Test email verification"""
    
    def test_check_normal_email(self):
        """Test verification of a normal email"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/email",
            json={"email": "test@gmail.com"}
        )
        assert response.status_code == 200, f"Email check failed: {response.text}"
        
        data = response.json()
        assert "is_safe" in data, "Response should include is_safe field"
        assert "risk_score" in data, "Response should include risk_score field"
        assert data.get("database_status") == "LIVE", "Database status should be LIVE"
        
        print(f"Normal email check: is_safe={data['is_safe']}, risk_score={data['risk_score']}")
    
    def test_check_temp_email(self):
        """Test detection of temporary/disposable email services"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/email",
            json={"email": "spam@tempmail.com"}
        )
        assert response.status_code == 200, f"Email check failed: {response.text}"
        
        data = response.json()
        
        # Temp email should have warnings
        assert data["risk_score"] >= 20, "Temp email should have elevated risk"
        
        print(f"Temp email check: risk_score={data['risk_score']}")
    
    def test_check_suspicious_bank_email(self):
        """Test detection of bank impersonation email"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/email",
            json={"email": "banco.santander@gmail.com"}
        )
        assert response.status_code == 200, f"Email check failed: {response.text}"
        
        data = response.json()
        
        # Bank using gmail should be suspicious
        assert data["risk_score"] >= 30, "Bank impersonation email should have high risk"
        
        print(f"Bank impersonation email: risk_score={data['risk_score']}")


class TestIPVerification:
    """Test IP address verification with REAL threat intelligence APIs"""
    
    def test_check_valid_ip(self):
        """Test verification of a valid public IP"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/ip",
            json={"ip_address": "8.8.8.8"}  # Google DNS
        )
        assert response.status_code == 200, f"IP check failed: {response.text}"
        
        data = response.json()
        assert "is_safe" in data, "Response should include is_safe field"
        assert "risk_score" in data, "Response should include risk_score field"
        assert "checks" in data, "Response should include checks array"
        
        # Google DNS should be safe
        assert data["is_safe"] == True, "8.8.8.8 should be marked as safe"
        
        # Should have real API checks
        assert len(data["checks"]) >= 1, "Should have at least 1 API check"
        
        print(f"Google DNS check: is_safe={data['is_safe']}, risk_score={data['risk_score']}")
        print(f"APIs consulted: {[c.get('source') for c in data['checks']]}")
    
    def test_check_invalid_ip_format(self):
        """Test rejection of invalid IP format"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/ip",
            json={"ip_address": "not-an-ip"}
        )
        assert response.status_code == 400, "Invalid IP should return 400"
        
        data = response.json()
        assert "detail" in data, "Should have error detail"
        print(f"Invalid IP correctly rejected: {data.get('detail')}")
    
    def test_check_private_ip(self):
        """Test verification of a private IP"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/ip",
            json={"ip_address": "192.168.1.1"}
        )
        assert response.status_code == 200, f"IP check failed: {response.text}"
        
        data = response.json()
        # Private IPs should be safe (not in threat databases)
        assert data["is_safe"] == True, "Private IP should be safe"
        
        print(f"Private IP check: is_safe={data['is_safe']}")


class TestScamReporting:
    """Test scam reporting and persistence in MongoDB"""
    
    def test_report_phone_scam(self):
        """Test reporting a phone scam - should persist in MongoDB"""
        unique_phone = f"+34TEST{int(time.time())}"
        
        response = requests.post(
            f"{BASE_URL}/api/realtime/report",
            json={
                "scam_type": "vishing",
                "contact_info": unique_phone,
                "description": "TEST: Llamada fraudulenta de soporte técnico falso",
                "reporter_email": "test@manoprotect.com"
            }
        )
        assert response.status_code == 200, f"Report failed: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Report should succeed"
        assert data.get("database_status") == "PERSISTENT", "Should persist in MongoDB"
        
        print(f"Scam report created: {data.get('message')}")
        
        # Verify it was persisted by checking the phone
        time.sleep(1)  # Wait for persistence
        check_response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": unique_phone, "country_code": "ES"}
        )
        assert check_response.status_code == 200
        
        check_data = check_response.json()
        # The newly reported number should show up
        assert check_data["risk_score"] >= 40, "Reported phone should have elevated risk"
        
        print(f"Reported phone now has risk_score={check_data['risk_score']}")
    
    def test_report_email_scam(self):
        """Test reporting an email scam"""
        unique_email = f"test_scam_{int(time.time())}@fraudsite.com"
        
        response = requests.post(
            f"{BASE_URL}/api/realtime/report",
            json={
                "scam_type": "phishing",
                "contact_info": unique_email,
                "description": "TEST: Email de phishing suplantando banco",
                "amount_lost": 500.00
            }
        )
        assert response.status_code == 200, f"Report failed: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        
        print(f"Email scam report: {data.get('message')}")
    
    def test_duplicate_report_increments_count(self):
        """Test that duplicate reports increment the count"""
        test_contact = "duplicate_test@example.com"
        
        # First report
        response1 = requests.post(
            f"{BASE_URL}/api/realtime/report",
            json={
                "scam_type": "smishing",
                "contact_info": test_contact,
                "description": "First report"
            }
        )
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Second report (same contact)
        response2 = requests.post(
            f"{BASE_URL}/api/realtime/report",
            json={
                "scam_type": "smishing",
                "contact_info": test_contact,
                "description": "Second report"
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Count should increment
        if data1.get("total_reports", 0) == 1:
            assert data2.get("total_reports", 0) >= 2, "Duplicate should increment count"
            print(f"Duplicate reports counted: {data2.get('total_reports')}")


class TestTrendingScams:
    """Test trending scams endpoint"""
    
    def test_get_trending_scams(self):
        """Test /api/realtime/trending returns data from MongoDB"""
        response = requests.get(f"{BASE_URL}/api/realtime/trending")
        assert response.status_code == 200, f"Trending API failed: {response.text}"
        
        data = response.json()
        
        # Should have trending array and stats
        assert "trending" in data, "Response should have trending array"
        assert "stats" in data, "Response should have stats"
        
        stats = data.get("stats", {})
        assert "total_reports" in stats, "Stats should have total_reports"
        assert "LIVE" in stats.get("database_status", ""), "Database should be LIVE"
        
        print(f"Trending scams: {len(data.get('trending', []))} items")
        print(f"Total reports in database: {stats.get('total_reports', 0)}")
        print(f"Reports this week: {stats.get('reports_this_week', 0)}")


class TestBulkCheck:
    """Test bulk URL checking (for Chrome Extension)"""
    
    def test_bulk_url_check(self):
        """Test checking multiple URLs at once"""
        urls = [
            "https://google.com",
            "https://amazon.es",
            "https://bit.ly/suspicious"
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/bulk",
            json=urls
        )
        assert response.status_code == 200, f"Bulk check failed: {response.text}"
        
        data = response.json()
        assert "results" in data, "Should have results array"
        assert len(data["results"]) == len(urls), "Should check all URLs"
        
        # Each result should have required fields
        for result in data["results"]:
            assert "url" in result
            assert "is_safe" in result
            assert "risk_score" in result
        
        print(f"Bulk check results: {len(data['results'])} URLs checked")
        for r in data["results"]:
            print(f"  - {r['url'][:30]}: safe={r['is_safe']}, score={r['risk_score']}")


# Run pytest
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
