# ManoProtect - Product Requirements Document v9.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock, Plataforma CRA, ManoProtect Connect, Sentinel SOS, Escudo Vecinal, CRM de Ventas Profesional, App cliente ManoConnect, Sistema de Gestion CRA con 3 apps por rol.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush | Desktop: Electron | Auth: bcrypt + JWT | Mobile: Capacitor + Android WebView

## Production URL: https://www.manoprotect.com
## Database: manoprotect_db

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO (todo) |
| admin@manoprotect.com | ManoAdmin2025! | Gestion CRA Admin |
| comercial@manoprotect.com | Comercial2025! | Gestion CRA Comerciales |
| instalador@manoprotect.com | Instalador2025! | Gestion CRA Instaladores |

## Completed Features (as of Mar 6, 2026)

### Family ID Authentication System (NEW - Mar 6, 2026)
- **POST /api/auth/familia/register**: Register with familia_id + email + password
- **POST /api/auth/familia/login**: Login with familia_id validation
- **POST /api/auth/familia/request-password-reset**: Request reset token
- **POST /api/auth/familia/reset-password**: Reset password with token
- Frontend: /familia page with Login/Register/Forgot tabs
- Password strength validation enforced
- Testing: 100% passed (iteration 86)

### Notifications System (NEW - Mar 6, 2026)
- Real-time notification bell on all 3 gestión apps
- Auto-notifications on: new pedido (to admin), low stock <5 (to comerciales), installer assignment (to specific installer), app version update (to role)
- GET /api/gestion/notificaciones - filtered by user role/id
- PUT /api/gestion/notificaciones/leer - mark all read
- Polling every 15 seconds
- Testing: 100% passed (iteration 86)

### App Version Control & Auto-Update (NEW - Mar 6, 2026)
- GET /api/gestion/app-versions - all app versions
- POST /api/gestion/app-versions/check - public endpoint for update checking
- PUT /api/gestion/app-versions/{app} - admin updates version
- UpdateChecker component shows banner when new version available
- Force update support for critical versions
- Testing: 100% passed (iteration 86)

### Play Store App Structure (NEW - Mar 6, 2026)
- /apps/comerciales, /apps/instaladores, /apps/admin with build.gradle, version.properties, google-services.json, MainActivity.java
- Scripts: build.sh, deploy_playstore.sh, rollback.sh, changelog_generator.sh
- CI/CD: GitHub Actions pipeline (main.yml)
- Auto version increment on build
- Deploy to Play Store via Google Play Developer API
- Rollback support
- Documentation: /apps/README.md

### Sistema de Gestion CRA (Mar 6, 2026)
- 3 role-based apps: Comerciales, Instaladores, Administracion
- JWT auth with roles, CRUD (stock, pedidos, instalaciones, usuarios), audit logs
- 30+ endpoints under /api/gestion/*
- Routes: /gestion/login, /gestion/comerciales, /gestion/instaladores, /gestion/admin
- Testing: 100% (iterations 85, 86)

### Previous Features
- Universal Referral System + Gamified Neighborhood Ranking
- Enterprise Central Management Portal
- Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect
- CRA Operator Dashboard (/cra-operador)
- Professional Sales CRM V2 (/gestion-empresa)
- ManoConnect Client App (/mi-seguridad)
- Desktop Apps (Electron CRM + CRA)
- bcrypt password migration
- Relative API URLs for production

## Backlog
- P1: Verify production login fix after redeploy
- P1: Connect real RTSP camera streams
- P1: Add GA4/Meta Pixel/Hotjar IDs
- P2: iOS build with Capacitor
- P2: Activate integrations (112, BigQuery)
- P3: Marketing videos (Sora 2)

## Testing
- iteration_86: 100% (23/23 backend + frontend) - notifications, app versions, familia auth
- iteration_85: 100% (27/27 backend + frontend) - gestion CRA CRUD
- iteration_84: 100% - bcrypt migration, camera feeds

## Mocked/Blocked
- Email delivery for password reset (SendGrid not configured for production)
- SMS (Infobip invalid key)
- Twilio WhatsApp (sandbox only)
- Real camera streams (professional placeholder videos)
