# ManoBank - App Móvil Clientes

## Versión 2.0.0 - Compliance Edition

App móvil oficial de ManoBank S.A. para clientes del banco.

### Características
- ✅ Dashboard bancario completo
- ✅ Consulta de saldos y movimientos  
- ✅ Transferencias SEPA
- ✅ Gestión de tarjetas
- ✅ Solicitud de préstamos
- ✅ Notificaciones en tiempo real
- ✅ Seguridad con 2FA

### Información Legal
- **Entidad:** ManoBank S.A.
- **CIF:** B19427723
- **Regulador:** Banco de España
- **Licencia:** Entidad de Dinero Electrónico

---

## 🤖 Compilar APK Android

### Opción 1: GitHub Actions (Recomendado)

1. Sube este proyecto a un repositorio de GitHub
2. Ve a **Actions** → **Build ManoBank APK & iOS**
3. Click en **Run workflow**
4. Descarga el APK desde **Artifacts**

### Opción 2: Compilación Local

```bash
# Requisitos: Node.js 20+, Java 17+, Android SDK

npm install
npx cap sync android
cd android
./gradlew assembleDebug

# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🍎 Compilar IPA iOS

### GitHub Actions (Requiere macOS runner)

El workflow incluye un job para iOS que:
1. Instala dependencias
2. Añade plataforma iOS
3. Compila para simulador
4. Genera IPA

### Compilación Local (Solo macOS)

```bash
npm install
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug
```

### Para App Store (Requiere Apple Developer Account)
1. Abrir `ios/App/App.xcworkspace` en Xcode
2. Configurar signing con tu Apple Developer Account
3. Product → Archive
4. Distribute App → App Store Connect

---

## 📱 Instalación en Dispositivo

### Android
1. Descarga el APK
2. En el móvil: Ajustes → Seguridad → Orígenes desconocidos (activar)
3. Abre el archivo APK
4. Instalar

### iOS (TestFlight)
1. Sube el IPA a App Store Connect
2. Añade testers en TestFlight
3. Los usuarios reciben invitación por email

---

## Soporte
- Email: soporte@manobank.es
- Teléfono: 900 123 456

© 2026 ManoBank S.A. - Todos los derechos reservados
