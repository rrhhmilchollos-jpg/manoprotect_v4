# ManoProtect - Product Requirements Document

## Información General
- **Nombre**: ManoProtect
- **Empresa**: STARTBOOKING SL
- **Descripción**: Aplicación de protección contra fraudes digitales para familias españolas

## Estado Actual: Sistema de Alerta Crítica SOS Implementado (6 Febrero 2025)

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
