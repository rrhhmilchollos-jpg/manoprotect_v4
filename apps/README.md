# ManoProtect - Sistema de Apps Android para Google Play Store

## Arquitectura

```
/apps
├── comerciales/           # App Comerciales (Android)
│   ├── build.gradle       # Configuración de build
│   ├── version.properties # Control de versión automático
│   ├── google-services.json
│   ├── src/               # Código fuente
│   └── README.md
├── instaladores/          # App Instaladores (Android)
│   ├── build.gradle
│   ├── version.properties
│   ├── google-services.json
│   ├── src/
│   └── README.md
├── admin/                 # App Administración (Android)
│   ├── build.gradle
│   ├── version.properties
│   ├── google-services.json
│   ├── src/
│   └── README.md
├── scripts/               # Scripts de automatización
│   ├── build.sh           # Build automático APK/AAB
│   ├── deploy_playstore.sh # Deploy a Play Store
│   ├── rollback.sh        # Rollback a versión anterior
│   └── changelog_generator.sh # Genera changelog automático
├── ci/                    # CI/CD
│   └── main.yml           # GitHub Actions pipeline
├── logs/                  # Logs de builds, deploys, rollbacks
└── README.md              # Este archivo
```

## Credenciales por Rol

| Rol | Email | Password | App |
|-----|-------|----------|-----|
| Admin | admin@manoprotect.com | ManoAdmin2025! | /gestion/admin |
| Comercial | comercial@manoprotect.com | Comercial2025! | /gestion/comerciales |
| Instalador | instalador@manoprotect.com | Instalador2025! | /gestion/instaladores |

## Flujo Completo

### 1. Registro de nuevo empleado (Admin)
```bash
# Login como admin
curl -X POST https://manoprotect.com/api/gestion/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@manoprotect.com","password":"ManoAdmin2025!"}'

# Crear nuevo comercial
curl -X POST https://manoprotect.com/api/gestion/usuarios \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@manoprotect.com","password":"JuanPass2025!","rol":"comercial"}'
```

### 2. Login del comercial
```bash
curl -X POST https://manoprotect.com/api/gestion/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@manoprotect.com","password":"JuanPass2025!"}'
```

### 3. Crear pedido
```bash
curl -X POST https://manoprotect.com/api/gestion/pedidos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"cliente_nombre":"María García","cliente_telefono":"+34612345678","productos":[{"producto_id":"xxx","cantidad":2}]}'
```

### 4. Actualizar stock (Admin)
```bash
curl -X PUT https://manoprotect.com/api/gestion/stock/<PRODUCTO_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"cantidad_disponible":50}'
```

### 5. Completar instalación (Instalador)
```bash
curl -X PUT https://manoprotect.com/api/gestion/instalaciones/<ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"estado":"completado"}'
```

## Scripts

### Build
```bash
# Build una app
./scripts/build.sh comerciales release

# Build todas las apps
./scripts/build.sh all
```

### Deploy a Play Store
```bash
# Deploy a internal testing
./scripts/deploy_playstore.sh comerciales internal

# Deploy a producción
./scripts/deploy_playstore.sh all production
```

### Rollback
```bash
# Rollback a versión anterior
./scripts/rollback.sh comerciales
```

### Changelog
```bash
# Generar changelog
./scripts/changelog_generator.sh all
```

## CI/CD (GitHub Actions)

El pipeline se activa automáticamente al:
- Push a `main` o `develop` con cambios en `/apps`
- Crear un tag `v*`
- Ejecución manual desde GitHub

### Configurar Secrets en GitHub:
1. `KEYSTORE_BASE64`: Keystore codificado en base64
2. `KEYSTORE_PASSWORD`: Contraseña del keystore
3. `KEY_PASSWORD`: Contraseña de la clave
4. `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: JSON de cuenta de servicio
5. `MANOPROTECT_ADMIN_TOKEN`: Token JWT de admin para notificar backend

### Pipeline:
1. **Validate**: Verifica archivos y dependencias
2. **Build**: Compila AAB para cada app
3. **Deploy**: Sube a Play Store (solo en main/tags)
4. **Rollback**: Se ejecuta automáticamente si deploy falla
5. **Report**: Genera reporte de estado

## API Endpoints

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /api/gestion/auth/login | Login | Todos |
| GET | /api/gestion/auth/me | Usuario actual | Todos |
| GET | /api/gestion/dashboard/stats | Estadísticas | Todos |
| GET | /api/gestion/stock | Listar stock | Todos |
| POST | /api/gestion/stock | Crear producto | Admin |
| PUT | /api/gestion/stock/:id | Actualizar stock | Admin |
| DELETE | /api/gestion/stock/:id | Eliminar producto | Admin |
| GET | /api/gestion/pedidos | Listar pedidos | Filtrado |
| POST | /api/gestion/pedidos | Crear pedido | Comercial/Admin |
| PUT | /api/gestion/pedidos/:id | Actualizar pedido | Todos |
| GET | /api/gestion/instalaciones | Listar instalaciones | Filtrado |
| POST | /api/gestion/instalaciones | Crear instalación | Comercial/Admin |
| PUT | /api/gestion/instalaciones/:id | Actualizar estado | Todos |
| PUT | /api/gestion/instalaciones/:id/asignar | Asignar instalador | Admin |
| GET | /api/gestion/usuarios | Listar usuarios | Admin |
| POST | /api/gestion/usuarios | Crear usuario | Admin |
| PUT | /api/gestion/usuarios/:id | Actualizar usuario | Admin |
| DELETE | /api/gestion/usuarios/:id | Desactivar usuario | Admin |
| GET | /api/gestion/logs | Logs de auditoría | Admin |
| GET | /api/gestion/notificaciones | Notificaciones | Todos |
| PUT | /api/gestion/notificaciones/leer | Marcar leídas | Todos |
| GET | /api/gestion/app-versions | Versiones apps | Todos |
| POST | /api/gestion/app-versions/check | Check actualización | Público |
| PUT | /api/gestion/app-versions/:app | Actualizar versión | Admin |
