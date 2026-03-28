# ManoProtect - PRD
## Dominio: manoprotectt.com

## Descripcion
Sistema de seguridad empresarial ManoProtectt.com con CRA 24/7, app ManoClient+ estilo Mi Verisure, sistema trial/Stripe, Firebase Push, SEO optimizado.

## Apps Android TWA
| App | Package | Nombre Play Store | Estado |
|-----|---------|-------------------|--------|
| ManoClient+ | com.manoprotect.www.twa | ManoClient+ | AAB COMPILADO |
| MP Comerciales | com.manoprotect.comerciales | MP Comerciales | AAB COMPILADO |
| MP Instaladores | com.manoprotect.instaladores | MP Instaladores | AAB COMPILADO |

SHA256: 15:53:21:F0:A5:A7:CE:1D:B1:4D:42:8F:97:09:ED:08:C2:11:4B:AF:32:C1:E8:19:74:65:63:65:12:F4:1D:9A

## Completado Esta Sesion (28 Mar 2026)
- 100 codigos TikTok promo (TIKTOK-XXXXXX) auto-seeded al iniciar backend
- Enlace @manoprotect TikTok en seccion promo de landing + footer
- Input de validacion de codigos TikTok con feedback visual
- Security Headers verificados (CSP, HSTS, X-Frame-Options, Rate Limiting, IP Block)
- Service Worker v5 con App Shell Pattern validado
- Firebase Analytics inicializado y funcional
- Tests iteration_139: 19/19 backend + 8/8 frontend = 100% PASS

## Completado Sesiones Anteriores
- App ManoClient+ reescrita estilo Mi Verisure (escudo alarma, zonas, camaras, SOS, eventos, PIN)
- assetlinks.json con package com.manoprotect.www.twa + fingerprint correcto
- AAB y APK ManoClient+ compilados (2.2MB)
- Politica de privacidad actualizada (RGPD completo, 3 apps, Stripe, Firebase, fingerprint)
- Eliminacion de datos actualizada (formulario email, pasos detallados, datos conservados por ley)
- Landing page: hero actualizado segun PDF (Sentinel S GRATIS, 49.99 EUR/mes)
- SEO: meta tags, OG tags, precios actualizados a 49.99
- Push notification recovery: scheduler cada 6h para usuarios inactivos 2+ dias
- GA4 analytics endpoint: POST /api/analytics/event (UTM tracking)
- Backend endpoint /.well-known/assetlinks.json (application/json)
- Installer Team Management (CRUD backend + frontend UI)
- PWA-to-APK preparation (manifests, HTML entry pages, GUIA_PWABUILDER_APK.md)
- Lighthouse Core Web Vitals optimization (WebP images, critical CSS, CLS fixes)
- Google Discover integration (RSS feed, Schema.org, OG images)
- Authentication hardening (bcrypt, auto-seed)

## Pendiente
- P0: Deploy a produccion (para que assetlinks.json sea accesible en manoprotectt.com)
- P0: Verificar assetlinks con Google Digital Asset Links API post-deploy
- P1: CI/CD Play Store (secrets GitHub: KEYSTORE_BASE64, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
- P1: Search Console verificacion DNS/meta-tag
- P1: Firebase Crashlytics + Performance Monitoring
- P1: Google Ads vinculacion con Firebase/Play
- P2: RTSP Camera Streaming
- P2: iOS App con Capacitor
- P3: Videos marketing (Sora 2)
