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

## Desktop Apps
- CRM Ventas: apunta a manoprotectt.com/gestion con reconexion automatica
- CRA Operador: apunta a manoprotectt.com/cra-operador con reconexion automatica
- Ambas apps tienen:
  - Multi-URL fallback (www.manoprotectt.com → manoprotectt.com)
  - Reconexion automatica cada 5s con visual de servidores
  - Auto-refresh cada 10s
  - Menu de navegacion entre modulos
  - CRA: notificaciones de escritorio para nuevas alertas

## Funcionalidades Implementadas
- Back Office + Pipeline CRM Securitas Direct (8 etapas)
- Emails automaticos Brevo (alta empleado, activacion cliente, avance pipeline)
- Apps conectadas a backend real (Cliente, Comerciales, Instaladores)
- CRA Dashboard con Socket.IO real-time
- Desktop apps con reconexion inteligente

## Estado
- **Blocker**: Apps desktop offline porque manoprotectt.com no esta desplegado. Solucion: desplegar la aplicacion
- **Pendiente**: Firebase Push Notifications, CI/CD Play Store, SEM/Ads, RTSP Cameras, iOS App
