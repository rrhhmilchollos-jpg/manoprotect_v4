# ManoProtect - Product Requirements Document

## Project Overview
ManoProtect is a revolutionary cybersecurity platform for both consumers (B2C) and businesses (B2B).

**Website**: https://www.manoprotect.com
**Preview URL**: https://mano-staging.preview.emergentagent.com

## Implemented Features (All PRODUCTION READY)

### 1. Real-Time Threat Intelligence ✅
- Live APIs: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX
- Endpoints: `/api/realtime/check/*`

### 2. AI Voice Shield ✅
- Detects phone scams using AI pattern analysis
- Frontend: `/voice-shield`
- Backend: `/api/voice-shield/*`

### 3. Smart Family Locator ✅
- Behavioral zones (safe, school, work, restricted)
- SOS button, location history, zone alerts
- Frontend: `/smart-locator`
- Backend: `/api/smart-locator/*`

### 4. Anti-Deepfake Shield ✅
- Detects manipulated images, audio, video
- 19 detection indicators (8 image, 6 audio, 5 video)
- Frontend: `/deepfake-shield`
- Backend: `/api/deepfake-shield/*`

### 5. Chrome Extension ✅
- Real-time URL verification
- Download: `/app/manoprotect-chrome-extension.zip`
- Publication guide: `/app/GUIA_PUBLICAR_EXTENSION_CHROME.md`

### 6. Investor CRM (Internal, Free) ✅
- Track investor downloads and interactions
- Status management (lead → committed)
- Notes and tags per investor
- Analytics dashboard
- Frontend: `/investor-crm`
- Backend: `/api/investor-crm/*`

### 7. Google AdSense ✅
- ads.txt: `/frontend/public/ads.txt`
- Publisher ID: pub-7713974112203810

### 8. Investor Portal ✅
- Contact: inversores@manoprotect.com | +34 601 510 950
- 4 documents: Business Plan, Financial Model, Pitch Deck, Dossier B2B

### 9. Trust Seal / Sello de Confianza ✅ (NEW)
- Badge visual para webs de clientes protegidos por ManoProtect
- Verificación de sellos en tiempo real
- Solicitud de nuevos sellos para empresas
- Frontend: `/shield` → componente TrustSeal
- Backend: `/api/shield/seal/*`
- Sello visible en footer de landing page

### 10. DNA Digital Identity System ✅ (NEW)
- Identidad digital verificable única
- Verificación de teléfonos, emails, webs
- Registro de identidades para personas y empresas
- Frontend: `/shield` → componente DNADigital
- Backend: `/api/shield/dna/*`

### 11. Blockchain Transaction Verifier ✅ (NEW)
- Verificador de transacciones blockchain
- Soporte: Bitcoin, Ethereum, Polygon, BNB Chain
- Verificador de wallets y smart contracts
- Detección de rug pulls, honeypots, mixers
- Frontend: `/blockchain-verifier`

### 12. Employee Dashboard ✅ (NEW)
- Panel de control completo del sistema
- Gestión de usuarios, amenazas, sellos, DNA Digital
- Estado del sistema en tiempo real
- Acciones administrativas rápidas
- Frontend: `/employee-dashboard`
- Backend: `/api/admin/*` (endpoints adicionales)

### 13. ManoProtect SOS Button (Dispositivo Físico) ✅ (NEW)
- Llavero físico de emergencia con botón SOS
- GPS en tiempo real (precisión 2.5m)
- Conexión directa al 112 (emergencias España)
- Audio bidireccional para comunicación
- Detección automática de caídas
- 7 días de batería, carga USB
- Sistema de pedidos con contador de personas/hogar
- Envío express 24-48h a domicilio
- Frontend: `/sos-device`, `/boton-sos`
- Backend: `/api/sos-device/*`
- Documentación técnica: `/app/docs/MANOPROTECT_SOS_KEYCHAIN_SPECS.md`

