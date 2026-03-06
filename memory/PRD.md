# ManoProtect - PRD v10.0.0 (Producción)

## Sistema
Plataforma de seguridad profesional. Apps: Comerciales, Instaladores, Clientes (familias), Admin.
Tech: React + FastAPI + MongoDB + Brevo (email) + Stripe (pagos) + WebView Android

## URLs
- Producción: https://www.manoprotect.com
- DB: manoprotect_db

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO/Admin | ceo@manoprotect.com | 19862210Des |
| Gestión Admin | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Apps Play Store (v2.1.0, Build 4)
| App | Package | Descripción |
|-----|---------|-------------|
| Comerciales | com.manoprotect.comerciales | Stock, pedidos, clientes |
| Instaladores | com.manoprotect.instaladores | Órdenes, confirmación, manuales |
| Clientes | com.manoprotect.clientes | Alarma, cámaras, SOS, familia |

## Funcionalidades Completadas (Mar 6, 2026)

### PRODUCCIÓN (sin mocks)
- Email real vía Brevo (recuperación de contraseña, bienvenida)
- Notificaciones en tiempo real (stock bajo, pedidos, asignaciones)
- Login familiar con familia_id
- Auto-actualización de apps (version check endpoint)
- 30+ endpoints API bajo /api/gestion/*
- Scripts CI/CD para Play Store

### Verificado por testing (iteration 87)
- 0 debug_token/debug_code/debug_link en respuestas
- 94% backend + 100% frontend
- Brevo email FUNCIONAL
- Notificaciones REALES

## Backlog
- P1: Deploy a producción (manoprotect.com)
- P1: Compilar APKs en Android Studio y subir a Play Store
- P1: Conectar streaming RTSP cámaras reales
- P2: GA4/Meta Pixel/Hotjar
- P2: iOS build (requiere Mac)
