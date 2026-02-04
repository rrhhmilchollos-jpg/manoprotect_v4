# ManoProtect - Arquitectura del Código

## Estado Actual

### Backend (`/app/backend/`)

#### server.py (3467 líneas)
Archivo principal con rutas agrupadas por funcionalidad:

| Líneas | Funcionalidad | Recomendación |
|--------|--------------|---------------|
| 188-260 | Health, Community, Knowledge, Plans | ✅ OK - rutas públicas |
| 457-650 | Stripe Payments | 🔄 Mover a `/routes/payments_routes.py` |
| 655-1000 | Family Dashboard, Members, Alerts | 🔄 Mover a `/routes/family_sos_routes.py` |
| 1022-1180 | Notifications | ✅ Ya existe `/routes/push_routes.py` |
| 1381-2000 | Admin Panel | 🔄 Consolidar con `/routes/admin_routes.py` |
| 2142-2380 | Push, WhatsApp, Metrics | ✅ OK - servicios específicos |

#### Rutas ya modularizadas en `/routes/`:
- `auth_routes.py` - Autenticación, registro, login
- `family_sos_routes.py` - SOS, localización, tracking
- `geofence_routes.py` - Zonas seguras (NUEVO)
- `admin_routes.py` - Gestión de usuarios admin
- `push_routes.py` - Notificaciones push
- `payments_routes.py` - Stripe checkout

### Frontend (`/app/frontend/src/`)

#### App.js (375 líneas)
- 58 imports lazy-loaded ✅
- Rutas organizadas por tipo ✅
- Componentes separados (AnalyticsTracker, SOSAlertListener, etc.) ✅

#### Estructura recomendada:
```
src/
├── pages/          # 30+ páginas - OK
├── components/     # Componentes reutilizables - OK
│   └── ui/         # Shadcn components - OK
├── services/       # Firebase, Geolocation, AdMob - OK
├── context/        # AuthContext - OK
└── hooks/          # Custom hooks - CREAR si crece
```

---

## Auditoría _id MongoDB ✅ COMPLETADA

### Archivos corregidos:
- `/app/backend/routes/admin.py` - línea 108
- `/app/backend/routes/admin_routes.py` - líneas 79, 126
- `/app/backend/routes/auth_routes.py` - línea 601
- `/app/backend/server.py` - líneas 1552, 1591, 1594, 1704, 1744, 1746, 1877, 1879

### Patrón correcto:
```python
# ✅ CORRECTO - excluye _id
user = await db.users.find_one({"user_id": user_id}, {"_id": 0})

# ❌ INCORRECTO - puede causar errores de serialización JSON
user = await db.users.find_one({"user_id": user_id})
```

---

## Recomendaciones Futuras

### Fase 1: Consolidación de rutas duplicadas
1. Mover rutas de `server.py` a archivos específicos
2. Eliminar código duplicado entre `admin.py` y `admin_routes.py`
3. Unificar manejo de errores

### Fase 2: Optimización
1. Añadir índices MongoDB para consultas frecuentes
2. Implementar caché para datos estáticos
3. Lazy loading de componentes adicionales

### Fase 3: Testing
1. Crear tests unitarios para cada ruta
2. Tests de integración para flujos críticos
3. Tests E2E con Playwright

---

## Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| users | Usuarios registrados |
| user_sessions | Sesiones activas |
| family_members | Miembros familiares |
| family_children | Niños/ancianos para tracking |
| geofences | Zonas seguras (NUEVO) |
| geofence_events | Eventos entrada/salida |
| geofence_member_states | Estado actual en zonas |
| sos_alerts | Alertas SOS |
| notifications | Notificaciones in-app |
| push_subscriptions | Tokens FCM |
| payment_transactions | Pagos Stripe |
| threat_analysis | Análisis de amenazas |
| admin_logs | Logs de administración |

---

Última actualización: 04/02/2026
