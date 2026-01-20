import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  CreditCard,
  Landmark,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Plus,
  Search,
  UserPlus,
  Briefcase,
  DollarSign,
  Shield,
  Eye,
  Ban,
  RefreshCw,
  ChevronRight,
  BadgeCheck,
  XCircle,
  Wallet,
  LogOut,
  PiggyBank,
  Home,
  Car,
  GraduationCap,
  Zap
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManoBankAdmin = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [cards, setCards] = useState([]);
  
  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [showLoanDecision, setShowLoanDecision] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(null);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    email: '', name: '', role: 'cajero', phone: '', salary: ''
  });
  
  const [newAccountRequest, setNewAccountRequest] = useState({
    customer_name: '', customer_email: '', customer_phone: '', customer_dni: '',
    account_type: 'corriente', initial_deposit: '', occupation: '', monthly_income: ''
  });
  
  const [newLoanRequest, setNewLoanRequest] = useState({
    customer_id: '', loan_type: 'personal', amount: '', term_months: '12',
    purpose: '', monthly_income: '', employment_status: 'empleado',
    guarantor_name: '', collateral_description: ''
  });
  
  const [newCardRequest, setNewCardRequest] = useState({
    customer_id: '', account_id: '', card_type: 'debito', credit_limit: ''
  });
  
  const [loanDecision, setLoanDecision] = useState({
    decision: 'approved', interest_rate: '', notes: ''
  });
  
  const [searchCustomer, setSearchCustomer] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/dashboard`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tienes acceso al panel de administración');
          navigate('/manobank');
          return;
        }
        throw new Error('Error loading dashboard');
      }
      
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el panel');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/employees`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      toast.error('Error al cargar empleados');
    }
  };

  const fetchAccountRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/account-requests`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setAccountRequests(data.requests || []);
    } catch (error) {
      toast.error('Error al cargar solicitudes');
    }
  };

  const fetchCustomers = async () => {
    try {
      const url = searchCustomer 
        ? `${API_URL}/api/manobank/admin/customers?search=${searchCustomer}`
        : `${API_URL}/api/manobank/admin/customers`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      toast.error('Error al cargar clientes');
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/loans`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      toast.error('Error al cargar préstamos');
    }
  };

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/cards`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      toast.error('Error al cargar tarjetas');
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') fetchEmployees();
    if (activeTab === 'accounts') fetchAccountRequests();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'loans') fetchLoans();
    if (activeTab === 'cards') fetchCards();
  }, [activeTab]);

  // API Handlers
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/employees`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...newEmployee,
          salary: parseFloat(newEmployee.salary) || null
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Empleado añadido correctamente');
      setShowAddEmployee(false);
      setNewEmployee({ email: '', name: '', role: 'cajero', phone: '', salary: '' });
      fetchEmployees();
    } catch (error) {
      toast.error(error.message || 'Error al añadir empleado');
    }
  };

  const handleCreateAccountRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/account-requests`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...newAccountRequest,
          initial_deposit: parseFloat(newAccountRequest.initial_deposit) || 0,
          monthly_income: parseFloat(newAccountRequest.monthly_income) || null
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Solicitud de cuenta creada');
      setShowNewAccount(false);
      setNewAccountRequest({
        customer_name: '', customer_email: '', customer_phone: '', customer_dni: '',
        account_type: 'corriente', initial_deposit: '', occupation: '', monthly_income: ''
      });
      fetchAccountRequests();
    } catch (error) {
      toast.error(error.message || 'Error al crear solicitud');
    }
  };

  const handleApproveAccount = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/account-requests/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success(`Cuenta aprobada. IBAN: ${data.iban}`);
      fetchAccountRequests();
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al aprobar cuenta');
    }
  };

  const handleRejectAccount = async (requestId) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/account-requests/${requestId}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Error al rechazar');
      
      toast.success('Solicitud rechazada');
      fetchAccountRequests();
    } catch (error) {
      toast.error('Error al rechazar solicitud');
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/loans`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...newLoanRequest,
          amount: parseFloat(newLoanRequest.amount),
          term_months: parseInt(newLoanRequest.term_months),
          monthly_income: parseFloat(newLoanRequest.monthly_income)
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Solicitud de préstamo creada');
      setShowNewLoan(false);
      fetchLoans();
    } catch (error) {
      toast.error(error.message || 'Error al crear préstamo');
    }
  };

  const handleLoanDecision = async (loanId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/loans/${loanId}/decide`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          decision: loanDecision.decision,
          interest_rate: loanDecision.interest_rate ? parseFloat(loanDecision.interest_rate) : null,
          notes: loanDecision.notes
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success(data.message);
      setShowLoanDecision(null);
      fetchLoans();
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al procesar decisión');
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/loans/${loanId}/disburse`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success(data.message);
      fetchLoans();
    } catch (error) {
      toast.error(error.message || 'Error al desembolsar');
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/cards`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...newCardRequest,
          credit_limit: newCardRequest.credit_limit ? parseFloat(newCardRequest.credit_limit) : null
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Tarjeta emitida correctamente');
      setShowNewCard(false);
      fetchCards();
    } catch (error) {
      toast.error(error.message || 'Error al emitir tarjeta');
    }
  };

  const handleBlockCard = async (cardId) => {
    const reason = prompt('Motivo del bloqueo:');
    if (!reason) return;
    
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/cards/${cardId}/block?reason=${encodeURIComponent(reason)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Error');
      toast.success('Tarjeta bloqueada');
      fetchCards();
    } catch (error) {
      toast.error('Error al bloquear tarjeta');
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      director: 'Director General',
      gerente: 'Gerente',
      subdirector: 'Subdirector',
      analista_riesgos: 'Analista de Riesgos',
      gestor_comercial: 'Gestor Comercial',
      cajero: 'Cajero',
      atencion_cliente: 'Atención al Cliente'
    };
    return labels[role] || role;
  };

  const getLoanTypeIcon = (type) => {
    const icons = {
      personal: Wallet,
      hipotecario: Home,
      vehiculo: Car,
      empresarial: Briefcase,
      estudios: GraduationCap,
      rapido: Zap
    };
    return icons[type] || DollarSign;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/manobank')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ManoBank Admin</h1>
                <p className="text-sm text-zinc-400">Panel de Administración Bancaria</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{dashboard?.employee?.name}</p>
              <p className="text-sm text-zinc-400">{getRoleLabel(dashboard?.employee?.role)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'accounts', label: 'Aperturas', icon: FileText },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'loans', label: 'Préstamos', icon: PiggyBank },
            { id: 'cards', label: 'Tarjetas', icon: CreditCard },
            { id: 'employees', label: 'Empleados', icon: Briefcase }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'bg-indigo-600' : 'bg-white'}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-zinc-500">Clientes</span>
                </div>
                <p className="text-3xl font-bold">{dashboard.stats.total_customers}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-zinc-500">Cuentas</span>
                </div>
                <p className="text-3xl font-bold">{dashboard.stats.total_accounts}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-zinc-500">Depósitos</span>
                </div>
                <p className="text-3xl font-bold">{(dashboard.stats.total_deposits / 1000).toFixed(0)}K€</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <PiggyBank className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-zinc-500">Préstamos</span>
                </div>
                <p className="text-3xl font-bold">{(dashboard.stats.loans_volume / 1000).toFixed(0)}K€</p>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-amber-900">Cuentas Pendientes</h3>
                  <span className="bg-amber-500 text-white text-sm px-3 py-1 rounded-full">
                    {dashboard.pending.account_requests}
                  </span>
                </div>
                <Button onClick={() => setActiveTab('accounts')} variant="outline" className="w-full border-amber-300">
                  Ver Solicitudes
                </Button>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-indigo-900">Préstamos por Aprobar</h3>
                  <span className="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full">
                    {dashboard.pending.loan_applications}
                  </span>
                </div>
                <Button onClick={() => setActiveTab('loans')} variant="outline" className="w-full border-indigo-300">
                  Ver Préstamos
                </Button>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-red-900">Alertas de Fraude</h3>
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    {dashboard.pending.fraud_alerts}
                  </span>
                </div>
                <Button variant="outline" className="w-full border-red-300">
                  Ver Alertas
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Resumen de Préstamos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Total préstamos</span>
                    <span className="font-semibold">{dashboard.loans.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Pendientes</span>
                    <span className="font-semibold text-amber-600">{dashboard.loans.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Activos</span>
                    <span className="font-semibold text-emerald-600">{dashboard.loans.active}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Actividad de Hoy</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Transacciones</span>
                    <span className="font-semibold">{dashboard.today.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Empleados activos</span>
                    <span className="font-semibold">{dashboard.stats.total_employees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Tarjetas emitidas</span>
                    <span className="font-semibold">{dashboard.stats.total_cards}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Requests Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Solicitudes de Apertura de Cuenta</h2>
              <Button onClick={() => setShowNewAccount(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {accountRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      req.status === 'pending' ? 'bg-amber-100' :
                      req.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {req.status === 'pending' ? <Clock className="w-5 h-5 text-amber-600" /> :
                       req.status === 'approved' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                       <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{req.customer_name}</p>
                      <p className="text-sm text-zinc-500">DNI: {req.customer_dni} | {req.account_type}</p>
                      <p className="text-xs text-zinc-400">{req.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {req.initial_deposit > 0 && (
                      <span className="text-sm text-zinc-600">
                        Depósito: {req.initial_deposit}€
                      </span>
                    )}
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveAccount(req.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectAccount(req.id)} className="text-red-600 border-red-300">
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                    {req.status === 'approved' && req.iban && (
                      <span className="text-sm font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                        {req.iban}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {accountRequests.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  No hay solicitudes pendientes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Clientes</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
                    className="pl-10 pr-4 py-2 border border-zinc-300 rounded-lg"
                  />
                </div>
                <Button onClick={fetchCustomers} variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {customers.map((customer) => (
                <div key={customer.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-zinc-500">DNI: {customer.dni}</p>
                      <p className="text-xs text-zinc-400">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      customer.risk_level === 'bajo' ? 'bg-emerald-100 text-emerald-700' :
                      customer.risk_level === 'medio' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Riesgo {customer.risk_level}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setShowCustomerDetail(customer)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  No hay clientes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Préstamos</h2>
              <Button onClick={() => setShowNewLoan(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {loans.map((loan) => {
                const LoanIcon = getLoanTypeIcon(loan.loan_type);
                return (
                  <div key={loan.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          loan.status === 'pending' ? 'bg-amber-100' :
                          loan.status === 'approved' ? 'bg-blue-100' :
                          loan.status === 'active' ? 'bg-emerald-100' :
                          loan.status === 'rejected' ? 'bg-red-100' : 'bg-zinc-100'
                        }`}>
                          <LoanIcon className={`w-6 h-6 ${
                            loan.status === 'pending' ? 'text-amber-600' :
                            loan.status === 'approved' ? 'text-blue-600' :
                            loan.status === 'active' ? 'text-emerald-600' :
                            loan.status === 'rejected' ? 'text-red-600' : 'text-zinc-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{loan.customer_name}</p>
                          <p className="text-sm text-zinc-500">
                            {loan.loan_type.charAt(0).toUpperCase() + loan.loan_type.slice(1)} - {loan.term_months} meses
                          </p>
                          <p className="text-xs text-zinc-400">{loan.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{loan.amount.toLocaleString('es-ES')}€</p>
                        {loan.interest_rate && (
                          <p className="text-sm text-zinc-500">{loan.interest_rate}% TAE</p>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          loan.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-zinc-100 text-zinc-700'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                    
                    {(loan.status === 'pending' || loan.status === 'in_review') && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-zinc-500">Riesgo: </span>
                          <span className={`font-medium ${
                            loan.risk_score < 40 ? 'text-emerald-600' :
                            loan.risk_score < 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {loan.risk_score}/100
                          </span>
                          {loan.suggested_rate && (
                            <>
                              <span className="text-zinc-300 mx-2">|</span>
                              <span className="text-zinc-500">Tasa sugerida: </span>
                              <span className="font-medium">{loan.suggested_rate}%</span>
                            </>
                          )}
                        </div>
                        <Button size="sm" onClick={() => setShowLoanDecision(loan)} className="bg-indigo-600">
                          Evaluar Préstamo
                        </Button>
                      </div>
                    )}
                    
                    {loan.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button size="sm" onClick={() => handleDisburseLoan(loan.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Desembolsar {loan.amount.toLocaleString('es-ES')}€
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  No hay préstamos
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Tarjetas Emitidas</h2>
              <Button onClick={() => setShowNewCard(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Emitir Tarjeta
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div key={card.id} className={`bg-gradient-to-br ${
                  card.card_type === 'credito' ? 'from-purple-600 to-indigo-600' :
                  card.card_type === 'platinum' ? 'from-zinc-700 to-zinc-900' :
                  card.card_type === 'black' ? 'from-zinc-900 to-black' :
                  'from-indigo-500 to-purple-500'
                } rounded-2xl p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs text-white/70">{card.card_brand}</p>
                      <p className="font-semibold">{card.card_type.toUpperCase()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      card.status === 'active' ? 'bg-emerald-500/30' : 'bg-red-500/30'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                  
                  <p className="font-mono text-lg mb-6">{card.card_number_masked}</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70">Titular</p>
                      <p className="font-medium text-sm">{card.holder_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Válida</p>
                      <p className="font-medium">{card.expiry}</p>
                    </div>
                  </div>
                  
                  {card.credit_limit > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-white/70">Límite de crédito</p>
                      <p className="font-bold">{card.credit_limit.toLocaleString('es-ES')}€</p>
                    </div>
                  )}
                  
                  {card.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute bottom-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
                      onClick={() => handleBlockCard(card.id)}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {cards.length === 0 && (
                <div className="col-span-full p-8 text-center text-zinc-500 bg-white rounded-xl">
                  No hay tarjetas emitidas
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Empleados del Banco</h2>
              <Button onClick={() => setShowAddEmployee(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Añadir Empleado
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      emp.role === 'director' ? 'bg-purple-100' :
                      emp.role === 'gerente' ? 'bg-indigo-100' :
                      emp.role === 'analista_riesgos' ? 'bg-amber-100' :
                      'bg-zinc-100'
                    }`}>
                      <Briefcase className={`w-6 h-6 ${
                        emp.role === 'director' ? 'text-purple-600' :
                        emp.role === 'gerente' ? 'text-indigo-600' :
                        emp.role === 'analista_riesgos' ? 'text-amber-600' :
                        'text-zinc-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-zinc-500">{getRoleLabel(emp.role)}</p>
                      <p className="text-xs text-zinc-400">{emp.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500">{emp.department}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      emp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {emp.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <div className="p-8 text-center text-zinc-500">
                  No hay empleados registrados
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Añadir Empleado</h3>
              <button onClick={() => setShowAddEmployee(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Rol</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                >
                  <option value="director">Director General</option>
                  <option value="gerente">Gerente</option>
                  <option value="subdirector">Subdirector</option>
                  <option value="analista_riesgos">Analista de Riesgos</option>
                  <option value="gestor_comercial">Gestor Comercial</option>
                  <option value="cajero">Cajero</option>
                  <option value="atencion_cliente">Atención al Cliente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Salario (€/mes)</label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Añadir Empleado
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* New Account Request Modal */}
      {showNewAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nueva Apertura de Cuenta</h3>
              <button onClick={() => setShowNewAccount(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAccountRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={newAccountRequest.customer_name}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_name: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">DNI/NIE</label>
                  <input
                    type="text"
                    value={newAccountRequest.customer_dni}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_dni: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={newAccountRequest.customer_phone}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAccountRequest.customer_email}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_email: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tipo de cuenta</label>
                  <select
                    value={newAccountRequest.account_type}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, account_type: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  >
                    <option value="corriente">Cuenta Corriente</option>
                    <option value="ahorro">Cuenta Ahorro</option>
                    <option value="nomina">Cuenta Nómina</option>
                    <option value="empresa">Cuenta Empresa</option>
                    <option value="joven">Cuenta Joven</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Depósito inicial (€)</label>
                  <input
                    type="number"
                    value={newAccountRequest.initial_deposit}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, initial_deposit: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Ocupación</label>
                  <input
                    type="text"
                    value={newAccountRequest.occupation}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, occupation: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Ingresos mensuales (€)</label>
                  <input
                    type="number"
                    value={newAccountRequest.monthly_income}
                    onChange={(e) => setNewAccountRequest({ ...newAccountRequest, monthly_income: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Crear Solicitud
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Loan Decision Modal */}
      {showLoanDecision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Evaluar Préstamo</h3>
              <button onClick={() => setShowLoanDecision(null)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="bg-zinc-50 rounded-xl p-4 mb-6">
              <p className="font-medium">{showLoanDecision.customer_name}</p>
              <p className="text-2xl font-bold text-indigo-600">{showLoanDecision.amount.toLocaleString('es-ES')}€</p>
              <p className="text-sm text-zinc-500">{showLoanDecision.loan_type} - {showLoanDecision.term_months} meses</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span>Riesgo: <strong className={showLoanDecision.risk_score < 50 ? 'text-emerald-600' : 'text-amber-600'}>{showLoanDecision.risk_score}/100</strong></span>
                <span>Tasa sugerida: <strong>{showLoanDecision.suggested_rate}%</strong></span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Decisión</label>
                <select
                  value={loanDecision.decision}
                  onChange={(e) => setLoanDecision({ ...loanDecision, decision: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                >
                  <option value="approved">Aprobar</option>
                  <option value="rejected">Rechazar</option>
                </select>
              </div>
              
              {loanDecision.decision === 'approved' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Tasa de interés (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanDecision.interest_rate}
                    onChange={(e) => setLoanDecision({ ...loanDecision, interest_rate: e.target.value })}
                    placeholder={showLoanDecision.suggested_rate}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Notas</label>
                <textarea
                  value={loanDecision.notes}
                  onChange={(e) => setLoanDecision({ ...loanDecision, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  rows={3}
                />
              </div>
              
              <Button
                onClick={() => handleLoanDecision(showLoanDecision.id)}
                className={`w-full h-12 ${loanDecision.decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loanDecision.decision === 'approved' ? 'Aprobar Préstamo' : 'Rechazar Préstamo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManoBankAdmin;
