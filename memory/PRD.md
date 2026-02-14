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

### 3. Gestión de Usuarios (Portal Enterprise) - COMPLETADO (14 Feb 2026)
Mejoras implementadas según feedback del usuario:
- ✅ **Botón de ver (ojo)** - Cada fila de usuario tiene un icono de ojo para ver detalles
- ✅ **Modal de detalles de usuario** - Muestra información completa incluyendo:
  - Avatar con inicial del nombre
  - Nombre completo, email, plan y estado
  - Estadísticas: Eventos SOS, Alertas, Pagos
  - Historial de transacciones real
- ✅ **Historial de pagos real** - Elimina datos ficticios, muestra solo transacciones reales
- ✅ **Indicadores visuales de estado de transacción**:
  - Verde: Completado/Pagado/Exitoso
  - Amarillo: Pendiente/Pago Pendiente
  - Azul: Procesando
  - Rojo: Fallido
  - Naranja: Reembolsado
  - Gris: Cancelado/Desconocido
- ✅ **Traducción completa a español** - Toda la interfaz del portal
- ✅ **Test coverage**: Backend 100% (9/9), Frontend 100%

### 4. Dashboard con Gráficas Interactivas - COMPLETADO (14 Feb 2026)
Gráficas implementadas usando Recharts:
- ✅ **Tendencia de Ingresos** - Gráfica de área verde mostrando ingresos de los últimos 7 días en euros
- ✅ **Alertas y Eventos SOS** - Gráfica de líneas con dos series (naranja para alertas, roja para SOS)
- ✅ **Usuarios Registrados** - Gráfica de barras mostrando nuevos registros por día
- ✅ **Tooltips interactivos** - Muestra datos detallados al pasar el cursor
- ✅ **Leyendas** - Identificadores claros para cada serie de datos
- ✅ **Endpoint mejorado** - `/api/enterprise/dashboard/charts` incluye `users_trend`

### 4. Usuarios del Sistema - ACTUALIZADOS (14 Feb 2026)

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | Admin2026! | super_admin (Enterprise) |
| CEO/Director | ceo@manoprotect.com | Director2026! | director (Portal antiguo) |
| Google Play Tester | rrhh.milchollos@gmail.com | 20142026 | user (family-yearly) |

### 5. Auditoría de Conversión - IMPLEMENTADA (14 Feb 2026)
Cambios realizados según el PDF de auditoría:

| Recomendación | Estado |
|---------------|--------|
| Headline claro | ✅ "Tu familia protegida contra estafas" |
| 3 beneficios principales | ✅ Detección IA, Botón SOS, 24/7 Activo |
| CTAs simplificados | ✅ "Probar 7 Días Gratis" + "Ver Planes" |
| Idioma español forzado | ✅ Sin auto-detección por IP |
| Testimonios detallados | ✅ Con nombre, rol, ubicación, verificado |
| Estadísticas de confianza | ✅ Datos reales de BD (familias, amenazas) |
| Sello de pago seguro | ✅ Añadido en hero |

### 6. WebSockets SOS en Tiempo Real - COMPLETADO (14 Feb 2026)
- ✅ Indicador de conexión "En vivo/Offline" en header
- ✅ Notificaciones toast automáticas para emergencias SOS
- ✅ Sonido de alerta para eventos críticos
- ✅ Auto-actualización de lista SOS
- ✅ Difusión a todos los empleados enterprise conectados

### 7. Eliminación de Mock Data - COMPLETADO (14 Feb 2026)
- ✅ Estadísticas landing con datos reales (`/api/public/landing-stats`)
- ✅ Gráficas muestran mensaje vacío si no hay datos (sin datos ficticios)
- ✅ Eliminadas funciones `generateDemoData` y similares

### 8. Integraciones Activas
- **Stripe** - Pagos y webhooks
- **SendGrid** - Emails de invitación
- **MongoDB** - Base de datos
- **Socket.IO** - WebSockets tiempo real

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
| `/api/enterprise/clients/{id}` | GET | Detalles cliente + historial de pagos |

---

## Testing

### Último Test: Iteración 39 (14 Feb 2026)
- Backend: 9/9 tests passed (100%)
- Frontend: 100% features verified

### Test Files
- `/app/backend/tests/test_iteration_39_user_management.py`

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [x] WebSockets para SOS en tiempo real ✅ COMPLETADO
- [ ] Optimización de imágenes (PageSpeed)
- [ ] Exportación CSV/PDF de reportes

### P2 - Media Prioridad
- [ ] 2FA para empleados
- [ ] Integración con 112

### P3 - Baja Prioridad
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Videos demo de 1 minuto
- [ ] DNA Digital Identity

---

## Notas Importantes

1. **Sesiones de Usuario**: La autenticación usa `user_sessions` en MongoDB
2. **Stripe Webhooks**: Endpoint `/api/sos-device/webhook/stripe`
3. **Idioma**: Forzado a español por defecto (sin auto-detección IP)
4. **Portal Enterprise**: Acceso en `/enterprise/login` con credenciales de empleado
