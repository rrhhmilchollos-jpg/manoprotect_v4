# PRD - ManoProtect Mobile App

## Problema Original
Actualización completa del proyecto React Native ManoProtect para que sea compilable en Android, generando un archivo `.aab` para subir a Google Play Store. La app ya tiene versión 1.0.0 en Play Store y necesita subir actualización v2.0.1.

## Arquitectura
- **Frontend Mobile:** React Native 0.73.2 (TypeScript)
- **Backend:** FastAPI + MongoDB
- **Build:** Gradle 8.3 + AGP 8.1.4 + Kotlin 1.9.22 + JDK 17
- **Auth:** Firebase
- **Package:** com.manoprotect.www.twa
- **Módulos nativos:** SOS (sirena, GPS, vibración, Firebase messaging)

## Lo que se ha implementado (Feb 2026)

### Correcciones de compilación aplicadas:
1. **Hermes habilitado** - Corregido mismatch entre gradle.properties (false) y MainApplication.kt (true). Ahora ambos en `true`
2. **Flipper eliminado** - Removida dependencia obsoleta `com.facebook.react:flipper-integration` de app/build.gradle
3. **SOSPackage registrado** - Añadido `add(SOSPackage())` en MainApplication.kt para registrar módulo nativo SOS
4. **play-services-location añadido** - Dependencia `com.google.android.gms:play-services-location:21.1.0` necesaria para SOSCriticalAlertService
5. **ic_notification creado** - Drawable vectorial para icono de notificación FCM que faltaba
6. **gradle-wrapper.jar protegido** - Añadido `!android/gradle/wrapper/gradle-wrapper.jar` al .gitignore
7. **local.properties en gitignore** - Es archivo específico de máquina
8. **Declaraciones de tipos** - vendor.d.ts para react-native-vector-icons
9. **JS Bundle verificado** - Metro/Babel compila correctamente (2.0MB bundle)

### Herramientas de compilación creadas:
- **GitHub Actions workflow** (`.github/workflows/build-android.yml`) - Simplificado, sin secrets innecesarios
- **Script Windows** (`compilar-windows.ps1`) - PowerShell con verificación de requisitos
- **Script Unix** (`compilar.sh`) - Bash para macOS/Linux
- **Guía definitiva** (`GUIA_COMPILACION_DEFINITIVA.md`) - 3 opciones de compilación

### APIs de ciberseguridad configuradas:
- Google Safe Browsing (API key en backend/.env)
- VirusTotal (API key en backend/.env)
- AbuseIPDB (API key en backend/.env)
- AlienVault OTX (API key en backend/.env)

## Versiones de herramientas
| Herramienta | Versión |
|---|---|
| React Native | 0.73.2 |
| Gradle | 8.3 |
| Android Gradle Plugin | 8.1.4 |
| Kotlin | 1.9.22 |
| JDK | 17 |
| compileSdk | 34 |
| targetSdk | 34 |
| minSdk | 24 |

## Estado actual: LISTO PARA COMPILAR
El proyecto está configurado correctamente. El usuario debe compilar usando una de las 3 opciones:
1. GitHub Actions (recomendado)
2. Windows local (compilar-windows.ps1)
3. macOS/Linux (compilar.sh)

## Backlog
- P1: Probar endpoints de ciberseguridad del backend
- P2: Script de compilación automatizada avanzado
- P2: Actualizar a React Native 0.74+ cuando sea estable
- P3: Migrar react-native-camera (deprecated) a react-native-vision-camera
