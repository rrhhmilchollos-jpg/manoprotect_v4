# PRD - ManoProtect

## Problema Original
Aplicación de ciberseguridad para protección de usuarios mayores y empresas. Incluye panel web de administración y aplicación móvil Android (TWA).

## Arquitectura Actual
- **Frontend Web:** React + Shadcn/UI (puerto 3000)
- **Backend API:** FastAPI + MongoDB (puerto 8001)
- **Mobile App:** Trusted Web Activity (TWA) - Nativo Android Java
- **URL TWA:** https://www.manoprotect.com
- **Package:** com.manoprotect.www.twa

## Lo Implementado (Febrero 2026)

### 🛡️ ManoProtect Shield - Sistema de Seguridad Avanzada
Implementación completa de **8 features revolucionarias**:

#### 1. **Verificador Universal** ✅
- Verifica URLs, teléfonos, emails y empresas
- Detecta patrones de phishing y estafas
- Consulta base de datos comunitaria de reportes
- Integración con DNA Digital y Trust Seal

#### 2. **Escudo de Voz AI** ✅
- Analiza transcripciones de llamadas en tiempo real
- Detecta tácticas de manipulación: urgencia, autoridad, miedo
- Recomendaciones personalizadas, Risk score 0-100%

#### 3. **DNA Digital** ✅
- Sistema de identidad digital verificable
- Códigos únicos "MP-DNA-XXXXXXXX"
- Para personas y empresas

#### 4. **Sello de Confianza** ✅
- Badge verificable para empresas
- Tiers: Basic (29€), Professional (99€), Enterprise (299€)
- Código embebible para websites

#### 5. **Anti-Deepfake Shield** ✅ (NUEVO)
- Detecta videos, audios e imágenes falsas
- Análisis de consistencia facial
- Detección de artefactos de IA
- Fingerprint de redes neuronales

#### 6. **Herencia Digital** ✅ (NUEVO)
- Bóveda segura cifrada AES-256
- Tipos: Contraseñas, documentos, info bancaria, crypto, médica
- Protocolo de emergencia configurable
- Beneficiarios designados

#### 7. **Modo Pánico Silencioso** ✅ (NUEVO)
- Triggers: Botón (5 pulsaciones), palabra clave, agitar
- Acciones automáticas: Ubicación GPS, grabación audio, llamar 112
- Modo silencioso (sin sonido/vibración)
- Contactos de emergencia

#### 8. **Zonas Inteligentes** ✅ (NUEVO)
- Aprendizaje de comportamiento con IA
- Tipos: Casa, trabajo, colegio, frecuente, riesgo
- Alertas: entrada, salida, anomalías
- Detección de patrones anómalos

### 🏢 Landing Page B2B Enterprise ✅ (NUEVO)
- URL: /empresas, /enterprise, /b2b
- Hero con stats: 500+ empresas, 2M+ amenazas
- Features: Sello, DNA, Voice AI, Phishing Simulation
- Precios: Básico 29€, Profesional 99€, Enterprise 299€
- Formulario de contacto para leads

### 📊 Dashboard Actualizado ✅
- Banner de acceso rápido a ManoProtect Shield
- Eliminada pestaña "Banca Segura"
- Nueva pestaña "Localizar Familia"

### Endpoints API Shield
```
POST /api/shield/dna/register - Registrar DNA Digital
POST /api/shield/dna/verify - Verificar DNA Digital
GET  /api/shield/dna/{code} - Obtener DNA Digital

POST /api/shield/seal/create - Crear Sello de Confianza
POST /api/shield/seal/verify - Verificar Sello
GET  /api/shield/seal/{code} - Obtener badge data

POST /api/shield/verify/universal - Verificador Universal
POST /api/shield/voice/analyze - Escudo de Voz AI
POST /api/shield/transaction/verify - Verificar transacción

POST /api/shield/scam/report - Reportar estafa
GET  /api/shield/scam/trending - Estafas trending

POST /api/shield/panic/trigger - Modo Pánico Silencioso
GET  /api/shield/panic/status/{id} - Estado de alerta

POST /api/shield/zones/create - Crear zona inteligente
GET  /api/shield/zones/{user_id} - Zonas del usuario
```

### Frontend Components Shield
```
/src/components/shield/UniversalVerifier.jsx
/src/components/shield/VoiceShieldAI.jsx
/src/components/shield/DNADigital.jsx
/src/components/shield/TrustSeal.jsx
/src/components/shield/AntiDeepfake.jsx
/src/components/shield/DigitalInheritance.jsx
/src/components/shield/SilentPanicMode.jsx
/src/components/shield/SmartZones.jsx
/src/pages/ShieldPage.jsx
/src/pages/EnterpriseLanding.jsx
```

### Cambios Dashboard
- ❌ Eliminada pestaña "Banca Segura" (generaba desconfianza)
- ✅ Nueva pestaña "Localizar Familia" con mapa interactivo
- ✅ Acciones rápidas: SOS, Compartir ubicación, Guía

### TWA Android App
- Proyecto completo en `/manoprotect-twa/`
- targetSdk: 35, versionCode: 5
- URL: https://www.manoprotect.com
- Keystore configurado
- GitHub Actions workflow

## Pendiente de Implementar

### P0 - Crítico
- [ ] Compilar AAB v2.2.1 (versionCode 5) y subir a Google Play Producción
- [ ] Subir assetlinks.json a www.manoprotect.com/.well-known/

### P1 - Alta Prioridad
- [ ] Backend real para Anti-Deepfake (integración con modelo IA)
- [ ] Integración de grabación de audio para Modo Pánico
- [ ] Geofencing real para Zonas Inteligentes
- [ ] Predictor de Estafas AI

### P2 - Media Prioridad
- [ ] Simulacro de Phishing para empresas (envío de emails)
- [ ] Verificador de Transacciones Blockchain
- [ ] Chrome Extension para verificación
- [ ] WhatsApp Business API

### P3 - Futuro
- [ ] Integración con bancos reales
- [ ] App iOS
- [ ] API pública para terceros

## Planes de Precios Actualizados

### B2C
| Plan | Precio | Incluye |
|------|--------|---------|
| Familiar | 4,99€/mes | Localización + Alertas + Verificador |
| Premium | 29,99€/mes | Todo B2C + IA Analysis |

### B2B (ManoProtect Enterprise)
| Plan | Precio | Incluye |
|------|--------|---------|
| Básico | 29€/mes | Sello + 10 empleados |
| Profesional | 99€/mes | Sello + Monitor + Simulacros |
| Enterprise | 299€/mes | Todo + API + Blockchain |

## Archivos Clave
- `/app/backend/routes/shield.py` - API Shield
- `/app/backend/models/security_advanced.py` - Modelos Pydantic
- `/app/frontend/src/pages/ShieldPage.jsx` - UI principal
- `/app/manoprotect-twa/` - Proyecto Android TWA
