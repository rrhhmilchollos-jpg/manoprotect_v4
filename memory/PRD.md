# PRD - ManoProtect

## Problema Original
Aplicación de ciberseguridad para protección de usuarios mayores. Incluye panel web de administración y aplicación móvil Android.

## Arquitectura Actual
- **Frontend Web (Admin Panel):** React + Shadcn/UI (puerto 3000)
- **Backend API:** FastAPI + MongoDB (puerto 8001)
- **Mobile App:** **Trusted Web Activity (TWA)** - Nativo Android Java
- **Build Android:** Gradle 8.3 + AGP 8.1.4 + JDK 17
- **Package:** com.manoprotect.www.twa
- **URL TWA:** https://www.manoprotect.com

## Lo Implementado

### CAMBIO MAYOR (Feb 10, 2026): Migración a TWA
El proyecto React Native fue **ABANDONADO** debido a problemas persistentes de compilación. 
Se creó un nuevo proyecto nativo Android usando **Trusted Web Activity (TWA)**.

**Nuevo proyecto TWA en `/manoprotect-twa/`:**
- LauncherActivity.java - Extiende LauncherActivity de androidbrowserhelper
- AndroidManifest.xml con configuración completa TWA
- Recursos: iconos, colores, splash screen
- Firma: keystore manoprotect-2025.keystore incluido
- GitHub Actions workflow: `.github/workflows/build-twa.yml`
- Script Windows: `compilar-aab.bat`

### Limpieza completa de iOS (Feb 10, 2026):
- Eliminados todos los archivos y configuraciones iOS del proyecto

### Endpoints de ciberseguridad probados (10/10 PASS):
- GET /api/security/providers - 8 proveedores
- POST /api/security/check/url - Detecta phishing y URLs seguras
- POST /api/security/check/ip - Analiza IPs con AbuseIPDB y AlienVault OTX
- POST /api/security/check/content - Detecta patrones de estafa
- GET /api/security/stats/dashboard - Dashboard operativo

### Correcciones plataforma web:
1. Métricas en Tiempo Real (SSE) - FUNCIONANDO
2. API Keys - CRUD completo funcional

## Proyecto móvil obsoleto (NO USAR)
El directorio `mobile-app/` contiene el proyecto React Native abandonado. 
No debe ser utilizado ni modificado.

## Backlog
- **P0:** Compilar AAB del TWA (usuario debe ejecutar `.\gradlew.bat bundleRelease` localmente)
- **P1:** Configurar Digital Asset Links en www.manoprotect.com/.well-known/assetlinks.json
- **P2:** Eliminar directorio mobile-app/ (pendiente confirmación usuario)
- **P3:** Configurar WhatsApp Business API para envío real de mensajes

## Cómo Compilar el AAB

### Opción 1: Local (Windows)
```powershell
cd manoprotect-twa
.\gradlew.bat bundleRelease --no-daemon
```
AAB en: `app\build\outputs\bundle\release\app-release.aab`

### Opción 2: GitHub Actions
1. Push a main con cambios en `manoprotect-twa/`
2. O ejecutar manualmente: Actions > Build ManoProtect TWA > Run workflow
3. Descargar artifact
