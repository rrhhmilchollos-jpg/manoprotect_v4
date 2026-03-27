# 📱 Guía Completa: Añadir Anuncios Intersticiales a ManoProtect TWA

## 📋 Requisitos Previos

Antes de empezar necesitas:
- ✅ App aprobada en Google Play (estado: "En revisión" actualmente)
- ✅ Android Studio instalado en tu ordenador
- ✅ Cuenta de AdMob configurada (ya la tienes: pub-7713974112203810)

---

## 🎯 ¿Qué vamos a hacer?

Vamos a añadir un **anuncio intersticial** (pantalla completa) que aparece cuando el usuario abre la app, ANTES de cargar la aplicación web.

```
Usuario abre app → Anuncio Intersticial (3-5 seg) → App ManoProtect carga
```

---

## 📝 PASO 1: Crear Unit ID de Intersticial en AdMob

### 1.1 Accede a AdMob
1. Ve a https://apps.admob.com
2. Inicia sesión con tu cuenta Google

### 1.2 Selecciona tu App
1. En el menú izquierdo, haz clic en **"Apps"**
2. Busca y selecciona **"manoprotect"** (com.manoprotect.www.twa)

### 1.3 Crear Nueva Unidad de Anuncio
1. Haz clic en **"Unidades de anuncios"** en el menú lateral
2. Haz clic en el botón **"Añadir unidad de anuncios"**
3. Selecciona **"Intersticial"**

### 1.4 Configurar el Intersticial
1. **Nombre de la unidad**: `ManoProtect - Splash Intersticial`
2. **Configuración avanzada**: Dejar por defecto
3. Haz clic en **"Crear unidad de anuncios"**

### 1.5 Guardar el ID
AdMob te mostrará algo como:
```
ID de unidad de anuncios: ca-app-pub-7713974112203810/1234567890
                          ^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^
                          Tu Publisher ID           Unit ID único
```

**⚠️ IMPORTANTE: Copia y guarda este ID completo. Lo necesitarás en el Paso 4.**

---

## 📝 PASO 2: Descargar Proyecto de PWABuilder

### 2.1 Accede a PWABuilder
1. Ve a https://www.pwabuilder.com
2. Ingresa tu URL: `https://manoprotectt.com`
3. Espera a que analice tu PWA

### 2.2 Generar Paquete Android
1. Haz clic en **"Package for stores"**
2. Selecciona **"Android"**
3. En opciones, selecciona **"Android Studio project"** (NO APK directo)
4. Haz clic en **"Download"**

### 2.3 Extraer el Proyecto
1. Descomprime el archivo ZIP descargado
2. Tendrás una carpeta con estructura similar a:
```
manoprotect-twa/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/manoprotect/www/twa/
│   │       │   └── LauncherActivity.java
│   │       ├── res/
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
└── build.gradle
```

---

## 📝 PASO 3: Abrir Proyecto en Android Studio

### 3.1 Abrir Android Studio
1. Abre Android Studio
2. Selecciona **"Open an Existing Project"**
3. Navega hasta la carpeta `manoprotect-twa` que descomprimiste
4. Haz clic en **"OK"**

### 3.2 Esperar Sincronización
1. Android Studio descargará las dependencias
2. Espera a que termine (puede tardar 2-5 minutos)
3. Verás "Gradle sync finished" cuando termine

---

## 📝 PASO 4: Añadir Dependencia de AdMob

### 4.1 Abrir build.gradle (app level)
1. En el panel izquierdo, expande **"Gradle Scripts"**
2. Haz doble clic en **"build.gradle (Module: app)"**

### 4.2 Añadir Dependencia
Busca la sección `dependencies { }` y añade esta línea:

