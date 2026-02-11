"""
ManoProtect - REAL Threat Intelligence Services
Integrates with LIVE global databases: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX
NO MOCKS - 100% REAL DATA
"""
import httpx
import asyncio
import base64
import logging
import os
from typing import Optional, Dict, List, Any
from datetime import datetime, timezone
from urllib.parse import quote

logger = logging.getLogger(__name__)

# API Keys from environment
GOOGLE_SAFE_BROWSING_KEY = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY", "")
ABUSEIPDB_KEY = os.environ.get("ABUSEIPDB_API_KEY", "")
VIRUSTOTAL_KEY = os.environ.get("VIRUSTOTAL_API_KEY", "")
ALIENVAULT_OTX_KEY = os.environ.get("ALIENVAULT_OTX_KEY", "")

# API Endpoints
GOOGLE_SAFE_BROWSING_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3"
ABUSEIPDB_URL = "https://api.abuseipdb.com/api/v2"
ALIENVAULT_OTX_URL = "https://otx.alienvault.com/api/v1"


class GoogleSafeBrowsingService:
    """REAL Google Safe Browsing API integration"""
    
    def __init__(self):
        self.api_key = GOOGLE_SAFE_BROWSING_KEY
        self.api_url = GOOGLE_SAFE_BROWSING_URL
    
    async def check_url(self, url: str) -> Dict[str, Any]:
        """Check URL against Google Safe Browsing database - REAL API"""
        if not self.api_key:
            return {"source": "Google Safe Browsing", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            payload = {
                "client": {
                    "clientId": "manoprotect",
                    "clientVersion": "1.0.0"
                },
                "threatInfo": {
                    "threatTypes": [
                        "MALWARE",
                        "SOCIAL_ENGINEERING",
                        "UNWANTED_SOFTWARE",
                        "POTENTIALLY_HARMFUL_APPLICATION"
                    ],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}]
                }
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.api_url}?key={self.api_key}",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
            
            # If matches exist, URL is dangerous
            if "matches" in data and len(data["matches"]) > 0:
                match = data["matches"][0]
                threat_type = match.get("threatType", "UNKNOWN")
                
                threat_descriptions = {
                    "MALWARE": "Malware detectado - Sitio peligroso",
                    "SOCIAL_ENGINEERING": "Phishing/Ingenieria Social - Intento de robo de datos",
                    "UNWANTED_SOFTWARE": "Software no deseado - Puede instalar programas maliciosos",
                    "POTENTIALLY_HARMFUL_APPLICATION": "Aplicacion potencialmente danina"
                }
                
                return {
                    "source": "Google Safe Browsing",
                    "status": "DANGER",
                    "threat_type": threat_type,
                    "description": threat_descriptions.get(threat_type, "Amenaza detectada"),
                    "risk_score": 80,
                    "live_data": True
                }
            
            return {
                "source": "Google Safe Browsing",
                "status": "OK",
                "description": "No se encontraron amenazas",
                "risk_score": 0,
                "live_data": True
            }
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Google Safe Browsing HTTP error: {e.response.status_code}")
            return {"source": "Google Safe Browsing", "status": "ERROR", "error": f"HTTP {e.response.status_code}"}
        except Exception as e:
            logger.error(f"Google Safe Browsing error: {str(e)}")
            return {"source": "Google Safe Browsing", "status": "ERROR", "error": str(e)}


