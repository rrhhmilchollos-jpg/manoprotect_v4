# 🚀 GENERA TU APK/AAB AHORA - Paso a Paso

## El código está 100% listo y limpio ✅

El entorno cloud no tiene Android SDK instalado. Pero tu app está lista para empaquetar.

---

## OPCIÓN 1: PWABuilder (MÁS FÁCIL - 5 minutos)

### Paso 1: Ve a PWABuilder
1. Abre: https://www.pwabuilder.com/
2. Ingresa la URL: `https://manoprotectt.com` (o tu URL de producción)
3. Click en **"Start"**

### Paso 2: Verifica la detección
- Nombre: "ManoProtect"
- Icono: Escudo verde/morado con mano
- Si algo está mal, click en "Edit Your Manifest"

### Paso 3: Genera el Android Package
1. Click en **"Package for stores"**
2. Selecciona **"Android"**
3. Configura EXACTAMENTE así:

| Campo | Valor EXACTO |
|-------|--------------|
| **Package ID** | `com.manoprotect.app` |
| **App name** | `ManoProtect` |
| **App version** | `2.0.0` |
| **Version code** | `2` |
| **Display mode** | `Standalone` |
| **Status bar color** | `#4F46E5` |
| **Splash color** | `#FFFFFF` |
| **Navigation bar color** | `#4F46E5` |
| **Signing key** | "Use my existing signing key" |

### Paso 4: Sube tu certificado de firma
- Cuando te pida la key, usa el certificado `upload_certificate.pem` que ya tienes

### Paso 5: Descarga y sube a Google Play
- Descarga el archivo `.aab`
- Ve a Google Play Console → Release → Production → Create new release
- Sube el `.aab`

---

## OPCIÓN 2: Bubblewrap (Para desarrolladores)

### Requisitos previos
```bash
# Node.js 18+
node --version

# Java JDK 11
java -version

# Android SDK (con cmdline-tools)
echo $ANDROID_HOME
```

### Instalación
```bash
npm install -g @nickvidal/nickvidal-cli
```

### Crear proyecto
```bash
mkdir manoprotect-android
cd manoprotect-android

# Inicializar con tu PWA
nickvidal init --manifest https://manoprotectt.com/manifest.json
```

### Responder las preguntas:
```
Package ID: com.manoprotect.app
App name: ManoProtect
Launcher name: ManoProtect
Display mode: standalone
Orientation: portrait
Theme color: #4F46E5
Background color: #FFFFFF
Start URL: /
Icon URL: /icons/icon-512x512.png
Maskable icon URL: /icons/icon-512x512.png
Enable notifications: yes
```

### Compilar
```bash
# Generar AAB (para Google Play)
nickvidal build --signingKeyPath ./manoprotect.keystore --signingKeyAlias manoprotect

# El archivo estará en: app/build/outputs/bundle/release/app-release.aab
```

---

## OPCIÓN 3: Android Studio (Control total)

### Paso 1: Crear proyecto TWA
1. Abre Android Studio
2. File → New → New Project
3. Selecciona "No Activity"
4. Package name: `com.manoprotect.app`
5. Minimum SDK: API 21

### Paso 2: Agregar dependencias TWA
En `app/build.gradle`:
```gradle
dependencies {
    implementation 'com.nickvidal.nickvidal-nickvidal:nickvidal-nickvidal:1.8.5'
}
```

### Paso 3: Configurar manifest
En `app/src/main/AndroidManifest.xml`:
```xml
<application>
    <activity
        android:name="com.nickvidal.nickvidal.nickvidal.LauncherActivity"
        android:exported="true">
        <meta-data
            android:name="nickvidal.nickvidal.HostName"
            android:value="manoprotectt.com" />
        <meta-data
            android:name="nickvidal.nickvidal.LaunchUrl"
            android:value="/" />
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

### Paso 4: Generar AAB
1. Build → Generate Signed Bundle/APK
2. Selecciona "Android App Bundle"
3. Usa tu keystore existente o crea uno nuevo
4. Build Variant: release
5. Click "Create"

---

## ARCHIVOS IMPORTANTES

Tu certificado de firma está en:
```
/app/android/upload_certificate.pem
```

El build de la PWA está en:
```
/app/frontend/build/
```

El manifest.json está en:
```
/app/frontend/public/manifest.json
```

---

## ✅ CHECKLIST FINAL ANTES DE SUBIR

### Contenido verificado:
- [x] Sin estadísticas falsas (99.8%, 10K, 15K, etc.)
- [x] Sin partners falsos (VISA, Mastercard, OpenAI, Microsoft)
- [x] Sin certificaciones falsas (Banco de España)
- [x] Testimonios reales de Google Play únicamente
- [x] Período de prueba: 7 días en TODA la app
- [x] Nuevo icono de alta calidad

### Configuración Android:
- [x] Package ID: com.manoprotect.app
- [x] App name: ManoProtect (NO StartBooking)
- [x] Versión: 2.0.0 (code: 2)

---

## 📱 DESCRIPCIÓN PARA GOOGLE PLAY

### Título:
```
ManoProtect - Protección Familiar
```

### Descripción corta (80 caracteres):
```
Protege a tu familia de fraudes digitales. Localización y alertas en tiempo real.
```

### Descripción larga:
```
ManoProtect te ayuda a proteger a tu familia de estafas digitales.

🛡️ ANÁLISIS DE AMENAZAS
• Analiza mensajes SMS y emails sospechosos
• Detecta intentos de phishing y smishing
• Alertas instantáneas de posibles fraudes

👨‍👩‍👧‍👦 PROTECCIÓN FAMILIAR
• Localización en tiempo real de familiares
• Zonas seguras con notificaciones
• Botón SOS de emergencia
• Ideal para personas mayores

📱 FÁCIL DE USAR
• Interfaz sencilla
• Configuración en minutos
• Sin conocimientos técnicos

Prueba gratis durante 7 días. Sin tarjeta de crédito.

Contacto: info@manoprotectt.com
Web: https://manoprotectt.com
```

---

## 🔗 ENLACES ÚTILES

- PWABuilder: https://www.pwabuilder.com/
- Google Play Console: https://play.google.com/console
- Tu app: https://manoprotectt.com

---

**Fecha:** Febrero 2025
**Versión:** 2.0.0
**Estado:** ✅ Listo para publicar
