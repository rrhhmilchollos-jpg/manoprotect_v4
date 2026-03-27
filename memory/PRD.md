# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con CRA, Back Office, Pipeline CRM, emails automaticos Brevo, apps para clientes, comerciales e instaladores.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO + Brevo Email
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Dominio**: manoprotectt.com (con dos 't')
- **Android APKs**: TWA (Trusted Web Activity) compilados con Gradle + QEMU x86_64 emulation

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

## Android APKs (Play Store)
| App | Package ID | URL Target |
|-----|-----------|------------|
| MP Comerciales | com.manoprotect.comerciales | manoprotectt.com/app-comerciales |
| MP Instaladores | com.manoprotect.instaladores | manoprotectt.com/app-instaladores |

Archivos generados:
- APKs: /app/backend/uploads/downloads/ManoProtect-Comerciales.apk, ManoProtect-Instaladores.apk
- AABs: /app/backend/uploads/downloads/ManoProtect-Comerciales.aab, ManoProtect-Instaladores.aab
- Para Play Store: usar AABs
- Keystore: /app/manoprotect-twa/app/manoprotect-2025.keystore (pass: 19862210Des, alias: manoprotect)

## Desktop Apps
- CRM Ventas: apunta a manoprotectt.com/gestion con reconexion automatica
- CRA Operador: apunta a manoprotectt.com/cra-operador con reconexion automatica

## Funcionalidades Implementadas
- Back Office + Pipeline CRM Securitas Direct (8 etapas)
- Emails automaticos Brevo (alta empleado, activacion cliente, avance pipeline)
- Apps conectadas a backend real (Cliente, Comerciales, Instaladores)
- CRA Dashboard con Socket.IO real-time
- Desktop apps con reconexion inteligente
- Android APKs (Comerciales + Instaladores) compilados y listos para Play Store

## Endpoints de Descarga
- /api/descargas/{filename} - Soporta .zip, .apk, .aab

## Estado Actual
- **Completado**: APKs compilados para Play Store (Comerciales + Instaladores)
- **Pendiente**: Firebase Push Notifications, CI/CD Play Store, SEM/Ads, RTSP Cameras, iOS App
