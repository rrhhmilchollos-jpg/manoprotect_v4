# ManoProtect - PRD (Product Requirements Document)

## Estado de Producción
**✅ LISTO PARA DEPLOY - 04/02/2026**
- Backend: 100% tests pasados
- Frontend: 100% tests pasados
- API Health: ✅ Healthy
- Errores críticos: 0

**URL de Producción:** https://manoprotect.com
**URL de Preview:** https://safety-alert-app-1.preview.emergentagent.com

---

## Descripción General
ManoProtect es una aplicación de seguridad familiar con funciones de SOS de emergencia, seguimiento en tiempo real, detección de fraudes con IA, y perfil de salud para emergencias.

---

## 🚀 Funcionalidades Completas

### 🆘 Sistema SOS de Emergencia
| Característica | Estado | Archivo |
|----------------|--------|---------|
| Botón SOS con countdown 3s | ✅ | `SOSQuickButton.js` |
| Sirena en dispositivo receptor | ✅ | `SOSAlertReceived.js` |
| GPS en tiempo real | ✅ | `sosWebSocket.js` |
| Notificaciones Push (FCM) | ✅ | `emergency_notifications.py` |
| SMS Backup (Twilio) | ✅ | `twilio_sms.py` |
| Grabación de audio | ✅ | `SOSEmergency.js` |
| Confirmación "Ayuda en camino" | ✅ | `family_sos_routes.py` |

### 👨‍👩‍👧‍👦 Sistema Familiar
| Característica | Estado | Archivo |
|----------------|--------|---------|
| Modo Familiar | ✅ | `FamilyMode.js` |
| Administración Familiar | ✅ | `FamilyAdmin.js` |
| Seguimiento de Hijos | ✅ | `ChildTracking.js` |
| Vincular Dispositivos | ✅ | `VincularDispositivo.js` |
| Contactos de Emergencia | ✅ | `Contacts.js` |
| Guía para Familiares | ✅ | `InstruccionesFamiliares.js` |

### 💳 Pagos y Suscripciones (Stripe)
| Plan | Precio | Estado |
|------|--------|--------|
| Individual | €4.99/mes | ✅ |
| Familiar | €9.99/mes | ✅ |
| Business | €19.99/mes | ✅ |
| Prueba Gratis | 7 días | ✅ |

### 🏥 Perfil de Salud
- Grupo sanguíneo, alergias, condiciones crónicas
- Medicamentos actuales, hospital preferido
- Donante de órganos
- Archivo: `HealthProfile.js`, `health_routes.py`

### 🛡️ Detección de Fraudes (IA)
- Análisis de URLs sospechosas
- Detección de phishing, smishing, vishing
- Archivo: `VerificarEstafa.js`, `fraud_detection.py`, `threat_analyzer.py`

### 📢 Google AdMob
- `app-ads.txt` configurado
- Publisher ID: `pub-7713974112203810`
- Componentes: `NativeAdBanner.jsx`, `RewardedAdButton.jsx`
- Anuncios solo para plan "free"

### 🔍 SEO Completo
- Meta tags (Open Graph, Twitter Cards)
- Schema.org estructurado
- `sitemap.xml` y `robots.txt`
- Google Tag Manager: `GTM-MK53XZ8Q`
- Google Analytics: `G-8KECMQS45X`

### 📱 PWA (Progressive Web App)
- Service Worker v4 con push notifications
- Instalable en móvil
- Funciona offline
- `manifest.json` configurado

---

## 📁 Estructura del Proyecto

### Backend (57 archivos Python)
```
/backend
├── server.py                    # API principal FastAPI
├── routes/
│   ├── auth.py                  # Autenticación
│   ├── family_sos_routes.py     # Sistema SOS (58KB)
│   ├── payments.py              # Stripe
│   ├── push_routes.py           # Push notifications
│   ├── health_routes.py         # Perfil de salud
│   ├── fraud_routes.py          # Detección fraudes
│   └── ... (27 archivos de rutas)
├── services/
│   ├── emergency_notifications.py  # FCM + SMS
│   ├── websocket_manager.py        # Tiempo real
│   ├── twilio_sms.py              # SMS
│   ├── fraud_detection.py         # IA fraudes
│   └── ... (11 servicios)
├── models/
│   ├── schemas.py
│   └── all_schemas.py
├── tests/                       # 11 archivos de tests
└── firebase-admin-sdk.json      # Firebase config
```

