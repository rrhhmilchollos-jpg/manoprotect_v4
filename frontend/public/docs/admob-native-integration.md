# ManoProtect - Guía de Integración AdMob en App Nativa (TWA)

## Información de tu cuenta AdMob

```
Publisher ID: pub-7713974112203810
App ID: ca-app-pub-7713974112203810~9265947358
Rewarded Video Unit: ca-app-pub-7713974112203810/4909676040
Native Ad Unit: ca-app-pub-7713974112203810/5727933690
```

---

## Opción 1: Anuncios Intersticiales en Momentos Clave (RECOMENDADO)

Como tu app es una TWA (Trusted Web Activity), la mejor estrategia es mostrar anuncios
nativos en transiciones específicas:

### Momentos ideales para anuncios:
1. **Splash Screen** - Al abrir la app (intersticial)
2. **Entre pantallas** - Al navegar a secciones importantes
3. **Después de completar acciones** - Tras cancelar SOS, ver reportes, etc.

### Implementación en Android Studio:

#### 1. Añadir dependencia en `app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

#### 2. Añadir App ID en `AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <!-- AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-7713974112203810~9265947358"/>
        
        <!-- Tu TWA LauncherActivity existente -->
        <activity android:name="...">
            ...
        </activity>
    </application>
</manifest>
```

#### 3. Crear SplashActivity con Intersticial:

```kotlin
// SplashActivity.kt
package com.manoprotect.www.twa

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class SplashActivity : AppCompatActivity() {
    
    private var mInterstitialAd: InterstitialAd? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inicializar AdMob
        MobileAds.initialize(this) { }
        
        // Cargar anuncio intersticial
        loadInterstitialAd()
    }
    
    private fun loadInterstitialAd() {
        val adRequest = AdRequest.Builder().build()
        
        InterstitialAd.load(
            this,
            "ca-app-pub-7713974112203810/XXXXXXXXXX", // Tu unit ID de intersticial
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(interstitialAd: InterstitialAd) {
                    mInterstitialAd = interstitialAd
                    showAdThenContinue()
                }
                
                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    mInterstitialAd = null
                    continueToApp()
                }
            }
        )
        
        // Timeout - si no carga en 3 segundos, continuar
        Handler(Looper.getMainLooper()).postDelayed({
            if (mInterstitialAd == null) {
                continueToApp()
            }
        }, 3000)
    }
    
    private fun showAdThenContinue() {
        mInterstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                continueToApp()
            }
            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                continueToApp()
            }
        }
        mInterstitialAd?.show(this)
    }
    
    private fun continueToApp() {
        // Lanzar la TWA principal
        startActivity(Intent(this, LauncherActivity::class.java))
        finish()
    }
}
```

#### 4. Actualizar AndroidManifest para usar SplashActivity primero:

```xml
<!-- SplashActivity como launcher -->
<activity
    android:name=".SplashActivity"
    android:exported="true"
    android:theme="@style/Theme.Splash">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

<!-- TWA Activity (ya no es launcher) -->
<activity
    android:name="com.manoprotect.www.twa.LauncherActivity"
    android:exported="true">
    <!-- Sin intent-filter LAUNCHER -->
</activity>
```

---

## Opción 2: Rewarded Video en la Web (Funciona en TWA)

Para anuncios con recompensa, puedes usar la API web de AdMob que ya 
implementamos en `/app/frontend/src/services/admob.js`.

Los usuarios verán el anuncio dentro del contexto web de la TWA.

### Ubicaciones implementadas:
- Dashboard (para usuarios plan free)
- Componente `RewardedAdButton` disponible

---

## Opción 3: Crear Unit IDs Adicionales

En tu consola de AdMob, crea estas unidades adicionales:

1. **Intersticial (Splash)**: Para mostrar al abrir la app
2. **Intersticial (Transición)**: Para mostrar entre pantallas
3. **Banner (Opcional)**: Si decides usar WebView en lugar de TWA

### Pasos:
1. Ve a https://apps.admob.com
2. Selecciona tu app ManoProtect
3. "Unidades de anuncios" → "Añadir unidad de anuncios"
4. Selecciona "Intersticial"
5. Nombra: "ManoProtect - Splash Intersticial"
6. Copia el Unit ID generado

---

## Configuración Actual (Web)

Tu PWA ya tiene configurado:

| Archivo | Contenido |
|---------|-----------|
| `/app-ads.txt` | `google.com, pub-7713974112203810, DIRECT, f08c47fec0942fa0` |
| `/src/services/admob.js` | Servicio AdMob para web |
| `/src/components/ads/NativeAdBanner.jsx` | Banner nativo |
| `/src/components/ads/RewardedAdButton.jsx` | Botón de video recompensado |

---

## Política de AdMob - Importante

⚠️ **Reglas a seguir:**

1. No mostrar anuncios a menores de 13 años
2. No mostrar anuncios durante emergencias SOS (ya implementado)
3. Mínimo 1 interacción del usuario antes de intersticial
4. Máximo 1 intersticial cada 60 segundos
5. No cubrir contenido crítico con anuncios

---

## Testing

Para probar antes de publicar, usa estos Test Ad Unit IDs de Google:

```
Intersticial: ca-app-pub-3940256099942544/1033173712
Rewarded: ca-app-pub-3940256099942544/5224354917
Banner: ca-app-pub-3940256099942544/6300978111
Native: ca-app-pub-3940256099942544/2247696110
```

Reemplaza con tus Unit IDs reales solo para producción.

---

## Resumen de Monetización

| Tipo | Implementado | Dónde |
|------|--------------|-------|
| app-ads.txt | ✅ | Web (verificación AdMob) |
| Native Banner | ✅ | Dashboard (usuarios free) |
| Rewarded Video | ✅ | Componente disponible |
| Intersticial Splash | 📝 Guía | Requiere Android Studio |

---

## Próximos Pasos

1. ✅ La app web ya tiene AdMob configurado
2. ⏳ Esperar aprobación de Google Play
3. 📱 Después de aprobación, añadir intersticiales nativos si deseas
4. 💰 Monitorear ingresos en AdMob Dashboard

