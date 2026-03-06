# ManoProtect - PRD v10.8.0

## Problema Original
Construir una aplicación de seguridad empresarial "ManoProtect" completa y escalable con gestión de roles, sistema de alarmas, equipos de instaladores, y apps PWA Android.

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

### Promoción TikTok — Sentinel S GRATIS (Mar 6, 2026)
- **Backend**: Endpoints completos en `/api/promo/sentinel-s/` (status, checkout, confirm, shipping, admin orders, tracking)
- **Landing page**: Banner impactante rojo-naranja-amarillo con urgencia (X/100 disponibles), botones CTA mensual (9,99€) y anual (99,99€ con "AHORRA 20€")
- **Página gracias**: `/promo/sentinel-s/gracias` con resumen del pedido, timeline de envío, formulario de dirección completo
- **Admin panel**: Sección "Promo TikTok" en GestionAdmin con stats, lista de pedidos, datos de envío y modal de tracking
- **Notificaciones admin**: Se crean automáticamente al recibir un formulario de envío
- **Códigos regalo**: Generados automáticamente al crear el checkout (formato SENTINEL-XXXXXXXX)
- **Límite**: 100 unidades, 1 por usuario, envío máx. 60 días
- Tests: 100% backend + 100% frontend (iteration_126)

### Service Worker v5 - SPA App Shell Pattern (Mar 6, 2026)
- Corregido problema offline de apps PWA de escritorio
- SW v5: red → caché URL → app shell → offline.html
- Precache incluye manifests de comerciales e instaladores

### Autenticación bcrypt, Lighthouse, SEO, Equipos Instaladores
- Ver PRD v10.7.0 para detalles completos

## Archivos clave de la promo
- `/app/backend/routes/promo_sentinel_routes.py` — Backend completo
- `/app/frontend/src/pages/HighConversionLanding.js` — Banner promo en home
- `/app/frontend/src/pages/PromoSentinelGracias.jsx` — Página gracias + formulario envío
- `/app/frontend/src/pages/GestionAdmin.jsx` — Admin panel con Promo TikTok

## API Endpoints Promo
- `GET /api/promo/sentinel-s/status` — Estado de la promo (restantes)
- `POST /api/promo/sentinel-s/checkout` — Crear checkout Stripe
- `POST /api/promo/sentinel-s/confirm/{order_id}` — Confirmar pago
- `POST /api/promo/sentinel-s/shipping` — Enviar dirección
- `GET /api/promo/sentinel-s/admin/orders` — Admin: ver pedidos
- `PUT /api/promo/sentinel-s/admin/orders/{id}/tracking` — Admin: tracking

## DB Schema Promo
- **`promo_sentinel_orders`**: `{ order_id, gift_code, session_id, user_id, email, plan_type, plan_name, amount, status, shipping, tracking, created_at }`
- **`admin_notifications`**: `{ type: "promo_sentinel_order", title, message, order_id, read, created_at }`

## Backlog Priorizado
- **P0**: Deploy a producción + verificar login en prod
- **P0**: Generar APKs con PWABuilder
- **P1**: CI/CD secrets Play Store (usuario debe agregar KEYSTORE_BASE64, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
- **P1**: Streaming RTSP cámaras
- **P1**: SEO/SEM/Ads (necesita Meta Pixel ID, Hotjar ID, GSC verification)
- **P2**: App iOS Capacitor (requiere Mac)
- **P2**: Integraciones 112, BigQuery
- **P3**: Videos marketing Sora 2
