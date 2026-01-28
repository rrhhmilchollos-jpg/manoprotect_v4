import { useState, useEffect } from 'react';
import { 
  Bell, Send, AlertTriangle, Users, History, Plus, Trash2, 
  Loader2, CheckCircle, XCircle, RefreshCw, Mail, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export default function AlertsManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeView, setActiveView] = useState('compose'); // compose, subscribers, history
  
  // New alert form
  const [newAlert, setNewAlert] = useState({
    threat_type: 'Phishing',
    title: '',
    description: '',
    risk_level: 'alto',
    source: 'Equipo de Seguridad ManoProtect',
    affected_entities: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [countRes, historyRes] = await Promise.all([
        fetch(`${API}/alerts/subscriptions/count`),
        fetch(`${API}/alerts/history?limit=50`)
      ]);

      if (countRes.ok) {
        const data = await countRes.json();
        setSubscriberCount(data.count || 0);
      }
      
      if (historyRes.ok) {
        const data = await historyRes.json();
        setAlertHistory(data.alerts || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    
    if (!newAlert.title.trim() || !newAlert.description.trim()) {
      toast.error('Completa título y descripción');
      return;
    }

    setSending(true);
    try {
      const payload = {
        ...newAlert,
        affected_entities: newAlert.affected_entities 
          ? newAlert.affected_entities.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      const response = await fetch(`${API}/alerts/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Alerta enviada a ${data.subscribers_notified} suscriptores`);
        setNewAlert({
          threat_type: 'Phishing',
          title: '',
          description: '',
          risk_level: 'alto',
          source: 'Equipo de Seguridad ManoProtect',
          affected_entities: ''
        });
        loadData();
      } else {
        toast.error(data.detail || 'Error al enviar alerta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  const getRiskBadge = (level) => {
    const colors = {
      'alto': 'bg-red-100 text-red-700 border-red-200',
      'medio': 'bg-amber-100 text-amber-700 border-amber-200',
      'bajo': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[level] || colors['medio'];
  };

  const threatTypes = [
    'Phishing',
    'Smishing',
    'Vishing',
    'Suplantación de identidad',
    'Fraude bancario',
    'Estafa telefónica',
    'Malware',
    'Ransomware',
    'Otros'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Suscriptores Activos</p>
                <p className="text-3xl font-bold mt-1">{subscriberCount}</p>
              </div>
              <Users className="h-10 w-10 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Alertas Enviadas</p>
                <p className="text-3xl font-bold mt-1">{alertHistory.length}</p>
              </div>
              <Mail className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Alertas Críticas</p>
                <p className="text-3xl font-bold mt-1">
                  {alertHistory.filter(a => a.risk_level === 'alto').length}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-b pb-2">
        <Button 
          variant={activeView === 'compose' ? 'default' : 'outline'}
          onClick={() => setActiveView('compose')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Alerta
        </Button>
        <Button 
          variant={activeView === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveView('history')}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Historial ({alertHistory.length})
        </Button>
        <Button 
          variant="ghost"
          onClick={loadData}
          className="ml-auto gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Compose Alert */}
      {activeView === 'compose' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Enviar Nueva Alerta de Seguridad
            </CardTitle>
            <CardDescription>
              Esta alerta se enviará a todos los {subscriberCount} suscriptores activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Tipo de Amenaza
                  </label>
                  <select
                    value={newAlert.threat_type}
                    onChange={(e) => setNewAlert({ ...newAlert, threat_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {threatTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Nivel de Riesgo
                  </label>
                  <select
                    value={newAlert.risk_level}
                    onChange={(e) => setNewAlert({ ...newAlert, risk_level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="alto">🔴 Alto - Urgente</option>
                    <option value="medio">🟡 Medio - Importante</option>
                    <option value="bajo">🟢 Bajo - Informativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Título de la Alerta *
                </label>
                <Input
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="Ej: Nueva campaña de phishing suplantando a Banco Santander"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Describe la amenaza en detalle: qué está pasando, cómo identificarla, qué hacer..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Entidades Afectadas (separadas por coma)
                  </label>
                  <Input
                    value={newAlert.affected_entities}
                    onChange={(e) => setNewAlert({ ...newAlert, affected_entities: e.target.value })}
                    placeholder="Ej: Banco Santander, BBVA, Clientes de banca online"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Fuente
                  </label>
                  <Input
                    value={newAlert.source}
                    onChange={(e) => setNewAlert({ ...newAlert, source: e.target.value })}
                    placeholder="Equipo de Seguridad ManoProtect"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-zinc-50 rounded-lg p-4 border">
                <p className="text-sm text-zinc-600 mb-2">Vista previa del asunto del email:</p>
                <p className="font-medium text-zinc-900">
                  {newAlert.risk_level === 'alto' ? '🔴 URGENTE' : newAlert.risk_level === 'medio' ? '🟡 ALERTA' : '🟢 INFO'}: {newAlert.title || '[Título de la alerta]'} - ManoProtect
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewAlert({
                    threat_type: 'Phishing',
                    title: '',
                    description: '',
                    risk_level: 'alto',
                    source: 'Equipo de Seguridad ManoProtect',
                    affected_entities: ''
                  })}
                >
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={sending || subscriberCount === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar a {subscriberCount} suscriptores
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Alert History */}
      {activeView === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              Historial de Alertas Enviadas
            </CardTitle>
            <CardDescription>
              Últimas {alertHistory.length} alertas enviadas a suscriptores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertHistory.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">No hay alertas enviadas todavía</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertHistory.map((alert, idx) => (
                  <div 
                    key={alert.id || idx}
                    className="border rounded-lg p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getRiskBadge(alert.risk_level)}>
                            {alert.risk_level === 'alto' ? '🔴 Alto' : alert.risk_level === 'medio' ? '🟡 Medio' : '🟢 Bajo'}
                          </Badge>
                          <Badge variant="outline">
                            {alert.threat_type}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-zinc-900">{alert.title}</h4>
                        <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{alert.description}</p>
                        {alert.affected_entities && alert.affected_entities.length > 0 && (
                          <p className="text-xs text-zinc-500 mt-2">
                            Entidades afectadas: {alert.affected_entities.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-zinc-500">
                          {new Date(alert.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-indigo-600 font-medium mt-1">
                          {alert.subscribers_notified} destinatarios
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
