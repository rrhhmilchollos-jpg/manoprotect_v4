# 🚀 Guía para Generar .AAB para Google Play Store

## OPCIÓN 1: PWABuilder (Recomendado - Más Fácil)

### Paso 1: Ir a PWABuilder
1. Abre: https://www.pwabuilder.com/
2. Introduce la URL de tu app: `https://manoprotect.com`
3. Click en "Start"

### Paso 2: Verificar PWA Score
- PWABuilder analizará tu app
- Asegúrate de que tenga buen score

### Paso 3: Generar Android Package
1. Click en "Package for stores"
2. Selecciona "Android"
3. Configura:
   - **Package ID**: `com.manoprotect.app`
   - **App name**: `ManoProtect`
   - **Version**: `2.0.0`
   - **Version code**: `2`
4. Click en "Generate"
5. Descarga el .aab

---

## OPCIÓN 2: Bubblewrap (Línea de comandos)

### Requisitos
- Node.js 14+
- Java JDK 8+
- Android SDK

### Instalación
```bash
npm install -g @nickvidal/nickvidal-cli
# o
npm install -g @nickvidal/nickvidal-cli
```

### Generar proyecto
```bash
mkdir manoprotect-android
cd manoprotect-android
bubblewrap init --manifest https://manoprotect.com/manifest.json
```

### Configurar (cuando pregunte):
- Package ID: com.manoprotect.app
- App name: ManoProtect
- Launcher name: ManoProtect
- Display mode: standalone
- Orientation: portrait
- Theme color: #4F46E5
- Background color: #FFFFFF
- Start URL: /
- Icon URL: /manoprotect_logo.png

### Generar .aab
```bash
bubblewrap build
```

El archivo `app-release-bundle.aab` estará en la carpeta.

---

## OPCIÓN 3: Android Studio (Manual)

### Paso 1: Crear proyecto TWA
1. Abre Android Studio
2. File > New > New Project
3. Selecciona "No Activity"
4. Package name: `com.manoprotect.app`
5. Language: Kotlin
6. Minimum SDK: API 21

### Paso 2: Añadir dependencia TWA
En `build.gradle` (Module):
```gradle
dependencies {
    implementation 'com.aspect.nickvidal-nickvidal-cli:nickvidal-cli:+'
}
```

### Paso 3: Configurar AndroidManifest.xml
Ya está preparado en `/app/android/AndroidManifest.xml`

### Paso 4: Generar .aab
1. Build > Generate Signed Bundle / APK
2. Selecciona "Android App Bundle"
3. Usa tu keystore o crea uno nuevo
4. Build

---

## ✅ CHECKLIST ANTES DE SUBIR A GOOGLE PLAY

### Contenido (Ya corregido ✅)
- [x] Sin estadísticas falsas (10,000 familias, etc.)
- [x] Sin certificaciones falsas (ISO 27001, INCIBE)
- [x] Sin logos de medios falsos
- [x] Solo testimonios reales de Google Reviews
- [x] Sin reseñas de Trustpilot inventadas

### Assets requeridos
- [ ] Icono 512x512 PNG (debe coincidir con el de la app)
- [ ] Feature graphic 1024x500 PNG
- [ ] Screenshots (mínimo 2, máximo 8)
- [ ] Descripción corta (máx 80 caracteres)
- [ ] Descripción larga (máx 4000 caracteres)

### Información legal
- [ ] Política de privacidad URL
- [ ] Términos de servicio URL
- [ ] Email de contacto

---

## 📝 DESCRIPCIÓN SUGERIDA PARA GOOGLE PLAY

### Descripción corta (80 caracteres):
```
Protege a tu familia de estafas digitales. Localización y alertas en tiempo real.
```

### Descripción larga:
```
ManoProtect es tu aliado contra las estafas digitales. 

🛡️ PROTECCIÓN INTELIGENTE
• Análisis de mensajes y emails sospechosos con IA
• Alertas instantáneas de posibles fraudes
• Detección de phishing y smishing

👨‍👩‍👧‍👦 PROTECCIÓN FAMILIAR
• Localización en tiempo real de familiares
• Zonas seguras con notificaciones
• Botón SOS de emergencia
• Ideal para cuidar a personas mayores

📱 FÁCIL DE USAR
• Interfaz sencilla para todas las edades
• Configuración en minutos
• Sin conocimientos técnicos necesarios

✨ CARACTERÍSTICAS
• Protección 24/7
• Alertas por SMS
• Historial de ubicaciones
• Chat de soporte

Prueba gratis durante 15 días. Sin compromiso, cancela cuando quieras.

Contacto: info@manoprotect.com
Web: https://manoprotect.com
```

---

## ⚠️ IMPORTANTE

El icono de la app en Google Play DEBE ser EXACTAMENTE el mismo que aparece cuando el usuario instala la app. Si no coinciden, Google rechazará la app.

Verifica que:
1. El icono en `/app/frontend/public/manoprotect_logo.png` es el correcto
2. El manifest.json tiene los iconos correctos
3. El .aab usa los mismos iconos
