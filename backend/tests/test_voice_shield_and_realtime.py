"""
Test Voice Shield and Real-Time Scam Verification APIs
Tests the new AI Voice Shield endpoints and real-time scam detection
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://protect-staging-1.preview.emergentagent.com')


class TestVoiceShieldAPI:
    """AI Voice Shield endpoint tests"""
    
    def test_analyze_transcript_scam_detection(self):
        """Test /api/voice-shield/analyze-transcript with scam transcript"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Buenos dias, le llamamos del banco Santander. Su cuenta ha sido bloqueada por movimientos sospechosos. Necesitamos que nos proporcione su numero de tarjeta para verificar su identidad.",
                "caller_number": "+34600123456",
                "call_duration_seconds": 120,
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "risk_score" in data
        assert "risk_level" in data
        assert "alerts" in data
        assert "recommendations" in data
        
        # Should detect as high risk
        assert data["risk_score"] >= 50, f"Expected high risk score, got {data['risk_score']}"
        assert data["risk_level"] in ["HIGH", "CRITICAL"]
        assert len(data["alerts"]) > 0
        print(f"✅ Scam detection working: risk_score={data['risk_score']}, risk_level={data['risk_level']}")
    
    def test_analyze_transcript_clean_conversation(self):
        """Test /api/voice-shield/analyze-transcript with normal transcript"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Hola, buenos dias. Te llamaba para preguntarte si quedamos manana para tomar un cafe. Hace tiempo que no nos vemos.",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] < 30, f"Expected low risk score, got {data['risk_score']}"
        assert data["risk_level"] == "LOW"
        print(f"✅ Clean conversation detected: risk_score={data['risk_score']}")
    
    def test_analyze_transcript_urgency_detection(self):
        """Test detection of urgency patterns"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Esto es urgente! Tiene que actuar ahora mismo, es la ultima oportunidad, la oferta expira hoy!",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] >= 20
        urgency_found = any("urgencia" in alert["description"].lower() or "urgency" in alert["description"].lower() 
                          for alert in data["alerts"])
        print(f"✅ Urgency patterns detected: risk_score={data['risk_score']}")
    
    def test_analyze_transcript_financial_pressure(self):
        """Test detection of financial pressure patterns"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Necesitamos que haga una transferencia ahora. Dame tu numero de tarjeta de credito, el CVV y el PIN.",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] >= 50
        assert data["risk_level"] in ["HIGH", "CRITICAL"]
        print(f"✅ Financial pressure detected: risk_score={data['risk_score']}")
    
    def test_analyze_transcript_emotional_manipulation(self):
        """Test detection of emotional manipulation"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Tu hijo ha tenido un accidente y esta en el hospital. Necesita ayuda inmediata. No le cuentes a nadie.",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] >= 50
        print(f"✅ Emotional manipulation detected: risk_score={data['risk_score']}")
    
    def test_analyze_transcript_tech_support_scam(self):
        """Test detection of tech support scam patterns"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Somos del soporte tecnico de Microsoft. Hemos detectado un virus en su ordenador. Necesitamos acceso remoto para solucionarlo.",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["risk_score"] >= 70
        assert data["risk_level"] == "CRITICAL"
        print(f"✅ Tech support scam detected: risk_score={data['risk_score']}")
    
    def test_analyze_transcript_short_text_validation(self):
        """Test validation for short transcripts"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/analyze-transcript",
            json={
                "transcript": "Hola",
                "language": "es"
            }
        )
        
        assert response.status_code == 400
        print("✅ Short transcript validation working")
    
    def test_scam_phrases_spanish(self):
        """Test /api/voice-shield/scam-phrases/es returns Spanish phrases"""
        response = requests.get(f"{BASE_URL}/api/voice-shield/scam-phrases/es")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "es"
        assert "phrases" in data
        assert len(data["phrases"]) > 0
        
        # Check structure of phrases
        for phrase in data["phrases"]:
            assert "phrase" in phrase
            assert "category" in phrase
            assert "danger" in phrase
        
        print(f"✅ Spanish scam phrases returned: {len(data['phrases'])} phrases")
    
    def test_scam_phrases_english(self):
        """Test /api/voice-shield/scam-phrases/en returns English phrases"""
        response = requests.get(f"{BASE_URL}/api/voice-shield/scam-phrases/en")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "en"
        assert "phrases" in data
        assert len(data["phrases"]) > 0
        print(f"✅ English scam phrases returned: {len(data['phrases'])} phrases")
    
    def test_voice_shield_stats(self):
        """Test /api/voice-shield/stats returns usage statistics"""
        response = requests.get(f"{BASE_URL}/api/voice-shield/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_analyses" in data
        assert "threats_detected" in data
        assert "status" in data
        assert data["status"] == "ACTIVE"
        print(f"✅ Voice Shield stats: {data['total_analyses']} analyses, status={data['status']}")
    
    def test_real_time_alert_with_scam(self):
        """Test /api/voice-shield/real-time-alert for live call alerts"""
        response = requests.post(
            f"{BASE_URL}/api/voice-shield/real-time-alert",
            json={
                "transcript": "Necesito que me envies dinero por bizum urgentemente",
                "language": "es"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "should_alert" in data
        assert data["should_alert"] == True
        assert len(data["alerts"]) > 0
        print(f"✅ Real-time alert triggered: {data['alerts']}")


class TestRealtimeScamAPI:
    """Real-time scam detection endpoint tests"""
    
    def test_check_url_safe(self):
        """Test /api/realtime/check/url with safe URL"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "https://google.com"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_safe" in data
        assert "risk_score" in data
        assert "checks" in data
        assert "database_status" in data
        assert data["database_status"] == "LIVE"
        print(f"✅ Safe URL check: is_safe={data['is_safe']}, risk_score={data['risk_score']}")
    
    def test_check_url_suspicious_patterns(self):
        """Test URL with suspicious patterns"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/url",
            json={"url": "https://banco-santander.tk/login"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should detect suspicious domain
        assert data["risk_score"] > 0
        print(f"✅ Suspicious URL detected: risk_score={data['risk_score']}")
    
    def test_check_phone_spanish(self):
        """Test /api/realtime/check/phone with Spanish number"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "+34600123456", "country_code": "ES"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_safe" in data
        assert "phone" in data
        assert data["phone"].startswith("+34")
        assert "database_status" in data
        print(f"✅ Phone check working: is_safe={data['is_safe']}")
    
    def test_check_phone_normalization(self):
        """Test phone number normalization"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "600123456", "country_code": "ES"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should normalize to +34 format
        assert data["phone"].startswith("+34")
        print(f"✅ Phone normalization working: {data['phone']}")
    
    def test_check_premium_rate_number(self):
        """Test detection of premium rate numbers"""
        response = requests.post(
            f"{BASE_URL}/api/realtime/check/phone",
            json={"phone": "+34803123456", "country_code": "ES"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Premium rate should be flagged
        assert data["risk_score"] >= 30
        print(f"✅ Premium rate detection: risk_score={data['risk_score']}")
    
    def test_api_status(self):
        """Test /api/realtime/status returns API status"""
        response = requests.get(f"{BASE_URL}/api/realtime/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "apis" in data
        assert "overall_status" in data
        assert data["overall_status"] == "LIVE"
        
        # Check individual API status
        apis = data["apis"]
        assert "google_safe_browsing" in apis
        assert "virustotal" in apis
        assert "abuseipdb" in apis
        assert "manoprotect_community" in apis
        
        print(f"✅ API Status: {data['overall_status']}")
        for api_name, api_status in apis.items():
            print(f"   - {api_name}: {api_status['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
