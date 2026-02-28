# ManoProtect - Product Requirements Document

## Original Problem Statement
Plataforma líder en España de protección digital y física para familias. Optimizar manoprotect.com como líder de mercado en seguridad y ventas con CRO, SEO, y rendimiento elite.

## Core Product
- **Sentinel X**: Reloj GPS/SOS adultos/adolescentes (4G, BT, grabación)
- **Sentinel J**: Reloj GPS/SOS niños 3-12 años (8 correas, sin cámara)
- **Sentinel S**: Reloj GPS/SOS mayores (cerámica, anti-retirada, sirena 120dB)
- **Pricing**: 9,99€/mes o 99,99€/año. Dispositivo GRATIS con suscripción.

## Tech Stack
- Frontend: React + TailwindCSS + Shadcn/UI + Recharts
- Backend: FastAPI + MongoDB
- Payments: Stripe (real products, 3D Secure)
- Email: SendGrid
- Analytics: GTM dataLayer + gtag + fbq + Hotjar (placeholder ready)

## CEO Dashboard Enterprise Edition (Implemented Feb 28, 2026)
Complete admin panel with sidebar navigation and 8 sections:

### Dashboard Principal
- 6 stat cards: Usuarios, Suscripciones, Ventas Mes, Pedidos, Reembolsos, Mensajes
- 3 inventory cards: Sentinel X/J/S con stock en tiempo real
- 3 gráficos: Usuarios/Mes (barras), Ingresos/Mes (línea), Distribución Planes (circular)
- Alertas automáticas: stock bajo, reembolsos pendientes, pagos fallidos, suscripciones por vencer
- Contadores promo: Sentinel X Basic GRATIS (50 uds), Plazas -20% (200 plazas)
- Actividad reciente: feed en tiempo real

### Inventario
- Tabla de productos Sentinel (X, J, S)
- Columnas: Producto, Nº Serie, Estado, Ubicación, Fecha
- Filtros por producto y estado

### Usuarios
- Tabla con búsqueda por email, nombre, ID
- Acciones: suspender/activar cuenta
- Exportar CSV

### Membresías
- Tabla de suscripciones activas
- Promo flag (-20%) visible
- Importes y fechas

### Pagos y Reembolsos
- Tabla de reembolsos con botones Aprobar/Rechazar
- Exportar pagos CSV
- Alertas de pagos fallidos

### Seguridad
- Panel de administradores con roles
- Contador 2FA activado
- Registro de actividad (intentos fallidos)

### Mensajes
- Tabla de mensajes de contacto
- Badge de no leídos en sidebar

### Reportes
- Exportar usuarios CSV
- Exportar pagos CSV
- Resumen financiero: MRR, Hoy, Este Mes, Total

### Notificaciones Push
- Campana en header con contador
- Panel desplegable con notificaciones en tiempo real
- Auto-generadas de: reembolsos pendientes, mensajes sin leer, pagos fallidos, nuevos usuarios
- Polling cada 10 segundos

### Indicadores de Salud
- Backend LIVE / Frontend LIVE en header
- Heartbeat polling cada 5 segundos

## Promotional Pricing
- Sentinel X Basic GRATIS (50 unidades, requiere suscripción)
- 20% descuento automático en checkout Stripe para primeros 200 suscriptores
- Contadores en tiempo real en /plans y CEO Dashboard

## Health Check System
- Backend: /api/heartbeat + /api/health
- Frontend: HealthCheckMonitor global polling cada 5s con toast de alerta

## SEO Phase 3 (Implemented Feb 28, 2026)
- robots.txt optimizado con Allow/Disallow directivas
- sitemap.xml con 24+ URLs incluyendo landing pages SEO
- Landing pages long-tail: reloj-sos-ancianos, reloj-gps-mayores, boton-sos-senior
- Landing pages digitales: proteccion-phishing, proteccion-fraude-online, seguridad-digital-familiar, seguridad-mayores
- Schema markup avanzado en todas las páginas

## Videos de Marketing
- 4 imágenes fotorrealistas de familias españolas con Sentinel
- Sección en landing principal con cards estilo video

## ZIP Descargable
- Disponible en /manoprotect-com.zip (2.1MB)
- Contiene: backend completo, frontend src, public esencial, configs

## API Endpoints CEO
| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| /api/ceo/stats | GET | Admin | Dashboard stats completas |
| /api/ceo/chart-data | GET | Admin | Datos para gráficos |
| /api/ceo/users | GET | Admin | Lista usuarios paginada |
| /api/ceo/users/{id}/plan | PATCH | Admin | Cambiar plan usuario |
| /api/ceo/users/{id}/suspend | PATCH | Admin | Suspender/activar usuario |
| /api/ceo/subscriptions | GET | Admin | Lista suscripciones |
| /api/ceo/orders | GET | Admin | Lista pedidos |
| /api/ceo/refunds | GET | Admin | Lista reembolsos |
| /api/ceo/refunds/{id} | PATCH | Admin | Aprobar/rechazar reembolso |
| /api/ceo/messages | GET | Admin | Lista mensajes contacto |
| /api/ceo/messages/{id}/read | PATCH | Admin | Marcar mensaje leído |
| /api/ceo/inventory | GET | Admin | Lista inventario |
| /api/ceo/inventory | POST | Admin | Añadir item inventario |
| /api/ceo/inventory/{id} | PATCH | Admin | Actualizar item |
| /api/ceo/security-logs | GET | Admin | Logs de actividad admin |
| /api/ceo/security-overview | GET | Admin | Resumen seguridad |
| /api/ceo/notifications | GET | Admin | Notificaciones |
| /api/ceo/activity | GET | Admin | Feed actividad reciente |
| /api/ceo/export/users | GET | Admin | CSV usuarios |
| /api/ceo/export/payments | GET | Admin | CSV pagos |
| /api/ceo/promo-status | GET | Público | Contadores promo |
| /api/ceo/claim-sentinel-basic | POST | User | Reclamar Sentinel gratis |

## Backlog
### P1: IDs de Meta Pixel, Hotjar, Google SC (bloqueado en usuario)
### P2: Remarketing/A/B testing, SEO Fase 4 (backlinks externos)
### P3: Integraciones 112, BigQuery
### BLOQUEADOS: SMS Infobip, SendGrid producción, Twilio WhatsApp producción

## Credentials
| User | Password | Role |
|---|---|---|
| ceo@manoprotect.com | 19862210Des | admin |
| padretest@gmail.com | secure_password_123 | family_tracking |
