package com.manoprotect.www.twa;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

/**
 * ManoProtect - Firebase Cloud Messaging Service
 * Handles push notifications for SOS alerts, geofencing events, etc.
 */
public class MyFirebaseMessagingService extends FirebaseMessagingService {
    
    private static final String TAG = "ManoProtect-FCM";
    
    // Notification Channels
    private static final String CHANNEL_SOS = "manoprotect_sos";
    private static final String CHANNEL_ALERTS = "manoprotect_alerts";
    private static final String CHANNEL_DEFAULT = "manoprotect_default";
    
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "New FCM token: " + token);
        
        // Send token to backend
        sendTokenToServer(token);
    }
    
    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.d(TAG, "Message received from: " + remoteMessage.getFrom());
        
        // Check notification type
        String notificationType = remoteMessage.getData().get("type");
        
        if ("sos_alert".equals(notificationType)) {
            handleSOSAlert(remoteMessage);
        } else if ("geofence_alert".equals(notificationType)) {
            handleGeofenceAlert(remoteMessage);
        } else {
            handleDefaultNotification(remoteMessage);
        }
    }
    
    /**
     * Handle SOS emergency alerts - highest priority
     */
    private void handleSOSAlert(RemoteMessage message) {
        String title = message.getData().get("title");
        String body = message.getData().get("body");
        String alertId = message.getData().get("alert_id");
        String senderName = message.getData().get("sender_name");
        String location = message.getData().get("location");
        
        if (title == null) title = "🆘 ALERTA SOS";
        if (body == null) body = senderName + " ha activado una alerta de emergencia";
        
        // Create high-priority notification
        createNotificationChannel(CHANNEL_SOS, "Alertas SOS", NotificationManager.IMPORTANCE_HIGH);
        
        Intent intent = new Intent(this, LauncherActivity.class);
        intent.putExtra("sos_alert_id", alertId);
        intent.putExtra("navigate_to", "/alerta-sos/" + alertId);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent, 
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Vibration pattern for SOS
        long[] vibrationPattern = {0, 500, 200, 500, 200, 500};
        
        // Sound - use alarm sound for emergencies
        Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_SOS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle()
                .bigText(body + "\n\n📍 " + (location != null ? location : "Ubicación no disponible")))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setVibrate(vibrationPattern)
            .setSound(soundUri)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setFullScreenIntent(pendingIntent, true);
        
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(alertId != null ? alertId.hashCode() : 1, builder.build());
    }
    
    /**
     * Handle geofence entry/exit alerts
     */
    private void handleGeofenceAlert(RemoteMessage message) {
        String title = message.getData().get("title");
        String body = message.getData().get("body");
        String eventType = message.getData().get("event_type");
        String zoneName = message.getData().get("geofence_name");
        String memberName = message.getData().get("member_name");
        
        if (title == null) {
            title = "entry".equals(eventType) ? 
                "📍 " + memberName + " ha llegado" : 
                "⚠️ " + memberName + " ha salido";
        }
        
        createNotificationChannel(CHANNEL_ALERTS, "Alertas de Zonas", NotificationManager.IMPORTANCE_HIGH);
        
        Intent intent = new Intent(this, LauncherActivity.class);
        intent.putExtra("navigate_to", "/safe-zones");
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ALERTS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);
        
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify((int) System.currentTimeMillis(), builder.build());
    }
    
    /**
     * Handle default notifications
     */
    private void handleDefaultNotification(RemoteMessage message) {
        String title = "ManoProtect";
        String body = "Tienes una nueva notificación";
        
        if (message.getNotification() != null) {
            title = message.getNotification().getTitle();
            body = message.getNotification().getBody();
        } else if (message.getData().size() > 0) {
            title = message.getData().get("title");
            body = message.getData().get("body");
        }
        
        createNotificationChannel(CHANNEL_DEFAULT, "Notificaciones", NotificationManager.IMPORTANCE_DEFAULT);
        
        Intent intent = new Intent(this, LauncherActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_DEFAULT)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);
        
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify((int) System.currentTimeMillis(), builder.build());
    }
    
    /**
     * Create notification channel for Android O+
     */
    private void createNotificationChannel(String channelId, String channelName, int importance) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
            
            if (CHANNEL_SOS.equals(channelId)) {
                channel.setDescription("Alertas de emergencia SOS");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
                channel.setBypassDnd(true);
                channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            }
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
    
    /**
     * Send FCM token to backend
     */
    private void sendTokenToServer(String token) {
        // TODO: Implement API call to register token
        // POST /api/push/register-fcm
        Log.d(TAG, "Token should be sent to server: " + token);
    }
}
