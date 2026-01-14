# MANO Mobile App

App móvil nativa para iOS y Android - Plataforma de protección contra fraudes digitales.

## 🚀 Características

- ✅ **Autenticación biométrica** (Face ID / Touch ID / Huella)
- ✅ **Escáner QR** para detectar enlaces maliciosos
- ✅ **Dashboard de protección** en tiempo real
- ✅ **Panel familiar** para proteger a mayores
- ✅ **Integración bancaria** para monitorear transacciones
- ✅ **Notificaciones push** de alertas
- ✅ **Acceso a contactos** para emergencias
- ✅ **Botón SOS** de emergencia

## 📱 Requisitos

### iOS
- macOS con Xcode 14+
- CocoaPods
- Apple Developer Account ($99/año para App Store)

### Android
- Android Studio
- JDK 11+
- Google Play Developer Account ($25 única vez)

## 🛠️ Instalación

```bash
# Instalar dependencias
cd mobile-app
npm install
# o
yarn install

# iOS - Instalar pods
cd ios && pod install && cd ..

# Ejecutar en iOS
npx react-native run-ios

# Ejecutar en Android
npx react-native run-android
```

## 📦 Estructura del Proyecto

```
mobile-app/
├── App.tsx                 # Entry point
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── context/            # Context providers (Auth, Notifications)
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # Pantallas de la app
│   │   ├── auth/           # Login, Register, ForgotPassword
│   │   ├── HomeScreen.tsx
│   │   ├── ThreatsScreen.tsx
│   │   ├── FamilyScreen.tsx
│   │   ├── BankingScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── QRScannerScreen.tsx
│   ├── services/           # API y servicios
│   │   ├── api.ts          # Cliente API
│   │   ├── biometrics.ts   # Face ID / Touch ID
│   │   ├── notifications.ts # Push notifications
│   │   ├── qrScanner.ts    # Análisis de QR
│   │   └── contacts.ts     # Acceso a contactos
│   └── utils/              # Utilidades
├── ios/                    # Proyecto nativo iOS
└── android/                # Proyecto nativo Android
```

## 🔧 Configuración

### API Backend
Editar `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://tu-dominio.com/api';
```

### Firebase (Push Notifications)
1. Crear proyecto en Firebase Console
2. Añadir `google-services.json` a `android/app/`
3. Añadir `GoogleService-Info.plist` a `ios/`

### Biometrics
Los permisos ya están configurados en los proyectos nativos.

## 📤 Publicación

### App Store (iOS)
1. Configurar certificados en Apple Developer Portal
2. Crear App ID y Provisioning Profile
3. Build: `npx react-native run-ios --configuration Release`
4. Archivar en Xcode y subir a App Store Connect

### Google Play (Android)
1. Generar keystore de firma
2. Build: `cd android && ./gradlew bundleRelease`
3. Subir AAB a Google Play Console

## 🔐 Seguridad

- Credenciales almacenadas en Keychain (iOS) / Keystore (Android)
- Comunicación HTTPS obligatoria
- Tokens de sesión con expiración
- Validación de certificados SSL

## 📞 Soporte

Para soporte técnico, contactar: support@mano-protect.com
