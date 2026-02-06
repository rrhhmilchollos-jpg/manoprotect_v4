package com.manoprotect.sos;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.google.firebase.messaging.FirebaseMessaging;

/**
 * MÓDULO NATIVO DE REACT NATIVE PARA SOS
 * 
 * Este módulo expone las funcionalidades nativas de Android a React Native:
 * 1. Iniciar/Detener alerta SOS con sirena crítica
 * 2. Registrar token FCM
 * 3. Enviar acknowledgment al servidor
 * 4. Obtener estado de la alerta
 */
public class SOSModule extends ReactContextBaseJavaModule {
    
    private static final String TAG = "SOSModule";
    private static final String MODULE_NAME = "SOSNativeModule";
    
    private final ReactApplicationContext reactContext;
    private SOSCriticalAlertService sosService;
    private boolean isBound = false;
    
    // Broadcast receivers
    private BroadcastReceiver fcmTokenReceiver;
    private BroadcastReceiver locationUpdateReceiver;
    
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            SOSCriticalAlertService.LocalBinder binder = (SOSCriticalAlertService.LocalBinder) service;
            sosService = binder.getService();
            isBound = true;
            
            // Set location listener to emit events to JS
            sosService.setLocationListener((lat, lng) -> {
                emitLocationUpdate(lat, lng);
            });
            
