/**
 * ManoProtect - Live Location Map Component
 * Shows real-time location with OpenStreetMap (FREE, unlimited)
 */
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, MapPin, Clock, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const markerColors = ['blue', 'green', 'orange', 'red', 'violet', 'yellow'];

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
 * LiveLocationMap - Shows family members' locations on OpenStreetMap
 */
const LiveLocationMap = ({
  latitude,
  longitude,
  accuracy = 0,
  address = '',
  personName = '',
  isEmergency = false,
  followLocation = true,
  zoom = 14,
  className = '',
  height = '400px'
}) => {
  const [isClient, setIsClient] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 39.4699, lng: -0.3763 }); // Valencia default
  
  useEffect(() => {
    setIsClient(true);
    loadFamilyLocations();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadFamilyLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFamilyLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/family/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const members = data.members || data || [];
        
        // Filter members with valid locations
        const membersWithLocation = members.filter(m => 
          m.last_location?.latitude && m.last_location?.longitude
        );
        
        setFamilyMembers(membersWithLocation);
        setLastUpdate(new Date());
        
        // Center map on first member with location
        if (membersWithLocation.length > 0) {
          const first = membersWithLocation[0];
          setMapCenter({
            lat: first.last_location.latitude,
            lng: first.last_location.longitude
          });
        }
      }
    } catch (error) {
      console.error('Error loading family locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Desconocido';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)} días`;
  };

  if (!isClient) {
    return (
      <Card className="border-zinc-200">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-zinc-500 mt-4">Cargando mapa...</p>
        </CardContent>
      </Card>
    );
  }

  // If single location mode (for SOS alerts)
  if (latitude && longitude) {
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
          
          <Marker 
            position={[latitude, longitude]}
            icon={isEmergency ? createColoredIcon('red') : new L.Icon.Default()}
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
  }

  // Family mode - show all members
  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Ubicación de tu Familia
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-zinc-500">
                <Clock className="w-3 h-3 inline mr-1" />
                {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFamilyLocations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {familyMembers.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 rounded-lg">
            <Users className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
            <h4 className="font-medium text-zinc-700 mb-2">Sin ubicaciones disponibles</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Añade miembros a tu familia y activa la compartición de ubicación
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/family-admin'}
            >
              Gestionar Familia
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-lg overflow-hidden mb-4" style={{ height }}>
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {familyMembers.map((member, idx) => (
                  <Marker
                    key={member.id || idx}
                    position={[member.last_location.latitude, member.last_location.longitude]}
                    icon={createColoredIcon(markerColors[idx % markerColors.length])}
                  >
                    <Popup>
                      <div className="text-center min-w-[150px]">
                        <div className="font-semibold text-zinc-900">{member.name}</div>
                        <div className="text-xs text-zinc-500 mb-2">{member.relationship || 'Familiar'}</div>
                        {member.last_location.address && (
                          <div className="text-sm text-zinc-600 mb-2">{member.last_location.address}</div>
                        )}
                        <div className="text-xs text-zinc-400">
                          {getTimeAgo(member.last_location.timestamp)}
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${member.last_location.latitude},${member.last_location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline block mt-2"
                        >
                          Abrir en Google Maps
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            {/* Family Members List */}
            <div className="space-y-2">
              {familyMembers.map((member, idx) => (
                <div 
                  key={member.id || idx}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: markerColors[idx % markerColors.length] === 'blue' ? '#3B82F6' : 
                               markerColors[idx % markerColors.length] === 'green' ? '#22C55E' :
                               markerColors[idx % markerColors.length] === 'orange' ? '#F97316' :
                               markerColors[idx % markerColors.length] === 'red' ? '#EF4444' :
                               markerColors[idx % markerColors.length] === 'violet' ? '#8B5CF6' : '#EAB308'
                      }}
                    />
                    <div>
                      <div className="font-medium text-zinc-900">{member.name}</div>
                      <div className="text-xs text-zinc-500">
                        {member.last_location.address || 'Ubicación disponible'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {getTimeAgo(member.last_location.timestamp)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveLocationMap;
