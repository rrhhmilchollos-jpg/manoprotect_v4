# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con CRA, Back Office, Pipeline CRM, emails automaticos Brevo, Firebase Push Notifications, apps para clientes, comerciales e instaladores. Sistema completo de trial, anti-abuso y suscripciones Stripe.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO + Brevo Email + Stripe + Firebase Admin SDK
- **Frontend**: React + TailwindCSS + Shadcn/UI + Firebase JS SDK
- **Dominio**: manoprotectt.com (con dos 't')
- **Android APKs**: TWA compilados con Gradle
- **Firebase Project**: manoprotect-f889b

## Usuarios y Roles
| Rol | Email | Password |
|-----|-------|----------|
| Superadmin | rrhh.milchollos@gmail.com | 19862210De |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
| Cliente (trial) | Registro libre via /app-cliente | 7 dias trial gratis |

## Sistema Trial + Suscripciones (AppCliente)
- Registro: Email + password, trial 7 dias automatico
- Trial: Todas las funciones desbloqueadas, aviso 2 dias antes de expirar
- Paywall: Bloqueo total al expirar (solo login visible)
- Suscripcion: Stripe 9.99 EUR/mes
- Referidos: Codigo unico por usuario, +3 dias trial para ambos
- Anti-abuso: Fingerprint + IP scoring, threshold 80

## Firebase Push Notifications
- Service Account: /app/backend/firebase-service-account.json
- Service Worker: /app/frontend/public/firebase-messaging-sw.js
- Firebase Config: /app/frontend/src/lib/firebase.js
- Backend Routes: /app/backend/routes/notification_routes.py
- Endpoints:
  - POST /api/notifications/register-token
  - DELETE /api/notifications/unregister-token
  - POST /api/notifications/send
  - GET /api/notifications/status
- Alarm alert function: send_alarm_alert(user_id, alert_type, message)
- Alert types: intrusion, fire, panic, tamper, low_battery, arm, disarm
- Critical alerts (intrusion, fire, panic): high priority, vibration pattern, require interaction

## Paginas Legales
- Politica de privacidad: /api/privacy-policy
- Eliminacion de datos: /api/data-deletion

## Estado Actual
### Completado
- APKs compilados para Play Store (API 35, versionCode 3)
- Sistema Trial + Anti-Abuso + Stripe + Referidos
- Firebase Push Notifications (Admin SDK + FCM + Service Worker)
- Back Office + Pipeline CRM
- Emails automaticos Brevo
- Socket.IO CRA real-time
- Desktop apps con reconexion
- SEO + Performance optimizado

### Pendiente
- P1: CI/CD Play Store (pendiente secrets GitHub)
- P1: SEM/Ads (Meta Pixel, Hotjar, Search Console)
- P1: RTSP Camera Streaming
- P2: iOS App con Capacitor
- P3: Videos marketing (Sora 2)
