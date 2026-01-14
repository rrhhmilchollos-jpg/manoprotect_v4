# MANO - Plataforma Integral de Protección contra Fraudes Digitales

## Product Requirements Document (PRD)

### Problema Original
MANO es una aplicación y sistema profesional en tiempo real que protege a personas, familias, empresas y entidades públicas frente a fraudes, estafas, suplantaciones y engaños digitales.

---

## Estado Actual (Diciembre 2025)

### ✅ Completado Recientemente (Diciembre 2025)

#### 📱 App Móvil React Native - COMPLETA
- [x] **14 pantallas implementadas** con navegación completa
- [x] **Autenticación:** Login, Register, ForgotPassword con biometría
- [x] **Dashboard principal** con estado de protección en tiempo real
- [x] **Panel de amenazas** con lista, filtros y detalle
- [x] **Panel familiar** con CRUD de miembros y modo simplificado
- [x] **Panel bancario** con cuentas y transacciones
- [x] **Escáner QR** con detección de phishing
- [x] **Notificaciones push** con Firebase Cloud Messaging
- [x] **Configuración completa** para iOS y Android
- [x] **Guía de publicación** detallada para App Store y Google Play
- [x] **Tests backend** 22/22 PASSED (iteration_11.json)

#### Panel de Admin Mejorado
- [x] **Nueva pestaña "Suscripciones"** - Gestión manual de planes Premium
- [x] **Nueva pestaña "Base de Datos"** - Info de conexión MongoDB
- [x] Dropdown para cambiar plan de usuario (Free → Personal → Family → Business → Enterprise)
- [x] Vista de estado de suscripción (Activo/Inactivo)
- [x] Historial de cambios de plan

#### Panel Familiar - Verificado y Funcionando
- [x] Dashboard con estadísticas (miembros, mayores, amenazas, alertas)
- [x] CRUD completo de miembros familiares
- [x] Modo simplificado para mayores activado
- [x] Alertas familiares en tiempo real
- [x] Miembro de prueba: "Abuela María" (mayor, modo simple)

#### Dashboard Empresarial - Verificado y Funcionando
- [x] Métricas en tiempo real con indicador "En Vivo"
- [x] Distribución de riesgos (Crítico, Alto, Medio, Bajo)
- [x] Departamentos simulados (Dirección, Finanzas, Comercial, IT, RRHH)
- [x] Tendencia de amenazas (30 días)
- [x] Cálculo de dinero ahorrado
- [x] Reportes por período (semana, mes, trimestre, año)

#### Backend Modularizado (Preparación)
- [x] Creada estructura `/app/backend/routes/` con módulos separados
- [x] 11 archivos de rutas modulares creados
- [x] Modelos centralizados en `/app/backend/models/schemas.py`
- [x] Funciones de autenticación en `/app/backend/core/config.py`

### 🧪 Tests: 23/23 PASSED (iteration_10.json)

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
│   ├── server.py           # API FastAPI principal (~3400 líneas) - Legacy
│   ├── core/
│   │   └── config.py       # Configuración central + funciones auth
│   ├── models/
│   │   └── schemas.py      # Modelos Pydantic centralizados
│   ├── routes/             # NUEVO: Rutas modulares (preparadas)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── investors.py
│   │   ├── threats.py
│   │   ├── banking.py
│   │   ├── payments.py
│   │   ├── rewards.py
│   │   ├── notifications.py
│   │   ├── profile.py
│   │   ├── family.py
│   │   └── enterprise.py
│   └── services/
│       ├── fraud_detection.py    # ML Detección de fraudes
│       ├── threat_analyzer.py    # Analizador con LLM
│       ├── banking_service.py    # Integración bancaria (N26, Imagin, Nickel añadidos)
│       ├── rewards_service.py    # Sistema de recompensas
│       └── email_service.py      # Servicio de email
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
│   │       ├── AdminPanel.js    # Con pestañas: Suscripciones, Base de Datos
│   │       ├── EnterpriseDashboard.js
│   │       ├── FamilyAdmin.js
│   │       ├── Profile.js
│   │       ├── Dashboard.js    # Con pestañas: IA, Banca, Historial
│   │       └── ...
│   └── public/
│       ├── manifest.json   # PWA Manifest
│       ├── sw.js           # Service Worker PWA
│       └── offline.html    # Página offline
├── mobile-app/             # ✅ NUEVO - App React Native
│   ├── App.tsx             # Punto de entrada
│   ├── package.json        # Dependencias React Native
│   ├── app.json            # Configuración iOS/Android
│   ├── PUBLISHING_GUIDE.md # Guía de publicación
│   ├── README.md           # Documentación
│   ├── ios-config/         # Templates iOS
│   ├── android-config/     # Templates Android
│   └── src/
│       ├── components/     # Button, Card, LoadingScreen, etc.
│       ├── config/         # Configuración app y Firebase
│       ├── context/        # AuthContext, NotificationContext
│       ├── hooks/          # useDebounce, useNetworkStatus, useAppState
│       ├── navigation/     # RootNavigator, MainTabNavigator
│       ├── screens/        # 14 pantallas completas
│       │   ├── auth/       # Login, Register, ForgotPassword
│       │   └── ...
│       ├── services/       # API, biometrics, notifications, etc.
│       └── types/          # TypeScript definitions
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

### Métricas en Tiempo Real
- `GET /api/metrics/dashboard` - Dashboard de métricas
- `GET /api/metrics/stream` - SSE stream (actualiza cada 5s)

