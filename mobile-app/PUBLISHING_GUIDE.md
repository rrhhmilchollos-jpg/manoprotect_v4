# 📱 Guía de Publicación - MANO App

## Requisitos Previos

### Para iOS (App Store)
1. **Mac** con macOS 12.0 o superior
2. **Xcode 14+** (gratis en App Store)
3. **Apple Developer Account** ($99 USD/año)
   - Registrarse en: https://developer.apple.com

### Para Android (Google Play)
1. **Android Studio** (gratis)
2. **JDK 11+**
3. **Google Play Developer Account** ($25 USD única vez)
   - Registrarse en: https://play.google.com/console

---

## 🍎 Publicación en App Store (iOS)

### Paso 1: Configurar el Proyecto
```bash
cd /app/mobile-app

# Instalar dependencias
yarn install

# Inicializar proyecto iOS
npx react-native init MANOProtect --template react-native-template-typescript

# Copiar código fuente a ios/
```

### Paso 2: En Xcode
1. Abrir `ios/MANOProtect.xcworkspace`
2. Configurar:
   - **Bundle Identifier**: `com.manoprotect.app`
   - **Team**: Tu cuenta de desarrollador
   - **Signing**: Automatic

### Paso 3: Crear App en App Store Connect
1. Ir a https://appstoreconnect.apple.com
2. "My Apps" → "+" → "New App"
3. Completar información:
   - **Nombre**: MANO Protect
   - **Bundle ID**: com.manoprotect.app
   - **SKU**: MANOPROTECT001

### Paso 4: Build y Subir
```bash
# En Xcode:
# 1. Product → Archive
# 2. Distribute App → App Store Connect
# 3. Upload
```

### Paso 5: Completar en App Store Connect
- Screenshots (6.5" y 5.5")
- Descripción
- Palabras clave
- Categoría: Utilidades / Seguridad
- Precio: Gratis (con compras in-app)
- Clasificación de edad

---

## 🤖 Publicación en Google Play (Android)

### Paso 1: Generar Keystore
```bash
cd android/app

keytool -genkeypair -v -storetype PKCS12 -keystore mano-release.keystore -alias mano-key -keyalg RSA -keysize 2048 -validity 10000

# Guardar la contraseña de forma segura
```

### Paso 2: Configurar gradle
Editar `android/gradle.properties`:
```properties
MANO_RELEASE_STORE_FILE=mano-release.keystore
MANO_RELEASE_KEY_ALIAS=mano-key
MANO_RELEASE_STORE_PASSWORD=tu_contraseña
MANO_RELEASE_KEY_PASSWORD=tu_contraseña
```

### Paso 3: Build Release
```bash
cd android
./gradlew bundleRelease

# El archivo AAB estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Paso 4: Google Play Console
1. Ir a https://play.google.com/console
2. "Crear aplicación"
3. Completar información:
   - **Nombre**: MANO Protect
   - **Descripción corta**: Protección contra fraudes digitales
   - **Descripción completa**: [Ver abajo]

### Paso 5: Subir AAB
1. "Versiones" → "Producción" → "Crear nueva versión"
2. Subir `app-release.aab`
3. Completar notas de la versión

### Paso 6: Configuración de la Ficha
- **Gráficos**: Icono 512x512, Feature Graphic 1024x500
- **Screenshots**: 2-8 por tipo de dispositivo
- **Categoría**: Herramientas / Seguridad
- **Clasificación de contenido**: Completar cuestionario
- **Política de privacidad**: URL requerida

---

## 📝 Textos para las Tiendas

### Descripción Corta (80 caracteres)
```
Protege tu vida digital contra fraudes, phishing y estafas con IA
```

### Descripción Larga
```
MANO es tu escudo digital contra el fraude. Protege a ti y a tu familia de:

🛡️ PROTECCIÓN EN TIEMPO REAL
• Detecta phishing, smishing y vishing automáticamente
• Analiza mensajes SMS, emails y llamadas sospechosas
• Bloquea amenazas antes de que te afecten

📱 ESCÁNER QR INTELIGENTE
• Escanea códigos QR y detecta enlaces maliciosos
• Identifica URLs fraudulentas al instante
• Te avisa antes de hacer clic en enlaces peligrosos

👨‍👩‍👧‍👦 PROTECCIÓN FAMILIAR
• Protege hasta 5 miembros de tu familia
• Modo simplificado para personas mayores
• Recibe alertas cuando detectemos amenazas a tus seres queridos

🏦 SEGURIDAD BANCARIA
• Monitoriza transacciones sospechosas
• Alertas de fraude bancario en tiempo real
• Compatible con los principales bancos españoles

🔐 CARACTERÍSTICAS DE SEGURIDAD
• Acceso con Face ID / Touch ID / Huella digital
• Botón SOS de emergencia
• Notificaciones push instantáneas

Descarga MANO y navega tranquilo. Tu seguridad digital, en tus manos.
```

### Palabras Clave
```
seguridad, antifraude, phishing, protección, familia, mayores, banco, estafas, smishing, vishing, QR, privacidad
```

---

## 🔧 Configuración de Firebase (Push Notifications)

### Paso 1: Crear Proyecto Firebase
1. Ir a https://console.firebase.google.com
2. "Añadir proyecto" → "MANO Protect"
3. Habilitar Google Analytics (opcional)

### Paso 2: Añadir Apps
**iOS:**
1. Configuración → "Añadir app" → iOS
2. Bundle ID: `com.manoprotect.app`
3. Descargar `GoogleService-Info.plist`
4. Copiar a `ios/MANOProtect/`

**Android:**
1. Configuración → "Añadir app" → Android
2. Package: `com.manoprotect.app`
3. Descargar `google-services.json`
4. Copiar a `android/app/`

### Paso 3: Habilitar Cloud Messaging
1. Ir a "Cloud Messaging" en Firebase Console
2. Para iOS: Subir APNs key desde Apple Developer Portal

---

## ✅ Checklist Final

### Antes de Enviar a Revisión

- [ ] Pruebas en dispositivo real
- [ ] Screenshots de todas las pantallas principales
- [ ] Icono de app (1024x1024 para iOS, 512x512 para Android)
- [ ] Política de privacidad publicada online
- [ ] Términos de servicio publicados
- [ ] Información de contacto de soporte
- [ ] Descripción en español e inglés
- [ ] Clasificación de edad completada
- [ ] Push notifications funcionando
- [ ] Biometría funcionando
- [ ] Cámara/QR funcionando

### Tiempos de Revisión Típicos
- **App Store**: 24-48 horas (puede tardar hasta 1 semana)
- **Google Play**: 2-7 días (primera vez puede ser más)

---

## 📞 Soporte

Si necesitas ayuda con la publicación:
- Email: dev@mano-protect.com
- Documentación: https://docs.mano-protect.com
