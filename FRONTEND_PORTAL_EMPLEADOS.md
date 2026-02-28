# 📋 FRONTEND - Portal de Empleados ManoProtect
# Código para implementar en admin.manoprotect.com

## ============================================
## 1. COMPONENTE: AbsencesPage.jsx
## ============================================
## Ruta: /src/pages/AbsencesPage.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AbsencesPage = () => {
  const [absences, setAbsences] = useState([]);
  const [balance, setBalance] = useState({ total: 22, used: 0, pending: 0, available: 22 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [formData, setFormData] = useState({
    type: 'vacation',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const getToken = () => localStorage.getItem('enterprise_session');

  const fetchAbsences = async () => {
    try {
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`${API_URL}/api/enterprise/absences${query}`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setAbsences(data.absences || []);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/absences/my-balance`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchAbsences(), fetchBalance()]).finally(() => setLoading(false));
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/enterprise/absences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getToken()
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Solicitud creada (${data.working_days} días laborables)`);
        setShowForm(false);
        setFormData({ type: 'vacation', start_date: '', end_date: '', reason: '' });
        fetchAbsences();
        fetchBalance();
      } else {
        toast.error(data.detail || 'Error al crear solicitud');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/absences/${requestId}/approve`, {
        method: 'PATCH',
        headers: { 'X-Session-Token': getToken() }
      });
      if (res.ok) {
        toast.success('Solicitud aprobada');
        fetchAbsences();
      }
    } catch (error) {
      toast.error('Error al aprobar');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      const res = await fetch(`${API_URL}/api/enterprise/absences/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getToken()
        },
        body: JSON.stringify({ rejection_reason: reason })
      });
      if (res.ok) {
        toast.success('Solicitud rechazada');
        fetchAbsences();
      }
    } catch (error) {
      toast.error('Error al rechazar');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getTypeBadge = (type) => {
    const labels = {
      vacation: 'Vacaciones',
      personal: 'Personal',
      sick_leave: 'Baja médica',
      other: 'Otro'
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Ausencias</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{balance.total}</p>
            <p className="text-sm text-gray-500">Días totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{balance.available}</p>
            <p className="text-sm text-gray-500">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{balance.pending}</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{balance.used}</p>
            <p className="text-sm text-gray-500">Usados</p>
          </CardContent>
        </Card>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Solicitud de Ausencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="vacation">Vacaciones</option>
                    <option value="personal">Asuntos personales</option>
                    <option value="sick_leave">Baja médica</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Comentarios..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Enviar Solicitud</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          Todas
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
          Pendientes
        </Button>
        <Button variant={filter === 'approved' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('approved')}>
          Aprobadas
        </Button>
        <Button variant={filter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('rejected')}>
          Rechazadas
        </Button>
      </div>

      {/* Absences List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Empleado</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Fechas</th>
                <th className="p-4 text-left">Días</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((absence) => (
                <tr key={absence.request_id} className="border-t">
                  <td className="p-4">{absence.employee_name}</td>
                  <td className="p-4">{getTypeBadge(absence.type)}</td>
                  <td className="p-4">
                    {absence.start_date} → {absence.end_date}
                  </td>
                  <td className="p-4">{absence.working_days}</td>
                  <td className="p-4">{getStatusBadge(absence.status)}</td>
                  <td className="p-4">
                    {absence.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(absence.request_id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(absence.request_id)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {absences.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No hay solicitudes de ausencia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsencesPage;
```

## ============================================
## 2. COMPONENTE: PayslipsPage.jsx
## ============================================
## Ruta: /src/pages/PayslipsPage.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PayslipsPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [uploadData, setUploadData] = useState({
    employee_id: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    gross_salary: '',
    net_salary: '',
    deductions: '',
    file: null
  });

  const getToken = () => localStorage.getItem('enterprise_session');

  const fetchPayslips = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/payslips?year=${selectedYear}`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setPayslips(data.payslips || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/employees`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, [selectedYear]);

  const handleDownload = async (payslipId, fileName) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/payslips/${payslipId}/download`, {
        headers: { 'X-Session-Token': getToken() }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'nomina.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error('Error al descargar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('employee_id', uploadData.employee_id);
    formData.append('year', uploadData.year);
    formData.append('month', uploadData.month);
    if (uploadData.gross_salary) formData.append('gross_salary', uploadData.gross_salary);
    if (uploadData.net_salary) formData.append('net_salary', uploadData.net_salary);
    if (uploadData.deductions) formData.append('deductions', uploadData.deductions);
    formData.append('file', uploadData.file);

    try {
      const res = await fetch(`${API_URL}/api/enterprise/payslips`, {
        method: 'POST',
        headers: { 'X-Session-Token': getToken() },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Nómina subida correctamente');
        setShowUpload(false);
        setUploadData({
          employee_id: '',
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          gross_salary: '',
          net_salary: '',
          deductions: '',
          file: null
        });
        fetchPayslips();
      } else {
        toast.error(data.detail || 'Error al subir nómina');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Nóminas</h1>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="w-4 h-4 mr-2" />
            Subir Nómina
          </Button>
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Subir Nueva Nómina</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Empleado</label>
                  <select
                    value={uploadData.employee_id}
                    onChange={(e) => setUploadData({...uploadData, employee_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Año</label>
                  <input
                    type="number"
                    value={uploadData.year}
                    onChange={(e) => setUploadData({...uploadData, year: Number(e.target.value)})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mes</label>
                  <select
                    value={uploadData.month}
                    onChange={(e) => setUploadData({...uploadData, month: Number(e.target.value)})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {monthNames.slice(1).map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salario Bruto (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadData.gross_salary}
                    onChange={(e) => setUploadData({...uploadData, gross_salary: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salario Neto (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadData.net_salary}
                    onChange={(e) => setUploadData({...uploadData, net_salary: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deducciones (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={uploadData.deductions}
                    onChange={(e) => setUploadData({...uploadData, deductions: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Archivo PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Subir Nómina</Button>
                <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payslips List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Empleado</th>
                <th className="p-4 text-left">Periodo</th>
                <th className="p-4 text-left">Bruto</th>
                <th className="p-4 text-left">Neto</th>
                <th className="p-4 text-left">Subido</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip) => (
                <tr key={payslip.payslip_id} className="border-t">
                  <td className="p-4">{payslip.employee_name}</td>
                  <td className="p-4">{monthNames[payslip.month]} {payslip.year}</td>
                  <td className="p-4">{payslip.gross_salary ? `${payslip.gross_salary}€` : '-'}</td>
                  <td className="p-4">{payslip.net_salary ? `${payslip.net_salary}€` : '-'}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(payslip.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(payslip.payslip_id, payslip.file_name)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </td>
                </tr>
              ))}
              {payslips.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No hay nóminas para {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipsPage;
```

## ============================================
## 3. COMPONENTE: DocumentsPage.jsx  
## ============================================
## Ruta: /src/pages/DocumentsPage.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [uploadData, setUploadData] = useState({
    employee_id: '',
    type: 'contract',
    title: '',
    description: '',
    is_visible_to_employee: true,
    file: null
  });

  const getToken = () => localStorage.getItem('enterprise_session');

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/documents`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/employees`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const handleDownload = async (documentId, fileName) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/documents/${documentId}/download`, {
        headers: { 'X-Session-Token': getToken() }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'documento';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error('Error al descargar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('employee_id', uploadData.employee_id);
    formData.append('type', uploadData.type);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('is_visible_to_employee', uploadData.is_visible_to_employee);
    formData.append('file', uploadData.file);

    try {
      const res = await fetch(`${API_URL}/api/enterprise/documents`, {
        method: 'POST',
        headers: { 'X-Session-Token': getToken() },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Documento subido correctamente');
        setShowUpload(false);
        setUploadData({
          employee_id: '',
          type: 'contract',
          title: '',
          description: '',
          is_visible_to_employee: true,
          file: null
        });
        fetchDocuments();
      } else {
        toast.error(data.detail || 'Error al subir documento');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('¿Eliminar este documento?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/enterprise/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 'X-Session-Token': getToken() }
      });
      
      if (res.ok) {
        toast.success('Documento eliminado');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const getTypeBadge = (type) => {
    const labels = {
      contract: 'Contrato',
      certificate: 'Certificado',
      id_copy: 'DNI/ID',
      other: 'Otro'
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documentos de Empleados</h1>
        <Button onClick={() => setShowUpload(!showUpload)}>
          <Upload className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Subir Nuevo Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Empleado</label>
                  <select
                    value={uploadData.employee_id}
                    onChange={(e) => setUploadData({...uploadData, employee_id: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="contract">Contrato</option>
                    <option value="certificate">Certificado</option>
                    <option value="id_copy">Copia DNI/ID</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Ej: Contrato Indefinido 2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={uploadData.is_visible_to_employee}
                  onChange={(e) => setUploadData({...uploadData, is_visible_to_employee: e.target.checked})}
                />
                <label htmlFor="visible" className="text-sm">Visible para el empleado</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Archivo</label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Subir Documento</Button>
                <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Empleado</th>
                <th className="p-4 text-left">Título</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Tamaño</th>
                <th className="p-4 text-left">Visible</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.document_id} className="border-t">
                  <td className="p-4">{doc.employee_id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
                    </div>
                  </td>
                  <td className="p-4">{getTypeBadge(doc.type)}</td>
                  <td className="p-4 text-sm text-gray-500">{formatFileSize(doc.file_size)}</td>
                  <td className="p-4">
                    {doc.is_visible_to_employee ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(doc.document_id, doc.file_name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(doc.document_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No hay documentos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
```

## ============================================
## 4. COMPONENTE: NotificationsBell.jsx
## ============================================
## Ruta: /src/components/NotificationsBell.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const NotificationsBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getToken = () => localStorage.getItem('enterprise_session');

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/notifications?limit=10`, {
        headers: { 'X-Session-Token': getToken() }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/enterprise/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'X-Session-Token': getToken() }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/enterprise/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'X-Session-Token': getToken() }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      absence_request: '📅',
      absence_approved: '✅',
      absence_rejected: '❌',
      new_payslip: '💰',
      document_uploaded: '📄',
      system: '🔔'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500 text-sm">
                No hay notificaciones
              </p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.notification_id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                  onClick={() => !notif.is_read && markAsRead(notif.notification_id)}
                >
                  <div className="flex gap-2">
                    <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold' : ''}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
```

## ============================================
## 5. ACTUALIZAR App.js CON RUTAS
## ============================================

```jsx
// Añadir estos imports
import AbsencesPage from './pages/AbsencesPage';
import PayslipsPage from './pages/PayslipsPage';
import DocumentsPage from './pages/DocumentsPage';

// Añadir estas rutas dentro del Router
<Route path="/enterprise/absences" element={<AbsencesPage />} />
<Route path="/enterprise/payslips" element={<PayslipsPage />} />
<Route path="/enterprise/documents" element={<DocumentsPage />} />
```

## ============================================
## 6. ACTUALIZAR SIDEBAR CON NUEVOS ENLACES
## ============================================

```jsx
// Añadir estos items al menú del sidebar
const menuItems = [
  // ... items existentes ...
  { icon: Calendar, label: 'Ausencias', path: '/enterprise/absences' },
  { icon: FileText, label: 'Nóminas', path: '/enterprise/payslips' },
  { icon: FolderOpen, label: 'Documentos', path: '/enterprise/documents' },
];
```

## ============================================
## 7. AÑADIR NotificationsBell AL HEADER
## ============================================

```jsx
// En el componente Header/Navbar, añadir:
import NotificationsBell from './NotificationsBell';

// Y dentro del JSX del header:
<NotificationsBell />
```

---

## NOTAS DE IMPLEMENTACIÓN:

1. **Asegúrate de que `REACT_APP_BACKEND_URL`** apunte al backend correcto (https://protect-cro-v1.preview.emergentagent.com)

2. **Autenticación**: Los componentes usan `localStorage.getItem('enterprise_session')` para obtener el token. Asegúrate de que tu login guarde el token ahí.

3. **Dependencias UI**: Los componentes usan shadcn/ui (Button, Card, Badge). Si no los tienes, instálalos o adapta el código.

4. **Toast notifications**: Se usa `sonner`. Instálalo con `yarn add sonner` si no lo tienes.

---

Documento generado para admin.manoprotect.com
