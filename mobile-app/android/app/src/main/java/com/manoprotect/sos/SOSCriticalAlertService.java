package com.manoprotect.sos;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

/**
 * SERVICIO DE ALERTA CRÍTICA SOS - ManoProtect
 * 
 * Este servicio implementa TODAS las funcionalidades de alerta crítica:
 * 1. Sirena de emergencia usando STREAM_ALARM (ignora modo silencioso)
 * 2. Foreground Service para GPS en segundo plano
 * 3. Vibración continua hasta acknowledgment
 * 4. Persistencia: Solo se detiene con CANCEL_SOS o botón "Enterado"
 */
public class SOSCriticalAlertService extends Service {
    
    private static final String TAG = "SOSCriticalAlert";
    
    // Notification Channel for Critical Alerts
    private static final String CHANNEL_ID = "sos_emergency_critical";
    private static final String CHANNEL_NAME = "Alertas de Emergencia SOS";
    private static final int NOTIFICATION_ID = 911;
    
    // Actions
    public static final String ACTION_START_SOS = "com.manoprotect.START_SOS";
    public static final String ACTION_STOP_SOS = "com.manoprotect.STOP_SOS";
    public static final String ACTION_ACKNOWLEDGE = "com.manoprotect.ACKNOWLEDGE_SOS";
    
    // Extras
    public static final String EXTRA_ALERT_ID = "alert_id";
    public static final String EXTRA_SENDER_NAME = "sender_name";
    public static final String EXTRA_LATITUDE = "latitude";
    public static final String EXTRA_LONGITUDE = "longitude";
    public static final String EXTRA_MESSAGE = "message";
    
    // State
    private boolean isAlertActive = false;
    private String currentAlertId = null;
    private String senderName = null;
    
    // Audio
    private MediaPlayer sirenPlayer;
    private AudioManager audioManager;
    private int originalAlarmVolume;
    
    // Vibration
    private Vibrator vibrator;
    
    // Location
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private double currentLatitude = 0.0;
    private double currentLongitude = 0.0;
    
    // Listener for location updates
    private SOSLocationListener locationListener;
    
    // Binder for local service binding
    private final IBinder binder = new LocalBinder();
    
    public class LocalBinder extends Binder {
        public SOSCriticalAlertService getService() {
            return SOSCriticalAlertService.this;
        }
    }
    
