# ManoProtect - PRD v10.6.0

## Performance Optimizations (Mar 6, 2026)

### FCP 2.9s -> Target <1.5s
- Font @import eliminado del CSS (era render-blocking chain: CSS→GoogleFonts CSS→woff2)
- Fonts cargadas vía `<link media="print" onload="this.media='all'">` (non-blocking)
- CSS crítico inline en index.html (instant first paint)
- Preconnects reducidos a solo fonts (2 en vez de 4+)

### LCP 6.0s -> Target <2.5s
- Imágenes WebP: 9,584KB → 420KB (95.6% reducción)
- Hero image preloaded con `fetchpriority="high"`
- Imágenes locales (no CDN externo = eliminado round trip)
- `loading="eager"` en hero, `loading="lazy"` en todo lo demás

### CLS 0.206 -> Target <0.1
- `font-display: optional` (no font swap = no text reflow)
- Landing page carga EAGER (no lazy) — eliminado el CLS de Suspense fallback→real content
- `min-height: 600px` en hero section
- `aspect-ratio` inline en hero image y step images
- `width/height` explícitos en TODAS las imágenes (11 imágenes)
- `content-visibility: auto` en secciones below-fold
- `containIntrinsicSize` en secciones para reservar espacio

### TBT 190ms -> Target <200ms
- Scripts analytics (GTM, GA4, FB Pixel, Hotjar) diferidos 3s post-load
- `content-visibility: auto` reduce rendering work below-fold
- `decoding="async"` en imágenes lazy

### Speed Index 4.1s -> Target <3.3s
- Combinación de todas las mejoras anteriores
- CSS crítico inline = primer paint visible inmediato
- Hero image preloaded = contenido principal visible rápido

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO | ceo@manoprotect.com | 19862210Des |
| Admin CRA | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Backlog
- P0: Deploy a producción + verificar Lighthouse scores
- P0: Generar APKs PWABuilder
- P1: Streaming RTSP cámaras
- P2: iOS Capacitor
- P3: 112, BigQuery, Sora 2
