# ManoProtect - Apps Multiplataforma

## Estructura del Proyecto

```
/app/mobile/
├── manoprotect/           # App móvil (Android/iOS) - Capacitor
│   ├── android/           # Proyecto Android nativo
│   ├── www/               # Assets web
│   ├── capacitor.config.json
│   ├── package.json
│   └── BUILD_GUIDE.md     # Guía detallada de compilación
│
└── manoprotect-desktop/   # App desktop (Windows/Mac/Linux) - Electron
    ├── main.js            # Código principal Electron
    ├── package.json
    └── assets/            # Iconos (añadir manualmente)
```

---

## URLs de Conexión

Todas las apps se conectan al mismo backend:

| Entorno | URL |
|---------|-----|
| Preview | https://twa-android-release.preview.emergentagent.com |
| Producción | [Tu dominio de producción] |

---

## Compilación Rápida

### Android APK (Debug)
```bash
cd /app/mobile/manoprotect
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```
**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Android AAB (Play Store)
```bash
cd /app/mobile/manoprotect/android
./gradlew bundleRelease
```
**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### iOS
```bash
cd /app/mobile/manoprotect
npx cap add ios
npx cap sync ios
npx cap open ios
# Compilar desde Xcode
```

### Windows (.exe)
```bash
cd /app/mobile/manoprotect-desktop
npm install
npm run build:win
```
**Output:** `dist/ManoProtect Setup.exe`

### macOS (.dmg)
```bash
cd /app/mobile/manoprotect-desktop
npm install
npm run build:mac
```
**Output:** `dist/ManoProtect.dmg`

### Linux (.AppImage)
```bash
cd /app/mobile/manoprotect-desktop
npm install
npm run build:linux
```
**Output:** `dist/ManoProtect.AppImage`

---

## Requisitos del Sistema

### Para compilar Android
- JDK 17+
- Android SDK 33+
- Android Studio (recomendado)

### Para compilar iOS
- macOS 12+
- Xcode 14+
- Apple Developer Account ($99/año)

### Para compilar Desktop
- Node.js 18+
- Para Windows: Windows 10+ o Wine en Linux/Mac
- Para macOS: macOS 10.15+
- Para Linux: Ubuntu 18.04+

---

## Publicación

### Google Play Store
1. Generar AAB firmado
2. Subir a Google Play Console
3. Completar ficha de la app
4. Enviar a revisión

### Apple App Store
1. Generar IPA desde Xcode
2. Subir a App Store Connect
3. Completar información
4. Enviar a revisión

### Microsoft Store
1. Generar MSIX package
2. Subir a Partner Center
3. Completar listado
4. Enviar a certificación

---

## Iconos Necesarios

### Android
- `mipmap-mdpi`: 48x48
- `mipmap-hdpi`: 72x72
- `mipmap-xhdpi`: 96x96
- `mipmap-xxhdpi`: 144x144
- `mipmap-xxxhdpi`: 192x192

### iOS
- 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Desktop
- `icon.ico`: 256x256 (Windows)
- `icon.icns`: 1024x1024 (macOS)
- `icon.png`: 512x512 (Linux)

---

## Soporte

Email: info@manoprotect.com
Web: https://manoprotect.com
