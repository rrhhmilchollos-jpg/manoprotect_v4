# ManoProtect - PRD (Product Requirements Document)

## Descripción General
ManoProtect es una aplicación de seguridad familiar con funciones de SOS de emergencia, seguimiento en tiempo real, y perfil de salud para emergencias.

**URL de Producción:** https://manoprotect.com
**URL de Preview:** https://safety-toolkit-1.preview.emergentagent.com

---

## Funcionalidades Implementadas

### 🆘 Sistema SOS de Emergencia
- Botón SOS de emergencia con ubicación en tiempo real
- Sirena de alerta integrada
- Grabación de audio durante emergencias
- Notificaciones automáticas a contactos de emergencia
- Envío de SMS y email al activar SOS

### 📍 Seguimiento Familiar
- Ubicación en tiempo real de familiares
- Historial de ubicaciones
- Zonas seguras personalizables
- Alertas al entrar/salir de zonas

### 🏥 Perfil de Salud (NUEVO - 02/02/2026)
- Grupo sanguíneo
- Alergias
- Condiciones crónicas
- Medicamentos actuales
- Información del médico
- Hospital preferido
- Notas de emergencia
- Donante de órganos
- **Endpoints:** `/api/health/profile`, `/api/health/emergency-card/{user_id}`
- **Frontend:** `/health-profile`

### 🎙️ Sistema de Audios (NUEVO - 02/02/2026)
- Carpetas individuales por usuario/familia
- Almacenamiento organizado en `/app/backend/uploads/audio/`
- Panel de administración para supervisión
- **Endpoints:** `/api/audio/upload`, `/api/audio/list`, `/api/admin/audio/*`
- **Frontend:** `/admin/audios`

### 📱 Gestión de Dispositivos e IPs (NUEVO - 02/02/2026)
- Registro de dispositivos por usuario
- Bloqueo de IPs sospechosas
- Bloqueo de dispositivos
- Historial de actividad por IP
- **Endpoints:** `/api/device/*`, `/api/admin/device/*`
- **Frontend:** `/admin/devices`

### 👥 Panel de Administración de Usuarios (NUEVO - 02/02/2026)
- Lista completa de usuarios
- Cambio de planes (Free/Premium/Enterprise)
- Cambio de roles (User/Admin/Superadmin)
- Activar/Desactivar cuentas
- Eliminación de usuarios
- **Endpoints:** `/api/admin/users`, `/api/admin/users/{user_id}`
- **Frontend:** `/admin/users`

### 🗑️ Eliminación de Cuenta (NUEVO - 02/02/2026)
- Página informativa de eliminación
- Proceso manual (contactar soporte)
- Botón deshabilitado por seguridad
- **Frontend:** `/delete-account`
- **Endpoint:** `/api/auth/delete-account-request`

### 💳 Pagos
- Integración con Stripe
- Planes: Free, Basic, Premium, Enterprise

### 🔐 Autenticación
- Login con email/contraseña
- Cuenta de prueba para Google: `reviewer@manoprotect.com` / `ReviewMano2025!`

---

## Arquitectura Técnica

### Backend (FastAPI)
```
/app/backend/
├── server.py                    # Servidor principal
├── routes/
│   ├── auth_routes.py           # Autenticación
│   ├── admin_routes.py          # Gestión de usuarios (NUEVO)
│   ├── health_routes.py         # Perfil de salud (NUEVO)
│   ├── audio_routes.py          # Almacenamiento de audios (NUEVO)
│   ├── device_routes.py         # Gestión de dispositivos (NUEVO)
│   ├── family_sos_routes.py     # SOS y familia
│   └── payments_routes.py       # Pagos Stripe
├── uploads/
│   └── audio/                   # Carpetas de audio por usuario (NUEVO)
└── .env                         # Variables de entorno
```

### Frontend (React)
```
/app/frontend/src/
├── pages/
│   ├── DeleteAccount.js         # Eliminación de cuenta (NUEVO)
│   ├── AdminUsers.js            # Panel admin usuarios (NUEVO)
│   ├── AdminAudios.js           # Panel admin audios (NUEVO)
│   ├── AdminDevices.js          # Panel admin dispositivos (NUEVO)
│   ├── HealthProfile.js         # Perfil de salud (NUEVO)
│   ├── SOSEmergency.js          # Pantalla SOS
│   └── LandingPage.js           # Página principal
└── App.js                       # Rutas
```

---

## Rutas de Admin (Solo para superadmin/admin)

| Ruta | Descripción |
|------|-------------|
| `/admin/users` | Gestión de usuarios |
| `/admin/audios` | Supervisión de audios SOS |
| `/admin/devices` | Control de IPs y dispositivos |

---

## Google Play Store - Estado

### ✅ Completado
- [x] Ficha de Play Store configurada
- [x] Icono 512x512
- [x] Screenshots (teléfono, tablet, Chromebook, XR)
- [x] Descripción corta y larga
- [x] Clasificación de contenido (PEGI 3)
- [x] Política de privacidad
- [x] Seguridad de datos
- [x] Audiencia objetivo (16+)
- [x] Categoría: Herramientas
- [x] Países: 177 seleccionados
- [x] App Bundle subido (1.0.0.0)
- [x] Credenciales de prueba para revisores

### ⏳ Pendiente
- [ ] Verificación de cuenta de desarrollador (Google está verificando)
- [ ] Aprobación final de Google
- [ ] Publicación en producción

---

## Credenciales

### Cuenta de prueba para Google Play Review
- **Email:** reviewer@manoprotect.com
- **Password:** ReviewMano2025!
- **Plan:** Premium

### Superadmin
- **Email:** info@manoprotect.com
- **Password:** 19862210Des

---

## Assets de Google Play Store

Todos disponibles en:
- Icono: `/app/frontend/public/manoprotect_icon_512x512.png`
- Feature: `/app/frontend/public/manoprotect_feature_1024x500.png`
- Screenshots teléfono: `/app/frontend/public/screenshot_phone_*.png`
- Screenshots tablet 7": `/app/frontend/public/tablet7_*.png`
- Screenshots tablet 10": `/app/frontend/public/tablet10_*.png`
- Screenshots Chromebook: `/app/frontend/public/chromebook_*.png`
- Screenshots Android XR: `/app/frontend/public/androidxr_*.png`

---

## Próximos Pasos

1. **Esperar verificación de Google** (1-7 días)
2. **Publicar en Google Play** cuando aprueben la cuenta
3. **Generar .aab para iOS** con PWABuilder para App Store
4. **Completar sistema ManoBank** (rutas desconectadas)

---

## Última actualización: 02/02/2026
