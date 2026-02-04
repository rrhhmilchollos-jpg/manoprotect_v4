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

/**
 * ManoProtect - Splash Activity con Anuncio Intersticial
 * 
 * Esta actividad muestra un anuncio intersticial antes de cargar la TWA principal.
 * 
 * CONFIGURACIÓN:
 * 1. Añade esta clase al proyecto Android generado por PWABuilder
 * 2. Actualiza AndroidManifest.xml para usar esta como LAUNCHER
 * 3. Reemplaza INTERSTITIAL_AD_UNIT_ID con tu ID real de AdMob
 * 
 * POLÍTICAS:
 * - El anuncio se muestra máximo 1 vez por sesión
 * - Si no carga en 3 segundos, continúa sin anuncio
 * - No se muestra durante emergencias
 */
public class SplashAdActivity extends AppCompatActivity {

    private static final String TAG = "ManoProtect_Splash";
    
    // ⚠️ REEMPLAZAR con tu Unit ID real de AdMob
    // Para testing usa: "ca-app-pub-3940256099942544/1033173712"
    private static final String INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-7713974112203810/XXXXXXXXXX";
    
    // Timeout para cargar anuncio (3 segundos)
    private static final int AD_LOAD_TIMEOUT_MS = 3000;
    
    private InterstitialAd mInterstitialAd;
    private boolean adShown = false;
    private boolean activityDestroyed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Opcional: setContentView para splash screen visual
        // setContentView(R.layout.activity_splash);
        
        Log.d(TAG, "Iniciando ManoProtect...");
        
        // Inicializar AdMob SDK
        MobileAds.initialize(this, initializationStatus -> {
            Log.d(TAG, "AdMob SDK inicializado");
            loadInterstitialAd();
        });
        
        // Timeout: si el anuncio no carga en 3 segundos, continuar
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!adShown && !activityDestroyed) {
                Log.d(TAG, "Timeout - continuando sin anuncio");
                continueToApp();
            }
        }, AD_LOAD_TIMEOUT_MS);
    }

    private void loadInterstitialAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        
        InterstitialAd.load(
            this,
            INTERSTITIAL_AD_UNIT_ID,
            adRequest,
            new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    Log.d(TAG, "Anuncio intersticial cargado");
                    mInterstitialAd = interstitialAd;
                    showInterstitialAd();
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.e(TAG, "Error cargando anuncio: " + loadAdError.getMessage());
                    mInterstitialAd = null;
                    if (!adShown && !activityDestroyed) {
                        continueToApp();
                    }
                }
            }
        );
    }

    private void showInterstitialAd() {
        if (mInterstitialAd == null || activityDestroyed) {
            continueToApp();
            return;
        }

        mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                Log.d(TAG, "Anuncio cerrado por usuario");
                adShown = true;
                mInterstitialAd = null;
                continueToApp();
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                Log.e(TAG, "Error mostrando anuncio: " + adError.getMessage());
                mInterstitialAd = null;
                continueToApp();
            }

            @Override
            public void onAdShowedFullScreenContent() {
                Log.d(TAG, "Anuncio mostrado");
                adShown = true;
            }
        });

        mInterstitialAd.show(this);
    }

    private void continueToApp() {
        if (activityDestroyed) return;
        
        Log.d(TAG, "Iniciando TWA principal...");
        
        // Lanzar la actividad TWA principal
        // El nombre de la clase puede variar según PWABuilder
        try {
            Intent intent = new Intent(this, LauncherActivity.class);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error lanzando TWA: " + e.getMessage());
            // Fallback: intentar con nombre alternativo
            try {
                Intent intent = new Intent();
                intent.setClassName(getPackageName(), getPackageName() + ".LauncherActivity");
                startActivity(intent);
            } catch (Exception e2) {
                Log.e(TAG, "Error en fallback: " + e2.getMessage());
            }
        }
        
        finish();
    }

    @Override
    protected void onDestroy() {
        activityDestroyed = true;
        super.onDestroy();
    }
}
