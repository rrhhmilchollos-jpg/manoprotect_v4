/**
 * ManoProtect - Background Location Service (Completo)
 * Gestiona el tracking GPS en segundo plano para Android e iOS
 * Funciona con la app cerrada, pantalla apagada y teléfono bloqueado
 * 
 * Incluye:
 * - Solicitud escalonada de permisos (foreground → background)
 * - Exclusión de optimización de batería (Android)
 * - Botones para abrir ajustes directamente
 * - Tracking continuo tipo "heartbeat"
 */
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const API_URL = process.env.REACT_APP_BACKEND_URL;

let bgWatcherId = null;
let webWatcherId = null;

// ========================================
// PLATFORM INFO
// ========================================

export function getPlatformInfo() {
  return {
    isNative: Capacitor.isNativePlatform(),
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    isWeb: Capacitor.getPlatform() === 'web',
    platform: Capacitor.getPlatform()
  };
}

// ========================================
// PERMISSION REQUESTS
// ========================================

/**
 * Solicita permisos de ubicación de forma escalonada
 * Android: primero foreground, luego background (manual en Android 11+)
 * iOS: solicita "Always" directamente
 */
export async function requestLocationPermissions() {
  if (!Capacitor.isNativePlatform()) {
    // Web: solo pedir foreground
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      return { granted: true, background: false, platform: 'web' };
    } catch {
      return { granted: false, background: false, reason: 'web_denied' };
    }
  }

  try {
    // Paso 1: Solicitar permiso de ubicación normal (foreground)
    const fgPermission = await Geolocation.requestPermissions();
    
    if (fgPermission.location !== 'granted') {
      return { granted: false, background: false, reason: 'foreground_denied' };
    }

    // Paso 2: Android - background requiere acción manual en Android 11+
    if (Capacitor.getPlatform() === 'android') {
      return { 
        granted: true, 
        background: false, 
        needsManualBackground: true,
        platform: 'android'
      };
    }

    // iOS: el permiso "Always" se solicita con la segunda petición automáticamente
    if (Capacitor.getPlatform() === 'ios') {
      return { 
        granted: true, 
        background: true, 
        platform: 'ios'
      };
    }

    return { granted: true, background: false };
  } catch (error) {
    console.error('[Location] Error solicitando permisos:', error);
    return { granted: false, background: false, error: error.message };
  }
}

// ========================================
// BACKGROUND TRACKING
// ========================================

/**
 * Inicia el tracking en segundo plano (heartbeat continuo)
 * Usa @capacitor-community/background-geolocation
 */
export async function startBackgroundTracking(userId, token) {
  if (!Capacitor.isNativePlatform()) {
    return startWebTracking(userId, token);
  }

  try {
    const { BackgroundGeolocation } = await import('@capacitor-community/background-geolocation');

    // Detener watcher previo si existe
    if (bgWatcherId) {
      try { await BackgroundGeolocation.removeWatcher({ id: bgWatcherId }); } catch {}
    }

    bgWatcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'ManoProtect protege tu ubicación',
        backgroundTitle: 'ManoProtect Activo',
        requestPermissions: true,
        stale: false,
        distanceFilter: 10
      },
      async (location, error) => {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            console.warn('[Location] Permiso no autorizado para background');
          }
          return;
        }

        if (location) {
          await sendLocationToServer(userId, token, {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            altitude: location.altitude,
            speed: location.speed,
            bearing: location.bearing,
            timestamp: new Date().toISOString(),
            isBackground: true
          });
        }
      }
    );

    console.log('[Location] Background tracking iniciado, watcher:', bgWatcherId);
    return true;
  } catch (error) {
    console.error('[Location] Error iniciando background tracking:', error);
    return false;
  }
}

/**
 * Detiene el tracking en segundo plano
 */
