# ManoProtect - Product Requirements Document

## Última Actualización: 28 Febrero 2026 (v7)

---

## Descripción del Proyecto
ManoProtect es una plataforma integral de seguridad personal y protección familiar. Producto principal: Sentinel X (reloj con botón SOS), Sentinel J (juvenil) y Sentinel S (niños premium).

---

## Stack Técnico
- **Frontend**: React 18, TailwindCSS, Shadcn/UI, react-helmet-async
- **Backend**: FastAPI, Python 3.11, Pydantic, fpdf2
- **Database**: MongoDB (Motor async)
- **Payments**: Stripe (subscriptions + one-time)
- **Auth**: JWT + session cookies
- **Mobile**: Capacitor (Android + iOS config)

---

## Embudo de Conversión (COMPLETADO v6-v7)

### Flujo para relojes GRATIS (Basic, J, S)
1. Usuario llega a `/sentinel-x` y elige producto
2. Rellena formulario (nombre, email, teléfono, dirección)
3. "Pedir GRATIS" → modal de suscripción obligatoria (oculta hasta checkout)
4. Plan Mensual: 9,99€/mes | Plan Anual: 99,99€/año
5. Stripe: suscripción recurrente + envío único (9,95€/4,95€)

### Flujo para relojes de pago (Fundadores 149€, Premium 199€)
- Checkout directo sin suscripción

---

## Sistema de Bloqueo Parental (COMPLETADO v7)

### Flujo
1. Padre configura GPS en Modo Familiar → LocationPermissionFlow
2. Al completar: `POST /api/location/lock` → settings BLOQUEADOS
3. UI oculta toda opción de configuración → badge "BLOQUEADO"
4. Niño NO puede ver ni desactivar permisos GPS
5. Para desbloquear: solo admin con `POST /api/admin/unlock-location` + DNI + motivo
6. Auditoría completa de lock/unlock

### Endpoints
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/location/lock` | POST | Bloquea ajustes ubicación |
| `/api/location/status` | GET | Estado del bloqueo |
| `/api/admin/unlock-location` | POST | Desbloqueo admin (DNI required) |
| `/api/family/location/update` | POST | Heartbeat ubicación |
| `/api/family/member/{id}/location` | GET | Última ubicación conocida |

---

## Background Location Tracking (COMPLETADO v6-v7)

### Android
- ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION, ACCESS_BACKGROUND_LOCATION ✅
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, WAKE_LOCK ✅
- FOREGROUND_SERVICE, FOREGROUND_SERVICE_LOCATION ✅

### iOS
- NSLocationAlwaysAndWhenInUseUsageDescription ✅
- Background Modes: location, fetch, remote-notification ✅

### Heartbeat Continuo
- Ubicación se envía al servidor periódicamente
- Almacena últimas 100 ubicaciones por usuario
- Familia puede consultar última ubicación conocida con maps_url

---

## PDFs y WhatsApp (COMPLETADO v7)

### PDF de Bienvenida (post-compra)
- Endpoint: `GET /api/documents/welcome-pdf`
- Contenido: datos del pedido, guía de configuración, contacto soporte
- Descargable desde ThankYouPage

### PDF de Configuración Completada (post-setup)
- Endpoint: `GET /api/documents/setup-complete-pdf`
- Contenido: estado protección GPS, funciones activas, soporte

### WhatsApp Sharing
- Endpoint: `GET /api/documents/whatsapp-share/{welcome|setup-complete}`
- Genera enlace wa.me con texto predefinido

### ThankYouPage (`/gracias`)
- Detecta producto (sentinel-x-basic, sentinel-j, sentinel-s, etc.)
- Sección "Documentos y compartir" con PDF + WhatsApp
- Nota de plan familiar activo para suscripciones

---

## Páginas SEO (COMPLETADO)
- Landing pages por edad: niños, adultos, senior
- Landing pages locales: Valencia, Madrid, Barcelona, Sevilla
- Blog: 8 artículos SEO optimizados
- Schema.org completo en todas las páginas

---

## Testing
| Iteración | Tests | Estado |
|-----------|-------|--------|
| 56 | Subscription modal + checkout flows | 16/16 ✅ |
| 57 | Location lock + PDF + WhatsApp + heartbeat | 22/22 ✅ |

---

## Backlog Pendiente

### P0 - Crítico
- [ ] Stripe Price IDs reales + webhooks (BLOQUEADO - usuario)
- [ ] Meta Pixel ID + Google Search Console (BLOQUEADO - usuario)

### P1 - Alta
- [ ] iOS build con Capacitor (BLOQUEADO - necesita Mac + Xcode)
- [ ] Stripe webhook: invoice.payment_succeeded, subscription.deleted

### P2 - Media
- [ ] Página "Quiénes Somos" (esperando contenido)
- [ ] BigQuery + Looker Studio
- [ ] SEO Fase 3: Backlinks
- [ ] Integración 112

### P3 - Baja
- [ ] Emails recordatorio trial
- [ ] Refactorizar landing pages locales
- [ ] Integraciones bloqueadas: Infobip, SendGrid, Twilio

---

## Project Health Check
- **Funcional**: Embudo de conversión, suscripciones Stripe, bloqueo parental, GPS tracking, PDFs, WhatsApp
- **Bloqueado**: Stripe keys reales, Meta Pixel ID, Google SC, iOS build, Infobip/SendGrid/Twilio
- **Roto**: SMS (Infobip key inválida), 2FA, Live email (SendGrid sin verificar)

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
| padretest@gmail.com | secure_password_123 | family tracking |
