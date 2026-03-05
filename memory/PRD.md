# ManoProtect - Product Requirements Document v7.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock, Plataforma CRA, ManoProtect Connect, Sentinel SOS, Escudo Vecinal, CRM de Ventas Profesional, App cliente ManoConnect.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush | Desktop: Electron | Auth: bcrypt | Mobile: Capacitor

## Production URL: https://www.manoprotect.com
## Database: manoprotect_db (renamed from test_database)

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO (todo) |

## Completed Features (as of Mar 5, 2026)
### Core Platform
- Universal Referral System + Gamified Neighborhood Ranking
- Enterprise Central Management Portal + Lead-Capture Chatbot
- Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect pages
- Interactive AI detection demo (Sentinel Lock)
- Pricing overhaul (competitive vs Securitas Direct)

### Operational Software
- CRA Operator Dashboard (/cra-operador) - Real-time alarm monitoring
- Professional Sales CRM V2 (/gestion-empresa) - Kanban, calendar, commissions, stock
- **NEW: Catalogo de Productos** - Technical product cards for sales agents
- **NEW: ManoProtect Vision** - Digital sales magazine for tablet presentations
- CRM -> CRA -> App auto-provisioning on deal close

### ManoConnect Client App (/manoconnect)
- Mobile-first dark theme with bottom navigation
- Arm/Disarm system controls
- CCTV camera simulation feeds (canvas-based, RTSP-ready)
- Event history timeline
- SOS panic button (hold 3s, sends alert to CRA)
- User management (add/remove authorized users)
- Settings page
- Cookie-based auth fallback (no x-user-email header required)
- 15-second auto-refresh + manoprotect-refresh event support

### Desktop Apps (Electron)
- CRM Desktop + CRA Desktop + Combined package
- Auto-refresh 10s, offline mode, alert notifications
- ZIPs auto-generated on server startup
- Download: /api/v1/downloads/desktop-completo?key=mano2025investor

### Security & Infrastructure
- CORS fix: allow_origin_regex + allow_credentials=True
- CSP: *.emergentagent.com + *.emergent.host + *.manoprotect.com
- bcrypt migration (auto-upgrades SHA256 on login)
- REACT_APP_BACKEND_URL="" (relative URLs for production compatibility)
- SEO: JSON-LD SecurityCompany schema, GA4/Meta Pixel/Hotjar env vars
- DB renamed: test_database -> manoprotect_db

## Backlog
- P1: Connect real RTSP camera streams when hardware available
- P1: Add GA4/Meta Pixel/Hotjar IDs
- P2: iOS build on Mac with Xcode (guide at IOS_BUILD_GUIDE.md)
- P2: Activate integrations (112 emergency, BigQuery)
- P3: Marketing videos (Sora 2)

## Testing
- iteration_85: 100% backend, frontend tested
- iteration_84: 100% all tests passed
- Cookie auth: verified via curl (session -> user_sessions -> users lookup)
