package com.manoprotect.sos;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

/**
 * PANTALLA DE ALERTA SOS SOBRE PANTALLA DE BLOQUEO
 * 
 * Esta Activity se muestra ENCIMA de la pantalla de bloqueo
 * para que el familiar pueda ver la ubicación y pulsar "ENTERADO"
 * sin necesidad de desbloquear el teléfono.
 * 
 * ANDROID 15+ COMPATIBLE:
 * - Edge-to-Edge display
 * - Transparent status/navigation bars
 * - Dynamic insets handling
 * - Large screen support (tablets, foldables)
 */
public class SOSLockScreenActivity extends Activity {
    
    private static final String TAG = "SOSLockScreen";
    
    public static final String ACTION_CLOSE = "com.manoprotect.CLOSE_LOCKSCREEN";
    
    private String alertId;
    private String senderName;
    private double latitude;
    private double longitude;
    
    private TextView titleText;
    private TextView senderText;
    private TextView locationText;
    private TextView statusText;
    private Button acknowledgeButton;
    private Button callEmergencyButton;
    private Button openMapsButton;
    private FrameLayout mapContainer;
    
    // Flash animation
    private Handler flashHandler;
    private Runnable flashRunnable;
    private boolean isFlashRed = false;
    private View rootView;
    private LinearLayout contentLayout;
    
    // Service binding
    private SOSCriticalAlertService sosService;
    private boolean isBound = false;
    
