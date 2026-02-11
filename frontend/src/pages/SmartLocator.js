import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Users, Shield, Bell, Plus, Trash2, Settings,
  ArrowLeft, AlertTriangle, CheckCircle, Clock, Battery,
  Navigation, Target, Eye, EyeOff, History, Phone,
  Home, Building, School, AlertOctagon, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Zone type icons and colors
const ZONE_CONFIG = {
  safe: { icon: Home, color: 'bg-green-500', label: 'Zona Segura' },
  school: { icon: School, color: 'bg-blue-500', label: 'Colegio' },
  work: { icon: Building, color: 'bg-purple-500', label: 'Trabajo' },
  restricted: { icon: AlertOctagon, color: 'bg-red-500', label: 'Zona Restringida' }
};

const ALERT_SEVERITY = {
  low: { color: 'bg-blue-500', text: 'text-blue-600' },
  medium: { color: 'bg-yellow-500', text: 'text-yellow-600' },
  high: { color: 'bg-orange-500', text: 'text-orange-600' },
  critical: { color: 'bg-red-500', text: 'text-red-600' }
};

const SmartLocator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [members, setMembers] = useState([]);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    lat: 40.4168,  // Madrid by default
    lng: -3.7038,
    radius: 200,
    zone_type: 'safe',
    alerts_enabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, zonesRes, alertsRes, statsRes] = await Promise.all([
        fetch(`${API}/smart-locator/members`, { credentials: 'include' }),
        fetch(`${API}/smart-locator/zones`, { credentials: 'include' }),
        fetch(`${API}/smart-locator/alerts?limit=20`, { credentials: 'include' }),
        fetch(`${API}/smart-locator/stats`, { credentials: 'include' })
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }
      if (zonesRes.ok) {
        const data = await zonesRes.json();
        setZones(data.zones || []);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const createZone = async () => {
    if (!newZone.name) {
      toast.error('Ingresa un nombre para la zona');
      return;
    }

    try {
      const response = await fetch(`${API}/smart-locator/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newZone.name,
          center: { lat: newZone.lat, lng: newZone.lng },
          radius: newZone.radius,
          zone_type: newZone.zone_type,
          alerts_enabled: newZone.alerts_enabled
        })
      });

      if (response.ok) {
        toast.success('Zona creada correctamente');
        setShowAddZone(false);
        setNewZone({
          name: '',
          lat: 40.4168,
          lng: -3.7038,
          radius: 200,
          zone_type: 'safe',
          alerts_enabled: true
        });
        loadData();
      } else {
        toast.error('Error al crear zona');
      }
    } catch (error) {
      toast.error('Error de conexion');
    }
  };

  const deleteZone = async (zoneId) => {
    try {
      const response = await fetch(`${API}/smart-locator/zones/${zoneId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Zona eliminada');
        loadData();
      }
    } catch (error) {
      toast.error('Error al eliminar zona');
    }
  };

  const triggerSOS = async () => {
    try {
      // Get current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const response = await fetch(`${API}/smart-locator/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        });

        if (response.ok) {
          toast.success('Alerta SOS enviada a tus contactos de emergencia');
        }
      }, () => {
        // Without location
        fetch(`${API}/smart-locator/sos`, {
          method: 'POST',
          credentials: 'include'
        }).then(() => {
          toast.success('Alerta SOS enviada (sin ubicacion)');
        });
      });
    } catch (error) {
      toast.error('Error al enviar SOS');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Cargando Smart Locator...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-zinc-400 hover:text-white"
                data-testid="back-button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Navigation className="h-6 w-6 text-green-400" />
                  Smart Family Locator
                </h1>
                <p className="text-zinc-400 text-sm">Localiza y protege a tu familia con zonas inteligentes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Zap className="h-3 w-3 mr-1" /> {stats?.status || 'ACTIVE'}
              </Badge>
              <Button
                onClick={triggerSOS}
                className="bg-red-600 hover:bg-red-700"
                data-testid="sos-btn"
              >
                <AlertOctagon className="h-4 w-4 mr-2" />
                SOS
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Miembros</p>
                  <p className="text-2xl font-bold text-white">{stats.members_tracked}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Zonas</p>
                  <p className="text-2xl font-bold text-white">{stats.safe_zones}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Alertas</p>
                  <p className="text-2xl font-bold text-white">{stats.total_alerts}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Ubicaciones Hoy</p>
                  <p className="text-2xl font-bold text-white">{stats.locations_today}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="map" className="data-[state=active]:bg-green-600">
              <MapPin className="h-4 w-4 mr-2" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="zones" className="data-[state=active]:bg-green-600">
              <Target className="h-4 w-4 mr-2" />
              Zonas
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-green-600">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Placeholder */}
              <Card className="lg:col-span-2 bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Ubicaciones en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-900 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20"></div>
                    <div className="text-center z-10">
                      <MapPin className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <p className="text-zinc-400">Mapa interactivo</p>
                      <p className="text-zinc-500 text-sm mt-2">
                        {members.length} miembros rastreados
                      </p>
                      <Button
                        onClick={() => navigate('/family-admin')}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        Ver Mapa Completo
                      </Button>
                    </div>
                    {/* Simulated member dots */}
                    {members.slice(0, 5).map((member, idx) => (
                      <div
                        key={member.child_id}
                        className={`absolute w-4 h-4 rounded-full ${member.is_in_safe_zone ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}
                        style={{
                          top: `${20 + idx * 15}%`,
                          left: `${30 + idx * 10}%`
                        }}
                        title={member.name}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Familia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No hay miembros</p>
                      <Button
                        onClick={() => navigate('/child-tracking')}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.child_id}
                        className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${member.is_in_safe_zone ? 'bg-green-500' : 'bg-orange-500'}`} />
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-zinc-500 text-xs">
                                {member.current_zones?.length > 0 
                                  ? member.current_zones.join(', ')
                                  : 'Fuera de zonas'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.last_location?.battery_level && (
                              <Badge variant="outline" className="text-xs">
                                <Battery className="h-3 w-3 mr-1" />
                                {member.last_location.battery_level}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Zonas de Seguridad</h2>
              <Button
                onClick={() => setShowAddZone(true)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="add-zone-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Zona
              </Button>
            </div>

            {showAddZone && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Crear Nueva Zona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-300">Nombre</Label>
                      <Input
                        value={newZone.name}
                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                        placeholder="Ej: Casa, Colegio..."
                        className="bg-zinc-900 border-zinc-700 text-white"
                        data-testid="zone-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Tipo de Zona</Label>
                      <select
                        value={newZone.zone_type}
                        onChange={(e) => setNewZone({...newZone, zone_type: e.target.value})}
                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                        data-testid="zone-type-select"
                      >
                        <option value="safe">Zona Segura</option>
                        <option value="school">Colegio</option>
                        <option value="work">Trabajo</option>
                        <option value="restricted">Zona Restringida</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Latitud</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newZone.lat}
                        onChange={(e) => setNewZone({...newZone, lat: parseFloat(e.target.value)})}
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Longitud</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newZone.lng}
                        onChange={(e) => setNewZone({...newZone, lng: parseFloat(e.target.value)})}
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Radio (metros)</Label>
                      <Input
                        type="number"
                        value={newZone.radius}
                        onChange={(e) => setNewZone({...newZone, radius: parseInt(e.target.value)})}
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={newZone.alerts_enabled}
                        onCheckedChange={(checked) => setNewZone({...newZone, alerts_enabled: checked})}
                      />
                      <Label className="text-zinc-300">Alertas activadas</Label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={createZone} className="bg-green-600 hover:bg-green-700">
                      Crear Zona
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddZone(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.length === 0 ? (
                <Card className="col-span-full bg-zinc-800/50 border-zinc-700">
                  <CardContent className="py-12 text-center">
                    <Target className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No hay zonas configuradas</p>
                    <p className="text-zinc-500 text-sm mt-2">
                      Crea zonas seguras para recibir alertas cuando tus familiares entren o salgan
                    </p>
                  </CardContent>
                </Card>
              ) : (
                zones.map((zone) => {
                  const config = ZONE_CONFIG[zone.zone_type] || ZONE_CONFIG.safe;
                  const Icon = config.icon;
                  return (
                    <Card key={zone.zone_id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${config.color} rounded-lg`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{zone.name}</p>
                              <p className="text-zinc-500 text-xs">{config.label}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteZone(zone.zone_id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between text-zinc-400">
                            <span>Radio:</span>
                            <span className="text-white">{zone.radius}m</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>Alertas:</span>
                            <Badge variant={zone.alerts_enabled ? "default" : "secondary"}>
                              {zone.alerts_enabled ? 'Activas' : 'Desactivadas'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  Historial de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-zinc-400">No hay alertas recientes</p>
                    <p className="text-zinc-500 text-sm mt-2">
                      Tu familia esta segura
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.map((alert, idx) => {
                      const severity = ALERT_SEVERITY[alert.severity] || ALERT_SEVERITY.low;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            alert.is_read ? 'bg-zinc-900/30 border-zinc-700' : 'bg-zinc-900/60 border-zinc-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${severity.color}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium">{alert.message}</p>
                                <Badge variant="outline" className={severity.text}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(alert.timestamp).toLocaleString('es-ES')}
                                </span>
                                {alert.zone_name && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {alert.zone_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartLocator;
