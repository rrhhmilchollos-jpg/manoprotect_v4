# Guia de Publicacion - MANO App (Android)

## Requisitos Previos

### Para Android (Google Play)
1. **Android Studio** (gratis)
2. **JDK 17**
3. **Google Play Developer Account** ($25 USD unica vez)
   - Registrarse en: https://play.google.com/console

---

## Publicacion en Google Play (Android)

### Paso 1: Generar Keystore
```bash
cd android/app

keytool -genkeypair -v -storetype PKCS12 -keystore mano-release.keystore -alias mano-key -keyalg RSA -keysize 2048 -validity 10000

# Guardar la contrasena de forma segura
```

### Paso 2: Configurar gradle
Editar `android/gradle.properties`:
```properties
MANO_RELEASE_STORE_FILE=mano-release.keystore
MANO_RELEASE_KEY_ALIAS=mano-key
MANO_RELEASE_STORE_PASSWORD=tu_contrasena
MANO_RELEASE_KEY_PASSWORD=tu_contrasena
```

### Paso 3: Build Release
```bash
cd android
./gradlew bundleRelease

# El archivo AAB estara en:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Paso 4: Google Play Console
1. Ir a https://play.google.com/console
2. "Crear aplicacion"
3. Completar informacion:
   - **Nombre**: MANO Protect
   - **Descripcion corta**: Proteccion contra fraudes digitales
   - **Descripcion completa**: [Ver abajo]

### Paso 5: Subir AAB
1. "Versiones" -> "Produccion" -> "Crear nueva version"
2. Subir `app-release.aab`
3. Completar notas de la version

### Paso 6: Configuracion de la Ficha
- **Graficos**: Icono 512x512, Feature Graphic 1024x500
- **Screenshots**: 2-8 por tipo de dispositivo
- **Categoria**: Herramientas / Seguridad
- **Clasificacion de contenido**: Completar cuestionario
- **Politica de privacidad**: URL requerida

---

## Textos para Google Play

### Descripcion Corta (80 caracteres)
```
Protege tu vida digital contra fraudes, phishing y estafas con IA
```

### Descripcion Larga
```
MANO es tu escudo digital contra el fraude. Protege a ti y a tu familia de:

PROTECCION EN TIEMPO REAL
- Detecta phishing, smishing y vishing automaticamente
- Analiza mensajes SMS, emails y llamadas sospechosas
- Bloquea amenazas antes de que te afecten

ESCANER QR INTELIGENTE
- Escanea codigos QR y detecta enlaces maliciosos
- Identifica URLs fraudulentas al instante
- Te avisa antes de hacer clic en enlaces peligrosos

PROTECCION FAMILIAR
- Protege hasta 5 miembros de tu familia
- Modo simplificado para personas mayores
- Recibe alertas cuando detectemos amenazas a tus seres queridos

SEGURIDAD BANCARIA
- Monitoriza transacciones sospechosas
- Alertas de fraude bancario en tiempo real
- Compatible con los principales bancos espanoles

CARACTERISTICAS DE SEGURIDAD
- Acceso con huella digital
- Boton SOS de emergencia
- Notificaciones push instantaneas

Descarga MANO y navega tranquilo. Tu seguridad digital, en tus manos.
```

### Palabras Clave
```
seguridad, antifraude, phishing, proteccion, familia, mayores, banco, estafas, smishing, vishing, QR, privacidad
```

---

## Configuracion de Firebase (Push Notifications)

### Paso 1: Crear Proyecto Firebase
1. Ir a https://console.firebase.google.com
2. "Anadir proyecto" -> "MANO Protect"
3. Habilitar Google Analytics (opcional)

### Paso 2: Anadir App Android
1. Configuracion -> "Anadir app" -> Android
2. Package: `com.manoprotect.app`
3. Descargar `google-services.json`
4. Copiar a `android/app/`

### Paso 3: Habilitar Cloud Messaging
1. Ir a "Cloud Messaging" en Firebase Console

---

## Checklist Final

### Antes de Enviar a Revision

- [ ] Pruebas en dispositivo real Android
- [ ] Screenshots de todas las pantallas principales
- [ ] Icono de app (512x512)
- [ ] Feature Graphic (1024x500)
- [ ] Politica de privacidad publicada online
- [ ] Terminos de servicio publicados
- [ ] Informacion de contacto de soporte
- [ ] Descripcion en espanol e ingles
- [ ] Clasificacion de edad completada
- [ ] Push notifications funcionando
- [ ] Biometria funcionando
- [ ] Camara/QR funcionando

### Tiempos de Revision Tipicos
- **Google Play**: 2-7 dias (primera vez puede ser mas)

---

## Soporte

Si necesitas ayuda con la publicacion:
- Email: dev@mano-protect.com
- Documentacion: https://docs.mano-protect.com
