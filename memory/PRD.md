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
- **Payments**: Stripe (checkout sessions + webhooks)
- **Email**: SendGrid
- **Auth**: JWT + session cookies + **2FA (TOTP) con verificación en login**
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
│   │   └── enterprise_portal_routes.py # Login con 2FA integrado
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
│           └── EnterprisePortal.js   # Sección "Seguridad" añadida
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
| Landing Page | https://admin-portal-361.preview.emergentagent.com |
| Portal Enterprise | https://admin-portal-361.preview.emergentagent.com/enterprise/login |
| Portal Director | https://admin-portal-361.preview.emergentagent.com/employee-login |

---

## Funcionalidades Completadas ✅

### 13. Verificación 2FA en Login - COMPLETADO (14 Feb 2026)
Sistema completo de verificación 2FA obligatoria durante el login para empleados con 2FA habilitado:
- ✅ **Flujo en 2 pasos**:
  - Paso 1: Validación de email/password → Si tiene 2FA, devuelve `requires_2fa: true`
  - Paso 2: Verificación del código TOTP de 6 dígitos o código de respaldo
- ✅ **Endpoints**:
  - `POST /api/enterprise/auth/login` - Valida credenciales, detecta si requiere 2FA
  - `POST /api/enterprise/auth/login-2fa` - Completa login verificando código TOTP
- ✅ **Frontend**: `EnterpriseLogin.js` actualizado con formulario de 2FA
- ✅ **Códigos de respaldo**: Se pueden usar una sola vez en lugar del TOTP
- ✅ **Testing**: Iteración 42 - 100% tests pasados (backend y frontend)

### 14. Alertas de Seguridad 2FA por Email - COMPLETADO (14 Feb 2026)
Sistema de notificaciones por email cuando se detecta un login con 2FA desde dispositivo/IP nuevo:
- ✅ **Detección automática**:
  - Nueva IP (comparando con historial de logins)
  - Nuevo dispositivo/navegador (basado en User-Agent)
- ✅ **Email de alerta** con detalles:
  - IP del acceso
  - Dispositivo/navegador
  - Fecha y hora
  - Indicadores de nuevo dispositivo/IP
  - Enlace para reportar acceso sospechoso
- ✅ **Envío en segundo plano**: No bloquea el login
- ✅ **Sin spam**: No envía email si el dispositivo/IP ya es conocido
- ✅ **Testing**: Iteración 43 - 100% tests pasados
- ⚠️ **Nota**: SendGrid requiere verificación del sender para enviar emails reales

### 12. Two-Factor Authentication (2FA) Setup - COMPLETADO (14 Feb 2026)
Sistema completo de configuración de autenticación de dos factores:
- ✅ **Endpoints**:
  - `GET /api/2fa/status` - Estado del 2FA
  - `GET /api/2fa/setup` - Generar QR code para Google Authenticator
  - `POST /api/2fa/enable` - Activar 2FA tras verificar código
  - `POST /api/2fa/disable` - Desactivar 2FA
  - `POST /api/2fa/verify` - Verificar código TOTP
  - `POST /api/2fa/regenerate-backup-codes` - Regenerar códigos de respaldo
- ✅ **Frontend**: Componente `TwoFactorSettings.jsx` con flujo completo
- ✅ **Portal Enterprise**: Nueva sección "Seguridad (2FA)" en el menú
- ✅ **Dependencias**: pyotp, qrcode (Google Authenticator compatible)

### 11. Sistema de Exportación CSV - COMPLETADO (14 Feb 2026)
Exportación de datos en formato CSV desde el Portal Enterprise:
- ✅ **Endpoints**: users, alerts, sos, payments, reviews, dashboard-summary
- ✅ **Botones de exportación** añadidos en: Dashboard, Usuarios, Valoraciones

### 10-1. Funcionalidades anteriores
- Sistema de Valoraciones de Usuarios (solo premium)
- WebSockets SOS en Tiempo Real
- Dashboard con Gráficas Interactivas (Recharts)
- Gestión de Usuarios (Portal Enterprise)
- Portal Enterprise completo

---

## Endpoints API

### Login Enterprise (2FA integrado)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/enterprise/auth/login` | POST | No | Login paso 1 - valida credenciales |
| `/api/enterprise/auth/login-2fa` | POST | No | Login paso 2 - verifica código TOTP |

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

### Último Test: Iteración 42 (14 Feb 2026)
- Backend: 8/8 tests passed (100%) - 2FA Login Flow
- Frontend: 10/10 features verified (100%)
- Todas las funcionalidades 2FA verificadas funcionando

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] Optimización PageSpeed (imágenes, lazy loading)

### P2 - Media Prioridad  
- [ ] Integración con 112 (emergencias)
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)

### P3 - Baja Prioridad
- [ ] Videos demo de 1 minuto (Sora 2)
- [ ] DNA Digital Identity

### Refactorización
- [ ] `EnterprisePortal.js` tiene +2500 líneas - dividir en componentes

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
3. **Valoraciones**: Solo usuarios premium pueden dejar valoraciones
4. **Exportación**: Todos los CSV incluyen headers en español
5. **Sesiones**: JWT + session cookies con expiración
6. **Idioma**: Forzado a español por defecto

---

## Dependencias Backend

```
# Backend (Python)
pyotp==2.9.0       # TOTP para 2FA
qrcode==8.2        # Generación de QR codes
pillow==12.1.0     # Dependencia de qrcode
```
