# Guía de Compilación - ManoProtect TWA (Android)

## Descripción
Este proyecto es una **Trusted Web Activity (TWA)** que envuelve la aplicación web de ManoProtect (https://www.manoprotectt.com) en una aplicación nativa de Android.

## Requisitos Previos
- Java JDK 17 (recomendado: [Adoptium Temurin](https://adoptium.net/))
- Android Studio (opcional, pero útil para debugging)
- Git

## Estructura del Proyecto
```
manoprotect-twa/
├── app/
│   ├── build.gradle          # Configuración del módulo app
│   ├── proguard-rules.pro    # Reglas de ofuscación
│   ├── manoprotect-2025.keystore  # Keystore para firmar
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           ├── java/com/manoprotect/www/twa/
│           │   └── LauncherActivity.java
│           └── res/
│               ├── drawable/splash.xml
│               ├── mipmap-*/ic_launcher*.png
│               ├── values/colors.xml
│               ├── values/strings.xml
│               ├── values/styles.xml
│               └── xml/filepaths.xml
├── build.gradle              # Configuración raíz
├── gradle.properties         # Propiedades y credenciales
├── settings.gradle
├── gradlew                   # Script Unix
└── gradlew.bat              # Script Windows
```

## Compilación en Windows (PowerShell)

### Opción 1: Compilar AAB (Para Google Play)
```powershell
cd manoprotect-twa
.\gradlew.bat bundleRelease --no-daemon
```

El AAB se generará en:
```
manoprotect-twa\app\build\outputs\bundle\release\app-release.aab
```

### Opción 2: Compilar APK (Para pruebas)
```powershell
cd manoprotect-twa
.\gradlew.bat assembleRelease --no-daemon
```

El APK se generará en:
```
manoprotect-twa\app\build\outputs\apk\release\app-release.apk
```

## Compilación en Linux/macOS

```bash
cd manoprotect-twa
chmod +x gradlew
./gradlew bundleRelease --no-daemon
```

## Compilación con GitHub Actions

1. Haz push del código a tu repositorio en GitHub
2. Ve a **Actions** > **Build ManoProtect TWA - Android AAB**
3. Haz clic en **Run workflow**
4. Descarga el AAB desde los artifacts

## Configuración del Keystore

El keystore ya está incluido en el proyecto (`manoprotect-2025.keystore`).
Las credenciales están en `gradle.properties`:
- **Store Password**: 19862210Des
- **Key Alias**: manoprotect
- **Key Password**: 19862210Des

## Configuración de Digital Asset Links

Para que el TWA funcione correctamente sin mostrar la barra de navegación de Chrome, 
debes configurar el archivo `assetlinks.json` en tu servidor web.

Coloca este archivo en: `https://www.manoprotectt.com/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.manoprotect.www.twa",
    "sha256_cert_fingerprints": ["TU_SHA256_FINGERPRINT_AQUI"]
  }
}]
```

Para obtener el SHA256 fingerprint de tu keystore:
```bash
keytool -list -v -keystore app/manoprotect-2025.keystore -alias manoprotect
```

## Solución de Problemas

### Error: JAVA_HOME no está configurado
```powershell
# En Windows PowerShell:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### Error: Gradle cache corrupto
```powershell
Remove-Item -Recurse -Force ~\.gradle\caches
.\gradlew.bat clean
.\gradlew.bat bundleRelease --no-daemon
```

### Limpiar y recompilar
```powershell
.\gradlew.bat clean bundleRelease --no-daemon
```

## Versión
- **Version Name**: 2.1.0
- **Version Code**: 3
- **Package Name**: com.manoprotect.www.twa
- **URL**: https://www.manoprotectt.com
