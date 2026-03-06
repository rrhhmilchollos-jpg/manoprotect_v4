# ManoProtect - PRD v10.3.0 (Producción)

## Sistema
Plataforma de seguridad profesional. Apps: Comerciales, Instaladores, Clientes (familias), Admin.
Tech: React + FastAPI + MongoDB + Brevo (email) + Stripe (pagos) + bcrypt auth

## URLs Producción
- Landing: https://www.manoprotect.com/
- Login Familia: https://www.manoprotect.com/familia
- Gestión Login: https://www.manoprotect.com/gestion/login
- Admin Panel: https://www.manoprotect.com/gestion/admin
- Comerciales Panel: https://www.manoprotect.com/gestion/comerciales
- Instaladores Panel: https://www.manoprotect.com/gestion/instaladores

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO/Admin | ceo@manoprotect.com | 19862210Des |
| Gestión Admin | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## Funcionalidades Completadas

### Mar 6, 2026 - Auth Fix + SEO Optimization
- Migración auth gestión: SHA256 -> bcrypt (seguridad)
- Compatibilidad retroactiva: soporta SHA256 legacy + auto-upgrade a bcrypt
- Auto-seed en startup: usuarios gestión se crean/actualizan automáticamente
- Mensajes de error específicos: "Contraseña incorrecta", "Usuario no encontrado", "Usuario desactivado"
- GA4 activado (G-8KECMQS45X)
- GTM activo (GTM-MK53XZ8Q)
- Meta descriptions consistentes (og, twitter, main)
- robots.txt: /gestion/ bloqueado, /familia permitida
- sitemap.xml: 25 URLs con schema image
- Digital Asset Links para TWA (assetlinks.json)
- Teléfono Schema.org corregido formato E.164
- DC.coverage enfocado a España
- Keywords alineadas con servicio real (alarmas, CRA, no "fraud prevention")

### Mar 6, 2026 - Equipos de Instalación + PWA
- CRUD equipos (1-N miembros), asignación a instalaciones
- Notificaciones a miembros, dashboard con conteo
- PWA manifests con IDs estables para 3 apps

### Testing
- Iteration 90: 95% backend + 100% frontend
- Iteration 89: 100% backend + 100% frontend

## Backlog
- P0: Deploy a producción
- P0: Generar APKs con PWABuilder
- P1: Streaming RTSP cámaras reales
- P2: Meta Pixel ID + Hotjar ID + Google Search Console verification
- P2: iOS con Capacitor
- P3: Integraciones 112, BigQuery, Sora 2
