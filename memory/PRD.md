# ManoProtect - Product Requirements Document v6.2.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock, Plataforma CRA, ManoProtect Connect, Sentinel SOS, Escudo Vecinal, Panel Vecinal Premium, Dashboard de Barrio, CRM de Ventas Profesional, sistema de referidos universal, chatbot de captacion de leads.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush | Desktop: Electron

## Production URL
https://manoprotect.com

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Completed Features (as of Mar 2026)
- Universal Referral System (Stripe webhook + validation)
- Gamified Neighborhood Ranking (Dashboard de Barrio)
- Enterprise Central Management Portal
- Lead-Capture Chatbot
- Performance Optimization
- New Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect
- Interactive AI detection demo (Sentinel Lock)
- **CRA Operator Dashboard** (/cra-operador)
- **Client Security Dashboard** (/mi-seguridad)
- **Professional Sales CRM V2** (/gestion-empresa)
- **CRM -> CRA -> App Auto-provisioning**
- Bug fix: Login/Registro desde Home
- Bug fix: CORS credentials (allow_origin_regex) - Mar 4, 2026
- Bug fix: CSP updated with *.emergent.host + wss://*.manoprotect.com
- Bug fix: Deployment .gitignore corruption
- **Database cleanup**: 1,999 test docs removed, only real accounts preserved
- **Desktop Apps (Electron)**: CRM + CRA with auto-refresh 10s, offline mode, notifications
- **Download endpoints**: /downloads/desktop-crm, /downloads/desktop-cra, /downloads/desktop-completo

## Desktop Apps
- `/app/desktop-apps/crm-ventas/` - CRM de Ventas (Electron)
- `/app/desktop-apps/cra-operador/` - CRA Operador (Electron)
- Download: `https://manoprotect.com/downloads/desktop-completo?key=mano2025investor`

## Backlog
- P1: Streaming camaras en tiempo real
- P1: SEO/SEM (requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P2: Build app iOS (requiere Mac con Xcode)
- P2: Activar integraciones mockeadas (112 emergencia, BigQuery)
- P3: Videos marketing (Sora 2)
- P3: Migrar SHA256 a bcrypt

## Testing
- DB cleanup: 1,999 docs removed, 15 real docs preserved
- Desktop ZIPs: Download endpoints verified (200 OK)
- Login: Verified via curl + Playwright
- CORS: Fixed and verified