## Tech Stack
- **Frontend**: React.js + Tailwind + Shadcn/UI
- **Backend**: Python FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **APIs**: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX
- **Video Generation**: Sora 2 (via emergentintegrations)

## Key Routes Summary

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

## Changelog

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
- Routes: /legacy-vault, /phishing-simulation

### Feb 12, 2026 - SOS Sound Fix & Payment Cleanup
- ✅ SOS button sound: Silent for sender, siren plays on family members' devices
- ✅ Added automatic siren (8s, 600-1400Hz) when family alerts arrive
- ✅ Added browser notification for SOS alerts
- ✅ Verified payment_transactions collection is empty (0 documents)
- ✅ Videos Demo duration changed from 8s to 12s (Sora 2 max)

### Feb 12, 2026 - Videos Demo IA Page
- ✅ Created Videos Demo IA page with Sora 2 integration
- ✅ 4 demo videos: SOS Button, Family Locator, Voice Shield, Deepfake Detector
- ✅ Backend API for video generation at `/api/demo-videos/`
- ✅ Added route `/videos-demo` and Dashboard quick access
- ✅ All logos updated to WebP format across the app

### Feb 12, 2026 - PageSpeed Optimization
- ✅ Fixed CORS error blocking `/api/auth/me` (wildcard + credentials conflict)
- ✅ Logo optimization: PNG 121KB → WebP 6.5KB (95% reduction)
- ✅ Improved preconnect: removed unused unsplash, added Firebase
- ✅ Color contrast improvements across landing page (WCAG compliance)
- ✅ Fixed ARIA prohibited attributes on testimonial star ratings
- ✅ Optimized bigdata-analytics.js to avoid forced reflows
- ✅ Enhanced security headers: CSP, COOP, Permissions-Policy
- ✅ SEO: Fixed "Más información" link descriptor

### Feb 11, 2026 (Previous Session)
- ✅ Google AdSense ads.txt created (pub-7713974112203810)
- ✅ Smart Family Locator - Full implementation
- ✅ Anti-Deepfake Shield - Full implementation  
- ✅ Investor CRM - Full implementation (internal, free)
- ✅ Chrome Extension publication guide
- ✅ Investor portal contact updated

### Previous Sessions
- ✅ AI Voice Shield
- ✅ Live API integration (all 4 providers)
- ✅ Chrome Extension created
- ✅ Database migration to MongoDB
- ✅ Test user cleanup

## Remaining Backlog

### P1 - High Priority
- [ ] WhatsApp Business API integration (alerts)
- [ ] Videos Demo IA - extend to 1 minute (Sora 2 limitation: 12s max)

### P2 - Medium Priority  
- [ ] PageSpeed optimization (currently 65/100)

### P3 - Future
- [ ] Additional blockchain networks support

## Active Users
1. rrhh.milchollos@gmail.com - Ivan Rubio Cano (superadmin)
2. msolassanchis@gmail.com - Maria Deseada Solas Sanchis (superadmin)
3. ivanrubiosolas@gmail.com - Ivan Rubio cano (superadmin)
4. info@manoprotect.com - ManoProtect Admin (superadmin)
5. vguerolanavarro@gmail.com - Vicente (premium)

## Environment Variables
```
# Backend
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...
EMERGENT_LLM_KEY=... (for Sora 2)

# Frontend
REACT_APP_BACKEND_URL=https://mano-staging.preview.emergentagent.com
```

## Files Reference
- Backend routes: `/app/backend/routes/`
- Frontend pages: `/app/frontend/src/pages/`
- Shield components: `/app/frontend/src/components/shield/`
- Chrome Extension: `/app/chrome-extension/`
- Documentation: `/app/memory/`

## New Files Created This Session
- `/app/frontend/src/pages/EmployeeDashboard.js` - Panel de control empleados
- `/app/frontend/src/pages/BlockchainVerifier.js` - Verificador blockchain
- `/app/frontend/src/components/TrustBadge.jsx` - Componente sello de confianza