export async function stopBackgroundTracking() {
  if (bgWatcherId && Capacitor.isNativePlatform()) {
    try {
      const { BackgroundGeolocation } = await import('@capacitor-community/background-geolocation');
      await BackgroundGeolocation.removeWatcher({ id: bgWatcherId });
      bgWatcherId = null;
    } catch (error) {
      console.error('[Location] Error deteniendo tracking:', error);
    }
  }
  if (webWatcherId !== null) {
    navigator.geolocation.clearWatch(webWatcherId);
    webWatcherId = null;
  }
}

/**
 * Obtiene la ubicación actual (una sola vez)
 */
export async function getCurrentLocation() {
  try {
    if (Capacitor.isNativePlatform()) {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString()
      };
    } else {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date(pos.timestamp).toISOString()
          }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 15000 }
        );
      });
    }
  } catch (error) {
    console.error('[Location] Error obteniendo ubicación:', error);
    return null;
  }
}

// ========================================
// SETTINGS & BATTERY OPTIMIZATION
// ========================================

/**
 * Abre los ajustes de ubicación de la app
 */
export function openLocationSettings() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    if (Capacitor.getPlatform() === 'android') {
      // Intent para abrir ajustes de permisos de la app
      const { App } = require('@capacitor/app');
      // Fallback: intentar abrir ajustes genéricos
      window.open('intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:com.manoprotect.app;end', '_system');
    } else if (Capacitor.getPlatform() === 'ios') {
      // iOS: abre ajustes de la app
      window.open('app-settings:', '_system');
    }
  } catch {
    // Fallback silencioso
    console.log('[Location] No se pudieron abrir los ajustes directamente');
  }
}

/**
 * Solicita exclusión de optimización de batería (Android)
 * Muestra diálogo nativo de Android para excluir la app
 */
export function requestBatteryOptimizationExclusion() {
  if (Capacitor.getPlatform() !== 'android') return;
  
  try {
    // Intent para solicitar exclusión de optimización de batería
    window.open('intent:#Intent;action=android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS;data=package:com.manoprotect.app;end', '_system');
  } catch {
    // Fallback: abrir ajustes de batería genéricos
    openBatterySettings();
  }
}

/**
 * Abre los ajustes de batería del dispositivo
 */
export function openBatterySettings() {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    if (Capacitor.getPlatform() === 'android') {
      window.open('intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end', '_system');
    } else if (Capacitor.getPlatform() === 'ios') {
      window.open('app-settings:', '_system');
    }
  } catch {
    console.log('[Location] No se pudieron abrir los ajustes de batería');
  }
}

// ========================================
// WEB TRACKING (FOREGROUND FALLBACK)
// ========================================

function startWebTracking(userId, token) {
  if ('geolocation' in navigator) {
    webWatcherId = navigator.geolocation.watchPosition(
      async (position) => {
        await sendLocationToServer(userId, token, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
          isBackground: false
        });
      },
      (error) => console.warn('[Location] Web tracking error:', error.message),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    return true;
  }
  return false;
}

// ========================================
// SERVER COMMUNICATION
// ========================================

async function sendLocationToServer(userId, token, locationData) {
  try {
    await fetch(`${API_URL}/api/family/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        ...locationData
      })
    });
  } catch (error) {
    // Silenciar errores de red en background - se reintentará
    console.debug('[Location] Error enviando ubicación:', error.message);
  }
}

// ========================================
// PERMISSION STATUS CHECK
// ========================================

export async function checkLocationPermissionStatus() {
  if (!Capacitor.isNativePlatform()) {
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return { foreground: status.state, background: 'unknown' };
      } catch {
        return { foreground: 'unknown', background: 'unknown' };
      }
    }
    return { foreground: 'unknown', background: 'unknown' };
  }

  try {
    const status = await Geolocation.checkPermissions();
    return {
      foreground: status.location,
      background: status.coarseLocation || 'unknown'
    };
  } catch {
    return { foreground: 'unknown', background: 'unknown' };
  }
}
