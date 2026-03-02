# ManoProtect - Product Requirements Document v3.1.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica. Dispositivos Sentinel, alarmas, Escudo Vecinal gratuito, Panel Vecinal Premium (independiente), Dashboard de Barrio publico con ranking gamificado, y Sistema Central de Empresa.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush (Web Push API)

## PLAN VECINAL PREMIUM
- **INDEPENDIENTE y OPCIONAL** - No requiere ningun otro producto
- Precio: 299.99 EUR/ano (solo anual, por family_id, ilimitadas familias)
- Sistema de referidos COMPLETO:
  - Input de codigo en paywall + validacion
  - Endpoint POST /referrals/redeem extiende suscripcion del referidor +30 dias
  - GET /referrals/validate/{code} - validacion publica
  - localStorage guarda codigo para post-checkout
- Push notifications integradas en alertas criticas

## DASHBOARD DE BARRIO (PUBLIC)
- Pagina publica: /dashboard-barrio
- Estadisticas anonimizadas, graficos, mapa de calor
- **Ranking Gamificado** con:
  - Puntuaciones: Comunidad, Vigilancia, Respuesta (0-100)
  - Insignias: Comunidad Fuerte, Defensores Elite, Barrio Seguro, Embajador, etc.
  - Tiers: gold/silver/bronze/starter
  - Siguiente objetivo con barra de progreso
- Backend: /api/dashboard-barrio/public-stats, /api/dashboard-barrio/leaderboard, /api/dashboard-barrio/ranking

## SISTEMA CENTRAL DE EMPRESA
- Pagina: /gestion-empresa
- Dashboard central con metricas (usuarios, suscripciones, ingresos, empleados)
- CRM de Ventas: CRUD leads con pipeline (new > contacted > qualified > proposal > closed)
- Gestion de Instalaciones: programar, iniciar, completar
- Backend: /api/enterprise-central/*

## NOTIFICACIONES PUSH
- services/push_notification_service.py
- Integrado con alertas vecinales criticas
- Web Push API con VAPID keys + pywebpush

## Escudo Vecinal (GRATUITO)
- /escudo-vecinal: Mapa + alertas comunitarias
- CTAs a /dashboard-barrio y /panel-vecinal

## Alarmas (Checkout Stripe funcional)
- /alarmas-hogar + /alarmas/vivienda + /alarmas/negocio + /calculador

## Newsletter
- POST /api/newsletter/subscribe + form en footer

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Todos los Plans Stripe
| Plan | Precio | Periodo | Tipo |
|---|---|---|---|
| vecinal-anual | 299.99 | ano | Comunidad (INDEPENDIENTE) |
| alarm-business | 54.99 | mes | Alarma |
| alarm-premium | 39.99 | mes | Alarma |
| alarm-essential | 24.99 | mes | Alarma |
| enterprise | 199.99 | mes | Empresa |
| family-yearly | 99.99 | ano | Familia |
| family-monthly | 9.99 | mes | Familia |

## Backlog (Priorizado)
- P2: SEO/SEM (BLOQUEADO - requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P3: Videos marketing (Sora 2, sin credito)
- P3: Migrar password hash de SHA256 a bcrypt
- P3: Activar integraciones produccion (SMS Infobip, Email SendGrid, WhatsApp Twilio)
- P3: Build iOS con Capacitor (requiere Mac/Xcode)

## Testing
- iteration_76: 100% pass - FULL button/nav audit + Ranking gamificado + Referral system (backend 22/22, frontend 100%)
- iteration_75: 100% pass - Dashboard Barrio + Enterprise Central + Push Notifications (backend 28/28, frontend 100%)
- iteration_74: 100% pass - Panel Vecinal
- iteration_72: 100% pass - alarm checkout, newsletter, employee portal
