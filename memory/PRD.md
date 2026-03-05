# ManoProtect - Product Requirements Document v8.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock, Plataforma CRA, ManoProtect Connect, Sentinel SOS, Escudo Vecinal, CRM de Ventas Profesional, App cliente ManoConnect, Sistema de Gestion CRA.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush | Desktop: Electron | Auth: bcrypt + JWT | Mobile: Capacitor

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

### Sistema de Gestion CRA (NEW - Mar 6, 2026)
- **3 role-based apps**: Comerciales, Instaladores, Administracion
- **JWT auth** con roles separados (comercial/instalador/admin)
- **Stock management**: CRUD completo con alertas de stock bajo
- **Pedidos**: Creacion por comerciales, gestion de estados
- **Instalaciones**: Asignacion de instaladores, tracking de estado
- **Usuarios**: Gestion de credenciales por admin
- **Logs de auditoria**: Registro de todas las acciones
- **Seed data**: Admin + comercial + instalador demo + 10 productos
- Routes: /gestion/login, /gestion/comerciales, /gestion/instaladores, /gestion/admin
- API: /api/gestion/* (27 endpoints)
- Testing: 100% passed (iteration 85)

### Core Platform
- Universal Referral System + Gamified Neighborhood Ranking
- Enterprise Central Management Portal + Lead-Capture Chatbot
- Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect pages
- Interactive AI detection demo (Sentinel Lock)
- Pricing overhaul (competitive vs Securitas Direct)

### Operational Software
- CRA Operator Dashboard (/cra-operador) - Real-time alarm monitoring
- Professional Sales CRM V2 (/gestion-empresa) - Kanban, calendar, commissions, stock
- Catalogo de Productos - Technical product cards for sales agents
- ManoProtect Vision - Digital sales magazine for tablet presentations
- CRM -> CRA -> App auto-provisioning on deal close

### ManoConnect Client App (/manoconnect)
- Mobile-first dark theme with bottom navigation
- Arm/Disarm system controls
- CCTV camera simulation feeds (canvas-based, RTSP-ready)
- Event history timeline
- SOS panic button (hold 3s, sends alert to CRA)

### Desktop Apps (Electron)
- CRM Desktop + CRA Desktop + Combined package
- Auto-refresh 10s, offline mode, alert notifications
- ZIPs auto-generated on server startup

### Security & Infrastructure
- CORS fix: allow_origin_regex + allow_credentials=True
- bcrypt migration (auto-upgrades SHA256 on login)
- REACT_APP_BACKEND_URL="" (relative URLs for production compatibility)
- SEO: JSON-LD SecurityCompany schema

## Backlog
- P0: Complete familia_id authentication system
- P1: Connect real RTSP camera streams
- P1: Add GA4/Meta Pixel/Hotjar IDs
- P1: Verify production login fix after redeploy
- P2: iOS build on Mac with Xcode
- P2: Activate integrations (112 emergency, BigQuery)
- P3: Marketing videos (Sora 2)

## Testing
- iteration_85: 100% all gestion CRA tests passed (27 backend + 4 frontend pages)
- iteration_84: 100% all tests passed
