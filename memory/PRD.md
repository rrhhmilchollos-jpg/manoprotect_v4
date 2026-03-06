# ManoProtect - PRD v10.5.0

## Completado Mar 6, 2026

### Performance (Lighthouse)
- Imágenes WebP: 9,584KB -> 420KB (95.6% reducción)
- Scripts analytics diferidos 3s post-load
- Hero image preloaded, preconnects optimizados
- width/height explícitos en todas las imágenes (CLS fix)

### Google Discover
- max-image-preview:large + max-video-preview:-1
- Hero HD 1200px+ para Discover
- FAQPage schema (4 preguntas)
- ItemList schema (artículos blog)
- RSS Feed /api/rss/feed.xml (6 artículos)
- 40+ schema types
- Keywords alineadas con negocio real

### Auth (bcrypt)
- Migración SHA256->bcrypt con auto-upgrade
- Auto-seed en startup
- Mensajes de error específicos

### Equipos de Instalación
- CRUD equipos, asignación a instalaciones
- Notificaciones automáticas

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO | ceo@manoprotect.com | 19862210Des |
| Admin CRA | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Backlog
- P0: Deploy + generar APKs PWABuilder
- P1: Streaming RTSP cámaras
- P2: Meta Pixel ID, Hotjar ID, Google Search Console
- P2: iOS Capacitor
- P3: 112, BigQuery, Sora 2
