/**
 * ManoProtect - Background Location Service
 * Gestiona el tracking GPS en segundo plano para Android e iOS
 * Funciona con la app cerrada, pantalla apagada y teléfono bloqueado
 */
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Watcher ID para background geolocation
let bgWatcherId = null;

/**
 * Solicita permisos de ubicación de forma escalonada
 * Android: primero foreground, luego background
 * iOS: solicita "Always" directamente
 */
export async function requestLocationPermissions() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Location] No es plataforma nativa, usando web API');
    return { granted: true, background: false };
  }

  try {
    // Paso 1: Solicitar permiso de ubicación normal (foreground)
    const fgPermission = await Geolocation.requestPermissions();
    
    if (fgPermission.location !== 'granted') {
      return { granted: false, background: false, reason: 'foreground_denied' };
    }

    // Paso 2: En Android, solicitar permiso de background por separado
    if (Capacitor.getPlatform() === 'android') {
      // En Android 11+, el usuario debe ir a Ajustes manualmente
      // Mostramos instrucciones en la UI
      return { 
        granted: true, 
        background: false, 
        needsManualBackground: true,
        platform: 'android'
      };
    }

    // En iOS, el permiso "Always" se solicita con la segunda petición
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

/**
 * Inicia el tracking en segundo plano
 * Usa @capacitor-community/background-geolocation
 */
export async function startBackgroundTracking(userId, token) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Location] Tracking web - solo foreground');
    return startWebTracking(userId, token);
  }

  try {
    // Importar dinámicamente el plugin de background
    const { BackgroundGeolocation } = await import('@capacitor-community/background-geolocation');

    // Detener watcher previo si existe
    if (bgWatcherId) {
      await BackgroundGeolocation.removeWatcher({ id: bgWatcherId });
    }

    bgWatcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'ManoProtect está protegiendo tu ubicación',
        backgroundTitle: 'ManoProtect Activo',
        requestPermissions: true,
        stale: false,
        distanceFilter: 10 // metros mínimos entre actualizaciones
      },
      // Callback con cada actualización de ubicación
      async (location, error) => {
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            console.warn('[Location] Permiso no autorizado para background');
            // Aquí se puede notificar al usuario que abra Ajustes
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
      console.log('[Location] Background tracking detenido');
    } catch (error) {
      console.error('[Location] Error deteniendo tracking:', error);
    }
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
      // Fallback web
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

/**
 * Tracking web (foreground only) como fallback
 */
function startWebTracking(userId, token) {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
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

/**
 * Envía la ubicación al servidor
 */
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

/**
 * Verifica el estado actual de permisos
 */
export async function checkLocationPermissionStatus() {
  if (!Capacitor.isNativePlatform()) {
    if ('permissions' in navigator) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return { foreground: status.state, background: 'unknown' };
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

/**
 * Instrucciones para el usuario según plataforma
 * Para mostrar en la UI cuando se necesita permiso manual
 */
export function getBackgroundPermissionInstructions() {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'android') {
    return {
      title: 'Activar ubicación en segundo plano',
      steps: [
        'Abre Ajustes del teléfono',
        'Ve a Aplicaciones → ManoProtect',
        'Pulsa en Permisos → Ubicación',
        'Selecciona "Permitir todo el tiempo"',
        'Vuelve atrás y desactiva "Optimización de batería"'
      ],
      note: 'En Android 11+, debes activar esto manualmente desde Ajustes para que funcione con la app cerrada.'
    };
  }
  
  if (platform === 'ios') {
    return {
      title: 'Activar ubicación en segundo plano',
      steps: [
        'Abre Ajustes del iPhone',
        'Ve a Privacidad → Localización',
        'Busca ManoProtect',
        'Selecciona "Siempre"',
        'Activa "Actualización en segundo plano"'
      ],
      note: 'Apple requiere "Siempre" para que el botón SOS funcione con la app cerrada.'
    };
  }

  return null;
}
