# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con CRA, Back Office, Pipeline CRM, emails automaticos Brevo, apps para clientes, comerciales e instaladores.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO + Brevo Email
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Dominio**: manoprotectt.com (con dos 't')

## Usuarios y Roles
| Rol | Email | Password |
|-----|-------|----------|
| Superadmin | rrhh.milchollos@gmail.com | 19862210De |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
| Cliente Demo | cliente@demo.manoprotectt.com | Cliente2025! |

## Apps y Rutas
| App | Ruta |
|-----|------|
| Back Office | /backoffice |
| App Cliente | /app-cliente |
| App Comerciales | /app-comerciales |
| App Instaladores | /app-instaladores |
| CRA Dashboard | /cra-operador |
| Admin Gestion | /gestion |

## Funcionalidades Implementadas

### Emails Automaticos Brevo (NUEVO)
- **Alta empleado**: Email con credenciales temporales al crear comercial/instalador
- **Activacion cliente**: Email con credenciales app al activar desde pipeline
- **Avance pipeline**: Notificacion al cliente en cada etapa (contacto, estudio, propuesta, contrato, instalacion, activacion)
- Templates HTML profesionales con branding ManoProtect

### Back Office — Administracion Central
- Alta usuarios con contrasena temporal + email automatico
- Pipeline CRM 8 etapas + emails automaticos
- Auditoria completa

### Apps Conectadas a Backend Real
- App Cliente, Comerciales, Instaladores — datos reales MongoDB
- CRA Dashboard con Socket.IO real-time

## Pendiente
- P1: Firebase Push Notifications
- P1: CI/CD Play Store
- P1: SEM/Ads Config
- P2: RTSP Camera Streaming
- P2: iOS App Capacitor
- P3: Videos marketing Sora 2
