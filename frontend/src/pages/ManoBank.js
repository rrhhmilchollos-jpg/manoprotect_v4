import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Calendar,
  Bell,
  Shield,
  RefreshCw,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  Eye,
  EyeOff,
  Settings,
  Wallet,
  Copy,
  Sparkles,
  Lock,
  Globe,
  Zap,
  Landmark
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManoBank = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBizum, setShowBizum] = useState(false);
  const [showCreateManoAccount, setShowCreateManoAccount] = useState(false);
  const [showVirtualCard, setShowVirtualCard] = useState(false);
  
  // Form states
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_holder: '',
    iban: '',
    swift_bic: '',
    alias: ''
  });
  
  const [transferData, setTransferData] = useState({
    from_account_id: '',
    to_iban: '',
    to_name: '',
    amount: '',
    concept: ''
  });
  
  const [bizumData, setBizumData] = useState({
    from_account_id: '',
    to_phone: '',
    to_name: '',
    amount: '',
    concept: ''
  });

  // ManoBank Account
  const [manoAccount, setManoAccount] = useState(null);
  const [virtualCard, setVirtualCard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/dashboard`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setDashboard(data);
      
      // Find ManoBank account
      const manoAcc = data.accounts?.find(a => a.bank_name === 'ManoBank');
      setManoAccount(manoAcc);
      
      // Get virtual card if exists
      if (manoAcc) {
        const cardResp = await fetch(`${API_URL}/api/manobank/card`, {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (cardResp.ok) {
          const cardData = await cardResp.json();
          setVirtualCard(cardData.card);
        }
      }
      
      if (data.accounts?.length > 0 && !transferData.from_account_id) {
        const primaryAccount = data.accounts.find(a => a.is_primary) || data.accounts[0];
        setTransferData(prev => ({ ...prev, from_account_id: primaryAccount.id }));
        setBizumData(prev => ({ ...prev, from_account_id: primaryAccount.id }));
      }
    } catch (error) {
      console.error('Error loading ManoBank:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManoAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/create-account`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('¡Cuenta ManoBank creada! Tu IBAN está listo.');
      setShowCreateManoAccount(false);
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al crear cuenta');
    }
  };

  const handleCreateVirtualCard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/card/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('¡Tarjeta virtual creada!');
      setVirtualCard(data.card);
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al crear tarjeta');
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/accounts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(newAccount)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail);
      
      toast.success('Cuenta añadida correctamente');
      setShowAddAccount(false);
      setNewAccount({ bank_name: '', account_holder: '', iban: '', swift_bic: '', alias: '' });
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al añadir cuenta');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/transfers/sepa`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...transferData,
          amount: parseFloat(transferData.amount)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail);
      
      if (data.fraud_check?.is_suspicious) {
        toast.warning('Transferencia pendiente de verificación por motivos de seguridad');
      } else {
        toast.success('Transferencia realizada correctamente');
      }
      
      setShowTransfer(false);
      setTransferData({ ...transferData, to_iban: '', to_name: '', amount: '', concept: '' });
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al realizar transferencia');
    }
  };

  const handleBizum = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/transfers/bizum`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...bizumData,
          amount: parseFloat(bizumData.amount)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail);
      
      toast.success(`Bizum de ${bizumData.amount}€ enviado`);
      setShowBizum(false);
      setBizumData({ ...bizumData, to_phone: '', to_name: '', amount: '', concept: '' });
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || 'Error al enviar Bizum');
    }
  };

  const verifyTransfer = async (transferId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/transfers/${transferId}/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Error al verificar');
      
      toast.success('Transferencia verificada y procesada');
      fetchDashboard();
    } catch (error) {
      toast.error('Error al verificar transferencia');
    }
  };

  const cancelTransfer = async (transferId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/transfers/${transferId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Error al cancelar');
      
      toast.success('Transferencia cancelada');
      fetchDashboard();
    } catch (error) {
      toast.error('Error al cancelar transferencia');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Show welcome screen if no ManoBank account
  if (!manoAccount && (!dashboard?.accounts || dashboard.accounts.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <header className="px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                alt="ManoBank" 
                className="h-8 w-auto brightness-0 invert"
              />
              <h1 className="text-xl font-bold text-white">ManoBank</h1>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Tu banco digital con protección antifraude</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">ManoBank</span>
            </h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Abre tu cuenta gratuita y obtén tu IBAN español, tarjeta virtual y todas las herramientas para gestionar tu dinero de forma segura.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Open ManoBank Account */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Cuenta ManoBank</h3>
              <p className="text-indigo-200 mb-6">
                Tu cuenta principal con IBAN español, sin comisiones de mantenimiento y protección antifraude integrada.
              </p>
              <ul className="space-y-3 mb-8">
                {['IBAN español propio', 'Sin comisiones', 'Tarjeta virtual gratis', 'Protección 24/7'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleCreateManoAccount}
                className="w-full bg-white text-indigo-900 hover:bg-indigo-100 h-14 text-lg font-semibold rounded-xl"
                data-testid="create-manobank-account-btn"
              >
                <Zap className="w-5 h-5 mr-2" />
                Abrir Cuenta Gratis
              </Button>
            </div>
            
            {/* Connect External Bank */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-zinc-700 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Conectar Otro Banco</h3>
              <p className="text-indigo-200 mb-6">
                Vincula tu cuenta de BBVA, CaixaBank, Santander u otro banco para gestionar todo desde ManoBank.
              </p>
              <ul className="space-y-3 mb-8">
                {['Vista unificada', 'Transferencias entre bancos', 'Análisis de gastos', 'Alertas personalizadas'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setShowAddAccount(true)}
                variant="outline"
                className="w-full border-2 border-white/30 text-white hover:bg-white/10 h-14 text-lg rounded-xl"
                data-testid="connect-bank-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                Conectar Banco
              </Button>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, label: 'Tarjeta Virtual', desc: 'Visa/Mastercard' },
              { icon: Send, label: 'Transferencias', desc: 'SEPA y Bizum' },
              { icon: Shield, label: 'Antifraude', desc: 'IA en tiempo real' },
              { icon: Lock, label: 'Seguro', desc: 'Cifrado AES-256' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
                <item.icon className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-xs text-indigo-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                alt="ManoBank" 
                className="h-8 w-auto brightness-0 invert"
              />
              <div>
                <h1 className="text-xl font-bold">ManoBank</h1>
                <p className="text-sm text-indigo-200">Tu banco seguro</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate('/profile')}>
              <Settings className="w-5 h-5" />
            </Button>
            {dashboard?.stats?.alert_count > 0 && (
              <Button variant="ghost" className="text-white hover:bg-white/20 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {dashboard.stats.alert_count}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-indigo-200 text-sm">Saldo Total</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold">
                    {showBalance ? `${dashboard?.total_balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0,00'}€` : '••••••'}
                  </h2>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-indigo-200 hover:text-white">
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm">{dashboard?.accounts?.length || 0} cuentas</p>
                {manoAccount && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                      Cuenta ManoBank Activa
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* ManoBank IBAN */}
            {manoAccount && (
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-200">Tu IBAN ManoBank</p>
                    <p className="font-mono text-lg">{manoAccount.iban}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(manoAccount.iban)}
                    className="text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Monthly Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs text-indigo-200">Ingresos</p>
                <p className="font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  +{dashboard?.monthly_summary?.income?.toLocaleString('es-ES') || '0'}€
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-200">Gastos</p>
                <p className="font-semibold flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  -{dashboard?.monthly_summary?.expenses?.toLocaleString('es-ES') || '0'}€
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-200">Balance</p>
                <p className={`font-semibold ${(dashboard?.monthly_summary?.net || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(dashboard?.monthly_summary?.net || 0) >= 0 ? '+' : ''}{dashboard?.monthly_summary?.net?.toLocaleString('es-ES') || '0'}€
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-5 gap-3">
          <button
            onClick={() => setShowTransfer(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            data-testid="transfer-btn"
          >
            <Send className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Transferir</span>
          </button>
          <button
            onClick={() => setShowBizum(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            data-testid="bizum-btn"
          >
            <Smartphone className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Bizum</span>
          </button>
          <button
            onClick={() => setShowVirtualCard(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            data-testid="card-btn"
          >
            <CreditCard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Tarjeta</span>
          </button>
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            data-testid="add-account-btn"
          >
            <Plus className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Añadir</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center"
          >
            <Calendar className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Programados</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Fraud Alerts */}
        {dashboard?.fraud_alerts?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas de Seguridad
            </h3>
            <div className="space-y-3">
              {dashboard.fraud_alerts.map((alert) => (
                <div key={alert.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-amber-900">{alert.title}</p>
                      <p className="text-sm text-amber-700">{alert.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.severity === 'high' ? 'Alta' : 'Media'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Transfers */}
        {dashboard?.pending_transfers?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Transferencias Pendientes
            </h3>
            <div className="space-y-3">
              {dashboard.pending_transfers.map((transfer) => (
                <div key={transfer.id} className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transfer.to_name}</p>
                      <p className="text-sm text-zinc-500">{transfer.to_iban_masked}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-600">-{transfer.amount}€</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => verifyTransfer(transfer.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                          Verificar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cancelTransfer(transfer.id)} className="text-red-600 border-red-300 text-xs">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="mb-6">
          <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Mis Cuentas
          </h3>
          <div className="space-y-3">
            {dashboard?.accounts?.map((account) => (
              <div key={account.id} className={`bg-white rounded-xl p-4 shadow-sm border ${account.bank_name === 'ManoBank' ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50' : 'border-zinc-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${account.bank_name === 'ManoBank' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-indigo-100'}`}>
                      {account.bank_name === 'ManoBank' ? (
                        <img 
                          src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                          alt="ManoBank" 
                          className="h-6 w-auto brightness-0 invert"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{account.alias || account.bank_name}</p>
                        {account.is_primary && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Principal</span>
                        )}
                        {account.bank_name === 'ManoBank' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">ManoBank</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{account.iban_masked}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {showBalance ? `${account.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€` : '••••'}
                    </p>
                    <p className="text-xs text-zinc-500">Disponible</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="font-semibold text-zinc-900 mb-3">Últimos Movimientos</h3>
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 divide-y">
            {dashboard?.recent_transactions?.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-zinc-500">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(tx.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
            
            {(!dashboard?.recent_transactions || dashboard.recent_transactions.length === 0) && (
              <div className="p-8 text-center text-zinc-500">
                No hay movimientos recientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Conectar Banco Externo</h3>
              <button onClick={() => setShowAddAccount(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Banco</label>
                <select
                  value={newAccount.bank_name}
                  onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Seleccionar banco</option>
                  <option value="Santander">Santander</option>
                  <option value="BBVA">BBVA</option>
                  <option value="CaixaBank">CaixaBank</option>
                  <option value="Sabadell">Sabadell</option>
                  <option value="Bankinter">Bankinter</option>
                  <option value="ING">ING</option>
                  <option value="N26">N26</option>
                  <option value="Revolut">Revolut</option>
                  <option value="Openbank">Openbank</option>
                  <option value="EVO Banco">EVO Banco</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Titular</label>
                <input
                  type="text"
                  value={newAccount.account_holder}
                  onChange={(e) => setNewAccount({ ...newAccount, account_holder: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre del titular"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={newAccount.iban}
                  onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Alias (opcional)</label>
                <input
                  type="text"
                  value={newAccount.alias}
                  onChange={(e) => setNewAccount({ ...newAccount, alias: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Cuenta nómina"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                Conectar Cuenta
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nueva Transferencia</h3>
              <button onClick={() => setShowTransfer(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Desde</label>
                <select
                  value={transferData.from_account_id}
                  onChange={(e) => setTransferData({ ...transferData, from_account_id: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {dashboard?.accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.alias || acc.bank_name} - {acc.balance?.toLocaleString('es-ES')}€
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">IBAN Destino</label>
                <input
                  type="text"
                  value={transferData.to_iban}
                  onChange={(e) => setTransferData({ ...transferData, to_iban: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Beneficiario</label>
                <input
                  type="text"
                  value={transferData.to_name}
                  onChange={(e) => setTransferData({ ...transferData, to_name: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre del beneficiario"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Importe</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50000"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Concepto</label>
                <input
                  type="text"
                  value={transferData.concept}
                  onChange={(e) => setTransferData({ ...transferData, concept: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Concepto de la transferencia"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12">
                <Send className="w-4 h-4 mr-2" />
                Enviar Transferencia
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Bizum Modal */}
      {showBizum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Enviar Bizum</h3>
              </div>
              <button onClick={() => setShowBizum(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleBizum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Desde</label>
                <select
                  value={bizumData.from_account_id}
                  onChange={(e) => setBizumData({ ...bizumData, from_account_id: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {dashboard?.accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.alias || acc.bank_name} - {acc.balance?.toLocaleString('es-ES')}€
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={bizumData.to_phone}
                  onChange={(e) => setBizumData({ ...bizumData, to_phone: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="+34 600 000 000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Importe (máx. 1.000€)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000"
                    value={bizumData.amount}
                    onChange={(e) => setBizumData({ ...bizumData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 pr-10"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Concepto (opcional)</label>
                <input
                  type="text"
                  value={bizumData.concept}
                  onChange={(e) => setBizumData({ ...bizumData, concept: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ej: Cena de ayer"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12">
                <Smartphone className="w-4 h-4 mr-2" />
                Enviar Bizum
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Virtual Card Modal */}
      {showVirtualCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Tu Tarjeta Virtual</h3>
              <button onClick={() => setShowVirtualCard(false)}>
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>
            
            {virtualCard ? (
              <div className="space-y-6">
                {/* Card Display */}
                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl">
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/10 rounded-2xl" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <img 
                        src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                        alt="ManoBank" 
                        className="h-6 w-auto brightness-0 invert"
                      />
                      <span className="text-white/70 text-sm">Virtual</span>
                    </div>
                    <div className="mb-6">
                      <p className="font-mono text-xl tracking-wider text-white">
                        {virtualCard.card_number_masked}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-white/70">Titular</p>
                        <p className="font-semibold text-white">{virtualCard.holder_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/70">Válida hasta</p>
                        <p className="font-semibold text-white">{virtualCard.expiry}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-16 left-6 w-10 h-8 bg-yellow-300/80 rounded-md" />
                </div>
                
                {/* Card Details */}
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-300">Número de tarjeta</p>
                      <p className="font-mono text-white">{virtualCard.card_number_masked}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(virtualCard.card_number)} className="text-white hover:bg-white/20">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-xs text-indigo-300">CVV</p>
                      <p className="font-mono text-white">•••</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-xs text-indigo-300">Caducidad</p>
                      <p className="font-mono text-white">{virtualCard.expiry}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-indigo-300 text-center">
                  Usa esta tarjeta para compras online seguras
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Crea tu tarjeta virtual</h4>
                <p className="text-indigo-200 mb-6">
                  Obtén una tarjeta virtual gratuita para compras online seguras
                </p>
                <Button
                  onClick={handleCreateVirtualCard}
                  className="bg-white text-indigo-900 hover:bg-indigo-100"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Crear Tarjeta Virtual
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManoBank;