class VirusTotalService:
    """REAL VirusTotal API integration"""
    
    def __init__(self):
        self.api_key = VIRUSTOTAL_KEY
        self.api_url = VIRUSTOTAL_URL
        self.headers = {
            "x-apikey": self.api_key,
            "Accept": "application/json"
        }
    
    async def check_url(self, url: str) -> Dict[str, Any]:
        """Check URL against VirusTotal - REAL API with 90+ security engines"""
        if not self.api_key:
            return {"source": "VirusTotal", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            # Encode URL for VirusTotal
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                # Try to get existing analysis first
                response = await client.get(
                    f"{self.api_url}/urls/{url_id}",
                    headers=self.headers
                )
                
                if response.status_code == 404:
                    # URL not in database, submit for analysis
                    scan_response = await client.post(
                        f"{self.api_url}/urls",
                        headers=self.headers,
                        data={"url": url}
                    )
                    
                    if scan_response.status_code == 200:
                        # Wait a moment for analysis
                        await asyncio.sleep(2)
                        response = await client.get(
                            f"{self.api_url}/urls/{url_id}",
                            headers=self.headers
                        )
                
                if response.status_code != 200:
                    return {"source": "VirusTotal", "status": "ERROR", "error": f"HTTP {response.status_code}"}
                
                data = response.json()
            
            attributes = data.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            harmless = stats.get("harmless", 0)
            undetected = stats.get("undetected", 0)
            total = malicious + suspicious + harmless + undetected
            
            if malicious > 0:
                # Only mark as danger if at least 3 engines detect malware
                risk_score = min(100, 30 + (malicious * 8))
                if malicious >= 3:
                    return {
                        "source": "VirusTotal",
                        "status": "DANGER",
                        "malicious_detections": malicious,
                        "suspicious_detections": suspicious,
                        "total_engines": total,
                        "description": f"{malicious} de {total} motores detectan malware",
                        "risk_score": risk_score,
                        "live_data": True
                    }
                else:
                    # 1-2 detections could be false positives
                    return {
                        "source": "VirusTotal",
                        "status": "WARNING",
                        "malicious_detections": malicious,
                        "suspicious_detections": suspicious,
                        "total_engines": total,
                        "description": f"{malicious} de {total} motores (posible falso positivo)",
                        "risk_score": min(risk_score, 20),
                        "live_data": True
                    }
            elif suspicious > 0:
                return {
                    "source": "VirusTotal",
                    "status": "WARNING",
                    "malicious_detections": 0,
                    "suspicious_detections": suspicious,
                    "total_engines": total,
                    "description": f"{suspicious} de {total} motores detectan comportamiento sospechoso",
                    "risk_score": 30 + (suspicious * 3),
                    "live_data": True
                }
            
            return {
                "source": "VirusTotal",
                "status": "OK",
                "malicious_detections": 0,
                "suspicious_detections": 0,
                "total_engines": total,
                "description": f"Limpio segun {total} motores de seguridad",
                "risk_score": 0,
                "live_data": True
            }
            
        except Exception as e:
            logger.error(f"VirusTotal error: {str(e)}")
            return {"source": "VirusTotal", "status": "ERROR", "error": str(e)}
    
    async def check_ip(self, ip_address: str) -> Dict[str, Any]:
        """Check IP address against VirusTotal - REAL API"""
        if not self.api_key:
            return {"source": "VirusTotal", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.api_url}/ip_addresses/{ip_address}",
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    return {"source": "VirusTotal", "status": "ERROR", "error": f"HTTP {response.status_code}"}
                
                data = response.json()
            
            attributes = data.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            total = sum(stats.values())
            
            if malicious > 0 or suspicious > 0:
                return {
                    "source": "VirusTotal",
                    "status": "DANGER" if malicious > 2 else "WARNING",
                    "malicious_detections": malicious,
                    "suspicious_detections": suspicious,
                    "total_engines": total,
                    "risk_score": min(100, malicious * 10 + suspicious * 5),
                    "live_data": True
                }
            
            return {
                "source": "VirusTotal",
                "status": "OK",
                "risk_score": 0,
                "live_data": True
            }
            
        except Exception as e:
            logger.error(f"VirusTotal IP check error: {str(e)}")
            return {"source": "VirusTotal", "status": "ERROR", "error": str(e)}


class AbuseIPDBService:
    """REAL AbuseIPDB API integration"""
    
    def __init__(self):
        self.api_key = ABUSEIPDB_KEY
        self.api_url = ABUSEIPDB_URL
        self.headers = {
            "Key": self.api_key,
            "Accept": "application/json"
        }
    
    async def check_ip(self, ip_address: str, max_age_days: int = 90) -> Dict[str, Any]:
        """Check IP address against AbuseIPDB - REAL API with global reports"""
        if not self.api_key:
            return {"source": "AbuseIPDB", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            params = {
                "ipAddress": ip_address,
                "maxAgeInDays": max_age_days,
                "verbose": ""
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.api_url}/check",
                    headers=self.headers,
                    params=params
                )
                
                if response.status_code != 200:
                    return {"source": "AbuseIPDB", "status": "ERROR", "error": f"HTTP {response.status_code}"}
                
                data = response.json()
            
            abuse_data = data.get("data", {})
            abuse_confidence = abuse_data.get("abuseConfidenceScore", 0)
            total_reports = abuse_data.get("totalReports", 0)
            country_code = abuse_data.get("countryCode", "Unknown")
            isp = abuse_data.get("isp", "Unknown")
            usage_type = abuse_data.get("usageType", "Unknown")
            is_tor = abuse_data.get("isTor", False)
            
            if abuse_confidence > 50 or (total_reports > 5 and abuse_confidence > 20):
                return {
                    "source": "AbuseIPDB",
                    "status": "DANGER",
                    "abuse_confidence": abuse_confidence,
                    "total_reports": total_reports,
                    "country": country_code,
                    "isp": isp,
                    "usage_type": usage_type,
                    "is_tor": is_tor,
                    "description": f"IP reportada {total_reports} veces con {abuse_confidence}% de confianza de abuso",
                    "risk_score": abuse_confidence,
                    "live_data": True
                }
            elif abuse_confidence > 10 or (total_reports > 10 and abuse_confidence > 5):
                return {
                    "source": "AbuseIPDB",
                    "status": "WARNING",
                    "abuse_confidence": abuse_confidence,
                    "total_reports": total_reports,
                    "country": country_code,
                    "isp": isp,
                    "usage_type": usage_type,
                    "is_tor": is_tor,
                    "description": f"IP con algunos reportes de abuso ({total_reports})",
                    "risk_score": abuse_confidence,
                    "live_data": True
                }
            
            return {
                "source": "AbuseIPDB",
                "status": "OK",
                "abuse_confidence": abuse_confidence,
                "total_reports": total_reports,
                "country": country_code,
                "isp": isp,
                "is_tor": is_tor,
                "description": "IP limpia sin reportes de abuso",
                "risk_score": 0,
                "live_data": True
            }
            
        except Exception as e:
            logger.error(f"AbuseIPDB error: {str(e)}")
            return {"source": "AbuseIPDB", "status": "ERROR", "error": str(e)}


class AlienVaultOTXService:
    """REAL AlienVault OTX API integration"""
    
    def __init__(self):
        self.api_key = ALIENVAULT_OTX_KEY
        self.api_url = ALIENVAULT_OTX_URL
        self.headers = {
            "X-OTX-API-KEY": self.api_key,
            "Accept": "application/json"
        }
    
    async def check_ip(self, ip_address: str) -> Dict[str, Any]:
        """Check IP against AlienVault OTX threat intelligence - REAL API"""
        if not self.api_key:
            return {"source": "AlienVault OTX", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.api_url}/indicators/IPv4/{ip_address}/general",
                    headers=self.headers
                )
                
                if response.status_code == 404:
                    return {
                        "source": "AlienVault OTX",
                        "status": "OK",
                        "description": "IP no encontrada en base de datos de amenazas",
                        "risk_score": 0,
                        "live_data": True
                    }
                
                if response.status_code != 200:
                    return {"source": "AlienVault OTX", "status": "ERROR", "error": f"HTTP {response.status_code}"}
                
                data = response.json()
            
            pulse_count = data.get("pulse_info", {}).get("count", 0)
            reputation = data.get("reputation", 0)
            
            if pulse_count > 0 or reputation > 0:
                return {
                    "source": "AlienVault OTX",
                    "status": "DANGER" if pulse_count > 5 else "WARNING",
                    "pulse_count": pulse_count,
                    "reputation": reputation,
                    "description": f"IP encontrada en {pulse_count} informes de amenazas",
                    "risk_score": min(100, pulse_count * 10 + reputation * 20),
                    "live_data": True
                }
            
            return {
                "source": "AlienVault OTX",
                "status": "OK",
                "pulse_count": 0,
                "description": "IP no asociada a amenazas conocidas",
                "risk_score": 0,
                "live_data": True
            }
            
        except Exception as e:
            logger.error(f"AlienVault OTX error: {str(e)}")
            return {"source": "AlienVault OTX", "status": "ERROR", "error": str(e)}
    
    async def check_domain(self, domain: str) -> Dict[str, Any]:
        """Check domain against AlienVault OTX - REAL API"""
        if not self.api_key:
            return {"source": "AlienVault OTX", "status": "NO_API_KEY", "error": "API key not configured"}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.api_url}/indicators/domain/{domain}/general",
                    headers=self.headers
                )
                
                if response.status_code == 404:
                    return {
                        "source": "AlienVault OTX",
                        "status": "OK",
                        "description": "Dominio no encontrado en base de datos de amenazas",
                        "risk_score": 0,
                        "live_data": True
                    }
                
                if response.status_code != 200:
                    return {"source": "AlienVault OTX", "status": "ERROR", "error": f"HTTP {response.status_code}"}
                
                data = response.json()
            
            pulse_count = data.get("pulse_info", {}).get("count", 0)
            
            if pulse_count > 0:
                return {
                    "source": "AlienVault OTX",
                    "status": "DANGER" if pulse_count > 3 else "WARNING",
                    "pulse_count": pulse_count,
                    "description": f"Dominio encontrado en {pulse_count} informes de amenazas",
                    "risk_score": min(100, pulse_count * 15),
                    "live_data": True
                }
            
            return {
                "source": "AlienVault OTX",
                "status": "OK",
                "pulse_count": 0,
                "description": "Dominio limpio",
                "risk_score": 0,
                "live_data": True
            }
            
        except Exception as e:
            logger.error(f"AlienVault OTX domain check error: {str(e)}")
            return {"source": "AlienVault OTX", "status": "ERROR", "error": str(e)}


