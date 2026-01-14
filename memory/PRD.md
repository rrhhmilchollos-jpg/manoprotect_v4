# MANO - Plataforma Integral de Protección contra Fraudes Digitales

## Product Requirements Document (PRD)

### Problema Original
MANO es una aplicación y sistema profesional en tiempo real que protege a personas, familias, empresas y entidades públicas frente a fraudes, estafas, suplantaciones y engaños digitales.

---

## Estado Actual (Enero 2025)

### ✅ Completado

#### Sistema de Autenticación
- [x] Login dual: Email/Password + Google OAuth (Emergent Auth)
- [x] Registro de usuarios con validación
- [x] Sesiones con cookies httpOnly seguras
- [x] Roles: user, investor, admin

#### Sistema de Inversores
- [x] Registro con validación de CIF español
- [x] Aprobación manual por administrador
- [x] Documentos protegidos solo para inversores aprobados
- [x] Descarga en Markdown y HTML (imprimible a PDF)

#### Dashboard Empresarial
- [x] Métricas avanzadas de seguridad
- [x] Distribución de riesgos por nivel
- [x] Análisis por departamento
- [x] Tendencia de amenazas (30 días)
- [x] Cálculo de dinero ahorrado
- [x] Exportación de informes
- [x] **NUEVO: Métricas en tiempo real con SSE** (Enero 14, 2025)

#### Panel Familiar
- [x] Gestión de miembros familiares (hasta 5)
- [x] Modo simplificado para mayores
- [x] Configuración de alertas por miembro
- [x] Historial de amenazas por persona
- [x] Alertas familiares en tiempo real

#### Panel de Administración
- [x] Dashboard con estadísticas globales
- [x] Gestión de usuarios y roles
- [x] Aprobación/rechazo de inversores
- [x] Historial de pagos
- [x] Registro de descargas de documentos
- [x] **NUEVO: Pestaña WhatsApp** - Envío de mensajes y cola (Enero 14, 2025)
- [x] **NUEVO: Pestaña API Keys** - Gestión de claves para partners (Enero 14, 2025)
- [x] **NUEVO: Pestaña Tiempo Real** - Métricas SSE (Enero 14, 2025)

#### Notificaciones (ACTUALIZADO Enero 14, 2025)
- [x] Sistema de notificaciones en app
- [x] Preferencias de notificación
- [x] Marcado de leídas
- [x] **NUEVO: Web Push Notifications** - VAPID keys, subscribe/unsubscribe
- [x] **NUEVO: Centro de notificaciones** - Badge con contador, dropdown menu
- [x] **NUEVO: Toggle de Push en Profile** - Gestión de permisos del navegador

#### WhatsApp Integration (NUEVO - Enero 14, 2025)
- [x] Endpoint para envío de mensajes
- [x] Cola de mensajes pendientes
- [x] UI de gestión en Admin Panel
- [x] *Nota: Requiere credenciales de WhatsApp Business API para envío real*

#### API Pública para Partners (NUEVO - Enero 14, 2025)
- [x] Generación de API Keys con permisos
- [x] Límite de 5 keys por usuario
- [x] Rate limiting configurado (1000 req/día)
- [x] Revocación de claves
- [x] UI de gestión en Admin Panel

#### Métricas en Tiempo Real (NUEVO - Enero 14, 2025)
- [x] SSE Stream `/api/metrics/stream` - actualiza cada 5 segundos
- [x] Dashboard metrics `/api/metrics/dashboard`
- [x] Componente RealTimeMetrics con indicador "En Vivo"
- [x] Reconexión automática en caso de error

#### Pagos con Stripe
- [x] 7 planes de suscripción
- [x] Checkout con emergentintegrations
- [x] Verificación de estado de pago
- [x] Webhooks de Stripe

---

## Arquitectura

```
/app/
├── backend/
│   └── server.py           # API FastAPI (~2700 líneas)
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── components/          # NUEVO
│   │   │   ├── NotificationCenter.jsx
│   │   │   ├── PushNotificationToggle.jsx
│   │   │   ├── RealTimeMetrics.jsx
│   │   │   ├── APIKeyManager.jsx
│   │   │   └── WhatsAppManager.jsx
│   │   ├── services/            # NUEVO
│   │   │   └── pushNotifications.js
│   │   └── pages/
│   │       ├── AdminPanel.js      # Panel admin (+ pestañas nuevas)
│   │       ├── EnterpriseDashboard.js  # Dashboard empresas (+ métricas RT)
│   │       ├── FamilyAdmin.js     # Panel familiar
│   │       ├── Profile.js         # (+ push toggle)
│   │       ├── Dashboard.js       # (+ notification center)
│   │       ├── Login.js / Register.js
│   │       ├── InvestorRegister.js
│   │       ├── Downloads.js
│   │       └── ...
│   └── public/
│       └── sw.js              # Service Worker para Push
└── memory/
    └── PRD.md
```

---

## APIs Principales

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/google/session` - OAuth Google
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Logout

### Enterprise
- `GET /api/enterprise/dashboard` - Dashboard empresarial
- `GET /api/enterprise/reports` - Informes por período

### Familiar
- `GET /api/family/dashboard` - Panel familiar
- `POST /api/family/members` - Añadir miembro
- `PATCH /api/family/members/{id}` - Editar miembro
- `DELETE /api/family/members/{id}` - Eliminar
- `GET /api/family/members/{id}/activity` - Actividad

### Inversores
- `POST /api/investors/register` - Solicitar acceso
- `GET /api/investors/status/{cif}` - Estado solicitud
- `GET /api/investor/documents` - Listar documentos
- `GET /api/investor/download/{type}` - Descargar MD
- `GET /api/investor/download-pdf/{type}` - Descargar HTML/PDF

### Admin
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Listar usuarios
- `PATCH /api/admin/users/{id}/role` - Cambiar rol
- `GET /api/admin/investors` - Solicitudes inversores
- `POST /api/admin/investors/{id}/approve` - Aprobar
- `POST /api/admin/investors/{id}/reject` - Rechazar

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `POST /api/notifications/subscribe` - Suscribirse push
- `POST /api/notifications/{id}/read` - Marcar leída
- `GET /api/notifications/preferences` - Preferencias

---

## Integraciones
- **Stripe:** emergentintegrations.payments.stripe.checkout
- **OpenAI GPT-4o:** Análisis de amenazas
- **Google OAuth:** Emergent Auth
- **MongoDB:** Base de datos

---

## Tests
- Backend: 24/27 tests pasados
- Frontend: Verificado visualmente
- Último reporte: `/app/test_reports/iteration_5.json`

---

## Próximos Pasos

### P1 - Alta Prioridad
- [ ] Notificaciones push reales (Web Push API)
- [ ] Integración con WhatsApp Business
- [ ] Dashboard de métricas en tiempo real

### P2 - Media Prioridad
- [ ] App móvil nativa (React Native)
- [ ] Integración con bancos
- [ ] API pública para partners

### P3 - Baja Prioridad
- [ ] Sistema de recompensas
- [ ] Gamificación
- [ ] Marketplace de integraciones
