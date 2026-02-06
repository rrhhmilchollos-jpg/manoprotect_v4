package com.manoprotect.sos;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * RECEIVER PARA BOOT COMPLETED
 * 
 * Este receiver se activa cuando el dispositivo se reinicia
 * para re-registrar los servicios necesarios para las alertas SOS
 */
public class BootCompletedReceiver extends BroadcastReceiver {
    
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        
        String action = intent.getAction();
        
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action)) {
            
            Log.d(TAG, "Device booted - ManoProtect ready for SOS alerts");
            
            // The FCM service will auto-register when the app is opened
            // No need to start any background services here
            // The critical alert service only starts when an SOS is received
        }
    }
}
