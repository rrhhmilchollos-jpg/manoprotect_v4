# ManoProtect - Product Requirements Document

## Información General
- **Nombre**: ManoProtect
- **Empresa**: STARTBOOKING SL
- **Descripción**: Aplicación de protección contra fraudes digitales para familias españolas

## Estado Actual: Plataforma de Protección Digital Multi-Capa (8 Febrero 2026)

### ✅ Completado Hoy (8 Feb 2026)

#### Arquitectura de Seguridad Multi-Capa
- [x] **Backend `/api/security/*`**: Nuevos endpoints de análisis de seguridad
  - `POST /api/security/check/url` - Análisis de URLs con múltiples fuentes
  - `POST /api/security/check/ip` - Verificación de reputación de IPs
  - `POST /api/security/check/content` - Detección de patrones de estafa
  - `GET /api/security/providers` - Lista de proveedores integrados
  - `GET /api/security/stats/dashboard` - Panel de estadísticas

#### Integraciones de Ciberseguridad (APIs)
- [x] **Google Safe Browsing API v5**: Detección de phishing y malware
- [x] **VirusTotal API v3**: Análisis con 70+ motores antivirus
- [x] **AbuseIPDB API v2**: Base de datos de IPs maliciosas
- [x] **AlienVault OTX**: Open Threat Exchange - Inteligencia de amenazas
- [x] **Cloudflare**: WAF, protección contra bots y DDoS (infraestructura)
- [x] **CrowdStrike Falcon**: Threat Intelligence (preparado para enterprise)
- [x] **Recorded Future**: AI Intelligence (preparado para premium)

#### Landing Page - Sección de Partners
- [x] **Nueva sección "Protección Multi-Capa"**: Muestra los proveedores de seguridad
- [x] **Cards de tecnologías**: Google, VirusTotal, Cloudflare, AbuseIPDB
- [x] **Partners premium**: AlienVault OTX, CrowdStrike, Recorded Future
- [x] **Stats bar**: 8 capas, 70+ motores, 24/7, AI
- [x] **Disclaimer legal**: Sin promesas de protección absoluta

#### Página de Eliminación de Cuenta (Google Play Requirement)
- [x] **Nueva ruta `/solicitar-eliminacion`**: Formulario de 2 pasos
- [x] **Backend `/api/account/delete-request`**: Procesa solicitudes
- [x] **Enlace en footer**: "Eliminar mi Cuenta"

#### Actualización Android 15+ y Pantallas Grandes
- [x] **AndroidManifest.xml**: targetApi="35", resizeableActivity, screenOrientation
- [x] **SOSLockScreenActivity.java**: Edge-to-Edge, barras transparentes, insets dinámicos

---

### ✅ Completado (6 Feb 2026)

#### Corrección de Tarjetas de Estadísticas en /verificar-estafa
- [x] **Habilitado fraud_routes.py**: Las rutas estaban comentadas en server.py
- [x] **Actualizado endpoint `/api/fraud/public/scam-stats`**: Solo datos REALES (sin inflar)
- [x] **Actualizado endpoint `/api/fraud/public/verify-scam`**: Devuelve campos para UI
- [x] **Actualizado endpoint `/api/fraud/public/report-scam`**: Devuelve `success: true`

#### Botones de Compartir en Redes Sociales
- [x] **WhatsApp**: Botón verde para compartir alerta
- [x] **X/Twitter**: Botón para tweet
- [x] **Facebook**: Botón para compartir en Facebook
- [x] **Telegram**: Botón para compartir en Telegram
- [x] **Copiar**: Botón para copiar texto de alerta
- [x] **Native Share API**: Para móviles (botón "Más")

#### Configuración AdMob
- [x] Publisher ID ya configurado: `pub-7713974112203810`
- [x] App ID: `ca-app-pub-7713974112203810~9265947358`
- [x] Rewarded Video: `ca-app-pub-7713974112203810/4909676040`
- [x] Native Ad: `ca-app-pub-7713974112203810/5727933690`

---

## Historial: Sistema de Alerta Crítica SOS Implementado (6 Febrero 2025)

### ✅ Completado

