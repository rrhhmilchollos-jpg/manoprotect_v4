# ManoProtect - Product Requirements Document v2.8.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica. Dispositivos Sentinel, alarmas, Escudo Vecinal gratuito, y Panel Vecinal Premium (independiente).

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe

## PLAN VECINAL PREMIUM (Actualizado Mar 2, 2026)

### Concepto
Plan **INDEPENDIENTE y OPCIONAL**. No requiere ningun otro producto de ManoProtect. Cualquier grupo de vecinos puede contratarlo por family_id. Ilimitadas familias por barrio.

### Precio: 299.99 EUR/ano (25 EUR/mes equivalente)
- **SOLO ANUAL** - No opcion mensual
- **POR FAMILIA** (family_id) - Un plan por unidad familiar
- **ILIMITADO** - Sin limite de familias por barrio
- **INDEPENDIENTE** - No requiere alarma ni otro producto

### Sistema de Referidos
- Cada familia que trae un vecino nuevo = 1 mes gratis
- Codigo referido unico por familia
- URL compartible: manoprotect.com/panel-vecinal?ref=CODIGO

### Backend API: /api/panel-vecinal/*
| Endpoint | Auth | Descripcion |
|---|---|---|
| GET /plan-info | Public | Info plan, precio, features |
| GET /check-access | Public | Verificar suscripcion |
| POST /alerts | Premium | Enviar alerta vecinal |
| GET /alerts | Premium | Alertas activas (48h) |
| GET /dashboard | Premium | Stats completas |
| PATCH /alerts/{id}/confirm | Premium | Confirmar alerta |
| PATCH /alerts/{id}/resolve | Premium | Resolver alerta |
| GET /neighbors | Premium | Familias vecinas |
| POST /referrals/invite | Premium | Invitar vecino |
| GET /referrals | Premium | Mis referidos |

### Paywall
- Sin suscripcion: Muestra landing con precio, features, badges INDEPENDIENTE/SOLO ANUAL, banner referidos
- Con suscripcion activa: Dashboard completo con alertas en vivo

## Todos los Plans Stripe (INDEPENDIENTES)
| Plan | Precio | Periodo | Tipo |
|---|---|---|---|
| vecinal-anual | 299.99 | ano | Comunidad (INDEPENDIENTE) |
| alarm-business | 54.99 | mes | Alarma |
| alarm-premium | 39.99 | mes | Alarma |
| alarm-essential | 24.99 | mes | Alarma |
| enterprise | 199.99 | mes | Empresa |
| family-yearly | 99.99 | ano | Familia |
| family-monthly | 9.99 | mes | Familia |

## Escudo Vecinal (GRATUITO)
- /escudo-vecinal: Mapa + alertas comunitarias
- CTA al Panel Vecinal Premium al final

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

## Backlog
- P1: Sistema enterprise central (gestion empresa, herramientas comerciales)
- P1: Notificaciones push para Panel Vecinal
- P2: SEO/SEM (requiere IDs Meta/Hotjar/GSC)
- P3: Videos marketing, integraciones produccion, App iOS

## Testing
- iteration_74: 100% pass - Panel Vecinal UPDATED (backend 15/15, frontend 14/14)
- iteration_73: 100% pass - Panel Vecinal original
- iteration_72: 100% pass - alarm checkout, newsletter, employee portal
- iteration_71: 100% pass - community shield
