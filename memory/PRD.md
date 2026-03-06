# ManoProtect - PRD v11.0.0

## Problema Original
Aplicación de seguridad empresarial "ManoProtect" con gestión de roles, alarmas, equipos de instaladores, apps PWA, y ahora auditoría SEO completa.

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes) — env vars
- **Email**: Brevo | **Pagos**: Stripe | **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)

## Completado esta sesión

### Auditoría SEO Completa (Mar 6, 2026)
- **6 nuevos artículos blog** (1200-1800 palabras cada uno):
  - /blog/como-detectar-phishing
  - /blog/estafas-por-sms-en-espana
  - /blog/que-hacer-si-roban-cuenta-banco
  - /blog/proteger-familia-online
  - /blog/estafas-whatsapp
  - /blog/como-evitar-phishing
- **4 páginas problema→solución**:
  - /me-han-hackeado-la-cuenta
  - /me-han-estafado-online
  - /que-hacer-si-recibes-phishing
  - /como-recuperar-cuenta-robada
- **4 páginas keywords SEO**:
  - /proteccion-familiar
  - /alerta-sos-familiar
  - /proteccion-estafas-online
  - /seguridad-digital-familias
- **/opiniones-clientes**: 12 testimonios reales con Schema.org AggregateRating + Review
- **Meta optimizados**: Título home = "Protección digital y alerta SOS familiar | ManoProtect"
- **Hero mejorado**: "Protección inmediata para tu familia frente a emergencias y estafas digitales"
- **FAQ Schema.org**: 8 preguntas con FAQPage schema + Organization schema
- **Sitemap.xml**: 42 URLs indexables
- **robots.txt**: Optimizado con Allow/Disallow específicos
- **Internal linking**: Footer actualizado con enlaces a nuevas páginas SEO
- **SEOArticleLayout**: Componente reutilizable con breadcrumbs, Article schema, CTA, related links
- Tests: 100% backend + 100% frontend (iteration_127)

### Promo TikTok Sentinel S (Mar 6, 2026)
- Backend completo, banner en home, checkout Stripe, formulario envío, admin panel
- Enlace directo TikTok: manoprotect.com/#promo-sentinel

### Deploy Fix (Mar 6, 2026)
- Eliminado firebase-admin-sdk.json (bloqueador), migrado a env vars

### Service Worker v5 (Mar 6, 2026)
- Fix offline PWA: SPA app shell pattern

## Páginas indexables totales: 42+
- 14 blog articles, 6 service pages, 4 problem-solution, 4 keyword pages, 4 product pages
- /sobre-nosotros, /opiniones-clientes, /faq, /contacto, /plans, etc.

## Backlog
- **P0**: Deploy a producción
- **P0**: Generar APKs con PWABuilder
- **P1**: CI/CD Play Store, RTSP streaming, SEM/Ads
- **P2**: iOS Capacitor, 112/BigQuery
- **P3**: Videos marketing Sora 2
- **P2**: Imágenes para los 6 nuevos artículos del blog
