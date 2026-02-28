"""
ManoProtect - CRO System Tests
Tests for:
- A/B Testing endpoints (hero_headline, cta_text)
- Conversion tracking (page_view, cta_click, begin_checkout, purchase_complete)
- Email sequences (start, stop, convert, pending, process)
- Funnel metrics and CRO dashboard
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestABTesting:
    """A/B Testing API tests"""
    
    def test_get_hero_headline_variant(self):
        """GET /api/cro/ab-test/hero_headline - assigns A/B variant"""
        response = requests.get(f"{BASE_URL}/api/cro/ab-test/hero_headline")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "test_id" in data, "Response should contain test_id"
        assert data["test_id"] == "hero_headline"
        assert "variant" in data, "Response should contain variant"
        assert data["variant"] in ["control", "variant_a"], f"Unexpected variant: {data['variant']}"
        assert "config" in data, "Response should contain config"
        assert "visitor_id" in data, "Response should contain visitor_id"
        
        # Verify config structure
        config = data["config"]
        assert "headline" in config, "Config should have headline"
        assert "subtitle" in config, "Config should have subtitle"
        print(f"✓ Hero headline test assigned variant: {data['variant']}")
        print(f"  Headline: {config['headline'][:50]}...")
    
    def test_get_cta_text_variant(self):
        """GET /api/cro/ab-test/cta_text - assigns CTA A/B variant"""
        response = requests.get(f"{BASE_URL}/api/cro/ab-test/cta_text")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "test_id" in data
        assert data["test_id"] == "cta_text"
        assert data["variant"] in ["control", "variant_a"]
        
        config = data["config"]
        assert "text" in config, "Config should have text"
        assert "color" in config, "Config should have color"
        print(f"✓ CTA test assigned variant: {data['variant']}")
        print(f"  CTA text: {config['text']}")
    
    def test_ab_test_not_found(self):
        """GET /api/cro/ab-test/invalid_test - returns 404"""
        response = requests.get(f"{BASE_URL}/api/cro/ab-test/invalid_test_id")
        assert response.status_code == 404, f"Expected 404 for invalid test, got {response.status_code}"
        print("✓ Invalid test returns 404")
    
    def test_get_hero_headline_results(self):
        """GET /api/cro/ab-test/hero_headline/results - shows test results"""
        response = requests.get(f"{BASE_URL}/api/cro/ab-test/hero_headline/results")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "test_id" in data
        assert data["test_id"] == "hero_headline"
        assert "variants" in data
        
        # Should have results for control and variant_a
        variants = data["variants"]
        assert "control" in variants, "Results should include control"
        assert "variant_a" in variants, "Results should include variant_a"
        
        # Verify result structure
        for variant_name, results in variants.items():
            assert "visitors" in results
            assert "cta_clicks" in results
            assert "purchases" in results
            assert "click_rate" in results
            assert "purchase_rate" in results
            print(f"  {variant_name}: {results['visitors']} visitors, {results['click_rate']}% click rate")
        
        print("✓ A/B test results retrieved successfully")


class TestConversionTracking:
    """Conversion tracking API tests"""
    
    def test_track_page_view(self):
        """POST /api/cro/track - tracks page_view event"""
        payload = {
            "event_type": "page_view",
            "page": "/",
            "variant": "control",
            "test_id": "hero_headline",
            "metadata": {"source": "test"}
        }
        response = requests.post(f"{BASE_URL}/api/cro/track", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["status"] == "tracked"
        assert "event_id" in data
        print(f"✓ Page view tracked with event_id: {data['event_id']}")
    
    def test_track_cta_click(self):
        """POST /api/cro/track - tracks cta_click event"""
        payload = {
            "event_type": "cta_click",
            "page": "/",
            "variant": "control",
            "test_id": "hero_headline",
            "metadata": {"location": "hero", "label": "proteger_hijo"}
        }
        response = requests.post(f"{BASE_URL}/api/cro/track", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "tracked"
        print(f"✓ CTA click tracked: {data['event_id']}")
    
    def test_track_begin_checkout(self):
        """POST /api/cro/track - tracks begin_checkout event"""
        payload = {
            "event_type": "begin_checkout",
            "page": "/registro",
            "metadata": {"plan": "mensual"}
        }
        response = requests.post(f"{BASE_URL}/api/cro/track", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "tracked"
        print(f"✓ Begin checkout tracked: {data['event_id']}")
    
    def test_track_purchase_complete(self):
        """POST /api/cro/track - tracks purchase_complete event"""
        payload = {
            "event_type": "purchase_complete",
            "page": "/payment-success",
            "metadata": {"plan": "anual", "amount": 99.99}
        }
        response = requests.post(f"{BASE_URL}/api/cro/track", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "tracked"
        print(f"✓ Purchase tracked: {data['event_id']}")


class TestConversionFunnel:
    """Conversion funnel metrics tests"""
    
    def test_get_funnel_metrics(self):
        """GET /api/cro/funnel - conversion funnel metrics"""
        response = requests.get(f"{BASE_URL}/api/cro/funnel")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "period_days" in data
        assert "funnel" in data
        assert "total_views" in data
        assert "total_purchases" in data
        assert "conversion_rate" in data
        
        # Verify funnel structure
        funnel = data["funnel"]
        assert isinstance(funnel, list)
        funnel_steps = [step["step"] for step in funnel]
        assert "page_view" in funnel_steps
        assert "cta_click" in funnel_steps
        assert "begin_checkout" in funnel_steps
        assert "purchase_complete" in funnel_steps
        
        print(f"✓ Funnel metrics retrieved:")
        print(f"  Total views: {data['total_views']}")
        print(f"  Total purchases: {data['total_purchases']}")
        print(f"  Conversion rate: {data['conversion_rate']}%")
    
    def test_get_funnel_with_custom_days(self):
        """GET /api/cro/funnel?days=30 - funnel for custom period"""
        response = requests.get(f"{BASE_URL}/api/cro/funnel?days=30")
        assert response.status_code == 200
        
        data = response.json()
        assert data["period_days"] == 30
        print(f"✓ 30-day funnel retrieved with {data['total_views']} views")


class TestEmailSequences:
    """Email sequence automation tests"""
    
    @pytest.fixture
    def test_email(self):
        return f"test_{uuid.uuid4().hex[:8]}@testcro.com"
    
    def test_start_email_sequence(self, test_email):
        """POST /api/cro/email-sequence/start - starts email sequence"""
        payload = {
            "email": test_email,
            "name": "Test User",
            "source": "landing_test"
        }
        response = requests.post(f"{BASE_URL}/api/cro/email-sequence/start", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["status"] in ["started", "already_active"]
        assert "sequence_id" in data
        print(f"✓ Email sequence started for {test_email}")
        print(f"  Sequence ID: {data['sequence_id']}")
        return data["sequence_id"]
    
    def test_start_duplicate_sequence(self, test_email):
        """POST /api/cro/email-sequence/start - duplicate returns already_active"""
        # Start first sequence
        payload = {"email": test_email, "name": "Test", "source": "test"}
        requests.post(f"{BASE_URL}/api/cro/email-sequence/start", json=payload)
        
        # Try starting duplicate
        response = requests.post(f"{BASE_URL}/api/cro/email-sequence/start", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "already_active"
        print("✓ Duplicate sequence returns already_active")
    
    def test_stop_email_sequence(self, test_email):
        """POST /api/cro/email-sequence/stop - stops email sequence"""
        # First start a sequence
        start_payload = {"email": test_email, "name": "Test", "source": "test"}
        requests.post(f"{BASE_URL}/api/cro/email-sequence/start", json=start_payload)
        
        # Now stop it
        stop_payload = {"email": test_email}
        response = requests.post(f"{BASE_URL}/api/cro/email-sequence/stop", json=stop_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "stopped"
        assert "sequences_stopped" in data
        print(f"✓ Email sequence stopped for {test_email}")
    
    def test_mark_converted(self, test_email):
        """POST /api/cro/email-sequence/convert - marks user converted"""
        # First start a sequence
        start_payload = {"email": test_email, "name": "Test", "source": "test"}
        requests.post(f"{BASE_URL}/api/cro/email-sequence/start", json=start_payload)
        
        # Mark as converted
        convert_payload = {"email": test_email}
        response = requests.post(f"{BASE_URL}/api/cro/email-sequence/convert", json=convert_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "converted"
        assert "sequences_updated" in data
        print(f"✓ User {test_email} marked as converted")
    
    def test_get_pending_emails(self):
        """GET /api/cro/email-sequence/pending - gets pending emails"""
        response = requests.get(f"{BASE_URL}/api/cro/email-sequence/pending")
        assert response.status_code == 200
        
        data = response.json()
        assert "pending_count" in data
        assert "emails" in data
        assert isinstance(data["emails"], list)
        print(f"✓ Pending emails retrieved: {data['pending_count']} pending")
    
    def test_process_pending_emails(self):
        """POST /api/cro/email-sequence/process - processes email queue"""
        response = requests.post(f"{BASE_URL}/api/cro/email-sequence/process")
        assert response.status_code == 200
        
        data = response.json()
        assert "processed" in data
        print(f"✓ Email queue processed: {data['processed']} emails")


class TestCRODashboard:
    """CRO Dashboard tests"""
    
    def test_get_dashboard(self):
        """GET /api/cro/dashboard - CRO dashboard metrics"""
        response = requests.get(f"{BASE_URL}/api/cro/dashboard")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "today" in data, "Dashboard should have today's metrics"
        assert "email_sequences" in data, "Dashboard should have email sequence stats"
        assert "ab_tests_active" in data, "Dashboard should list active A/B tests"
        assert "generated_at" in data
        
        # Verify today structure
        today = data["today"]
        assert "page_views" in today
        assert "cta_clicks" in today
        assert "click_rate" in today
        
        # Verify email sequences structure
        email_seq = data["email_sequences"]
        assert "active" in email_seq
        assert "converted" in email_seq
        
        # Verify A/B tests
        ab_tests = data["ab_tests_active"]
        assert "hero_headline" in ab_tests
        assert "cta_text" in ab_tests
        
        print("✓ CRO Dashboard retrieved:")
        print(f"  Today's views: {today['page_views']}")
        print(f"  Today's clicks: {today['cta_clicks']}")
        print(f"  Click rate: {today['click_rate']}%")
        print(f"  Active email sequences: {email_seq['active']}")
        print(f"  Active A/B tests: {ab_tests}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
