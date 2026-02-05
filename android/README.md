# ManoProtect - Android Studio Project Configuration

Este directorio contiene la configuración para generar el proyecto Android Studio con AdMob nativo.

## Pasos para Generar APK/AAB

### 1. Descargar proyecto base de PWABuilder

```bash
# Opción 1: Usar PWABuilder web
# Ve a https://www.pwabuilder.com
# Ingresa: https://manoprotect.com
# Descarga "Android Studio Project"

# Opción 2: Usar Bubblewrap CLI
npm install -g @aspect-build/aspect-bubblewrap
bubblewrap init --manifest https://manoprotect.com/manifest.json
```

### 2. Configurar AdMob

1. Abre el proyecto en Android Studio
2. Añade en `app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:22.6.0'
}
```

3. Configura en `AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-7713974112203810~9265947358"/>
```

### 3. Código del Intersticial

Reemplaza `LauncherActivity.java` con el contenido de `LauncherActivity.java` en este directorio.

### 4. Generar AAB

```bash
cd android-project/
./gradlew bundleRelease
```

El AAB estará en `app/build/outputs/bundle/release/`

---

## Archivos en este directorio

- `LauncherActivity.java` - Activity con intersticial AdMob
- `strings.xml` - Strings de la app
- `colors.xml` - Colores de la app
- `build.gradle.example` - Ejemplo de build.gradle con AdMob

## IDs de AdMob

- **App ID**: `ca-app-pub-7713974112203810~9265947358`
- **Intersticial ID**: Crear en AdMob Console
- **Test ID (desarrollo)**: `ca-app-pub-3940256099942544/1033173712`
