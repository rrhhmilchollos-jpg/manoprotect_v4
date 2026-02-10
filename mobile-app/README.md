# MANO Protect - App Movil (Android)

Aplicacion movil nativa para Android de MANO Protect - Plataforma de proteccion contra fraudes digitales.

## Caracteristicas

### Seguridad
- Autenticacion biometrica (Huella digital)
- Almacenamiento seguro de credenciales (Android Keystore)
- Sesiones seguras con JWT

### Proteccion
- Analisis de amenazas en tiempo real
- Escaner QR para detectar enlaces maliciosos (Vision Camera)
- Deteccion de phishing, smishing y vishing
- Alertas push instantaneas

### Familiar
- Proteccion para hasta 5 miembros
- Modo simplificado para mayores
- Panel de control familiar
- Alertas SOS de emergencia

### Bancario
- Monitoreo de transacciones
- Deteccion de fraude bancario
- Conexion con principales bancos espanoles

## Requisitos

### Desarrollo
- Node.js >= 18
- Yarn
- React Native CLI
- Android Studio
- JDK 17

### Cuentas necesarias
- Google Play Developer Account ($25 una vez) - para Android
- Firebase Project (gratis) - para push notifications

## Instalacion

```bash
# Clonar el repositorio
git clone <repo-url>
cd mobile-app

# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn android
```

## Estructura del Proyecto

```
mobile-app/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── config/         # Configuracion de la app
│   ├── context/        # Contextos de React (Auth, Notifications)
│   ├── hooks/          # Hooks personalizados
│   ├── navigation/     # Navegacion (React Navigation)
│   ├── screens/        # Pantallas de la app
│   │   ├── auth/       # Pantallas de autenticacion
│   │   └── ...         # Otras pantallas
│   ├── services/       # Servicios (API, biometria, etc.)
│   ├── types/          # Definiciones de TypeScript
│   └── utils/          # Utilidades
├── android/            # Proyecto nativo Android
├── android-config/     # Templates de configuracion Android
├── App.tsx             # Punto de entrada
└── package.json
```

## Configuracion

### 1. API Backend

Actualiza la URL del API en `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'https://tu-url-desarrollo.com/api'  // Desarrollo
  : 'https://tu-url-produccion.com/api'; // Produccion
```

### 2. Firebase (Push Notifications)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Anade la app Android
3. Descarga `google-services.json` y colocalo en `android/app/`

### 3. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
API_BASE_URL=https://tu-backend.com/api
```

## Pantallas

| Pantalla | Descripcion |
|----------|-------------|
| Login | Inicio de sesion con email/contrasena y biometria |
| Register | Registro de nuevos usuarios |
| Home | Dashboard principal con estado de proteccion |
| Threats | Lista de amenazas detectadas |
| Family | Gestion de miembros familiares |
| Banking | Monitoreo de cuentas bancarias |
| Profile | Perfil y configuracion del usuario |
| QRScanner | Escaner de codigos QR sospechosos |
| Settings | Ajustes de la aplicacion |

## Publicacion

Consulta [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md) para instrucciones detalladas sobre como publicar en Google Play.

### Comandos de Build

```bash
# Build APK debug
cd android && ./gradlew assembleDebug

# Build APK release
cd android && ./gradlew assembleRelease

# Build AAB para Google Play
cd android && ./gradlew bundleRelease
```

## Seguridad

- Las credenciales se almacenan en Android Keystore
- Las comunicaciones usan HTTPS exclusivamente
- Los tokens de sesion tienen expiracion
- Biometria requerida para operaciones sensibles

## Testing

```bash
# Ejecutar tests
yarn test

# Linting
yarn lint
```

## Soporte

- Email: dev@mano-protect.com
- Documentacion: https://docs.mano-protect.com

## Licencia

Propietaria - MANO Security 2024
