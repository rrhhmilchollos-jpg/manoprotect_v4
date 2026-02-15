# ManoProtect - Product Requirements Document

## Última Actualización: 14 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de protección contra fraudes digitales para usuarios individuales, familias y empresas en España. Incluye análisis de amenazas con IA, botón SOS de emergencia físico, localización familiar, y un portal enterprise para la gestión interna.

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

### Estructura de Directorios
```
/app
├── backend/
│   ├── routes/
│   │   ├── reviews_routes.py         # Sistema de valoraciones
│   │   ├── export_routes.py          # Exportación CSV
│   │   ├── two_factor_routes.py      # 2FA TOTP setup/config
│   │   ├── sos_device.py             # Pedidos SOS con Stripe
│   │   └── enterprise_portal_routes.py # Login 2FA + Pagos/Reembolsos
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── landing/
│       │   ├── ReviewForm.jsx        # Formulario valoraciones
│       │   └── TwoFactorSettings.jsx # Config 2FA
│       └── pages/
│           ├── Dashboard.js          # Tab "Valorar" añadido
│           ├── EnterpriseLogin.js    # Login con flujo 2FA
│           └── EnterprisePortal.js   # Secciones: Seguridad, Pagos/Reembolsos
└── memory/
    └── PRD.md
```

---

## URLs del Sistema

### Producción (Recomendado)
| Portal | URL | Subdominio a contratar |
|--------|-----|------------------------|
| Landing Page | https://manoprotect.com | - |
| Portal Enterprise | https://admin.manoprotect.com | **admin.manoprotect.com** |

### Preview (Actual)
| Portal | URL |
|--------|-----|
| Landing Page | https://protect-staging.preview.emergentagent.com |
| Portal Enterprise | https://protect-staging.preview.emergentagent.com/enterprise/login |
| Portal Director | https://protect-staging.preview.emergentagent.com/employee-login |

---

## Funcionalidades Completadas ✅

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

---

## Testing

### Último Test: Iteración 44 (14 Feb 2026)
- Backend: 15/15 tests passed (100%)
- Frontend: 10/10 tests passed (100%)
- Funcionalidades verificadas:
  - Protección brute force 2FA (5 intentos, 15 min lockout)
  - Stripe payment lookup y refund endpoints
  - PaymentsSection UI con 3 tabs
  - Footer actualizado a Manoprotect.com

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] Optimización PageSpeed (imágenes, lazy loading)
- [ ] Verificar SendGrid sender domain para emails reales

### P2 - Media Prioridad  
- [ ] Integración con 112 (emergencias)
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Refactorización de `EnterprisePortal.js` (archivo muy grande)

### P3 - Baja Prioridad
- [ ] Videos demo de 1 minuto (Sora 2 - limitación técnica)
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
