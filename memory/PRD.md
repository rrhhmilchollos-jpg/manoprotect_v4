# ManoProtect - Product Requirements Document v2.4.0

## Core Product
Plataforma lider en Espana de proteccion digital y fisica para familias con dispositivos Sentinel (X, J, S) y sistemas de alarma profesionales para viviendas y empresas.

## Tech Stack
Frontend: React + TailwindCSS + Shadcn/UI + Recharts | Backend: FastAPI + MongoDB | Payments: Stripe | Mobile: Capacitor (Android/iOS)

## Paginas de Alarmas Implementadas

### /alarmas-hogar (NUEVA - Estilo Securitas Direct) Mar 1, 2026
Pagina principal tipo funnel de ventas profesional con 12 secciones:
1. Hero con familia + mini calculadora inline (4 tipos propiedad con precios)
2. Barra de confianza (+3.200 hogares, +950 empresas, 4.9/5)
3. Nuestra Alarma: panel control + camaras IA + kit completo (4 tarjetas)
4. Como Funciona: 4 pasos (deteccion -> verificacion video -> alerta -> respuesta <60s) + instalacion gratis
5. Tipos de Vivienda: tabs interactivos (Piso 24,99 | Chalet 39,99 | Local 54,99 | Nave 54,99) con imagenes
6. App ManoProtect con mockup y features
7. Sentinel SOS exclusivo (enlace a /productos)
8. Precios: 3 tarjetas (Essential, Premium, Business)
9. VS Competencia: tabla 10 filas (ManoProtect vs Securitas Direct vs Prosegur)
10. FAQ: 10 preguntas acordeon
11. CTA final con calculador
12. Header sticky con navegacion por anclas

### /alarmas/vivienda - Detalle pisos, chalets, casas
### /alarmas/negocio - Detalle locales, naves, oficinas
### /seguridad-hogar-empresa - Landing alternativa con 3 kits
### /calculador - Wizard 4 pasos (tipo -> m2/accesos -> extras -> resultado)

## Otras Paginas Implementadas
- /about-us (Quienes Somos): equipo 6 miembros, timeline 2023-2026, oficina Valencia
- CEO Dashboard Enterprise: 8 secciones completas
- Sistema IP Blocking + Promotional Logic + SEO Phase 3

## APIs Alarmas
- GET /api/alarm-plans - 3 planes con precios promo/regular
- POST /api/budget-calculator - Recomienda plan segun propiedades
- Alarm plans integrados en SUBSCRIPTION_PACKAGES de Stripe

## Precios Competitivos
| Plan | Promo 6m | Regular | Securitas | Prosegur |
|---|---|---|---|---|
| Essential | 24,99 | 34,99 | 39,89 | 44,90 |
| Premium | 39,99 | 49,99 | 48,90 | 48,90 |
| Business | 54,99 | 69,99 | N/A | 48,90+ |

## URLs Principales
- /alarmas-hogar (pagina principal alarmas estilo Securitas Direct)
- /alarmas/vivienda, /alarmas/negocio (detalle)
- /calculador (presupuesto personalizado)
- /empleados/portal (portal empleados)
- /ceo-dashboard (panel CEO)

## Backlog
- P1: Stripe checkout funcional para kits alarma
- P1: IDs Meta Pixel, Hotjar, Google SC
- P2: Videos marketing (credito Sora 2)
- P3: Integraciones 112, BigQuery, iOS

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
