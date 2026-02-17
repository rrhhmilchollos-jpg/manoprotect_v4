# ManoProtect - Product Requirements Document

## Última Actualización: 17 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de protección contra fraudes digitales para usuarios individuales, familias y empresas en España. Incluye análisis de amenazas con IA, botón SOS de emergencia físico, localización familiar, y un portal enterprise para la gestión interna.

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
| Landing Page | https://protect-staging-1.preview.emergentagent.com |
| Portal Enterprise | https://protect-staging-1.preview.emergentagent.com/enterprise/login |
| Portal Director | https://protect-staging-1.preview.emergentagent.com/employee-login |

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
