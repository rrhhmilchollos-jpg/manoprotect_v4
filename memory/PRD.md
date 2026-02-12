# ManoProtect - Product Requirements Document

## Project Overview
ManoProtect es una plataforma revolucionaria de ciberseguridad para consumidores (B2C) y empresas (B2B).

**Website**: https://www.manoprotect.com
**Preview URL**: https://device-checkout-flow.preview.emergentagent.com
**Empresa**: STARTBOOKING SL - CIF: B19427723

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS (PRODUCTION READY)

### 0. Página de Servicios SOS Completa ✅ (ACTUALIZADO - Feb 2026)
- **Página unificada** con todas las funcionalidades SOS: `/servicios-sos`
- **4 Secciones en tabs**:
  1. 🔴 Dispositivo SOS: Formulario de pedido con colores, cantidad, envío
  2. 💰 Planes y Precios: Básico (gratis), Individual (€249.99/año), Familiar (€399.99/año)
  3. ⚡ Funcionalidades: GPS, 112, Audio bidireccional, Detección caídas, Zonas seguras
  4. 📦 Seguir Pedido: Tracking de envíos
- **Promoción Lanzamiento**: Dispositivo GRATIS, solo pago envío 4,95€
- **Botón en Header**: "🔴 Botón SOS" accesible desde toda la web
- Frontend: `/servicios-sos`, `/sos-device`, `/dispositivo-sos`, `/boton-sos`

### 0.1 Sistema de Pagos con Stripe ✅ (NUEVO - Feb 2026)
- **Checkout para dispositivos SOS**: Pago de envío 4,95€ via Stripe
- **Suscripciones con trial**: 7 días de prueba GRATIS
- **Tarjeta obligatoria**: Crédito/débito (NO prepago)
- **Cobro automático**: Después del trial si no se cancela
- **Cancelación automática**: Si cancela, se asigna Plan Básico gratuito
- Backend: `/api/payments/device/checkout`, `/api/payments/subscription/checkout`
- Webhook: `/api/payments/webhook/stripe`

### 0.2 Panel de Gestión de Envíos (Admin) ✅ (NUEVO - Feb 2026)
- **Panel interno** para gestionar envíos de dispositivos
- **8 transportistas**: Correos Express, SEUR, MRW, GLS, DHL, UPS, FedEx, Nacex
- **Estados de envío**: Pendiente, Preparando, Enviado, En tránsito, En reparto, Entregado
- **Funcionalidades**: Asignar tracking, cambiar estado, envío masivo, exportar
- Frontend: `/admin/shipping`
- Backend: `/api/admin/shipping/*`

### 1. Real-Time Threat Intelligence ✅
- Live APIs: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX
- Endpoints: `/api/realtime/check/*`

### 2. AI Voice Shield ✅
- Detección de estafas telefónicas con análisis de patrones IA
- Frontend: `/voice-shield`
- Backend: `/api/voice-shield/*`

### 3. Smart Family Locator ✅
- Zonas de comportamiento (segura, escuela, trabajo, restringida)
- Botón SOS, historial de ubicaciones, alertas de zona
- Frontend: `/smart-locator`
- Backend: `/api/smart-locator/*`

### 4. Anti-Deepfake Shield ✅
- Detecta imágenes, audio y video manipulados
- 19 indicadores de detección (8 imagen, 6 audio, 5 video)
- Frontend: `/deepfake-shield`
- Backend: `/api/deepfake-shield/*`

### 5. Chrome Extension ✅
- Verificación de URLs en tiempo real
- Download: `/app/manoprotect-chrome-extension.zip`
- Guía de publicación: `/app/GUIA_PUBLICAR_EXTENSION_CHROME.md`

### 6. Investor CRM (Interno, Gratis) ✅
- Seguimiento de descargas e interacciones de inversores
- Gestión de estados (lead → committed)
- Notas y etiquetas por inversor
- Dashboard de analytics
- Frontend: `/investor-crm`
- Backend: `/api/investor-crm/*`

