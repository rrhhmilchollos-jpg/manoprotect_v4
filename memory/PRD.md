# ManoProtect - Product Requirements Document v6.1.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel Lock (cerradura inteligente), Plataforma CRA (software profesional), ManoProtect Connect (app movil), Sentinel SOS, Escudo Vecinal, Panel Vecinal Premium, Dashboard de Barrio con ranking gamificado, Sistema Central de Empresa (CRM + Instalaciones), sistema de referidos universal, y chatbot de captacion de leads.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush

## MODELO DE NEGOCIO
- Instalacion profesional: GRATIS | SIN permanencia | SIN pruebas gratis (interno)
- Referidos: 1 mes gratis para ambos | Pago anual: 10 meses, llevate 12

## PRECIOS
### Alarmas Hogar: Essential 33.90/44.90, Premium 44.90/54.90
### Alarmas Negocio: Comercio 54.90/69.90, Empresa 74.90/89.90
### Sentinel SOS: Basic 9.99, Plus 14.99, Pro 24.99 EUR/mes
### Sentinel Lock: 249 EUR (dispositivo) + plan monitorizacion desde 9.99/mes
### Dispositivos: X=199, J=79, S=103 EUR
### Vecinal Premium: 299.99 EUR/ano

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Production URL
https://digital-guard-1.emergent.host/

## Completed Features (as of Mar 2026)
- Universal Referral System (Stripe webhook + validation)
- Gamified Neighborhood Ranking (Dashboard de Barrio)
- Enterprise Central Management Portal
- Lead-Capture Chatbot
- Performance Optimization (Lighthouse +90 target)
- Pricing Overhaul (competitive with Securitas Direct)
- Content Correction (Instalacion GRATIS, not equipo)
- New Product Ecosystem: Sentinel Lock, CRA Platform, ManoProtect Connect pages
- Cross-sell integration (Sentinel Lock on alarm pages + calculator)
- Navigation updated (header + footer links to all new products)
- Sentinel Lock custom product images + Interactive AI detection demo
- **CRA Operator Dashboard** (/cra-operador): Monitoreo alarmas en tiempo real
- **Client Security Dashboard** (/mi-seguridad): Armado/Desarmado, camaras, historial
- **Professional Sales CRM V2** (/gestion-empresa): Kanban, calendario, comisiones, stock
- **Integracion CRM -> CRA -> App**: Auto-provisioning al cerrar lead
- Bug fix: Login/Registro desde Home (DOM error)
- Bug fix: CORS credentials (allow_origin_regex + allow_credentials=True) - Mar 2026
- CSP updated: *.emergent.host added to connect-src
- Deployment fix: .gitignore corruption resolved

## Backlog
- P0: Crear aplicaciones de escritorio independientes (CRM + CRA) + limpiar BD de datos mock
- P1: Streaming camaras en tiempo real (reemplazar placeholders)
- P1: SEO/SEM (requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P2: Build app iOS (requiere Mac con Xcode)
- P2: Activar integraciones mockeadas (112 emergencia, BigQuery)
- P2: CRO avanzado (A/B testing, remarketing)
- P3: Videos marketing (Sora 2 - sin credito)
- P3: Migrar SHA256 a bcrypt

## Testing
- CORS fix: Verified via curl + Playwright (login -> dashboard redirect OK)
- iteration_83: 100% pass - CRA + Client App + CRM
- iteration_82: 100% pass - Sentinel Lock images + video
- iteration_81: 100% pass - Sentinel Lock demo interactiva
- iteration_80: 100% pass - Ecosistema nuevos productos
