# ManoProtect - PRD (Product Requirements Document)
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial completo con Central Receptora de Alarmas (CRA), aplicaciones para clientes, comerciales e instaladores, CRM de ventas, y panel de administracion.

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
| App | Ruta | Auth Endpoint |
|-----|------|---------------|
| App Cliente | /app-cliente | /api/client-app/login |
| App Comerciales | /app-comerciales | /api/gestion/auth/login |
| App Instaladores | /app-instaladores | /api/gestion/auth/login |
| CRA Dashboard | /cra-operador | N/A (open) |
| Admin Gestion | /gestion | /api/gestion/auth/login |

## Funcionalidades Implementadas

### App Cliente (Securitas Direct style)
- Login con JWT propio
- Dashboard de seguridad: estado armado/desarmado
- Controles: Armar Total, Armar Parcial, Desarmar
- Boton SOS Emergencia → Alerta critica a CRA en tiempo real
- Vista de dispositivos (10 tipos: panel, sensores, camaras, sirena, teclado)
- Historial de eventos de alarma
- Camaras (placeholder RTSP)
- Perfil y contactos de emergencia

### App Comerciales (CRM Ventas)
- Dashboard KPIs: Total leads, cerrados, pendientes, conversion %
- Tarjeta de comisiones acumuladas (250 EUR/venta)
- CRUD de leads/pedidos
- Cambio de estado (pendiente → confirmado → instalado)

### App Instaladores
- Agenda de instalaciones asignadas
- Stats: programadas, en curso, completadas
- Info de equipo asignado
- Checklist de instalacion (14 items)
- Material en vehiculo
- Cambio de estado de instalacion

### CRA Dashboard (Central Receptora de Alarmas)
- Stats en tiempo real: instalaciones, dispositivos, alarmas
- Lista de alarmas con severidad y estados
- Socket.IO para eventos en tiempo real
- Protocolos de actuacion
- Acciones: Video-verificar, Llamar titular, Avisar Policia, Despachar Acuda, Falsa alarma, Resolver

### Backend Real-time
- Socket.IO emite eventos CRA en arm/disarm/SOS
- CRA Dashboard recibe alarmas instantaneamente
- Polling fallback cada 15s
- Demo data seeded on startup

## API Endpoints Principales
- `POST /api/client-app/login` — Login cliente
- `GET /api/client-app/installation/{id}` — Datos instalacion
- `POST /api/cra/installations/{id}/arm` — Armar/desarmar
- `POST /api/client-app/installation/{id}/sos` — SOS emergencia
- `GET /api/gestion/comercial/mis-stats` — Stats comercial
- `POST /api/gestion/pedidos` — Crear lead
- `GET /api/gestion/instalador/mi-agenda` — Agenda instalador
- `GET/PUT /api/gestion/instalaciones/{id}/checklist` — Checklist
- `PUT /api/gestion/instalaciones/{id}/estado` — Cambiar estado
- `GET /api/cra/dashboard` — Stats CRA
- `GET /api/cra/alarms` — Lista alarmas
- Socket.IO en `/api/socket.io`

## DB Schema
- `client_app_users`: Credenciales clientes
- `client_app_access`: Relacion cliente → instalacion
- `cra_installations`: Instalaciones de alarma
- `cra_devices`: Dispositivos por instalacion
- `cra_alarm_events`: Eventos/alarmas
- `gestion_usuarios`: Empleados (admin, comercial, instalador)
- `gestion_pedidos`: Leads/ventas
- `gestion_instalaciones`: Trabajos de instalacion
- `gestion_checklists`: Checklists de instalacion
- `gestion_equipos`: Equipos de instaladores

## Estado del Proyecto
- **Funcionando**: Todas las apps conectadas a backend real con datos de MongoDB
- **Mocked**: Ninguno — toda la data es real
- **Pendiente**: 
  - RTSP Camera Streaming
  - CI/CD Play Store (requiere secrets del usuario)
  - SEM/Ads Config (requiere IDs del usuario)
  - iOS App con Capacitor
