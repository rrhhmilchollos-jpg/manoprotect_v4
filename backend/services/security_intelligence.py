"""
ManoProtect Security Intelligence Service
Integración multi-capa con APIs de seguridad:
- Google Safe Browsing v5
- VirusTotal v3
- AbuseIPDB v2
- AlienVault OTX
"""
import os
import httpx
import logging
import asyncio
import re
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ============================================
# CONFIGURACIÓN Y MODELOS
# ============================================

class ThreatLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    SAFE = "safe"
    UNKNOWN = "unknown"

class ThreatType(str, Enum):
    PHISHING = "phishing"
    MALWARE = "malware"
    SPAM = "spam"
    SCAM = "scam"
    UNWANTED_SOFTWARE = "unwanted_software"
    SOCIAL_ENGINEERING = "social_engineering"
    BOTNET = "botnet"
    BRUTE_FORCE = "brute_force"
    PORT_SCAN = "port_scan"
    HACKER = "hacker"
    UNKNOWN = "unknown"

class SecurityResult(BaseModel):
    is_safe: bool
    threat_level: ThreatLevel
    threat_types: List[ThreatType] = []
    confidence_score: float = 0.0
    sources: List[str] = []
    recommendations: List[str] = []
    checked_at: str = ""

class URLAnalysisResult(BaseModel):
    url: str
    result: SecurityResult
    google_safe_browsing: Optional[Dict[str, Any]] = None
    virustotal: Optional[Dict[str, Any]] = None

class IPAnalysisResult(BaseModel):
    ip: str
    result: SecurityResult
    abuseipdb: Optional[Dict[str, Any]] = None
    alienvault_otx: Optional[Dict[str, Any]] = None

# ============================================
# SERVICIO PRINCIPAL
# ============================================

