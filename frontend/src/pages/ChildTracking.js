import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Users, ArrowLeft, Plus, Loader2, Phone, 
  Eye, EyeOff, History, Trash2, Settings, Bell, BellOff,
  ExternalLink, Clock, CheckCircle2, AlertTriangle, Crown,
  Shield, Send, Mail, Copy, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChildTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featureAvailable, setFeatureAvailable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [locatingChild, setLocatingChild] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  // Form state
  const [newChild, setNewChild] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    silent_mode: false
  });

  // Determine person type based on age
  const getPersonType = (age) => {
    if (!age) return 'familiar';
    const ageNum = parseInt(age);
    if (ageNum < 18) return 'niño';
    if (ageNum >= 65) return 'anciano';
    return 'adulto';
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await axios.get(`${API}/family/children`, {
        withCredentials: true
      });
      setChildren(response.data.children || []);
      setFeatureAvailable(response.data.feature_available);
    } catch (error) {
      console.error('Error loading children:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    
    if (!newChild.name || !newChild.phone) {
      toast.error('Por favor, completa nombre y teléfono');
      return;
    }

    if (!newChild.email) {
      toast.error('El email es obligatorio para enviar el enlace de vinculación');
      return;
    }

    if (!newChild.age) {
      toast.error('Por favor, indica la edad para clasificar automáticamente');
      return;
    }

    try {
      const payload = {
        name: newChild.name,
        phone: newChild.phone,
        email: newChild.email,
        age: parseInt(newChild.age),
        silent_mode: newChild.silent_mode
      };
      
      const response = await axios.post(`${API}/family/children/add`, payload, {
        withCredentials: true
      });
      
      // Show success with email status
      if (response.data.email_sent) {
        toast.success(`${response.data.message} 📧`);
      } else {
        toast.success(response.data.message);
      }
      
      setShowAddForm(false);
      setNewChild({ name: '', phone: '', email: '', age: '', silent_mode: false });
      await loadChildren();
    } catch (error) {
      console.error('Error adding child:', error);
      toast.error(error.response?.data?.detail || 'Error al añadir familiar');
    }
  };

  const handleLocateChild = async (child) => {
    setLocatingChild(child.child_id);
    
    try {
      const response = await axios.post(
        `${API}/family/children/${child.child_id}/locate?silent=${child.silent_mode}`,
        {},
        { withCredentials: true }
      );
      
      // Show detailed message about what was sent
      const { fcm_sent, sms_sent, message } = response.data;
      
      if (fcm_sent) {
        toast.success(`📱 Notificación enviada a ${child.name}. Esperando respuesta...`);
      } else if (sms_sent) {
        toast.success(`📨 SMS enviado a ${child.name}. Esperando respuesta...`);
      } else {
        toast.info(message || 'Solicitud enviada');
      }
      
      // Reload after a delay to check for response
      setTimeout(() => {
        loadChildren();
        setLocatingChild(null);
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al solicitar ubicación');
      setLocatingChild(null);
    }
  };

  const handleToggleSilentMode = async (child) => {
    try {
      await axios.patch(
        `${API}/family/children/${child.child_id}/settings?silent_mode=${!child.silent_mode}`,
        {},
        { withCredentials: true }
      );
      
      toast.success(child.silent_mode ? 'Notificaciones activadas' : 'Modo silencioso activado');
      loadChildren();
    } catch (error) {
      toast.error('Error al cambiar configuración');
    }
  };

  const handleViewHistory = async (child) => {
    setShowHistory(child.child_id);
    
    try {
      const response = await axios.get(
        `${API}/family/children/${child.child_id}/history?days=7`,
        { withCredentials: true }
      );
      setHistoryData(response.data.history || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al cargar historial');
      setShowHistory(null);
    }
  };

  const handleRemoveChild = async (child) => {
    if (!window.confirm(`¿Eliminar a ${child.name} del seguimiento familiar?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/family/children/${child.child_id}`, {
        withCredentials: true
      });
      toast.success('Niño eliminado del seguimiento');
      loadChildren();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // Upgrade prompt for non-yearly plans
  if (!loading && !featureAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-indigo-200">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/family-admin')} className="rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Localización de Niños</h1>
          </div>
        </header>
        
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-indigo-800 mb-4">
            Función Exclusiva Plan Anual
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            La localización de niños por teléfono está disponible exclusivamente 
            en el <strong>Plan Familiar Anual</strong>. Incluye:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            {[
              { icon: MapPin, text: 'Localización bajo demanda' },
              { icon: History, text: 'Historial de ubicaciones' },
              { icon: BellOff, text: 'Modo silencioso opcional' },
              { icon: Users, text: 'Hasta 5 miembros' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200">
                <item.icon className="w-6 h-6 text-indigo-600" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 h-14 text-lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Actualizar a Plan Anual - €399.99/año
          </Button>
          <p className="text-sm text-zinc-500 mt-4">
            Ahorra €199.89 respecto al plan mensual
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-indigo-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/family-admin')} className="rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                Localización Familiar
              </h1>
              <p className="text-sm text-zinc-500">Niños, Adultos y Ancianos • Plan Premium</p>
            </div>
          </div>
          <Badge className="bg-indigo-600 text-white">
            <Crown className="w-4 h-4 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* SOS Emergency Button Card */}
        <Card className="mb-6 bg-gradient-to-br from-red-600 to-red-700 border-0 shadow-lg shadow-red-500/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">EMERGENCIA FAMILIAR</h3>
            <p className="text-red-100 text-sm mb-4">
              Pulsa el botón para enviar tu ubicación exacta a todos tus familiares
            </p>
            
            <Button
              onClick={() => navigate('/sos-emergency')}
              className="w-32 h-32 rounded-full bg-white hover:bg-red-100 text-red-600 text-3xl font-black shadow-xl mx-auto flex flex-col items-center justify-center"
              data-testid="sos-main-button"
            >
              <span className="text-4xl">SOS</span>
              <span className="text-xs font-normal mt-1">⚠️ Pulsa si necesitas ayuda urgente</span>
            </Button>
            
            <div className="grid grid-cols-3 gap-2 mt-6 text-white text-xs">
              <div className="flex flex-col items-center">
                <MapPin className="w-5 h-5 mb-1" />
                <span>GPS Preciso</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-5 h-5 mb-1" />
                <span>Toda la Familia</span>
              </div>
              <div className="flex flex-col items-center">
                <Send className="w-5 h-5 mb-1" />
                <span>Instantáneo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card - How it works */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-5">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ¿Cómo funciona la localización?
            </h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p className="text-blue-700">Añade a tu familiar con su número de teléfono</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p className="text-blue-700">Ellos instalan ManoProtect en su móvil</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <p className="text-blue-700">Pulsa "Solicitar Ubicación" cuando necesites saber dónde están</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <p className="text-blue-700">Recibirás su ubicación exacta con mapa y dirección</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
              💡 El modo silencioso permite localizar sin que el familiar reciba notificación visible
            </p>
          </CardContent>
        </Card>

        {/* Add Child Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-14 text-lg"
            data-testid="add-family-member-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Familiar para Localizar
          </Button>
        )}

        {/* Add Child Form */}
        {showAddForm && (
          <Card className="mb-6 border-2 border-indigo-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Añadir Familiar para Localizar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej: María"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    className="mt-1"
                    data-testid="child-name-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Ej: 12"
                    value={newChild.age}
                    onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                    className="mt-1"
                    data-testid="child-age-input"
                  />
                  {newChild.age && (
                    <p className="text-sm mt-1 text-indigo-600 font-medium">
                      Clasificación automática: {getPersonType(newChild.age).toUpperCase()}
                      {parseInt(newChild.age) < 18 && ' 👶'}
                      {parseInt(newChild.age) >= 65 && ' 👴'}
                      {parseInt(newChild.age) >= 18 && parseInt(newChild.age) < 65 && ' 👤'}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Número de teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej: +34 612 345 678"
                    value={newChild.phone}
                    onChange={(e) => setNewChild({ ...newChild, phone: e.target.value })}
                    className="mt-1"
                    data-testid="child-phone-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ej: familiar@email.com"
                    value={newChild.email}
                    onChange={(e) => setNewChild({ ...newChild, email: e.target.value })}
                    className="mt-1"
                    required
                    data-testid="child-email-input"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    📧 Obligatorio - Se enviará un enlace de vinculación a este email
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                  <div>
                    <Label htmlFor="silent" className="font-medium">Modo silencioso</Label>
                    <p className="text-sm text-zinc-500">
                      No recibirá notificación cuando solicites su ubicación
                    </p>
                  </div>
                  <Switch
                    id="silent"
                    checked={newChild.silent_mode}
                    onCheckedChange={(checked) => setNewChild({ ...newChild, silent_mode: checked })}
                  />
                </div>
                
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    data-testid="add-child-submit"
                  >
                    Añadir Familiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Children List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="mt-2 text-zinc-600">Cargando...</p>
          </div>
        ) : children.length === 0 ? (
          <Card className="text-center py-12 border-2 border-dashed border-zinc-300">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                No hay familiares añadidos
              </h3>
              <p className="text-zinc-500">
                Añade a tus hijos, padres o abuelos para poder localizarlos en cualquier momento
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <Card 
                key={child.child_id} 
                className={`border-2 ${child.device_linked ? 'border-emerald-200' : 'border-amber-200'}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        child.person_type === 'child' ? 'bg-blue-100' :
                        child.person_type === 'elderly' ? 'bg-purple-100' :
                        child.device_linked ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}>
                        <span className="text-2xl">
                          {child.person_type === 'child' ? '👶' :
                           child.person_type === 'elderly' ? '👴' : '👤'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{child.name}</h3>
                        <p className="text-zinc-500 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {child.phone}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* Age and Type Badge */}
                          {child.age && (
                            <Badge className={`${
                              child.person_type === 'child' ? 'bg-blue-100 text-blue-700' :
                              child.person_type === 'elderly' ? 'bg-purple-100 text-purple-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {child.age} años - {child.person_type === 'child' ? 'Niño' : 
                                                  child.person_type === 'elderly' ? 'Anciano' : 'Adulto'}
                            </Badge>
                          )}
                          {child.device_linked ? (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Dispositivo vinculado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Pendiente vincular
                            </Badge>
                          )}
                          {child.silent_mode ? (
                            <Badge className="bg-zinc-100 text-zinc-600">
                              <BellOff className="w-3 h-3 mr-1" />
                              Silencioso
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-600">
                              <Bell className="w-3 h-3 mr-1" />
                              Con notificación
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSilentMode(child)}
                        title={child.silent_mode ? 'Activar notificaciones' : 'Activar modo silencioso'}
                      >
                        {child.silent_mode ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChild(child)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Invitation Link - Show when not linked */}
                  {!child.device_linked && child.invite_token && (
                    <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Enlace de Vinculación
                      </p>
                      <p className="text-xs text-amber-600 mb-3">
                        Envía este enlace a {child.name} para que vincule su dispositivo:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://manoprotect.com/vincular/${child.child_id}?token=${child.invite_token}`}
                          className="flex-1 text-xs p-2 bg-white border border-amber-300 rounded text-zinc-600"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500 text-amber-700 hover:bg-amber-100"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://manoprotect.com/vincular/${child.child_id}?token=${child.invite_token}`);
                            toast.success('Enlace copiado al portapapeles');
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            const link = `https://manoprotect.com/vincular/${child.child_id}?token=${child.invite_token}`;
                            const text = `Hola ${child.name}, te he añadido a mi familia en ManoProtect para poder localizarte en caso de emergencia. Pulsa este enlace para vincular tu dispositivo: ${link}`;
                            window.open(`https://wa.me/${child.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Enviar por WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const link = `https://manoprotect.com/vincular/${child.child_id}?token=${child.invite_token}`;
                            const subject = `${user?.name || 'Tu familiar'} te ha añadido a ManoProtect`;
                            const body = `Hola ${child.name},\n\nTe he añadido a mi familia en ManoProtect para poder localizarte en caso de emergencia.\n\nPulsa este enlace para vincular tu dispositivo:\n${link}\n\nSaludos`;
                            window.open(`mailto:${child.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                          }}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Enviar por Email
                        </Button>
                      </div>
                      {child.email && (
                        <p className="text-xs text-amber-600 mt-2">
                          📧 Ya se envió invitación automática a: {child.email}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Last Location */}
                  {child.last_location && (
                    <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-800 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Última ubicación conocida:
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-emerald-700">
                          <p>Lat: {child.last_location.latitude?.toFixed(6)}</p>
                          <p>Long: {child.last_location.longitude?.toFixed(6)}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(child.last_location.timestamp).toLocaleString('es-ES')}
                          </p>
                        </div>
                        <a
                          href={child.last_location.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          Ver en mapa <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleLocateChild(child)}
                      disabled={locatingChild === child.child_id || !child.device_linked}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      data-testid={`locate-${child.child_id}`}
                    >
                      {locatingChild === child.child_id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando solicitud...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Solicitar Ubicación</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewHistory(child)}
                      disabled={!child.device_linked}
                      className="flex-1"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Historial
                    </Button>
                  </div>
                  {!child.device_linked && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      El familiar debe instalar ManoProtect y vincular su dispositivo
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Historial de Ubicaciones (7 días)
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowHistory(null)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent>
                {historyData.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">
                    No hay historial de ubicaciones
                  </p>
                ) : (
                  <div className="space-y-3">
                    {historyData.map((entry, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(entry.created_at).toLocaleString('es-ES')}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {entry.location?.latitude?.toFixed(6)}, {entry.location?.longitude?.toFixed(6)}
                            </p>
                          </div>
                          <a
                            href={entry.location?.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildTracking;