### 7. Google AdSense ✅
- ads.txt: `/frontend/public/ads.txt`
- Publisher ID: pub-7713974112203810

### 8. Portal de Inversores ✅
- Contacto: inversores@manoprotect.com | +34 601 510 950
- 4 documentos: Plan de Negocio, Modelo Financiero, Pitch Deck, Dossier B2B

### 9. Sello de Confianza / Trust Seal ✅
- Badge visual para webs de clientes protegidos por ManoProtect
- Verificación de sellos en tiempo real
- Solicitud de nuevos sellos para empresas
- Frontend: `/shield` → componente TrustSeal
- Backend: `/api/shield/seal/*`
- Sello visible en footer de landing page

### 10. DNA Digital Identity System ✅
- Identidad digital verificable única
- Verificación de teléfonos, emails, webs
- Registro de identidades para personas y empresas
- Frontend: `/shield` → componente DNADigital
- Backend: `/api/shield/dna/*`

### 11. Blockchain Transaction Verifier ✅
- Verificador de transacciones blockchain
- Soporte: Bitcoin, Ethereum, Polygon, BNB Chain
- Verificador de wallets y smart contracts
- Detección de rug pulls, honeypots, mixers
- Frontend: `/blockchain-verifier`

### 12. Employee Dashboard ✅
- Panel de control completo del sistema
- Gestión de usuarios, amenazas, sellos, DNA Digital
- Estado del sistema en tiempo real
- Acciones administrativas rápidas
- Frontend: `/employee-dashboard`
- Backend: `/api/admin/*`

### 13. ManoProtect SOS Button (Dispositivo Físico) ✅
- Llavero físico de emergencia con botón SOS
- GPS en tiempo real (precisión 2.5m)
- Conexión directa al 112 (emergencias España)
- Audio bidireccional para comunicación
- Detección automática de caídas
- 7 días de batería, carga USB
- **PROMOCIÓN LANZAMIENTO**: Dispositivo GRATIS (solo envío 4,95€)
- Válido hasta 30 de Abril 2026
- Frontend: `/sos-device`, `/boton-sos`, `/dispositivo-sos`
- Backend: `/api/sos-device/*`
- Documentación técnica: `/app/docs/MANOPROTECT_SOS_KEYCHAIN_SPECS.md`

### 14. Videos Demo IA (Sora 2) ✅
- Generación de videos demostrativos con IA
- 4 demos: SOS Button, Family Locator, Voice Shield, Deepfake Detector
- Limitación actual: máximo 12 segundos por video
- Frontend: `/videos-demo`
- Backend: `/api/demo-videos/*`

### 15. Secure Digital Legacy Vault ✅
- Bóveda digital segura con encriptación AES-256
- Almacenamiento de documentos importantes
- Herencia digital para familiares
- Frontend: `/legacy-vault`
- Backend: `/api/legacy-vault/*`

### 16. Phishing Simulation (B2B) ✅
- Simulacros de phishing para empresas
- Gestión de campañas y seguimiento de empleados
- 5 plantillas de email
- Frontend: `/phishing-simulation`
- Backend: `/api/phishing/*`

---

## 🛠️ TECH STACK

| Componente | Tecnología |
|------------|------------|
| Frontend | React.js + Tailwind + Shadcn/UI |
| Backend | Python FastAPI + Motor (async MongoDB) |
| Database | MongoDB |
| APIs Seguridad | Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX |
| Video Generation | Sora 2 (via emergentintegrations) |
| Payments | Stripe |
| Push Notifications | Firebase Cloud Messaging |

---

