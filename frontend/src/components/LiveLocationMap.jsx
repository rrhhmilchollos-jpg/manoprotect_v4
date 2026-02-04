/**
 * ManoProtect - Live Location Map Component
 * Shows real-time location with OpenStreetMap (FREE, unlimited)
 */
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom SOS marker (red)
const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when position changes
function MapUpdater({ position, follow }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && follow) {
      map.setView([position.latitude, position.longitude], map.getZoom());
    }
  }, [position, follow, map]);
  
  return null;
}

/**
 * LiveLocationMap - Shows location on OpenStreetMap
 * @param {Object} props
 * @param {number} props.latitude - Latitude
 * @param {number} props.longitude - Longitude
 * @param {number} props.accuracy - Accuracy in meters
 * @param {string} props.address - Formatted address
 * @param {string} props.personName - Name of person at location
 * @param {boolean} props.isEmergency - Show red marker for SOS
 * @param {boolean} props.followLocation - Auto-center on location updates
 * @param {number} props.zoom - Initial zoom level (default 16)
 * @param {string} props.className - Additional CSS classes
 */
const LiveLocationMap = ({
  latitude,
  longitude,
  accuracy = 0,
  address = '',
  personName = '',
  isEmergency = false,
  followLocation = true,
  zoom = 16,
  className = '',
  height = '300px'
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !latitude || !longitude) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-800 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Obteniendo ubicación...</p>
        </div>
      </div>
    );
  }

  const position = { latitude, longitude };

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater position={position} follow={followLocation} />
        
        {/* Accuracy circle */}
        {accuracy > 0 && accuracy < 1000 && (
          <Circle
            center={[latitude, longitude]}
            radius={accuracy}
            pathOptions={{
              color: isEmergency ? '#DC2626' : '#3B82F6',
              fillColor: isEmergency ? '#DC2626' : '#3B82F6',
              fillOpacity: 0.1
            }}
          />
        )}
        
        {/* Location marker */}
        <Marker 
          position={[latitude, longitude]}
          icon={isEmergency ? sosIcon : new L.Icon.Default()}
        >
          <Popup>
            <div className="text-center">
              {isEmergency && (
                <div className="text-red-600 font-bold mb-1">🆘 EMERGENCIA SOS</div>
              )}
              {personName && (
                <div className="font-semibold">{personName}</div>
              )}
              {address && (
                <div className="text-sm text-gray-600 mt-1">{address}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
              {accuracy > 0 && (
                <div className="text-xs text-gray-400">
                  Precisión: ±{Math.round(accuracy)}m
                </div>
              )}
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline block mt-2"
              >
                Abrir en Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LiveLocationMap;
