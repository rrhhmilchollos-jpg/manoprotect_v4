# ManoProtect - Product Requirements Document v6.3.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock, Plataforma CRA, ManoProtect Connect, Sentinel SOS, Escudo Vecinal, CRM de Ventas Profesional.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush | Desktop: Electron | Auth: bcrypt

## Production URL: https://manoprotect.com

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |

## Completed Features (as of Mar 4, 2026)
- Universal Referral System + Gamified Neighborhood Ranking
- Enterprise Central Management Portal + Lead-Capture Chatbot
- New Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect pages
- Interactive AI detection demo (Sentinel Lock)
- CRA Operator Dashboard (/cra-operador) + Client Security Dashboard (/mi-seguridad)
- Professional Sales CRM V2 (/gestion-empresa) + CRM->CRA auto-provisioning
- CORS credentials fix (allow_origin_regex + allow_credentials=True)
- CSP updated with *.emergent.host + wss://*.manoprotect.com
- Database cleanup: 1,999 test docs removed
- Desktop Apps (Electron): CRM + CRA with auto-refresh 10s
- **bcrypt migration**: Enterprise employees auto-migrate SHA256->bcrypt on login
- **CCTV Camera Simulation**: Canvas-based feeds with HUD overlay, timestamp, EN VIVO, snapshot, recording, fullscreen controls. Ready for real RTSP integration
- **SEO/SEM Infrastructure**: Updated meta descriptions, OpenGraph tags, JSON-LD SecurityCompany schema, GA4/Meta Pixel/Hotjar via env vars, Google Search Console verification
- **iOS Capacitor**: Project configured, build guide at IOS_BUILD_GUIDE.md

## Testing: iteration_84 = 100% (13/13 backend, all frontend passed)

## Backlog
- P1: Connect real camera RTSP streams when hardware available
- P1: Add GA4, Meta Pixel, Hotjar IDs when user provides them
- P2: Build iOS on Mac with Xcode
- P2: Activate integrations (112 emergency, BigQuery)
- P3: Marketing videos (Sora 2)
