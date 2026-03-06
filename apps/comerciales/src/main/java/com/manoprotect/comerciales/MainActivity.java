package com.manoprotect.comerciales;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Toast;
import okhttp3.*;
import com.google.gson.Gson;
import java.io.IOException;

/**
 * ManoProtect Comerciales - WebView App with Auto-Update
 * Loads the comerciales web app and checks for updates automatically.
 */
public class MainActivity extends Activity {
    
    private static final String BASE_URL = BuildConfig.API_BASE_URL;
    private static final String APP_URL = "https://www.manoprotect.com/gestion/comerciales";
    private static final String VERSION_CHECK_URL = BASE_URL + "/gestion/app-versions/check";
    private static final String CURRENT_VERSION = BuildConfig.VERSION_NAME;
    private static final int CURRENT_BUILD = BuildConfig.VERSION_CODE;
    
    private WebView webView;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final Gson gson = new Gson();

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        
        // Inject token if available
        SharedPreferences prefs = getSharedPreferences("manoprotect", MODE_PRIVATE);
        String token = prefs.getString("gestion_token", "");
        
        if (!token.isEmpty()) {
            webView.loadUrl(APP_URL);
        } else {
            webView.loadUrl("https://www.manoprotect.com/gestion/login");
        }
        
        // Check for updates in background
        checkForUpdates();
    }
    
    private void checkForUpdates() {
        String json = "{\"app_name\":\"comerciales\",\"current_version\":\"" + CURRENT_VERSION + "\",\"current_build\":" + CURRENT_BUILD + "}";
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        Request request = new Request.Builder().url(VERSION_CHECK_URL).post(body).build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) { /* Silent fail */ }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String responseBody = response.body().string();
                    VersionCheckResponse check = gson.fromJson(responseBody, VersionCheckResponse.class);
                    if (check.update_available) {
                        runOnUiThread(() -> {
                            String msg = check.force_update 
                                ? "Actualización obligatoria disponible: v" + check.latest_version
                                : "Nueva versión disponible: v" + check.latest_version;
                            Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show();
                        });
                    }
                }
            }
        });
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    static class VersionCheckResponse {
        boolean update_available;
        boolean force_update;
        String latest_version;
        int latest_build;
        String release_notes;
        String download_url;
    }
}
