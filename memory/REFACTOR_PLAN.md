# ManoProtect - Plan de Refactorización del Backend

## Estado Actual: server.py (3531 líneas)

### Rutas ya modularizadas en /routes/
| Archivo | Líneas | Rutas |
|---------|--------|-------|
| auth_routes.py | 26,123 | /auth/*, login, register, verify |
| family_sos_routes.py | 65,352 | /family/*, SOS, tracking, children |
| geofence_routes.py | 18,250 | /geofences/* |
| payments_routes.py | 37,412 | /stripe/*, checkout |
| push_routes.py | 9,427 | /push/* |
| admin_routes.py | 6,766 | Algunos admin |
| banking_routes.py | 22,740 | /banking/* |
| email_routes.py | 22,842 | /email/* |

### Rutas pendientes de mover desde server.py
| Líneas | Rutas | Módulo destino |
|--------|-------|----------------|
| 188-260 | /health, /community-alerts, /knowledge-base, /plans | core_routes.py |
| 457-650 | /create-checkout-session, /webhook/stripe | → payments_routes.py |
| 655-850 | /admin/create-admin, /enterprise/* | enterprise_routes.py |
| 858-1018 | /family/dashboard, /family/members | → family_sos_routes.py |
| 1022-1178 | /notifications/* | notifications_routes.py |
| 1183-1380 | /investor/download-pdf | → investor_routes.py |
| 1381-2050 | /admin/* | → admin_routes.py |
| 2142-2240 | /push/* (duplicado) | ELIMINAR (ya en push_routes.py) |
| 2243-2370 | /whatsapp/* | → whatsapp_routes.py |
| 2380-2430 | /chat/* | chat_routes.py (NUEVO) |
| 2499-2650 | /metrics/*, /api-keys | metrics_routes.py |
| 2850-3000 | /bank/* | → banking_routes.py |

## Prioridad de Refactorización

### Fase 1: Eliminar duplicados (Alta prioridad)
- [x] Rutas push ya están en push_routes.py
- [ ] Mover /notifications/* a notifications_routes.py
- [ ] Consolidar /admin/* en admin_routes.py

### Fase 2: Crear módulos nuevos (Media prioridad)
- [ ] chat_routes.py - Rutas de chat con IA
- [ ] metrics_routes.py - Métricas y API keys
- [ ] core_routes.py - Health, plans, knowledge

### Fase 3: Limpiar imports y modelos (Baja prioridad)
- [ ] Mover modelos Pydantic a /models/
- [ ] Crear helpers compartidos en /utils/

## Comandos útiles

```bash
# Contar líneas por archivo
wc -l /app/backend/routes/*.py | sort -n

# Buscar duplicados
grep -rn "@router.get\|@router.post" /app/backend/routes/*.py | grep -oP '/[a-z-/]+' | sort | uniq -d

# Verificar imports no usados
python -m pyflakes /app/backend/server.py
```

## Meta
Reducir server.py a < 500 líneas, conteniendo solo:
- Configuración de FastAPI
- Middleware
- Carga de routers
- Startup/shutdown events
