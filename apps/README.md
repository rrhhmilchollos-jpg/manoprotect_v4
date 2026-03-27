# ManoProtect - Apps Android para Google Play Store v2.1.0

## Apps disponibles

| App | Package ID | Versión | Descripción |
|-----|-----------|---------|-------------|
| **Comerciales** | com.manoprotectt.comerciales | 2.1.0 (Build 4) | Para el equipo comercial: stock, pedidos, clientes |
| **Instaladores** | com.manoprotect.instaladores | 2.1.0 (Build 4) | Para instaladores: órdenes, confirmación, manuales |
| **Clientes** | com.manoprotect.clientes | 2.1.0 (Build 4) | Para usuarios/familias: alarma, cámaras, SOS |

## Estructura

```
/apps
├── comerciales/           → App Comerciales
│   ├── build.gradle
│   ├── version.properties (2.1.0, build 4)
│   ├── google-services.json
│   ├── release.keystore
│   └── src/main/java/.../MainActivity.java
├── instaladores/          → App Instaladores
│   ├── build.gradle
│   ├── version.properties (2.1.0, build 4)
│   ├── google-services.json
│   ├── release.keystore
│   └── src/main/java/.../MainActivity.java
├── clientes/              → App Clientes (Familias)
│   ├── build.gradle
│   ├── version.properties (2.1.0, build 4)
│   ├── google-services.json
│   ├── release.keystore
│   └── src/main/java/.../MainActivity.java
├── admin/                 → App Administración
├── scripts/               → Scripts de automatización
│   ├── build.sh
│   ├── deploy_playstore.sh
│   ├── rollback.sh
│   └── changelog_generator.sh
├── ci/main.yml            → GitHub Actions CI/CD
└── logs/                  → Changelogs y logs de builds
```

## Novedades v2.1.0

### Comerciales
- Notificaciones en tiempo real (stock bajo, pedidos urgentes)
- Consulta de stock con alertas visuales
- Creación de presupuestos mejorada

### Instaladores
- Notificaciones push de nuevas asignaciones
- Actualización de estado en tiempo real
- Manuales de instalación integrados

### Clientes
- Nuevo sistema de login con ID de Familia
- Recuperación de contraseña por email real (Brevo)
- Panel de seguridad ManoConnect
- Botón SOS de emergencia

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@manoprotectt.com | ManoAdmin2025! |
| Comercial | comercial@manoprotectt.com | Comercial2025! |
| Instalador | instalador@manoprotectt.com | Instalador2025! |
| Clientes | Registro en /familia | ID Familia + email |

## Compilar APKs

### Requisitos
- Android Studio o Gradle CLI
- JDK 17+
- Android SDK 34

### Pasos
```bash
# Compilar una app específica
cd apps/comerciales
gradle assembleRelease

# O usar el script
./scripts/build.sh comerciales release
./scripts/build.sh instaladores release
./scripts/build.sh clientes release
```

### Ubicación de APKs generados
```
apps/comerciales/build/outputs/apk/release/app-release.apk
apps/instaladores/build/outputs/apk/release/app-release.apk
apps/clientes/build/outputs/apk/release/app-release.apk
```

## Subir a Play Store

```bash
# Deploy a internal testing
./scripts/deploy_playstore.sh comerciales internal

# Deploy a producción
./scripts/deploy_playstore.sh all production
```

## Keystore
- Archivo: `release.keystore` (manoprotect-2025.keystore)
- Alias: `manoprotect`
- Incluido en cada carpeta de app

## API Endpoints

Base URL: `https://www.manoprotectt.com/api`

### Autenticación Gestión
- POST `/gestion/auth/login` → Login JWT
- GET `/gestion/auth/me` → Usuario actual
- POST `/gestion/auth/refresh` → Renovar token

### Autenticación Familias (Clientes)
- POST `/auth/familia/register` → Registro familiar
- POST `/auth/familia/login` → Login con familia_id
- POST `/auth/familia/request-password-reset` → Solicitar reset (envía email real)
- POST `/auth/familia/reset-password` → Cambiar contraseña

### Gestión
- GET/POST/PUT/DELETE `/gestion/stock` → Inventario
- GET/POST/PUT `/gestion/pedidos` → Pedidos
- GET/POST/PUT `/gestion/instalaciones` → Instalaciones
- GET/POST/PUT/DELETE `/gestion/usuarios` → Usuarios (admin)
- GET `/gestion/logs` → Auditoría (admin)
- GET `/gestion/notificaciones` → Notificaciones
- GET/PUT `/gestion/app-versions` → Versiones de apps
- POST `/gestion/app-versions/check` → Check actualización (público)