### Frontend (43 páginas, 122 archivos JS/JSX)
```
/frontend
├── public/
│   ├── sw.js                    # Service Worker v4
│   ├── manifest.json            # PWA
│   ├── app-ads.txt              # AdMob
│   ├── sitemap.xml              # SEO
│   ├── robots.txt               # SEO
│   ├── index.html               # Meta tags, GTM, Schema.org
│   ├── offline.html             # Página offline
│   ├── docs/
│   │   ├── android/             # Gradle, Manifest, SplashAd
│   │   ├── marketing/           # Facebook Ads, Videos
│   │   └── GUIA-ADMOB-*.md      # Guías AdMob
│   └── *.png                    # Screenshots Google Play
├── src/
│   ├── pages/                   # 43 páginas
│   │   ├── SOSQuickButton.js
│   │   ├── SOSAlertReceived.js
│   │   ├── SOSEmergency.js
│   │   ├── InstruccionesFamiliares.js
│   │   ├── Dashboard.js
│   │   ├── Pricing.js
│   │   └── ...
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── ads/                 # AdMob components
│   │   └── ...
│   ├── services/
│   │   ├── firebase.js
│   │   ├── sosWebSocket.js
│   │   ├── pushNotifications.js
│   │   └── admob.js
│   └── context/
│       └── AuthContext.js       # Autenticación
```

---

## 🔧 Servicios Configurados

| Servicio | Estado | Configuración |
|----------|--------|---------------|
| Firebase Admin SDK | ✅ | `/backend/firebase-admin-sdk.json` |
| Firebase FCM | ✅ | VAPID keys en `.env` |
| Firebase Analytics | ✅ | `G-8KECMQS45X` |
| Twilio SMS | ✅ | Credenciales en `.env` |
| Stripe Payments | ✅ | API keys en `.env` |
| MongoDB | ✅ | `MONGO_URL` en `.env` |
| WebSockets | ✅ | Endpoint `/ws` |
| Google AdMob | ✅ | `pub-7713974112203810` |
| Google Tag Manager | ✅ | `GTM-MK53XZ8Q` |

---

## 🔐 Credenciales de Test

### Superadmin
- Email: `info@manoprotect.com`
- Password: `19862210Des`

### Usuario de Prueba
- Email: `mrisolaz130@gmail.com`
- Password: `19862210Des!`

### Google Play Review
- Email: `reviewer@manoprotect.com`
- Password: `ReviewMano2025!`

---

## 📱 Google Play Console

### Archivos Android
- `/docs/android/build-gradle-admob.gradle` - Configuración Gradle
- `/docs/android/AndroidManifest-AdMob.xml` - Manifest con AdMob
- `/docs/android/SplashAdActivity.java` - Anuncios intersticiales

### Screenshots para Store
- `androidxr_*.png` - Screenshots Android XR (4)
- `chromebook_*.png` - Screenshots Chromebook (4)
- `manoprotect_feature_1024x500.png` - Feature graphic

---

## 🌐 APIs Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | Registro usuario |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Usuario actual |
| `/api/sos/alert` | POST | Enviar alerta SOS |
| `/api/sos/confirm` | POST | Confirmar recepción |
| `/api/push/register-fcm` | POST | Registrar FCM token |
| `/api/family/members` | GET | Miembros familia |
| `/api/contacts` | GET/POST | Contactos emergencia |
| `/api/payments/create-checkout` | POST | Crear pago Stripe |
| `/api/admin/services-status` | GET | Estado servicios |

---

## 📋 Changelog

### 04/02/2026 - Preparación Deploy Final
- ✅ Página `/instrucciones-familiares` para guiar familiares
- ✅ Mejora mensajes de error en registro
- ✅ Tests 100% pasados
- ✅ README.md actualizado
- ✅ `.env.example` creados

### 04/02/2026 - Bug Fix SOS + AdMob + SEO
- ✅ Query contactos corregida
- ✅ `app-ads.txt` configurado
- ✅ SEO completo implementado

### 02/02/2026 - Sistema SOS Completo
- ✅ FCM + SMS backup
- ✅ WebSockets tiempo real
- ✅ Sirena en dispositivo receptor

---

## ⚡ Deploy

### Opción 1: Emergent Platform
1. Clic en **"Deploy"** → Despliega a manoprotect.com

### Opción 2: Servidor Propio
1. Clonar repositorio de GitHub
2. Copiar `.env.example` a `.env` en backend y frontend
3. Configurar credenciales
4. `cd backend && pip install -r requirements.txt && uvicorn server:app`
5. `cd frontend && yarn install && yarn build`

---

## 📞 Soporte

- Web: https://manoprotect.com
- Email: info@manoprotect.com
- WhatsApp: Integrado en la app
