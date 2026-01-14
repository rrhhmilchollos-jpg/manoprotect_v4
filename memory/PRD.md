# MANO - Plataforma Integral de Protección contra Fraudes Digitales

## Product Requirements Document (PRD)

### Problema Original
MANO es una aplicación y sistema profesional en tiempo real que protege a personas, familias, empresas y entidades públicas frente a fraudes, estafas, suplantaciones y engaños digitales.

---

## Estado Actual (Enero 14, 2025)

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
- [x] Métricas en tiempo real con SSE

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
- [x] Pestaña WhatsApp - Envío de mensajes y cola
- [x] Pestaña API Keys - Gestión de claves para partners
- [x] Pestaña Tiempo Real - Métricas SSE

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
│   ├── server.py           # API FastAPI (~3100 líneas)
│   ├── core/
│   │   └── config.py       # Configuración central
│   ├── models/
│   │   └── schemas.py      # Modelos Pydantic
│   └── services/
│       ├── fraud_detection.py    # ML Detección de fraudes
│       ├── threat_analyzer.py    # Analizador con LLM
│       └── banking_service.py    # Integración bancaria
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── components/
│   │   │   ├── NotificationCenter.jsx
│   │   │   ├── PushNotificationToggle.jsx
│   │   │   ├── RealTimeMetrics.jsx
│   │   │   ├── APIKeyManager.jsx
│   │   │   ├── WhatsAppManager.jsx
│   │   │   ├── BankingDashboard.jsx    # Dashboard de banca
│   │   │   └── ThreatAnalyzer.jsx      # Analizador IA
│   │   ├── services/
│   │   │   └── pushNotifications.js
│   │   └── pages/
│   │       ├── AdminPanel.js
│   │       ├── EnterpriseDashboard.js
│   │       ├── FamilyAdmin.js
│   │       ├── Profile.js
│   │       ├── Dashboard.js    # Con pestañas: IA, Banca, Historial
│   │       └── ...
│   └── public/
│       ├── manifest.json   # PWA Manifest
│       ├── sw.js           # Service Worker PWA
│       └── offline.html    # Página offline
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

### Banking Integration (NUEVO)
- `GET /api/banking/supported-banks` - Lista de bancos soportados
- `POST /api/banking/connect` - Conectar cuenta bancaria
- `GET /api/banking/accounts` - Cuentas conectadas
- `GET /api/banking/summary` - Resumen de banca
- `GET /api/banking/transactions` - Historial de transacciones
- `POST /api/banking/analyze-transaction` - Analizar transacción con ML
- `POST /api/banking/transactions/{id}/block` - Bloquear transacción
- `POST /api/banking/transactions/{id}/approve` - Aprobar transacción

### ML Fraud Detection (NUEVO)
- `POST /api/ml/analyze-text` - Analizar texto con ML + LLM
- `GET /api/ml/risk-summary` - Resumen de riesgos del usuario
- `GET /api/ml/behavior-profile` - Perfil de comportamiento ML

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

### Notificaciones (ACTUALIZADO)
- `GET /api/notifications` - Obtener notificaciones
- `POST /api/notifications/read-all` - Marcar todas como leídas
- `POST /api/notifications/{id}/read` - Marcar leída individual
- `GET /api/notifications/preferences` - Preferencias
- `PATCH /api/notifications/preferences` - Actualizar preferencias

### Push Notifications (NUEVO - Enero 14, 2025)
- `GET /api/push/vapid-public-key` - Clave pública VAPID
- `POST /api/push/subscribe` - Suscribirse a push
- `DELETE /api/push/unsubscribe` - Desuscribirse

### WhatsApp (NUEVO - Enero 14, 2025)
- `POST /api/whatsapp/send` - Enviar mensaje (encola si API no configurada)
- `GET /api/whatsapp/queue` - Ver cola de mensajes

### Métricas en Tiempo Real (NUEVO - Enero 14, 2025)
- `GET /api/metrics/dashboard` - Dashboard de métricas
- `GET /api/metrics/stream` - SSE stream (actualiza cada 5s)

### API Keys para Partners (NUEVO - Enero 14, 2025)
- `GET /api/api-keys` - Listar API keys del usuario
- `POST /api/api-keys` - Crear nueva API key
- `DELETE /api/api-keys/{id}` - Revocar API key

### Partner API (NUEVO - Enero 14, 2025)
- `GET /api/v1/analyze/status` - Estado del servicio público

---

## Integraciones
- **Stripe:** emergentintegrations.payments.stripe.checkout
- **OpenAI GPT-4o:** Análisis de amenazas
- **Google OAuth:** Emergent Auth
- **MongoDB:** Base de datos

---

## Tests
- Backend: 22/22 tests pasados (Iteración 6)
- Frontend: Todos los componentes verificados
- Último reporte: `/app/test_reports/iteration_6.json`

---

## Próximos Pasos

### P0 - Crítico
- [ ] **Refactorizar Backend** - `server.py` tiene +2700 líneas, dividir en módulos (routes/, models/, services/)

### P1 - Alta Prioridad
- [ ] Configurar WhatsApp Business API con credenciales reales
- [ ] Implementar análisis de amenazas con LLM real (OpenAI GPT-5.2)
- [ ] App móvil nativa (React Native)

### P2 - Media Prioridad
- [ ] Integración con bancos
- [ ] Análisis de patrones con ML
- [ ] Sistema de recompensas

### P3 - Baja Prioridad
- [ ] Gamificación
- [ ] Marketplace de integraciones
- [ ] Multi-idioma

---

## Componentes Frontend Nuevos (Enero 14, 2025)

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| NotificationCenter | `/components/NotificationCenter.jsx` | Dropdown con lista de notificaciones y badge |
| PushNotificationToggle | `/components/PushNotificationToggle.jsx` | Toggle para activar/desactivar push |
| RealTimeMetrics | `/components/RealTimeMetrics.jsx` | Métricas SSE con reconexión automática |
| APIKeyManager | `/components/APIKeyManager.jsx` | CRUD de API keys con diálogo de creación |
| WhatsAppManager | `/components/WhatsAppManager.jsx` | Formulario de envío y cola de mensajes |
| pushNotifications.js | `/services/pushNotifications.js` | Service para gestión de Web Push |

---

## APIs Mocked (Enero 14, 2025)

| API | Estado | Nota |
|-----|--------|------|
| WhatsApp Business | MOCK | Mensajes se encolan pero no se envían sin credenciales |
| Web Push | MOCK | VAPID keys de desarrollo, notificaciones no se envían realmente |
| Análisis de Amenazas | MOCK | `/api/analyze` retorna datos estáticos |
