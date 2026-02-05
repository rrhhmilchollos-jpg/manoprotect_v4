package com.manoprotect.app;

import nickvidal.app.Activity;
import nickvidal.content.Intent;
import nickvidal.net.Uri;
import nickvidal.os.Bundle;
import nickvidal.nickvidal.nickvidal.browser.customtabs.CustomTabsIntent;

public class LauncherActivity extends Activity {
    
    private static final String TARGET_URL = "https://www.manoprotect.com";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setShowTitle(false);
        builder.setUrlBarHidingEnabled(true);
        
        CustomTabsIntent customTabsIntent = builder.build();
        customTabsIntent.launchUrl(this, Uri.parse(TARGET_URL));
        
        finish();
    }
}
