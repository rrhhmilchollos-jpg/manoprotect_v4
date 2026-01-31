# 🍎 Guía Completa: Publicar ManoProtect en App Store (iOS)

## Requisitos previos

- **Mac con macOS** (obligatorio para Xcode)
- **Cuenta de Apple Developer** ($99 USD/año)
- **Xcode 15+** instalado
- **Node.js 18+**

---

## Paso 1: Configurar el proyecto iOS

### 1.1 Instalar Capacitor iOS (ya está instalado)

```bash
cd /app/frontend
npx cap add ios
```

### 1.2 Sincronizar el proyecto

```bash
# Construir la app web
yarn build

# Sincronizar con iOS
npx cap sync ios
```

---

## Paso 2: Configurar en Xcode

### 2.1 Abrir el proyecto

```bash
npx cap open ios
```

Esto abrirá Xcode con el proyecto.

### 2.2 Configurar Signing & Capabilities

1. Selecciona el proyecto **"App"** en el navegador
2. Ve a **"Signing & Capabilities"**
3. Selecciona tu **Team** (cuenta de Apple Developer)
4. El **Bundle Identifier** debe ser: `com.manoprotect.app`

### 2.3 Configurar Info.plist

Añade estas claves en `ios/App/App/Info.plist`:

```xml
<!-- Permisos necesarios -->
<key>NSCameraUsageDescription</key>
<string>ManoProtect necesita acceso a la cámara para escanear códigos QR sospechosos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>ManoProtect necesita acceso a fotos para analizar capturas de estafas</string>

<!-- Configuración de la app -->
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

---

## Paso 3: Iconos para iOS

### Tamaños requeridos

Crea estos iconos en `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Tamaño | Nombre | Uso |
|--------|--------|-----|
| 20x20 | icon-20.png | Notificaciones |
| 29x29 | icon-29.png | Settings |
| 40x40 | icon-40.png | Spotlight |
| 60x60 | icon-60.png | iPhone App |
| 76x76 | icon-76.png | iPad App |
| 83.5x83.5 | icon-83.5.png | iPad Pro |
| 1024x1024 | icon-1024.png | App Store |

### Contents.json para AppIcon

```json
{
  "images": [
    {"size": "20x20", "idiom": "iphone", "filename": "icon-20@2x.png", "scale": "2x"},
    {"size": "20x20", "idiom": "iphone", "filename": "icon-20@3x.png", "scale": "3x"},
    {"size": "29x29", "idiom": "iphone", "filename": "icon-29@2x.png", "scale": "2x"},
    {"size": "29x29", "idiom": "iphone", "filename": "icon-29@3x.png", "scale": "3x"},
    {"size": "40x40", "idiom": "iphone", "filename": "icon-40@2x.png", "scale": "2x"},
    {"size": "40x40", "idiom": "iphone", "filename": "icon-40@3x.png", "scale": "3x"},
    {"size": "60x60", "idiom": "iphone", "filename": "icon-60@2x.png", "scale": "2x"},
    {"size": "60x60", "idiom": "iphone", "filename": "icon-60@3x.png", "scale": "3x"},
    {"size": "1024x1024", "idiom": "ios-marketing", "filename": "icon-1024.png", "scale": "1x"}
  ],
  "info": {"version": 1, "author": "xcode"}
}
```

---

## Paso 4: App Store Connect

### 4.1 Crear la app

1. Ve a **[appstoreconnect.apple.com](https://appstoreconnect.apple.com/)**
2. Haz clic en **"My Apps"** → **"+"** → **"New App"**
3. Completa:
   - **Platforms**: iOS
   - **Name**: ManoProtect
   - **Primary Language**: Spanish
   - **Bundle ID**: com.manoprotect.app
   - **SKU**: manoprotect-001

### 4.2 Información de la app

#### Descripción (App Store)
```
ManoProtect - Tu escudo contra el fraude digital

Protege a tu familia de estafas telefónicas, phishing, SMS fraudulentos y mucho más con la app de seguridad digital #1 en España.

CARACTERÍSTICAS:

• Verificador de Estafas - Analiza mensajes y enlaces sospechosos al instante
• Alertas en Tiempo Real - Notificaciones sobre nuevas amenazas en España  
• Plan Familiar - Protege hasta 5 miembros con una suscripción
• Base de Datos - +50,000 estafas identificadas
• Modo SOS - Reporta fraudes rápidamente
• Educación - Aprende a identificar estafas

HECHO EN ESPAÑA:
Detectamos estafas del Banco de España, Correos, Hacienda, y más.

+10,000 familias ya confían en ManoProtect.

Empresa: STARTBOOKING SL
```

#### Palabras clave
```
seguridad,fraude,estafa,phishing,protección,familia,antivirus,spam,seguro,privacidad
```

#### Categorías
- **Categoría principal**: Utilidades
- **Categoría secundaria**: Estilo de vida

#### Clasificación por edades
- Responde el cuestionario
- Resultado esperado: **4+**

### 4.3 Capturas de pantalla

Necesitas capturas para:

| Dispositivo | Tamaño |
|-------------|--------|
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1284 x 2778 |
| iPhone 5.5" | 1242 x 2208 |
| iPad 12.9" | 2048 x 2732 |

**Mínimo 3 capturas por dispositivo**

### 4.4 Información adicional

```
URL de soporte: https://www.manoprotect.com/faq
URL de marketing: https://www.manoprotect.com
URL de privacidad: https://www.manoprotect.com/privacy-policy
```

---

## Paso 5: Compilar y subir

### 5.1 Crear Archive en Xcode

1. Selecciona **"Any iOS Device"** como destino
2. **Product** → **Archive**
3. Espera a que compile

### 5.2 Subir a App Store Connect

1. En el Organizer, selecciona el archive
2. Haz clic en **"Distribute App"**
3. Selecciona **"App Store Connect"**
4. Sigue los pasos del asistente

### 5.3 Seleccionar build en App Store Connect

1. Ve a tu app en App Store Connect
2. En **"Build"**, selecciona el build subido
3. Completa el cuestionario de exportación

---

## Paso 6: Enviar para revisión

1. Verifica que todo esté completo
2. Haz clic en **"Submit for Review"**
3. Tiempo de revisión: 24-48 horas (generalmente)

---

## 🎉 ¡Listo!

Una vez aprobada, tu app estará disponible en:
`https://apps.apple.com/es/app/manoprotect/id[APP_ID]`

---

## Problemas comunes

### Error de Signing
- Verifica que tu certificado esté activo
- Regenera el provisioning profile si es necesario

### Rechazo por contenido
- Asegúrate de que la política de privacidad sea accesible
- Verifica que la app funcione completamente

### Build inválido
- Verifica que el Bundle ID coincida
- Asegúrate de incrementar el número de versión

---

## Comandos útiles

```bash
# Limpiar y reconstruir
cd /app/frontend
rm -rf build ios/App/App/public
yarn build
npx cap sync ios

# Ver logs de iOS
npx cap run ios --livereload

# Abrir en Xcode
npx cap open ios
```
