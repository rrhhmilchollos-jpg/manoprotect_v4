# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo estilo Securitas Direct con Central Receptora de Alarmas (CRA), Back Office administrativo, Pipeline CRM, aplicaciones para clientes, comerciales e instaladores.

## Arquitectura
- **Backend**: FastAPI + MongoDB + Socket.IO (real-time)
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
| App | Ruta | Descripcion |
|-----|------|-------------|
| Back Office | /backoffice | Administracion central: usuarios, pipeline CRM, auditoria |
| App Cliente | /app-cliente | Dashboard seguridad con armar/desarmar, SOS, camaras |
| App Comerciales | /app-comerciales | CRM ventas: leads, KPIs, comisiones |
| App Instaladores | /app-instaladores | Agenda instalaciones, checklists, material |
| CRA Dashboard | /cra-operador | Monitoreo alarmas en tiempo real |
| Admin Gestion | /gestion | Panel admin empleados |

## Funcionalidades Implementadas

### Back Office — Administracion Central (NUEVO)
- Alta de comerciales/instaladores con contrasena temporal
- Generacion automatica de credenciales seguras
- Desactivar/bloquear usuarios
- Reset de contrasenas
- Cambio obligatorio en primer login
- Dashboard de stats: total, comerciales, instaladores, activos, pendientes
- Registro completo de auditoria

### Pipeline CRM — Flujo Securitas Direct (NUEVO)
Etapas: Lead → Contacto → Estudio → Propuesta → Contrato → Instalacion → Activacion → Activo
- Captura de leads (nombre, telefono, email, direccion, tipo inmueble, canal)
- Avance por etapas con historial
- Estudio de seguridad del inmueble
- Propuesta personalizada (equipos, cuotas, descuentos)
- Activacion de cliente: genera credenciales app automaticamente
- Funnel visual con estadisticas por etapa

### App Cliente (Securitas Direct style)
- Login JWT, dashboard seguridad, armar/desarmar
- SOS Emergencia → CRA en tiempo real via Socket.IO
- 10+ tipos de dispositivos, camaras, eventos, perfil, contactos emergencia

### App Comerciales
- Dashboard KPIs, comisiones (250 EUR/venta), CRUD leads

### App Instaladores
- Agenda, checklist 14 items, material vehiculo, equipo asignado

### CRA Dashboard
- Socket.IO real-time, alarmas con severidad, protocolos

### Descarga de ZIPs (ARREGLADO)
- Endpoint: /api/descargas/{filename}.zip
- Pack Completo, CRM, CRA, TWA Android

## API Endpoints
### Back Office
- `POST /api/backoffice/usuarios` — Alta usuario
- `GET /api/backoffice/usuarios` — Listar con stats
- `PUT /api/backoffice/usuarios/{id}/desactivar` — Desactivar
- `PUT /api/backoffice/usuarios/{id}/resetear-password` — Reset password
- `POST /api/backoffice/cambiar-password` — Cambiar contrasena

### Pipeline CRM
- `POST /api/backoffice/pipeline` — Crear lead
- `GET /api/backoffice/pipeline` — Listar con funnel
- `PUT /api/backoffice/pipeline/{id}/avanzar` — Avanzar etapa
- `PUT /api/backoffice/pipeline/{id}/estudio` — Guardar estudio
- `PUT /api/backoffice/pipeline/{id}/propuesta` — Guardar propuesta
- `PUT /api/backoffice/pipeline/{id}/activar-cliente` — Activar cliente

### Apps
- `POST /api/client-app/login` — Login cliente
- `GET /api/gestion/comercial/mis-stats` — Stats comercial
- `GET /api/gestion/instalador/mi-agenda` — Agenda instalador
- `GET/PUT /api/gestion/instalaciones/{id}/checklist` — Checklist
- Socket.IO en `/api/socket.io`

## DB Schema
- `gestion_usuarios`: Empleados con password_temporal, login_count, ultimo_login
- `pipeline_leads`: Leads CRM con historial_etapas, estudio, propuesta, contrato
- `client_app_users`: Credenciales clientes generadas desde pipeline
- `backoffice_audit`: Log de auditoria completo
- `backoffice_logins`: Historial de logins
- `cra_installations`, `cra_devices`, `cra_alarm_events`: Sistema CRA
- `gestion_pedidos`, `gestion_instalaciones`: Pedidos e instalaciones
- `gestion_checklists`: Checklists de instalacion

## Estado
- **Funcionando**: Todo conectado a backend real
- **Mocked**: Nada
- **Pendiente**:
  - P1: Firebase Push Notifications
  - P1: CI/CD Play Store
  - P1: SEM/Ads Config
  - P2: RTSP Camera Streaming
  - P2: iOS App Capacitor
  - P3: Videos marketing Sora 2
