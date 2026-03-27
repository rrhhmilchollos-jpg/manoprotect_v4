# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con CRA, Back Office, Pipeline CRM, emails automaticos Brevo, Firebase Push Notifications, apps para clientes, comerciales e instaladores. Sistema completo de trial, anti-abuso y suscripciones Stripe.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO + Brevo Email + Stripe + Firebase Admin SDK
- **Frontend**: React + TailwindCSS + Shadcn/UI + Firebase JS SDK
- **Dominio**: manoprotectt.com (con dos 't')
- **Android APKs**: TWA compilados con Gradle (3 apps: Clientes, Comerciales, Instaladores)
- **Firebase Project**: manoprotect-f889b

## Usuarios y Roles
| Rol | Email | Password |
|-----|-------|----------|
| Superadmin | rrhh.milchollos@gmail.com | 19862210De |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
| Cliente (trial) | Registro libre via /app-cliente | 7 dias trial gratis |

## Apps Android (TWA)
| App | Package | URL | Estado |
|-----|---------|-----|--------|
| ManoProtect (Clientes) | com.manoprotect.clientes | /app-cliente | COMPILADO |
| MP Comerciales | com.manoprotect.comerciales | /gestion/comerciales | COMPILADO |
| MP Instaladores | com.manoprotect.instaladores | /gestion/instaladores | COMPILADO |

SHA256 Fingerprint: DD:45:D9:49:3A:1D:8A:43:B9:3F:F5:FD:A3:09:97:FA:7D:D9:D2:9C:2F:4A:49:AF:D2:A3:60:9E:F3:5F:C5:DF

## Sistema Trial + Suscripciones (AppCliente)
- Registro: Email + password, trial 7 dias automatico
- Trial: Todas las funciones desbloqueadas, aviso 2 dias antes de expirar
- Paywall: Bloqueo total al expirar (solo login visible)
- Suscripcion: Stripe 9.99 EUR/mes
- Referidos: Codigo unico por usuario, +3 dias trial para ambos
- Anti-abuso: Fingerprint + IP scoring, threshold 80

## AppCliente - Funcionalidades de Seguridad (COMPLETADO)
### Sistema de Alarma
- Armado total / parcial / desarmado con verificacion PIN
- Teclado numerico modal para introducir PIN
- Estado visual con escudo animado (colores por modo)

### Zonas de Seguridad
- 6 zonas por defecto: Entrada, Salon, Cocina, Dormitorio, Garaje, Jardin
- Tipos: sensor_door, sensor_pir, smoke_detector, camera
- Indicadores de bateria y estado (OK / Alerta)

### Camaras
- 3 camaras por defecto: Entrada, Jardin, Garaje
- Estado online/offline con indicador visual

### Eventos
- Historial completo de eventos del sistema
- Tipos: arm, disarm, sos, intrusion, fire, tamper, low_battery
- Colores y badges por severidad (critico, alto, medio, bajo)

### SOS con Geolocalizacion
- Boton de emergencia con confirmacion
- Captura automatica de ubicacion GPS
- Notifica a CRA y contactos de emergencia

### Contactos de Emergencia
- CRUD completo: crear, listar, eliminar
- Campos: nombre, telefono, relacion

### Ajustes
- Cambio de PIN de seguridad (4 digitos)
- Zonas modo noche configurables

## Estado Actual
### Completado
- APKs compilados para Play Store (Comerciales + Instaladores + CLIENTES)
- Sistema Trial + Anti-Abuso + Stripe + Referidos
- Firebase Push Notifications (Admin SDK + FCM + Service Worker)
- AppCliente completo con funcionalidades avanzadas de seguridad
- Back Office + Pipeline CRM
- Emails automaticos Brevo
- Socket.IO CRA real-time
- SEO + Performance optimizado

### Pendiente
- P1: CI/CD Play Store (pendiente secrets GitHub)
- P1: SEM/Ads (Meta Pixel, Hotjar, Search Console)
- P1: RTSP Camera Streaming
- P2: iOS App con Capacitor
- P3: Videos marketing (Sora 2)
