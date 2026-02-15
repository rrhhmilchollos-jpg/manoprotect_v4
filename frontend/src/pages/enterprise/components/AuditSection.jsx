/**
 * AuditSection - Audit logs component for Enterprise Portal
 */
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AuditSection = ({ employee, hasPermission }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/audit-logs`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    login: 'text-emerald-400',
    logout: 'text-slate-400',
    create: 'text-blue-400',
    update: 'text-yellow-400',
    delete: 'text-red-400',
    suspend: 'text-orange-400',
    activate: 'text-emerald-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs de Auditoría</h1>
          <p className="text-slate-400">Registro de todas las acciones del sistema</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha/Hora</th>
                <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Acción</th>
                <th className="text-left p-4 text-slate-400 font-medium">Recurso</th>
                <th className="text-left p-4 text-slate-400 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay logs registrados
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.log_id || idx} className="border-t border-slate-700">
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(log.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="p-4">
                      <p className="text-white">{log.employee_name}</p>
                      <p className="text-slate-500 text-xs">{log.employee_role}</p>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${actionColors[log.action] || 'text-slate-400'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {log.resource_type}: {log.resource_id?.slice(0, 12)}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-mono">{log.ip_address || '-'}</td>
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

export default AuditSection;