    public interface SOSLocationListener {
        void onLocationUpdate(double latitude, double longitude);
    }
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "SOSCriticalAlertService created");
        
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        
        // Get vibrator service
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = vibratorManager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        }
        
        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        // Create notification channel
        createNotificationChannel();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            return START_STICKY;
        }
        
        String action = intent.getAction();
        
        if (ACTION_START_SOS.equals(action)) {
            String alertId = intent.getStringExtra(EXTRA_ALERT_ID);
            String sender = intent.getStringExtra(EXTRA_SENDER_NAME);
            double lat = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
            double lng = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
            String message = intent.getStringExtra(EXTRA_MESSAGE);
            
            startCriticalAlert(alertId, sender, lat, lng, message);
            
        } else if (ACTION_STOP_SOS.equals(action) || ACTION_ACKNOWLEDGE.equals(action)) {
            stopCriticalAlert();
        }
        
        return START_STICKY;
    }
    
    /**
     * INICIAR ALERTA CRÍTICA
     * Esta función:
     * 1. Guarda el volumen actual
     * 2. Sube el volumen de ALARMA al 100%
     * 3. Inicia la sirena en bucle usando STREAM_ALARM
     * 4. Inicia vibración continua
     * 5. Inicia el Foreground Service con GPS tracking
     */
    public void startCriticalAlert(String alertId, String sender, double latitude, double longitude, String message) {
        if (isAlertActive) {
            Log.d(TAG, "Alert already active, updating...");
            currentLatitude = latitude;
            currentLongitude = longitude;
            return;
        }
        
        Log.d(TAG, "🚨 STARTING CRITICAL SOS ALERT for: " + sender);
        
        isAlertActive = true;
        currentAlertId = alertId;
        senderName = sender;
        currentLatitude = latitude;
        currentLongitude = longitude;
        
        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification(sender, message, latitude, longitude), 
            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        
        // 1. GUARDAR VOLUMEN ACTUAL Y SUBIR AL MÁXIMO
        forceMaxVolume();
        
        // 2. INICIAR SIRENA
        startEmergencySiren();
        
        // 3. INICIAR VIBRACIÓN CONTINUA
        startContinuousVibration();
        
        // 4. INICIAR TRACKING DE UBICACIÓN
        startLocationTracking();
        
        // 5. Mostrar overlay de pantalla de bloqueo
        showLockScreenOverlay();
    }
    
    /**
     * DETENER ALERTA CRÍTICA
     * Solo se llama cuando:
     * - El servidor envía CANCEL_SOS
     * - Un familiar pulsa "Enterado"
     */
    public void stopCriticalAlert() {
        if (!isAlertActive) {
            return;
        }
        
        Log.d(TAG, "🔇 STOPPING CRITICAL SOS ALERT");
        
        isAlertActive = false;
        
        // 1. Detener sirena
        stopEmergencySiren();
        
        // 2. Detener vibración
        stopVibration();
        
        // 3. Restaurar volumen original
        restoreVolume();
        
        // 4. Detener tracking de ubicación
        stopLocationTracking();
        
        // 5. Ocultar overlay
        hideLockScreenOverlay();
        
        // 6. Detener foreground service
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
        
        currentAlertId = null;
        senderName = null;
    }
    
    /**
     * FORZAR VOLUMEN AL MÁXIMO
     * Usa STREAM_ALARM que NO se silencia con modo silencioso
     */
    private void forceMaxVolume() {
        try {
            // Guardar volumen actual
            originalAlarmVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM);
            
            // Obtener volumen máximo del stream de alarma
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
            
            // Subir al 100%
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
            
            Log.d(TAG, "Volume set to MAX: " + maxVolume);
        } catch (Exception e) {
            Log.e(TAG, "Error setting max volume", e);
        }
    }
    
    /**
     * RESTAURAR VOLUMEN ORIGINAL
     */
    private void restoreVolume() {
        try {
            audioManager.setStreamVolume(AudioManager.STREAM_ALARM, originalAlarmVolume, 0);
            Log.d(TAG, "Volume restored to: " + originalAlarmVolume);
        } catch (Exception e) {
            Log.e(TAG, "Error restoring volume", e);
        }
    }
    
    /**
     * INICIAR SIRENA DE EMERGENCIA
     * Usa STREAM_ALARM para ignorar modo silencioso
     * Reproduce en BUCLE hasta que se detenga
     */
    private void startEmergencySiren() {
        try {
            // Intentar usar sonido de alarma personalizado o el del sistema
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound == null) {
                alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            
            sirenPlayer = new MediaPlayer();
            sirenPlayer.setDataSource(this, alarmSound);
            
            // CRÍTICO: Usar STREAM_ALARM para ignorar modo silencioso
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            sirenPlayer.setAudioAttributes(audioAttributes);
            
            // BUCLE INFINITO - Solo se detiene con acknowledgment
            sirenPlayer.setLooping(true);
            
            sirenPlayer.prepare();
            sirenPlayer.start();
            
            Log.d(TAG, "🔊 Emergency siren started (STREAM_ALARM, looping=true)");
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting siren", e);
            // Fallback: usar Ringtone
            try {
                Uri fallbackSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                android.media.Ringtone ringtone = RingtoneManager.getRingtone(this, fallbackSound);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    ringtone.setLooping(true);
                }
                ringtone.play();
            } catch (Exception e2) {
                Log.e(TAG, "Fallback siren also failed", e2);
            }
        }
    }
    
    /**
     * DETENER SIRENA
     */
    private void stopEmergencySiren() {
        if (sirenPlayer != null) {
            try {
                if (sirenPlayer.isPlaying()) {
                    sirenPlayer.stop();
                }
                sirenPlayer.release();
                sirenPlayer = null;
                Log.d(TAG, "Siren stopped");
            } catch (Exception e) {
                Log.e(TAG, "Error stopping siren", e);
            }
        }
    }
    
    /**
     * INICIAR VIBRACIÓN CONTINUA
     * Patrón SOS: ... --- ... en bucle
     */
    private void startContinuousVibration() {
        if (vibrator == null || !vibrator.hasVibrator()) {
            return;
        }
        
        // Patrón SOS: corto corto corto, largo largo largo, corto corto corto
        // ... --- ...
        long[] sosPattern = {
            0,     // delay inicial
            200, 100, 200, 100, 200, 300,  // S: ...
            400, 100, 400, 100, 400, 300,  // O: ---
            200, 100, 200, 100, 200, 500   // S: ...
        };
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(sosPattern, 0)); // 0 = repeat from start
            } else {
                vibrator.vibrate(sosPattern, 0);
            }
            Log.d(TAG, "Continuous SOS vibration started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting vibration", e);
        }
    }
    
    /**
     * DETENER VIBRACIÓN
     */
    private void stopVibration() {
        if (vibrator != null) {
            vibrator.cancel();
            Log.d(TAG, "Vibration stopped");
        }
    }
    
    /**
     * INICIAR TRACKING DE UBICACIÓN EN SEGUNDO PLANO
     * Usa Foreground Service para mantener GPS activo
     */
    private void startLocationTracking() {
        try {
            LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateIntervalMillis(3000)
                .setWaitForAccurateLocation(false)
                .build();
            
            locationCallback = new LocationCallback() {
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    if (locationResult == null) {
                        return;
                    }
                    
                    for (Location location : locationResult.getLocations()) {
                        currentLatitude = location.getLatitude();
                        currentLongitude = location.getLongitude();
                        
                        Log.d(TAG, "📍 Location update: " + currentLatitude + ", " + currentLongitude);
                        
                        // Notificar al listener
                        if (locationListener != null) {
                            locationListener.onLocationUpdate(currentLatitude, currentLongitude);
                        }
                        
                        // Actualizar notificación
                        updateNotification();
                    }
                }
            };
            
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
            Log.d(TAG, "Location tracking started");
            
        } catch (SecurityException e) {
            Log.e(TAG, "Location permission denied", e);
        } catch (Exception e) {
            Log.e(TAG, "Error starting location tracking", e);
        }
    }
    
    /**
     * DETENER TRACKING DE UBICACIÓN
     */
    private void stopLocationTracking() {
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
            Log.d(TAG, "Location tracking stopped");
        }
    }
    
    /**
     * MOSTRAR OVERLAY SOBRE PANTALLA DE BLOQUEO
     * Requiere permiso SYSTEM_ALERT_WINDOW
     */
    private void showLockScreenOverlay() {
        Intent overlayIntent = new Intent(this, SOSLockScreenActivity.class);
        overlayIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        overlayIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        overlayIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        overlayIntent.putExtra(EXTRA_ALERT_ID, currentAlertId);
        overlayIntent.putExtra(EXTRA_SENDER_NAME, senderName);
        overlayIntent.putExtra(EXTRA_LATITUDE, currentLatitude);
        overlayIntent.putExtra(EXTRA_LONGITUDE, currentLongitude);
        
        try {
            startActivity(overlayIntent);
            Log.d(TAG, "Lock screen overlay shown");
        } catch (Exception e) {
            Log.e(TAG, "Error showing lock screen overlay", e);
        }
    }
    
    /**
     * OCULTAR OVERLAY
     */
    private void hideLockScreenOverlay() {
        Intent closeIntent = new Intent(SOSLockScreenActivity.ACTION_CLOSE);
        sendBroadcast(closeIntent);
    }
    
    /**
     * CREAR CANAL DE NOTIFICACIÓN
     * NOTA: No usamos bypass DND para cumplir con Google Play
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            
            // Descripción clara: aviso personal, no oficial
            channel.setDescription("Avisos personales de contactos de emergencia");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
            // NO usamos setBypassDnd para cumplir Google Play
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.enableLights(true);
            channel.setLightColor(0xFF3B82F6); // Blue instead of red
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
            
            Log.d(TAG, "Notification channel created");
        }
    }
    
    /**
     * CREAR NOTIFICACIÓN PARA FOREGROUND SERVICE
     * NOTA: Usamos "Aviso personal" no "Emergencia" para Google Play
     */
    private Notification createNotification(String sender, String message, double lat, double lng) {
        // Intent para abrir la app
        Intent openIntent = new Intent(this, SOSLockScreenActivity.class);
        openIntent.putExtra(EXTRA_ALERT_ID, currentAlertId);
        openIntent.putExtra(EXTRA_SENDER_NAME, sender);
        openIntent.putExtra(EXTRA_LATITUDE, lat);
        openIntent.putExtra(EXTRA_LONGITUDE, lng);
        
        PendingIntent openPendingIntent = PendingIntent.getActivity(
            this, 0, openIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Intent para el botón "ENTERADO"
        Intent ackIntent = new Intent(this, SOSCriticalAlertService.class);
        ackIntent.setAction(ACTION_ACKNOWLEDGE);
        
        PendingIntent ackPendingIntent = PendingIntent.getService(
            this, 1, ackIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        String locationText = String.format("Ubicación: %.4f, %.4f", lat, lng);
        
        // IMPORTANTE: Lenguaje de "aviso personal" no "emergencia"
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Aviso de " + sender)
            .setContentText(message != null ? message : sender + " te necesita")
            .setStyle(new NotificationCompat.BigTextStyle()
                .bigText((message != null ? message : sender + " te necesita") + 
                    "\n\n" + locationText + 
                    "\n\nEste es un aviso personal, no oficial."))
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Info icon, not alert
            .setColor(0xFF3B82F6) // Blue instead of red
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE) // Message, not alarm
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(openPendingIntent)
            .setFullScreenIntent(openPendingIntent, true)
            .addAction(android.R.drawable.ic_menu_view, "VER", openPendingIntent)
            .addAction(android.R.drawable.ic_menu_send, "RESPONDER", ackPendingIntent)
            .build();
    }
    
    /**
     * ACTUALIZAR NOTIFICACIÓN CON NUEVA UBICACIÓN
     */
    private void updateNotification() {
        if (!isAlertActive) return;
        
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, createNotification(senderName, null, currentLatitude, currentLongitude));
    }
    
    public void setLocationListener(SOSLocationListener listener) {
        this.locationListener = listener;
    }
    
    public boolean isAlertActive() {
        return isAlertActive;
    }
    
    public String getCurrentAlertId() {
        return currentAlertId;
    }
    
    public double[] getCurrentLocation() {
        return new double[]{currentLatitude, currentLongitude};
    }
    
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        stopCriticalAlert();
        Log.d(TAG, "SOSCriticalAlertService destroyed");
    }
}
