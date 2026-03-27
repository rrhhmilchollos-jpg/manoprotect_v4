# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con CRA, Back Office, Pipeline CRM, emails automaticos Brevo, apps para clientes, comerciales e instaladores. Sistema completo de trial, anti-abuso y suscripciones Stripe.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO + Brevo Email + Stripe
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Dominio**: manoprotectt.com (con dos 't')
- **Android APKs**: TWA (Trusted Web Activity) compilados con Gradle

## Usuarios y Roles
| Rol | Email | Password |
|-----|-------|----------|
| Superadmin | rrhh.milchollos@gmail.com | 19862210De |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
| Cliente (trial) | Registro libre via /app-cliente | 7 dias trial gratis |

## Apps y Rutas
| App | Ruta |
|-----|------|
| Back Office | /backoffice |
| App Cliente | /app-cliente |
| App Comerciales | /app-comerciales |
| App Instaladores | /app-instaladores |
| CRA Dashboard | /cra-operador |
| Admin Gestion | /gestion |

## Sistema Trial + Suscripciones (AppCliente)
- **Registro**: Email + password, trial 7 dias automatico
- **Trial**: Todas las funciones desbloqueadas, aviso 2 dias antes de expirar
- **Paywall**: Bloqueo total al expirar (solo login visible)
- **Suscripcion**: Stripe 9.99 EUR/mes
- **Referidos**: Codigo unico por usuario, +3 dias trial para ambos
- **Anti-abuso**: Fingerprint + IP scoring, threshold 80

### Endpoints Trial
- POST /api/client-trial/register
- POST /api/client-trial/login
- GET /api/client-trial/status
- POST /api/client-trial/checkout (Stripe)
- GET /api/client-trial/checkout/status/{session_id}
- POST /api/client-trial/referral/apply
- POST /api/client-trial/check-abuse

## Android APKs (Play Store)
| App | Package ID | URL Target |
|-----|-----------|------------|
| MP Comerciales | com.manoprotect.comerciales | manoprotectt.com/app-comerciales |
| MP Instaladores | com.manoprotect.instaladores | manoprotectt.com/app-instaladores |

## Paginas Legales
- Politica de privacidad: /api/privacy-policy
- Eliminacion de datos: /api/data-deletion

## Estado Actual
### Completado
- APKs compilados para Play Store (Comerciales + Instaladores) con API 35
- Sistema completo Trial + Anti-Abuso + Stripe + Referidos para AppCliente
- Back Office + Pipeline CRM
- Emails automaticos Brevo
- Socket.IO CRA real-time
- Desktop apps con reconexion
- SEO + Performance optimizado

### Pendiente
- P0: Firebase Push Notifications
- P1: CI/CD Play Store
- P1: SEM/Ads (Meta Pixel, Hotjar, Search Console)
- P1: RTSP Camera Streaming
- P2: iOS App con Capacitor
- P3: Videos marketing (Sora 2)