```gradle
dependencies {
    // ... otras dependencias existentes ...
    
    // AÑADIR ESTA LÍNEA:
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

### 4.3 Sincronizar
1. Haz clic en **"Sync Now"** (aparece arriba en una barra amarilla)
2. Espera a que termine

---

## 📝 PASO 5: Añadir App ID en AndroidManifest.xml

### 5.1 Abrir AndroidManifest.xml
1. En el panel izquierdo, navega a:
   `app > src > main > AndroidManifest.xml`
2. Haz doble clic para abrir

### 5.2 Añadir Meta-data de AdMob
Dentro de `<application>`, añade ANTES de cualquier `<activity>`:

```xml
<application
    android:allowBackup="true"
    ... >

    <!-- AÑADIR ESTO: -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-7713974112203810~9265947358"/>

    <!-- Resto del contenido... -->
    <activity android:name=".LauncherActivity" ... >
```

---

## 📝 PASO 6: Crear SplashAdActivity.java

### 6.1 Crear Nuevo Archivo Java
1. En el panel izquierdo, navega a:
   `app > src > main > java > com > manoprotect > www > twa`
2. Haz clic derecho en la carpeta `twa`
3. Selecciona **"New" > "Java Class"**
4. Nombre: `SplashAdActivity`
5. Haz clic en **"OK"**

### 6.2 Copiar Este Código Completo

**⚠️ IMPORTANTE: Reemplaza `XXXXXXXXXX` con el Unit ID que copiaste en el Paso 1.5**

```java
package com.manoprotect.www.twa;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;

public class SplashAdActivity extends AppCompatActivity {

    private static final String TAG = "ManoProtect";
    
    // ⚠️ REEMPLAZA XXXXXXXXXX CON TU UNIT ID DE INTERSTICIAL
    private static final String AD_UNIT_ID = "ca-app-pub-7713974112203810/XXXXXXXXXX";
    
    private InterstitialAd mInterstitialAd;
    private boolean hasNavigated = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "Iniciando ManoProtect...");
        
        // Inicializar SDK de AdMob
        MobileAds.initialize(this, initializationStatus -> {
            Log.d(TAG, "AdMob inicializado");
            loadAd();
        });
        
        // Si el anuncio no carga en 3 segundos, continuar sin él
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!hasNavigated) {
                Log.d(TAG, "Timeout - continuando sin anuncio");
                goToMainApp();
            }
        }, 3000);
    }

    private void loadAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        
        InterstitialAd.load(this, AD_UNIT_ID, adRequest, 
            new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    Log.d(TAG, "Anuncio cargado correctamente");
                    mInterstitialAd = interstitialAd;
                    showAd();
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.e(TAG, "Error cargando anuncio: " + loadAdError.getMessage());
                    mInterstitialAd = null;
                    goToMainApp();
                }
            });
    }

    private void showAd() {
        if (mInterstitialAd == null || hasNavigated) {
            goToMainApp();
            return;
        }

        mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                // Usuario cerró el anuncio
                Log.d(TAG, "Anuncio cerrado");
                goToMainApp();
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                Log.e(TAG, "Error mostrando anuncio: " + adError.getMessage());
                goToMainApp();
            }

            @Override
            public void onAdShowedFullScreenContent() {
                Log.d(TAG, "Anuncio mostrado");
                mInterstitialAd = null;
            }
        });

        mInterstitialAd.show(this);
    }

    private void goToMainApp() {
        if (hasNavigated) return;
        hasNavigated = true;
        
        Log.d(TAG, "Abriendo app principal...");
        
        // Abrir la TWA principal
        Intent intent = new Intent(this, LauncherActivity.class);
        startActivity(intent);
        finish();
    }
}
```

---

## 📝 PASO 7: Modificar AndroidManifest.xml para Usar SplashAdActivity

### 7.1 Abrir AndroidManifest.xml de nuevo

### 7.2 Buscar el LauncherActivity actual
Verás algo como:
```xml
<activity
    android:name=".LauncherActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### 7.3 Modificar para que SplashAdActivity sea el Launcher

