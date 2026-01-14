# 📱 MANO Protect - App Móvil

Aplicación móvil nativa para iOS y Android de MANO Protect - Plataforma de protección contra fraudes digitales.

## 🚀 Características

### Seguridad
- ✅ Autenticación biométrica (Face ID / Touch ID / Huella)
- ✅ Almacenamiento seguro de credenciales (Keychain)
- ✅ Sesiones seguras con JWT

### Protección
- ✅ Análisis de amenazas en tiempo real
- ✅ Escáner QR para detectar enlaces maliciosos
- ✅ Detección de phishing, smishing y vishing
- ✅ Alertas push instantáneas

### Familiar
- ✅ Protección para hasta 5 miembros
- ✅ Modo simplificado para mayores
- ✅ Panel de control familiar
- ✅ Alertas SOS de emergencia

### Bancario
- ✅ Monitoreo de transacciones
- ✅ Detección de fraude bancario
- ✅ Conexión con principales bancos españoles

## 📋 Requisitos

### Desarrollo
- Node.js >= 18
- Yarn
- React Native CLI
- Xcode 14+ (para iOS)
- Android Studio (para Android)

### Cuentas necesarias
- Apple Developer Account ($99/año) - para iOS
- Google Play Developer Account ($25 una vez) - para Android
- Firebase Project (gratis) - para push notifications

## 🛠 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd mobile-app

# Instalar dependencias
yarn install

# iOS
cd ios && pod install && cd ..

# Ejecutar en desarrollo
yarn ios    # Para iOS
yarn android    # Para Android
```

## 📁 Estructura del Proyecto

```
mobile-app/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── config/         # Configuración de la app
│   ├── context/        # Contextos de React (Auth, Notifications)
│   ├── hooks/          # Hooks personalizados
│   ├── navigation/     # Navegación (React Navigation)
│   ├── screens/        # Pantallas de la app
│   │   ├── auth/       # Pantallas de autenticación
│   │   └── ...         # Otras pantallas
│   ├── services/       # Servicios (API, biometría, etc.)
│   ├── types/          # Definiciones de TypeScript
│   └── utils/          # Utilidades
├── ios-config/         # Templates de configuración iOS
├── android-config/     # Templates de configuración Android
├── App.tsx             # Punto de entrada
└── package.json
```

## 🔧 Configuración

### 1. API Backend

Actualiza la URL del API en `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'https://tu-url-desarrollo.com/api'  // Desarrollo
  : 'https://tu-url-produccion.com/api'; // Producción
```

### 2. Firebase (Push Notifications)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Añade las apps iOS y Android
3. Descarga los archivos de configuración:
   - `GoogleService-Info.plist` → `ios/MANOProtect/`
   - `google-services.json` → `android/app/`

### 3. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
API_BASE_URL=https://tu-backend.com/api
```

## 📱 Pantallas

| Pantalla | Descripción |
|----------|-------------|
| Login | Inicio de sesión con email/contraseña y biometría |
| Register | Registro de nuevos usuarios |
| Home | Dashboard principal con estado de protección |
| Threats | Lista de amenazas detectadas |
| Family | Gestión de miembros familiares |
| Banking | Monitoreo de cuentas bancarias |
| Profile | Perfil y configuración del usuario |
| QRScanner | Escáner de códigos QR sospechosos |
| Settings | Ajustes de la aplicación |

## 🚀 Publicación

Consulta [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md) para instrucciones detalladas sobre cómo publicar en App Store y Google Play.

### Comandos de Build

```bash
# iOS - Build para producción
cd ios
xcodebuild -workspace MANOProtect.xcworkspace -scheme MANOProtect archive

# Android - Build para producción
cd android
./gradlew bundleRelease
```

## 🔒 Seguridad

- Las credenciales se almacenan en Keychain (iOS) / Keystore (Android)
- Las comunicaciones usan HTTPS exclusivamente
- Los tokens de sesión tienen expiración
- Biometría requerida para operaciones sensibles

## 🧪 Testing

```bash
# Ejecutar tests
yarn test

# Linting
yarn lint
```

## 📞 Soporte

- Email: dev@mano-protect.com
- Documentación: https://docs.mano-protect.com

## 📄 Licencia

Propietaria - MANO Security © 2024
