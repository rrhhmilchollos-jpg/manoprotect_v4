# ManoProtect - PRD v10.4.0 (Producción)

## Sistema
Plataforma de seguridad profesional. Apps: Comerciales, Instaladores, Clientes (familias), Admin.
Tech: React + FastAPI + MongoDB + Brevo + Stripe + bcrypt

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO/Admin | ceo@manoprotect.com | 19862210Des |
| Gestión Admin | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Completado

### Mar 6, 2026 - Performance + Auth + SEO
- Auth migrado a bcrypt (SHA256 -> bcrypt con auto-upgrade)
- Auto-seed en startup (usuarios gestión siempre disponibles)
- Mensajes error específicos ("Contraseña incorrecta", "Usuario no encontrado")
- Scripts analytics diferidos 3s post-load (GTM, GA4, FB Pixel, Hotjar)
- Hero image preloaded (LCP optimization)
- Preconnects innecesarios eliminados (Stripe, Google Analytics)
- width/height explícitos en TODAS las imágenes (CLS fix)
- decoding="async" en imágenes lazy
- Keywords/descriptions alineadas con negocio real
- robots.txt y sitemap.xml actualizados
- Digital Asset Links para TWA

### Mar 6, 2026 - Equipos de Instalación
- CRUD equipos (1-N miembros), asignación a instalaciones
- Notificaciones automáticas, dashboard con conteo

### Testing: iteration 90 (95% backend, 100% frontend)

## Backlog
- P0: Deploy a producción
- P0: Generar APKs con PWABuilder
- P2: Meta Pixel ID + Hotjar ID + Google Search Console
- P1: Streaming RTSP
- P2: iOS Capacitor
- P3: 112, BigQuery, Sora 2
