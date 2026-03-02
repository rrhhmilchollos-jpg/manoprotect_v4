# ManoProtect - Product Requirements Document v3.0.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica. Dispositivos Sentinel, alarmas, Escudo Vecinal gratuito, Panel Vecinal Premium (independiente), Dashboard de Barrio publico, y Sistema Central de Empresa.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Push: pywebpush (Web Push API)

## PLAN VECINAL PREMIUM
- **INDEPENDIENTE y OPCIONAL** - No requiere ningun otro producto
- Precio: 299.99 EUR/ano (solo anual, por family_id, ilimitadas familias)
- Sistema de referidos: 1 mes gratis por vecino que contrate
- Backend: /api/panel-vecinal/* (ver endpoints abajo)
- Push notifications integradas en alertas criticas

## DASHBOARD DE BARRIO (NUEVO - Mar 2, 2026)
- Pagina publica: /dashboard-barrio
- Muestra estadisticas anonimizadas del barrio
- Graficos de tipo de incidencia, mapa de calor, nivel de seguridad
- CTA al Panel Vecinal Premium para conversion
- Backend: /api/dashboard-barrio/public-stats, /api/dashboard-barrio/leaderboard

## SISTEMA CENTRAL DE EMPRESA (NUEVO - Mar 2, 2026)
- Pagina: /gestion-empresa
- Dashboard central con metricas clave (usuarios, suscripciones, ingresos, empleados)
- CRM de Ventas: CRUD de leads con pipeline (new > contacted > qualified > proposal > closed)
- Gestion de Instalaciones: programar, iniciar, completar instalaciones
- Backend: /api/enterprise-central/dashboard, /api/enterprise-central/leads, /api/enterprise-central/installations

## NOTIFICACIONES PUSH (NUEVO - Mar 2, 2026)
- Servicio: services/push_notification_service.py
- Integrado con panel_vecinal_routes.py - se activan al enviar alertas criticas
- Usa Web Push API con VAPID keys
- Envia a todos los usuarios con push_subscriptions activas

## Escudo Vecinal (GRATUITO)
- /escudo-vecinal: Mapa + alertas comunitarias
- Links a /dashboard-barrio y /panel-vecinal

## Alarmas (Checkout Stripe funcional)
- /alarmas-hogar + /alarmas/vivienda + /alarmas/negocio + /calculador

## Newsletter
- POST /api/newsletter/subscribe + form en footer

## Portal Empleados
- Login: admin@manoprotect.com / Admin2026!

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
- P2: Logica completa del sistema de referidos (aplicar recompensa 1 mes gratis via Stripe)
- P2: SEO/SEM (BLOQUEADO - requiere IDs Meta Pixel, Hotjar, Google Search Console)
- P3: Videos marketing (Sora 2, sin credito)
- P3: Migrar password hash de SHA256 a bcrypt
- P3: Activar integraciones produccion (SMS Infobip, Email SendGrid, WhatsApp Twilio)
- P3: Build iOS con Capacitor (requiere Mac/Xcode)

## Testing
- iteration_75: 100% pass - Dashboard Barrio + Enterprise Central + Push Notifications (backend 28/28, frontend 100%)
- iteration_74: 100% pass - Panel Vecinal
- iteration_72: 100% pass - alarm checkout, newsletter, employee portal
- iteration_71: 100% pass - community shield
