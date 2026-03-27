# Guia de Compilacion - ManoProtect (Android)

## Configuracion

- **Nombre de la App:** Mano
- **Dominio:** manoprotectt.com
- **Package Android:** com.Manoprotect.Mano
- **Firebase Project:** manoprotect-f889b

---

## Compilar en tu Maquina Local

### Requisitos Previos

1. **Java JDK 17** - [Descargar](https://adoptium.net/)
2. **Android Studio** - [Descargar](https://developer.android.com/studio)
3. **Android SDK** (se instala con Android Studio)
4. **Node.js >= 18** - [Descargar](https://nodejs.org/)
5. **Yarn** - `npm install -g yarn`

---

## Compilar para Android

### Paso 1: Clonar/Descargar el proyecto
```bash
cd ~/Desktop
# Copia la carpeta mobile-app desde Emergent o clona el repo
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
El APK estara en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Paso 5: Instalar en dispositivo
```bash
# Con dispositivo conectado por USB (debug habilitado)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Build para Produccion - AAB para Play Store

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

El archivo AAB estara en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Script de Compilacion Avanzado

Usa el script automatizado para compilar:
```bash
# Verificar entorno
./compilar-avanzado.sh --doctor

# Build AAB release
./compilar-avanzado.sh

# Build APK release
./compilar-avanzado.sh --apk

# Build debug
./compilar-avanzado.sh --debug

# Limpiar + Build AAB + APK
./compilar-avanzado.sh --all
```

---

## Configuracion Firebase

### Android
- `google-services.json` ya configurado en `/android/app/`

---

## Testing

### En emulador Android
```bash
# Inicia el emulador desde Android Studio
yarn android
```

### En dispositivo fisico
1. Conecta el dispositivo por USB
2. Habilita modo desarrollador y depuracion USB
3. `yarn android`

---

## Checklist Pre-Publicacion

- [ ] Crear keystore de produccion
- [ ] Configurar versionCode/versionName
- [ ] Anadir iconos de la app
- [ ] Anadir splash screen
- [ ] Probar en multiples dispositivos
- [ ] Firmar y generar AAB
- [ ] Subir a Google Play Console

---

## Soporte

- **Documentacion Firebase:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev/docs/getting-started
- **Mano Web:** https://manoprotectt.com

---

Ultima actualizacion: Febrero 2026
