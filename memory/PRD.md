# ManoProtect - PRD (Product Requirements Document)

## Estado: ✅ LISTO PARA DEPLOY
**Fecha:** 04/02/2026
**Versión:** 2.0

---

## Resumen de Funcionalidades

### 🆘 Sistema SOS de Emergencia
- Botón SOS con cuenta atrás de 3 segundos
- GPS de alta precisión con dirección exacta
- Mapa en tiempo real (OpenStreetMap/Leaflet)
- Notificaciones push (Firebase FCM)
- SMS de backup (Infobip)
- Sirena de alerta en dispositivo receptor

### 👨‍👩‍👧‍👦 Localización Familiar
- Botón "Localizar Ahora" envía solicitud al familiar
- Página `/compartir-ubicacion` para responder
- Notificación push + SMS al familiar
- Historial de ubicaciones (7 días)
- Modo silencioso opcional

### 🛡️ Protección Anti-Estafas
- Detección de phishing (emails)
- Detección de smishing (SMS)
- Bloqueo de vishing (llamadas)
- Verificador de enlaces sospechosos

### 💳 Pagos (Stripe)
- Plan Individual: €4.99/mes
- Plan Familiar: €9.99/mes
- Plan Business: €19.99/mes
- 7 días de prueba gratis

---

## Cambios Realizados Hoy (04/02/2026)

### ✅ Infobip SMS (reemplaza Twilio)
- Nuevo servicio: `/backend/services/infobip_sms.py`
- Credenciales configuradas en `.env`
- SMS de prueba enviado y recibido correctamente

### ✅ Geolocalización Precisa
- Nuevo servicio: `/frontend/src/services/geolocation.js`
- Reverse geocoding con Nominatim (gratis)
- Dirección exacta: calle, ciudad, código postal, provincia

### ✅ Mapa en Tiempo Real
- Nuevo componente: `/frontend/src/components/LiveLocationMap.jsx`
- OpenStreetMap + Leaflet (gratis, ilimitado)
- Marcador de ubicación con círculo de precisión

### ✅ Landing Page Rediseñada
- Dos secciones separadas claramente:
  - **Protección Familiar** (rojo) - SOS, ubicación
  - **Protección Anti-Estafas** (azul) - fraudes, phishing

### ✅ Página Compartir Ubicación
- Nueva página: `/frontend/src/pages/CompartirUbicacion.js`
- Ruta: `/compartir-ubicacion?req={request_id}`
- Muestra mapa + dirección + botones

### ✅ Página Instrucciones Familiares
- Ruta: `/instrucciones-familiares`
- Guía paso a paso para familiares
- Compartir por WhatsApp

---

## Integraciones Configuradas

| Servicio | Estado | Credenciales |
|----------|--------|--------------|
| Firebase FCM | ✅ | firebase-admin-sdk.json |
| Infobip SMS | ✅ | INFOBIP_API_KEY en .env |
| Stripe | ✅ | STRIPE_API_KEY en .env |
| MongoDB | ✅ | MONGO_URL en .env |
| OpenStreetMap | ✅ | Gratis (sin API key) |
| Nominatim | ✅ | Gratis (sin API key) |
| Google Analytics | ✅ | G-8KECMQS45X |
| Google Tag Manager | ✅ | GTM-MK53XZ8Q |
| AdMob | ✅ | pub-7713974112203810 |

---

## Archivos Principales

### Backend
```
/backend/
├── server.py
├── services/
│   ├── infobip_sms.py          # SMS (NUEVO)
│   ├── emergency_notifications.py
│   └── ...
├── routes/
│   ├── family_sos_routes.py    # SOS + Localización
│   ├── auth_routes.py
│   └── ...
└── firebase-admin-sdk.json
```

### Frontend
```
/frontend/
├── src/
│   ├── pages/
│   │   ├── SOSQuickButton.js      # Botón SOS + Mapa
│   │   ├── CompartirUbicacion.js  # NUEVO
│   │   ├── InstruccionesFamiliares.js
│   │   ├── LandingPage.js         # Rediseñada
│   │   └── ...
│   ├── components/
│   │   └── LiveLocationMap.jsx    # NUEVO
│   └── services/
│       └── geolocation.js         # NUEVO
└── public/
    ├── app-ads.txt
    ├── sitemap.xml
    └── sw.js
```

---

## Credenciales de Test

| Usuario | Email | Password |
|---------|-------|----------|
| Superadmin | info@manoprotect.com | 19862210Des |
| Test User | mrisolaz130@gmail.com | 19862210Des! |
| Reviewer | reviewer@manoprotect.com | ReviewMano2025! |

---

## URLs

- **Producción:** https://manoprotect.com
- **Preview:** https://safety-alert-app-1.preview.emergentagent.com

---

## Para Hacer Deploy

1. Clic en **"Save to Github"** → repo: manoprotect.com, branch: main
2. Clic en **"Deploy"** → Despliega a producción

---

## Tareas Futuras (Backlog)

- [ ] Refactorización de server.py (modularizar)
- [ ] Auditoría completa de _id MongoDB
- [ ] Anuncios AdMob intersticiales nativos
- [ ] App nativa Android/iOS con Capacitor
