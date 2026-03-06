# ManoProtect - PRD v10.9.0

## Problema Original
Aplicación de seguridad empresarial "ManoProtect" con gestión de roles, sistema de alarmas, equipos de instaladores, apps PWA Android.

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes) — creds via env vars
- **Email**: Brevo
- **Pagos**: Stripe
- **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO | ceo@manoprotect.com | 19862210Des |
| Admin CRA | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Completado

### Deploy Fix — Firebase JSON Blocker (Mar 6, 2026)
- Eliminado `firebase-admin-sdk.json` hardcodeado del repo (bloqueador de deploy)
- Migrado Firebase Admin SDK a usar variables de entorno (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- Actualizado `server.py` y `emergency_notifications.py`
- Añadido `firebase-admin-sdk.json` a `.gitignore`

### Enlace directo TikTok → Promo (Mar 6, 2026)
- Auto-scroll a `#promo-sentinel` cuando el usuario llega desde TikTok con `manoprotect.com/#promo-sentinel`
- El banner de la promo está entre el hero y la sección de beneficios

### Promoción TikTok — Sentinel S GRATIS (Mar 6, 2026)
- Backend: `/api/promo/sentinel-s/*` (status, checkout, confirm, shipping, admin orders, tracking)
- Landing page: Banner rojo-naranja-amarillo con urgencia (X/100), CTAs mensual/anual
- Página gracias: `/promo/sentinel-s/gracias` con formulario de envío
- Admin: Sección "Promo TikTok" con stats, pedidos, tracking
- Notificaciones admin automáticas
- Códigos regalo auto-generados (SENTINEL-XXXXXXXX)
- Límite: 100 unidades, 1/usuario, envío máx. 60 días

### Service Worker v5 (Mar 6, 2026)
- Fix offline PWA: app shell pattern (red → caché → index.html → offline.html)

### Anteriores (v10.7.0)
- Auth bcrypt, Lighthouse optimization, SEO/Google Discover, Equipos instaladores, PWA-to-APK prep

## Archivos clave
- `/app/backend/routes/promo_sentinel_routes.py`
- `/app/frontend/src/pages/HighConversionLanding.js`
- `/app/frontend/src/pages/PromoSentinelGracias.jsx`
- `/app/frontend/src/pages/GestionAdmin.jsx`
- `/app/frontend/public/sw.js`
- `/app/backend/services/emergency_notifications.py`

## Backlog
- **P0**: Generar APKs con PWABuilder
- **P1**: CI/CD Play Store (usuario: KEYSTORE_BASE64, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
- **P1**: Streaming RTSP cámaras
- **P1**: SEO/SEM/Ads (Meta Pixel ID, Hotjar ID, GSC)
- **P2**: App iOS Capacitor (requiere Mac)
- **P2**: Integraciones 112, BigQuery
- **P3**: Videos marketing Sora 2