## 📍 RUTAS PRINCIPALES

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Voice Shield | /voice-shield | /api/voice-shield/* | ✅ |
| Smart Locator | /smart-locator | /api/smart-locator/* | ✅ |
| Deepfake Shield | /deepfake-shield | /api/deepfake-shield/* | ✅ |
| Investor CRM | /investor-crm | /api/investor-crm/* | ✅ |
| Scam Verification | /verificar-estafa | /api/realtime/* | ✅ |
| Downloads | /downloads | /api/investor/* | ✅ |
| Trust Seal | /shield | /api/shield/seal/* | ✅ |
| DNA Digital | /shield | /api/shield/dna/* | ✅ |
| Blockchain Verifier | /blockchain-verifier | - | ✅ |
| Employee Dashboard | /employee-dashboard | /api/admin/* | ✅ |
| SOS Device Order | /sos-device | /api/sos-device/* | ✅ |
| Videos Demo | /videos-demo | /api/demo-videos/* | ✅ |
| Legacy Vault | /legacy-vault | /api/legacy-vault/* | ✅ |
| Phishing Simulation | /phishing-simulation | /api/phishing/* | ✅ |

---

## 📅 CHANGELOG

### Feb 12, 2026 - ManoProtect SOS Button (Dispositivo Físico)
- ✅ Diseño del llavero SOS generado (3 imágenes: frontal, lifestyle, técnico)
- ✅ Documentación técnica completa para fabricación
- ✅ Página de pedido con contador de personas/hogar
- ✅ Sistema de pedidos con envío express 24-48h
- ✅ **PROMOCIÓN LANZAMIENTO**: Dispositivo GRATIS (solo envío 4,95€)
- ✅ Backend API: `/api/sos-device/*`
- ✅ Rutas: /sos-device, /dispositivo-sos, /boton-sos

### Feb 12, 2026 - Trust Seal, DNA Digital, Blockchain Verifier, Employee Dashboard
- ✅ Sello de Confianza agregado al footer de Landing Page
- ✅ TrustBadge component creado (/components/TrustBadge.jsx)
- ✅ Employee Dashboard completo con gestión de usuarios, amenazas, sellos
- ✅ Blockchain Transaction Verifier con verificación de TX, wallets, contratos
- ✅ DNA Digital system funcional con verificación y registro
- ✅ Nuevas rutas: /employee-dashboard, /blockchain-verifier
- ✅ Admin endpoints adicionales: /api/admin/stats, /api/admin/trust-seals, /api/admin/dna-digital

### Feb 12, 2026 - P1 Features Complete
- ✅ Secure Digital Legacy Vault - AES-256 encrypted document storage
- ✅ Phishing Simulation B2B - Campaign management, employee tracking, 5 templates

### Feb 12, 2026 - PageSpeed & Performance Optimizations
- ✅ Lazy loading agresivo de LandingPage, Login, Register
- ✅ GTM diferido 3 segundos usando requestIdleCallback
- ✅ InterstitialAd desactivado en preview/staging
- ✅ Firebase Analytics diferido
- ✅ Componentes de conversión lazy loaded
- ✅ i18n simplificado para render inicial con fallback translations
- ✅ lucide-react actualizado a versión 0.563.0

### Feb 12, 2026 - SOS Device Colors & Order Tracking
- ✅ 20 colores del dispositivo SOS en 5 categorías: Jóvenes, Mujer, Hombre, Elegante, Unisex
- ✅ Panel de seguimiento de pedidos (`/order-tracking`)
- ✅ Timeline visual de estados de envío
- ✅ Búsqueda por número de pedido o tracking
- ✅ Backend endpoints: `/api/sos-devices/my-orders`, `/api/sos-devices/track/{order_id}`

### Feb 12, 2026 - PageSpeed & Accessibility Improvements
- ✅ GTM diferido 2 segundos para reducir TBT
- ✅ Preconnect a backend de emergent añadido
- ✅ Color contrast WCAG AA compliance (emerald-500 → emerald-700)
- ✅ Botones y badges con mejor contraste
- ✅ Content-visibility para lazy rendering de secciones

### Feb 12, 2026 - SOS Sound Fix & Payment Cleanup
- ✅ SOS button sound: Silent for sender, siren plays on family members' devices
- ✅ Added automatic siren (8s, 600-1400Hz) when family alerts arrive
- ✅ Added browser notification for SOS alerts
- ✅ Verified payment_transactions collection is empty (0 documents)

### Feb 12, 2026 - Videos Demo IA Page
- ✅ Created Videos Demo IA page with Sora 2 integration
- ✅ 4 demo videos: SOS Button, Family Locator, Voice Shield, Deepfake Detector
- ✅ Backend API for video generation at `/api/demo-videos/`
- ✅ All logos updated to WebP format

### Feb 12, 2026 - PageSpeed Optimization
- ✅ Fixed CORS error blocking `/api/auth/me`
- ✅ Logo optimization: PNG 121KB → WebP 6.5KB (95% reduction)
- ✅ Color contrast improvements across landing page (WCAG compliance)
- ✅ Enhanced security headers: CSP, COOP, Permissions-Policy

### Feb 11, 2026 (Previous Session)
- ✅ Google AdSense ads.txt created
- ✅ Smart Family Locator - Full implementation
- ✅ Anti-Deepfake Shield - Full implementation
- ✅ Investor CRM - Full implementation
- ✅ Chrome Extension publication guide

---

## 🔜 BACKLOG PENDIENTE

### P1 - Alta Prioridad
- [x] **WhatsApp Business API** - ✅ IMPLEMENTADO (Twilio - pendiente credenciales)
- [x] **PageSpeed optimization** - ✅ OPTIMIZADO (lazy loading, CSS crítico, GTM diferido)
- [x] **SOS Device Colors** - ✅ 20 colores en 5 categorías
- [x] **Order Tracking** - ✅ Panel de seguimiento de pedidos
- [ ] **Videos Demo 1 minuto** - Solución para limitación Sora 2 (máx 12s)

### P2 - Media Prioridad
- [x] **Digital Legacy Vault** - ✅ Bóveda digital con cifrado AES-256
- [x] **Phishing Simulation** - ✅ Simulacros de phishing B2B
- [ ] Integración con empresa de mensajería para envíos

### P3 - Futuro
- [ ] Soporte adicional de redes blockchain
- [ ] App móvil nativa (Android/iOS)
- [ ] Intranet multi-dispositivo (pendiente clarificación)

---

## 👥 USUARIOS ACTIVOS

1. rrhh.milchollos@gmail.com - Ivan Rubio Cano (superadmin)
2. msolassanchis@gmail.com - Maria Deseada Solas Sanchis (superadmin)
3. ivanrubiosolas@gmail.com - Ivan Rubio cano (superadmin)
4. info@manoprotect.com - ManoProtect Admin (superadmin)
5. vguerolanavarro@gmail.com - Vicente (premium)

---

## 🔐 VARIABLES DE ENTORNO

```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...
EMERGENT_LLM_KEY=... (for Sora 2)
STRIPE_API_KEY=...

# Frontend (.env)
REACT_APP_BACKEND_URL=https://device-checkout-flow.preview.emergentagent.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=...
REACT_APP_FIREBASE_API_KEY=...
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
/app
├── backend/
│   ├── routes/
│   │   ├── admin.py
│   │   ├── shield.py (DNA Digital, Trust Seal)
│   │   ├── sos_device.py (Dispositivo SOS físico)
│   │   ├── demo_videos.py (Sora 2)
│   │   ├── legacy_vault.py
│   │   ├── phishing_simulation.py
│   │   └── ...
│   ├── server.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SOSDeviceOrder.js (Pedido dispositivo SOS)
│   │   │   ├── EmployeeDashboard.js
│   │   │   ├── BlockchainVerifier.js
│   │   │   └── ...
│   │   └── components/
│   │       ├── TrustBadge.jsx
│   │       └── shield/
│   └── package.json
├── docs/
│   └── MANOPROTECT_SOS_KEYCHAIN_SPECS.md
└── memory/
    └── PRD.md
```

---

## 📞 CONTACTO

- **Web**: https://www.manoprotect.com
- **Email**: info@manoprotect.com
- **Inversores**: inversores@manoprotect.com
- **Teléfono**: +34 601 510 950

---

**Última actualización**: 12 Febrero 2026
**Versión**: 2.5.0
