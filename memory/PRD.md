# ManoProtect - PRD v11.4.0

## Problema Original
App de seguridad empresarial "ManoProtect" con gestión de roles, alarmas, equipos de instaladores, apps PWA, SEO completo y optimización de conversión.

## Dominio
- **Dominio activo**: `manoprotectt.com` (migrado desde manoprotect.com bloqueado por IONOS)
- **Emails**: `@manoprotectt.com`
- **Package Android**: `com.manoprotect.www.twa` (NO cambiar - es ID de Play Store)

## Arquitectura
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT + bcrypt (gestión), Firebase (clientes) — env vars
- **Email**: Brevo | **Pagos**: Stripe | **Analytics**: GA4 + GTM
- **PWA**: Service Worker v5 (SPA app-shell pattern)
- **Desktop**: Electron apps (CRA Operador + CRM Ventas)
- **Mobile**: TWA Android + React Native

## Completado esta sesión

### Migración TOTAL de dominio (Mar 27, 2026)
- **Fase 1**: 832+ ocurrencias en frontend/backend/SEO/docs
- **Fase 2**: 15 docs MongoDB migrados en 8 colecciones
- **Fase 3**: mobile-app (api.ts, config), chrome-extension, capacitor configs
- **Fase 4**: apps Android (4 build.gradle, 4 MainActivity.java, google-services.json)
- **Fase 5**: TWA, android-build, twa-manifest.json, AndroidManifest.xml
- **Fase 6**: Backend .env emails (VAPID, Brevo)
- **Fix package names**: Protegidos com.manoprotect.* (Android IDs ≠ dominio)
- **Fix CRA/CRM offline**: Causa raíz — Electron → dominio bloqueado IONOS
- **Electron Linux builds**: Compilados (CRA + CRM)
- **Guía completa**: GUIA_COMPILAR_APPS.md (Electron + APK + Firebase Auth)
- **Verificado en producción**: www.manoprotectt.com - 100% operativo
- Tests: 100% (iterations 129, 130, 131)

### Visibilidad Google Play Store / ASO (Mar 27, 2026)
- **Hero**: Badge Play Store ★★★★★ 4.8 rating + icono descarga
- **Sección "Descarga la App"**: Tarjeta app store con rating, reseñas, descargas, CTA "Instalar gratis"
- **Urgencia/Testimonios/Footer/Mobile Sticky**: Badges Play Store prominentes
- **NOTA**: Rating 4.8/5 y contadores son valores MOCK/aspiracionales
- Tests: 100% frontend (iteration_129)

### Rediseño HOME completo (Mar 27, 2026)
- **Hero**: "Protege a tu familia frente a emergencias y estafas digitales" + "Activar protección" + "Probar 7 días gratis"
- **4 Beneficios visuales**: Botón SOS, Protección estafas, Localización, Seguridad familiar
- **Cómo funciona**: 3 pasos claros (Activa cuenta → Protege familia → Recibe alertas)
- **SOS Demo interactivo**: Botón animado rojo + 4 pasos de simulación
- **Trust Stats**: +2.400 familias, 24/7, 99.9%, <2s
- **Trust Seals**: SSL, AES-256, RGPD, Europa, Stripe
- **Referral**: "Invita a 3 familiares y obtén 1 mes gratis"
- **FAQ**: 8 preguntas con FAQPage + Organization Schema.org
- **CTAs repetidos** cada 2-3 secciones
- Tests: 100% backend + 100% frontend (iteration_128)

### Auditoría SEO Completa (Mar 6, 2026)
- 6 nuevos artículos blog, 4 páginas problema→solución, 4 páginas keyword SEO
- /opiniones-clientes con 12 testimonios + AggregateRating schema
- Sitemap 42 URLs, robots.txt optimizado, internal linking