    // Broadcast receiver to close this activity
    private BroadcastReceiver closeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (ACTION_CLOSE.equals(intent.getAction())) {
                Log.d(TAG, "Received close broadcast");
                finish();
            }
        }
    };
    
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            SOSCriticalAlertService.LocalBinder binder = (SOSCriticalAlertService.LocalBinder) service;
            sosService = binder.getService();
            isBound = true;
            
            // Set location listener
            sosService.setLocationListener((lat, lng) -> {
                runOnUiThread(() -> updateLocation(lat, lng));
            });
            
            Log.d(TAG, "Service connected");
        }
        
        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
            sosService = null;
        }
    };
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "SOSLockScreenActivity created");
        
        // Get intent extras
        alertId = getIntent().getStringExtra(SOSCriticalAlertService.EXTRA_ALERT_ID);
        senderName = getIntent().getStringExtra(SOSCriticalAlertService.EXTRA_SENDER_NAME);
        latitude = getIntent().getDoubleExtra(SOSCriticalAlertService.EXTRA_LATITUDE, 0.0);
        longitude = getIntent().getDoubleExtra(SOSCriticalAlertService.EXTRA_LONGITUDE, 0.0);
        
        // Configure window for Edge-to-Edge (Android 15+)
        configureEdgeToEdge();
        
        // Configure window to show over lock screen
        configureWindow();
        
        // Create UI programmatically
        createUI();
        
        // Apply window insets for Edge-to-Edge
        applyWindowInsets();
        
        // Start flash animation
        startFlashAnimation();
        
        // Register close receiver
        IntentFilter filter = new IntentFilter(ACTION_CLOSE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(closeReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(closeReceiver, filter);
        }
        
        // Bind to service
        Intent serviceIntent = new Intent(this, SOSCriticalAlertService.class);
        bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE);
    }
    
    /**
     * CONFIGURAR EDGE-TO-EDGE PARA ANDROID 15+
     * Barras de estado y navegación transparentes
     * 
     * NOTA: setStatusBarColor y setNavigationBarColor están obsoletas en API 35+
     * Usamos WindowCompat y WindowInsetsController para compatibilidad
     */
    private void configureEdgeToEdge() {
        // Enable Edge-to-Edge usando AndroidX
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Para Android 15+ (API 35), el sistema maneja automáticamente las barras transparentes
        // No usamos setStatusBarColor/setNavigationBarColor que están obsoletas
        
        // Configurar el controlador de insets para apariencia de barras del sistema
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ usa WindowInsetsController
            getWindow().setDecorFitsSystemWindows(false);
            
            android.view.WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                // Configurar barras del sistema como transparentes con contenido claro
                controller.setSystemBarsAppearance(0, 
                    android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
            }
        }
        // Para versiones anteriores, el color se establece en el tema (styles.xml)
    }
    
    /**
     * APLICAR WINDOW INSETS PARA EDGE-TO-EDGE
     * Ajusta dinámicamente el padding según las barras del sistema
     */
    private void applyWindowInsets() {
        if (contentLayout != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentLayout, (view, windowInsets) -> {
                Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                
                // Apply padding to avoid content behind system bars
                view.setPadding(
                    insets.left + 40,   // left + original padding
                    insets.top + 60,    // top + original padding
                    insets.right + 40,  // right + original padding
                    insets.bottom + 40  // bottom + original padding
                );
                
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }
    
    /**
     * CONFIGURAR VENTANA PARA MOSTRAR SOBRE PANTALLA DE BLOQUEO
     */
    private void configureWindow() {
        // Show over lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(KEYGUARD_SERVICE);
            keyguardManager.requestDismissKeyguard(this, null);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );
        }
        
        // Keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        // Note: FLAG_FULLSCREEN is deprecated in Android 15+
        // Edge-to-Edge handles this now
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            );
        }
    }
    
    /**
     * CREAR INTERFAZ DE USUARIO
     * NOTA: Usamos "Aviso Personal" no "Emergencia" para cumplir Google Play
     * Compatible con pantallas grandes (tablets, foldables)
     */
    private void createUI() {
        // Root ScrollView for large screens
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(Color.parseColor("#1a1a2e"));
        
        // Root layout
        rootView = scrollView;
        contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setBackgroundColor(Color.parseColor("#1a1a2e"));
        // Padding will be set by applyWindowInsets()
        
        // Title - AVISO PERSONAL, no emergencia oficial
        titleText = new TextView(this);
        titleText.setText("📱 Aviso Personal");
        titleText.setTextColor(Color.parseColor("#DC2626"));
        titleText.setTextSize(32);
        titleText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        titleText.setPadding(0, 0, 0, 30);
        contentLayout.addView(titleText);
        
        // Sender name
        senderText = new TextView(this);
        senderText.setText(senderName != null ? senderName + " te necesita" : "Un contacto te necesita");
        senderText.setTextColor(Color.WHITE);
        senderText.setTextSize(24);
        senderText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        senderText.setPadding(0, 0, 0, 40);
        contentLayout.addView(senderText);
        
        // Map container (placeholder) - Responsive height
        mapContainer = new FrameLayout(this);
        mapContainer.setBackgroundColor(Color.parseColor("#2a2a4e"));
        LinearLayout.LayoutParams mapParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0);
        mapParams.weight = 1; // Takes available space
        mapParams.setMargins(0, 0, 0, 30);
        mapContainer.setLayoutParams(mapParams);
        mapContainer.setMinimumHeight(300);
        
        // Location label in map
        TextView mapLabel = new TextView(this);
        mapLabel.setText("📍 Ubicación en tiempo real");
        mapLabel.setTextColor(Color.WHITE);
        mapLabel.setTextSize(16);
        mapLabel.setPadding(20, 20, 20, 20);
        mapContainer.addView(mapLabel);
        
        contentLayout.addView(mapContainer);
        
        // Location text
        locationText = new TextView(this);
        updateLocation(latitude, longitude);
        locationText.setTextColor(Color.parseColor("#60A5FA"));
        locationText.setTextSize(16);
        locationText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        locationText.setPadding(0, 0, 0, 30);
        contentLayout.addView(locationText);
        
        // Acknowledge button (BIG)
        acknowledgeButton = new Button(this);
        acknowledgeButton.setText("✅ ENTERADO - ESTOY EN CAMINO");
        acknowledgeButton.setBackgroundColor(Color.parseColor("#10B981"));
        acknowledgeButton.setTextColor(Color.WHITE);
        acknowledgeButton.setTextSize(20);
        acknowledgeButton.setPadding(40, 30, 40, 30);
        LinearLayout.LayoutParams ackParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ackParams.setMargins(0, 20, 0, 20);
        acknowledgeButton.setLayoutParams(ackParams);
        acknowledgeButton.setOnClickListener(v -> onAcknowledge());
        contentLayout.addView(acknowledgeButton);
        
        // Open Maps button
        openMapsButton = new Button(this);
        openMapsButton.setText("🗺️ ABRIR EN GOOGLE MAPS");
        openMapsButton.setBackgroundColor(Color.parseColor("#3B82F6"));
        openMapsButton.setTextColor(Color.WHITE);
        openMapsButton.setTextSize(16);
        openMapsButton.setPadding(40, 20, 40, 20);
        LinearLayout.LayoutParams mapsParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        mapsParams.setMargins(0, 10, 0, 10);
        openMapsButton.setLayoutParams(mapsParams);
        openMapsButton.setOnClickListener(v -> openMaps());
        contentLayout.addView(openMapsButton);
        
        // Call Emergency button - Opcional, el usuario decide si llamar
        callEmergencyButton = new Button(this);
        callEmergencyButton.setText("📞 LLAMAR EMERGENCIAS (112)");
        callEmergencyButton.setBackgroundColor(Color.parseColor("#6B7280"));
        callEmergencyButton.setTextColor(Color.WHITE);
        callEmergencyButton.setTextSize(14);
        callEmergencyButton.setPadding(40, 15, 40, 15);
        LinearLayout.LayoutParams callParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        callParams.setMargins(0, 10, 0, 20);
        callEmergencyButton.setLayoutParams(callParams);
        callEmergencyButton.setOnClickListener(v -> callEmergency());
        contentLayout.addView(callEmergencyButton);
        
        // Disclaimer - IMPORTANTE para Google Play
        TextView disclaimerText = new TextView(this);
        disclaimerText.setText("Este es un aviso personal entre contactos de emergencia.\nNo es una alerta oficial ni de servicios públicos.");
        disclaimerText.setTextColor(Color.parseColor("#6B7280"));
        disclaimerText.setTextSize(11);
        disclaimerText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        disclaimerText.setPadding(0, 10, 0, 10);
        contentLayout.addView(disclaimerText);
        
        // Status text
        statusText = new TextView(this);
        statusText.setText("Esperando tu respuesta...");
        statusText.setTextColor(Color.parseColor("#9CA3AF"));
        statusText.setTextSize(14);
        statusText.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        contentLayout.addView(statusText);
        
        scrollView.addView(contentLayout);
        setContentView(scrollView);
    }
    
    /**
     * ACTUALIZAR UBICACIÓN EN PANTALLA
     */
    private void updateLocation(double lat, double lng) {
        this.latitude = lat;
        this.longitude = lng;
        
        if (locationText != null) {
            locationText.setText(String.format("📍 Coordenadas: %.6f, %.6f", lat, lng));
        }
    }
    
    /**
     * ANIMACIÓN DE FLASH ROJO
     */
    private void startFlashAnimation() {
        flashHandler = new Handler(Looper.getMainLooper());
        flashRunnable = new Runnable() {
            @Override
            public void run() {
                if (contentLayout != null) {
                    isFlashRed = !isFlashRed;
                    contentLayout.setBackgroundColor(isFlashRed ? 
                        Color.parseColor("#3D1A1A") : Color.parseColor("#1a1a2e"));
                    flashHandler.postDelayed(this, 500);
                }
            }
        };
        flashHandler.post(flashRunnable);
    }
    
    /**
     * DETENER ANIMACIÓN DE FLASH
     */
    private void stopFlashAnimation() {
        if (flashHandler != null && flashRunnable != null) {
            flashHandler.removeCallbacks(flashRunnable);
        }
    }
    
    /**
     * MANEJAR BOTÓN "ENTERADO"
     */
    private void onAcknowledge() {
        Log.d(TAG, "Acknowledge button pressed for alert: " + alertId);
        
        // Update UI
        acknowledgeButton.setEnabled(false);
        acknowledgeButton.setText("✅ CONFIRMADO");
        acknowledgeButton.setBackgroundColor(Color.parseColor("#065F46"));
        statusText.setText("✅ Has confirmado la emergencia. ¡Ve a ayudar!");
        statusText.setTextColor(Color.parseColor("#10B981"));
        
        // Stop flash animation
        stopFlashAnimation();
        if (contentLayout != null) {
            contentLayout.setBackgroundColor(Color.parseColor("#1a1a2e"));
        }
        
        // Stop the service (which stops siren, vibration, etc.)
        Intent stopIntent = new Intent(this, SOSCriticalAlertService.class);
        stopIntent.setAction(SOSCriticalAlertService.ACTION_ACKNOWLEDGE);
        startService(stopIntent);
        
        // TODO: Send acknowledgment to server
        // This should be done via the React Native bridge
        
        // Close after 3 seconds
        new Handler(Looper.getMainLooper()).postDelayed(() -> finish(), 3000);
    }
    
    /**
     * ABRIR GOOGLE MAPS
     */
    private void openMaps() {
        String uri = "https://maps.google.com/?q=" + latitude + "," + longitude;
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error opening maps", e);
        }
    }
    
    /**
     * LLAMAR AL 112
     */
    private void callEmergency() {
        Intent intent = new Intent(Intent.ACTION_DIAL);
        intent.setData(Uri.parse("tel:112"));
        try {
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error dialing emergency", e);
        }
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        // Update with new data
        alertId = intent.getStringExtra(SOSCriticalAlertService.EXTRA_ALERT_ID);
        senderName = intent.getStringExtra(SOSCriticalAlertService.EXTRA_SENDER_NAME);
        latitude = intent.getDoubleExtra(SOSCriticalAlertService.EXTRA_LATITUDE, 0.0);
        longitude = intent.getDoubleExtra(SOSCriticalAlertService.EXTRA_LONGITUDE, 0.0);
        
        updateLocation(latitude, longitude);
        if (senderText != null) {
            senderText.setText(senderName != null ? senderName + " necesita ayuda" : "Alerta de emergencia");
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        stopFlashAnimation();
        
        try {
            unregisterReceiver(closeReceiver);
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering receiver", e);
        }
        
        if (isBound) {
            unbindService(serviceConnection);
            isBound = false;
        }
        
        Log.d(TAG, "SOSLockScreenActivity destroyed");
    }
}
