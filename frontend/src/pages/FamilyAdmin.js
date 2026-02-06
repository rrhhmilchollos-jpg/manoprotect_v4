import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, Shield, AlertTriangle, Bell, Plus, Trash2, Edit2, 
  ArrowLeft, UserPlus, Heart, Eye, Settings, Check, X, Loader2,
  MapPin, Crown, Phone, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PushNotificationSettings from '@/components/PushNotificationSettings';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const FamilyAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'hijo',
    is_senior: false,
    simplified_mode: false,
    alert_level: 'all'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API}/family/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    // Validar teléfono - OBLIGATORIO para recibir SMS de emergencia
    if (!formData.phone || formData.phone.length < 9) {
      toast.error('El teléfono es obligatorio para recibir alertas SOS');
      return;
    }

    // Formatear teléfono español si no tiene prefijo
    let phone = formData.phone.replace(/\s/g, '');
    if (!phone.startsWith('+')) {
      phone = '+34' + phone.replace(/^0+/, '');
    }

    setSubmitting(true);
    try {
      // Usar endpoint que vincula con teléfono para SMS
      const response = await fetch(`${API}/family/link-member-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: phone,
          relationship: formData.relationship,
          is_emergency: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`${formData.name} añadido. Recibirá SMS en caso de emergencia.`);
        setShowAddDialog(false);
        resetForm();
        loadDashboard();
      } else {
        toast.error(result.message || 'Error al añadir miembro');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/family/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Miembro actualizado');
        setEditingMember(null);
        resetForm();
        loadDashboard();
      } else {
        toast.error('Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('¿Eliminar este miembro de la protección familiar?')) return;

    try {
      const response = await fetch(`${API}/family/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Miembro eliminado');
        loadDashboard();
      } else {
        toast.error('Error al eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleMarkAlertRead = async (alertId) => {
    try {
      await fetch(`${API}/family/alerts/${alertId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      loadDashboard();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: 'hijo',
      is_senior: false,
      simplified_mode: false,
      alert_level: 'all'
    });
  };

  const openEditDialog = (member) => {
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      relationship: member.relationship,
      is_senior: member.is_senior,
      simplified_mode: member.simplified_mode,
      alert_level: member.alert_level
    });
    setEditingMember(member);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const relationships = [
    { value: 'hijo', label: 'Hijo/a' },
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'abuelo', label: 'Abuelo' },
    { value: 'abuela', label: 'Abuela' },
    { value: 'pareja', label: 'Pareja' },
    { value: 'hermano', label: 'Hermano/a' },
    { value: 'otro', label: 'Otro familiar' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur sticky top-0 z-50 px-6 py-4 border-b border-emerald-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-emerald-600" />
              <div>
                <span className="text-xl font-bold">Panel Familiar</span>
                <p className="text-sm text-zinc-500">Protege a toda tu familia</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Añadir Miembro
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Upgrade Banner */}
        {!data?.has_family_plan && (
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white mb-8 border-0">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Activa el Plan Familiar</h3>
                  <p className="text-emerald-100">Protege hasta 5 miembros de tu familia con todas las funcionalidades premium.</p>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-white text-emerald-600 hover:bg-emerald-50"
                >
                  Ver Planes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-bold">{data?.stats?.total_members || 0}</div>
              <div className="text-sm text-zinc-500">Miembros</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <div className="text-3xl font-bold">{data?.stats?.senior_members || 0}</div>
              <div className="text-sm text-zinc-500">Mayores Protegidos</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-3xl font-bold">{data?.stats?.total_threats_blocked || 0}</div>
              <div className="text-sm text-zinc-500">Amenazas Bloqueadas</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Bell className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-3xl font-bold">{data?.stats?.unread_alerts || 0}</div>
              <div className="text-sm text-zinc-500">Alertas Pendientes</div>
            </CardContent>
          </Card>
        </div>

        {/* Child Tracking Card - Premium Feature */}
        <Card 
          className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all"
          onClick={() => navigate('/child-tracking')}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-indigo-800">👶 Localizar Niños</h3>
                    <Badge className="bg-indigo-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Plan Anual
                    </Badge>
                  </div>
                  <p className="text-indigo-600">Localiza a tus hijos bajo demanda • Historial de ubicaciones • Modo silencioso</p>
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Acceder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Push Notification Settings */}
        <div className="mb-8">
          <PushNotificationSettings />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Miembros Familiares</CardTitle>
                <CardDescription>Gestiona quién está protegido por ManoProtect</CardDescription>
              </CardHeader>
              <CardContent>
                {(data?.members || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">No hay miembros familiares añadidos</p>
                    <Button onClick={() => setShowAddDialog(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Primer Miembro
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(data?.members || []).map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg border-2 border-zinc-100 hover:border-emerald-200 transition-colors cursor-pointer"
                        onClick={() => openEditDialog(member)}
                        data-testid={`member-card-${member.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            member.is_senior ? 'bg-rose-100' : 'bg-emerald-100'
                          }`}>
                            <span className="text-xl">
                              {member.is_senior ? '👴' : member.relationship === 'hijo' ? '👦' : '👤'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{member.name}</span>
                              {member.is_senior && (
                                <Badge className="bg-rose-100 text-rose-700 text-xs">Mayor</Badge>
                              )}
                              {member.simplified_mode && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Modo Simple</Badge>
                              )}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {relationships.find(r => r.value === member.relationship)?.label || member.relationship}
                              {member.phone && ` • ${member.phone}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            {member.threats_count || 0} bloqueadas
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); openEditDialog(member); }}
                            data-testid={`edit-member-${member.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }}
                            data-testid={`delete-member-${member.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Alertas Familiares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data?.alerts || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-zinc-500">Sin alertas pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data?.alerts || []).slice(0, 10).map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.is_read ? 'bg-zinc-50 border-zinc-200' : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className={`w-4 h-4 ${
                                alert.severity === 'critical' ? 'text-red-500' :
                                alert.severity === 'high' ? 'text-orange-500' :
                                'text-amber-500'
                              }`} />
                              <span className="font-medium text-sm">{alert.member_name}</span>
                            </div>
                            <p className="text-sm text-zinc-600">{alert.message}</p>
                            <p className="text-xs text-zinc-400 mt-1">
                              {new Date(alert.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAlertRead(alert.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showAddDialog || !!editingMember} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingMember(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Editar Miembro' : '📱 Añadir Familiar para Alertas SOS'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Actualiza la información del miembro' : 'Este familiar recibirá SMS y notificaciones cuando actives una alerta de emergencia'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Aviso importante */}
            {!editingMember && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Importante:</strong> El teléfono es obligatorio para que tu familiar reciba SMS de emergencia cuando pulses el botón SOS.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre completo"
              />
            </div>

            {/* Teléfono PRIMERO y destacado */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Teléfono * <span className="text-xs text-emerald-600 font-normal">(recibirá SMS de emergencia)</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+34 600 123 456"
                className="border-emerald-300 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Parentesco</label>
              <Select 
                value={formData.relationship} 
                onValueChange={(v) => setFormData({...formData, relationship: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Email (opcional)</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@ejemplo.com"
              />
              <p className="text-xs text-zinc-500 mt-1">Si tiene cuenta en ManoProtect, también recibirá notificaciones push</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Es persona mayor</label>
                  <p className="text-xs text-zinc-500">Activará protección especial</p>
                </div>
                <Switch
                  checked={formData.is_senior}
                  onCheckedChange={(v) => setFormData({...formData, is_senior: v, simplified_mode: v})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Modo simplificado</label>
                  <p className="text-xs text-zinc-500">Interfaz con botones grandes</p>
                </div>
                <Switch
                  checked={formData.simplified_mode}
                  onCheckedChange={(v) => setFormData({...formData, simplified_mode: v})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingMember(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={editingMember ? handleUpdateMember : handleAddMember}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                editingMember ? 'Guardar Cambios' : '📱 Añadir y Activar SMS'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyAdmin;
