# ManoProtect - Product Requirements Document v2.7.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias. Dispositivos Sentinel (X, J, S), sistemas de alarma profesionales, red de seguridad comunitaria Escudo Vecinal, y Panel Vecinal Premium.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe

## PLAN VECINAL PREMIUM (Mar 1, 2026) - NUEVO

### Descripcion
El plan mas caro de ManoProtect. SOLO disponible como suscripcion anual, por unidad familiar (family_id). Panel de seguridad vecinal en tiempo real con alertas de okupaciones, robos e intrusiones.

### Precio
- **499.99 EUR/ano** (41.67 EUR/mes equivalente)
- **SOLO ANUAL** - No existe opcion mensual
- **POR FAMILIA** - Un plan por family_id
- Es el plan MAS CARO de todo el sistema

### Tipos de Alerta Vecinal
| Tipo | Descripcion | Prioridad |
|---|---|---|
| okupacion | Posible okupacion | 10 (maxima) |
| robo_vivienda | Robo en vivienda | 9 |
| robo_local | Robo en local/comercio | 8 |
| intrusion | Intrusion detectada | 9 |
| vandalismo | Vandalismo | 6 |
| sospechoso | Actividad sospechosa | 5 |
| emergencia | Emergencia vecinal | 10 (maxima) |

### Backend API
- GET /api/panel-vecinal/plan-info (public)
- GET /api/panel-vecinal/check-access (check subscription)
- POST /api/panel-vecinal/alerts (PREMIUM: send alert)
- GET /api/panel-vecinal/alerts (PREMIUM: get alerts 48h)
- GET /api/panel-vecinal/dashboard (PREMIUM: stats)
- PATCH /api/panel-vecinal/alerts/{id}/confirm (PREMIUM)
- PATCH /api/panel-vecinal/alerts/{id}/resolve (PREMIUM)
- GET /api/panel-vecinal/neighbors (PREMIUM)

### Paywall
- Sin suscripcion activa: muestra paywall con precio, features, comparativa, boton checkout Stripe
- Con suscripcion activa (vecinal-anual + family_id): accede al dashboard completo

### Frontend
- /panel-vecinal: Paywall o Dashboard segun suscripcion
- /panel-vecinal-premium: Alias
- Paywall: dark theme, amber/gold accents, "PLAN PREMIUM EXCLUSIVO" badge
- Dashboard: alertas en vivo, tabs (Alertas/Mapa/Estadisticas), boton ALERTA rojo

## Escudo Vecinal (GRATUITO)
- /escudo-vecinal: Mapa interactivo con incidencias
- 6 endpoints API: incidents CRUD, stats, heatmap
- CTA al Panel Vecinal Premium al final de la pagina

## Alarmas
- /alarmas-hogar: Landing funnel
- Checkout Stripe FUNCIONAL: alarm-essential (24.99), alarm-premium (39.99), alarm-business (54.99)
- /calculador: Wizard con boton "Contratar ahora" conectado a Stripe

## Newsletter
- POST /api/newsletter/subscribe + form en footer de toda la web

## Portal Empleados
- Login: admin@manoprotect.com / Admin2026!
- Dashboard con estadisticas y gestion

## Todos los Plans Stripe
| Plan | Precio | Periodo |
|---|---|---|
| vecinal-anual | 499.99 | ano |
| alarm-business | 54.99 | mes |
| alarm-premium | 39.99 | mes |
| alarm-essential | 24.99 | mes |
| enterprise | 199.99 | mes |
| family-yearly | 99.99 | ano |
| family-monthly | 9.99 | mes |

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Backlog
- P1: Completar sistema enterprise central
- P1: Herramientas comerciales (sales tools)
- P2: Notificaciones push para Panel Vecinal
- P2: SEO/SEM (requiere IDs Meta/Hotjar/GSC)
- P3: Integraciones produccion (Infobip, SendGrid, Twilio)
- P3: App iOS (requiere Mac/Xcode)

## Testing
- iteration_73: 100% pass - Panel Vecinal Premium (backend 12/12, frontend 17/17)
- iteration_72: 100% pass - alarm checkout, newsletter, employee portal
- iteration_71: 100% pass - community shield
