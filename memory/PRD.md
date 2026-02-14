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
- **Auth**: JWT + session cookies
- **Real-time**: Socket.IO/WebSockets

### Estructura de Directorios
```
/app
├── backend/
│   ├── routes/
│   │   ├── reviews_routes.py         # Sistema de valoraciones (NUEVO)
│   │   ├── sos_device.py             # Pedidos SOS con Stripe
│   │   ├── enterprise_portal_routes.py  # Portal Enterprise
│   │   └── ...
│   ├── models/
│   ├── services/
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── landing/              # Hero, Testimonials, etc.
│       │   └── ReviewForm.jsx        # Formulario de valoraciones (NUEVO)
│       └── pages/
│           ├── EnterprisePortal.js   # Portal completo
│           └── ...
└── memory/
    └── PRD.md
```

---

## Funcionalidades Completadas ✅

### 9. Sistema de Valoraciones de Usuarios - COMPLETADO (14 Feb 2026)
Sistema completo para que los clientes con **plan de pago** califiquen el servicio:
- ✅ **Solo usuarios premium**: Los usuarios gratuitos ven mensaje de upgrade
- ✅ **Aprobación automática**: Todas las reviews de usuarios de pago se publican inmediatamente
- ✅ **Badge verificado**: Todas las reviews muestran badge de verificado
- ✅ **Endpoints públicos**: 
  - `GET /api/reviews/public` - Obtener valoraciones aprobadas
  - `GET /api/reviews/stats` - Estadísticas (media, distribución)
- ✅ **Endpoints autenticados**:
  - `GET /api/reviews/can-review` - Verificar elegibilidad
  - `POST /api/reviews` - Crear valoración (solo premium)
  - `GET/PUT/DELETE /api/reviews/my-review` - Gestionar mi valoración
- ✅ **Endpoints admin (Portal Enterprise)**:
  - `GET /api/reviews/admin/all` - Ver todas las valoraciones
  - `PATCH /api/reviews/admin/{id}/approve` - Aprobar
  - `PATCH /api/reviews/admin/{id}/reject` - Rechazar
- ✅ **Landing page actualizada**: Muestra valoraciones reales + estadísticas
- ✅ **Portal Enterprise**: Nueva sección "Valoraciones" para gestión
- ✅ **Tests**: Backend 15/15, Frontend 12/12 - 100% passed

### 8. WebSockets SOS en Tiempo Real - COMPLETADO (14 Feb 2026)
- ✅ Indicador de conexión "En vivo/Offline" en header
- ✅ Notificaciones toast automáticas para emergencias SOS
- ✅ Sonido de alerta para eventos críticos
- ✅ Auto-actualización de lista SOS

### 7. Eliminación de Mock Data - COMPLETADO (14 Feb 2026)
- ✅ Estadísticas landing con datos reales (`/api/public/landing-stats`)
- ✅ Gráficas muestran mensaje vacío si no hay datos
- ✅ Eliminadas funciones `generateDemoData` y similares

### 6. Dashboard con Gráficas Interactivas - COMPLETADO (14 Feb 2026)
- ✅ Tendencia de Ingresos (área verde)
- ✅ Alertas y Eventos SOS (líneas dual)
- ✅ Usuarios Registrados (barras)
- ✅ Tooltips interactivos + leyendas

### 5. Gestión de Usuarios (Portal Enterprise) - COMPLETADO (14 Feb 2026)
- ✅ Botón de ver (ojo) - Modal con detalles de usuario
- ✅ Historial de pagos real
- ✅ Indicadores visuales de estado de transacción
- ✅ Traducción completa a español

### 4. Portal Enterprise - COMPLETADO (14 Feb 2026)
Módulos funcionales:
- Dashboard con KPIs | Gestión Empleados (CRUD) | Gestión Clientes
- Centro SOS | Alertas Seguridad | Pedidos | Flujo de Caja | Auditoría
- **Valoraciones** (NUEVO)

### 3-1. Funcionalidades anteriores
- Bug Crítico de Stripe - CORREGIDO
- Auditoría de Conversión - IMPLEMENTADA
- Integraciones Activas (Stripe, SendGrid, Recharts, Socket.IO)

---

## Endpoints Clave

### Sistema de Valoraciones (NUEVO)
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/reviews/public` | GET | No | Obtener valoraciones aprobadas |
| `/api/reviews/stats` | GET | No | Estadísticas de valoraciones |
| `/api/reviews` | POST | Usuario | Crear valoración |
| `/api/reviews/my-review` | GET/PUT/DELETE | Usuario | Gestionar mi valoración |
| `/api/reviews/admin/all` | GET | Enterprise | Ver todas las valoraciones |
| `/api/reviews/admin/{id}/approve` | PATCH | Enterprise | Aprobar valoración |
| `/api/reviews/admin/{id}/reject` | PATCH | Enterprise | Rechazar valoración |

### Estadísticas Públicas
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/public/landing-stats` | GET | Stats landing (incluye average_rating, total_reviews) |

---

## Testing

### Último Test: Iteración 40 (14 Feb 2026)
- Backend: 15/15 tests passed (100%)
- Frontend: 12/12 features verified (100%)

### Test Files
- `/app/backend/tests/test_reviews_system.py`

---

## Backlog Pendiente

### P1 - Alta Prioridad
- [ ] Optimización de imágenes (PageSpeed)
- [ ] Exportación CSV/PDF de reportes

### P2 - Media Prioridad
- [ ] 2FA para empleados
- [ ] Integración con 112

### P3 - Baja Prioridad
- [ ] Arquitectura subdomain (`admin.manoprotect.com`)
- [ ] Videos demo de 1 minuto
- [ ] DNA Digital Identity

### Refactorización Necesaria
- [ ] `EnterprisePortal.js` tiene +2400 líneas - dividir en componentes

---

## Usuarios del Sistema

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| CEO/Admin | ceo@manoprotect.com | Admin2026! | super_admin (Enterprise) |
| CEO/Director | ceo@manoprotect.com | Director2026! | director (Portal antiguo) |
| Google Play Tester | rrhh.milchollos@gmail.com | 20142026 | user (family-yearly) |

---

## URLs de Acceso

| Portal | URL |
|--------|-----|
| Landing Page | https://ratings.preview.emergentagent.com |
| Enterprise Portal | https://ratings.preview.emergentagent.com/enterprise/login |
| Director Portal | https://ratings.preview.emergentagent.com/employee-login |

---

## Notas Importantes

1. **Sesiones de Usuario**: La autenticación usa `user_sessions` en MongoDB
2. **Stripe Webhooks**: Endpoint `/api/sos-device/webhook/stripe`
3. **Idioma**: Forzado a español por defecto
4. **Portal Enterprise**: Acceso en `/enterprise/login`
5. **Valoraciones**: Usuarios premium se aprueban automáticamente, gratuitos requieren revisión
