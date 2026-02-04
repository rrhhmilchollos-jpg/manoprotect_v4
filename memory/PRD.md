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
- `/frontend/src/components/PushNotificationPrompt.jsx` - Permisos push
- `/frontend/src/components/LiveLocationMap.jsx` - Mapa
- `/frontend/src/services/geolocation.js` - GPS + direcciones
- `/frontend/public/firebase-messaging-sw.js` - Service Worker FCM

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
