# ManoProtect - Guía de Configuración de Anuncios

## 🎯 Plataformas de Publicidad Configuradas

### 1. Facebook & Instagram Ads
**Archivo:** `/ads/facebook-pixel.js`

**Configuración:**
1. Ir a [Facebook Business Manager](https://business.facebook.com)
2. Crear Pixel de Facebook
3. Copiar Pixel ID
4. Reemplazar en `facebook-pixel.js`: `const FB_PIXEL_ID = 'TU_ID'`

**Eventos configurados:**
- `CompleteRegistration` - Registro completado
- `ViewContent` - Ver plan
- `AddToCart` - Añadir al carrito
- `InitiateCheckout` - Iniciar pago
- `Purchase` - Compra completada
- `Lead` - Lead generado
- `Contact` - Contacto

---

### 2. TikTok Ads
**Archivo:** `/ads/tiktok-pixel.js`

**Configuración:**
1. Ir a [TikTok Ads Manager](https://ads.tiktok.com)
2. Crear Pixel
3. Copiar Pixel ID
4. Reemplazar: `const TIKTOK_PIXEL_ID = 'TU_ID'`

**Eventos:**
- `CompleteRegistration`
- `ViewContent`
- `AddToCart`
- `InitiateCheckout`
- `CompletePayment`
- `Download`
- `Contact`

---

### 3. Twitter/X Ads
**Archivo:** `/ads/twitter-pixel.js`

**Configuración:**
1. Ir a [Twitter Ads](https://ads.twitter.com)
2. Crear Universal Website Tag
3. Copiar Pixel ID
4. Reemplazar: `const TWITTER_PIXEL_ID = 'TU_ID'`

---

### 4. LinkedIn Ads
**Archivo:** `/ads/linkedin-pixel.js`

**Configuración:**
1. Ir a [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager)
2. Crear Insight Tag
3. Copiar Partner ID
4. Reemplazar: `const LINKEDIN_PARTNER_ID = 'TU_ID'`

---

### 5. Snapchat Ads
**Archivo:** `/ads/snapchat-pixel.js`

**Configuración:**
1. Ir a [Snapchat Ads Manager](https://ads.snapchat.com)
2. Crear Snap Pixel
3. Copiar Pixel ID
4. Reemplazar: `const SNAPCHAT_PIXEL_ID = 'TU_ID'`

---

### 6. Pinterest Ads
**Archivo:** `/ads/pinterest-pixel.js`

**Configuración:**
1. Ir a [Pinterest Ads](https://ads.pinterest.com)
2. Crear Pinterest Tag
3. Copiar Tag ID
4. Reemplazar: `const PINTEREST_TAG_ID = 'TU_ID'`

---

### 7. Google Ads (AdWords)
**Archivo:** `/google-ads/conversion-tracking.js`

**Configuración:**
1. Ir a [Google Ads](https://ads.google.com)
2. Crear acciones de conversión
3. Obtener Conversion ID y Labels
4. Reemplazar en el archivo

---

## 📊 Gestor Unificado de Anuncios

**Archivo:** `/ads/unified-ads-manager.js`

### Uso en código:
```javascript
// Registro de usuario
ManoAds.trackSignUp({ email: 'user@email.com' });

// Ver plan
ManoAds.trackViewContent({ id: 'family-monthly', name: 'Plan Familiar', price: 4.99 });

// Compra
ManoAds.trackPurchase({ id: 'tx_123', amount: 4.99, plan_id: 'family-monthly' });

// Eventos personalizados
ManoAds.trackSOSActivated({ location: 'Madrid' });
ManoAds.trackSafeZoneCreated({ name: 'Casa', radius: 200 });
ManoAds.trackFamilyMemberAdded({ type: 'child' });
```

---

## 🎁 Anuncios Bonificados (Rewarded Ads)

**Archivos:**
- `/ads/rewarded-ads.js` - Lógica de anuncios
- `/src/components/RewardedAdsPanel.jsx` - Componente React

### Recompensas disponibles:
| Recompensa | ID | Descripción |
|------------|-----|-------------|
| 1 Día Premium | `premium_day` | 24h de funciones premium |
| Zona Extra | `extra_zone` | 1 zona segura adicional |
| Análisis Gratis | `threat_scan` | Analizar 1 mensaje sospechoso |

### Límites:
- **5 anuncios/día** por usuario
- Se resetea a medianoche

### Uso:
```jsx
import RewardedAdsPanel from '@/components/RewardedAdsPanel';

<RewardedAdsPanel 
  onRewardClaimed={(reward) => {
    console.log('Recompensa obtenida:', reward);
  }}
/>
```

---

## 📱 AdMob (App Nativa)

### Intersticiales
**Archivo:** `/android/LauncherActivity.java`

**IDs:**
- App ID: `ca-app-pub-7713974112203810~9265947358`
- Test Intersticial: `ca-app-pub-3940256099942544/1033173712`

### Rewarded (Video)
Configurar en AdMob Console y añadir ID en `rewarded-ads.js`

---

## 🔧 Verificación

### Comprobar que los píxeles cargan:
1. Abrir DevTools (F12)
2. Ir a Network
3. Buscar:
   - `fbevents.js` (Facebook)
   - `analytics.tiktok.com` (TikTok)
   - `static.ads-twitter.com` (Twitter)
   - `snap.licdn.com` (LinkedIn)
   - `sc-static.net` (Snapchat)
   - `s.pinimg.com` (Pinterest)

### Extensiones útiles:
- Facebook Pixel Helper
- TikTok Pixel Helper
- Google Tag Assistant

---

## 📈 Audiencias Recomendadas

### Facebook/Instagram:
- Lookalike de compradores
- Retargeting visitantes pricing
- Intereses: seguridad familiar, protección niños

### TikTok:
- Padres 25-45 años
- Intereses: familia, tecnología, seguridad

### LinkedIn:
- Empresas B2B
- Decisores de seguridad IT
- Recursos Humanos

---

## 💰 Presupuesto Sugerido Inicial

| Plataforma | Diario | Mensual |
|------------|--------|---------|
| Facebook/Instagram | 10€ | 300€ |
| TikTok | 5€ | 150€ |
| Google Ads | 15€ | 450€ |
| **Total** | **30€** | **900€** |

Ajustar según resultados de los primeros 7 días.
