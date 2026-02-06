# 📱 Guía de Compilación - ManoProtect Android

## Paso 1: Descargar el Proyecto

### Opción A: Desde Emergent.sh
1. Ve a tu proyecto en Emergent.sh
2. Pulsa **"Download Code"** o **"Export"**
3. Descarga el archivo ZIP
4. Descomprime en tu ordenador

### Opción B: Desde GitHub (si está sincronizado)
```bash
git clone https://github.com/tu-usuario/manoprotect.git
cd manoprotect
```

---

## Paso 2: Instalar Requisitos

### Instalar Node.js (v18+)
- Descarga de: https://nodejs.org/
- Verifica: `node --version`

### Instalar Java JDK 17
- Descarga de: https://adoptium.net/
- Configura `JAVA_HOME`

### Instalar Android Studio
1. Descarga de: https://developer.android.com/studio
2. Instala y abre Android Studio
3. Ve a **SDK Manager** → instala:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34
   - Android SDK Command-line Tools

---

## Paso 3: Configurar el Proyecto

### 3.1 Instalar dependencias del proyecto
```bash
cd mobile-app
yarn install
```

### 3.2 Configurar Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea proyecto "ManoProtect" (o usa el existente)
3. Añade app Android:
   - Package name: `com.manoprotect.app`
4. Descarga `google-services.json`
5. Copia a: `mobile-app/android/app/google-services.json`

### 3.3 Configurar variables de entorno
Crea archivo `mobile-app/.env`:
```
API_URL=https://tu-backend-url.com/api
```

---

## Paso 4: Abrir en Android Studio

1. Abre Android Studio
2. **File → Open**
3. Selecciona la carpeta: `mobile-app/android`
4. Espera a que Gradle sincronice (puede tardar 5-10 min)

---

## Paso 5: Probar la App (Debug)

### 5.1 Conectar dispositivo físico
1. Activa **Opciones de desarrollador** en tu Android
2. Activa **Depuración USB**
3. Conecta el móvil por USB
4. En Android Studio: verás el dispositivo en la barra superior

### 5.2 Ejecutar en modo debug
1. Selecciona tu dispositivo en la barra
2. Pulsa el botón **▶ Run**
3. Espera a que compile e instale

### 5.3 Probar el sistema SOS
1. Abre la app
2. Ve a **Ajustes → Probar Sistema SOS**
3. Pulsa **PROBAR SIRENA CRÍTICA**
4. ✅ Verifica que suena aunque esté en silencio

---

## Paso 6: Generar AAB para Google Play

### 6.1 Configurar firma (signing)
Edita `mobile-app/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'tu_password'
            keyAlias 'manoprotect'
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

### 6.2 Crear keystore (si no tienes)
```bash
keytool -genkey -v -keystore release.keystore -alias manoprotect -keyalg RSA -keysize 2048 -validity 10000
```

### 6.3 Generar AAB
```bash
cd mobile-app/android
./gradlew bundleRelease
```

El archivo estará en:
```
mobile-app/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Paso 7: Subir a Google Play Console

1. Ve a [Google Play Console](https://play.google.com/console)
2. Selecciona tu app "ManoProtect"
3. Ve a **Producción → Crear nueva versión**
4. Sube el archivo `.aab`
5. Completa la información:
   - Notas de versión
   - Capturas de pantalla
6. **Revisar y publicar**

---

## 🧪 Endpoints de Prueba

Mientras desarrollas, usa estos endpoints para probar:

### Simular flujo completo
```bash
curl https://tu-backend.com/api/sos-test/simulate-flow
```

### Crear alerta de prueba
```bash
curl -X POST https://tu-backend.com/api/sos-test/send-alert \
  -H "Content-Type: application/json" \
  -d '{"sender_name": "Ivan", "message": "Prueba"}'
```

### Confirmar alerta
```bash
curl -X POST https://tu-backend.com/api/sos-test/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "test_sos_xxx", "acknowledged_by": "Maria"}'
```

### Ver alertas activas
```bash
curl https://tu-backend.com/api/sos-test/alerts
```

---

## ⚠️ Problemas Comunes

### Error: "SDK location not found"
Crea archivo `mobile-app/android/local.properties`:
```
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk
```
(En Windows: `sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk`)

### Error: "Could not find google-services.json"
Asegúrate de que el archivo está en:
`mobile-app/android/app/google-services.json`

### Error de Gradle
```bash
cd mobile-app/android
./gradlew clean
./gradlew bundleRelease
```

### La sirena no suena en silencio
Verifica que tienes los permisos correctos en `AndroidManifest.xml`:
- `POST_NOTIFICATIONS`
- `VIBRATE`

---

## 📋 Checklist Final

Antes de subir a Google Play:

- [ ] `google-services.json` configurado
- [ ] Keystore creado y configurado
- [ ] AAB generado sin errores
- [ ] Probado en dispositivo real
- [ ] Sistema SOS funciona
- [ ] Mensajes dicen "aviso personal" (no "emergencia")
- [ ] Permisos mínimos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `adb logcat | grep ManoProtect`
2. Usa la pantalla de prueba en la app
3. Contacta soporte de Emergent.sh

¡Buena suerte! 🚀
