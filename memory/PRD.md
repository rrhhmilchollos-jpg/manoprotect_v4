# ManoProtect - Product Requirements Document

## Portal Enterprise - Implementación Completa

### Backend Implementado ✅

**Archivo:** `/app/backend/routes/enterprise_portal_routes.py`

#### Endpoints Disponibles:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/enterprise/auth/login` | POST | Login empleado enterprise |
| `/api/enterprise/auth/logout` | POST | Logout |
| `/api/enterprise/auth/me` | GET | Obtener usuario actual |
| `/api/enterprise/dashboard/stats` | GET | KPIs del dashboard |
| `/api/enterprise/dashboard/charts` | GET | Datos para gráficas |
| `/api/enterprise/employees` | GET | Listar empleados con filtros |
| `/api/enterprise/employees/:id` | GET | Detalle empleado |
| `/api/enterprise/employees` | POST | Crear empleado |
| `/api/enterprise/employees/:id` | PUT | Actualizar empleado |
| `/api/enterprise/employees/:id/suspend` | PATCH | Suspender empleado |
| `/api/enterprise/employees/:id/activate` | PATCH | Activar empleado |
| `/api/enterprise/employees/:id/reset-password` | POST | Resetear contraseña |
| `/api/enterprise/employees/:id/force-logout` | POST | Forzar logout |
| `/api/enterprise/employees/:id` | DELETE | Eliminar empleado |
| `/api/enterprise/employees/:id/activity` | GET | Historial actividad |
| `/api/enterprise/employees/:id/security` | GET | Métricas seguridad |
| `/api/enterprise/employees/bulk` | POST | Acciones masivas |
| `/api/enterprise/clients` | GET | Listar clientes |
| `/api/enterprise/clients/:id` | GET | Detalle cliente |
| `/api/enterprise/sos` | GET | Listar eventos SOS |
| `/api/enterprise/sos/pending` | GET | SOS pendientes (tiempo real) |
| `/api/enterprise/sos/:id` | GET | Detalle SOS |
| `/api/enterprise/sos/:id/respond` | POST | Responder a SOS |
| `/api/enterprise/device-orders` | GET | Listar pedidos dispositivos |
| `/api/enterprise/device-orders/:id` | PATCH | Actualizar pedido |
| `/api/enterprise/payments` | GET | Listar pagos |
| `/api/enterprise/payments/summary` | GET | Resumen financiero |
| `/api/enterprise/alerts` | GET | Listar alertas seguridad |
| `/api/enterprise/alerts/:id/review` | PATCH | Revisar alerta |
| `/api/enterprise/audit-logs` | GET | Logs de auditoría |
| `/api/enterprise/export/employees` | GET | Exportar CSV |
| `/api/enterprise/roles` | GET | Roles y permisos |

### Roles del Sistema

| Rol | Nivel | Permisos |
|-----|-------|----------|
| super_admin | 100 | Todo acceso |
| admin | 80 | Gestión completa |
| supervisor | 60 | SOS + alertas + clientes |
| operator | 40 | Solo responder SOS |
| auditor | 30 | Solo lectura + logs |
| emergency_service | 20 | Solo SOS |

### Frontend Implementado ✅

**Archivos:**
- `/app/frontend/src/pages/EnterpriseLogin.js` - Login
- `/app/frontend/src/pages/EnterprisePortal.js` - Dashboard

**Características:**
- Dashboard con KPIs en tiempo real
- Sidebar con navegación por módulos
- Alertas SOS con actualización cada 10s
- Cards de estadísticas
- Gestión de permisos por rol

### Credenciales de Acceso

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Super Admin | admin@manoprotect.com | Admin2026! | super_admin |
| Operador | operador@manoprotect.com | Operador2026! | operator |

### URLs

- Login: `/enterprise/login`
- Dashboard: `/enterprise`

---

## Modelos de Datos

### enterprise_employees
```json
{
  "employee_id": "emp_xxx",
  "company_id": "manoprotect",
  "name": "string",
  "email": "string",
  "phone": "string",
  "department": "string",
  "role": "super_admin|admin|supervisor|operator|auditor|emergency_service",
  "status": "active|suspended|pending|inactive",
  "permissions": [],
  "risk_score": 0,
  "risk_level": "low|medium|high|critical",
  "failed_simulations": 0,
  "phishing_clicks": 0,
  "two_factor_enabled": false,
  "last_login": "ISO date",
  "login_history": []
}
```

### sos_events
```json
{
  "sos_id": "sos_xxx",
  "client_id": "string",
  "client_name": "string",
  "client_phone": "string",
  "location": {"lat": 0, "lng": 0, "address": "string"},
  "message": "string",
  "priority": "low|medium|high|critical",
  "status": "pending|in_progress|resolved|escalated|false_alarm",
  "assigned_operator_id": "string",
  "emergency_service_called": false,
  "emergency_service_type": "112|policia_nacional|guardia_civil",
  "notes": [],
  "response_time_seconds": 0,
  "resolution_time_seconds": 0
}
```

### security_alerts
```json
{
  "alert_id": "alert_xxx",
  "client_id": "string",
  "alert_type": "phishing|sms_fraud|call_fraud|suspicious_login|data_breach",
  "severity": "low|medium|high|critical",
  "title": "string",
  "description": "string",
  "blocked": true,
  "false_positive": false,
  "reviewed_by": "employee_id"
}
```

### audit_logs
```json
{
  "log_id": "log_xxx",
  "employee_id": "string",
  "action": "string",
  "resource_type": "employee|client|sos|payment|alert",
  "resource_id": "string",
  "details": {},
  "ip_address": "string",
  "created_at": "ISO date"
}
```

---

## Pending / Backlog

### P0 - Crítico
- [ ] Completar las vistas de: Empleados, Clientes, SOS, Alertas, Pedidos, Pagos, Auditoría

### P1 - Alto
- [ ] WebSockets para SOS en tiempo real
- [ ] Gráficas con Recharts
- [ ] Exportación CSV/PDF

### P2 - Medio
- [ ] 2FA para empleados
- [ ] Integración con servicios de emergencia 112
- [ ] Dashboard analytics avanzado
