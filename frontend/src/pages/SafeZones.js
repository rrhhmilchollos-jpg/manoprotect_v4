import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, ArrowLeft, Plus, Loader2, Trash2, Settings, Bell, 
  Shield, Home, Briefcase, GraduationCap, Edit2, Check, X,
  Users, AlertTriangle, Crown, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Zone type presets
const ZONE_PRESETS = {
  home: { name: 'Casa', icon: '🏠', color: '#10B981', lucide: Home },
  work: { name: 'Trabajo', icon: '💼', color: '#3B82F6', lucide: Briefcase },
  school: { name: 'Colegio', icon: '🏫', color: '#8B5CF6', lucide: GraduationCap },
  custom: { name: 'Personalizada', icon: '📍', color: '#F59E0B', lucide: MapPin }
};

// Map click handler component
function MapClickHandler({ onMapClick, isSelecting }) {
  useMapEvents({
    click: (e) => {
      if (isSelecting) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Map center updater component
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

const SafeZones = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [maxZones, setMaxZones] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  
  // Current user location
  const [userLocation, setUserLocation] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid default
  
  // New zone form state
  const [newZone, setNewZone] = useState({
    name: '',
    zone_type: 'custom',
    latitude: null,
    longitude: null,
    radius: 200,
    alert_on_entry: true,
    alert_on_exit: true,
    notify_sms: true,
    notify_push: true,
    member_ids: [],
    address: ''
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Load geofences
  useEffect(() => {
    loadGeofences();
    loadFamilyMembers();
    loadEvents();
  }, []);

  const loadGeofences = async () => {
    try {
      const response = await axios.get(`${API}/geofences`, { withCredentials: true });
      setGeofences(response.data.geofences || []);
      setIsPremium(response.data.is_premium);
      setMaxZones(response.data.max_zones);
    } catch (error) {
      console.error('Error loading geofences:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const response = await axios.get(`${API}/family/children`, { withCredentials: true });
      setFamilyMembers(response.data.children || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/geofences/events?days=7`, { withCredentials: true });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Handle map click for location selection
  const handleMapClick = useCallback(async (lat, lng) => {
    setNewZone(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setIsSelectingLocation(false);
    
    // Try to get address via reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setNewZone(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
    }
  }, []);

  // Select preset zone type
  const selectPreset = (type) => {
    const preset = ZONE_PRESETS[type];
    setNewZone(prev => ({
      ...prev,
      zone_type: type,
      name: prev.name || preset.name
    }));
  };

  // Create new geofence
  const handleCreateZone = async (e) => {
    e.preventDefault();
    
    if (!newZone.name) {
      toast.error('Por favor, introduce un nombre para la zona');
      return;
    }
    
    if (!newZone.latitude || !newZone.longitude) {
      toast.error('Por favor, selecciona una ubicación en el mapa');
      return;
    }

    try {
      const response = await axios.post(`${API}/geofences`, newZone, { withCredentials: true });
      toast.success(response.data.message);
      setShowAddForm(false);
      setNewZone({
        name: '',
        zone_type: 'custom',
        latitude: null,
        longitude: null,
        radius: 200,
        alert_on_entry: true,
        alert_on_exit: true,
        notify_sms: true,
        notify_push: true,
        member_ids: [],
        address: ''
      });
      await loadGeofences();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear zona segura');
    }
  };

  // Delete geofence
  const handleDeleteZone = async (geofenceId, zoneName) => {
    if (!window.confirm(`¿Eliminar la zona "${zoneName}"?`)) return;
    
    try {
      await axios.delete(`${API}/geofences/${geofenceId}`, { withCredentials: true });
      toast.success('Zona eliminada');
      await loadGeofences();
    } catch (error) {
      toast.error('Error al eliminar zona');
    }
  };

  // Toggle zone active state
  const handleToggleZone = async (zone) => {
    try {
      await axios.put(`${API}/geofences/${zone.geofence_id}`, 
        { is_active: !zone.is_active },
        { withCredentials: true }
      );
      toast.success(zone.is_active ? 'Zona desactivada' : 'Zona activada');
      await loadGeofences();
    } catch (error) {
      toast.error('Error al actualizar zona');
    }
  };

  // Toggle member in zone
  const toggleMemberInZone = (memberId) => {
    setNewZone(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberId)
        ? prev.member_ids.filter(id => id !== memberId)
        : [...prev.member_ids, memberId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-emerald-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/family-admin')} className="rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-600" />
                Zonas Seguras
              </h1>
              <p className="text-sm text-zinc-500">
                {geofences.length} de {isPremium ? '∞' : maxZones} zonas configuradas
              </p>
            </div>
          </div>
          {isPremium ? (
            <Badge className="bg-emerald-600 text-white">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </Badge>
          ) : (
            <Badge className="bg-amber-500 text-white" onClick={() => navigate('/pricing')}>
              Gratis (1 zona)
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-5">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ¿Cómo funcionan las Zonas Seguras?
            </h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p className="text-emerald-700">Define zonas como Casa, Trabajo o Colegio</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p className="text-emerald-700">Configura el radio de seguridad (50-500m)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <p className="text-emerald-700">Recibe alertas cuando tu familia entre o salga</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <p className="text-emerald-700">Notificaciones por SMS y push en tiempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Zone Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={!isPremium && geofences.length >= maxZones}
            className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-14 text-lg"
            data-testid="add-safe-zone-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Zona Segura
          </Button>
        )}

        {/* Upgrade prompt for free users at limit */}
        {!isPremium && geofences.length >= maxZones && !showAddForm && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-800">Has alcanzado el límite de zonas gratuitas</p>
                <p className="text-sm text-amber-600">Actualiza al Plan Familiar para zonas ilimitadas</p>
              </div>
              <Button onClick={() => navigate('/pricing')} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Zone Form */}
        {showAddForm && (
          <Card className="mb-6 border-2 border-emerald-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Nueva Zona Segura
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateZone} className="space-y-6">
                {/* Zone Type Presets */}
                <div>
                  <Label className="mb-3 block">Tipo de Zona</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(ZONE_PRESETS).map(([type, preset]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => selectPreset(type)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newZone.zone_type === type 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-zinc-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{preset.icon}</span>
                        <span className="text-xs font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone Name */}
                <div>
                  <Label htmlFor="zone-name">Nombre de la zona</Label>
                  <Input
                    id="zone-name"
                    placeholder="Ej: Casa de los abuelos"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="mt-1"
                    data-testid="zone-name-input"
                  />
                </div>

                {/* Map for Location Selection */}
                <div>
                  <Label className="mb-2 block">Ubicación en el mapa</Label>
                  <div className="rounded-lg overflow-hidden border-2 border-zinc-200" style={{ height: '300px' }}>
                    <MapContainer
                      center={[userLocation.lat, userLocation.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler onMapClick={handleMapClick} isSelecting={true} />
                      
                      {/* Show selected location */}
                      {newZone.latitude && newZone.longitude && (
                        <>
                          <Marker position={[newZone.latitude, newZone.longitude]} />
                          <Circle
                            center={[newZone.latitude, newZone.longitude]}
                            radius={newZone.radius}
                            pathOptions={{
                              color: ZONE_PRESETS[newZone.zone_type]?.color || '#10B981',
                              fillColor: ZONE_PRESETS[newZone.zone_type]?.color || '#10B981',
                              fillOpacity: 0.2
                            }}
                          />
                        </>
                      )}

                      {/* Show existing geofences */}
                      {geofences.map(fence => (
                        <Circle
                          key={fence.geofence_id}
                          center={[fence.latitude, fence.longitude]}
                          radius={fence.radius}
                          pathOptions={{
                            color: '#94A3B8',
                            fillColor: '#94A3B8',
                            fillOpacity: 0.1,
                            dashArray: '5, 5'
                          }}
                        />
                      ))}
                    </MapContainer>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    👆 Pulsa en el mapa para seleccionar la ubicación central de la zona
                  </p>
                  {newZone.address && (
                    <p className="text-sm text-emerald-600 mt-2">
                      📍 {newZone.address}
                    </p>
                  )}
                </div>

                {/* Radius Slider */}
                <div>
                  <Label className="mb-3 block">Radio de la zona: {newZone.radius}m</Label>
                  <Slider
                    value={[newZone.radius]}
                    onValueChange={([value]) => setNewZone({ ...newZone, radius: value })}
                    min={50}
                    max={500}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>50m</span>
                    <span>200m</span>
                    <span>500m</span>
                  </div>
                </div>

                {/* Alert Settings */}
                <div className="space-y-4 p-4 bg-zinc-50 rounded-lg">
                  <h4 className="font-medium text-zinc-700">Configuración de Alertas</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Alertar al ENTRAR</Label>
                      <p className="text-xs text-zinc-500">Cuando un familiar llegue a esta zona</p>
                    </div>
                    <Switch
                      checked={newZone.alert_on_entry}
                      onCheckedChange={(checked) => setNewZone({ ...newZone, alert_on_entry: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Alertar al SALIR</Label>
                      <p className="text-xs text-zinc-500">Cuando un familiar abandone esta zona</p>
                    </div>
                    <Switch
                      checked={newZone.alert_on_exit}
                      onCheckedChange={(checked) => setNewZone({ ...newZone, alert_on_exit: checked })}
                    />
                  </div>
                  
                  <hr className="border-zinc-200" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Notificación Push</Label>
                      <p className="text-xs text-zinc-500">Recibir notificación en la app</p>
                    </div>
                    <Switch
                      checked={newZone.notify_push}
                      onCheckedChange={(checked) => setNewZone({ ...newZone, notify_push: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Notificación SMS</Label>
                      <p className="text-xs text-zinc-500">Recibir SMS de alerta</p>
                    </div>
                    <Switch
                      checked={newZone.notify_sms}
                      onCheckedChange={(checked) => setNewZone({ ...newZone, notify_sms: checked })}
                    />
                  </div>
                </div>

                {/* Family Members to Track */}
                {familyMembers.length > 0 && (
                  <div>
                    <Label className="mb-3 block">Familiares a vigilar en esta zona</Label>
                    <div className="space-y-2">
                      {familyMembers.map(member => (
                        <div
                          key={member.child_id}
                          onClick={() => toggleMemberInZone(member.child_id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                            newZone.member_ids.includes(member.child_id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-zinc-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {member.person_type === 'child' ? '👶' :
                               member.person_type === 'elderly' ? '👴' : '👤'}
                            </span>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-zinc-500">{member.phone}</p>
                            </div>
                          </div>
                          {newZone.member_ids.includes(member.child_id) && (
                            <Check className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      💡 Si no seleccionas a nadie, se vigilará a todos los familiares
                    </p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="create-zone-submit"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Crear Zona Segura
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Zones List */}
        {geofences.length === 0 && !showAddForm ? (
          <Card className="text-center py-12 border-2 border-dashed border-zinc-300">
            <CardContent>
              <Shield className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                No hay zonas seguras configuradas
              </h3>
              <p className="text-zinc-500">
                Crea tu primera zona para recibir alertas cuando tu familia entre o salga
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {geofences.map((zone) => (
              <Card 
                key={zone.geofence_id} 
                className={`border-2 ${zone.is_active ? 'border-emerald-200' : 'border-zinc-200 opacity-60'}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${ZONE_PRESETS[zone.zone_type]?.color}20` }}
                      >
                        {zone.icon || ZONE_PRESETS[zone.zone_type]?.icon || '📍'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {zone.name}
                          {!zone.is_active && (
                            <Badge variant="outline" className="text-zinc-500">Desactivada</Badge>
                          )}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                          Radio: {zone.radius}m • {ZONE_PRESETS[zone.zone_type]?.name || 'Personalizada'}
                        </p>
                        {zone.address && (
                          <p className="text-xs text-zinc-400 mt-1 truncate max-w-md">
                            📍 {zone.address}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleZone(zone)}
                        title={zone.is_active ? 'Desactivar zona' : 'Activar zona'}
                      >
                        {zone.is_active ? <Bell className="w-4 h-4 text-emerald-600" /> : <Bell className="w-4 h-4 text-zinc-400" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteZone(zone.geofence_id, zone.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Zone Settings Summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {zone.alert_on_entry && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        Alerta al entrar
                      </Badge>
                    )}
                    {zone.alert_on_exit && (
                      <Badge className="bg-amber-100 text-amber-700">
                        Alerta al salir
                      </Badge>
                    )}
                    {zone.notify_push && (
                      <Badge className="bg-blue-100 text-blue-700">
                        Push
                      </Badge>
                    )}
                    {zone.notify_sms && (
                      <Badge className="bg-purple-100 text-purple-700">
                        SMS
                      </Badge>
                    )}
                  </div>

                  {/* Mini Map Preview */}
                  <div className="rounded-lg overflow-hidden border border-zinc-200" style={{ height: '150px' }}>
                    <MapContainer
                      center={[zone.latitude, zone.longitude]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Circle
                        center={[zone.latitude, zone.longitude]}
                        radius={zone.radius}
                        pathOptions={{
                          color: ZONE_PRESETS[zone.zone_type]?.color || '#10B981',
                          fillColor: ZONE_PRESETS[zone.zone_type]?.color || '#10B981',
                          fillOpacity: 0.3
                        }}
                      />
                      <Marker position={[zone.latitude, zone.longitude]} />
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Events Section */}
        {events.length > 0 && (
          <Card className="mt-6">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setShowEvents(!showEvents)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Eventos Recientes ({events.length})
                </span>
                {showEvents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
            {showEvents && (
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-96 overflow-auto">
                  {events.map((event) => (
                    <div 
                      key={event.event_id}
                      className={`p-3 rounded-lg border ${
                        event.event_type === 'entry' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{event.icon}</span>
                          <div>
                            <p className="font-medium">
                              {event.event_type === 'entry' ? '📍 Entrada en' : '⚠️ Salida de'} {event.geofence_name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {new Date(event.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SafeZones;
