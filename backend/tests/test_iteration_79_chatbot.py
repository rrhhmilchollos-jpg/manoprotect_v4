"""
Test Iteration 79 - ChatWidget and Lead Capture API Tests
Tests the chatbot lead capture functionality via enterprise-central leads endpoint
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChatbotLeadAPI:
    """Tests for the chatbot lead capture API endpoint"""
    
    def test_create_chatbot_lead(self):
        """Test POST /api/enterprise-central/leads creates a lead with source=chatbot"""
        lead_data = {
            "name": "TEST_ChatbotIteration79",
            "email": "test_chatbot_79@test.com",
            "phone": "699888777",
            "source": "chatbot",
            "interest": "interes-essential",
            "notes": "Lead captado via chatbot web. Contexto: interes-essential"
        }
        
        response = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=lead_data)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "lead_id" in data, "Response should contain lead_id"
        assert data["status"] == "new", f"Expected status 'new', got '{data.get('status')}'"
        assert "message" in data, "Response should contain message"
        
        return data["lead_id"]
    
    def test_verify_chatbot_lead_persistence(self):
        """Test that chatbot lead was persisted and can be retrieved"""
        # First create a lead
        lead_data = {
            "name": "TEST_ChatbotPersistence79",
            "email": "test_persistence_79@test.com",
            "phone": "611222333",
            "source": "chatbot",
            "interest": "asesor",
            "notes": "Test lead for persistence verification"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=lead_data)
        assert create_response.status_code == 200
        lead_id = create_response.json()["lead_id"]
        
        # GET to verify persistence
        get_response = requests.get(f"{BASE_URL}/api/enterprise-central/leads?limit=20")
        assert get_response.status_code == 200
        
        leads = get_response.json()["leads"]
        found_lead = next((l for l in leads if l["lead_id"] == lead_id), None)
        
        assert found_lead is not None, f"Lead {lead_id} should be in the list"
        assert found_lead["name"] == lead_data["name"], "Name should match"
        assert found_lead["source"] == "chatbot", "Source should be chatbot"
        assert found_lead["interest"] == "asesor", "Interest should match"
    
    def test_lead_with_generated_email(self):
        """Test lead with phone-based generated email (chatbot behavior)"""
        lead_data = {
            "name": "TEST_PhoneOnlyLead79",
            "email": "612345678@chat.manoprotectt.com",  # Generated from phone
            "phone": "612345678",
            "source": "chatbot",
            "interest": "precios-hogar",
            "notes": "Lead with generated email from phone"
        }
        
        response = requests.post(f"{BASE_URL}/api/enterprise-central/leads", json=lead_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "lead_id" in data
    
    def test_get_leads_list(self):
        """Test GET /api/enterprise-central/leads returns leads list"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads?limit=10")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "leads" in data, "Response should contain leads array"
        assert "total" in data, "Response should contain total count"
        assert isinstance(data["leads"], list), "Leads should be a list"
    
    def test_get_leads_with_source_filter(self):
        """Test filtering leads by status"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads?status=new&limit=10")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "leads" in data
        # All returned leads should have status 'new'
        for lead in data["leads"]:
            assert lead["status"] == "new", f"Lead {lead['lead_id']} should have status 'new'"


class TestLeadPipelineAPI:
    """Tests for the sales pipeline endpoint"""
    
    def test_get_pipeline(self):
        """Test GET /api/enterprise-central/leads/pipeline"""
        response = requests.get(f"{BASE_URL}/api/enterprise-central/leads/pipeline")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "pipeline" in data, "Response should contain pipeline"
        assert "stages" in data, "Response should contain stages"
        assert "new" in data["stages"], "Stages should include 'new'"
        assert "closed" in data["stages"], "Stages should include 'closed'"


class TestAPIHealthCheck:
    """Basic API health checks"""
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
    
    def test_heartbeat_endpoint(self):
        """Test /api/heartbeat endpoint"""
        response = requests.get(f"{BASE_URL}/api/heartbeat")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
