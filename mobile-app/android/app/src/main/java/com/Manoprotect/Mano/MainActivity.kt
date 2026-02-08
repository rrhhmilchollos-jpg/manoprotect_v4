package com.Manoprotect.Mano

import android.os.Build
import android.os.Bundle
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * MainActivity - ANDROID 15+ COMPATIBLE
 * 
 * Implementa Edge-to-Edge para Android 15+ (SDK 35)
 * Compatible con pantallas grandes (tablets, foldables)
 */
class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript.
     */
    override fun getMainComponentName(): String = "Mano"

    /**
     * Returns the instance of the [ReactActivityDelegate].
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    /**
     * Configura Edge-to-Edge para Android 15+
     * Llamado antes de setContentView para evitar flash visual
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        // Habilitar Edge-to-Edge ANTES de llamar a super.onCreate()
        enableEdgeToEdge()
        
        super.onCreate(savedInstanceState)
    }

    /**
     * Habilita Edge-to-Edge de forma compatible con todas las versiones de Android.
     * 
     * Android 15+ (SDK 35): Edge-to-Edge es el comportamiento por defecto
     * Android 11-14: Usamos WindowCompat para configurar
     * Android 10 y anteriores: Modo legacy, sin cambios
     */
    private fun enableEdgeToEdge() {
        // Permitir que el contenido se dibuje bajo las barras del sistema
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+: Configurar la apariencia de las barras del sistema
            window.setDecorFitsSystemWindows(false)
            
            // No usamos setStatusBarColor/setNavigationBarColor (obsoletas en API 35)
            // Las barras son manejadas automáticamente por el sistema en Android 15+
        }
        // Para versiones anteriores, el comportamiento es manejado por el tema en styles.xml
    }
}