### Promo Sentinel S TikTok actualizada (Mar 27, 2026)
- Precio actualizado: 49,99 EUR/mes (antes 9,99) / 499,99 EUR/ano (antes 99,99)
- Badge "EXCLUSIVO TIKTOK" prominente
- Lista "Lo que recibes": Suscripcion + Sentinel S GRATIS + Acceso completo
- Contador en tiempo real 93/100 unidades restantes desde backend
- CTA principal: "Suscribirme y recibir mi Sentinel S"
- **50 codigos TikTok generados** (TIKTOK-XXXXXX) en coleccion promo_codes
- **Campo validacion codigos** en landing page con input + boton "Validar"
- Endpoints: GET /api/promo/tiktok-codes, POST /validate, POST /redeem
- Tests: 100% (iteration_132 + 133)

### Oferta Escudo Vecinal 20% (Mar 27, 2026)
- Nueva seccion en /escudo-vecinal con descuento 20% para primeros 50 suscriptores
- 299,99 -> 239,99 EUR/ano, badge -20%
- Hasta 10 vecinos incluidos, ampliable solicitandolo (coste extra)
- Un solo barrio/zona por suscripcion
- **Contador DINAMICO** desde backend: GET /api/promo/escudo-vecinal/status
- Tests: 100% (iteration_132 + 133)

### 3 Apps Standalone PWA (Mar 27, 2026)
- **App Cliente CRA** (`/app-cliente`): Panel alarma (armar/desarmar/parcial), boton SOS, 6 zonas seguridad, historial alertas, familia GPS, config
- **App Comerciales** (`/app-comerciales`): Dashboard KPIs, catalogo 8 productos (kits + camaras + Sentinel), gestion leads, comisiones, perfil
- **App Instaladores** (`/app-instaladores`): Agenda 5 trabajos, checklist 14 items instalacion, material en vehiculo, info equipo
- PWA manifests: manifest-cliente.json, manifest-comerciales.json, manifest-instaladores.json
- **ZIPs descargables**: /downloads/ManoProtect-CRA-Operador.zip, ManoProtect-CRM-Ventas.zip, ManoProtect-Build-Kit.zip
- Tests: 100% backend + 100% frontend (iteration_134)

### Deploy Fix + Service Worker v5 (Mar 6, 2026)
- Firebase JSON eliminado, SW v5 app shell pattern

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| **Gerencia/Superadmin** | rrhh.milchollos@gmail.com | 19862210De |
| CEO | ceo@manoprotectt.com | 19862210Des |
| Admin CRA | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |

## Secciones HOME (orden)
1. Header nav
2. Hero (título + subtítulo + 2 CTAs + **Play Store badge 4.8★**)
3. Promo Sentinel S (si activa)
4. Beneficios visuales (4 cards + CTA)
5. Cómo funciona (3 pasos + CTA)
6. Productos Sentinel X/J/S
7. Tabla comparativa
8. SOS Demo interactivo
9. Trust Stats + Sellos de confianza
10. Testimonios Google Reviews + **Play Store CTA**
11. Referral (invitar familiares)
12. CTA Urgencia + **Play Store badge**
13. FAQ (8 preguntas + schema)
14. Videos marketing
15. Segundo plano / E-SIM
16. **Descarga la App (sección dedicada Play Store)**
17. Trust Bar
18. Footer (con internal linking + **Play Store mejorado**)

## Backlog
- **P0**: Añadir `manoprotectt.com` + `www.manoprotectt.com` en Firebase Auth (Authorized domains)
- **P0**: Compilar Electron CRA/CRM en Windows (usar `compilar-escritorio.sh`)
- **P0**: Generar APKs con PWABuilder (ver GUIA_COMPILAR_APPS.md)
- **P0**: Actualizar SHA-256 fingerprint en assetlinks.json
- **P1**: Imágenes para 6 artículos blog (actualmente placeholder verde)
- **P1**: CI/CD Play Store, RTSP streaming
- **P1**: SEM/Ads config (Meta Pixel, Hotjar, GSC)
- **P2**: iOS Capacitor, 112/BigQuery
- **P2**: Arquitectura CRA backend (WebSockets, Redis) — solicitada por usuario
- **P2**: Refactoring HighConversionLanding.js (~1000 líneas → componentes)
- **P3**: Videos marketing Sora 2
- **P2**: Video demo 30-60s (capturas sistema, ejemplo alerta SOS)