#### Sistema de Alerta Crítica SOS (6 Feb 2025)
- [x] **SOSCriticalAlertService.java**: Servicio nativo Android con:
  - Sirena usando `AudioManager.STREAM_ALARM` (ignora modo silencioso)
  - Control de volumen: guarda original → sube al 100% → restaura
  - Vibración continua patrón SOS (... --- ...)
  - Foreground Service con GPS tracking
  - Notificación persistente con botón "ENTERADO"

- [x] **SOSLockScreenActivity.java**: Pantalla sobre lock screen con:
  - Visualización sin desbloquear dispositivo
  - Animación de flash rojo
  - Botón gigante "ENTERADO - ESTOY EN CAMINO"
  - Botón "Abrir en Google Maps"
  - Botón "Llamar 112"

- [x] **SOSFirebaseMessagingService.java**: Handler FCM con:
  - Recepción de DATA MESSAGES (no notification)
  - Procesamiento de `sos_alert` → inicia servicio
  - Procesamiento de `siren_stop` → detiene servicio
  - Procesamiento de `location_update` → actualiza UI

- [x] **SOSModule.java + SOSPackage.java**: Bridge React Native

- [x] **Backend actualizado**:
  - `emergency_notifications.py`: Envío de FCM DATA MESSAGES
  - `websocket_manager.py`: Handshake con FCM + WebSocket

- [x] **Permisos Android agregados**:
  - `ACCESS_BACKGROUND_LOCATION`
  - `FOREGROUND_SERVICE_LOCATION`
  - `SYSTEM_ALERT_WINDOW`
  - `MODIFY_AUDIO_SETTINGS`
  - `ACCESS_NOTIFICATION_POLICY`

#### Segunda Limpieza de Afirmaciones Engañosas (5 Feb 2025)
- [x] Estadísticas falsas eliminadas (99.8%, 98%, 15K+, 4.9, etc.)
- [x] Afirmaciones no verificables eliminadas
- [x] Testimonios falsos → reseñas REALES de Google Play
- [x] Período de prueba: 7 días en toda la app

### 📁 Archivos Nuevos del Sistema SOS

```
/app/mobile-app/
├── android/app/src/main/java/com/manoprotect/sos/
│   ├── SOSCriticalAlertService.java   ← Servicio principal (sirena, GPS)
│   ├── SOSLockScreenActivity.java     ← Pantalla lock screen
│   ├── SOSFirebaseMessagingService.java ← FCM DATA handler
│   ├── SOSModule.java                 ← React Native bridge
│   ├── SOSPackage.java               ← RN Package
│   └── BootCompletedReceiver.java    ← Boot receiver
├── android/app/src/main/res/
│   ├── values/colors.xml
│   ├── values/styles.xml             ← Tema Fullscreen añadido
│   └── xml/network_security_config.xml
├── src/services/sosNative.ts         ← Wrapper TypeScript
├── src/screens/SOSAlertScreen.tsx    ← Pantalla RN
└── SOS_CRITICAL_ALERT_DOCS.md        ← Documentación técnica
```

### ⏳ Pendiente

#### P0 - Bloqueante
- [ ] Compilar la app React Native con servicios nativos SOS
- [ ] Generar .aab firmado
- [ ] Subir a Google Play Console

#### P1 - Alta Prioridad
- [ ] Probar flujo completo SOS en dispositivo real
- [ ] Verificar que sirena ignora modo silencioso
- [ ] Verificar pantalla sobre lock screen

#### P2 - Media Prioridad
- [ ] Continuar refactorización `server.py`
- [ ] Eliminar archivos `.jsx` no utilizados
- [ ] Configurar Pixel IDs de anuncios

### Flujo de Alerta Crítica SOS

```
1. Usuario A pulsa SOS
   ↓
2. Servidor registra emergencia
   ↓
3. FCM DATA MESSAGE a familiares (priority: high, ttl: 0)
   ↓
4. Dispositivos activan:
   - Sirena (STREAM_ALARM, volumen 100%)
   - Vibración continua
   - GPS tracking
   - Pantalla lock screen
   ↓
5. Familiar C pulsa "ENTERADO"
   ↓
6. FCM siren_stop a todos los dispositivos
   ↓
7. Sirenas se detienen, volumen restaurado
```

## Credenciales de Prueba
- **Superadmin**: info@manoprotect.com / 19862210Des

---
*Última actualización: 6 Febrero 2025 - Sistema SOS Crítico implementado*
