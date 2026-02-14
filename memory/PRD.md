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
│   │   ├── sos_device.py          # Pedidos SOS con Stripe (CORREGIDO)
│   │   ├── enterprise_portal_routes.py  # Portal Enterprise
│   │   └── ...
│   ├── models/
│   ├── services/
│   └── server.py
├── frontend/
│   └── src/
│       └── pages/
│           ├── EnterprisePortal.js  # Portal completo
│           ├── EnterpriseLogin.js
│           ├── SOSDeviceOrder.js
│           └── ...
└── memory/
    └── PRD.md
```

---

## Funcionalidades Completadas ✅

### 1. Bug Crítico de Stripe - CORREGIDO (14 Feb 2026)
**Problema**: Los pedidos de dispositivos SOS se creaban sin verificar el pago. Los dispositivos se generaban inmediatamente.

**Solución implementada**:
- Pedidos ahora se crean con status `pending_payment`
- Se genera sesión de Stripe Checkout y se retorna `checkout_url`
- Los dispositivos solo se crean después de que el webhook de Stripe confirma el pago
- Endpoint de webhook: `/api/sos-device/webhook/stripe`

### 2. Portal Enterprise - COMPLETADO (14 Feb 2026)
**Módulos funcionales**:
- ✅ Dashboard con KPIs en tiempo real
- ✅ Gestión de Empleados (CRUD completo)
- ✅ Gestión de Clientes (visualización y filtros)
- ✅ Centro de Emergencias SOS (asignación, escalado)
- ✅ Alertas de Seguridad (phishing, fraude)
- ✅ Pedidos de Dispositivos (con estado de pago)
- ✅ Flujo de Caja (resumen financiero)
- ✅ Logs de Auditoría

**Credenciales de acceso**:
- Admin: `admin@manoprotect.com` / `Admin2026!`
- URL: `/enterprise/login`

### 3. Usuario Google Play - CREADO (14 Feb 2026)
- Email: `review@manoprotect.com`
- Password: `20142026`
- Plan: `family-yearly` (acceso completo)

### 4. Integración SendGrid - ACTIVA
- Envío de invitaciones a empleados
- Configurado en `backend/.env`

### 5. Sistema de Trial 7 días - ACTIVO
- Requiere tarjeta de crédito
- Restricción de dispositivo SOS durante trial

---

## Endpoints Clave

### SOS Device Orders
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/sos-device/order` | POST | Crea pedido con checkout Stripe |
| `/api/sos-device/order/{id}/status` | GET | Estado del pedido y pago |
| `/api/sos-device/webhook/stripe` | POST | Webhook de confirmación Stripe |
| `/api/sos-device/orders` | GET | Lista pedidos del usuario |

### Enterprise Portal
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/enterprise/auth/login` | POST | Login empleado |
| `/api/enterprise/dashboard/stats` | GET | KPIs del dashboard |
| `/api/enterprise/employees` | GET/POST | CRUD empleados |
| `/api/enterprise/clients` | GET | Lista clientes |
| `/api/enterprise/sos` | GET | Lista eventos SOS |
| `/api/enterprise/sos/{id}/respond` | POST | Responder SOS |
| `/api/enterprise/device-orders` | GET | Pedidos dispositivos |
| `/api/enterprise/payments` | GET | Transacciones |
| `/api/enterprise/audit-logs` | GET | Logs auditoría |

---

## Roles del Portal Enterprise

| Rol | Nivel | Permisos |
|-----|-------|----------|
| super_admin | 100 | Todo acceso |
| admin | 80 | Gestión completa |
| supervisor | 60 | SOS + alertas + clientes |
| operator | 40 | Solo responder SOS |
| auditor | 30 | Solo lectura + logs |
| emergency_service | 20 | Solo SOS |

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] Implementar recomendaciones del PDF de Auditoría de Conversión
- [ ] WebSockets para SOS en tiempo real
- [ ] Gráficas con Recharts en dashboard

### P2 - Media Prioridad
- [ ] 2FA para empleados
- [ ] Integración con 112
- [ ] Exportación CSV/PDF desde portal

### P3 - Baja Prioridad
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Videos demo de 1 minuto
- [ ] Re-evaluación PageSpeed
- [ ] DNA Digital Identity

---

## Integraciones Activas

| Servicio | Estado | Keys en |
|----------|--------|---------|
| Stripe | ✅ Activo | `backend/.env` |
| SendGrid | ✅ Activo | `backend/.env` |
| MongoDB | ✅ Activo | `backend/.env` |
| Firebase | ✅ Activo | `frontend/.env` |

---

## Testing

### Último Test: Iteración 38 (14 Feb 2026)
- Backend: 13/13 tests passed (100%)
- Frontend: 7/7 tests passed (100%)
- Archivo: `/app/backend/tests/test_iteration_38.py`

### Casos Verificados:
1. ✅ SOS order crea status `pending_payment`
2. ✅ Retorna Stripe checkout URL
3. ✅ Dispositivos NO se crean antes del pago
4. ✅ Enterprise login funciona
5. ✅ Dashboard KPIs retorna datos
6. ✅ Google Play user puede loguearse

---

## Notas de Desarrollo

### Sesiones de Usuario
- La autenticación usa colección `user_sessions` en MongoDB
- El endpoint SOS device fue actualizado para buscar en ambas colecciones (`user_sessions` y `sessions`)

### Stripe Webhooks
- Endpoint: `/api/sos-device/webhook/stripe`
- Eventos manejados:
  - `checkout.session.completed` → Confirma pago, crea dispositivos
  - `checkout.session.expired` → Marca pedido como expirado
  - `payment_intent.payment_failed` → Marca pago como fallido
