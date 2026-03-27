# ManoProtect Mobile App - Guía de Compilación

## Requisitos

### Para Android (.apk y .aab)
- Android Studio 2022.1+
- JDK 17
- Android SDK 33+
- Gradle 8.0+

### Para iOS (.ipa)
- macOS 12+
- Xcode 14+
- Apple Developer Account
- CocoaPods

### Para Desktop (Windows/Mac/Linux)
- Electron Builder
- Node.js 18+

---

## Compilación Android

### 1. Clonar y preparar
```bash
cd /app/mobile/manoprotect
npm install
npx cap sync android
```

### 2. Generar APK de Debug
```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Generar APK de Release
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### 4. Generar AAB para Play Store
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Firmar APK para producción
Crear keystore:
```bash
keytool -genkey -v -keystore manoprotect-release.keystore -alias manoprotect -keyalg RSA -keysize 2048 -validity 10000
```

Configurar en `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file("manoprotect-release.keystore")
        storePassword "YOUR_PASSWORD"
        keyAlias "manoprotect"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

---

## Compilación iOS

### 1. Añadir plataforma iOS
```bash
cd /app/mobile/manoprotect
npx cap add ios
npx cap sync ios
```

### 2. Abrir en Xcode
```bash
npx cap open ios
```

### 3. Configurar en Xcode
- Seleccionar Team (Apple Developer Account)
- Configurar Bundle Identifier: `com.manoprotect.app`
- Seleccionar provisioning profile

### 4. Compilar
- Product → Archive
- Distribute App → App Store Connect

---

## Compilación Desktop (Electron)

### 1. Instalar Electron
```bash
npm install electron electron-builder --save-dev
```

### 2. Configurar package.json
```json
{
  "build": {
    "appId": "com.manoprotect.desktop",
    "productName": "ManoProtect",
    "mac": {
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### 3. Compilar
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

---

## Subir a Play Store

### 1. Preparar AAB
- Compilar con `./gradlew bundleRelease`
- Firmar con keystore de producción

### 2. Google Play Console
1. Ir a https://play.google.com/console
2. Crear aplicación
3. Configurar ficha de Play Store
4. Subir AAB en "Producción"
5. Completar cuestionarios de contenido
6. Enviar a revisión

### 3. Información requerida
- Nombre: ManoProtect
- Descripción corta: Protección contra fraudes digitales
- Descripción larga: [Ver descripción en assets]
- Capturas de pantalla: Mínimo 2 por tipo de dispositivo
- Icono: 512x512 PNG
- Gráfico destacado: 1024x500 PNG
- Categoría: Herramientas / Seguridad

---

## Subir a App Store

### 1. Preparar IPA
- Compilar en Xcode
- Archive → Distribute

### 2. App Store Connect
1. Ir a https://appstoreconnect.apple.com
2. Crear nueva app
3. Configurar información
4. Subir build desde Xcode
5. Enviar a revisión

---

## URLs de Producción

Cuando despliegues a producción, actualiza `capacitor.config.json`:

```json
{
  "server": {
    "url": "https://tu-dominio-produccion.com"
  }
}
```

---

## Contacto

Para soporte técnico: info@manoprotectt.com