class SecurityIntelligenceService:
    """Servicio de inteligencia de seguridad multi-capa"""
    
    def __init__(self):
        # API Keys desde variables de entorno
        self.google_safe_browsing_key = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY", "")
        self.virustotal_key = os.environ.get("VIRUSTOTAL_API_KEY", "")
        self.abuseipdb_key = os.environ.get("ABUSEIPDB_API_KEY", "")
        self.alienvault_key = os.environ.get("ALIENVAULT_OTX_KEY", "")
        
        # URLs base
        self.gsb_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
        self.vt_url = "https://www.virustotal.com/api/v3"
        self.abuseipdb_url = "https://api.abuseipdb.com/api/v2"
        self.alienvault_url = "https://otx.alienvault.com/api/v1"
        
        # Configuración de timeouts
        self.timeout = 15
        
        # Patrones de estafa conocidos
        self.scam_patterns = self._load_scam_patterns()
        
        logger.info("SecurityIntelligenceService initialized")
        self._log_api_status()
    
    def _log_api_status(self):
        """Muestra el estado de las APIs configuradas"""
        apis = [
            ("Google Safe Browsing", bool(self.google_safe_browsing_key)),
            ("VirusTotal", bool(self.virustotal_key)),
            ("AbuseIPDB", bool(self.abuseipdb_key)),
            ("AlienVault OTX", bool(self.alienvault_key))
        ]
        for name, configured in apis:
            status = "configured" if configured else "NOT configured"
            logger.info(f"  - {name}: {status}")
    
    def _load_scam_patterns(self) -> Dict[str, List[str]]:
        """Carga patrones de detección de estafas"""
        return {
            "phishing": [
                r"verificar?\s*(tu|su)\s*(cuenta|identidad|datos)",
                r"actualiza?\s*(tu|su)\s*(informaci[oó]n|datos)",
                r"suspendid[ao]?\s*(tu|su)?\s*(cuenta|acceso|servicio)",
                r"bloquead[ao]?\s*(tu|su)?\s*(cuenta|tarjeta)",
                r"confirma?\s*(tu|su)\s*(pago|compra|pedido)",
                r"ingresa?\s*(tu|tus|su|sus)\s*(credenciales|datos)",
                r"haz\s*clic\s*(aqu[ií]|ahora)",
                r"urgente.*responde",
                r"tu\s*banco\s*te\s*informa",
            ],
            "smishing": [
                r"paquete.*detenido",
                r"env[ií]o.*retenido",
                r"aduanas.*pago",
                r"correos.*entrega",
                r"dgt.*multa",
                r"hacienda.*devoluci[oó]n",
                r"seguridad\s*social.*pago",
            ],
            "lottery_scam": [
                r"ganador.*premio",
                r"sorteo.*exclusivo",
                r"millones.*euros",
                r"herencia.*millonaria",
                r"loter[ií]a.*internacional",
            ],
            "tech_support": [
                r"virus.*detectado",
                r"ordenador.*infectado",
                r"microsoft.*llama",
                r"soporte\s*t[eé]cnico.*urgente",
            ],
            "romance_scam": [
                r"inversi[oó]n.*rentable",
                r"crypto.*oportunidad",
                r"dinero.*r[aá]pido",
                r"env[ií]a.*dinero.*urgente",
            ],
            "urgency_markers": [
                r"(?:en|dentro\s*de)\s*\d+\s*(?:horas?|minutos?|d[ií]as?)",
                r"[uú]ltima\s*oportunidad",
                r"(?:muy\s*)?urgente",
                r"inmediatamente",
                r"ahora\s*mismo",
                r"antes\s*de\s*que\s*sea\s*tarde",
            ]
        }
    
    # ============================================
    # ANÁLISIS DE URLs
    # ============================================
    
    async def analyze_url(self, url: str) -> URLAnalysisResult:
        """
        Analiza una URL usando múltiples fuentes de seguridad.
        """
        results = {
            "google_safe_browsing": None,
            "virustotal": None
        }
        
        threats_found = []
        sources_checked = []
        confidence_scores = []
        
        # Ejecutar verificaciones en paralelo
        tasks = []
        
        if self.google_safe_browsing_key:
            tasks.append(self._check_google_safe_browsing(url))
        
        if self.virustotal_key:
            tasks.append(self._check_virustotal_url(url))
        
        if tasks:
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(task_results):
                if isinstance(result, Exception):
                    logger.error(f"API check failed: {result}")
                    continue
                
                if result:
                    source_name = result.get("source", "unknown")
                    sources_checked.append(source_name)
                    
                    if source_name == "Google Safe Browsing":
                        results["google_safe_browsing"] = result
                        if not result.get("is_safe", True):
                            threats_found.extend(result.get("threats", []))
                            confidence_scores.append(95.0)
                    
                    elif source_name == "VirusTotal":
                        results["virustotal"] = result
                        if not result.get("is_safe", True):
                            threats_found.append(ThreatType.MALWARE)
                            confidence_scores.append(result.get("detection_ratio", 0) * 100)
        
        # Análisis de patrones internos
        pattern_result = self._analyze_url_patterns(url)
        if not pattern_result["is_safe"]:
            threats_found.extend(pattern_result.get("threats", []))
            sources_checked.append("Internal Pattern Analysis")
            confidence_scores.append(pattern_result.get("confidence", 50))
        
        # Determinar resultado final
        is_safe = len(threats_found) == 0
        threat_level = self._calculate_threat_level(threats_found, confidence_scores)
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        recommendations = self._generate_url_recommendations(is_safe, threats_found)
        
        return URLAnalysisResult(
            url=url,
            result=SecurityResult(
                is_safe=is_safe,
                threat_level=threat_level,
                threat_types=list(set(threats_found)),
                confidence_score=avg_confidence,
                sources=sources_checked,
                recommendations=recommendations,
                checked_at=datetime.now(timezone.utc).isoformat()
            ),
            google_safe_browsing=results["google_safe_browsing"],
            virustotal=results["virustotal"]
        )
    
    async def _check_google_safe_browsing(self, url: str) -> Dict[str, Any]:
        """Verifica URL con Google Safe Browsing API v4"""
        try:
            payload = {
                "client": {
                    "clientId": "manoprotect",
                    "clientVersion": "2.0.0"
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
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.gsb_url}?key={self.google_safe_browsing_key}",
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    matches = data.get("matches", [])
                    
                    if matches:
                        threat_types = []
                        for match in matches:
                            tt = match.get("threatType", "UNKNOWN")
                            if tt == "SOCIAL_ENGINEERING":
                                threat_types.append(ThreatType.PHISHING)
                            elif tt == "MALWARE":
                                threat_types.append(ThreatType.MALWARE)
                            elif tt == "UNWANTED_SOFTWARE":
                                threat_types.append(ThreatType.UNWANTED_SOFTWARE)
                            else:
                                threat_types.append(ThreatType.UNKNOWN)
                        
                        return {
                            "source": "Google Safe Browsing",
                            "is_safe": False,
                            "threats": threat_types,
                            "raw_matches": matches
                        }
                    
                    return {
                        "source": "Google Safe Browsing",
                        "is_safe": True,
                        "threats": []
                    }
                
                logger.warning(f"Google Safe Browsing returned {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Google Safe Browsing error: {e}")
            return None
    
    async def _check_virustotal_url(self, url: str) -> Dict[str, Any]:
        """Verifica URL con VirusTotal API v3"""
        try:
            import base64
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            
            headers = {
                "x-apikey": self.virustotal_key,
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Primero intentamos obtener análisis existente
                response = await client.get(
                    f"{self.vt_url}/urls/{url_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    attrs = data.get("data", {}).get("attributes", {})
                    stats = attrs.get("last_analysis_stats", {})
                    
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    total = sum(stats.values()) if stats else 0
                    
                    detection_ratio = (malicious + suspicious) / total if total > 0 else 0
                    
                    return {
                        "source": "VirusTotal",
                        "is_safe": malicious == 0 and suspicious == 0,
                        "malicious_detections": malicious,
                        "suspicious_detections": suspicious,
                        "total_engines": total,
                        "detection_ratio": detection_ratio,
                        "reputation": attrs.get("reputation", 0)
                    }
                
                elif response.status_code == 404:
                    # URL no analizada previamente, enviar para análisis
                    submit_response = await client.post(
                        f"{self.vt_url}/urls",
                        headers=headers,
                        data={"url": url}
                    )
                    
                    if submit_response.status_code in [200, 201]:
                        return {
                            "source": "VirusTotal",
                            "is_safe": True,  # Asumimos seguro si es nueva
                            "status": "submitted_for_analysis",
                            "message": "URL enviada para análisis"
                        }
                
                return None
                
        except Exception as e:
            logger.error(f"VirusTotal error: {e}")
            return None
    
    def _analyze_url_patterns(self, url: str) -> Dict[str, Any]:
        """Análisis de patrones sospechosos en URLs"""
        threats = []
        confidence = 0
        
        url_lower = url.lower()
        
        # Patrones sospechosos en URLs
        suspicious_patterns = [
            (r"login.*\..*\.", "Posible dominio de phishing"),
            (r"secure.*bank.*\.", "Posible suplantación bancaria"),
            (r"verify.*account", "Patrón de phishing"),
            (r"update.*payment", "Patrón de phishing"),
            (r"\.tk$|\.ml$|\.ga$|\.cf$", "TLD de alto riesgo"),
            (r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", "URL con IP directa"),
            (r"bit\.ly|tinyurl|t\.co", "URL acortada (verificar destino)"),
        ]
        
        for pattern, description in suspicious_patterns:
            if re.search(pattern, url_lower):
                threats.append(ThreatType.PHISHING)
                confidence += 15
        
        # Typosquatting de marcas conocidas
        known_brands = ["paypal", "amazon", "google", "microsoft", "apple", "bbva", "santander", "caixabank"]
        for brand in known_brands:
            # Buscar variaciones sospechosas
            typo_patterns = [
                f"{brand}[0-9]+",
                f"{brand}-",
                f"{brand}_",
                f"secure{brand}",
                f"{brand}login",
            ]
            for tp in typo_patterns:
                if re.search(tp, url_lower) and brand not in url_lower.split(".")[0]:
                    threats.append(ThreatType.PHISHING)
                    confidence += 25
                    break
        
        return {
            "is_safe": len(threats) == 0,
            "threats": threats,
            "confidence": min(confidence, 90)
        }
    
    # ============================================
    # ANÁLISIS DE IPs
    # ============================================
    
    async def analyze_ip(self, ip: str) -> IPAnalysisResult:
        """
        Analiza una IP usando múltiples fuentes de reputación.
        """
        results = {
            "abuseipdb": None,
            "alienvault_otx": None
        }
        
        threats_found = []
        sources_checked = []
        confidence_scores = []
        
        # Ejecutar verificaciones en paralelo
        tasks = []
        
        if self.abuseipdb_key:
            tasks.append(self._check_abuseipdb(ip))
        
        if self.alienvault_key:
            tasks.append(self._check_alienvault_otx(ip))
        
        if tasks:
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in task_results:
                if isinstance(result, Exception):
                    logger.error(f"IP check failed: {result}")
                    continue
                
                if result:
                    source_name = result.get("source", "unknown")
                    sources_checked.append(source_name)
                    
                    if source_name == "AbuseIPDB":
                        results["abuseipdb"] = result
                        if not result.get("is_safe", True):
                            threats_found.extend(result.get("threats", []))
                            confidence_scores.append(result.get("abuse_confidence", 0))
                    
                    elif source_name == "AlienVault OTX":
                        results["alienvault_otx"] = result
                        if not result.get("is_safe", True):
                            threats_found.extend(result.get("threats", []))
                            confidence_scores.append(75.0)
        
        # Determinar resultado final
        is_safe = len(threats_found) == 0
        threat_level = self._calculate_threat_level(threats_found, confidence_scores)
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        recommendations = self._generate_ip_recommendations(is_safe, threats_found, results)
        
        return IPAnalysisResult(
            ip=ip,
            result=SecurityResult(
                is_safe=is_safe,
                threat_level=threat_level,
                threat_types=list(set(threats_found)),
                confidence_score=avg_confidence,
                sources=sources_checked,
                recommendations=recommendations,
                checked_at=datetime.now(timezone.utc).isoformat()
            ),
            abuseipdb=results["abuseipdb"],
            alienvault_otx=results["alienvault_otx"]
        )
    
    async def _check_abuseipdb(self, ip: str) -> Dict[str, Any]:
        """Verifica IP con AbuseIPDB API v2"""
        try:
            headers = {
                "Accept": "application/json",
                "Key": self.abuseipdb_key
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.abuseipdb_url}/check",
                    headers=headers,
                    params={
                        "ipAddress": ip,
                        "maxAgeInDays": 90,
                        "verbose": ""
                    }
                )
                
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    
                    abuse_confidence = data.get("abuseConfidenceScore", 0)
                    total_reports = data.get("totalReports", 0)
                    is_whitelisted = data.get("isWhitelisted", False)
                    
                    threats = []
                    # Mapear categorías de abuso a tipos de amenaza
                    if abuse_confidence > 25 and not is_whitelisted:
                        if total_reports > 10:
                            threats.append(ThreatType.SPAM)
                        if abuse_confidence > 50:
                            threats.append(ThreatType.MALWARE)
                        if abuse_confidence > 75:
                            threats.append(ThreatType.BOTNET)
                    
                    return {
                        "source": "AbuseIPDB",
                        "is_safe": abuse_confidence < 25 or is_whitelisted,
                        "abuse_confidence": abuse_confidence,
                        "total_reports": total_reports,
                        "is_whitelisted": is_whitelisted,
                        "isp": data.get("isp"),
                        "domain": data.get("domain"),
                        "country_code": data.get("countryCode"),
                        "usage_type": data.get("usageType"),
                        "threats": threats
                    }
                
                logger.warning(f"AbuseIPDB returned {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"AbuseIPDB error: {e}")
            return None
    
    async def _check_alienvault_otx(self, ip: str) -> Dict[str, Any]:
        """Verifica IP con AlienVault OTX"""
        try:
            headers = {
                "X-OTX-API-KEY": self.alienvault_key,
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.alienvault_url}/indicators/IPv4/{ip}/general",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    pulse_count = data.get("pulse_info", {}).get("count", 0)
                    reputation = data.get("reputation", 0)
                    
                    threats = []
                    if pulse_count > 0:
                        threats.append(ThreatType.MALWARE)
                    if reputation < -10:
                        threats.append(ThreatType.SPAM)
                    
                    return {
                        "source": "AlienVault OTX",
                        "is_safe": pulse_count == 0 and reputation >= 0,
                        "pulse_count": pulse_count,
                        "reputation": reputation,
                        "country": data.get("country_name"),
                        "asn": data.get("asn"),
                        "threats": threats
                    }
                
                return None
                
        except Exception as e:
            logger.error(f"AlienVault OTX error: {e}")
            return None
    
    # ============================================
    # DETECCIÓN DE PATRONES DE ESTAFA
    # ============================================
    
    def detect_scam_patterns(self, content: str) -> Dict[str, Any]:
        """
        Detecta patrones de estafa en contenido de texto.
        """
        content_lower = content.lower()
        detected_patterns = []
        category_scores = {}
        
        for category, patterns in self.scam_patterns.items():
            matches = []
            for pattern in patterns:
                if re.search(pattern, content_lower, re.IGNORECASE):
                    matches.append(pattern)
            
            if matches:
                category_scores[category] = len(matches)
                for match in matches:
                    detected_patterns.append({
                        "type": category,
                        "pattern": match,
                        "severity": "high" if category in ["phishing", "smishing"] else "medium"
                    })
        
        # Calcular puntuación total
        total_score = sum(category_scores.values())
        is_scam = total_score >= 2
        
        # Determinar tipo principal de estafa
        main_threat = ThreatType.UNKNOWN
        if category_scores:
            main_category = max(category_scores, key=category_scores.get)
            threat_map = {
                "phishing": ThreatType.PHISHING,
                "smishing": ThreatType.PHISHING,
                "lottery_scam": ThreatType.SCAM,
                "tech_support": ThreatType.SCAM,
                "romance_scam": ThreatType.SCAM,
                "urgency_markers": ThreatType.SOCIAL_ENGINEERING
            }
            main_threat = threat_map.get(main_category, ThreatType.UNKNOWN)
        
        confidence = min(total_score * 20, 95) if is_scam else 0
        
        return {
            "is_scam": is_scam,
            "detected_patterns": detected_patterns,
            "category_scores": category_scores,
            "overall_confidence": confidence,
            "threat_type": main_threat.value if main_threat != ThreatType.UNKNOWN else None,
            "threat_level": self._calculate_threat_level(
                [main_threat] if is_scam else [],
                [confidence] if is_scam else []
            ).value
        }
    
    # ============================================
    # UTILIDADES
    # ============================================
    
    def _calculate_threat_level(
        self,
        threats: List[ThreatType],
        confidence_scores: List[float]
    ) -> ThreatLevel:
        """Calcula el nivel de amenaza basado en los resultados"""
        if not threats:
            return ThreatLevel.SAFE
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 50
        
        # Amenazas críticas
        critical_threats = {ThreatType.MALWARE, ThreatType.BOTNET}
        high_threats = {ThreatType.PHISHING, ThreatType.SOCIAL_ENGINEERING}
        
        has_critical = any(t in critical_threats for t in threats)
        has_high = any(t in high_threats for t in threats)
        
        if has_critical and avg_confidence > 70:
            return ThreatLevel.CRITICAL
        elif has_critical or (has_high and avg_confidence > 60):
            return ThreatLevel.HIGH
        elif has_high or avg_confidence > 40:
            return ThreatLevel.MEDIUM
        elif threats:
            return ThreatLevel.LOW
        
        return ThreatLevel.UNKNOWN
    
    def _generate_url_recommendations(
        self,
        is_safe: bool,
        threats: List[ThreatType]
    ) -> List[str]:
        """Genera recomendaciones para URLs"""
        if is_safe:
            return [
                "No se detectaron amenazas conocidas",
                "Verifica siempre la URL antes de introducir datos personales",
                "Busca el candado de seguridad HTTPS"
            ]
        
        recommendations = [
            "NO introduzcas datos personales en esta URL",
            "NO descargues archivos de esta fuente",
        ]
        
        if ThreatType.PHISHING in threats:
            recommendations.append("Esta URL intenta suplantar un sitio legítimo")
            recommendations.append("Verifica la URL real de tu banco/servicio")
        
        if ThreatType.MALWARE in threats:
            recommendations.append("Esta URL puede contener software malicioso")
            recommendations.append("No hagas clic en enlaces de esta página")
        
        recommendations.append("Reporta esta URL a las autoridades si la recibiste por SMS/email")
        
        return recommendations
    
    def _generate_ip_recommendations(
        self,
        is_safe: bool,
        threats: List[ThreatType],
        results: Dict[str, Any]
    ) -> List[str]:
        """Genera recomendaciones para IPs"""
        if is_safe:
            return [
                "Esta IP no tiene reportes de actividad maliciosa",
                "Mantén siempre actualizado tu firewall"
            ]
        
        recommendations = [
            "Bloquea esta IP en tu firewall si es posible",
        ]
        
        abuseipdb = results.get("abuseipdb", {})
        if abuseipdb:
            if abuseipdb.get("total_reports", 0) > 50:
                recommendations.append(f"Esta IP tiene {abuseipdb['total_reports']} reportes de abuso")
            if abuseipdb.get("abuse_confidence", 0) > 75:
                recommendations.append("Alto nivel de confianza de actividad maliciosa")
        
        if ThreatType.BOTNET in threats:
            recommendations.append("Esta IP puede ser parte de una botnet")
        
        if ThreatType.BRUTE_FORCE in threats:
            recommendations.append("Esta IP ha sido usada en ataques de fuerza bruta")
        
        return recommendations


# Singleton del servicio
_security_service: Optional[SecurityIntelligenceService] = None

def get_security_service() -> SecurityIntelligenceService:
    """Obtiene la instancia del servicio de seguridad"""
    global _security_service
    if _security_service is None:
        _security_service = SecurityIntelligenceService()
    return _security_service

def init_security_intelligence():
    """Inicializa el servicio de seguridad"""
    global _security_service
    _security_service = SecurityIntelligenceService()
    return _security_service
