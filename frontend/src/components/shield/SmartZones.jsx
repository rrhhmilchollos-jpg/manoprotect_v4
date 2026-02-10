/**
 * ManoProtect Shield - Smart Zones
 * Behavior learning and anomaly detection for family members
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, Home, Briefcase, School, AlertTriangle, Plus, 
  Clock, Users, Shield, Trash2, Edit2, Bell, BellOff,
  CheckCircle, Navigation, Activity, Brain
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ZONE_TYPES = [
  { id: 'home', label: 'Casa', icon: Home, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'work', label: 'Trabajo', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { id: 'school', label: 'Colegio', icon: School, color: 'bg-amber-100 text-amber-600' },
  { id: 'frequent', label: 'Frecuente', icon: MapPin, color: 'bg-purple-100 text-purple-600' },
  { id: 'risky', label: 'Zona de Riesgo', icon: AlertTriangle, color: 'bg-red-100 text-red-600' }
];

const SmartZones = () => {
  const [zones, setZones] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState('all');
  const [behaviorLearning, setBehaviorLearning] = useState(true);
  
  const [newZone, setNewZone] = useState({
    name: '',
    zone_type: 'home',
    address: '',
    radius_meters: 100,
    alert_on_enter: false,
    alert_on_exit: true,
    alert_on_anomaly: true,
    schedule: null
  });

  const familyMembers = [
    { id: '1', name: 'Mamá', avatar: 'M', status: 'home' },
    { id: '2', name: 'Papá', avatar: 'P', status: 'work' },
    { id: '3', name: 'Abuelo', avatar: 'A', status: 'home' }
  ];

  // Demo zones
  useEffect(() => {
    setZones([
      {
        id: '1',
        name: 'Casa Familiar',
        zone_type: 'home',
        address: 'Calle Mayor 15, Valencia',
        radius_meters: 50,
        alert_on_enter: false,
        alert_on_exit: true,
        alert_on_anomaly: true,
        members_inside: ['Mamá', 'Abuelo'],
        last_activity: 'Abuelo llegó hace 2 horas'
      },
      {
        id: '2',
        name: 'Oficina Papá',
        zone_type: 'work',
        address: 'Av. del Puerto 200, Valencia',
        radius_meters: 100,
        alert_on_enter: true,
        alert_on_exit: true,
        alert_on_anomaly: true,
        members_inside: ['Papá'],
        last_activity: 'Papá llegó a las 9:00'
      },
      {
        id: '3',
        name: 'Centro Comercial',
        zone_type: 'risky',
        address: 'CC Nuevo Centro, Valencia',
        radius_meters: 200,
        alert_on_enter: true,
        alert_on_exit: false,
        alert_on_anomaly: true,
        members_inside: [],
        last_activity: null
      }
    ]);
  }, []);

  const handleAddZone = () => {
    const zone = {
      id: Date.now().toString(),
      ...newZone,
      members_inside: [],
      last_activity: null
    };
    setZones([...zones, zone]);
    setNewZone({
      name: '',
      zone_type: 'home',
      address: '',
      radius_meters: 100,
      alert_on_enter: false,
      alert_on_exit: true,
      alert_on_anomaly: true,
      schedule: null
    });
    setShowAddDialog(false);
  };

  const handleDeleteZone = (id) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const getZoneTypeInfo = (type) => ZONE_TYPES.find(t => t.id === type) || ZONE_TYPES[0];

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Zonas Inteligentes</CardTitle>
              <CardDescription>
                Aprende patrones y detecta comportamientos anómalos
              </CardDescription>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Zona
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Zona Inteligente</DialogTitle>
                <DialogDescription>
                  Define un área y configura las alertas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Zona</label>
                  <div className="flex flex-wrap gap-2">
                    {ZONE_TYPES.map(type => (
                      <Button
                        key={type.id}
                        variant={newZone.zone_type === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewZone({...newZone, zone_type: type.id})}
                        className={newZone.zone_type === type.id ? 'bg-blue-600' : ''}
                      >
                        <type.icon className="w-4 h-4 mr-1" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Nombre de la zona (ej: Casa de la abuela)"
                  value={newZone.name}
                  onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                />
                <Input
                  placeholder="Dirección"
                  value={newZone.address}
                  onChange={(e) => setNewZone({...newZone, address: e.target.value})}
                />
                <div>
                  <label className="text-sm font-medium">Radio: {newZone.radius_meters}m</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={newZone.radius_meters}
                    onChange={(e) => setNewZone({...newZone, radius_meters: parseInt(e.target.value)})}
                    className="w-full mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alertar al entrar</span>
                    <Switch
                      checked={newZone.alert_on_enter}
                      onCheckedChange={(v) => setNewZone({...newZone, alert_on_enter: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alertar al salir</span>
                    <Switch
                      checked={newZone.alert_on_exit}
                      onCheckedChange={(v) => setNewZone({...newZone, alert_on_exit: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Detectar anomalías</span>
                    <Switch
                      checked={newZone.alert_on_anomaly}
                      onCheckedChange={(v) => setNewZone({...newZone, alert_on_anomaly: v})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddZone}
                  disabled={!newZone.name || !newZone.address}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Crear Zona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* AI Learning Status */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-indigo-900">Aprendizaje de Comportamiento</p>
                <p className="text-sm text-indigo-700">
                  La IA aprende los patrones normales de tu familia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={behaviorLearning ? 'bg-emerald-500' : 'bg-zinc-400'}>
                {behaviorLearning ? 'Activo' : 'Pausado'}
              </Badge>
              <Switch
                checked={behaviorLearning}
                onCheckedChange={setBehaviorLearning}
              />
            </div>
          </div>
          {behaviorLearning && (
            <div className="mt-3 pt-3 border-t border-indigo-200">
              <p className="text-xs text-indigo-600">
                <Activity className="w-3 h-3 inline mr-1" />
                Analizando: "Mamá siempre está en casa después de las 20:00" • 
                "Abuelo no suele salir del barrio" • "Papá llega del trabajo entre 18:00-19:00"
              </p>
            </div>
          )}
        </div>

        {/* Family Members Quick Status */}
        <div>
          <h4 className="font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Familia ahora mismo
          </h4>
          <div className="flex gap-3">
            {familyMembers.map(member => (
              <div 
                key={member.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedMember === member.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-zinc-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedMember(selectedMember === member.id ? 'all' : member.id)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    {member.status === 'home' ? (
                      <><Home className="w-3 h-3" /> En casa</>
                    ) : (
                      <><Briefcase className="w-3 h-3" /> Trabajando</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zones List */}
        <div>
          <h4 className="font-semibold text-zinc-700 mb-3">Zonas configuradas</h4>
          <div className="space-y-3">
            {zones.map(zone => {
              const typeInfo = getZoneTypeInfo(zone.zone_type);
              
              return (
                <div 
                  key={zone.id}
                  className="border border-zinc-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                        <typeInfo.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-zinc-900">{zone.name}</h5>
                          <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-zinc-500 mt-0.5">{zone.address}</p>
                        <p className="text-xs text-zinc-400">Radio: {zone.radius_meters}m</p>
                        
                        {/* Members Inside */}
                        {zone.members_inside.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600">
                              {zone.members_inside.join(', ')} aquí
                            </span>
                          </div>
                        )}
                        
                        {/* Last Activity */}
                        {zone.last_activity && (
                          <p className="text-xs text-zinc-400 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {zone.last_activity}
                          </p>
                        )}
                        
                        {/* Alert Settings */}
                        <div className="flex items-center gap-2 mt-2">
                          {zone.alert_on_enter && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                              <Bell className="w-3 h-3 mr-1" /> Al entrar
                            </Badge>
                          )}
                          {zone.alert_on_exit && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                              <Bell className="w-3 h-3 mr-1" /> Al salir
                            </Badge>
                          )}
                          {zone.alert_on_anomaly && (
                            <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                              <Brain className="w-3 h-3 mr-1" /> Anomalías
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteZone(zone.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Examples */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Ejemplos de anomalías que detectamos
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• "Mamá siempre está en casa a las 20:00" → Si no está, alerta suave</li>
            <li>• "El abuelo nunca sale del barrio" → Si sale más de 2km, alerta</li>
            <li>• "Papá llega del trabajo a las 18:30" → Si no ha salido a las 20:00, notificación</li>
            <li>• Entrada a zona de riesgo configurada</li>
          </ul>
        </div>

        {/* Info */}
        <div className="text-xs text-zinc-500 text-center">
          <p>Las zonas inteligentes combinan geofencing con aprendizaje automático</p>
          <p>para detectar comportamientos inusuales y proteger a tu familia</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartZones;
