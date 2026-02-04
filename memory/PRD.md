# ManoProtect - PRD Final

## ✅ LISTO PARA PRODUCCIÓN
**Fecha:** 04/02/2026

---

## Sistema Verificado

### SMS (Infobip) ✅
- Saldo: 19.82 EUR
- SMS de prueba: Recibidos correctamente
- Alertas SOS: Funcionando

### Funcionalidades Principales

#### 🆘 Sistema SOS
- Botón SOS con countdown 3s
- GPS preciso + dirección exacta
- Mapa en tiempo real (OpenStreetMap)
- SMS a familiares (Infobip)
- Notificaciones push (Firebase FCM)
- Sirena en dispositivo receptor

#### 👨‍👩‍👧‍👦 Localización Familiar
- "Solicitar Ubicación" envía notificación al familiar
- Familiar comparte ubicación desde su móvil
- Historial de ubicaciones

#### 📍 Geofencing / Zonas Seguras ✅ NUEVO
- Zonas preconfiguradas: Casa 🏠, Trabajo 💼, Colegio 🏫
- Zonas personalizadas ilimitadas (premium)
- Radio configurable: 50-500 metros
- Alertas de ENTRADA y SALIDA
- Notificaciones SMS (Infobip) + Push (FCM)
- Historial de eventos de entrada/salida
- Restricción por plan: 1 zona gratis, ilimitadas premium
- Mapa interactivo para definir ubicación

#### 🛡️ Anti-Estafas
- Detección de phishing, smishing, vishing
- Verificador de enlaces

---

## Integraciones

| Servicio | Estado | Credenciales |
|----------|--------|--------------|
| Infobip SMS | ✅ 19.82€ | .env configurado |
| Firebase FCM | ✅ | firebase-admin-sdk.json |
| Stripe | ✅ | .env configurado |
| MongoDB | ✅ | .env configurado |
| OpenStreetMap | ✅ | Gratis |

---

## Archivos Clave

- `/backend/services/infobip_sms.py` - SMS
- `/backend/services/emergency_notifications.py` - FCM + SMS
- `/backend/routes/geofence_routes.py` - CRUD Geofencing + detección
- `/frontend/src/pages/SafeZones.js` - Página zonas seguras
- `/frontend/src/components/PushNotificationPrompt.jsx` - Permisos push
- `/frontend/src/components/LiveLocationMap.jsx` - Mapa
- `/frontend/src/services/geolocation.js` - GPS + direcciones
- `/frontend/public/firebase-messaging-sw.js` - Service Worker FCM

---

## API Endpoints Geofencing

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/geofences` | GET | Listar zonas del usuario |
| `/api/geofences` | POST | Crear nueva zona |
| `/api/geofences/{id}` | GET | Obtener detalles zona |
| `/api/geofences/{id}` | PUT | Actualizar zona |
| `/api/geofences/{id}` | DELETE | Eliminar zona |
| `/api/geofences/check-location` | POST | Verificar entrada/salida |
| `/api/geofences/events` | GET | Historial de eventos |
| `/api/geofences/member-states` | GET | Estado actual miembros |

---

## Credenciales Test

| Usuario | Email | Password |
|---------|-------|----------|
| Admin | info@manoprotect.com | 19862210Des |
| Test | reviewer@manoprotect.com | ReviewMano2025! |

---

## Deploy

1. **Save to Github** → manoprotect.com / main
2. **Deploy** → Producción

---

## Tareas Completadas

- [x] Migración Twilio → Infobip
- [x] Sistema SOS con GPS preciso
- [x] Notificaciones Push FCM
- [x] Localización familiar bajo demanda
- [x] **Geofencing / Zonas Seguras** (04/02/2026)

## Tareas Pendientes

- [ ] Implementar AdMob intersticiales (guía en `/app/frontend/public/docs/`)
- [ ] Refactorizar server.py y App.js
- [ ] Auditoría completa _id MongoDB