Cambia a:
```xml
<!-- NUEVA: SplashAdActivity como launcher (primera en abrir) -->
<activity
    android:name=".SplashAdActivity"
    android:exported="true"
    android:theme="@style/Theme.AppCompat.NoActionBar">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>

<!-- MODIFICADA: LauncherActivity ya no es launcher -->
<activity
    android:name=".LauncherActivity"
    android:exported="true">
    <!-- Quitar el intent-filter de LAUNCHER -->
</activity>
```

---

## 📝 PASO 8: Probar en Emulador o Dispositivo

### 8.1 Conectar Dispositivo o Crear Emulador
- **Opción A**: Conecta tu teléfono Android por USB (activa "Depuración USB")
- **Opción B**: Crea un emulador: Tools > Device Manager > Create Device

### 8.2 Ejecutar la App
1. Haz clic en el botón verde **"Run"** (▶️) en la barra superior
2. Selecciona tu dispositivo/emulador
3. Espera a que se instale

### 8.3 Verificar
1. La app debería abrir
2. Debería aparecer un anuncio (o un mensaje de prueba)
3. Al cerrar el anuncio, debería cargar ManoProtect

---

## 📝 PASO 9: Generar APK/AAB para Subir a Google Play

### 9.1 Generar App Bundle (recomendado)
1. En Android Studio: **Build > Generate Signed Bundle / APK**
2. Selecciona **"Android App Bundle"**
3. Haz clic en **"Next"**

### 9.2 Configurar Firma
1. Si no tienes keystore:
   - Haz clic en **"Create new..."**
   - Rellena los datos (guarda la contraseña!)
2. Si ya tienes keystore (de PWABuilder):
   - Selecciona el archivo .keystore existente
3. Haz clic en **"Next"**

### 9.3 Seleccionar Variante
1. Selecciona **"release"**
2. Haz clic en **"Finish"**
3. El archivo .aab se generará en `app/release/`

---

## 📝 PASO 10: Subir Nueva Versión a Google Play

### 10.1 Acceder a Google Play Console
1. Ve a https://play.google.com/console
2. Selecciona tu app **"manoprotect"**

### 10.2 Crear Nueva Versión
1. Ve a **"Producción"** (o el track que uses)
2. Haz clic en **"Crear nueva versión"**
3. Sube el archivo .aab generado
4. Incrementa el número de versión si es necesario
5. Añade notas de la versión:
   ```
   - Mejoras de rendimiento
   - Optimizaciones de carga
   ```
6. Haz clic en **"Revisar versión"** y luego **"Iniciar lanzamiento"**

---

## ✅ Resumen de Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `build.gradle (app)` | Añadida dependencia AdMob |
| `AndroidManifest.xml` | Añadido App ID + SplashAdActivity |
| `SplashAdActivity.java` | Archivo NUEVO creado |

---

## ⚠️ Notas Importantes

1. **Para Testing**: Usa el Unit ID de prueba de Google:
   ```
   ca-app-pub-3940256099942544/1033173712
   ```
   Cámbialo por el tuyo real SOLO cuando vayas a publicar.

2. **Política de AdMob**: 
   - No muestres más de 1 intersticial cada 60 segundos
   - No muestres anuncios inmediatamente después de acciones del usuario
   - El anuncio de splash es aceptable porque es al inicio

3. **Ingresos Estimados**:
   - eCPM típico España: €1-5 por 1000 impresiones
   - Con 1000 usuarios/día = €1-5/día potencial

---

## 🆘 ¿Problemas?

| Error | Solución |
|-------|----------|
| "Cannot find symbol" | Verificar imports y sincronizar Gradle |
| "Ad failed to load" | Verificar Unit ID y conexión a internet |
| App no abre | Verificar AndroidManifest.xml está bien formado |
| Anuncio no aparece | En testing, los anuncios tardan en aparecer |

---

¿Necesitas ayuda con algún paso específico? 🤔