### API Keys para Partners
- `GET /api/api-keys` - Listar API keys del usuario
- `POST /api/api-keys` - Crear nueva API key
- `DELETE /api/api-keys/{id}` - Revocar API key

### Partner API
- `GET /api/v1/analyze/status` - Estado del servicio público

---

## Integraciones
- **Stripe:** emergentintegrations.payments.stripe.checkout
- **OpenAI GPT-5.2:** Análisis de amenazas con IA (via Emergent LLM Key)
- **Google OAuth:** Emergent Auth
- **MongoDB:** Base de datos
- **Firebase Cloud Messaging:** Push notifications para app móvil
  - Project ID: `manoprotect-f889b`
  - Android Package: `com.Manoprotect.Mano`
  - iOS Bundle: `com.Manoprotect.Mano`

---

## Tests
- Backend: 22/22 tests pasados (Iteración 11 - Mobile App Endpoints)
- Frontend: Todos los componentes verificados
- Último reporte: `/app/test_reports/iteration_11.json`

---

## Estado de Desarrollo (Enero 14, 2025)

### ✅ COMPLETADO
- [x] Sistema ML de detección de fraudes con scoring y patrones
- [x] Integración bancaria simulada (Open Banking demo)
- [x] Analizador de amenazas con IA híbrido (ML + LLM)
- [x] PWA completa con offline support e instalable en móviles
- [x] Backend modularizado con servicios separados
- [x] Dashboard con pestañas: Analizador IA, Banca Segura, Historial
- [x] **APP MÓVIL REACT NATIVE COMPLETA** - Diciembre 2025

### 📱 App Móvil React Native (NUEVO - Diciembre 2025)

Ubicación: `/app/mobile-app/`

#### Pantallas Implementadas:
- [x] **Auth:** Login, Register, ForgotPassword
- [x] **Home:** Dashboard principal con protección activa
- [x] **Threats:** Lista de amenazas con filtros y búsqueda
- [x] **ThreatDetail:** Detalle de amenaza con compartir y reportar
- [x] **Family:** Panel familiar con CRUD de miembros
- [x] **FamilyMember:** Detalle de miembro con estadísticas
- [x] **AddFamilyMember:** Formulario para añadir miembros
- [x] **Banking:** Cuentas bancarias y transacciones
- [x] **Profile:** Perfil con plan y configuración
- [x] **Settings:** Ajustes de la app
- [x] **QRScanner:** Escáner de QR con análisis de amenazas
- [x] **Notifications:** Centro de notificaciones
- [x] **ContactsPicker:** Selector de contactos del dispositivo

#### Servicios:
- [x] **api.ts:** Cliente HTTP con interceptores para auth
- [x] **biometrics.ts:** Face ID / Touch ID / Huella
- [x] **notifications.ts:** Firebase Cloud Messaging
- [x] **contacts.ts:** Acceso a contactos del dispositivo
- [x] **qrScanner.ts:** Análisis de QR con detección de phishing

#### Componentes Reutilizables:
- [x] Button, Card, LoadingScreen, NetworkAlert, ProtectionBadge

#### Hooks Personalizados:
- [x] useDebounce, useNetworkStatus, useAppState

#### Configuración para Producción:
- [x] Config de Firebase para push notifications
- [x] Templates de Info.plist (iOS) y build.gradle (Android)
- [x] Proguard rules para release Android
- [x] Guía de publicación completa (PUBLISHING_GUIDE.md)

### 🟡 SIMULADO/MOCK
- WhatsApp Business API - Mensajes se encolan pero no se envían
- Banking API - Conexión simulada, no Open Banking real
- LLM Analysis - Usa ML cuando no hay EMERGENT_LLM_KEY

### 🔴 Próximos Pasos

#### P1 - Alta Prioridad
- [x] **App móvil nativa (React Native)** - ✅ COMPLETADA
- [ ] Configurar WhatsApp Business API con credenciales reales
- [ ] Conectar Open Banking real con bancos españoles
- [ ] Configurar Firebase para la app móvil (push notifications)

#### P2 - Media Prioridad
- [ ] Sistema de recompensas por reportar amenazas
- [ ] Alertas por email automatizadas
- [ ] Gamificación

#### P3 - Baja Prioridad
- [ ] Multi-idioma (inglés, catalán, euskera, gallego)
- [ ] Marketplace de integraciones
- [ ] Dashboard para municipios

---

## Componentes Frontend Nuevos

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| NotificationCenter | `/components/NotificationCenter.jsx` | Dropdown con lista de notificaciones y badge |
| PushNotificationToggle | `/components/PushNotificationToggle.jsx` | Toggle para activar/desactivar push |
| RealTimeMetrics | `/components/RealTimeMetrics.jsx` | Métricas SSE con reconexión automática |
| APIKeyManager | `/components/APIKeyManager.jsx` | CRUD de API keys con diálogo de creación |
| WhatsAppManager | `/components/WhatsAppManager.jsx` | Formulario de envío y cola de mensajes |
| BankingDashboard | `/components/BankingDashboard.jsx` | Dashboard de cuentas y transacciones |
| ThreatAnalyzer | `/components/ThreatAnalyzer.jsx` | Analizador de amenazas con IA |

---

## APIs Mocked (Enero 14, 2025)

| API | Estado | Nota |
|-----|--------|------|
| WhatsApp Business | MOCK | Mensajes se encolan pero no se envían sin credenciales |
| Web Push | MOCK | VAPID keys de desarrollo, notificaciones no se envían realmente |
| Análisis de Amenazas | MOCK | `/api/analyze` retorna datos estáticos |
