# 🤖 Compilar APK/AAB de ManoProtect

El servidor actual es ARM64 y no puede compilar APKs nativos. Aquí tienes 3 opciones:

---

## Opción 1: Compilar en tu PC (Recomendado)

### Requisitos
- Windows/Mac/Linux
- Java JDK 17
- Android Studio (opcional pero útil)

### Pasos

1. **Descarga el proyecto Android:**
   ```
   https://ios-release-preview-1.preview.emergentagent.com/ManoProtect-Android-Project.zip
   ```

2. **Extrae el ZIP** en una carpeta

3. **Abre terminal/CMD en esa carpeta:**
   ```bash
   cd ManoProtect-Android-Project/android
   ```

4. **Configura el SDK:**
   Edita `local.properties` y añade:
   ```
   sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
   ```
   (En Mac: `sdk.dir=/Users/TuUsuario/Library/Android/sdk`)

5. **Compila el APK (instalación directa):**
   ```bash
   # Windows
   gradlew.bat assembleRelease
   
   # Mac/Linux
   ./gradlew assembleRelease
   ```
   
   El APK estará en: `app/build/outputs/apk/release/app-release-unsigned.apk`

6. **Compila el AAB (Play Store):**
   ```bash
   # Windows
   gradlew.bat bundleRelease
   
   # Mac/Linux  
   ./gradlew bundleRelease
   ```
   
   El AAB estará en: `app/build/outputs/bundle/release/app-release.aab`

---

## Opción 2: Usar Android Studio

1. Descarga e instala [Android Studio](https://developer.android.com/studio)
2. Abre el proyecto (`File > Open > selecciona carpeta android`)
3. Espera a que sincronice Gradle
4. `Build > Generate Signed Bundle/APK`
5. Sigue el asistente

---

## Opción 3: Usar PWA Builder (Sin compilar)

1. Ve a [pwabuilder.com](https://www.pwabuilder.com/)
2. Ingresa: `https://www.manoprotect.com`
3. Click en "Package for stores" > "Android"
4. Descarga el AAB generado automáticamente

⚠️ **Nota**: Requiere que hagas Redeploy primero para que los assets PWA estén en producción.

---

## Firmar el APK (para instalación)

Si el APK no está firmado, necesitas firmarlo:

```bash
# Generar keystore (solo primera vez)
keytool -genkey -v -keystore manoprotect.keystore -alias manoprotect -keyalg RSA -keysize 2048 -validity 10000

# Firmar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore manoprotect.keystore app-release-unsigned.apk manoprotect

# Alinear APK
zipalign -v 4 app-release-unsigned.apk ManoProtect.apk
```

---

## Keystore existente

Ya hay un keystore generado en el proyecto:
- **Ubicación**: `android/keystores/manoprotect-release.keystore`
- **Alias**: `manoprotect`
- **Password**: `ManoProtect2024!`

Para usar este keystore en la compilación, crea `android/keystore.properties`:
```properties
storeFile=keystores/manoprotect-release.keystore
storePassword=ManoProtect2024!
keyAlias=manoprotect
keyPassword=ManoProtect2024!
```

---

## Resultado final

| Archivo | Uso |
|---------|-----|
| `app-release.apk` | Instalación directa en móvil |
| `app-release.aab` | Subir a Google Play Console |
