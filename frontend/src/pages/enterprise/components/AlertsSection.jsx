/**
 * AlertsSection - Security alerts monitoring component for Enterprise Portal
 */
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AlertsSection = ({ employee, hasPermission }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/alerts`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertas de Seguridad</h1>
          <p className="text-slate-400">Monitoreo de amenazas detectadas</p>
        </div>
        <Button variant="outline" onClick={fetchAlerts} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Tipo</th>
                <th className="text-left p-4 text-slate-400 font-medium">Severidad</th>
                <th className="text-left p-4 text-slate-400 font-medium">Título</th>
                <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay alertas registradas
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.alert_id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {alert.alert_type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={severityColors[alert.severity]}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="p-4 text-white">{alert.title}</td>
                    <td className="p-4 text-slate-400">{alert.client_name || '-'}</td>
                    <td className="p-4">
                      {alert.blocked ? (
                        <Badge className="bg-emerald-600">Bloqueada</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-600">Pendiente</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(alert.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AlertsSection;
