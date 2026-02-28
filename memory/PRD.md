# ManoProtect - Product Requirements Document v2.2.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias con dispositivos Sentinel (X, J, S) y sistemas de alarma profesionales para viviendas y empresas.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## Implemented Features

### CEO Dashboard Enterprise (8 secciones)
- Dashboard, Inventario, Usuarios, Membresias, Pagos, Seguridad, Mensajes, Reportes

### Sistema de Alarmas - 3 Paginas Premium (Feb 28, 2026)
**Main Landing** (`/seguridad-hogar-empresa`, `/alarmas`, `/kits-alarma`):
- Hero con villa protegida + panel "Por que elegirnos" vs competencia
- Cards "Que quieres proteger?" -> Vivienda / Negocio
- Galeria componentes: centralita, camaras 4K, sirena, mandos premium (3 colores)
- 3 kits: Essential (24.99-34.99), Premium (39.99-49.99), Business (54.99-69.99)
- Tabla comparativa vs Securitas Direct y Prosegur (10 filas)
- Seccion Sentinel SOS integrado
- Tabla comparativa planes internos (14 filas)
- FAQ 8 preguntas, CTAs a /contacto

**Vivienda** (`/alarmas/vivienda`):
- Hero "Tu hogar, blindado" - pisos, chalets, adosados
- 8 componentes (4 imagen + 4 icono), imagen kit completo
- 2 planes (Essential + Premium) con equipo + servicios detallados
- 4 pasos instalacion, integracion Sentinel, FAQ 6 preguntas

**Negocio** (`/alarmas/negocio`):
- Hero "Tu negocio, protegido 24/7" - locales, naves, oficinas
- 4 tipos negocio, equipamiento avanzado (warehouse image)
- Plan Business TODO INCLUIDO detallado
- Sentinel para equipos, FAQ 7 preguntas

### Precios competitivos (vs competencia)
| Plan | Promo 6 meses | Regular | Securitas Direct | Prosegur |
|---|---|---|---|---|
| Essential | 24,99 EUR | 34,99 EUR | 39,89 EUR | 44,90 EUR |
| Premium | 39,99 EUR | 49,99 EUR | 48,90 EUR | 48,90 EUR |
| Business | 54,99 EUR | 69,99 EUR | N/A | 48,90 EUR+ |

### Ventajas sobre competencia
- SIN permanencia (Securitas: 24 meses, Prosegur: 24-36 meses)
- Equipo GRATIS (Securitas: 149 EUR)
- 2 camaras IA incluidas (competencia: 1 basica)
- Sentinel SOS incluido (exclusivo ManoProtect)
- IA en camaras (cero falsas alarmas)

### Otras funciones implementadas
- Boton SOS Flotante: ELIMINADO (per user request)
- "Plazas" cambiado a "unidades" en popup urgencia
- Sistema IP Blocking, Promotional Logic, SEO Phase 3
- Background Mode, Video Marketing, Capacitor configs

## Rutas clave
- `/seguridad-hogar-empresa` - Landing alarmas principal
- `/alarmas/vivienda` - Detalle vivienda
- `/alarmas/negocio` - Detalle negocio
- `/productos` - Relojes Sentinel (independientes de alarma)
- `/servicios-sos` - Paginas SOS originales (funcionando)

## Backlog
- P1: Funcionalidad pago Stripe para kits alarma
- P1: IDs Meta Pixel, Hotjar, Google SC (bloqueado usuario)
- P2: Videos marketing (bloqueado credito Sora 2)
- P2: Mejorar "Quienes Somos"
- P3: Integraciones 112, BigQuery
- P3: App iOS Capacitor (requiere Mac+Xcode)

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
