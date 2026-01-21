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
  Zap,
  Trash2,
  Video,
  ExternalLink,
  Calendar,
  Truck,
  Package,
  MapPin,
  Navigation
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BancoSistema = () => {
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
  const [shipments, setShipments] = useState([]);
  const [showShipCardModal, setShowShipCardModal] = useState(null);
  const [kycVerifications, setKycVerifications] = useState([]);
  const [pendingVideoSessions, setPendingVideoSessions] = useState([]);
  const [activeVideoSession, setActiveVideoSession] = useState(null);
  
  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [showLoanDecision, setShowLoanDecision] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(null);
  const [showScheduleKYC, setShowScheduleKYC] = useState(null);
  const [showCompleteKYC, setShowCompleteKYC] = useState(null);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    email: '', name: '', role: 'cajero', phone: '', salary: ''
  });
  
  const [newAccountRequest, setNewAccountRequest] = useState({
    customer_name: '', customer_email: '', customer_phone: '', customer_dni: '',
    address_street: '', address_city: '', address_postal_code: '', address_province: '',
    address_country: 'España', account_type: 'corriente', initial_deposit: '', 
    occupation: '', monthly_income: '', date_of_birth: '', nationality: 'Española'
  });
  
  const [newLoanRequest, setNewLoanRequest] = useState({
    customer_id: '', loan_type: 'personal', amount: '', term_months: '12',
    purpose: '', monthly_income: '', employment_status: 'empleado',
    guarantor_name: '', collateral_description: ''
  });
  
  const [newCardRequest, setNewCardRequest] = useState({
    customer_id: '', card_type: 'debito', credit_limit: ''
  });
  
  const [loanDecision, setLoanDecision] = useState({
    decision: 'approved', interest_rate: '', notes: ''
  });
  
  const [kycSchedule, setKycSchedule] = useState({
    meeting_link: '', scheduled_time: '', notes: ''
  });
  
  const [kycComplete, setKycComplete] = useState({
    verification_status: 'approved', identity_verified: true,
    document_type: 'DNI', document_number: '', notes: '', rejection_reason: ''
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
          toast.error('No tienes acceso al sistema bancario');
          navigate('/banco');
          return;
        }
        throw new Error('Error loading dashboard');
      }
      
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el sistema');
      navigate('/banco');
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

  const fetchShipments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/card-shipments`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setShipments(data.shipments || []);
    } catch (error) {
      toast.error('Error al cargar envíos');
    }
  };

  const handleCreateShipment = async (cardId, shippingData) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/cards/${cardId}/ship`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(shippingData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear envío');
      }
      
      const data = await response.json();
      toast.success(`Envío creado. Tracking: ${data.tracking_number}`);
      setShowShipCardModal(null);
      fetchShipments();
      fetchCards();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId, newStatus, note = '') => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/card-shipments/${shipmentId}/status?status=${newStatus}&note=${encodeURIComponent(note)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al actualizar estado');
      }
      
      const data = await response.json();
      toast.success(data.message);
      fetchShipments();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchKYCVerifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/kyc-verifications`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setKycVerifications(data.verifications || []);
    } catch (error) {
      toast.error('Error al cargar verificaciones KYC');
    }
  };

  const fetchPendingVideoSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/kyc/agent/pending-sessions`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setPendingVideoSessions(data.pending_sessions || []);
    } catch (error) {
      console.error('Error al cargar sesiones de video:', error);
    }
  };

  const handleJoinVideoSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/kyc/agent/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al unirse a la sesión');
      }
      
      const data = await response.json();
      setActiveVideoSession(data);
      toast.success('Conectando a la videollamada...');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCompleteVideoVerification = async (result) => {
    try {
      const response = await fetch(`${API_URL}/api/kyc/agent/complete-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          session_id: activeVideoSession.session_id,
          ...result
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al completar verificación');
      }
      
      const data = await response.json();
      
      if (data.fraud_alert) {
        toast.error('⚠️ ALERTA: Cliente ya existe en el sistema. Verificación rechazada.');
      } else if (result.verification_status === 'approved') {
        toast.success('✅ Verificación completada. Cliente verificado correctamente.');
      } else {
        toast.warning('Verificación rechazada.');
      }
      
      setActiveVideoSession(null);
      fetchPendingVideoSessions();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEndVideoSession = async () => {
    if (!activeVideoSession) return;
    
    try {
      await fetch(`${API_URL}/api/kyc/agent/end-session/${activeVideoSession.session_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setActiveVideoSession(null);
      fetchPendingVideoSessions();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') fetchEmployees();
    if (activeTab === 'accounts') fetchAccountRequests();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'loans') fetchLoans();
    if (activeTab === 'cards') {
      fetchCards();
      fetchCustomers(); // Need customers to issue new cards
    }
    if (activeTab === 'shipments') {
      fetchShipments();
    }
    if (activeTab === 'kyc') {
      fetchKYCVerifications();
      fetchAccountRequests(); // Need pending requests
      fetchPendingVideoSessions(); // Load pending video sessions
    }
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
      // Open account directly instead of creating a request
      const response = await fetch(`${API_URL}/api/manobank/admin/open-account-direct`, {
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
      
      // Show success and offer to download contract
      toast.success(`¡Cuenta abierta! IBAN: ${data.iban}`);
      
      // Open contract PDF in new tab
      if (data.contract_id) {
        const contractUrl = `${API_URL}/api/manobank/admin/contracts/${data.contract_id}/pdf`;
        window.open(contractUrl, '_blank');
        toast.info('Descargando contrato para firma...');
      }
      
      setShowNewAccount(false);
      setNewAccountRequest({
        customer_name: '', customer_email: '', customer_phone: '', customer_dni: '',
        address_street: '', address_city: '', address_postal_code: '', address_province: '',
        address_country: 'España', account_type: 'corriente', initial_deposit: '', 
        occupation: '', monthly_income: '', date_of_birth: '', nationality: 'Española'
      });
      fetchAccountRequests();
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al abrir cuenta');
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

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado permanentemente? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/employees/${employeeId}/permanent`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Empleado eliminado permanentemente');
      fetchEmployees();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar empleado');
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

  // KYC Handlers
  const handleScheduleKYC = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/kyc-verifications/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          request_id: showScheduleKYC.id,
          ...kycSchedule
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Videollamada programada correctamente');
      setShowScheduleKYC(null);
      setKycSchedule({ meeting_link: '', scheduled_time: '', notes: '' });
      fetchAccountRequests();
      fetchKYCVerifications();
    } catch (error) {
      toast.error(error.message || 'Error al programar verificación');
    }
  };

  const handleCompleteKYC = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/admin/kyc-verifications/${showCompleteKYC.id}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(kycComplete)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      toast.success(kycComplete.verification_status === 'approved' 
        ? 'Cliente verificado correctamente' 
        : 'Verificación procesada');
      setShowCompleteKYC(null);
      setKycComplete({
        verification_status: 'approved', identity_verified: true,
        document_type: 'DNI', document_number: '', notes: '', rejection_reason: ''
      });
      fetchKYCVerifications();
      fetchAccountRequests();
    } catch (error) {
      toast.error(error.message || 'Error al completar verificación');
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

  const handleLogout = () => {
    // Clear session and redirect to employee login
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/banco');
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema ManoBank</h1>
                <p className="text-sm text-zinc-400">Gestión Bancaria Interna</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-medium">{dashboard?.employee?.name}</p>
              <p className="text-sm text-zinc-400">{getRoleLabel(dashboard?.employee?.role)}</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'accounts', label: 'Aperturas', icon: FileText },
            { id: 'kyc', label: 'Verificación KYC', icon: Video },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'loans', label: 'Préstamos', icon: PiggyBank },
            { id: 'cards', label: 'Tarjetas', icon: CreditCard },
            { id: 'shipments', label: 'Envíos SEUR', icon: Truck },
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

        {/* KYC Verification Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6 text-indigo-600" />
                Verificación KYC por Videollamada
              </h2>
              <Button 
                size="sm" 
                variant="outline"
                onClick={fetchPendingVideoSessions}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Actualizar
              </Button>
            </div>

            {/* Live Video Sessions - NEW */}
            {pendingVideoSessions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400 animate-pulse">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-700">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <Video className="w-5 h-5" />
                  Clientes Esperando Videoverificación EN VIVO
                </h3>
                <div className="space-y-3">
                  {pendingVideoSessions.map((session) => (
                    <div key={session.session_id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-md">
                      <div>
                        <p className="font-medium text-lg">{session.customer_name}</p>
                        <p className="text-sm text-zinc-500">DNI: {session.customer_dni} | Tel: {session.customer_phone}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {session.status === 'customer_joined' ? '🟢 Cliente conectado y esperando' : '⏳ Iniciando sesión...'}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleJoinVideoSession(session.session_id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="join-video-session-btn"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Unirse a Videollamada
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Video Session Modal */}
            {activeVideoSession && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white font-semibold">Videoverificación KYC en Curso</span>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleEndVideoSession}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Finalizar
                    </Button>
                  </div>
                  
                  {/* Video Area */}
                  <div className="flex-1 grid grid-cols-3 gap-4 p-4">
                    {/* Main Video (Customer) */}
                    <div className="col-span-2 bg-black rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                        Video del Cliente
                      </div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="space-y-4">
                      {/* Customer Data */}
                      <div className="bg-slate-800 rounded-lg p-4 text-white">
                        <h4 className="font-semibold text-blue-400 mb-3">Datos del Cliente</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-slate-400">Nombre:</span> {activeVideoSession.customer_data?.name}</p>
                          <p><span className="text-slate-400">DNI:</span> {activeVideoSession.customer_data?.dni}</p>
                          <p><span className="text-slate-400">Teléfono:</span> {activeVideoSession.customer_data?.phone}</p>
                          {activeVideoSession.customer_data?.request_data && (
                            <>
                              <p><span className="text-slate-400">Email:</span> {activeVideoSession.customer_data.request_data.customer_email}</p>
                              <p><span className="text-slate-400">Dirección:</span> {activeVideoSession.customer_data.request_data.address_street}</p>
                              <p><span className="text-slate-400">Ciudad:</span> {activeVideoSession.customer_data.request_data.address_city}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Verification Actions */}
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-3">Verificación</h4>
                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleCompleteVideoVerification({
                              verification_status: 'approved',
                              identity_verified: true,
                              document_type: 'DNI',
                              document_number: activeVideoSession.customer_data?.dni || '',
                              document_matches_data: true,
                              face_matches_document: true,
                              notes: 'Verificación completada satisfactoriamente'
                            })}
                            data-testid="approve-kyc-btn"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar Verificación
                          </Button>
                          <Button 
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleCompleteVideoVerification({
                              verification_status: 'rejected',
                              identity_verified: false,
                              document_type: 'DNI',
                              document_number: '',
                              document_matches_data: false,
                              face_matches_document: false,
                              rejection_reason: 'Documento no coincide con datos proporcionados'
                            })}
                            data-testid="reject-kyc-btn"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Account Requests needing KYC */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Solicitudes Pendientes de Verificación (Método Manual)
              </h3>
              <div className="space-y-3">
                {accountRequests.filter(r => r.status === 'pending' || r.status === 'kyc_scheduled').map((req) => (
                  <div key={req.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.customer_name}</p>
                      <p className="text-sm text-zinc-500">DNI: {req.customer_dni} | Email: {req.customer_email}</p>
                      {req.kyc_scheduled_time && (
                        <p className="text-xs text-indigo-600 mt-1">
                          Programado: {new Date(req.kyc_scheduled_time).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => setShowScheduleKYC(req)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Programar Zoom
                        </Button>
                      )}
                      {req.status === 'kyc_scheduled' && req.kyc_meeting_link && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(req.kyc_meeting_link, '_blank')}
                            className="border-indigo-300 text-indigo-600"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Abrir Zoom
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {accountRequests.filter(r => r.status === 'pending' || r.status === 'kyc_scheduled').length === 0 && (
                  <p className="text-center text-zinc-500 py-4">No hay solicitudes pendientes de verificación manual</p>
                )}
              </div>
            </div>

            {/* Scheduled KYC Verifications */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Verificaciones Programadas</h3>
              </div>
              <div className="divide-y">
                {kycVerifications.filter(v => v.status === 'scheduled').map((verification) => (
                  <div key={verification.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{verification.customer_name}</p>
                        <p className="text-sm text-zinc-500">
                          {new Date(verification.scheduled_time).toLocaleString('es-ES')}
                        </p>
                        <p className="text-xs text-zinc-400">DNI: {verification.customer_dni}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(verification.meeting_link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Abrir Zoom
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setShowCompleteKYC(verification)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completar
                      </Button>
                    </div>
                  </div>
                ))}
                {kycVerifications.filter(v => v.status === 'scheduled').length === 0 && (
                  <p className="text-center text-zinc-500 py-8">No hay verificaciones programadas</p>
                )}
              </div>
            </div>

            {/* Completed Verifications */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Verificaciones Completadas</h3>
              </div>
              <div className="divide-y">
                {kycVerifications.filter(v => v.status !== 'scheduled').map((verification) => (
                  <div key={verification.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        verification.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {verification.status === 'approved' ? 
                          <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                          <XCircle className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{verification.customer_name}</p>
                        <p className="text-sm text-zinc-500">
                          {verification.document_type}: {verification.document_number}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Verificado: {verification.completed_at ? new Date(verification.completed_at).toLocaleDateString('es-ES') : '-'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      verification.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {verification.status === 'approved' ? 'Verificado' : 'Rechazado'}
                    </span>
                  </div>
                ))}
                {kycVerifications.filter(v => v.status !== 'scheduled').length === 0 && (
                  <p className="text-center text-zinc-500 py-8">No hay verificaciones completadas</p>
                )}
              </div>
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
                  card.card_type?.includes('gold') ? 'from-amber-400 via-yellow-500 to-amber-600' :
                  card.card_type?.includes('platinum') ? 'from-slate-400 via-slate-500 to-slate-600' :
                  card.card_type?.includes('mastercard') ? 'from-red-500 via-orange-500 to-red-600' :
                  card.card_type?.includes('visa') ? 'from-blue-500 via-blue-600 to-blue-700' :
                  card.card_type === 'business' ? 'from-zinc-700 to-zinc-900' :
                  card.card_type === 'prepago' ? 'from-green-500 to-teal-600' :
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
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {!card.physical_card_status && card.status === 'active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/20"
                        onClick={() => setShowShipCardModal(card)}
                        title="Enviar tarjeta física"
                      >
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}
                    {card.status === 'active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/20"
                        onClick={() => handleBlockCard(card.id)}
                        title="Bloquear tarjeta"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Shipping status badge */}
                  {card.physical_card_status && (
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.physical_card_status === 'delivered' ? 'bg-green-500 text-white' :
                        card.physical_card_status === 'pending_shipment' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {card.physical_card_status === 'delivered' && '📦 Entregada'}
                        {card.physical_card_status === 'pending_shipment' && '📋 Pendiente envío'}
                        {card.physical_card_status === 'shipping' && '🚚 Enviando'}
                      </span>
                    </div>
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

        {/* Ship Card Modal */}
        {showShipCardModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6 text-orange-600" />
                Enviar Tarjeta Física
              </h3>
              
              <div className="space-y-4">
                <div className="bg-zinc-50 rounded-lg p-4">
                  <p className="text-sm text-zinc-500">Tarjeta</p>
                  <p className="font-medium">{showShipCardModal.card_type_display || showShipCardModal.card_type}</p>
                  <p className="font-mono">{showShipCardModal.card_number_masked}</p>
                  <p className="text-sm mt-2">{showShipCardModal.customer_name}</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-800 mb-2">Dirección de envío</p>
                  <p className="text-sm text-orange-700">Se usará la dirección registrada del cliente</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Método de envío</label>
                  <select 
                    id="shipping-method"
                    className="w-full px-4 py-2 border rounded-lg"
                    defaultValue="standard"
                  >
                    <option value="standard">Estándar (5 días) - Gratis</option>
                    <option value="express">Express (2 días) - 5€</option>
                    <option value="24h">24 Horas - 10€</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowShipCardModal(null)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      const method = document.getElementById('shipping-method').value;
                      handleCreateShipment(showShipCardModal.id, {
                        shipping_method: method,
                        send_sms_notification: true
                      });
                    }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Crear Envío SEUR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipments Tab - SEUR */}
        {activeTab === 'shipments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6 text-orange-600" />
                Envíos de Tarjetas - SEUR
              </h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Package className="w-4 h-4" />
                Punto Pick-up: ES29153
              </div>
            </div>

            {/* Shipment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { status: 'pending', label: 'Pendientes', color: 'bg-gray-100 text-gray-700' },
                { status: 'preparing', label: 'Preparando', color: 'bg-yellow-100 text-yellow-700' },
                { status: 'shipped', label: 'Enviados', color: 'bg-blue-100 text-blue-700' },
                { status: 'in_transit', label: 'En tránsito', color: 'bg-purple-100 text-purple-700' },
                { status: 'delivered', label: 'Entregados', color: 'bg-green-100 text-green-700' }
              ].map(stat => (
                <div key={stat.status} className={`${stat.color} rounded-xl p-4 text-center`}>
                  <p className="text-2xl font-bold">{shipments.filter(s => s.status === stat.status).length}</p>
                  <p className="text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Shipments List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-orange-50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-600" />
                  Todos los Envíos
                </h3>
              </div>
              <div className="divide-y">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            shipment.status === 'shipped' || shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                            shipment.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                            shipment.status === 'failed' || shipment.status === 'returned' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {shipment.status === 'pending' && 'Pendiente'}
                            {shipment.status === 'preparing' && 'Preparando'}
                            {shipment.status === 'ready' && 'Listo'}
                            {shipment.status === 'shipped' && 'Enviado'}
                            {shipment.status === 'in_transit' && 'En tránsito'}
                            {shipment.status === 'out_for_delivery' && 'En reparto'}
                            {shipment.status === 'delivered' && 'Entregado'}
                            {shipment.status === 'failed' && 'Fallido'}
                            {shipment.status === 'returned' && 'Devuelto'}
                          </span>
                          <span className="font-mono text-sm bg-zinc-100 px-2 py-0.5 rounded">{shipment.tracking_number}</span>
                        </div>
                        <p className="font-medium">{shipment.customer_name}</p>
                        <p className="text-sm text-zinc-500">{shipment.card_type_display || shipment.card_type} - {shipment.card_masked}</p>
                        <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {shipment.full_recipient_address || shipment.shipping_address}
                        </p>
                        {shipment.estimated_delivery && (
                          <p className="text-xs text-zinc-400 mt-1">
                            Entrega estimada: {new Date(shipment.estimated_delivery).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {shipment.status === 'pending' && (
                          <Button size="sm" onClick={() => handleUpdateShipmentStatus(shipment.id, 'preparing')} className="bg-yellow-500 hover:bg-yellow-600">
                            <Package className="w-3 h-3 mr-1" />
                            Preparar
                          </Button>
                        )}
                        {shipment.status === 'preparing' && (
                          <Button size="sm" onClick={() => handleUpdateShipmentStatus(shipment.id, 'shipped')} className="bg-blue-500 hover:bg-blue-600">
                            <Truck className="w-3 h-3 mr-1" />
                            Marcar Enviado
                          </Button>
                        )}
                        {shipment.status === 'shipped' && (
                          <Button size="sm" onClick={() => handleUpdateShipmentStatus(shipment.id, 'in_transit')} className="bg-purple-500 hover:bg-purple-600">
                            <Navigation className="w-3 h-3 mr-1" />
                            En Tránsito
                          </Button>
                        )}
                        {shipment.status === 'in_transit' && (
                          <Button size="sm" onClick={() => handleUpdateShipmentStatus(shipment.id, 'out_for_delivery')} className="bg-orange-500 hover:bg-orange-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            En Reparto
                          </Button>
                        )}
                        {shipment.status === 'out_for_delivery' && (
                          <Button size="sm" onClick={() => handleUpdateShipmentStatus(shipment.id, 'delivered')} className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Entregado
                          </Button>
                        )}
                        {!['delivered', 'returned', 'failed'].includes(shipment.status) && (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => handleUpdateShipmentStatus(shipment.id, 'failed', 'Entrega fallida')}>
                            <XCircle className="w-3 h-3 mr-1" />
                            Fallido
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {shipments.length === 0 && (
                  <div className="p-12 text-center text-zinc-500">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                    <p>No hay envíos registrados</p>
                    <p className="text-sm mt-2">Los envíos se crean desde la pestaña de Tarjetas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sender Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Dirección de Envío (Remitente)</h4>
              <p className="text-sm text-orange-700">ManoBank S.A.</p>
              <p className="text-sm text-orange-700">Calle Sor Isabel de Villena 82 bajo</p>
              <p className="text-sm text-orange-700">46819 Novelda, Valencia</p>
              <p className="text-sm text-orange-600 mt-2 font-medium">Punto SEUR: ES29153</p>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Empleados del Banco</h2>
              {/* Solo Director/Superadmin puede crear empleados */}
              {(dashboard?.employee?.role === 'director' || dashboard?.employee?.is_superadmin) && (
                <Button onClick={() => setShowAddEmployee(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Añadir Empleado
                </Button>
              )}
            </div>
            
            {/* Mensaje para empleados sin permiso */}
            {dashboard?.employee?.role !== 'director' && !dashboard?.employee?.is_superadmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                <Shield className="w-5 h-5 inline mr-2" />
                Solo el Director General puede crear nuevos empleados.
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {employees.map((emp) => (
                <div key={emp.id || emp.email} className="p-4 flex items-center justify-between">
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
                      {emp.roles && emp.roles.length > 1 && (
                        <p className="text-xs text-indigo-600">+{emp.roles.length - 1} roles adicionales</p>
                      )}
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
                    {/* Solo Director puede eliminar */}
                    {(dashboard?.employee?.role === 'director' || dashboard?.employee?.is_superadmin) && 
                     emp.email !== dashboard?.employee?.email && (
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nueva Apertura de Cuenta</h3>
              <button onClick={() => setShowNewAccount(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleCreateAccountRequest} className="space-y-4">
              {/* Datos personales */}
              <div className="bg-zinc-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-indigo-700">Datos Personales</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      value={newAccountRequest.customer_name}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_name: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">DNI/NIE *</label>
                    <input
                      type="text"
                      value={newAccountRequest.customer_dni}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_dni: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="12345678A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={newAccountRequest.date_of_birth}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, date_of_birth: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono móvil *</label>
                    <input
                      type="tel"
                      value={newAccountRequest.customer_phone}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="+34 600 000 000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nacionalidad</label>
                    <input
                      type="text"
                      value={newAccountRequest.nationality}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, nationality: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={newAccountRequest.customer_email}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, customer_email: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-blue-700">Dirección de Residencia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Calle y número *</label>
                    <input
                      type="text"
                      value={newAccountRequest.address_street}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, address_street: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="Calle Mayor, 123, 2º B"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Ciudad/Población *</label>
                    <input
                      type="text"
                      value={newAccountRequest.address_city}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, address_city: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="Madrid"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Código Postal *</label>
                    <input
                      type="text"
                      value={newAccountRequest.address_postal_code}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, address_postal_code: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="28001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Provincia *</label>
                    <input
                      type="text"
                      value={newAccountRequest.address_province}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, address_province: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="Madrid"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">País</label>
                    <input
                      type="text"
                      value={newAccountRequest.address_country}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, address_country: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Datos de cuenta */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-emerald-700">Información de Cuenta</h4>
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="Empleado, Autónomo, Estudiante..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Ingresos mensuales (€)</label>
                    <input
                      type="number"
                      value={newAccountRequest.monthly_income}
                      onChange={(e) => setNewAccountRequest({ ...newAccountRequest, monthly_income: e.target.value })}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                Abrir Cuenta y Generar Contrato
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

      {/* Schedule KYC Modal */}
      {showScheduleKYC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6 text-indigo-600" />
                Programar Verificación Zoom
              </h3>
              <button onClick={() => setShowScheduleKYC(null)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="font-medium">{showScheduleKYC.customer_name}</p>
              <p className="text-sm text-zinc-600">DNI: {showScheduleKYC.customer_dni}</p>
              <p className="text-sm text-zinc-600">{showScheduleKYC.customer_email}</p>
            </div>
            
            <form onSubmit={handleScheduleKYC} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Enlace de Zoom Meeting *
                </label>
                <input
                  type="url"
                  value={kycSchedule.meeting_link}
                  onChange={(e) => setKycSchedule({ ...kycSchedule, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/xxxxxxxxx"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Crea una reunión en zoom.us y pega el enlace aquí
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={kycSchedule.scheduled_time}
                  onChange={(e) => setKycSchedule({ ...kycSchedule, scheduled_time: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={kycSchedule.notes}
                  onChange={(e) => setKycSchedule({ ...kycSchedule, notes: e.target.value })}
                  placeholder="Instrucciones para el cliente..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  rows={2}
                />
              </div>
              
              <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
                <Calendar className="w-4 h-4 mr-2" />
                Programar Videollamada
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Complete KYC Modal */}
      {showCompleteKYC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-emerald-600" />
                Completar Verificación KYC
              </h3>
              <button onClick={() => setShowCompleteKYC(null)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
              <p className="font-medium">{showCompleteKYC.customer_name}</p>
              <p className="text-sm text-zinc-600">DNI esperado: {showCompleteKYC.customer_dni}</p>
            </div>
            
            <form onSubmit={handleCompleteKYC} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Resultado de la Verificación
                </label>
                <select
                  value={kycComplete.verification_status}
                  onChange={(e) => setKycComplete({ ...kycComplete, verification_status: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                >
                  <option value="approved">✅ Aprobado - Identidad Verificada</option>
                  <option value="pending_documents">⏳ Pendiente - Documentos Adicionales</option>
                  <option value="rejected">❌ Rechazado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={kycComplete.document_type}
                  onChange={(e) => setKycComplete({ ...kycComplete, document_type: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                >
                  <option value="DNI">DNI Español</option>
                  <option value="NIE">NIE (Extranjero)</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Número de Documento Verificado *
                </label>
                <input
                  type="text"
                  value={kycComplete.document_number}
                  onChange={(e) => setKycComplete({ ...kycComplete, document_number: e.target.value })}
                  placeholder="12345678A"
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Notas de Verificación
                </label>
                <textarea
                  value={kycComplete.notes}
                  onChange={(e) => setKycComplete({ ...kycComplete, notes: e.target.value })}
                  placeholder="Observaciones de la videollamada..."
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  rows={2}
                />
              </div>
              
              {kycComplete.verification_status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Motivo del Rechazo *
                  </label>
                  <textarea
                    value={kycComplete.rejection_reason}
                    onChange={(e) => setKycComplete({ ...kycComplete, rejection_reason: e.target.value })}
                    placeholder="Explica el motivo del rechazo..."
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    rows={2}
                    required
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className={`w-full h-12 ${
                  kycComplete.verification_status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  kycComplete.verification_status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {kycComplete.verification_status === 'approved' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar Cliente
                  </>
                ) : kycComplete.verification_status === 'rejected' ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Verificación
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Solicitar Más Documentos
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Issue New Card Modal */}
      {showNewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                Emitir Nueva Tarjeta
              </h3>
              <button onClick={() => setShowNewCard(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <form onSubmit={handleIssueCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Seleccionar Cliente *
                </label>
                <select
                  value={newCardRequest.customer_id}
                  onChange={(e) => setNewCardRequest({ ...newCardRequest, customer_id: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                >
                  <option value="">-- Seleccionar cliente --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.dni}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  Si no ves clientes, ve a la pestaña "Clientes" primero
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Tipo de Tarjeta *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'visa_debito', label: 'VISA Débito', brand: 'VISA', color: 'from-blue-500 to-blue-700' },
                    { value: 'visa_credito', label: 'VISA Crédito', brand: 'VISA', color: 'from-blue-600 to-blue-800' },
                    { value: 'mastercard_debito', label: 'Mastercard Débito', brand: 'MC', color: 'from-red-500 to-orange-500' },
                    { value: 'mastercard_credito', label: 'Mastercard Crédito', brand: 'MC', color: 'from-red-600 to-orange-600' },
                    { value: 'visa_gold_debito', label: 'VISA Gold Débito', brand: 'VISA', color: 'from-amber-400 to-yellow-600' },
                    { value: 'visa_gold_credito', label: 'VISA Gold Crédito', brand: 'VISA', color: 'from-amber-500 to-yellow-700' },
                    { value: 'visa_platinum_debito', label: 'VISA Platinum Débito', brand: 'VISA', color: 'from-slate-400 to-slate-600' },
                    { value: 'visa_platinum_credito', label: 'VISA Platinum Crédito', brand: 'VISA', color: 'from-slate-500 to-slate-700' },
                    { value: 'prepago', label: 'Prepago', brand: 'VISA', color: 'from-green-500 to-teal-600' },
                    { value: 'business', label: 'Business', brand: 'MC', color: 'from-zinc-700 to-zinc-900' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewCardRequest({ ...newCardRequest, card_type: type.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        newCardRequest.card_type === type.value 
                          ? 'border-indigo-500 ring-2 ring-indigo-200' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${type.color} mb-2 flex items-center justify-between px-3`}>
                        <span className="text-white text-xs font-bold">ManoBank</span>
                        <span className="text-white text-xs font-bold">{type.brand}</span>
                      </div>
                      <p className="font-medium text-sm">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {['visa_credito', 'mastercard_credito', 'visa_gold_credito', 'visa_platinum_credito', 'business'].includes(newCardRequest.card_type) && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Límite de Crédito (€) *
                  </label>
                  <input
                    type="number"
                    value={newCardRequest.credit_limit}
                    onChange={(e) => setNewCardRequest({ ...newCardRequest, credit_limit: e.target.value })}
                    placeholder="3000"
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    min="500"
                    max="100000"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Límite sugerido: Débito=0€, Crédito=3.000€, Platinum=15.000€, Black=50.000€
                  </p>
                </div>
              )}
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> La tarjeta se vinculará a la cuenta principal del cliente.
                  El cliente recibirá los datos de la tarjeta por email.
                </p>
              </div>
              
              <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Emitir Tarjeta {newCardRequest.card_type?.toUpperCase() || ''}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* New Loan Request Modal */}
      {showNewLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PiggyBank className="w-6 h-6 text-indigo-600" />
                Nueva Solicitud de Préstamo
              </h3>
              <button onClick={() => setShowNewLoan(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={newLoanRequest.customer_id}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setNewLoanRequest({ 
                      ...newLoanRequest, 
                      customer_id: e.target.value,
                      customer_name: customer?.name || '',
                      customer_email: customer?.email || ''
                    });
                  }}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.dni}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Tipo de Préstamo *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'personal', label: 'Personal', icon: DollarSign, desc: 'Hasta 50.000€' },
                    { value: 'hipotecario', label: 'Hipotecario', icon: Home, desc: 'Para vivienda' },
                    { value: 'vehiculo', label: 'Vehículo', icon: Car, desc: 'Coche o moto' },
                    { value: 'empresarial', label: 'Empresarial', icon: Briefcase, desc: 'Para negocios' },
                    { value: 'estudios', label: 'Estudios', icon: GraduationCap, desc: 'Formación' },
                    { value: 'rapido', label: 'Rápido', icon: Zap, desc: 'Hasta 5.000€' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewLoanRequest({ ...newLoanRequest, loan_type: type.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        newLoanRequest.loan_type === type.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 mb-1 ${newLoanRequest.loan_type === type.value ? 'text-indigo-600' : 'text-zinc-400'}`} />
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-zinc-500">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Importe (€) *</label>
                  <input
                    type="number"
                    value={newLoanRequest.amount}
                    onChange={(e) => setNewLoanRequest({ ...newLoanRequest, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    placeholder="10000"
                    min="1000"
                    max="500000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Plazo (meses) *</label>
                  <select
                    value={newLoanRequest.term_months}
                    onChange={(e) => setNewLoanRequest({ ...newLoanRequest, term_months: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                    required
                  >
                    <option value="12">12 meses</option>
                    <option value="24">24 meses</option>
                    <option value="36">36 meses</option>
                    <option value="48">48 meses</option>
                    <option value="60">60 meses</option>
                    <option value="84">84 meses</option>
                    <option value="120">120 meses</option>
                    <option value="180">180 meses (hipoteca)</option>
                    <option value="240">240 meses (hipoteca)</option>
                    <option value="300">300 meses (hipoteca)</option>
                    <option value="360">360 meses (hipoteca)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Finalidad del préstamo *</label>
                <input
                  type="text"
                  value={newLoanRequest.purpose}
                  onChange={(e) => setNewLoanRequest({ ...newLoanRequest, purpose: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  placeholder="Reforma del hogar, compra de vehículo..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Ingresos mensuales netos (€) *</label>
                <input
                  type="number"
                  value={newLoanRequest.monthly_income}
                  onChange={(e) => setNewLoanRequest({ ...newLoanRequest, monthly_income: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                  placeholder="2500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Situación laboral</label>
                <select
                  value={newLoanRequest.employment_status || 'empleado'}
                  onChange={(e) => setNewLoanRequest({ ...newLoanRequest, employment_status: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg"
                >
                  <option value="empleado">Empleado por cuenta ajena</option>
                  <option value="autonomo">Autónomo</option>
                  <option value="funcionario">Funcionario</option>
                  <option value="empresario">Empresario</option>
                  <option value="pensionista">Pensionista</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              {/* Loan Preview */}
              {newLoanRequest.amount && newLoanRequest.term_months && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-indigo-900 mb-2">Estimación (sin compromiso)</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        {Math.round(parseFloat(newLoanRequest.amount) / parseInt(newLoanRequest.term_months) * 1.08).toLocaleString('es-ES')}€
                      </p>
                      <p className="text-xs text-indigo-700">Cuota aprox.</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        {newLoanRequest.loan_type === 'hipotecario' ? '2.5%' : 
                         newLoanRequest.loan_type === 'rapido' ? '12%' : '5.9%'}
                      </p>
                      <p className="text-xs text-indigo-700">TAE desde</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">24h</p>
                      <p className="text-xs text-indigo-700">Respuesta</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
                <PiggyBank className="w-4 h-4 mr-2" />
                Registrar Solicitud de Préstamo
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BancoSistema;
