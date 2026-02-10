# PRD - ManoProtect

## Problema Original
Actualización completa del proyecto React Native ManoProtect para compilar Android AAB para Google Play Store + correcciones de la plataforma web.

## Arquitectura
- **Frontend Web:** React + Shadcn/UI (puerto 3000)
- **Backend:** FastAPI + MongoDB (puerto 8001)
- **Mobile:** React Native 0.73.2 (compilación offline)
- **Build Android:** Gradle 8.3 + AGP 8.1.4 + Kotlin 1.9.22 + JDK 17
- **Auth:** Firebase + JWT
- **Package:** com.manoprotect.www.twa

## Lo implementado (Feb 2026)

### Correcciones de compilación Android (.aab):
1. Hermes habilitado (corregido mismatch gradle.properties/MainApplication.kt)
2. Flipper eliminado (obsoleto en RN 0.73)
3. SOSPackage registrado en MainApplication.kt
4. play-services-location añadido para SOSCriticalAlertService
5. ic_notification drawable creado (faltaba recurso FCM)
6. gradle-wrapper.jar protegido en .gitignore
7. JS Bundle verificado (2.0MB, compila correctamente)

### Herramientas de compilación:
- GitHub Actions workflow simplificado
- compilar-windows.ps1 (PowerShell)
- compilar.sh (Bash)
- GUIA_COMPILACION_DEFINITIVA.md

### Correcciones plataforma web (Feb 10, 2026):
1. **Métricas en Tiempo Real (SSE)** - ARREGLADO: Añadida ruta /metrics/stream que faltaba. Ahora muestra "En Vivo" con datos en tiempo real
2. **API Keys** - ARREGLADO: Alineado formato backend con frontend. CRUD completo funcional (crear, listar, revocar)
3. **Limpieza datos test** - Eliminados: investor_requests, payment_transactions, plan_changes, checkout_sessions, whatsapp_queue, manobank colecciones
4. **Manobank eliminado** - Directorios y archivos borrados
5. **WhatsApp** - Funcional (encola mensajes, envío requiere credenciales WhatsApp Business API)

### APIs de ciberseguridad configuradas:
- Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX

## Backlog
- P0: Compilar AAB (usuario debe usar GitHub Actions o script local)
- P1: Configurar WhatsApp Business API para envío real de mensajes
- P2: Probar endpoints de ciberseguridad del backend
- P2: App de escritorio para empleados con login
- P3: Migrar react-native-camera (deprecated) a react-native-vision-camera
