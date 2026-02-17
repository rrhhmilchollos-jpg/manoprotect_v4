# ManoProtect - Protección Familiar contra Fraudes Digitales

<p align="center">
  <img src="frontend/public/manoprotect_logo.png" alt="ManoProtect Logo" width="200"/>
</p>

<p align="center">
  <strong>✅ LISTO PARA PRODUCCIÓN - 04/02/2026</strong>
</p>

## 🛡️ Descripción

ManoProtect es una aplicación de seguridad familiar con:
- **SOS de Emergencia**: Botón de pánico con notificaciones push, SMS y ubicación en tiempo real
- **Protección contra Fraudes**: Detección de phishing, smishing y estafas digitales con IA
- **Seguimiento Familiar**: Ubicación en tiempo real de familiares
- **Perfil de Salud**: Información médica para emergencias

## 🚀 Demo

- **Web**: [manoprotect.com](https://manoprotect.com)
- **Preview**: [safety-alert-app-1.preview.emergentagent.com](https://family-safety-stage.preview.emergentagent.com)

## 📱 Características

### Sistema SOS
- Botón de pánico con countdown de 3 segundos
- Notificaciones push instantáneas (Firebase FCM)
- SMS de backup (Twilio)
- Ubicación GPS en tiempo real (WebSocket)
- Sirena de alerta en dispositivo del receptor

### Pagos
- Integración con Stripe
- Planes: Individual (€4.99), Familiar (€9.99), Business (€19.99)
- 7 días de prueba gratis

### PWA
- Instalable en móvil
- Funciona offline
- Service Worker con push notifications

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI** (Python 3.11)
- **MongoDB** (Base de datos)
- **Firebase Admin SDK** (Push notifications)
- **Twilio** (SMS)
- **Stripe** (Pagos)
- **WebSockets** (Tiempo real)

### Frontend
- **React 18** con hooks
- **Tailwind CSS** + **shadcn/ui**
- **React Router** v6
- **Firebase** (Analytics, FCM)

## 📦 Instalación

### Requisitos
- Node.js 18+
- Python 3.11+
- MongoDB
- Cuentas en: Firebase, Twilio, Stripe

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn install
cp .env.example .env
# Editar .env con tus credenciales
yarn start
```

## 🔧 Configuración

### Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Cloud Messaging
3. Descargar `firebase-admin-sdk.json` y colocar en `/backend/`
4. Copiar las credenciales web a `frontend/.env`

### Twilio
1. Crear cuenta en [Twilio](https://www.twilio.com)
2. Obtener Account SID, Auth Token
3. Comprar un número de teléfono
4. Configurar en `backend/.env`

### Stripe
1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener API keys (live o test)
3. Configurar webhook para `/api/payments/webhook`

### AdMob
- Archivo `app-ads.txt` ya configurado en `/frontend/public/`
- Publisher ID: `pub-7713974112203810`

## 📁 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.py              # API principal
│   ├── routes/                # Endpoints
│   │   ├── auth.py           # Autenticación
│   │   ├── family_sos_routes.py  # Sistema SOS
│   │   └── payments.py       # Stripe
│   ├── services/             # Lógica de negocio
│   │   ├── emergency_notifications.py  # FCM + SMS
│   │   └── websocket_manager.py        # Tiempo real
│   ├── models/               # Esquemas Pydantic
│   └── firebase-admin-sdk.json
│
├── frontend/
│   ├── public/
│   │   ├── sw.js             # Service Worker
│   │   ├── manifest.json     # PWA manifest
│   │   ├── app-ads.txt       # AdMob
│   │   ├── sitemap.xml       # SEO
│   │   └── docs/             # Documentación AdMob, Marketing
│   └── src/
│       ├── pages/            # 43 páginas
│       ├── components/       # Componentes reutilizables
│       ├── services/         # Firebase, WebSocket, AdMob
│       └── context/          # AuthContext
│
└── memory/
    └── PRD.md                # Documentación del producto
```

## 🔐 Credenciales de Test

```
Superadmin: info@manoprotect.com / 19862210Des
Test User:  mrisolaz130@gmail.com / 19862210Des!
```

## 📊 Google Play Console

### Archivos para Android
- `/frontend/public/docs/android/build-gradle-admob.gradle` - Configuración Gradle
- `/frontend/public/docs/android/AndroidManifest-AdMob.xml` - Manifest con AdMob
- `/frontend/public/docs/android/SplashAdActivity.java` - Anuncios intersticiales

### Screenshots para Store
- `/frontend/public/androidxr_*.png` - Screenshots Android XR
- `/frontend/public/chromebook_*.png` - Screenshots Chromebook

## 📈 SEO

- Meta tags optimizados (Open Graph, Twitter Cards)
- Schema.org estructurado
- Sitemap XML
- Google Tag Manager: `GTM-MK53XZ8Q`
- Google Analytics: `G-8KECMQS45X`

## 📄 Licencia

Copyright © 2025 STARTBOOKING SL. Todos los derechos reservados.

## 📞 Soporte

- Web: [manoprotect.com](https://manoprotect.com)
- Email: info@manoprotect.com
