# ManoProtect - Product Requirements Document

## Última Actualización: 28 Febrero 2026 (v10)

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

### v10: CRO System + Landing Alta Conversión
- **Landing Page Alta Conversión** (`HighConversionLanding.js`): Nueva landing principal targeting padres con hijos adolescentes
  - Hero emocional con A/B testing dinámico
  - Trust bar (VISA, MC, PayPal, Garantía 14 días, Soporte 24/7)
  - Activación emocional (78% stat con contador animado)
  - "¿Por qué necesitas ManoProtect?" 4 tarjetas con scroll reveal
  - "Cómo funciona" en 3 pasos visuales
  - FAQ con 5 preguntas expandibles
  - Testimonios (3 reviews)
  - Pricing anclado al riesgo (9,99€/mes | 99,99€/año "MÁS POPULAR")
  - Garantía 7 días + CTA final potente
  - Exit intent popup + Social proof notifications + Mobile sticky CTA + WhatsApp
- **Sistema A/B Testing**: Backend asigna variantes por visitor_id, frontend renderiza dinámicamente
  - Tests activos: hero_headline, cta_text, pricing_order
  - Resultados en GET /api/cro/ab-test/{id}/results
- **Conversion Tracking**: Funnel completo page_view → cta_click → begin_checkout → purchase_complete
  - Dashboard: GET /api/cro/dashboard
  - Funnel: GET /api/cro/funnel?days=7
- **Email Sequences**: Secuencia automática 3 emails para usuarios que no convierten
  - Email 1 (24h): Beneficios + tranquilidad
  - Email 2 (48h): Caso real (Laura)
  - Email 3 (72h): Recordatorio prueba gratis
  - Cron job cada 2h para procesamiento
- **Performance**: Scroll reveal animations, lazy loading, smooth scroll

---

## Testing
| Iter | Tests | Estado |
|------|-------|--------|
| 56 | Subscription + checkout | 16/16 ✅ |
| 57 | Location lock + PDF + WhatsApp | 22/22 ✅ |
| 58 | 112 + Trial + Analytics + textos | 26/26 ✅ |
| 59 | CRO System + Landing (backend 17/17 + frontend all) | 100% ✅ |

---

## Backlog
### P0: Stripe keys reales + webhooks (BLOQUEADO), Meta Pixel ID + Google SC (BLOQUEADO)
### P1: iOS build (Mac + Xcode), Webhook Stripe invoice/subscription, Implementar CRO Semanas 2-4 avanzadas (remarketing, Google Ads, A/B testing más test variants)
### P2: "Quiénes Somos" (esperando contenido), SEO Fase 3 backlinks outreach, Activar tráfico real (Google Ads + Facebook Ads)
### P3: Refactorizar landing pages locales, Cleanup legacy LandingPage.js

## Archivos Clave CRO
| Archivo | Función |
|---------|---------|
| frontend/src/pages/HighConversionLanding.js | Landing principal (ruta /) |
| frontend/src/services/conversionTracking.js | Tracking de conversiones |
| backend/routes/cro_routes.py | A/B testing + Email sequences + Funnel |
| backend/services/cron_jobs.py | Procesamiento automático email sequences |

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
