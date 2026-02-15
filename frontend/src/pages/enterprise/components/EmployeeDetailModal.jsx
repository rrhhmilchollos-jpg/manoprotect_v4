/**
 * EmployeeDetailModal Component
 */
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EmployeeDetailModal = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Detalle de Empleado</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{employee.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{employee.name}</h3>
              <p className="text-slate-400">{employee.email}</p>
              <Badge variant="outline" className="mt-1 text-slate-300 border-slate-600 capitalize">
                {employee.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-500 text-sm">Departamento</p>
              <p className="text-white">{employee.department || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Teléfono</p>
              <p className="text-white">{employee.phone || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Estado</p>
              <p className={`font-medium ${employee.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                {employee.status}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Nivel de Riesgo</p>
              <p className="text-white">{employee.risk_level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">2FA Activo</p>
              <p className={employee.two_factor_enabled ? 'text-emerald-400' : 'text-yellow-400'}>
                {employee.two_factor_enabled ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Último Acceso</p>
              <p className="text-white">
                {employee.last_login ? new Date(employee.last_login).toLocaleString('es-ES') : 'Nunca'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetailModal;
