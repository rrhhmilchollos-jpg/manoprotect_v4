# ManoProtect - PRD v10.1.0 (Producción)

## Sistema
Plataforma de seguridad profesional. Apps: Comerciales, Instaladores, Clientes (familias), Admin.
Tech: React + FastAPI + MongoDB + Brevo (email) + Stripe (pagos) + WebView Android

## URLs
- Producción: https://www.manoprotect.com
- Preview: https://crm-dashboard-213.preview.emergentagent.com
- DB: manoprotect_db

## Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| CEO/Admin | ceo@manoprotect.com | 19862210Des |
| Gestión Admin | admin@manoprotect.com | ManoAdmin2025! |
| Comercial | comercial@manoprotect.com | Comercial2025! |
| Instalador | instalador@manoprotect.com | Instalador2025! |

## API Endpoints Clave
| Grupo | Path | Descripción |
|-------|------|-------------|
| Health | GET /api/health | Estado del servicio |
| Auth CEO | POST /api/auth/login | Login principal |
| Gestión Auth | POST /api/gestion/auth/login | Login sistema gestión |
| Gestión Stock | GET/POST /api/gestion/stock | CRUD inventario |
| Gestión Pedidos | GET/POST /api/gestion/pedidos | CRUD pedidos |
| Gestión Instalaciones | GET/POST /api/gestion/instalaciones | CRUD instalaciones |
| Gestión Dashboard | GET /api/gestion/dashboard/stats | Estadísticas |
| Gestión Usuarios | GET/POST /api/gestion/usuarios | Admin usuarios |
| Familia Auth | POST /api/auth/familia/register | Registro familia |
| Familia Auth | POST /api/auth/familia/login | Login familia |
| Familia Auth | POST /api/auth/familia/request-password-reset | Reset password |
| Catálogo | GET /api/catalogo/comercial | Descarga PDF catálogo |

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
- Catálogo profesional PDF descargable
- Sistema de gestión CRA con roles (admin/comercial/instalador)

### Verificado por testing (iteration 88 - Pre-deploy)
- 0 debug_token/debug_code/debug_link en respuestas
- 95% backend + 100% frontend
- Brevo email FUNCIONAL
- RBAC verificado (comercial no puede acceder a /usuarios)
- JWT auth con 12h de expiración
- Catálogo PDF descargable verificado

## Estado de Issues
| Issue | Estado | Bloqueo |
|-------|--------|---------|
| Login producción | Pendiente redeploy | Usuario |
| CRA Desktop Sin Conexión | Pendiente redeploy | Usuario |
| CI/CD Play Store | Faltan secrets GitHub | Usuario |

## Backlog
- P0: Deploy a producción (manoprotect.com) - LISTO para deploy
- P1: Configurar CI/CD secrets en GitHub
- P1: Compilar APKs en Android Studio y subir a Play Store
- P1: Conectar streaming RTSP cámaras reales
- P2: GA4/Meta Pixel/Hotjar
- P2: iOS build (requiere Mac)
- P3: Activar integraciones (112 emergencias, BigQuery)
- P3: Videos marketing (Sora 2)
