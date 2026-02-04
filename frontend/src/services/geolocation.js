/**
 * ManoProtect - Geolocation Service
 * Provides precise location detection and reverse geocoding
 * Works worldwide for millions of users
 */

// Geolocation options for high accuracy
const GEO_OPTIONS = {
  enableHighAccuracy: true,  // Use GPS for precise location
  timeout: 15000,            // 15 seconds timeout
  maximumAge: 0              // Always get fresh location
};

/**
 * Get current position with high accuracy
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let message = 'Error de geolocalización';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado. Activa la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Ubicación no disponible. Verifica tu GPS.';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado. Intenta de nuevo.';
            break;
          default:
            message = 'Error desconocido al obtener ubicación';
        }
        reject(new Error(message));
      },
      GEO_OPTIONS
    );
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
