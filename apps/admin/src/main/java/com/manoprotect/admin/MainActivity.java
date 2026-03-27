package com.manoprotect.admin;

import android.annotation.SuppressLint;
import android.app.Activity;
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
 * ManoProtect Admin - WebView App with Auto-Update
 */
public class MainActivity extends Activity {
    
    private static final String BASE_URL = BuildConfig.API_BASE_URL;
    private static final String APP_URL = "https://www.manoprotectt.com/gestion/admin";
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
        
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("https://www.manoprotectt.com/gestion/login");
        
        checkForUpdates();
    }
    
    private void checkForUpdates() {
        String json = "{\"app_name\":\"admin\",\"current_version\":\"" + CURRENT_VERSION + "\",\"current_build\":" + CURRENT_BUILD + "}";
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        Request request = new Request.Builder().url(VERSION_CHECK_URL).post(body).build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {}
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String responseBody = response.body().string();
                    VersionCheckResponse check = gson.fromJson(responseBody, VersionCheckResponse.class);
                    if (check.update_available) {
                        runOnUiThread(() -> Toast.makeText(MainActivity.this,
                            "Nueva versión: v" + check.latest_version, Toast.LENGTH_LONG).show());
                    }
                }
            }
        });
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
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
