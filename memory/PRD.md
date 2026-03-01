# ManoProtect - Product Requirements Document v2.6.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias. Dispositivos Sentinel (X, J, S), sistemas de alarma profesionales, y red de seguridad comunitaria Escudo Vecinal.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor

## What's Implemented

### Escudo Vecinal (Mar 1, 2026)
- Red de seguridad comunitaria en tiempo real - EXCLUSIVO ManoProtect
- Mapa interactivo con incidencias (Leaflet + OpenStreetMap)
- 7 tipos de incidencia: robo, vandalismo, sospechoso, ruido, emergencia, accidente, otro
- Sistema de confirmacion vecinal (3+ = confirmada)
- 6 endpoints API: incidents CRUD, stats, heatmap
- Frontend: /escudo-vecinal con 3 tabs (Mapa, Alertas, Como funciona)

### Alarmas Hogar y Empresa
- /alarmas-hogar: Landing funnel profesional estilo Securitas Direct
- /alarmas/vivienda y /alarmas/negocio: Paginas detalle
- /calculador: Wizard 4 pasos con checkout Stripe integrado
- 3 planes: Essential (24.99), Premium (39.99), Business (54.99)
- Checkout Stripe FUNCIONAL para los 3 planes

### Newsletter (Mar 1, 2026)
- POST /api/newsletter/subscribe - Suscripcion con deduplicacion
- DELETE /api/newsletter/unsubscribe - Baja
- GET /api/newsletter/stats - Estadisticas
- Formulario en el footer de toda la web

### Portal Empleados (Mar 1, 2026)
- Login funcional: admin@manoprotect.com / Admin2026!
- Dashboard con estadisticas, gestion empleados, invitaciones
- Roles: director, manager, soporte, analista_fraude, ventas, logistica, marketing, employee
- Rutas enterprise con absences, payslips, documents, notifications, holidays

### Navigation (Actualizada)
Header: Home | Alarmas (rojo) | Escudo Vecinal (azul) | Productos | Precios | Testimonios | Blog | Contacto

### Health Check Monitor
- Polling cada 30s (antes 5s)
- Timeout 10s (antes 4s)  
- Requiere 3 fallos consecutivos antes de mostrar error

## Key URLs
| URL | Descripcion |
|---|---|
| / | Landing principal |
| /alarmas-hogar | Alarmas (Securitas style) |
| /escudo-vecinal | Red seguridad comunitaria |
| /calculador | Calculadora presupuesto |
| /empleados/login | Portal empleados |
| /ceo-dashboard | Panel CEO |

## Key API Endpoints
- POST /api/create-checkout-session (plan_type: alarm-essential/premium/business/family-monthly/etc)
- POST /api/newsletter/subscribe
- GET /api/community-shield/stats, /incidents
- POST /api/employee-portal/login
- GET /api/alarm-plans, POST /api/budget-calculator

## Credentials
| User | Password | Portal |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | Admin/CEO |
| admin@manoprotect.com | Admin2026! | Empleados |

## Backlog
- P1: Completar sistema enterprise central (gestion empresa)
- P1: Herramientas comerciales (sales tools)
- P2: Notificaciones push para Escudo Vecinal
- P2: SEO/SEM (requiere IDs Meta/Hotjar/GSC)
- P2: Videos marketing (credito Sora 2)
- P3: Migrar password hashing de SHA-256 a bcrypt
- P3: Integraciones produccion (Infobip, SendGrid, Twilio)
- P3: App iOS (requiere Mac/Xcode)

## Broken/Mocked
- SMS (Infobip): API key invalida
- Emails produccion (SendGrid): Sender no verificado
- WhatsApp (Twilio): Solo sandbox

## Testing
- iteration_72: 100% backend + frontend pass (alarm checkout, newsletter, employee portal, navigation)
- iteration_71: 100% community shield pass
