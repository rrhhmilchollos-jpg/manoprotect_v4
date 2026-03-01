# ManoProtect - Product Requirements Document v2.3.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias con dispositivos Sentinel (X, J, S) y sistemas de alarma profesionales para viviendas y empresas.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## Implemented Features (Feb 28 - Mar 1, 2026)

### Alarmas Premium - 3 Paginas + Landing
- `/seguridad-hogar-empresa` - Landing principal: 3 kits, vs competencia, Sentinel integrado
- `/alarmas/vivienda` - Detalle vivienda: equipamiento, 2 planes (Essential + Premium)
- `/alarmas/negocio` - Detalle negocio: tipos, equipamiento avanzado, Plan Business

### Calculador Interactivo de Presupuesto (NEW)
- Ruta: `/calculador`, `/presupuesto`
- Wizard 4 pasos: tipo espacio -> detalles (m2, accesos, plantas, jardin) -> extras (camaras) -> resultado
- Backend: `POST /api/budget-calculator` - recomienda plan basado en propiedades
- Muestra ahorro vs Securitas Direct, equipo incluido, precio promo/regular
- CTA a contacto y link a kits

### Planes Alarma Stripe (NEW)
- `GET /api/alarm-plans` - 3 planes con precios promo y regular
- Essential: 24.99/34.99 EUR | Premium: 39.99/49.99 EUR | Business: 54.99/69.99 EUR
- Integrados en SUBSCRIPTION_PACKAGES del backend

### Quienes Somos - Rediseño Premium (NEW)
- Rutas: `/about-us`, `/quienes-somos`, `/sobre-nosotros`
- Hero con foto equipo, numeros (3.200+ hogares, 950+ empresas, 4.9/5)
- Mision con historia real del fundador
- 6 miembros del equipo con bios
- Timeline 2023-2026
- Productos (Sentinel, alarmas vivienda, alarmas negocio)
- Oficina Valencia con direccion, telefono, email

### CEO Dashboard Enterprise (8 secciones)
- Dashboard, Inventario, Usuarios, Membresias, Pagos, Seguridad, Mensajes, Reportes

### Precios vs Competencia
| Plan | Promo 6m | Regular | Securitas Direct | Prosegur |
|---|---|---|---|---|
| Essential | 24.99 | 34.99 | 39.89 | 44.90 |
| Premium | 39.99 | 49.99 | 48.90 | 48.90 |
| Business | 54.99 | 69.99 | N/A | 48.90+ |

### Correcciones aplicadas
- FloatingSOSButton ELIMINADO
- "Plazas" cambiado a "unidades" en popup urgencia
- Links calculador en header, hero y footer de alarmas

## Backlog
- P1: Stripe checkout funcional para contratar kits alarma (formulario pago)
- P1: IDs Meta Pixel, Hotjar, Google SC (bloqueado por usuario)
- P2: Videos marketing (bloqueado credito Sora 2 - Profile->Universal Key->Add Balance)
- P3: Integraciones 112, BigQuery
- P3: App iOS Capacitor (requiere Mac+Xcode)

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
