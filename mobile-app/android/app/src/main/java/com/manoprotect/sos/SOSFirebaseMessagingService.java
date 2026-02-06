package com.manoprotect.sos;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * SERVICIO DE FIREBASE CLOUD MESSAGING PARA ALERTAS SOS
 * 
 * Este servicio recibe los mensajes FCM y:
 * 1. Si es tipo "sos_alert" -> Inicia el SOSCriticalAlertService
 * 2. Si es tipo "cancel_sos" -> Detiene el SOSCriticalAlertService
 * 3. Si es tipo "siren_stop" -> Detiene la sirena (alguien confirmó)
 * 
 * IMPORTANTE: Usa DATA MESSAGES, no notification messages
 * Esto permite que la app reciba y procese los datos incluso en segundo plano
 */
public class SOSFirebaseMessagingService extends FirebaseMessagingService {
    
    private static final String TAG = "SOSFCM";
    
    // Message types
    private static final String TYPE_SOS_ALERT = "sos_alert";
    private static final String TYPE_CANCEL_SOS = "cancel_sos";
    private static final String TYPE_SIREN_STOP = "siren_stop";
    private static final String TYPE_LOCATION_UPDATE = "location_update";
    
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "New FCM token: " + token);
        
        // Send token to backend
        sendTokenToBackend(token);
    }
    
    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.d(TAG, "📩 Message received from: " + remoteMessage.getFrom());
        
        // Get data payload (NOT notification payload)
        Map<String, String> data = remoteMessage.getData();
        
        if (data.isEmpty()) {
            Log.d(TAG, "Empty data payload, checking notification...");
            
            // Fallback to notification if data is empty
            if (remoteMessage.getNotification() != null) {
                Log.d(TAG, "Has notification: " + remoteMessage.getNotification().getTitle());
            }
            return;
        }
        
        // Get message type
        String messageType = data.get("type");
        Log.d(TAG, "Message type: " + messageType);
        
        switch (messageType != null ? messageType : "") {
            case TYPE_SOS_ALERT:
                handleSOSAlert(data);
                break;
                
            case TYPE_CANCEL_SOS:
            case TYPE_SIREN_STOP:
                handleStopSOS(data);
                break;
                
            case TYPE_LOCATION_UPDATE:
                handleLocationUpdate(data);
                break;
                
            default:
                Log.d(TAG, "Unknown message type: " + messageType);
        }
    }
    
    /**
     * MANEJAR ALERTA SOS
     * Inicia el servicio de alerta crítica con sirena, vibración, etc.
     */
    private void handleSOSAlert(Map<String, String> data) {
        Log.d(TAG, "🚨 SOS ALERT RECEIVED!");
        
        String alertId = data.get("alert_id");
        String senderName = data.get("sender_name");
        String senderEmail = data.get("sender_email");
        String message = data.get("message");
        
        // Parse location
        double latitude = 0.0;
        double longitude = 0.0;
        try {
            String latStr = data.get("latitude");
            String lngStr = data.get("longitude");
            if (latStr != null) latitude = Double.parseDouble(latStr);
            if (lngStr != null) longitude = Double.parseDouble(lngStr);
        } catch (NumberFormatException e) {
            Log.e(TAG, "Error parsing location", e);
        }
        
        Log.d(TAG, String.format("Alert: %s from %s at (%.6f, %.6f)", 
            alertId, senderName, latitude, longitude));
        
        // Start critical alert service
        Intent serviceIntent = new Intent(this, SOSCriticalAlertService.class);
        serviceIntent.setAction(SOSCriticalAlertService.ACTION_START_SOS);
        serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_ALERT_ID, alertId);
        serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_SENDER_NAME, senderName);
        serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_LATITUDE, latitude);
        serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_LONGITUDE, longitude);
        serviceIntent.putExtra(SOSCriticalAlertService.EXTRA_MESSAGE, message);
        
        // Start foreground service
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
        
        Log.d(TAG, "SOSCriticalAlertService started");
    }
    
    /**
     * MANEJAR CANCELACIÓN/STOP DE SOS
     * Detiene el servicio de alerta crítica
     */
    private void handleStopSOS(Map<String, String> data) {
        Log.d(TAG, "🔇 SOS STOP RECEIVED");
        
        String alertId = data.get("alert_id");
        String acknowledgedBy = data.get("acknowledged_by");
        String reason = data.get("reason");
        
        Log.d(TAG, String.format("Stop alert %s - reason: %s, acknowledged by: %s",
            alertId, reason, acknowledgedBy));
        
        // Stop critical alert service
        Intent serviceIntent = new Intent(this, SOSCriticalAlertService.class);
        serviceIntent.setAction(SOSCriticalAlertService.ACTION_STOP_SOS);
        startService(serviceIntent);
        
        Log.d(TAG, "SOSCriticalAlertService stop requested");
    }
    
    /**
     * MANEJAR ACTUALIZACIÓN DE UBICACIÓN
     */
    private void handleLocationUpdate(Map<String, String> data) {
        String alertId = data.get("alert_id");
        
        double latitude = 0.0;
        double longitude = 0.0;
        try {
            String latStr = data.get("latitude");
            String lngStr = data.get("longitude");
            if (latStr != null) latitude = Double.parseDouble(latStr);
            if (lngStr != null) longitude = Double.parseDouble(lngStr);
        } catch (NumberFormatException e) {
            Log.e(TAG, "Error parsing location update", e);
        }
        
        Log.d(TAG, String.format("📍 Location update for %s: (%.6f, %.6f)", 
            alertId, latitude, longitude));
        
        // Broadcast location update to app
        Intent locationIntent = new Intent("com.manoprotect.LOCATION_UPDATE");
        locationIntent.putExtra("alert_id", alertId);
        locationIntent.putExtra("latitude", latitude);
        locationIntent.putExtra("longitude", longitude);
        sendBroadcast(locationIntent);
    }
    
    /**
     * ENVIAR TOKEN FCM AL BACKEND
     */
    private void sendTokenToBackend(String token) {
        // This will be handled by React Native
        // The native module should register this token with the backend
        Log.d(TAG, "Token needs to be sent to backend: " + token.substring(0, 20) + "...");
        
        // Broadcast to React Native
        Intent tokenIntent = new Intent("com.manoprotect.FCM_TOKEN");
        tokenIntent.putExtra("token", token);
        sendBroadcast(tokenIntent);
    }
}