            Log.d(TAG, "SOS Service connected to React Native");
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
            sosService = null;
        }
    };
    
    public SOSModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        setupBroadcastReceivers();
    }
    
    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    /**
     * INICIAR ALERTA SOS CRÍTICA
     * Llama al servicio nativo que activa sirena, vibración, GPS, etc.
     */
    @ReactMethod
    public void startCriticalAlert(String alertId, String senderName, double latitude, double longitude, String message, Promise promise) {
        try {
            Log.d(TAG, "Starting critical alert from React Native");
            
            Intent serviceIntent = new Intent(reactContext, SOSCriticalAlertService.class);
            serviceIntent.setAction(SOSCriticalAlertService.ACTION_START_SOS);
            serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_ALERT_ID, alertId);
            serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_SENDER_NAME, senderName);
            serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_LATITUDE, latitude);
            serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_LONGITUDE, longitude);
            serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_MESSAGE, message);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            // Bind to service
            reactContext.bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE);
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting critical alert", e);
            promise.reject("START_ERROR", e.getMessage());
        }
    }
    
    /**
     * DETENER ALERTA SOS
     * Llamado cuando alguien pulsa "Enterado" o el servidor envía CANCEL
     */
    @ReactMethod
    public void stopCriticalAlert(Promise promise) {
        try {
            Log.d(TAG, "Stopping critical alert from React Native");
            
            Intent serviceIntent = new Intent(reactContext, SOSCriticalAlertService.class);
            serviceIntent.setAction(SOSCriticalAlertService.ACTION_STOP_SOS);
            reactContext.startService(serviceIntent);
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping critical alert", e);
            promise.reject("STOP_ERROR", e.getMessage());
        }
    }
    
    /**
     * ENVIAR ACKNOWLEDGMENT
     * Llamado cuando un familiar confirma que ha visto la alerta
     */
    @ReactMethod
    public void acknowledgeAlert(String alertId, Promise promise) {
        try {
            Log.d(TAG, "Acknowledging alert: " + alertId);
            
            Intent serviceIntent = new Intent(reactContext, SOSCriticalAlertService.class);
            serviceIntent.setAction(SOSCriticalAlertService.ACTION_ACKNOWLEDGE);
            reactContext.startService(serviceIntent);
            
            // Emit event to notify JS that alert was acknowledged
            emitEvent("onAlertAcknowledged", alertId);
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error acknowledging alert", e);
            promise.reject("ACK_ERROR", e.getMessage());
        }
    }
    
    /**
     * OBTENER TOKEN FCM
     */
    @ReactMethod
    public void getFCMToken(Promise promise) {
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    String token = task.getResult();
                    Log.d(TAG, "FCM Token obtained");
                    promise.resolve(token);
                } else {
                    promise.reject("TOKEN_ERROR", "Failed to get FCM token");
                }
            });
    }
    
    /**
     * VERIFICAR SI HAY ALERTA ACTIVA
     */
    @ReactMethod
    public void isAlertActive(Promise promise) {
        try {
            if (isBound && sosService != null) {
                promise.resolve(sosService.isAlertActive());
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("CHECK_ERROR", e.getMessage());
        }
    }
    
    /**
     * OBTENER UBICACIÓN ACTUAL DE LA ALERTA
     */
    @ReactMethod
    public void getCurrentAlertLocation(Promise promise) {
        try {
            if (isBound && sosService != null && sosService.isAlertActive()) {
                double[] location = sosService.getCurrentLocation();
                WritableMap map = Arguments.createMap();
                map.putDouble("latitude", location[0]);
                map.putDouble("longitude", location[1]);
                promise.resolve(map);
            } else {
                promise.resolve(null);
            }
        } catch (Exception e) {
            promise.reject("LOCATION_ERROR", e.getMessage());
        }
    }
    
    /**
     * OBTENER ID DE ALERTA ACTUAL
     */
    @ReactMethod
    public void getCurrentAlertId(Promise promise) {
        try {
            if (isBound && sosService != null) {
                promise.resolve(sosService.getCurrentAlertId());
            } else {
                promise.resolve(null);
            }
        } catch (Exception e) {
            promise.reject("ID_ERROR", e.getMessage());
        }
    }
    
    /**
     * CONFIGURAR BROADCAST RECEIVERS
     */
    private void setupBroadcastReceivers() {
        // FCM Token receiver
        fcmTokenReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String token = intent.getStringExtra("token");
                if (token != null) {
                    emitEvent("onFCMTokenReceived", token);
                }
            }
        };
        
        // Location update receiver
        locationUpdateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String alertId = intent.getStringExtra("alert_id");
                double latitude = intent.getDoubleExtra("latitude", 0.0);
                double longitude = intent.getDoubleExtra("longitude", 0.0);
                
                WritableMap map = Arguments.createMap();
                map.putString("alertId", alertId);
                map.putDouble("latitude", latitude);
                map.putDouble("longitude", longitude);
                
                emitMapEvent("onLocationUpdate", map);
            }
        };
        
        // Register receivers
        IntentFilter tokenFilter = new IntentFilter("com.manoprotect.FCM_TOKEN");
        IntentFilter locationFilter = new IntentFilter("com.manoprotect.LOCATION_UPDATE");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(fcmTokenReceiver, tokenFilter, Context.RECEIVER_NOT_EXPORTED);
            reactContext.registerReceiver(locationUpdateReceiver, locationFilter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            reactContext.registerReceiver(fcmTokenReceiver, tokenFilter);
            reactContext.registerReceiver(locationUpdateReceiver, locationFilter);
        }
    }
    
    /**
     * EMITIR EVENTO A JAVASCRIPT
     */
    private void emitEvent(String eventName, String data) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
        }
    }
    
    /**
     * EMITIR EVENTO CON MAP A JAVASCRIPT
     */
    private void emitMapEvent(String eventName, WritableMap data) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
        }
    }
    
    /**
     * EMITIR ACTUALIZACIÓN DE UBICACIÓN
     */
    private void emitLocationUpdate(double latitude, double longitude) {
        WritableMap map = Arguments.createMap();
        map.putDouble("latitude", latitude);
        map.putDouble("longitude", longitude);
        emitMapEvent("onSOSLocationUpdate", map);
    }
    
    @Override
    public void invalidate() {
        super.invalidate();
        
        // Cleanup
        try {
            if (isBound) {
                reactContext.unbindService(serviceConnection);
                isBound = false;
            }
            
            if (fcmTokenReceiver != null) {
                reactContext.unregisterReceiver(fcmTokenReceiver);
            }
            if (locationUpdateReceiver != null) {
                reactContext.unregisterReceiver(locationUpdateReceiver);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
