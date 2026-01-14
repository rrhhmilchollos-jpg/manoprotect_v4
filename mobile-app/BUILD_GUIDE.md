# 🚀 Guía de Compilación - App Mano

## Configuración Completada ✅

- **Nombre de la App:** Mano
- **Dominio:** manoprotect.com
- **Package Android:** com.Manoprotect.Mano
- **Bundle iOS:** com.Manoprotect.Mano
- **Firebase Project:** manoprotect-f889b

---

## 📱 Compilar en tu Máquina Local

### Requisitos Previos

#### Para Android:
1. **Java JDK 17** - [Descargar](https://adoptium.net/)
2. **Android Studio** - [Descargar](https://developer.android.com/studio)
3. **Android SDK** (se instala con Android Studio)

#### Para iOS (solo en Mac):
1. **Xcode 14+** - Desde App Store
2. **CocoaPods** - `sudo gem install cocoapods`

---

## 🤖 Compilar para Android

### Paso 1: Clonar/Descargar el proyecto
```bash
# Descarga el proyecto de Emergent o usa git
cd ~/Desktop
# Copia la carpeta mobile-app desde Emergent
```

### Paso 2: Instalar dependencias
```bash
cd mobile-app
yarn install
```

### Paso 3: Compilar APK de debug
```bash
cd android
./gradlew assembleDebug
```

### Paso 4: Encontrar el APK
El APK estará en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Paso 5: Instalar en dispositivo
```bash
# Con dispositivo conectado por USB (debug habilitado)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🍎 Compilar para iOS (Solo Mac)

### Paso 1: Instalar dependencias
```bash
cd mobile-app
yarn install
cd ios
pod install
cd ..
```

### Paso 2: Abrir en Xcode
```bash
open ios/ManoTemp.xcworkspace
```

### Paso 3: Configurar en Xcode
1. Selecciona tu Team de desarrollo
2. Cambia el Bundle Identifier a `com.Manoprotect.Mano`
3. Selecciona tu dispositivo o simulador
4. Click en ▶️ Run

---

## 📦 Build para Producción

### Android - AAB para Play Store
```bash
cd android

# Crear keystore (solo primera vez)
keytool -genkeypair -v -storetype PKCS12 -keystore mano-release.keystore -alias mano -keyalg RSA -keysize 2048 -validity 10000

# Configurar en gradle.properties
echo "MANO_RELEASE_STORE_FILE=mano-release.keystore" >> gradle.properties
echo "MANO_RELEASE_KEY_ALIAS=mano" >> gradle.properties
echo "MANO_RELEASE_STORE_PASSWORD=tu_password" >> gradle.properties
echo "MANO_RELEASE_KEY_PASSWORD=tu_password" >> gradle.properties

# Build AAB
./gradlew bundleRelease
```

El archivo AAB estará en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### iOS - Archive para App Store
1. En Xcode: Product → Archive
2. Distribute App → App Store Connect
3. Subir a App Store Connect

---

## 🔥 Configuración Firebase (Ya incluida)

### Android ✅
- `google-services.json` ya configurado en `/android/app/`

### iOS (Pendiente)
1. Ve a [Firebase Console](https://console.firebase.google.com/project/manoprotect-f889b)
2. Añade app iOS con Bundle ID: `com.Manoprotect.Mano`
3. Descarga `GoogleService-Info.plist`
4. Colócalo en `/ios/Mano/`

---

## 🧪 Testing

### En emulador Android
```bash
# Inicia el emulador desde Android Studio
yarn android
```

### En simulador iOS
```bash
yarn ios
```

### En dispositivo físico
1. Conecta el dispositivo
2. Habilita modo desarrollador
3. `yarn android` o `yarn ios`

---

## 📋 Checklist Pre-Publicación

### Android
- [ ] Crear keystore de producción
- [ ] Configurar versionCode/versionName
- [ ] Añadir iconos de la app
- [ ] Añadir splash screen
- [ ] Probar en múltiples dispositivos
- [ ] Firmar y generar AAB

### iOS
- [ ] Configurar Apple Developer Account
- [ ] Añadir GoogleService-Info.plist
- [ ] Configurar Push Notifications (APNs)
- [ ] Añadir iconos de la app
- [ ] Crear provisioning profiles
- [ ] Archive y subir a App Store Connect

---

## 📞 Soporte

- **Documentación Firebase:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev/docs/getting-started
- **Mano Web:** https://manoprotect.com

---

Última actualización: Diciembre 2025
