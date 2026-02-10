# PRD - ManoProtect

## Problema Original
Actualizacion completa del proyecto React Native ManoProtect para compilar Android AAB para Google Play Store + correcciones de la plataforma web.

## Arquitectura
- **Frontend Web:** React + Shadcn/UI (puerto 3000)
- **Backend:** FastAPI + MongoDB (puerto 8001)
- **Mobile:** React Native 0.73.2 (compilacion offline)
- **Build Android:** Gradle 8.3 + AGP 8.1.4 + Kotlin 1.9.22 + JDK 17
- **Auth:** Firebase + JWT
- **Package:** com.manoprotect.www.twa

## Lo implementado

### Correcciones de compilacion Android (.aab) (Feb 2026):
1. Hermes habilitado (corregido mismatch gradle.properties/MainApplication.kt)
2. Flipper eliminado (obsoleto en RN 0.73)
3. SOSPackage registrado en MainApplication.kt
4. play-services-location anadido para SOSCriticalAlertService
5. ic_notification drawable creado (faltaba recurso FCM)
6. gradle-wrapper.jar protegido en .gitignore
7. JS Bundle verificado (2.0MB, compila correctamente)

### Herramientas de compilacion:
- GitHub Actions workflow simplificado
- compilar-windows.ps1 (PowerShell)
- compilar.sh (Bash)
- GUIA_COMPILACION_DEFINITIVA.md

### Correcciones plataforma web (Feb 10, 2026):
1. **Metricas en Tiempo Real (SSE)** - ARREGLADO
2. **API Keys** - ARREGLADO: CRUD completo funcional
3. **Limpieza datos test** - Eliminados: investor_requests, payment_transactions, etc.
4. **Manobank eliminado**
5. **WhatsApp** - Funcional (envio requiere credenciales WhatsApp Business API)

### Tareas completadas (Feb 10, 2026 - Session 2):

#### P0: Endpoints de ciberseguridad probados con curl (10/10 tests PASS):
- GET /api/security/providers - 8 proveedores (Google Safe Browsing, VirusTotal, Cloudflare, AbuseIPDB, AlienVault OTX, CrowdStrike, Recorded Future, Check Point)
- POST /api/security/check/url - Detecta phishing (URLs sospechosas) y URLs seguras
- POST /api/security/check/ip - Analiza IPs con AbuseIPDB y AlienVault OTX (detecta IPs maliciosas)
- POST /api/security/check/content - Detecta patrones de estafa en SMS/mensajes
- GET /api/security/stats/dashboard - Dashboard operativo
- Validacion correcta de inputs (IP invalida = 400, contenido corto = 400)

#### P1: Migracion react-native-camera a vision-camera:
- Eliminadas dependencias deprecated: react-native-camera, react-native-qrcode-scanner
- Instalada: react-native-vision-camera ^4.6.0
- QRScannerScreen.tsx reescrito con useCodeScanner hook
- Nuevas funcionalidades: control de linterna, permisos de camara con UI, soporte multi-codigo (QR, EAN-13, Code-128, PDF-417)
- gradle.properties: VisionCamera_enableCodeScanner=true (MLKit)
- JS Bundle verifica correctamente post-migracion

#### P2: Script de compilacion avanzado:
- compilar-avanzado.sh (Bash) con opciones: --clean, --apk, --debug, --analyze, --sign-info, --doctor, --all
- compilar-avanzado.ps1 (PowerShell) con mismas funcionalidades
- Modo --doctor verifica entorno (Java, Node, SDK, Keystore, dependencias, espacio disco)
- Modo --all compila AAB + APK en una sola ejecucion
- Logs automaticos en build-logs/
- Output con colores y tiempos de ejecucion

### APIs de ciberseguridad configuradas:
- Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX

## Backlog
- P0: Compilar AAB final (usuario debe usar GitHub Actions o script local con JDK 17 + Android SDK)
- P1: Configurar WhatsApp Business API para envio real de mensajes
- P2: App de escritorio para empleados con login