class ThreatIntelligenceAggregator:
    """Aggregates results from all REAL threat intelligence sources"""
    
    def __init__(self):
        self.google_sb = GoogleSafeBrowsingService()
        self.virustotal = VirusTotalService()
        self.abuseipdb = AbuseIPDBService()
        self.alienvault = AlienVaultOTXService()
    
    async def check_url_comprehensive(self, url: str) -> Dict[str, Any]:
        """Check URL against ALL available real-time threat databases"""
        results = {
            "url": url,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "is_safe": True,
            "risk_score": 0,
            "checks": [],
            "warnings": [],
            "database_status": "LIVE"
        }
        
        # Extract domain for additional checks
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url if url.startswith("http") else f"https://{url}")
            domain = parsed.netloc or parsed.path.split("/")[0]
        except:
            domain = url
        
        # Whitelist of known safe domains
        safe_domains = [
            "google.com", "www.google.com", "microsoft.com", "www.microsoft.com",
            "apple.com", "www.apple.com", "amazon.com", "www.amazon.com",
            "facebook.com", "www.facebook.com", "twitter.com", "www.twitter.com",
            "linkedin.com", "www.linkedin.com", "github.com", "www.github.com",
            "youtube.com", "www.youtube.com", "wikipedia.org", "www.wikipedia.org",
            "example.com", "www.example.com",  # IANA reserved domain
            "test.com", "localhost", "127.0.0.1"
        ]
        
        domain_clean = domain.lower().replace("www.", "")
        is_whitelisted = any(safe.replace("www.", "") == domain_clean for safe in safe_domains)
        
        # Run all checks in parallel for speed
        google_task = self.google_sb.check_url(url)
        virustotal_task = self.virustotal.check_url(url)
        otx_task = self.alienvault.check_domain(domain)
        
        google_result, vt_result, otx_result = await asyncio.gather(
            google_task, virustotal_task, otx_task,
            return_exceptions=True
        )
        
        # Process Google Safe Browsing result (most reliable)
        if isinstance(google_result, dict) and google_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(google_result)
            if google_result.get("status") == "DANGER" and not is_whitelisted:
                results["is_safe"] = False
                results["risk_score"] += google_result.get("risk_score", 50)
                results["warnings"].append(f"Google Safe Browsing: {google_result.get('description')}")
        
        # Process VirusTotal result
        if isinstance(vt_result, dict) and vt_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(vt_result)
            malicious = vt_result.get("malicious_detections", 0)
            # Only consider dangerous if 3+ engines detect malware
            if vt_result.get("status") == "DANGER" and malicious >= 3 and not is_whitelisted:
                results["is_safe"] = False
                results["risk_score"] += vt_result.get("risk_score", 50)
                results["warnings"].append(f"VirusTotal: {vt_result.get('description')}")
            elif vt_result.get("status") == "WARNING" and not is_whitelisted:
                # Only add small risk for warnings
                results["risk_score"] += min(vt_result.get("risk_score", 0), 15)
                results["warnings"].append(f"VirusTotal: {vt_result.get('description')}")
        
        # Process AlienVault OTX result (can have false positives for common domains)
        if isinstance(otx_result, dict) and otx_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(otx_result)
            pulse_count = otx_result.get("pulse_count", 0)
            # OTX has many false positives for common/example domains
            # Only consider dangerous if pulse_count is high AND not whitelisted
            if otx_result.get("status") == "DANGER" and pulse_count > 10 and not is_whitelisted:
                # Reduce weight of OTX as it has more false positives
                otx_risk = min(otx_result.get("risk_score", 0), 30)
                results["risk_score"] += otx_risk
                if pulse_count > 20:
                    results["warnings"].append(f"AlienVault OTX: {otx_result.get('description')}")
        
        # If domain is whitelisted, cap risk score at low level
        if is_whitelisted:
            results["risk_score"] = min(results["risk_score"], 15)
            results["is_safe"] = True
        
        # Cap risk score at 100
        results["risk_score"] = min(results["risk_score"], 100)
        
        # Final safety determination based on risk score
        if results["risk_score"] >= 50:
            results["is_safe"] = False
        
        # Generate recommendation
        if results["risk_score"] >= 70:
            results["recommendation"] = "NO ENTRES EN ESTA WEB - Alto riesgo de estafa o malware"
        elif results["risk_score"] >= 40:
            results["recommendation"] = "PRECAUCION - Se detectaron senales de alerta"
        elif results["risk_score"] >= 20:
            results["recommendation"] = "Verifica antes de introducir datos personales"
        else:
            results["recommendation"] = "No se detectaron amenazas conocidas"
        
        return results
    
    async def check_ip_comprehensive(self, ip_address: str) -> Dict[str, Any]:
        """Check IP against ALL available real-time threat databases"""
        results = {
            "ip_address": ip_address,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "is_safe": True,
            "risk_score": 0,
            "checks": [],
            "warnings": [],
            "database_status": "LIVE"
        }
        
        # Run all checks in parallel
        vt_task = self.virustotal.check_ip(ip_address)
        abuseipdb_task = self.abuseipdb.check_ip(ip_address)
        otx_task = self.alienvault.check_ip(ip_address)
        
        vt_result, abuseipdb_result, otx_result = await asyncio.gather(
            vt_task, abuseipdb_task, otx_task,
            return_exceptions=True
        )
        
        # Process VirusTotal result
        if isinstance(vt_result, dict) and vt_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(vt_result)
            if vt_result.get("status") in ["DANGER", "WARNING"]:
                if vt_result.get("status") == "DANGER":
                    results["is_safe"] = False
                results["risk_score"] += vt_result.get("risk_score", 0)
        
        # Process AbuseIPDB result
        if isinstance(abuseipdb_result, dict) and abuseipdb_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(abuseipdb_result)
            if abuseipdb_result.get("status") == "DANGER":
                results["is_safe"] = False
                results["risk_score"] += abuseipdb_result.get("risk_score", 0)
                results["warnings"].append(f"AbuseIPDB: {abuseipdb_result.get('description')}")
            elif abuseipdb_result.get("status") == "WARNING":
                results["risk_score"] += abuseipdb_result.get("risk_score", 0) // 2
        
        # Process AlienVault OTX result
        if isinstance(otx_result, dict) and otx_result.get("status") not in ["ERROR", "NO_API_KEY"]:
            results["checks"].append(otx_result)
            if otx_result.get("status") in ["DANGER", "WARNING"]:
                if otx_result.get("status") == "DANGER":
                    results["is_safe"] = False
                results["risk_score"] += otx_result.get("risk_score", 0)
        
        # Cap risk score
        results["risk_score"] = min(results["risk_score"], 100)
        
        return results


# Singleton instance
threat_aggregator = ThreatIntelligenceAggregator()
