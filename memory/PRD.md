# ManoProtect - Product Requirements Document

## Última Actualización: 28 Febrero 2026 (v10.3)

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
### v10.3: Registro nuevo + Stripe real + SEO Fase 3 + Limpieza
- **Registro nuevo**: Página completamente reescrita, tema emerald, solo 2 planes (9.99€/mes, 99.99€/año), Stripe 3D Secure, progress steps
- **Stripe Products reales creados**: prod_U3vgOjNjLrG93Y, price_1T5nofRoJZ3B4mXEtYf1rMaE (monthly), price_1T5nofRoJZ3B4mXEyj94gkyo (yearly)
- **SEO Fase 3**: sitemap.xml actualizado, robots.txt, FAQ structured data, Service schema con precios reales, breadcrumbs limpios
- **GTM dataLayer**: Conversion tracking para Google Ads (page_view, cta_click, begin_checkout, purchase)
- **Limpieza**: Eliminada barra naranja "OFERTA ESPECIAL", eliminado InterstitialAdManager y AIChatWidget, eliminado PushNotificationPrompt, JSON basura limpiado de index.html
- **Marca emerald**: Loading screen, theme-color, tile-color, mask-icon todos actualizados

### v10.4: Restauración Sentinel en Home
- **Sección Dispositivos Sentinel en Home**: Añadida sección "Protección física + digital" en HighConversionLanding.js con tarjetas interactivas para Sentinel X, J y S
- **Navegación actualizada**: Añadido enlace "Dispositivos" en header desktop y menú móvil
- **Páginas Sentinel verificadas**: /sentinel-x, /sentinel-j, /sentinel-s todas funcionando correctamente

### v10.2: Sincronización precios + Arreglos generales
- Precios sincronizados: Familiar 9,99€/mes | 99,99€/año (landing, registro, backend)
- 2FA con fallback email (SendGrid) cuando SMS falla
- CRO emails envían HTML reales vía SendGrid (3 templates)
- Marca emerald unificada en todas las páginas
- SEO meta tags actualizados, Meta Pixel fix, SobreNosotros milestone 2026

- **Demo Interactiva** (`PhoneDemo.js`): Animación CSS/JS de teléfono mostrando flujo completo
  - Fases: Idle → Tap → Searching (radar) → Found (mapa + pin) → Alert (notificación push)
  - Ciclo automático 12.8s, activado por scroll (IntersectionObserver)
  - 4 pasos descriptivos al lado del teléfono + CTA
- **Performance**: Scroll reveal animations, lazy loading, smooth scroll

---

## Testing
| Iter | Tests | Estado |
|------|-------|--------|
| 56 | Subscription + checkout | 16/16 ✅ |
| 57 | Location lock + PDF + WhatsApp | 22/22 ✅ |
| 58 | 112 + Trial + Analytics + textos | 26/26 ✅ |
| 59 | CRO System + Landing (backend 17/17 + frontend all) | 100% ✅ |
| 60 | PhoneDemo + CRO regression (all features) | 100% ✅ |

---

## Backlog
### P0: COMPLETADO - Páginas Sentinel X/J/S verificadas y funcionando (28 Feb 2026)
### P1: iOS build (Mac + Xcode - BLOQUEADO), Meta Pixel ID + Google SC (BLOQUEADO), Webhook Stripe invoice/subscription, CRO Semanas 2-4 avanzadas
### P2: "Quiénes Somos" (esperando contenido), SEO Fase 3 backlinks outreach, Activar tráfico real (Google Ads + Facebook Ads), Activar integraciones mocked (112, BigQuery)
### P3: Refactorizar landing pages locales, Cleanup legacy LandingPage.js
### BLOQUEADOS (acción del usuario): SMS Infobip (clave inválida), SendGrid dominio sin verificar, Twilio WhatsApp producción, Meta Pixel ID, Google Search Console

## Archivos Clave CRO
| Archivo | Función |
|---------|---------|
| frontend/src/pages/HighConversionLanding.js | Landing principal (ruta /) |
| frontend/src/components/PhoneDemo.js | Demo animada de teléfono |
| frontend/src/services/conversionTracking.js | Tracking de conversiones |
| backend/routes/cro_routes.py | A/B testing + Email sequences + Funnel |
| backend/services/cron_jobs.py | Procesamiento automático email sequences |

## Credenciales
| Email | Password | Rol |
|-------|----------|-----|
| ceo@manoprotect.com | 19862210Des | super_admin |
