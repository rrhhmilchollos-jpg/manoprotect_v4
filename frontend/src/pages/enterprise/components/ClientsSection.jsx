/**
 * ClientsSection Component - User Management for Enterprise Portal
 */
import { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ClientDetailModal from './ClientDetailModal';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ClientsSection = ({ employee, hasPermission }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search, planFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (planFilter) params.append('plan', planFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/clients?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/enterprise/clients/${clientId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setClientDetails(data);
      } else {
        toast.error('Error al cargar detalles del usuario');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    fetchClientDetails(client.user_id || client.email);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setClientDetails(null);
  };

  const planColors = {
    free: 'bg-slate-600',
    'family-monthly': 'bg-emerald-600',
    'family-yearly': 'bg-emerald-600',
    premium: 'bg-indigo-600',
    enterprise: 'bg-purple-600'
  };

  const planLabels = {
    free: 'Gratuito',
    'family-monthly': 'Familiar Mensual',
    'family-yearly': 'Familiar Anual',
    premium: 'Premium',
    enterprise: 'Empresarial'
  };

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    cancelled: 'Cancelado',
    trial: 'Prueba'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="clients-title">Gestión de Usuarios</h1>
          <p className="text-slate-400">Visualiza y gestiona los usuarios de ManoProtect</p>
        </div>
        <Button 
          onClick={async () => {
            const params = planFilter ? { plan: planFilter } : {};
            const queryStr = new URLSearchParams(params).toString();
            const url = `${API_URL}/api/export/users/csv${queryStr ? '?' + queryStr : ''}`;
            const response = await fetch(url, { credentials: 'include' });
            if (response.ok) {
              const blob = await response.blob();
              const a = document.createElement('a');
              a.href = window.URL.createObjectURL(blob);
              a.download = 'usuarios_manoprotect.csv';
              a.click();
              toast.success('Exportación completada');
            }
          }}
          variant="outline"
          className="border-slate-600 text-slate-300"
          data-testid="export-users-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, email, teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
            data-testid="clients-search-input"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          data-testid="clients-plan-filter"
        >
          <option value="">Todos los planes</option>
          <option value="free">Gratuito</option>
          <option value="family-monthly">Familiar Mensual</option>
          <option value="family-yearly">Familiar Anual</option>
          <option value="premium">Premium</option>
        </select>
        <Button variant="outline" onClick={fetchClients} className="border-slate-700 text-slate-300" data-testid="clients-refresh-btn">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="clients-table">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Usuario</th>
                <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Dispositivo SOS</th>
                <th className="text-left p-4 text-slate-400 font-medium">Fecha de Registro</th>
                <th className="text-right p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                    <p className="mt-2">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.user_id || client.email} className="border-t border-slate-700 hover:bg-slate-800/50" data-testid={`client-row-${client.user_id}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{client.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name || 'Sin nombre'}</p>
                          <p className="text-slate-500 text-sm">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${planColors[client.plan] || planColors.free} text-white`}>
                        {planLabels[client.plan] || 'Gratuito'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        client.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        client.is_trial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          client.subscription_status === 'active' ? 'bg-emerald-400' :
                          client.is_trial ? 'bg-yellow-400' : 'bg-slate-400'
                        }`}></span>
                        {client.is_trial ? 'Prueba' : statusLabels[client.subscription_status] || 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      {client.sos_button_requested ? (
                        <Badge className="bg-emerald-600">Solicitado</Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewClient(client)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                        data-testid={`view-client-btn-${client.user_id}`}
                        title="Ver detalles del usuario"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalles del Usuario */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          details={clientDetails}
          loading={loadingDetails}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ClientsSection;
