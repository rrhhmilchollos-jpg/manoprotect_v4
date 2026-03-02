# ManoProtect - Product Requirements Document v5.0.0

## Core Product
Plataforma lider en seguridad en Espana. Alarmas hogar/negocio, Sentinel SOS, Escudo Vecinal, Panel Vecinal Premium, Dashboard de Barrio con ranking gamificado, Sistema Central de Empresa (CRM + Instalaciones), sistema de referidos universal, y chatbot de captacion de leads.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush

## MODELO DE NEGOCIO
- Instalacion profesional: GRATIS | SIN permanencia | SIN pruebas gratis (interno)
- Referidos: 1 mes gratis para ambos | Pago anual: 10 meses, llevate 12

## PRECIOS
### Alarmas Hogar: Essential 33.90/44.90, Premium 44.90/54.90
### Alarmas Negocio: Comercio 54.90/69.90, Empresa 74.90/89.90
### Sentinel SOS: Basic 9.99, Plus 14.99, Pro 24.99 EUR/mes
### Dispositivos: X=199, J=79, S=103 EUR
### Vecinal Premium: 299.99 EUR/ano

## CHATBOT LEAD CAPTURE (NUEVO)
- Widget flotante verde en todas las paginas (z-[80])
- Respuestas predefinidas: precios, productos, instalacion, referidos
- Formulario de captacion: nombre, telefono, email
- Leads guardados en enterprise-central con source='chatbot'
- Quick replies + free text matching

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Backlog
- P2: SEO/SEM (requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P3: Videos marketing (Sora 2), migrar SHA256 a bcrypt
- P3: Activar SMS/Email/WhatsApp produccion, Build iOS

## Testing
- iteration_79: 100% pass - Chatbot lead capture (backend 8/8, frontend 100%)
- iteration_78: 100% pass - Precios actualizados + Performance
- iteration_77: 100% pass - Pricing + Referidos universales
- iteration_76: 100% pass - Full button audit + Ranking
- iteration_75: 100% pass - Dashboard Barrio + Enterprise + Push
