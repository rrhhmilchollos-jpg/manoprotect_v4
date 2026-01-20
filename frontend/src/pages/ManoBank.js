import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft, CreditCard, Send, ArrowUpRight, ArrowDownLeft, Plus,
  Bell, Shield, RefreshCw, Smartphone, CheckCircle, Clock, Eye, EyeOff,
  Settings, Wallet, Copy, Landmark, Home, Receipt, PiggyBank, User,
  ChevronRight, MoreHorizontal, Filter, Download, Search, QrCode,
  Banknote, ArrowRightLeft, Phone, Mail, MapPin, HelpCircle, LogOut,
  Menu, X, TrendingUp, Calendar, CreditCard as CardIcon, Building2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManoBank = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Modal states
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBizum, setShowBizum] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(null);
  
  // Form states
  const [transferData, setTransferData] = useState({
    from_account_id: '', to_iban: '', to_name: '', amount: '', concept: '',
    transfer_type: 'normal', scheduled_date: ''
  });
  const [bizumData, setBizumData] = useState({
    from_account_id: '', to_phone: '', amount: '', concept: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch user's bank data
  const fetchBankData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/manobank/dashboard`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setCards(data.cards || []);
        setTransactions(data.transactions || []);
        
        // Calculate total balance
        const total = (data.accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
        setTotalBalance(total);
        
        if (data.accounts?.length > 0 && !selectedAccount) {
          setSelectedAccount(data.accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching bank data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token, selectedAccount]);

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  // Create ManoBank account
  const handleCreateAccount = async () => {
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
      
      toast.success('¡Cuenta ManoBank creada! Bono de bienvenida: 10€');
      setShowNewAccount(false);
      fetchBankData();
    } catch (error) {
      toast.error(error.message || 'Error al crear cuenta');
    }
  };

  // Make transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...transferData,
        amount: parseFloat(transferData.amount)
      };
      
      // Only include scheduled_date if transfer is scheduled
      if (transferData.transfer_type !== 'scheduled') {
        delete payload.scheduled_date;
      }
      
      const response = await fetch(`${API_URL}/api/manobank/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      
      const messages = {
        'normal': 'Transferencia realizada (llegará en 24-48h)',
        'immediate': 'Transferencia inmediata realizada',
        'scheduled': `Transferencia programada para ${transferData.scheduled_date}`,
        'internal': 'Transferencia interna realizada al instante'
      };
      
      toast.success(data.message || messages[data.transfer?.transfer_type] || 'Transferencia procesada');
      setShowTransfer(false);
      setTransferData({ from_account_id: '', to_iban: '', to_name: '', amount: '', concept: '', transfer_type: 'normal', scheduled_date: '' });
      fetchBankData();
    } catch (error) {
      toast.error(error.message || 'Error en la transferencia');
    }
  };

  // Bizum payment
  const handleBizum = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manobank/bizum`, {
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
      
      toast.success('Bizum enviado correctamente');
      setShowBizum(false);
      setBizumData({ from_account_id: '', to_phone: '', amount: '', concept: '' });
      fetchBankData();
    } catch (error) {
      toast.error(error.message || 'Error al enviar Bizum');
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <Landmark className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">ManoBank</h2>
          <p className="text-zinc-600 mb-6">Inicia sesión para acceder a tu banca digital</p>
          <Button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Top Header - BBVA Style */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Landmark className="w-8 h-8" />
                <span className="text-xl font-bold">ManoBank</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { id: 'home', label: 'Posición global', icon: Home },
                { id: 'accounts', label: 'Cuentas', icon: Wallet },
                { id: 'cards', label: 'Tarjetas', icon: CreditCard },
                { id: 'transfers', label: 'Transferencias', icon: ArrowRightLeft },
                { id: 'receipts', label: 'Recibos', icon: Receipt },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    activeTab === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-72 h-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-blue-900 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold">Menú</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-white/70">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {[
                { id: 'home', label: 'Posición global', icon: Home },
                { id: 'accounts', label: 'Cuentas', icon: Wallet },
                { id: 'cards', label: 'Tarjetas', icon: CreditCard },
                { id: 'transfers', label: 'Transferencias', icon: ArrowRightLeft },
                { id: 'receipts', label: 'Recibos', icon: Receipt },
                { id: 'profile', label: 'Mi perfil', icon: User },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : accounts.length === 0 ? (
          /* No Account - Create Account CTA */
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bienvenido a ManoBank</h2>
            <p className="text-zinc-600 mb-6">
              Abre tu cuenta bancaria digital en segundos y disfruta de todas las ventajas de la banca moderna.
            </p>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>IBAN español propio</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Tarjeta virtual gratuita</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Transferencias y Bizum</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>10€ de bono de bienvenida</span>
              </li>
            </ul>
            <Button 
              onClick={handleCreateAccount}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            >
              Abrir mi cuenta gratis
            </Button>
          </div>
        ) : (
          <>
            {/* Home / Global Position */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Total Balance Card */}
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">Posición global</span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 hover:bg-white/10 rounded-full"
                    >
                      {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-white/70 mb-1">Saldo total disponible</p>
                    <p className="text-4xl font-bold">
                      {showBalance ? formatCurrency(totalBalance) : '••••••'}
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Send, label: 'Transferir', action: () => setShowTransfer(true) },
                      { icon: Smartphone, label: 'Bizum', action: () => setShowBizum(true) },
                      { icon: QrCode, label: 'Pagar QR', action: () => toast.info('Próximamente') },
                      { icon: Plus, label: 'Más', action: () => {} },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                      >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accounts List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-lg">Mis cuentas</h2>
                    <button className="text-blue-600 text-sm font-medium">Ver todas</button>
                  </div>
                  <div className="divide-y">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => { setSelectedAccount(account); setActiveTab('accounts'); }}
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{account.alias || 'Cuenta principal'}</p>
                            <p className="text-sm text-zinc-500">{account.iban_masked}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {showBalance ? formatCurrency(account.balance) : '••••'}
                          </p>
                          <p className="text-xs text-zinc-500">Disponible</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards Section */}
                {cards.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="font-bold text-lg">Mis tarjetas</h2>
                      <button 
                        onClick={() => setActiveTab('cards')}
                        className="text-blue-600 text-sm font-medium"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <div className="flex gap-4">
                        {cards.slice(0, 2).map((card) => (
                          <div
                            key={card.id}
                            className={`min-w-[280px] h-44 rounded-xl p-5 text-white relative overflow-hidden ${
                              card.card_type === 'credito' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                              card.card_type === 'platinum' ? 'bg-gradient-to-br from-zinc-700 to-zinc-900' :
                              card.card_type === 'black' ? 'bg-gradient-to-br from-zinc-900 to-black' :
                              'bg-gradient-to-br from-blue-600 to-blue-800'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-8">
                              <Landmark className="w-8 h-8" />
                              <span className="text-xs uppercase tracking-wider">{card.card_type}</span>
                            </div>
                            <p className="font-mono text-lg tracking-wider mb-4">
                              {showBalance ? card.card_number_masked : '•••• •••• •••• ••••'}
                            </p>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-white/70">TITULAR</p>
                                <p className="text-sm font-medium">{user?.name?.toUpperCase()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white/70">VÁLIDA</p>
                                <p className="text-sm font-medium">{card.expiry_date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-lg">Últimos movimientos</h2>
                    <button 
                      onClick={() => setActiveTab('accounts')}
                      className="text-blue-600 text-sm font-medium"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="divide-y">
                    {transactions.slice(0, 5).map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => setShowTransactionDetail(tx)}
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'credit' ? 
                              <ArrowDownLeft className="w-5 h-5 text-green-600" /> :
                              <ArrowUpRight className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{tx.concept || tx.to_name || 'Movimiento'}</p>
                            <p className="text-sm text-zinc-500">{formatDate(tx.created_at)}</p>
                          </div>
                        </div>
                        <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </button>
                    ))}
                    {transactions.length === 0 && (
                      <div className="p-8 text-center text-zinc-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                        <p>No hay movimientos todavía</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && selectedAccount && (
              <div className="space-y-6">
                {/* Account Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAccount.alias || 'Cuenta principal'}</h2>
                        <div className="flex items-center gap-2">
                          <p className="text-zinc-500 font-mono">{selectedAccount.iban_masked}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedAccount.iban);
                              toast.success('IBAN copiado');
                            }}
                            className="p-1 hover:bg-zinc-100 rounded"
                          >
                            <Copy className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-zinc-100 rounded-lg">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="bg-zinc-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-zinc-500 mb-1">Saldo disponible</p>
                    <p className="text-3xl font-bold">
                      {showBalance ? formatCurrency(selectedAccount.balance) : '••••••'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      onClick={() => setShowTransfer(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Transferir
                    </Button>
                    <Button 
                      onClick={() => setShowBizum(true)}
                      variant="outline"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Bizum
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Extracto
                    </Button>
                  </div>
                </div>

                {/* Transactions Filter */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar movimientos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-zinc-200 rounded-lg"
                    >
                      <option value="all">Todos</option>
                      <option value="credit">Ingresos</option>
                      <option value="debit">Gastos</option>
                    </select>
                  </div>

                  <div className="divide-y">
                    {filteredTransactions.map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => setShowTransactionDetail(tx)}
                        className="w-full py-4 flex items-center justify-between hover:bg-zinc-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'credit' ? 
                              <ArrowDownLeft className="w-5 h-5 text-green-600" /> :
                              <ArrowUpRight className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{tx.concept || 'Movimiento'}</p>
                            <p className="text-sm text-zinc-500">{formatDate(tx.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Saldo: {formatCurrency(tx.balance_after)}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <div className="py-12 text-center text-zinc-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                        <p>No se encontraron movimientos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Mis tarjetas</h2>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar tarjeta
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {cards.map((card) => (
                    <div key={card.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {/* Card Visual */}
                      <div className={`h-48 p-6 text-white relative ${
                        card.card_type === 'credito' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        card.card_type === 'platinum' ? 'bg-gradient-to-br from-zinc-700 to-zinc-900' :
                        card.card_type === 'black' ? 'bg-gradient-to-br from-zinc-900 to-black' :
                        'bg-gradient-to-br from-blue-600 to-blue-800'
                      }`}>
                        <div className="flex justify-between items-start mb-6">
                          <Landmark className="w-10 h-10" />
                          <span className="text-sm uppercase tracking-wider font-medium">{card.card_type}</span>
                        </div>
                        <p className="font-mono text-xl tracking-wider mb-4">
                          {showBalance ? card.card_number_masked : '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-white/70">TITULAR</p>
                            <p className="font-medium">{user?.name?.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/70">VÁLIDA</p>
                            <p className="font-medium">{card.expiry_date}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Actions */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Estado</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            card.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {card.is_active ? 'Activa' : 'Bloqueada'}
                          </span>
                        </div>
                        {card.credit_limit && (
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Límite</span>
                            <span className="font-medium">{formatCurrency(card.credit_limit)}</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver PIN
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="w-4 h-4 mr-1" />
                            Ajustes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cards.length === 0 && (
                    <div className="col-span-2 bg-white rounded-2xl p-12 text-center">
                      <CreditCard className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tienes tarjetas</h3>
                      <p className="text-zinc-500 mb-4">Solicita tu primera tarjeta ManoBank</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Solicitar tarjeta
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transfers Tab */}
            {activeTab === 'transfers' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Transferencias</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setShowTransfer(true)}
                    className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-all"
                  >
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Send className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Transferencia</h3>
                    <p className="text-zinc-500">Envía dinero a cualquier cuenta</p>
                  </button>

                  <button
                    onClick={() => setShowBizum(true)}
                    className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-all"
                  >
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Smartphone className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Bizum</h3>
                    <p className="text-zinc-500">Paga con el móvil al instante</p>
                  </button>

                  <button className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Transferencia periódica</h3>
                    <p className="text-zinc-500">Programa envíos automáticos</p>
                  </button>

                  <button className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="w-7 h-7 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Transferencia internacional</h3>
                    <p className="text-zinc-500">Envía dinero al extranjero</p>
                  </button>
                </div>
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Recibos y pagos</h2>
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Receipt className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay recibos pendientes</h3>
                  <p className="text-zinc-500">Cuando tengas recibos domiciliados aparecerán aquí</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nueva transferencia</h3>
              <button onClick={() => setShowTransfer(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Desde cuenta</label>
                <select
                  value={transferData.from_account_id}
                  onChange={(e) => setTransferData({ ...transferData, from_account_id: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.alias || 'Cuenta'} - {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IBAN destino</label>
                <input
                  type="text"
                  value={transferData.to_iban}
                  onChange={(e) => setTransferData({ ...transferData, to_iban: e.target.value })}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  className="w-full px-4 py-3 border rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beneficiario</label>
                <input
                  type="text"
                  value={transferData.to_name}
                  onChange={(e) => setTransferData({ ...transferData, to_name: e.target.value })}
                  placeholder="Nombre del destinatario"
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Importe</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border rounded-lg pr-12"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Concepto</label>
                <input
                  type="text"
                  value={transferData.concept}
                  onChange={(e) => setTransferData({ ...transferData, concept: e.target.value })}
                  placeholder="Ej: Alquiler enero"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                Enviar transferencia
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
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-purple-600" />
                Enviar Bizum
              </h3>
              <button onClick={() => setShowBizum(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <form onSubmit={handleBizum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Desde cuenta</label>
                <select
                  value={bizumData.from_account_id}
                  onChange={(e) => setBizumData({ ...bizumData, from_account_id: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.alias || 'Cuenta'} - {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono móvil</label>
                <input
                  type="tel"
                  value={bizumData.to_phone}
                  onChange={(e) => setBizumData({ ...bizumData, to_phone: e.target.value })}
                  placeholder="+34 600 000 000"
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Importe</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    max="1000"
                    value={bizumData.amount}
                    onChange={(e) => setBizumData({ ...bizumData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border rounded-lg pr-12"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Máximo 1.000€ por envío</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Concepto (opcional)</label>
                <input
                  type="text"
                  value={bizumData.concept}
                  onChange={(e) => setBizumData({ ...bizumData, concept: e.target.value })}
                  placeholder="Ej: Cena de ayer"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700">
                Enviar Bizum
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Detalle del movimiento</h3>
              <button onClick={() => setShowTransactionDetail(null)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className={`text-center py-4 rounded-xl ${
                showTransactionDetail.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`text-3xl font-bold ${
                  showTransactionDetail.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {showTransactionDetail.type === 'credit' ? '+' : '-'}
                  {formatCurrency(showTransactionDetail.amount)}
                </p>
              </div>
              <div className="divide-y">
                <div className="py-3 flex justify-between">
                  <span className="text-zinc-500">Concepto</span>
                  <span className="font-medium">{showTransactionDetail.concept || '-'}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-zinc-500">Fecha</span>
                  <span className="font-medium">{formatDate(showTransactionDetail.created_at)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-zinc-500">Tipo</span>
                  <span className="font-medium capitalize">{showTransactionDetail.transaction_type}</span>
                </div>
                {showTransactionDetail.to_name && (
                  <div className="py-3 flex justify-between">
                    <span className="text-zinc-500">Beneficiario</span>
                    <span className="font-medium">{showTransactionDetail.to_name}</span>
                  </div>
                )}
                <div className="py-3 flex justify-between">
                  <span className="text-zinc-500">ID Transacción</span>
                  <span className="font-mono text-sm">{showTransactionDetail.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { id: 'home', label: 'Inicio', icon: Home },
            { id: 'accounts', label: 'Cuentas', icon: Wallet },
            { id: 'transfers', label: 'Enviar', icon: Send },
            { id: 'cards', label: 'Tarjetas', icon: CreditCard },
            { id: 'receipts', label: 'Más', icon: MoreHorizontal },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'transfers') setShowTransfer(true);
                else setActiveTab(item.id);
              }}
              className={`flex flex-col items-center py-2 rounded-lg ${
                activeTab === item.id ? 'text-blue-600' : 'text-zinc-500'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ManoBank;
