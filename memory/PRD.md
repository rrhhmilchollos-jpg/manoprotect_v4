# ManoProtect - Product Requirements Document

## Última Actualización: 28 Febrero 2026 (v8)

---

## Descripción del Proyecto
ManoProtect - plataforma de seguridad familiar. Productos: Sentinel X (adultos), Sentinel J (jóvenes 3-12), Sentinel S (niños 6-14).

## Stack Técnico
- Frontend: React 18, TailwindCSS, Shadcn/UI | Backend: FastAPI, fpdf2 | DB: MongoDB | Payments: Stripe | Mobile: Capacitor

---

## Productos
| Producto | Edad | Precio | Descripción |
|----------|------|--------|-------------|
| Sentinel X Basic | Adultos | GRATIS + 9,95€ envío + suscripción | Bluetooth, GPS |
| Sentinel X Fundadores | Adultos | 149€ | 4G LTE |
| Sentinel X Premium | Adultos | 199€ | Titanio + Zafiro |
| Sentinel J | 3-12 años | GRATIS + 4,95€ envío + suscripción | 8 correas intercambiables, GPS, Botón SOS |
| Sentinel S | 6-14 años | GRATIS + 4,95€ envío + suscripción | Cerámica + rose gold, Anti-retirada, Sirena 120dB |

## Suscripción obligatoria (oculta) para Basic/J/S
- Mensual: 9,99€/mes | Anual: 99,99€/año

---

## Sistema de Bloqueo Parental (v7)
- Primer uso: padre configura GPS → auto-lock
- Tras activar: configuración BLOQUEADA y OCULTA
- Desbloqueo: solo admin + DNI + motivo

## Background Location Tracking (v6-v7)
- Android: ACCESS_FINE_LOCATION, COARSE, BACKGROUND, BATTERY_OPTIMIZATION, WAKE_LOCK
- iOS: Always permission, Background Modes
- Heartbeat continuo

## Notificaciones Push de Ubicación (v8)
- `POST /api/family/request-location` — padre solicita ubicación del niño
- Notificación automática: "Nombre localizado/a. GPS en segundo plano. Ver en mapa."
- Campanita en Dashboard con panel desplegable
- Enlace directo a Google Maps
- `GET /api/notifications` + `POST /api/notifications/read-all`

## PDFs y WhatsApp (v7)
- PDF Bienvenida: `GET /api/documents/welcome-pdf`
- PDF Setup Complete: `GET /api/documents/setup-complete-pdf`
- WhatsApp: `GET /api/documents/whatsapp-share/{type}`

---

## Testing
| Iteración | Tests | Estado |
|-----------|-------|--------|
| 56 | Subscription modal + checkout | 16/16 ✅ |
| 57 | Location lock + PDF + WhatsApp | 22/22 ✅ |
| 58 | Notificaciones push + textos productos | pendiente |

---

## Backlog
### P0: Stripe keys reales + webhooks (BLOQUEADO)
### P0: Meta Pixel ID + Google SC (BLOQUEADO)
### P1: iOS build (Mac + Xcode), Webhook Stripe
### P2: "Quiénes Somos", BigQuery, SEO Fase 3, 112
### P3: Emails trial, refactor landing pages, Infobip/SendGrid/Twilio

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
