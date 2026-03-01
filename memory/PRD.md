# ManoProtect - Product Requirements Document v2.5.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias con dispositivos Sentinel (X, J, S), sistemas de alarma profesionales para viviendas y empresas, y red de seguridad comunitaria Escudo Vecinal.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts + Leaflet | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## NUEVA FUNCIONALIDAD: Escudo Vecinal (Mar 1, 2026)

### Descripcion
Primera red de seguridad comunitaria en tiempo real de Espana. Los vecinos de ManoProtect se alertan entre si sobre incidencias en su barrio. Ninguna empresa de alarmas ofrece esto.

### Backend API Endpoints
- `GET /api/community-shield/stats` - Estadisticas comunitarias (incidencias 7d/30d, por tipo, por severidad)
- `GET /api/community-shield/incidents` - Lista incidencias activas (ultimas 24h)
- `POST /api/community-shield/incidents` - Reportar incidencia (tipo, titulo, descripcion, lat/lng, severidad, anonimo)
- `PATCH /api/community-shield/incidents/{id}/confirm` - Confirmar incidencia (3+ = confirmada)
- `PATCH /api/community-shield/incidents/{id}/resolve` - Resolver incidencia
- `GET /api/community-shield/heatmap` - Mapa de calor de incidencias (30 dias)

### Tipos de Incidencia
| Tipo | Icono | Color |
|---|---|---|
| robo | Robo/Hurto | #EF4444 |
| vandalismo | Vandalismo | #F97316 |
| sospechoso | Persona sospechosa | #EAB308 |
| ruido | Ruido/Molestias | #8B5CF6 |
| emergencia | Emergencia | #DC2626 |
| accidente | Accidente | #0EA5E9 |
| otro | Otro | #6B7280 |

### Frontend Page: /escudo-vecinal
- Hero con stats en tiempo real
- Mapa interactivo Leaflet (centrado Valencia por defecto)
- 3 tabs: Mapa en vivo, Alertas, Como funciona
- Modal de reporte de incidencias
- Feed de alertas vecinales con confirmacion
- También accesible desde /community-shield y /seguridad-barrio

### DB Collection: community_incidents
```
{
  incident_id: str,
  type: str, type_meta: {icon, color, label},
  title: str, description: str,
  location: {type: "Point", coordinates: [lng, lat]},
  latitude: float, longitude: float,
  severity: "baja"|"media"|"alta"|"critica",
  reporter_id: str, reporter_name: str, anonymous: bool,
  status: "active"|"confirmed"|"resolved",
  confirmations: int, confirmed_by: [str],
  created_at: str, expires_at: str
}
```

## Paginas de Alarmas Implementadas

### /alarmas-hogar (Estilo Securitas Direct)
Pagina principal tipo funnel de ventas profesional con 12 secciones.

### /alarmas/vivienda - Detalle pisos, chalets, casas
### /alarmas/negocio - Detalle locales, naves, oficinas
### /calculador - Wizard 4 pasos (tipo -> m2/accesos -> extras -> resultado)

## Navegacion Principal (Actualizada)
Header de landing incluye:
- Home | **Alarmas** (rojo) | **Escudo Vecinal** (azul) | Productos | Precios | Testimonios | Blog | Contacto

## APIs Alarmas
- GET /api/alarm-plans - 3 planes con precios promo/regular
- POST /api/budget-calculator - Recomienda plan segun propiedades

## Precios Competitivos
| Plan | Promo 6m | Regular | Securitas | Prosegur |
|---|---|---|---|---|
| Essential | 24,99 | 34,99 | 39,89 | 44,90 |
| Premium | 39,99 | 49,99 | 48,90 | 48,90 |
| Business | 54,99 | 69,99 | N/A | 48,90+ |

## URLs Principales
- / (landing principal)
- /alarmas-hogar (pagina principal alarmas)
- /alarmas/vivienda, /alarmas/negocio (detalle)
- /calculador (presupuesto personalizado)
- /escudo-vecinal (red seguridad comunitaria) **NUEVO**
- /empleados/portal (portal empleados)
- /ceo-dashboard (panel CEO)

## Backlog
- P1: Stripe checkout funcional para kits alarma
- P1: Sistema enterprise completo (empleados, ventas, gestion)
- P1: IDs Meta Pixel, Hotjar, Google SC
- P2: Videos marketing (credito Sora 2)
- P3: Integraciones 112, BigQuery, iOS

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |

## Testing Status
- Escudo Vecinal: 100% tests passed (iteration 71) - Backend 11/11, Frontend all UI verified
- Alarmas pages: tested (iterations 68-70)
