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
- **Auth**: JWT + session cookies + **2FA (TOTP)**
- **Real-time**: Socket.IO/WebSockets

### Estructura de Directorios
```
/app
├── backend/
│   ├── routes/
│   │   ├── reviews_routes.py         # Sistema de valoraciones
│   │   ├── export_routes.py          # Exportación CSV (NUEVO)
│   │   ├── two_factor_routes.py      # 2FA TOTP (NUEVO)
│   │   ├── sos_device.py             # Pedidos SOS con Stripe
│   │   └── enterprise_portal_routes.py
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── landing/
│       │   ├── ReviewForm.jsx        # Formulario valoraciones
│       │   └── TwoFactorSettings.jsx # Config 2FA (NUEVO)
│       └── pages/
│           ├── Dashboard.js          # Tab "Valorar" añadido
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

### 12. Two-Factor Authentication (2FA) - COMPLETADO (14 Feb 2026)
Sistema completo de autenticación de dos factores para empleados del portal enterprise:
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
- ✅ **Endpoints**:
  - `GET /api/export/users/csv` - Exportar usuarios
  - `GET /api/export/alerts/csv` - Exportar alertas
  - `GET /api/export/sos/csv` - Exportar eventos SOS
  - `GET /api/export/payments/csv` - Exportar pagos
  - `GET /api/export/reviews/csv` - Exportar valoraciones
  - `GET /api/export/dashboard-summary/csv` - Resumen del dashboard
- ✅ **Botones de exportación** añadidos en: Dashboard, Usuarios, Valoraciones

### 10. Formulario de Valoraciones en Dashboard - COMPLETADO (14 Feb 2026)
- ✅ Nueva pestaña "Valorar" en el Dashboard de usuario
- ✅ Componente `ReviewForm` integrado
- ✅ Solo usuarios con plan de pago pueden valorar

### 9. Sistema de Valoraciones de Usuarios - COMPLETADO (14 Feb 2026)
Sistema completo para que los clientes con **plan de pago** califiquen el servicio:
- ✅ **Solo usuarios premium**: Usuarios gratuitos ven mensaje de upgrade
- ✅ **Aprobación automática**: Todas las reviews se publican inmediatamente
- ✅ **Badge verificado**: Todas las reviews muestran badge
- ✅ **Portal Enterprise**: Sección completa de gestión de valoraciones

### 8-1. Funcionalidades anteriores
- WebSockets SOS en Tiempo Real
- Eliminación de Mock Data
- Dashboard con Gráficas Interactivas (Recharts)
- Gestión de Usuarios (Portal Enterprise)
- Portal Enterprise completo

---

## Endpoints API

### 2FA (Nuevo)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/2fa/status` | GET | Enterprise | Estado 2FA |
| `/api/2fa/setup` | GET | Enterprise | QR + secret para authenticator |
| `/api/2fa/enable` | POST | Enterprise | Activar tras verificar código |
| `/api/2fa/disable` | POST | Enterprise | Desactivar con código |
| `/api/2fa/verify` | POST | Enterprise | Verificar código TOTP |

### Export CSV (Nuevo)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/export/users/csv` | GET | Enterprise | Export usuarios |
| `/api/export/alerts/csv` | GET | Enterprise | Export alertas |
| `/api/export/sos/csv` | GET | Enterprise | Export SOS |
| `/api/export/payments/csv` | GET | Enterprise | Export pagos |
| `/api/export/reviews/csv` | GET | Enterprise | Export valoraciones |
| `/api/export/dashboard-summary/csv` | GET | Enterprise | Resumen KPIs |

### Valoraciones
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/reviews/public` | GET | No | Reviews aprobadas |
| `/api/reviews/stats` | GET | No | Estadísticas |
| `/api/reviews/can-review` | GET | Usuario | Verificar elegibilidad |
| `/api/reviews` | POST | Usuario Premium | Crear valoración |

---

## Testing

### Último Test: Iteración 41 (14 Feb 2026)
- Backend: 21/21 tests passed (100%)
- Frontend: 11/11 features verified (100%)
- Todas las funcionalidades nuevas verificadas funcionando

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] Optimización PageSpeed (imágenes, lazy loading)

### P2 - Media Prioridad  
- [ ] Integración con 112 (emergencias)
- [ ] Verificación 2FA en login (actualmente solo setup/status)

### P3 - Baja Prioridad
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Videos demo de 1 minuto (Sora 2)
- [ ] DNA Digital Identity

### Refactorización
- [ ] `EnterprisePortal.js` tiene +2500 líneas - dividir en componentes

---

## Usuarios del Sistema

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | Admin2026! | super_admin (Enterprise) |
| CEO/Director | ceo@manoprotect.com | Director2026! | director (Portal antiguo) |
| Google Play Tester | rrhh.milchollos@gmail.com | 20142026 | user (family-yearly) |

---

## Notas Importantes

1. **2FA**: Compatible con Google Authenticator y Microsoft Authenticator
2. **Valoraciones**: Solo usuarios premium pueden dejar valoraciones
3. **Exportación**: Todos los CSV incluyen headers en español
4. **Sesiones**: JWT + session cookies con expiración
5. **Idioma**: Forzado a español por defecto

---

## Dependencias Nuevas

```
# Backend (Python)
pyotp==2.9.0       # TOTP para 2FA
qrcode==8.2        # Generación de QR codes
pillow==12.1.0     # Dependencia de qrcode
```
