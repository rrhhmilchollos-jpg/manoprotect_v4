# 📱 ManoProtect - Guía de Compilación Android y Publicación en Google Play

## Información de la Empresa
- **Empresa:** STARTBOOKING SL
- **CIF:** B19427723
- **App ID:** com.manoprotect.app

---

## 1. Requisitos Previos

### En tu máquina local necesitas:
- Node.js 18+ 
- Java JDK 17+
- Android Studio (con SDK 34)
- Cuenta de Google Play Console ($25 única vez)

### Instalar Android Studio:
1. Descargar desde: https://developer.android.com/studio
2. Instalar Android SDK 34
3. Configurar ANDROID_HOME en variables de entorno

---

## 2. Generar Keystore para Firmar la App

```bash
# Ejecutar en terminal (necesitas Java JDK instalado)
cd /app/frontend/android/keystores

keytool -genkey -v \
  -keystore manoprotect-release.keystore \
  -alias manoprotect \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass TU_PASSWORD_SEGURO \
  -keypass TU_PASSWORD_SEGURO \
  -dname "CN=ManoProtect, OU=Mobile, O=STARTBOOKING SL, L=Madrid, ST=Madrid, C=ES"
```

⚠️ **IMPORTANTE:** Guarda el keystore y las contraseñas de forma segura. Si los pierdes, no podrás actualizar la app en Google Play.

---

## 3. Configurar Variables de Firma

Crear archivo `android/gradle.properties` (si no existe) y añadir:

```properties
MANOPROTECT_STORE_FILE=../keystores/manoprotect-release.keystore
MANOPROTECT_STORE_PASSWORD=TU_PASSWORD_SEGURO
MANOPROTECT_KEY_ALIAS=manoprotect
MANOPROTECT_KEY_PASSWORD=TU_PASSWORD_SEGURO
```

---

## 4. Compilar la App

### Opción A: Desde la línea de comandos

```bash
# Desde el directorio frontend
cd /app/frontend

# Build de React
REACT_APP_BACKEND_URL=https://manoprotectt.com yarn build

# Sincronizar con Android
npx cap sync android

# Compilar APK de debug (para probar)
cd android
./gradlew assembleDebug

# Compilar AAB para Play Store (release)
./gradlew bundleRelease
```

### Opción B: Desde Android Studio

1. Abrir Android Studio
2. File → Open → Seleccionar `/app/frontend/android`
3. Build → Generate Signed Bundle/APK
4. Seleccionar "Android App Bundle"
5. Usar el keystore creado
6. Build Variant: release
7. Finish

---

## 5. Ubicación de los Archivos Compilados

- **APK Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **AAB Release:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 6. Subir a Google Play Console

### 6.1 Crear la Aplicación
1. Ir a https://play.google.com/console
2. "Crear aplicación"
3. Nombre: **ManoProtect - Protección contra Fraudes**
4. Idioma predeterminado: Español (España)
5. Tipo: Aplicación
6. Gratis/De pago: Gratis (con compras in-app)

### 6.2 Ficha de Play Store

**Título:** ManoProtect - Protección contra Fraudes

**Descripción breve (80 caracteres):**
```
Protege a tu familia contra fraudes, phishing y estafas digitales con IA.
```

**Descripción completa:**
```
🛡️ MANOPROTECT - Tu escudo contra el fraude digital

ManoProtect es la aplicación líder en España para proteger a tu familia contra fraudes, phishing, smishing y todo tipo de estafas digitales.

✅ CARACTERÍSTICAS PRINCIPALES:

• Análisis de amenazas con IA avanzada
• Detección de phishing en tiempo real
• Verificador de estafas gratuito
• Alertas instantáneas de seguridad
• Protección para toda la familia (hasta 5 miembros)
• Modo especial para personas mayores
• Botón SOS de emergencia
• Localización de niños (Plan Familiar Anual)

🔒 PROTECCIÓN COMPLETA:

- Analiza mensajes SMS sospechosos
- Detecta correos de phishing
- Verifica enlaces peligrosos
- Identifica llamadas fraudulentas
- Alerta sobre nuevas estafas

👨‍👩‍👧‍👦 PLANES FAMILIARES:

Protege hasta 5 miembros de tu familia con un solo plan. Incluye funciones especiales para proteger a personas mayores con interfaz simplificada.

📱 FÁCIL DE USAR:

Interfaz intuitiva diseñada para todos los niveles. Simplemente pega el mensaje sospechoso y obtén un análisis instantáneo.

🏢 DESARROLLADO POR STARTBOOKING SL

Empresa española comprometida con la seguridad digital de las familias.

Descarga ManoProtect y mantén a tu familia segura en el mundo digital.
```

### 6.3 Capturas de Pantalla Requeridas
- Mínimo 2 capturas para teléfono (1080x1920 px)
- Mínimo 1 captura para tablet 7" (1200x1920 px)
- Mínimo 1 captura para tablet 10" (1600x2560 px)

### 6.4 Icono y Gráficos
- Icono de la app: 512x512 px PNG
- Gráfico de funciones: 1024x500 px PNG

### 6.5 Categoría y Etiquetas
- **Categoría:** Herramientas
- **Etiquetas:** seguridad, antifraude, familia, protección

### 6.6 Clasificación de Contenido
- Completar cuestionario IARC
- Típicamente: PEGI 3 / Everyone

### 6.7 Política de Privacidad
URL requerida: https://manoprotectt.com/privacy-policy

---

## 7. Configuración de Versiones

### Versionado (en capacitor.config.json y build.gradle):
- **Version Code:** Número incremental (1, 2, 3...)
- **Version Name:** Semántico (1.0.0, 1.0.1, 1.1.0...)

### Para actualizar versión:
1. Editar `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```
2. Recompilar AAB
3. Subir a Google Play Console

---

## 8. Checklist Pre-Lanzamiento

- [ ] Keystore generado y guardado de forma segura
- [ ] App probada en dispositivo físico
- [ ] Todas las capturas de pantalla preparadas
- [ ] Política de privacidad publicada
- [ ] Descripción en español completada
- [ ] Icono y gráficos subidos
- [ ] Cuestionario de clasificación completado
- [ ] AAB firmado y subido
- [ ] Precios de suscripción configurados en Play Console

---

## 9. Comandos Útiles

```bash
# Ver logs de la app en dispositivo conectado
adb logcat | grep -i manoprotect

# Instalar APK de debug
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Limpiar build
cd android && ./gradlew clean

# Actualizar Capacitor
npx cap sync android
```

---

## Soporte

Para soporte técnico contactar con el equipo de desarrollo.

**STARTBOOKING SL** - CIF: B19427723
