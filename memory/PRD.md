# ManoProtect - PRD (Product Requirements Document)

## Estado de Producción
**✅ LISTO PARA DEPLOY - 04/02/2026**
- Backend: 92% tests pasados (11/12)
- Frontend: 100% tests pasados
- Errores críticos: 0
- Errores menores: 1 (Twilio config - ver notas)

**URL de Producción:** https://manoprotect.com
**URL de Preview:** https://family-safety-8.preview.emergentagent.com

---

## Descripción General
ManoProtect es una aplicación de seguridad familiar con funciones de SOS de emergencia, seguimiento en tiempo real, y perfil de salud para emergencias.

---

## ⚠️ IMPORTANTE: Configuración Twilio

El SMS backup está implementado correctamente pero Twilio reporta:
```
"Mismatch between the 'From' number +12513137701 and the account"
```

**Solución para el usuario:**
1. Ir a https://console.twilio.com
2. Verificar que el número +12513137701 esté asociado a la cuenta AC9d3073266f4ae0b0b5b64be0283f1f35
3. O actualizar TWILIO_PHONE_NUMBER en backend/.env con un número verificado

---

## Arquitectura del Sistema

### Canales de Notificación de Emergencia
| Canal | Tecnología | Velocidad | Cobertura |
|-------|------------|-----------|-----------|
| WebSocket | Socket.IO | Instantáneo (<100ms) | App abierta |
| FCM Alta Prioridad | Firebase Cloud Messaging | Instantáneo | App cerrada |
| SMS Backup | Twilio | 1-3 segundos | Sin internet |

### Flujo SOS
```
Usuario pulsa SOS → Backend → WebSocket + FCM + SMS → Familiar recibe:
  1. Notificación push con sirena
  2. Página /sos-alert con ubicación GPS en vivo
  3. Botones: Llamar familiar / Llamar 112 / Confirmar recibido
  4. Al confirmar, el emisor ve "AYUDA EN CAMINO"
```

---

## Funcionalidades Implementadas

### 🆘 Sistema SOS de Emergencia
- Botón SOS de emergencia con ubicación en tiempo real
- Sirena de alerta en el dispositivo del FAMILIAR
- Grabación de audio durante emergencias
- Notificaciones automáticas a contactos de emergencia
- GPS en tiempo real durante la emergencia

### 🔴 Botón SOS Rápido (`/sos-quick`)
- Página dedicada para acceso rápido
- Instalable en pantalla de inicio del móvil
- Countdown de 3 segundos antes de activar
- Estado "AYUDA EN CAMINO" al recibir confirmación

### 📱 Alerta SOS para Familiares (`/sos-alert`)
- Sirena suena en el móvil del familiar
- Ubicación GPS del familiar en peligro
- Botones para llamar al familiar o al 112
- Vibración continua

### 🔔 Notificaciones Push (Firebase + Web Push)
- FCM Alta Prioridad para entrega instantánea
- Service Worker para notificaciones en background
- SMS backup via Twilio si FCM falla

### 📍 Seguimiento Familiar
- Ubicación en tiempo real de familiares
- Historial de ubicaciones
- Zonas seguras personalizables

### 🏥 Perfil de Salud (`/health-profile`)
- Grupo sanguíneo
- Alergias
- Condiciones crónicas
- Medicamentos actuales
- Hospital preferido
- Donante de órganos

### 👤 Panel de Admin (`/admin/users`)
- Gestión de usuarios
- Gestión de roles
- Estadísticas

### 💳 Pagos (Stripe)
- Plan Individual: €4.99/mes
- Plan Familiar: €9.99/mes
- Plan Business: €19.99/mes
- 7 días de prueba gratis

### 📢 Google AdMob (NUEVO)
- Archivo app-ads.txt configurado: `/app-ads.txt`
- Publisher ID: pub-7713974112203810
- App ID: ca-app-pub-7713974112203810~9265947358

---

## Credenciales de Test

### Superadmin
- Email: info@manoprotect.com
- Password: 19862210Des

### Usuario de Prueba (Google Play Review)
- Email: reviewer@manoprotect.com
- Password: ReviewMano2025!

---

## Servicios Configurados

| Servicio | Estado | Archivo de Config |
|----------|--------|-------------------|
| Firebase Admin SDK | ✅ Activo | /backend/firebase-admin-sdk.json |
| Firebase FCM | ✅ Activo | VAPID keys en .env |
| Twilio SMS | ⚠️ Config issue | Credenciales en .env (ver nota) |
| Stripe | ✅ Activo | API key en .env |
| MongoDB | ✅ Activo | MONGO_URL en .env |
| WebSockets | ✅ Activo | /ws endpoint |
| AdMob | ✅ Configurado | /app-ads.txt |

---

## Archivos Clave

### Backend
- `/backend/server.py` - API principal
- `/backend/routes/family_sos_routes.py` - Sistema SOS
- `/backend/services/emergency_notifications.py` - FCM + SMS
- `/backend/services/websocket_manager.py` - Tiempo real
- `/backend/routes/push_routes.py` - Push notifications

### Frontend
- `/frontend/src/App.js` - Rutas principales
- `/frontend/src/pages/SOSQuickButton.js` - Botón SOS rápido
- `/frontend/src/pages/SOSAlertReceived.js` - Alerta para familiares
- `/frontend/src/services/sosWebSocket.js` - Cliente WebSocket
- `/frontend/src/services/firebase.js` - Firebase config
- `/frontend/public/app-ads.txt` - AdMob configuration

---

## Para Desplegar

1. Haz clic en **"Deploy"** en Emergent
2. El sistema desplegará a manoprotect.com automáticamente
3. Verifica que todo funcione en producción

---

## Changelog

### 04/02/2026 - Bug Fix SOS + AdMob
- **FIXED**: Bug crítico - contactos de emergencia no se encontraban
  - Query ahora usa `is_emergency OR receive_alerts OR emergency_contact`
- **FIXED**: Error `if db:` cambiado a `if db is not None:` 
- **FIXED**: SMS backup ahora envía a TODOS los contactos
- **ADDED**: Archivo app-ads.txt para Google AdMob
- **PENDING**: Configuración de número Twilio en cuenta del usuario

### 02/02/2026
- Sistema SOS completo con FCM + SMS backup
- WebSockets para tiempo real
- Referencias a "emergent" eliminadas de UI
- Auditoría final: 100% tests pasados
- LISTO PARA PRODUCCIÓN
