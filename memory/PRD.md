# PRD - ManoProtect

## Problema Original
Actualizacion completa del proyecto React Native ManoProtect para compilar Android AAB para Google Play Store + correcciones de la plataforma web.

## Arquitectura
- **Frontend Web:** React + Shadcn/UI (puerto 3000)
- **Backend:** FastAPI + MongoDB (puerto 8001)
- **Mobile:** React Native 0.73.2 - **Solo Android** (compilacion offline)
- **Build Android:** Gradle 8.3 + AGP 8.1.4 + Kotlin 1.9.22 + JDK 17
- **Auth:** Firebase + JWT
- **Package:** com.manoprotect.www.twa

## Lo implementado

### Correcciones de compilacion Android (.aab):
1. Hermes habilitado (corregido mismatch gradle.properties/MainApplication.kt)
2. Flipper eliminado (obsoleto en RN 0.73)
3. SOSPackage registrado en MainApplication.kt
4. play-services-location anadido para SOSCriticalAlertService
5. ic_notification drawable creado (faltaba recurso FCM)
6. gradle-wrapper.jar protegido en .gitignore
7. JS Bundle verificado (2.0MB, compila correctamente)
8. react-native-gesture-handler actualizado a 2.18.1 (fix BaseReactPackage para RN 0.73)
9. Eliminada missingDimensionStrategy de react-native-camera en build.gradle

### Migracion react-native-camera a vision-camera:
- Eliminadas: react-native-camera, react-native-qrcode-scanner
- Instalada: react-native-vision-camera ^4.6.0 con useCodeScanner
- QRScannerScreen reescrito con soporte multi-codigo (QR, EAN-13, Code-128, PDF-417)
- VisionCamera_enableCodeScanner=true en gradle.properties (MLKit)

### Limpieza completa de iOS (Feb 10, 2026):
- Eliminados directorios: ios/, ios-config/
- Eliminado script "ios" de package.json
- Eliminadas todas las secciones iOS de: BUILD_GUIDE.md, PUBLISHING_GUIDE.md, FIREBASE_SETUP.md, README.md
- Eliminadas entradas iOS de .gitignore
- Eliminada config iOS de firebase.ts
- Simplificados todos los Platform.OS checks en codigo fuente (8 archivos)
- Eliminados imports de Platform innecesarios

### Endpoints de ciberseguridad probados (10/10 PASS):
- GET /api/security/providers - 8 proveedores
- POST /api/security/check/url - Detecta phishing y URLs seguras
- POST /api/security/check/ip - Analiza IPs con AbuseIPDB y AlienVault OTX
- POST /api/security/check/content - Detecta patrones de estafa
- GET /api/security/stats/dashboard - Dashboard operativo

### Scripts de compilacion:
- compilar-avanzado.sh (Bash) y compilar-avanzado.ps1 (PowerShell)
- Opciones: --doctor, --clean, --apk, --debug, --analyze, --sign-info, --all

### Correcciones plataforma web:
1. Metricas en Tiempo Real (SSE) - ARREGLADO
2. API Keys - CRUD completo funcional
3. Limpieza datos test
4. Manobank eliminado

## Backlog
- P0: Compilar AAB final (gradlew bundleRelease en maquina local con JDK 17 + Android SDK)
- P1: Configurar WhatsApp Business API para envio real de mensajes
