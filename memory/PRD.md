# ManoProtect - PRD v10.7.0

## Problema Original
Construir una aplicación de seguridad empresarial "ManoProtect" completa y escalable con gestión de roles (Admin, Comercial, Instalador, CEO), sistema de alarmas, gestión de equipos de instaladores, y aplicaciones PWA para Android.

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes)
- **Email**: Brevo (producción)
- **Pagos**: Stripe
- **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO | ceo@manoprotect.com | 19862210Des |
| Admin CRA | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Completado

### Service Worker v5 - SPA App Shell Pattern (Mar 6, 2026)
- Corregido problema donde las apps PWA de escritorio (CRA/CRM/Comerciales) mostraban offline.html en vez del app
- Causa raíz: el SW usaba fallback directo a offline.html cuando la red fallaba, sin intentar servir el app shell (index.html) cacheado
- Fix: handleNavigationRequest ahora sigue el patrón: red → caché URL exacta → app shell cacheado (/index.html) → offline.html
- Incrementada versión de caché a v5 para forzar actualización en clientes existentes
- Añadidos manifests de comerciales e instaladores al precache
- Tests: 100% backend + 100% frontend

### Autenticación Gestión con bcrypt (Mar 6, 2026)
- Migrado de SHA256 a bcrypt para contraseñas de empleados
- Auto-seed de usuarios por defecto al iniciar el servidor
- Mensajes de error específicos ("Contraseña incorrecta", etc.)

### Optimización de Rendimiento Lighthouse
- Imágenes WebP: 9,584KB → 420KB (95.6% reducción)
- CSS crítico inline, fonts non-blocking
- CLS eliminado con aspect-ratio/min-height
- Scripts analytics diferidos 3s

### SEO & Google Discover
- sitemap.xml dinámico, RSS feed, Schema.org
- Open Graph images, Article/FAQPage/ItemList schemas

### Gestión de Equipos de Instaladores
- CRUD completo para equipos de 2 personas
- Asignación de equipos a instalaciones

### PWA-to-APK Preparation
- Manifests separados (clientes, comerciales, instaladores)
- Guía completa (GUIA_PWABUILDER_APK.md)

## Backlog Priorizado
- **P0**: Deploy a producción + verificar login en prod (issue recurrente)
- **P0**: Generar APKs con PWABuilder
- **P1**: Configurar CI/CD secrets para Play Store (requiere acción del usuario: KEYSTORE_BASE64, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
- **P1**: Streaming RTSP de cámaras en tiempo real
- **P1**: Finalizar SEO/SEM/Ads (requiere Meta Pixel ID, Hotjar ID, GSC verification)
- **P2**: App iOS con Capacitor (requiere Mac del usuario)
- **P2**: Activar integraciones simuladas (112, BigQuery)
- **P3**: Videos marketing con Sora 2
