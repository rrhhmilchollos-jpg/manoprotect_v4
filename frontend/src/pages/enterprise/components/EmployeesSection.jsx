/**
 * EmployeesSection - Employee management component for Enterprise Portal
 */
import { useState, useEffect } from 'react';
import { 
  Search, UserPlus, RefreshCw, Eye, XCircle, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Placeholder modals - these should be extracted to separate files too
const CreateEmployeeModal = ({ onClose, onSuccess }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
      <h2 className="text-xl font-bold text-white mb-4">Crear Nuevo Empleado</h2>
      <p className="text-slate-400 mb-4">Funcionalidad en desarrollo</p>
      <Button onClick={onClose} className="w-full">Cerrar</Button>
    </Card>
  </div>
);

const EmployeeDetailModal = ({ employee, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
      <h2 className="text-xl font-bold text-white mb-4">{employee.name}</h2>
      <div className="space-y-2 text-slate-300">
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Rol:</strong> {employee.role}</p>
        <p><strong>Departamento:</strong> {employee.department || '-'}</p>
        <p><strong>Estado:</strong> {employee.status}</p>
      </div>
      <Button onClick={onClose} className="w-full mt-4">Cerrar</Button>
    </Card>
  </div>
);

const EmployeesSection = ({ employee, hasPermission, theme = {} }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const primaryBtn = theme.primary || 'bg-indigo-600 hover:bg-indigo-700';

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/enterprise/employees?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (employeeId, action) => {
    try {
      const endpoint = action === 'delete' 
        ? `${API_URL}/api/enterprise/employees/${employeeId}`
        : `${API_URL}/api/enterprise/employees/${employeeId}/${action}`;
      
      const res = await fetch(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        credentials: 'include'
      });
      
      if (res.ok) {
        toast.success(`Acción '${action}' ejecutada`);
        fetchEmployees();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const statusColors = {
    active: 'bg-emerald-500',
    suspended: 'bg-red-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-slate-500'
  };

  const riskColors = {
    low: 'text-emerald-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Empleados</h1>
          <p className="text-slate-400">Administra el equipo de ManoProtect</p>
        </div>
        {hasPermission('manage_employees') && (
          <Button onClick={() => setShowCreateModal(true)} className={primaryBtn}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="pending">Pendientes</option>
        </select>
        <Button variant="outline" onClick={fetchEmployees} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Rol</th>
                <th className="text-left p-4 text-slate-400 font-medium">Departamento</th>
                <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left p-4 text-slate-400 font-medium">Riesgo</th>
                <th className="text-left p-4 text-slate-400 font-medium">Último acceso</th>
                <th className="text-right p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron empleados
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.employee_id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.primary?.split(' ')[0] || 'bg-indigo-600'}`}>
                          <span className="text-white font-semibold">{emp.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{emp.name}</p>
                          <p className="text-slate-500 text-sm">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-slate-300 border-slate-600 capitalize">
                        {emp.role?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-300">{emp.department || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[emp.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${riskColors[emp.risk_level] || 'text-slate-400'}`}>
                        {emp.risk_level?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {emp.last_login ? new Date(emp.last_login).toLocaleDateString('es-ES') : 'Nunca'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEmployee(emp)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {hasPermission('manage_employees') && (
                          <>
                            {emp.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(emp.employee_id, 'suspend')}
                                className="text-orange-400 hover:text-orange-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(emp.employee_id, 'activate')}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEmployeeModal onClose={() => setShowCreateModal(false)} onSuccess={fetchEmployees} />
      )}

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
    </div>
  );
};

export default EmployeesSection;
