/**
 * ManoProtect - Geolocation Service
 * Provides precise location detection and reverse geocoding
 * Works worldwide for millions of users
 */

// Geolocation options for MAXIMUM accuracy
const GEO_OPTIONS = {
  enableHighAccuracy: true,  // Use GPS hardware for precise location
  timeout: 20000,            // 20 seconds timeout for GPS lock
  maximumAge: 0              // Never use cached location - always fresh
};

/**
 * Get current position with high accuracy using multiple readings
 * Takes up to 3 GPS readings and returns the most accurate one
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada en este navegador'));
      return;
    }

    let bestPosition = null;
    let readingsCount = 0;
    const maxReadings = 3;
    const minAccuracyMeters = 15; // Accept if accuracy is under 15 meters
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        readingsCount++;
        
        // Keep the most accurate reading
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }
        
        console.log(`[GPS] Lectura ${readingsCount}: Precisión ${Math.round(position.coords.accuracy)}m`);
        
        // Accept if we have excellent accuracy or enough readings
        if (position.coords.accuracy <= minAccuracyMeters || readingsCount >= maxReadings) {
          navigator.geolocation.clearWatch(watchId);
          
          resolve({
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: Math.round(bestPosition.coords.accuracy),
            altitude: bestPosition.coords.altitude,
            speed: bestPosition.coords.speed,
            heading: bestPosition.coords.heading,
            timestamp: bestPosition.timestamp
          });
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        
        // If we got at least one reading, use it
        if (bestPosition) {
          resolve({
            latitude: bestPosition.coords.latitude,
            longitude: bestPosition.coords.longitude,
            accuracy: Math.round(bestPosition.coords.accuracy),
            altitude: bestPosition.coords.altitude,
            speed: bestPosition.coords.speed,
            timestamp: bestPosition.timestamp
          });
          return;
        }
        
        let message = 'Error de geolocalización';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado. Activa la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Ubicación no disponible. Verifica que el GPS esté activado.';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado. Asegúrate de estar en un lugar con buena señal GPS.';
            break;
          default:
            message = 'Error desconocido al obtener ubicación';
        }
        reject(new Error(message));
      },
      GEO_OPTIONS
    );
    
    // Safety timeout - use best position after 15 seconds
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      if (bestPosition) {
        resolve({
          latitude: bestPosition.coords.latitude,
          longitude: bestPosition.coords.longitude,
          accuracy: Math.round(bestPosition.coords.accuracy),
          altitude: bestPosition.coords.altitude,
          speed: bestPosition.coords.speed,
          timestamp: bestPosition.timestamp
        });
      }
    }, 15000);
  });
};

/**
 * Watch position changes in real-time
 * @param {Function} onSuccess - Callback with position data
 * @param {Function} onError - Callback with error
 * @returns {number} Watch ID to clear later
 */
export const watchPosition = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocalización no soportada'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        timestamp: position.timestamp
      });
    },
    (error) => {
      onError(error);
    },
    GEO_OPTIONS
  );
};

/**
 * Stop watching position
 * @param {number} watchId 
 */
export const clearWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Reverse geocode coordinates to address using OpenStreetMap Nominatim (FREE)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<{address: string, details: object}>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'ManoProtect Emergency App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener dirección');
    }

    const data = await response.json();
    
    // Build formatted address
    const addr = data.address || {};
    const parts = [];
    
    // Street and number
    if (addr.road) {
      let street = addr.road;
      if (addr.house_number) {
        street += ` ${addr.house_number}`;
      }
      parts.push(street);
    }
    
    // City/Town/Village
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    if (city) parts.push(city);
    
    // Postal code
    if (addr.postcode) parts.push(addr.postcode);
    
    // Province/State
    if (addr.state || addr.province) parts.push(addr.state || addr.province);
    
    // Country
    if (addr.country) parts.push(addr.country);

    return {
      address: parts.join(', ') || data.display_name || 'Dirección desconocida',
      fullAddress: data.display_name,
      details: {
        street: addr.road,
        number: addr.house_number,
        city: city,
        postalCode: addr.postcode,
        province: addr.state || addr.province,
        country: addr.country,
        countryCode: addr.country_code?.toUpperCase()
      },
      raw: data
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return {
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      details: {},
      error: error.message
    };
  }
};

/**
 * Get complete location data (coordinates + address)
 * @returns {Promise<{latitude: number, longitude: number, address: string, details: object}>}
 */
export const getCompleteLocation = async () => {
  const position = await getCurrentPosition();
  const geocoded = await reverseGeocode(position.latitude, position.longitude);
  
  return {
    ...position,
    address: geocoded.address,
    fullAddress: geocoded.fullAddress,
    details: geocoded.details
  };
};

/**
 * Generate Google Maps URL for location
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string}
 */
export const getGoogleMapsUrl = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Generate OpenStreetMap URL for location
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string}
 */
export const getOpenStreetMapUrl = (latitude, longitude) => {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=17`;
};

/**
 * Calculate distance between two points in meters
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Format distance for display
 * @param {number} meters 
 * @returns {string}
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export default {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  reverseGeocode,
  getCompleteLocation,
  getGoogleMapsUrl,
  getOpenStreetMapUrl,
  calculateDistance,
  formatDistance
};
