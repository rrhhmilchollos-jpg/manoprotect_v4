# ManoBank - App Android

## 📱 Descripción
App híbrida de ManoBank S.A. para Android, construida con Capacitor.

## 🔧 Requisitos para Compilar

### En tu ordenador necesitas instalar:
1. **Node.js** (v16 o superior) - https://nodejs.org/
2. **Android Studio** - https://developer.android.com/studio
3. **Java JDK 17** - Se instala con Android Studio

### Configuración de Android Studio:
1. Abre Android Studio
2. Ve a **Tools > SDK Manager**
3. Instala **Android SDK 33** (Android 13)
4. Ve a **Tools > SDK Manager > SDK Tools**
5. Instala **Android SDK Build-Tools 33**

## 🚀 Pasos para Compilar la APK

### 1. Clonar/Descargar el proyecto
```bash
# Si tienes el repo en GitHub
git clone <tu-repo>
cd mobile/manobank
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Sincronizar con Android
```bash
npx cap sync android
```

### 4. Abrir en Android Studio
```bash
npx cap open android
```

### 5. Compilar APK Debug (para pruebas)
En Android Studio:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- La APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

O desde terminal:
```bash
cd android
./gradlew assembleDebug
```

### 6. Compilar APK Release (para Play Store)

#### Primero, generar keystore (solo una vez):
```bash
keytool -genkey -v -keystore manobank-release.keystore -alias manobank -keyalg RSA -keysize 2048 -validity 10000
```

#### Configurar signing en `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('manobank-release.keystore')
            storePassword 'tu_password'
            keyAlias 'manobank'
            keyPassword 'tu_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Compilar Release:
```bash
cd android
./gradlew assembleRelease
```
La APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

## 📋 Subir a Google Play Store

### Requisitos:
1. **Cuenta de desarrollador** - https://play.google.com/console/ (25€ único pago)
2. **APK firmada** (release)
3. **Capturas de pantalla** de la app
4. **Icono** 512x512 px
5. **Política de privacidad** (URL)
6. **Descripción** de la app

### Pasos:
1. Ir a Google Play Console
2. Crear nueva aplicación
3. Completar la ficha de la app
4. Subir el APK/AAB
5. Enviar para revisión

## 🎨 Personalización

### Cambiar icono de la app:
Reemplaza los archivos en:
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Cambiar URL de la web:
Edita `capacitor.config.json`:
```json
{
  "server": {
    "url": "https://tu-nueva-url.com"
  }
}
```

## 🔗 URLs de Producción

- **ManoBank Web:** https://smart-banking-36.preview.emergentagent.com
- **App ID:** com.manobank.app
- **Versión:** 1.0.0

## 📞 Soporte
- Email: rrhh.milchollos@gmail.com
- Web: https://manobank.es
