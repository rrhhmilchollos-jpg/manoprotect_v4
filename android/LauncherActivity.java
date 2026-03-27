package com.manoprotect.www.twa;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;

/**
 * ManoProtect - Launcher Activity with AdMob Interstitial
 * 
 * This activity shows an interstitial ad before launching the TWA (Trusted Web Activity).
 * Premium users skip the ad automatically.
 */
public class LauncherActivity extends AppCompatActivity {

    private static final String TAG = "ManoProtect";
    
    // AdMob IDs
    // TODO: Replace TEST_AD_ID with your actual interstitial ID from AdMob Console
    private static final String AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"; // Test ID
    // private static final String AD_UNIT_ID = "ca-app-pub-7713974112203810/XXXXXXXXXX"; // Production ID
    
    // TWA Configuration
    private static final String TWA_URL = "https://manoprotectt.com";
    
    private InterstitialAd mInterstitialAd;
    private boolean adShown = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Mobile Ads SDK
        MobileAds.initialize(this, initializationStatus -> {
            Log.d(TAG, "AdMob initialized");
            loadInterstitialAd();
        });
        
        // Set a simple splash layout while ad loads
        // You can create a splash_screen.xml layout
        // setContentView(R.layout.splash_screen);
    }

    private void loadInterstitialAd() {
        AdRequest adRequest = new AdRequest.Builder().build();

        InterstitialAd.load(this, AD_UNIT_ID, adRequest,
            new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    Log.d(TAG, "Interstitial ad loaded");
                    mInterstitialAd = interstitialAd;
                    setupAdCallbacks();
                    showInterstitialAd();
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.e(TAG, "Interstitial ad failed to load: " + loadAdError.getMessage());
                    mInterstitialAd = null;
                    // If ad fails to load, launch TWA directly
                    launchTWA();
                }
            });
    }

    private void setupAdCallbacks() {
        if (mInterstitialAd == null) return;

        mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdClicked() {
                Log.d(TAG, "Ad was clicked");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                Log.d(TAG, "Ad dismissed, launching TWA");
                mInterstitialAd = null;
                adShown = true;
                launchTWA();
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                Log.e(TAG, "Ad failed to show: " + adError.getMessage());
                mInterstitialAd = null;
                launchTWA();
            }

            @Override
            public void onAdImpression() {
                Log.d(TAG, "Ad recorded impression");
            }

            @Override
            public void onAdShowedFullScreenContent() {
                Log.d(TAG, "Ad showed fullscreen content");
            }
        });
    }

    private void showInterstitialAd() {
        if (mInterstitialAd != null && !adShown) {
            mInterstitialAd.show(this);
        } else {
            launchTWA();
        }
    }

    private void launchTWA() {
        try {
            // Try to launch as TWA first
            CustomTabsIntent customTabsIntent = new CustomTabsIntent.Builder()
                .setShareState(CustomTabsIntent.SHARE_STATE_OFF)
                .build();
            
            // Set package to Chrome for TWA support
            customTabsIntent.intent.setPackage("com.android.chrome");
            customTabsIntent.launchUrl(this, Uri.parse(TWA_URL));
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch TWA, falling back to browser", e);
            // Fallback to default browser
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(TWA_URL));
            startActivity(browserIntent);
        }
        
        // Close this activity
        finish();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // If returning from ad or already shown, launch TWA
        if (adShown && mInterstitialAd == null) {
            launchTWA();
        }
    }
}
