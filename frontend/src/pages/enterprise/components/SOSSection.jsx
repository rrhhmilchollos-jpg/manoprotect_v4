/**
 * SOSSection - Emergency SOS management component for Enterprise Portal
 */
import { useState, useEffect } from 'react';
import { 
  AlertTriangle, RefreshCw, CheckCircle, MapPin, Clock, PhoneCall 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SOSSection = ({ employee, hasPermission, onRespond, theme = {} }) => {
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const primaryBtn = theme.primary || 'bg-indigo-600 hover:bg-indigo-700';

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchSOS = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/sos?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSosEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const statusColors = {
    pending: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
    escalated: 'bg-purple-500/20 text-purple-400',
    false_alarm: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Centro de Emergencias SOS
          </h1>
          <p className="text-slate-400">Gestión en tiempo real de alertas de emergencia</p>
        </div>
        <Button variant="outline" onClick={fetchSOS} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="in_progress">En proceso</option>
          <option value="resolved">Resueltos</option>
          <option value="escalated">Escalados</option>
        </select>
      </div>

      {/* SOS Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 mx-auto text-slate-500 animate-spin" />
        </div>
      ) : sosEvents.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <h3 className="text-xl font-bold text-white mb-2">Sin emergencias activas</h3>
          <p className="text-slate-400">Todas las alertas han sido atendidas</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sosEvents.map((sos) => (
            <Card key={sos.sos_id} className={`bg-slate-800/50 border-slate-700 ${sos.status === 'pending' ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={priorityColors[sos.priority]}>
                    {sos.priority?.toUpperCase()}
                  </Badge>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[sos.status]}`}>
                    {sos.status}
                  </span>
                </div>
                
                <h4 className="text-white font-semibold mb-1">{sos.client_name || 'Cliente'}</h4>
                <p className="text-slate-400 text-sm mb-2">{sos.client_phone || 'Sin teléfono'}</p>
                
                {sos.location?.address && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    {sos.location.address}
                  </div>
                )}
                
                <div className="text-slate-500 text-xs mb-3">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(sos.created_at).toLocaleString('es-ES')}
                </div>
                
                {hasPermission('respond_sos') && sos.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onRespond(sos.sos_id, 'assign')}
                      className={`${primaryBtn} flex-1`}
                    >
                      Asignarme
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRespond(sos.sos_id, 'call_emergency', '112')}
                      className="border-red-500 text-red-400"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SOSSection;
