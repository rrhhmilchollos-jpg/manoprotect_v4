/**
 * SOSAlertCard - Real-time SOS alert card component
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, UserPlus, PhoneCall } from 'lucide-react';

const SOSAlertCard = ({ sos, onRespond, theme = {} }) => {
  const priorityColors = {
    critical: 'bg-red-600 animate-pulse',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const primaryBtnClass = theme.primary || 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div className={`bg-slate-800/80 rounded-xl p-4 border-l-4 ${sos.priority === 'critical' ? 'border-red-500' : 'border-orange-500'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[sos.priority]}>
            {sos.priority.toUpperCase()}
          </Badge>
          <span className="text-slate-400 text-sm">
            {new Date(sos.created_at).toLocaleTimeString('es-ES')}
          </span>
        </div>
        <Badge variant="outline" className="text-slate-300 border-slate-600">
          {sos.status === 'pending' ? 'Pendiente' : 'En proceso'}
        </Badge>
      </div>
      
      <h4 className="text-white font-semibold mb-1">{sos.client_name}</h4>
      <p className="text-slate-400 text-sm mb-2">{sos.client_phone}</p>
      
      {sos.location && (
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          {sos.location.address || `${sos.location.lat}, ${sos.location.lng}`}
        </div>
      )}
      
      {sos.message && (
        <p className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-2 mb-3">
          "{sos.message}"
        </p>
      )}
      
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onRespond(sos.sos_id, 'assign')}
          className={`${primaryBtnClass} flex-1`}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Asignarme
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRespond(sos.sos_id, 'call_emergency', '112')}
          className="border-red-500 text-red-400 hover:bg-red-500/20"
        >
          <PhoneCall className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SOSAlertCard;
