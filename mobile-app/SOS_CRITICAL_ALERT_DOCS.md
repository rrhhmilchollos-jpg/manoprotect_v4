# Sistema de Alerta Crítica SOS - ManoProtect

## Arquitectura Técnica

Este documento detalla la implementación del **Botón de Pánico (SOS)** que funciona de forma infalible en dispositivos Android.

---

## 1. Flujo de Comunicación

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Usuario A     │      │   Servidor   │      │  Familiares     │
│   (Víctima)     │      │   Backend    │      │  (B, C, D, E)   │
└────────┬────────┘      └──────┬───────┘      └────────┬────────┘
         │                      │                       │
         │  1. Pulsa SOS        │                       │
         │─────────────────────>│                       │
         │                      │                       │
         │                      │  2. FCM DATA MESSAGE  │
         │                      │  (priority: high)     │
         │                      │──────────────────────>│
         │                      │                       │
         │                      │        3. Activan sirena
         │                      │        (STREAM_ALARM)
         │                      │        Volumen al 100%
         │                      │        GPS tracking
         │                      │        Pantalla lock screen
         │                      │                       │
         │                      │  4. Usuario C pulsa   │
         │                      │     "ENTERADO"        │
         │                      │<──────────────────────│
         │                      │                       │
         │  5. "C está en       │  6. FCM siren_stop    │
         │     camino"          │─────────────────────>│
         │<─────────────────────│                       │
         │                      │        7. Detienen sirena
         │                      │        Restauran volumen
         │                      │                       │
```

---

## 2. Componentes de Android

### 2.1 SOSCriticalAlertService.java
**Servicio Foreground** que gestiona toda la alerta:

- **Sirena de Emergencia**: Usa `AudioManager.STREAM_ALARM` para ignorar modo silencioso
- **Control de Volumen**: Guarda volumen original → sube al 100% → restaura al terminar
- **Vibración Continua**: Patrón SOS (... --- ...) en bucle
- **GPS en Segundo Plano**: `FusedLocationProviderClient` con Foreground Service
- **Notificación Persistente**: No se puede descartar, botón "ENTERADO" integrado

### 2.2 SOSLockScreenActivity.java
**Activity sobre pantalla de bloqueo**:

- Se muestra SIN necesidad de desbloquear el dispositivo
- Animación de flash rojo
- Mapa con ubicación en tiempo real
- Botón gigante "ENTERADO - ESTOY EN CAMINO"
- Botón "Abrir en Google Maps"
- Botón "Llamar 112"

### 2.3 SOSFirebaseMessagingService.java
**Servicio FCM** para mensajes en segundo plano:

- Recibe **DATA MESSAGES** (no notification messages)
- Tipos de mensaje:
  - `sos_alert`: Inicia SOSCriticalAlertService
  - `siren_stop`: Detiene SOSCriticalAlertService
  - `location_update`: Actualiza ubicación en pantalla

---

## 3. Permisos Requeridos (AndroidManifest.xml)

```xml
<!-- UBICACIÓN -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- SERVICIOS FOREGROUND -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

<!-- PANTALLA DE BLOQUEO -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

<!-- AUDIO -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- DO NOT DISTURB BYPASS -->
<uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
```

---

## 4. Payload FCM (DATA MESSAGE)

### 4.1 Alerta SOS
```json
{
  "type": "sos_alert",
  "alert_id": "sos_20250120123456",
  "sender_name": "María García",
  "sender_email": "maria@example.com",
  "latitude": "40.4168",
  "longitude": "-3.7038",
  "message": "¡Emergencia SOS!",
  "timestamp": "2025-01-20T12:34:56.000Z"
}
```

### 4.2 Detener Sirena
```json
{
  "type": "siren_stop",
  "alert_id": "sos_20250120123456",
  "acknowledged_by": "Juan García",
  "reason": "acknowledged",
  "message": "Juan García está atendiendo la emergencia"
}
```

---

## 5. Backend (Python/FastAPI)

### 5.1 emergency_notifications.py
- `send_fcm_data_message()`: Envía DATA MESSAGE con alta prioridad
- `send_sos_critical_alert()`: Envía alerta SOS a familiares
- `send_siren_stop()`: Envía señal para detener sirenas
- `send_location_update()`: Envía actualizaciones de ubicación

### 5.2 websocket_manager.py
- `notify_family_sos()`: Notifica a familiares vía WebSocket
- `notify_all_family_siren_stop()`: Detiene sirenas vía WebSocket + FCM
- `acknowledge_sos()`: Procesa confirmación de familiar

---

## 6. React Native (TypeScript)

### 6.1 sosNative.ts
Wrapper para el módulo nativo Android:
- `startCriticalAlert()`: Inicia alerta desde JS
- `stopCriticalAlert()`: Detiene alerta desde JS
- `acknowledgeAlert()`: Envía confirmación
- `getFCMToken()`: Obtiene token FCM
- Event listeners para actualizaciones de ubicación

### 6.2 SOSAlertScreen.tsx
Pantalla de alerta en React Native:
- Mapa con ubicación
- Botón "ENTERADO"
- Integración con módulo nativo

---

## 7. Lógica de Handshake

```
1. Usuario A pulsa SOS
   ↓
2. Servidor registra emergencia
   ↓
3. Servidor envía FCM DATA MESSAGE a B, C, D, E
   ↓
4. Móviles de B, C, D, E activan sirena al máximo
   ↓
5. Usuario C pulsa "ENTERADO"
   ↓
6. Servidor cambia estado a "Atendido por C"
   ↓
7. Servidor envía FCM siren_stop a B, D, E
   ↓
8. Sirenas se detienen en TODOS los dispositivos
   ↓
9. Usuario A recibe notificación: "C está en camino"
```

---

## 8. Archivos del Proyecto

```
/app/mobile-app/
├── android/app/src/main/
│   ├── java/com/manoprotect/sos/
│   │   ├── SOSCriticalAlertService.java   # Servicio principal
│   │   ├── SOSLockScreenActivity.java     # Pantalla lock screen
│   │   ├── SOSFirebaseMessagingService.java # FCM handler
│   │   ├── SOSModule.java                 # React Native bridge
│   │   ├── SOSPackage.java               # RN Package
│   │   └── BootCompletedReceiver.java    # Boot receiver
│   ├── res/
│   │   ├── values/colors.xml
│   │   └── xml/network_security_config.xml
│   └── AndroidManifest.xml               # Permisos y servicios
├── src/
│   ├── services/
│   │   └── sosNative.ts                  # Wrapper JS para nativo
│   └── screens/
│       └── SOSAlertScreen.tsx            # Pantalla de alerta RN

/app/backend/services/
├── emergency_notifications.py            # FCM DATA MESSAGES
└── websocket_manager.py                  # WebSocket + FCM handshake
```

---

## 9. Compilación

Para compilar la app Android con el sistema SOS:

```bash
cd /app/mobile-app
yarn install
cd android
./gradlew bundleRelease
```

El archivo AAB estará en:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 10. Justificación de Permisos para Google Play

Ver `/app/android/JUSTIFICACION_PERMISOS_GOOGLE_PLAY.md` para la justificación
completa de cada permiso requerido para Google Play Console.
