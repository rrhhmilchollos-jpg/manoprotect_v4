# ManoProtect - Product Requirements Document

## Última Actualización: 17 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de protección contra fraudes digitales para usuarios individuales, familias y empresas en España. Incluye análisis de amenazas con IA, botón SOS de emergencia físico, localización familiar, y un portal enterprise para la gestión interna.

---

## Aclaración de Arquitectura (17 Feb 2026 - Sesión 4)

### Portales y Subdominios

| Portal | URL | Proyecto | Propósito |
|--------|-----|----------|-----------|
| App Principal | manoprotect.com | Este proyecto | Landing, app consumidor, dashboard usuarios |
| Portal Empleados ManoProtect | admin.manoprotect.com | **PROYECTO SEPARADO** | Dashboard interno de empleados de ManoProtect |
| Portal Empleados B2B | manoprotect.com/empleados/* | Este proyecto | Para empleados de empresas CLIENTES |

### Backend API para admin.manoprotect.com
El backend `/api/enterprise/*` está **COMPLETAMENTE LISTO** para conectarse con el frontend en `admin.manoprotect.com`:

**Endpoints verificados y funcionando:**
- ✅ `POST /api/enterprise/auth/login` - Login
- ✅ `GET /api/enterprise/auth/me` - Usuario actual
- ✅ `GET /api/enterprise/dashboard/stats` - Estadísticas (4 empleados, 8 clientes, 1 SOS pendiente)
- ✅ `GET /api/enterprise/employees` - Lista empleados
- ✅ `GET /api/enterprise/clients` - Lista clientes
- ✅ `GET /api/enterprise/invites` - Invitaciones
- ✅ `GET /api/enterprise/sos` - Eventos SOS
- ✅ `GET /api/enterprise/device-orders` - Pedidos dispositivos
- ✅ `GET /api/enterprise/payments` - Pagos
- ✅ `GET /api/enterprise/alerts` - Alertas

**CORS configurado** para `https://admin.manoprotect.com`

**Documentación completa**: `/app/CONEXION_ADMIN_MANOPROTECT.md`

---

## Actualizaciones Recientes (17 Feb 2026 - Sesión 3)

### Sistema de Suscripción y Bloqueo - IMPLEMENTADO ✅
**Nuevo módulo**: `/backend/routes/subscription_manager.py`

**Características implementadas:**
1. **Plan Básico (7 días gratis SIN tarjeta)**:
   - Usuario se registra solo con email
   - 7 días de prueba gratuita
   - Si no pasa a plan de pago: período de gracia de 3 días más
   - Si sigue sin pagar: bloqueo + UNA segunda oportunidad
   - Si no convierte: bloqueo permanente (email, IP, device_id)

2. **Planes de Pago (7 días gratis CON tarjeta obligatoria)**:
   - Tarjeta de débito/crédito OBLIGATORIA
   - **NO SE ACEPTAN TARJETAS PREPAGO** - Rechazo automático en Stripe
   - Verificación 3D Secure obligatoria para TODAS las tarjetas
   - Cobro automático al terminar trial si no cancela
   - Dirección de facturación y teléfono requeridos

3. **Sistema de Bloqueo**:
   - Bloqueo por email, IP y device_id
   - Segunda oportunidad única (24 horas para pagar)
   - Bloqueo permanente si no convierte
   - Eliminación automática de cuenta
   - Registro de tarjetas rechazadas en `rejected_cards`

4. **Cron Jobs Automáticos** (`/backend/services/cron_jobs.py`):
   - `process_expired_trials`: Cada hora verifica trials expirados
   - `send_trial_reminders`: Diario a las 9 AM (pendiente implementar emails)
   - `cleanup_old_sessions`: Diario a las 3 AM

**Endpoints nuevos:**
- `POST /api/subscription-manager/check-blocked` - Verificar bloqueo antes de registro
- `GET /api/subscription-manager/trial-status/{user_id}` - Estado del trial
- `POST /api/subscription-manager/process-expired-trials` - Procesar trials expirados
- `POST /api/subscription-manager/use-second-chance` - Usar segunda oportunidad
- `POST /api/subscription-manager/validate-card` - Validar que no sea prepago
- `GET /api/subscription-manager/stats` - Estadísticas de suscripciones

**Modificaciones:**
- `auth_routes.py`: Verifica bloqueo antes de permitir registro
- `payments.py`: 
  - Rechaza tarjetas prepago en webhook
  - Fuerza 3D Secure para todas las tarjetas
  - Custom message: "Solo aceptamos tarjetas de débito o crédito. Las tarjetas prepago serán rechazadas."
  - Reembolso automático si se detecta prepago después del pago
- `Pricing.js`: UI actualizada con mensajes claros por plan
- `server.py`: Integración de cron jobs en startup/shutdown

### WebSocket para Notificaciones del Portal de Empleados - IMPLEMENTADO ✅
- Funciones `notify_employee()` y `notify_all_admins()` añadidas a `/backend/services/websocket_manager.py`
- Permite notificaciones en tiempo real para el portal de empleados

### SEO Phase 2 - Páginas de Contenido ✅
**Páginas SEO creadas/mejoradas:**
- `/estafas-bancarias` - Guía completa de estafas bancarias con estadísticas y consejos
- `/seguridad-mayores` - Protección digital para mayores, estafas comunes a ancianos
- `/quienes-somos` (SobreNosotros.js) - Añadido footer unificado

### Portal de Empleados - BACKEND COMPLETO ✅
Implementación completa del sistema de gestión de empleados según especificaciones del ZIP proporcionado.

**Nuevos módulos backend:**
1. **Sistema de Ausencias/Vacaciones** (`/routes/employee_absences_routes.py`)
   - `GET /api/enterprise/absences` - Listar solicitudes
   - `GET /api/enterprise/absences/my-balance` - Balance de vacaciones (22 días/año)
   - `GET /api/enterprise/absences/calendar` - Calendario de equipo
   - `POST /api/enterprise/absences` - Crear solicitud (calcula días laborables automáticamente)
   - `PATCH /api/enterprise/absences/:id/approve` - Aprobar (admin)
   - `PATCH /api/enterprise/absences/:id/reject` - Rechazar con motivo (admin)

2. **Sistema de Nóminas** (`/routes/employee_payslips_routes.py`)
   - `GET /api/enterprise/payslips` - Listar nóminas por año
   - `GET /api/enterprise/payslips/:id/download` - Descargar PDF
   - `POST /api/enterprise/payslips` - Subir nómina individual (admin)
   - `POST /api/enterprise/payslips/bulk-upload` - Subida masiva (admin)
   - `DELETE /api/enterprise/payslips/:id` - Eliminar (admin)

3. **Sistema de Documentos** (`/routes/employee_documents_routes.py`)
   - `GET /api/enterprise/documents` - Listar documentos
   - `GET /api/enterprise/documents/:id/download` - Descargar archivo
   - `POST /api/enterprise/documents` - Subir documento (admin)
   - `DELETE /api/enterprise/documents/:id` - Eliminar (admin)

4. **Sistema de Notificaciones** (`/routes/employee_notifications_routes.py`)
   - `GET /api/enterprise/notifications` - Listar con contador no leídas
   - `GET /api/enterprise/notifications/unread-count` - Solo contador
   - `PATCH /api/enterprise/notifications/:id/read` - Marcar como leída
   - `PATCH /api/enterprise/notifications/read-all` - Marcar todas

5. **Sistema de Festivos** (`/routes/employee_holidays_routes.py`)
   - `GET /api/enterprise/holidays` - Listar por año
   - `POST /api/enterprise/holidays` - Crear festivo (admin)
   - `POST /api/enterprise/holidays/init-spain-{year}` - Inicializar festivos España
   - Festivos España 2025 ya inicializados ✅

**Documento para frontend**: `/app/FRONTEND_PORTAL_EMPLEADOS.md`
- Contiene código completo de componentes React para admin.manoprotect.com
- AbsencesPage.jsx, PayslipsPage.jsx, DocumentsPage.jsx, NotificationsBell.jsx

### Footer Unificado con Trust Badges - COMPLETADO ✅
- **Componente principal**: `/components/landing/LandingFooter.jsx`
- **Nuevos Trust Badges**: 
  - `100% Gratis` (verde esmeralda)
  - `Envío 24-48h` (azul)
  - `Garantía 2 años` (ámbar)
- **Widget Trustpilot**: Con estrellas y enlace a reseñas
- **Sello ManoProtect.com**: Badge "Verificado por ManoProtect.com"
- **Páginas actualizadas** (ahora usan LandingFooter):
  - ✅ SOSServices.js
  - ✅ Pricing.js
  - ✅ FAQ.js
  - ✅ BlogPage.js
  - ✅ BlogPostPage.js
  - ✅ LandingPromo.js
  - ✅ VerificarEstafa.js
  - ✅ InstruccionesFamiliares.js
  - ✅ ManoProtectRegistro.js
  - ✅ EnterpriseLanding.jsx
- **Resultado**: UI/UX consistente en todas las páginas públicas

---

## Actualizaciones Recientes (17 Feb 2026 - Sesión 2)

### Sistema de Verificación de Códigos SOS - VERIFICADO ✅
- **Endpoint**: `POST /api/payments/device/verify-code`
- **Fix aplicado**: Manejo correcto de timezone en comparación de fechas (MongoDB naive vs Python aware)
- **Pruebas realizadas**:
  - ✅ Código válido → Devuelve `valid: true` + info del plan
  - ✅ Código expirado → Devuelve error "El código ha expirado"
  - ✅ Código inexistente → Devuelve "Código no válido"

### Badges de Descarga de App - COMPLETADO ✅
- **Play Store**: `https://play.google.com/store/apps/details?id=com.manoprotect.www.twa`
- **App Store**: Placeholder (iOS app coming soon)
- **Ubicación**: Footer (`/components/landing/LandingFooter.jsx`)
- **Diseño**: Badges oficiales con hover effect

### Endpoint init-ceo DESHABILITADO ✅
- **Seguridad**: El endpoint `POST /api/enterprise/auth/init-ceo` ha sido permanentemente deshabilitado
- **Razón**: Usuario CEO ya inicializado, endpoint era one-time setup
- **Archivo**: `/backend/routes/enterprise_portal_routes.py`

### Páginas Legales Actualizadas ✅
- **Cambio**: "STARTBOOKING SL" → "ManoProtect S.L." en todas las páginas legales
- **Archivos actualizados**:
  - `/pages/TermsOfService.js`
  - `/pages/PrivacyPolicy.js`  
  - `/pages/LegalNotice.js`

### Rutas de "Quiénes Somos" Añadidas ✅
- **Rutas disponibles**: `/about-us`, `/quienes-somos`, `/sobre-nosotros`, `/about`
- **Página existente**: `SobreNosotros.js` (con info del fundador Daniel Escrivá)

---

## Optimizaciones CRO Implementadas (17 Feb 2026)

### 1. Sistema de Diseño Premium
- **Paleta de colores**: Deep Navy (confianza), Steel Blue (profesional), Emerald (éxito), Warm Gold (premium)
- **Tipografías**: Inter (body), Plus Jakarta Sans (headings) - estándar tech premium
- **CSS Variables**: Sistema de tokens completo para dark/light mode

### 2. Trust Badges de Nivel Bancario
- SSL 256-bit, PCI DSS, RGPD, 3D Secure
- Componente reutilizable: `/components/landing/TrustBadges.jsx`
- Variantes: default, compact, checkout

### 3. Micro-interacciones Premium
- `.btn-premium`: hover glow + lift effect
- `.card-premium`: shadow progression on hover  
- `.glass`: glass morphism effect
- Animaciones: fadeUp, fadeIn, scaleIn, pulse-glow

### 4. Optimizaciones de Conversión
- Trust indicators en checkout mejorados
- Garantía de 14 días destacada
- CTA principal con glow y sombra branded

---

## Arquitectura Técnica

### Stack
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async driver)
- **Payments**: Stripe (checkout sessions + webhooks + refunds)
- **Email**: SendGrid
- **Auth**: JWT + session cookies + **2FA (TOTP) con verificación en login + protección brute force**
- **Real-time**: Socket.IO/WebSockets
- **Messaging**: Twilio (WhatsApp Sandbox)

### URLs del Sistema
| Portal | URL | Descripción |
|--------|-----|-------------|
| App Principal | https://manoprotect.com | Landing y app consumidor |
| Portal Empleados | https://admin.manoprotect.com | Dashboard interno |
| Portal Inversores | https://manoprotect.com/inversores | Documentación para inversores verificados |

### Estructura de Directorios
```
/app
├── backend/
│   ├── routes/
│   │   ├── reviews_routes.py         # Sistema de valoraciones
│   │   ├── export_routes.py          # Exportación CSV
│   │   ├── two_factor_routes.py      # 2FA TOTP setup/config
│   │   ├── sos_device.py             # Pedidos SOS con Stripe
│   │   ├── sos_routes.py             # SOS + WhatsApp integration
│   │   └── enterprise_portal_routes.py # Login 2FA + Pagos/Reembolsos
│   ├── services/
│   │   └── whatsapp_service.py       # Twilio WhatsApp integration
│   └── server.py
├── frontend/
│   ├── public/
│   │   ├── sitemap.xml               # SEO Sitemap con todas las SILO pages
│   │   └── index.html                # SEO Schema.org optimizado
│   └── src/
│       ├── hooks/
│       │   └── useSubdomain.js       # Detección de subdominios
│       ├── components/
│       │   ├── landing/
│       │   │   └── LandingFooter.jsx # Footer con enlaces SEO SILO
│       │   ├── ReviewForm.jsx        # Formulario valoraciones
│       │   ├── TwoFactorSettings.jsx # Config 2FA
│       │   ├── OptimizedImage.jsx    # Imágenes WebP con fallback
│       │   └── AdminSubdomainRouter.jsx # Router para admin.manoprotect.com
│       └── pages/
│           ├── Dashboard.js          # Tab "Valorar" añadido
│           ├── EnterpriseLogin.js    # Login con flujo 2FA + branding dinámico
│           ├── EnterprisePortal.js   # Secciones: Seguridad, Pagos/Reembolsos
│           ├── ProteccionPhishing.jsx         # SEO SILO - Anti-Phishing
│           ├── ProteccionFraudeOnline.jsx     # SEO SILO - Fraud Prevention
│           ├── SeguridadDigitalFamiliar.jsx   # SEO SILO - Family Security
│           ├── ProteccionIdentidadDigital.jsx # SEO SILO - Identity Protection
│           ├── SeguridadMayores.jsx           # SEO SILO - Elderly Protection
│           ├── EstafasBancarias.jsx           # SEO SILO - Banking Fraud
│           ├── SecurePayments.jsx             # SEO SILO - Secure Payments
│           └── enterprise/
│               └── components/       # Componentes extraídos (StatCard, SOSAlertCard)
└── memory/
    └── PRD.md
```

---

## URLs del Sistema

### Producción (Recomendado)
| Portal | URL | Descripción |
|--------|-----|-------------|
| Landing Page | https://manoprotect.com | App principal para consumidores |
| Portal Empleados | https://admin.manoprotect.com | **NUEVO** - Acceso exclusivo empleados |

### Configuración DNS Requerida
Para activar el subdominio `admin.manoprotect.com`:
1. Acceder al panel de control del registrador de dominio
2. Añadir registro **CNAME** o **A**:
   - **Nombre**: `admin`
   - **Tipo**: CNAME (recomendado) o A
   - **Valor**: Mismo que manoprotect.com
3. Esperar propagación DNS (puede tardar hasta 24-48 horas)

### Preview (Actual)
| Portal | URL |
|--------|-----|
| Landing Page | https://ios-release-preview-1.preview.emergentagent.com |
| Portal Enterprise | https://ios-release-preview-1.preview.emergentagent.com/enterprise/login |
| Portal Director | https://ios-release-preview-1.preview.emergentagent.com/employee-login |

---

## Funcionalidades Completadas ✅

### 23. Arquitectura SEO SILO - COMPLETADO (16 Feb 2026)
Implementación completa de arquitectura SILO para SEO:
- ✅ **6 Páginas SILO principales** optimizadas para keywords:
  1. `/proteccion-phishing` (hero rojo) - Anti-phishing, smishing, vishing
  2. `/proteccion-fraude-online` (hero naranja) - Fraud prevention
  3. `/seguridad-digital-familiar` (hero púrpura) - Family digital security
  4. `/proteccion-identidad-digital` (hero esmeralda) - Identity theft protection
  5. `/seguridad-mayores` (hero rosa) - Elderly protection
  6. `/estafas-bancarias` (hero azul) - Banking fraud protection
- ✅ **Aliases en inglés** para SEO internacional:
  - `/phishing-protection`, `/fraud-prevention`, `/family-security`
  - `/identity-protection`, `/elderly-protection`, `/banking-fraud-protection`
- ✅ **Enlaces internos** entre páginas SILO
- ✅ **Footer actualizado** con categorías "Seguridad" y "Familia"
- ✅ **sitemap.xml** actualizado con todas las URLs SILO
- ✅ **Schema.org BreadcrumbList** ampliado en index.html
- ✅ **Test 100% pasados** (18/18 tests - iteración 45)

### 18. Subdominio admin.manoprotect.com - COMPLETADO (15 Feb 2026)
Configuración del subdominio dedicado para el portal de empleados:
- ✅ **Hook useSubdomain**: Detecta automáticamente si se accede desde admin.manoprotect.com
- ✅ **AdminSubdomainRouter**: Router dedicado que solo muestra páginas enterprise
- ✅ **CORS Backend**: Añadido admin.manoprotect.com a los orígenes permitidos
- ✅ **Experiencia limpia**: Sin banner de ofertas ni componentes del app consumidor
- ✅ **Rutas simplificadas**:
  - `/` → Login de empleados
  - `/login` → Login de empleados
  - `/portal` → Dashboard enterprise
  - `/dashboard` → Dashboard enterprise
- ⚠️ **Pendiente**: Usuario debe configurar DNS CNAME para activar el subdominio

### 22. Portal de Inversores con Verificación Fiscal - COMPLETADO (15 Feb 2026)
Sistema de documentación para inversores con verificación de empresa española:
- ✅ **Página `/inversores`**: Portal completo para inversores
- ✅ **Proceso de verificación**: 3 pasos (registro CIF, verificación 24-48h, acceso)
- ✅ **Endpoint `/api/investor/verify-access`**: Verifica acceso del usuario
- ✅ **8 documentos disponibles** para inversores verificados:
  - Plan de Negocio Completo (~50 páginas)
  - Modelo Financiero (~15 páginas)
  - Pitch Deck (~20 slides)
  - Dossier Comercial B2B (~12 páginas)
  - One Pager Ejecutivo (1 página)
  - Roadmap Técnico (~10 páginas)
  - Business Plan Extendido (~70 páginas)
  - Pitch Deck Extendido (~35 slides)
- ✅ **Historial de descargas** visible para cada inversor
- ✅ **Eliminado botón "Descargar Artículos"** del blog (no funcional)
- ✅ **Categorías organizadas**: Esenciales, Financiera, Técnica, Comercial

### 19. Branding Dinámico Portal Empleados - COMPLETADO (15 Feb 2026)
Sistema de branding diferenciado para admin.manoprotect.com:
- ✅ **Detección automática** de subdominio (useSubdomain hook)
- ✅ **Tema esmeralda** para admin.manoprotect.com (índigo para el resto)
- ✅ **Badge "Portal Empleados"** visible en header
- ✅ **Footer dinámico**: Muestra admin.manoprotect.com cuando corresponde
- ✅ **Botones y sidebar** adaptados al tema del subdominio

### 20. Optimización PageSpeed - COMPLETADO (15 Feb 2026)
Mejoras de rendimiento para cargar más rápido:
- ✅ **Conversión a WebP**: 11 imágenes optimizadas (reducción 88-98%)
  - manoprotect_alert.png: 2.3MB → 264KB
  - chromebook_*.png: ~1.5MB → ~70KB cada una
  - logo512/192.png: 771KB → 16KB
- ✅ **DNS Prefetch**: Para GTM, GA, Stripe
- ✅ **Critical CSS**: Estilos inline para above-the-fold
- ✅ **OptimizedImage component**: Carga WebP con fallback a PNG

### 21. Refactorización EnterprisePortal - COMPLETADO (15 Feb 2026)
Extracción de componentes del archivo masivo (3600+ líneas → 877 líneas, reducción del 75%) para mejor mantenibilidad:

**Componentes extraídos** (15 archivos en `/frontend/src/pages/enterprise/components/`):
- ✅ `StatCard.jsx` - Tarjeta de estadísticas KPI
- ✅ `SOSAlertCard.jsx` - Card de alerta SOS en tiempo real
- ✅ `EmployeesSection.jsx` - Gestión completa de empleados
- ✅ `AlertsSection.jsx` - Monitor de alertas de seguridad
- ✅ `AuditSection.jsx` - Logs de auditoría del sistema
- ✅ `SOSSection.jsx` - Centro de emergencias SOS
- ✅ `ClientsSection.jsx` - Gestión de clientes con búsqueda y filtros
- ✅ `ClientDetailModal.jsx` - Modal de detalles del cliente con historial
- ✅ `ReviewsSection.jsx` - Gestión de valoraciones con aprobación/rechazo
- ✅ `OrdersSection.jsx` - Pedidos de dispositivos SOS con workflow
- ✅ `PaymentsSection.jsx` - Pagos y reembolsos Stripe con 3 tabs
- ✅ `CreateEmployeeModal.jsx` - Formulario crear empleado
- ✅ `EmployeeDetailModal.jsx` - Modal detalles empleado
- ✅ `index.js` - Exports centralizados + helper mergeChartData

**Beneficios obtenidos**:
- ✅ Archivo principal reducido de 3600+ a 877 líneas (75% menos)
- ✅ Componentes reutilizables y fácilmente testeables
- ✅ Mejor tiempo de carga por code splitting de React lazy
- ✅ Mantenibilidad significativamente mejorada

### 15. Portal de Pagos y Reembolsos Stripe - COMPLETADO (14 Feb 2026)
Sistema completo para gestionar pagos y procesar reembolsos desde Stripe:
- ✅ **Endpoints Backend**:
  - `GET /api/enterprise/admin/payments/:id` - Buscar pago por ID de Stripe
  - `POST /api/enterprise/admin/payments/:id/refund` - Procesar reembolso
  - `GET /api/enterprise/admin/payment-logs` - Ver historial de operaciones
- ✅ **Restricción por roles**: Solo admin, super_admin y finance pueden acceder
- ✅ **Rate limiting**: Máximo 10 reembolsos por empleado por hora
- ✅ **Auditoría**: Todas las operaciones se registran en `payment_logs`
- ✅ **Frontend PaymentsSection con 3 tabs**:
  - Resumen: KPIs y últimas transacciones
  - Buscar Pago: Búsqueda por ID de Stripe con detalles completos
  - Registro de Operaciones: Historial de consultas y reembolsos
- ✅ **Modal de confirmación** obligatorio antes de procesar reembolso
- ✅ **Testing**: Iteración 44 - 100% tests pasados

### 16. Protección Brute Force 2FA - COMPLETADO (14 Feb 2026)
Protección contra ataques de fuerza bruta en la verificación 2FA:
- ✅ **Límite de intentos**: 5 intentos fallidos máximo
- ✅ **Bloqueo temporal**: 15 minutos de lockout tras exceder límites
- ✅ **Mensajes informativos**: Muestra intentos restantes y tiempo de espera
- ✅ **Reset automático**: Contador se reinicia tras login exitoso o expiración
- ✅ **Audit log**: Registra eventos de bloqueo

### 17. Actualización de Footer - COMPLETADO (14 Feb 2026)
- ✅ Footer actualizado de "STARTBOOKING SL (CIF: B19427723)" a "Manoprotect.com"
- ✅ Archivos actualizados: EnterpriseLogin, FAQ, BlogPage, PaymentSuccess, DescargarApps, DescargarDesktop, PortalEmpleados, ManoProtectRegistro
- ⚠️ **Nota**: Páginas legales (TermsOfService, LegalNotice, PrivacyPolicy) mantienen referencias legales originales

### 14. Alertas de Seguridad 2FA por Email - COMPLETADO (14 Feb 2026)
Sistema de notificaciones por email cuando se detecta un login con 2FA desde dispositivo/IP nuevo.

### 13. Verificación 2FA en Login - COMPLETADO (14 Feb 2026)
Sistema completo de verificación 2FA obligatoria durante el login.

### 12. Two-Factor Authentication (2FA) Setup - COMPLETADO (14 Feb 2026)
Sistema completo de configuración de autenticación de dos factores.

### 11. Sistema de Exportación CSV - COMPLETADO (14 Feb 2026)
Exportación de datos en formato CSV desde el Portal Enterprise.

### 10-1. Funcionalidades anteriores
- Sistema de Valoraciones de Usuarios (solo premium)
- WebSockets SOS en Tiempo Real
- Dashboard con Gráficas Interactivas (Recharts)
- Gestión de Usuarios (Portal Enterprise)
- Portal Enterprise completo

---

## Endpoints API

### Pagos y Reembolsos (Stripe)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/enterprise/admin/payments/:id` | GET | admin/finance | Buscar pago en Stripe |
| `/api/enterprise/admin/payments/:id/refund` | POST | admin/finance | Procesar reembolso |
| `/api/enterprise/admin/payment-logs` | GET | admin/finance/auditor | Ver logs de operaciones |

### Login Enterprise (2FA integrado)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/enterprise/auth/login` | POST | No | Login paso 1 - valida credenciales |
| `/api/enterprise/auth/login-2fa` | POST | No | Login paso 2 - verifica código TOTP (con brute force protection) |

### 2FA Configuration
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/2fa/status` | GET | Enterprise | Estado 2FA |
| `/api/2fa/setup` | GET | Enterprise | QR + secret para authenticator |
| `/api/2fa/enable` | POST | Enterprise | Activar tras verificar código |
| `/api/2fa/disable` | POST | Enterprise | Desactivar con código |
| `/api/2fa/verify` | POST | Enterprise | Verificar código TOTP |

### SOS + WhatsApp
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/sos/alert` | POST | User | Envía alerta SOS con GPS + WhatsApp |
| `/api/sos/whatsapp/test` | POST | No | Test de integración Twilio |

---

## Testing

### Último Test: Iteración 45 (16 Feb 2026)
- Frontend: 18/18 tests passed (100%)
- Funcionalidades verificadas:
  - Arquitectura SEO SILO completa (6 páginas)
  - Rutas en español e inglés
  - Footer con categorías SEO
  - CTAs navegando a /register
  - sitemap.xml con todas las URLs

---

## Backlog Pendiente

### P0 - Crítico (Bloqueados)
- [x] **Pantalla blanca portal empleados** - SOLUCIONADO (17 Feb 2026) - Implementado respaldo de token en localStorage + soporte de header X-Session-Token
- [ ] **2FA deshabilitado** - Requiere decisión del usuario (TOTP, SMS, o mantener deshabilitado)
- [ ] **Subdominio admin.manoprotect.com** - SSL no configurado en Cloudflare (requiere acción del usuario)
- [ ] **WhatsApp en producción** - Requiere registro WhatsApp Business en Twilio/Meta
- [ ] **SendGrid verificación** - Requiere configuración DNS en IONOS

### P1 - Alta Prioridad
- [ ] SEO Fase 2 - Contenido para artículos pilar y cluster
- [ ] Optimización PageSpeed (imágenes, lazy loading)

### P2 - Media Prioridad  
- [ ] Integración con 112 (emergencias)
- [ ] SEO Fase 3 - Estrategia de backlinks

### P3 - Baja Prioridad
- [ ] Videos demo de 1 minuto (Sora 2 - balance agotado)
- [ ] DNA Digital Identity

---

## Usuarios del Sistema

| Usuario | Email | Password | Rol | 2FA |
|---------|-------|----------|-----|-----|
| CEO/Admin | ceo@manoprotect.com | Admin2026! | super_admin | ✅ Habilitado |
| Director General | admin@manoprotect.com | Admin2026! | admin | ❌ |
| Operador SOS | operador@manoprotect.com | - | operator | ❌ |
| Google Play Tester | rrhh.milchollos@gmail.com | 20142026 | user | N/A |

---

## Notas Importantes

1. **2FA Login**: Compatible con Google Authenticator y Microsoft Authenticator
2. **Códigos de respaldo**: 6 códigos de 8 caracteres, uso único
3. **Brute Force 2FA**: 5 intentos máx, 15 min lockout, mensajes informativos
4. **Pagos/Reembolsos**: Requiere rol admin/finance, rate limit 10/hora
5. **Valoraciones**: Solo usuarios premium pueden dejar valoraciones
6. **Exportación**: Todos los CSV incluyen headers en español
7. **Sesiones**: JWT + session cookies con expiración
8. **Idioma**: Forzado a español por defecto

---

## Dependencias Backend

```
# Backend (Python)
pyotp==2.9.0       # TOTP para 2FA
qrcode==8.2        # Generación de QR codes
pillow==12.1.0     # Dependencia de qrcode
stripe==14.1.0     # Pagos y reembolsos
```

---

## Actualización 18 Febrero 2026 - Rediseño Landing Page

### Cambios Realizados:
- **Landing Page completamente rediseñada** basada en la imagen proporcionada por el usuario
- Diseño enfocado en GPS/Localizadores para familias
- Estructura similar a la imagen de referencia:
  - Hero con imagen de familia
  - Badge "#1 en localizadores GPS para familias en España"
  - Stats: "+2,000 familias protegidas"
  - Logos de medios: EL PAÍS, ABC, LA RAZÓN, cuatro
  - Sección "Localiza y Protege a tus Seres Queridos"
  - Sección "Compra sin riesgos, tranquilidad garantizada"
  - Testimonios de clientes
  - Sección "Quiénes Somos"
  - CTA final con botón COMPRAR GPS AHORA

### Funcionalidad de Búsqueda y Carrito - COMPLETADO ✅ (18 Feb 2026)

**Barra de Búsqueda Funcional:**
- Modal centrado que se abre al hacer clic en el icono de búsqueda
- Busca productos (Dispositivo SOS, Planes) y páginas informativas
- Búsquedas populares predefinidas: GPS, Dispositivo SOS, Precios, Familia
- Resultados categorizados por tipo (Productos / Páginas)
- Navegación directa al hacer clic en un resultado

**Carrito Profesional Slide-out:**
- Panel deslizante desde la derecha
- Gestión de cantidad (+/-) y eliminación de productos
- Persistencia en localStorage (carrito se mantiene entre sesiones)
- Contador dinámico en el icono del header
- Cálculo de subtotal, envío (4.95€) y total
- Botón "Ver Dispositivos" cuando está vacío
- Mensaje de "Pago seguro con encriptación SSL"

**Header Unificado:**
- LandingHeader.jsx actualizado con iconos de búsqueda y carrito
- Consistente en todas las páginas SEO SILO
- Soporte de hash URLs (#search, #cart) para navegación entre páginas

### Botones y Navegación:
- VER GPS PARA FAMILIAS → /dispositivo-sos
- CÓMO FUNCIONA → /como-funciona
- MI CUENTA → /login
- COMPRAR GPS AHORA → /dispositivo-sos
- WhatsApp → wa.me/34601510950

### Archivos Modificados:
- /app/frontend/src/pages/LandingPage.js (búsqueda + carrito integrados)
- /app/frontend/src/components/landing/LandingHeader.jsx (iconos búsqueda/carrito)

---

## Actualización 19 Febrero 2026 - Previsualización Colores + Checkout Stripe

### 1. Previsualización del Dispositivo por Color - COMPLETADO ✅

**Descripción**: Cuando el usuario selecciona un color en la página `/dispositivo-sos`, la imagen del producto cambia para mostrar el dispositivo en ese color.

**Implementación técnica**:
- Generadas 12 imágenes del dispositivo SOS en diferentes colores
- `DEVICE_COLOR_IMAGES` mapping en `SOSServices.js` (líneas 33-46)
- La variable `currentDeviceImage` obtiene la imagen correcta según `currentPreviewColorId`
- Grid de colores con `data-testid="color-option-{colorId}"` para testing

**Colores disponibles**:
- Azul Cielo, Verde Menta, Naranja Energy, Rosa Coral
- Lila Lavanda, Azul Marino, Gris Titanio, Negro Mate
- Champagne, Burdeos, Plata (default), Blanco Perla

### 2. Checkout del Carrito con Stripe - COMPLETADO ✅

**Descripción**: El carrito de la homepage ahora permite finalizar la compra directamente con Stripe.

**Backend** (`/api/payments/cart/checkout`):
- Crea sesión de Stripe con items del carrito
- Guarda orden en colección `cart_orders`
- Retorna URL de checkout de Stripe

**Frontend** (LandingPage.js):
- Función `handleCheckout()` llama al API
- Botón "Pagar con Stripe" aparece cuando `cartTotal > 0`
- Loading state con spinner
- Backup del carrito en localStorage antes de redirect

**Archivos modificados**:
- `/app/frontend/src/pages/SOSServices.js` - Imágenes por color, selector mejorado
- `/app/frontend/src/pages/LandingPage.js` - Checkout con Stripe
- `/app/backend/routes/payments.py` - Endpoint `/cart/checkout`

**Testing**: Iteración 48 - 100% tests pasados

---

## Actualización 19 Febrero 2026 - Añadir al Carrito desde Búsqueda

### Mejora UX: Botón "Añadir al Carrito" en Resultados de Búsqueda - COMPLETADO ✅

**Descripción**: Los usuarios ahora pueden añadir productos directamente al carrito desde los resultados de búsqueda, sin necesidad de navegar a la página del producto.

**Implementación**:
- Botón "**+ Añadir**" aparece al hover sobre un producto en los resultados
- Toast de confirmación: "Plan Premium añadido al carrito"
- Contador del carrito en el header se actualiza instantáneamente
- `data-testid="add-to-cart-{id}"` para testing

**Archivos modificados**:
- `/app/frontend/src/pages/LandingPage.js` - Líneas 280-320: Resultados de búsqueda con botón añadir

**Flujo del usuario**:
1. Clic en icono de búsqueda
2. Escribir nombre del producto (ej: "Premium")
3. Hover sobre el resultado
4. Clic en "+ Añadir"
5. Toast confirma la acción
6. Contador del carrito se actualiza
7. Usuario puede continuar comprando o ir al checkout

---

## Actualización 19 Febrero 2026 - Mejoras SEO Avanzadas

### SEO Técnico Implementado ✅

**1. Schema Markup (JSON-LD) Actualizado:**
- `SoftwareApplication` con precios correctos (0€, 249.99€, 399.99€)
- `Product` para Dispositivo SOS con reviews reales
- `AggregateOffer` con especificaciones de precios anuales
- `ShippingDetails` y `MerchantReturnPolicy` para Rich Snippets

**2. Componentes SEO Reutilizables:**
- `/app/frontend/src/components/SEOHead.jsx` - Helmet dinámico para cada página
- `/app/frontend/src/utils/seoHelpers.js` - Generadores de Schema para:
  - Organization, Product, FAQ, HowTo, Video, Review
  - Breadcrumbs, Article, Event, Speakable
  - IndexNow API para indexación instantánea

**3. IndexNow Integration:**
- Key file: `/app/frontend/public/manoprotect-indexnow-key.txt`
- Función para submit automático a Bing y motores compatibles

**4. Robots.txt Optimizado:**
- Reglas específicas para GoogleBot, BingBot, GPTBot, ClaudeBot, PerplexityBot
- Allow/Disallow inteligente para páginas de producto vs admin
- Crawl-delay y sitemap declarado

**5. Sitemap.xml Actualizado:**
- Todas las URLs con lastmod 2026-02-19
- Image sitemap integration
- Prioridades correctas (homepage 1.0, productos 0.95, legal 0.30)

**6. Meta Tags en Página de Registro:**
- Title, description, keywords optimizados
- Open Graph para compartir en redes sociales
- Schema.org inline para la página

**Archivos creados/modificados:**
- `/app/frontend/src/components/SEOHead.jsx` (nuevo)
- `/app/frontend/src/utils/seoHelpers.js` (nuevo)
- `/app/frontend/public/manoprotect-indexnow-key.txt` (nuevo)
- `/app/frontend/public/sitemap.xml` (actualizado)
- `/app/frontend/public/robots.txt` (actualizado)
- `/app/frontend/public/index.html` (Schema actualizado)
- `/app/frontend/src/pages/ManoProtectRegistro.js` (SEO meta tags)

---

## Actualizaciones - 23 Febrero 2026

### SENTINEL X Landing Page - IMPLEMENTADO ✅

**Nueva página**: `/sentinel-x` - Landing page premium para el smartwatch de seguridad SENTINEL X

**Características implementadas:**
1. **Hero Section**: 
   - Título y subtítulo impactantes
   - Badge "Edición Fundadores - Cantidad Limitada"
   - Galería de imágenes del producto (3 renders)
   - CTA principal a 149€

2. **Sección de Características**:
   - SOS Invisible
   - Modo PIN Falso
   - Grabación Segura en la Nube
   - Trayecto Seguro Automático
   - Autonomía 5 días

3. **Sección de Diseño y Especificaciones**:
   - Pantalla AMOLED 1.78"
   - Caja titanio/negro mate
   - Conectividad 4G LTE
   - GPS multi-banda
   - IP68 + 5ATM

4. **Sistema de Preventa con Stripe**:
   - Pago completo: 149€
   - Reserva parcial: 10€ + 139€ antes del envío
   - Formulario completo con dirección de envío
   - Integración Stripe funcional

5. **Sección de Confianza**:
   - Garantía 12 meses
   - Envío a toda Europa
   - Cancelación flexible
   - FAQ integrado

**Backend**:
- `POST /api/checkout/sentinel-x` - Crea sesión de pago Stripe
- `GET /api/sentinel-x/preorders` - Lista de preorders (admin)
- Colección MongoDB: `sentinel_x_preorders`

**SEO**:
- Schema.org Product añadido
- Sitemap actualizado
- robots.txt actualizado

**Rutas disponibles**:
- `/sentinel-x`
- `/sentinel`
- `/reloj`

---

### SEO Avanzado - IMPLEMENTADO ✅

**Meta tags añadidos**:
- Google Search Console verification
- Bing/Yandex verification
- Dublin Core metadata (13 tags)
- Pinterest Rich Pins
- Google News keywords
- Apple iTunes App / Google Play App
- Subject, abstract, topic, summary, classification
- Business owner and category metadata

**Schema.org mejorado**:
- Todos los Offers ahora tienen `shippingDetails` y `hasMerchantReturnPolicy`
- 7 ofertas actualizadas con campos de devolución
- Total de 11 schemas JSON-LD válidos

---

## Estado de Integraciones

| Integración | Estado | Notas |
|-------------|--------|-------|
| Stripe | ✅ Funcional | Checkout cart y SENTINEL X |
| Infobip SMS | ❌ Bloqueado | API key inválida |
| Twilio WhatsApp | ⚠️ Sandbox | Producción pendiente |
| SendGrid | ⚠️ Pendiente | Verificación dominio |

---

## Próximas Tareas (Backlog)

### P0 - Crítico
- [ ] Obtener API key válida de Infobip para SMS

### P1 - Alta
- [ ] Habilitar 2FA cuando SMS funcione
- [ ] Producción Twilio WhatsApp
- [ ] Verificar SendGrid dominio

### P2 - Media
- [ ] Página "Quiénes Somos" con fotos del equipo
- [ ] SEO Fase 3: Backlinks y autoridad
- [ ] Integración con 112

### P3 - Baja
- [ ] Emails de recordatorio trial
- [ ] Blog automatizado de alertas de estafas
- [ ] Extraer carrito a React Context global

---

### Video Landing Page - IMPLEMENTADO ✅ (23 Feb 2026)

**Video añadido a la sección "Localiza y Protege":**
- URL: `https://customer-assets.emergentagent.com/.../ManoProtect Sentinel X Oferta_720p_caption.mp4`
- Modal de video funcional con controles nativos
- Autoplay al abrir
- Botón de cerrar (X)

### Contador de Reservas SENTINEL X - IMPLEMENTADO ✅

**Frontend:**
- Barra de progreso visual (X de 500 unidades)
- Colores amber/orange para urgencia
- Texto "¡Solo quedan X unidades!"
- Actualización dinámica desde API

**Backend:**
- `GET /api/sentinel-x/count` - Devuelve contador de preorders
- Base inicial: 143 unidades (social proof)
- Se suma con las reservas reales de la BD


---

## Sistema de Suscripciones con Trial - IMPLEMENTADO ✅ (23 Feb 2026)

### Endpoints Implementados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/subscriptions/registrar` | POST | Registrar usuario con trial |
| `/api/subscriptions/cancelar-trial` | POST | Cancelar trial + periodo de gracia |
| `/api/subscriptions/procesar-cobro/{email}` | POST | Cobro automático (interno) |
| `/api/subscriptions/bloquear/{email}` | POST | Bloquear usuario (admin) |
| `/api/subscriptions/cron/revisar-trials` | POST | Revisión diaria de trials |
| `/api/subscriptions/mi-suscripcion` | GET | Estado de suscripción |
| `/api/subscriptions/planes` | GET | Info de planes disponibles |

### Flujo Implementado

1. **Registro con Trial (7 días)**
   - Plan Básico: Sin tarjeta, trial gratuito
   - Planes Premium: Tarjeta con verificación 3D Secure, sin cargo inicial

2. **Durante el Trial**
   - Usuario puede cancelar → Activa periodo de gracia 7 días
   - Usuario puede cambiar de plan

3. **Fin del Trial**
   - Plan Básico: Bloqueo automático
   - Planes Premium: Cobro automático vía Stripe

4. **Fallos de Pago**
   - 3 reintentos automáticos
   - Bloqueo tras 3 fallos

5. **Bloqueos**
   - Por email, IP y tarjeta (hashes)
   - Impide reregistro con datos bloqueados

### Cron Jobs Configurados

- **Cada hora**: Procesar trials expirados
- **9:00 AM UTC**: Enviar recordatorios
- **3:00 AM UTC**: Limpiar sesiones antiguas

### Colecciones MongoDB

- `users`: Añadidos campos: `estado`, `trial_start`, `trial_end`, `grace_end`, `stripe_customer_id`, `stripe_subscription_id`, `card_hash`, `payment_attempts`
- `blocked_users`: Nueva colección para registro de bloqueos

### Archivos Modificados/Creados

- `/app/backend/routes/subscription_routes.py` (NUEVO)
- `/app/backend/services/cron_jobs.py` (ACTUALIZADO)
- `/app/backend/server.py` (ACTUALIZADO)
