# ManoProtect - Product Requirements Document

## Última Actualización: 14 Febrero 2026

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de protección contra fraudes digitales para usuarios individuales, familias y empresas en España. Incluye análisis de amenazas con IA, botón SOS de emergencia físico, localización familiar, y un portal enterprise para la gestión interna.

---

## Arquitectura Técnica

### Stack
- **Frontend**: React 18, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: MongoDB (Motor async driver)
- **Payments**: Stripe (checkout sessions + webhooks)
- **Email**: SendGrid
- **Auth**: JWT + session cookies

### Estructura de Directorios
```
/app
├── backend/
│   ├── routes/
│   │   ├── sos_device.py          # Pedidos SOS con Stripe
│   │   ├── enterprise_portal_routes.py  # Portal Enterprise
│   │   └── ...
│   ├── models/
│   ├── services/
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/landing/    # Hero, Testimonials, etc.
│       └── pages/
│           ├── EnterprisePortal.js  # Portal completo
│           └── ...
└── memory/
    └── PRD.md
```

---

## Funcionalidades Completadas ✅

### 1. Bug Crítico de Stripe - CORREGIDO (14 Feb 2026)
- Pedidos ahora se crean con status `pending_payment`
- Se genera sesión de Stripe Checkout y se retorna `checkout_url`
- Los dispositivos solo se crean después del webhook de confirmación
- Endpoint webhook: `/api/sos-device/webhook/stripe`

### 2. Portal Enterprise - COMPLETADO (14 Feb 2026)
Módulos funcionales:
- Dashboard con KPIs | Gestión Empleados (CRUD) | Gestión Clientes
- Centro SOS | Alertas Seguridad | Pedidos | Flujo de Caja | Auditoría

### 3. Usuarios del Sistema - ACTUALIZADOS (14 Feb 2026)

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | Admin2026! | super_admin (Enterprise) |
| CEO/Director | ceo@manoprotect.com | Director2026! | director (Portal antiguo) |
| Google Play Tester | rrhh.milchollos@gmail.com | 20142026 | user (family-yearly) |

### 4. Auditoría de Conversión - IMPLEMENTADA (14 Feb 2026)
Cambios realizados según el PDF de auditoría:

| Recomendación | Estado |
|---------------|--------|
| Headline claro | ✅ "Tu familia protegida contra estafas" |
| 3 beneficios principales | ✅ Detección IA, Botón SOS, 24/7 Activo |
| CTAs simplificados | ✅ "Probar 7 Días Gratis" + "Ver Planes" |
| Idioma español forzado | ✅ Sin auto-detección por IP |
| Testimonios detallados | ✅ Con nombre, rol, ubicación, verificado |
| Estadísticas de confianza | ✅ 4.8 rating, 10K+ familias, 50K+ amenazas |
| Sello de pago seguro | ✅ Añadido en hero |

### 5. Integraciones Activas
- **Stripe** - Pagos y webhooks
- **SendGrid** - Emails de invitación
- **MongoDB** - Base de datos

---

## Endpoints Clave

### SOS Device Orders
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/sos-device/order` | POST | Crea pedido con checkout Stripe |
| `/api/sos-device/order/{id}/status` | GET | Estado del pedido |
| `/api/sos-device/webhook/stripe` | POST | Webhook Stripe |

### Enterprise Portal
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/enterprise/auth/login` | POST | Login empleado |
| `/api/enterprise/dashboard/stats` | GET | KPIs |
| `/api/enterprise/employees` | GET/POST | CRUD empleados |
| `/api/enterprise/clients` | GET | Lista clientes |

---

## Testing

### Último Test: Iteración 38 (14 Feb 2026)
- Backend: 13/13 tests passed (100%)
- Frontend: 7/7 tests passed (100%)

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] WebSockets para SOS en tiempo real
- [ ] Gráficas con Recharts en dashboard
- [ ] Optimización de imágenes (PageSpeed)

### P2 - Media Prioridad
- [ ] 2FA para empleados
- [ ] Integración con 112
- [ ] Exportación CSV/PDF

### P3 - Baja Prioridad
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Videos demo de 1 minuto
- [ ] DNA Digital Identity

---

## Notas Importantes

1. **Sesiones de Usuario**: La autenticación usa `user_sessions` en MongoDB
2. **Stripe Webhooks**: Endpoint `/api/sos-device/webhook/stripe`
3. **Idioma**: Forzado a español por defecto (sin auto-detección IP)
