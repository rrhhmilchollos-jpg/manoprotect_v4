# ManoProtect - Product Requirements Document

## Última Actualización: 28 Febrero 2026 (v9)

## Descripción
ManoProtect - plataforma de seguridad familiar. Productos: Sentinel X (adultos), Sentinel J (jóvenes 3-12), Sentinel S (niños 6-14).

## Stack: React 18, FastAPI, MongoDB, Stripe, Capacitor, fpdf2

---

## Productos
| Producto | Edad | Precio | Descripción |
|----------|------|--------|-------------|
| Sentinel X Basic | Adultos | GRATIS + 9,95€ envío + suscripción | Bluetooth, GPS |
| Sentinel X Fundadores | Adultos | 149€ | 4G LTE |
| Sentinel X Premium | Adultos | 199€ | Titanio + Zafiro |
| Sentinel J | 3-12 años | GRATIS + 4,95€ envío + suscripción | 8 correas intercambiables · GPS · Botón SOS |
| Sentinel S | 6-14 años | GRATIS + 4,95€ envío + suscripción | Cerámica + rose gold · Anti-retirada · Sirena 120dB |

## Suscripción: Mensual 9,99€/mes | Anual 99,99€/año
## Promoción: Hasta 30 de Marzo 2026

---

## Features Completadas

### v6: Embudo de Conversión + Background Location
- Suscripción obligatoria (oculta) para Basic/J/S
- Background Location: Android + iOS + heartbeat

### v7: Bloqueo Parental + PDFs + WhatsApp
- Auto-lock GPS tras primera configuración
- PDF Bienvenida + PDF Setup Complete
- WhatsApp sharing

### v8: Notificaciones Push
- Campanita en Dashboard
- Notificación automática al solicitar ubicación
- "Ver en mapa" con Google Maps

### v9: 112 + Trials + Analytics + SEO
- **Integración 112**: POST /api/emergency/112 → logs, notifica contactos, devuelve tel:112 + coords
- **Trial Reminders**: POST /api/admin/send-trial-reminders → notificaciones a usuarios expirando
- **Analytics Export**: GET /api/admin/analytics/export → JSON BigQuery-ready + CSV users
- **Textos actualizados**: Sentinel J (3-12), Sentinel S (6-14), fecha 30 Marzo 2026

---

## Testing
| Iter | Tests | Estado |
|------|-------|--------|
| 56 | Subscription + checkout | 16/16 ✅ |
| 57 | Location lock + PDF + WhatsApp | 22/22 ✅ |
| 58 | 112 + Trial + Analytics + textos | 26/26 ✅ |

---

## Backlog
### P0: Stripe keys reales + webhooks (BLOQUEADO), Meta Pixel ID + Google SC (BLOQUEADO)
### P1: iOS build (Mac + Xcode), Webhook Stripe invoice/subscription
### P2: "Quiénes Somos" (esperando contenido), SEO Fase 3 backlinks outreach
### P3: Refactorizar landing pages locales

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
