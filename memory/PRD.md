# ManoProtect - PRD v10.2.0 (Producción)

## Sistema
Plataforma de seguridad profesional. Apps: Comerciales, Instaladores, Clientes (familias), Admin.
Tech: React + FastAPI + MongoDB + Brevo (email) + Stripe (pagos) + WebView Android/TWA

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
| Gestión Equipos | GET/POST /api/gestion/equipos | CRUD equipos de instalación |
| Asignar Equipo | PUT /api/gestion/instalaciones/{id}/asignar-equipo | Asignar equipo a instalación |
| Gestión Dashboard | GET /api/gestion/dashboard/stats | Estadísticas (incl. equipos) |
| Gestión Usuarios | GET/POST /api/gestion/usuarios | Admin usuarios |
| Familia Auth | POST /api/auth/familia/register | Registro familia |
| Familia Auth | POST /api/auth/familia/login | Login familia |
| Catálogo | GET /api/catalogo/comercial | Descarga PDF catálogo |

## Apps Play Store (v2.1.0, Build 4)
| App | Package | URL PWABuilder |
|-----|---------|----------------|
| Clientes | com.manoprotect.clientes | https://www.manoprotect.com/ |
| Comerciales | com.manoprotect.comerciales | https://www.manoprotect.com/pwa-comerciales.html |
| Instaladores | com.manoprotect.instaladores | https://www.manoprotect.com/pwa-instaladores.html |

## Funcionalidades Completadas

### Mar 6, 2026 - Equipos de Instalación + PWA
- Sistema de Equipos de Instalación (CRUD completo)
- Equipos de 1-N miembros (variable) asignables a instalaciones
- Panel de seguimiento: qué equipo realiza cada instalación
- Notificaciones a cada miembro del equipo al asignar
- Info del equipo visible en GestionAdmin y GestionInstaladores
- Dashboard actualizado con conteo de equipos
- PWA manifests y entry pages para 3 apps (Clientes, Comerciales, Instaladores)
- Guía completa para generar APKs con PWABuilder

### Anteriores
- Email real vía Brevo (recuperación de contraseña, bienvenida)
- Notificaciones en tiempo real (stock bajo, pedidos, asignaciones)
- Login familiar con familia_id
- 30+ endpoints API bajo /api/gestion/*
- Catálogo profesional PDF descargable
- Sistema de gestión CRA con roles (admin/comercial/instalador)

### Testing
- Iteration 89: 100% backend (19/19) + 100% frontend
- RBAC verificado (solo admin puede gestionar equipos)
- Sin debug tokens en producción

## Backlog
- P0: Deploy a producción (manoprotect.com)
- P0: Generar APKs con PWABuilder (guía en /app/GUIA_PWABUILDER_APK.md)
- P1: Configurar CI/CD secrets en GitHub
- P1: Conectar streaming RTSP cámaras reales
- P2: GA4/Meta Pixel/Hotjar
- P2: iOS build (requiere Mac)
- P3: Integraciones (112 emergencias, BigQuery)
- P3: Videos marketing (Sora 2)
