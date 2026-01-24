import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Building2, CreditCard, Send, ArrowUpRight, ArrowDownLeft,
  Bell, Eye, EyeOff, Settings, Wallet, Copy, ChevronRight,
  TrendingUp, Calendar, PiggyBank, Receipt, FileText, Shield,
  Smartphone, HelpCircle, LogOut, Menu, X, Phone, Mail,
  Plus, Search, Filter, Download, QrCode, Wifi, Globe,
  Lock, Key, User, Home, Clock, CheckCircle, AlertCircle,
  ArrowRight, MoreHorizontal, Banknote, RefreshCw, Car,
  Building, Umbrella, ShoppingBag, Zap, Gift, Heart,
  Landmark, CreditCard as CardIcon, DollarSign, Euro,
  ChevronLeft, ExternalLink, Info
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ManoBankDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('inicio');
  const [showBalance, setShowBalance] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(null);
  
  // Account detail state
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [loadingAccountTx, setLoadingAccountTx] = useState(false);

  // Payment form state
  const [paymentType, setPaymentType] = useState('transferencia');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    recipient: '',
    iban: '',
    phone: '',
    concept: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch transactions for a specific account
  const fetchAccountTransactions = async (accountId) => {
    setLoadingAccountTx(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/manobank/accounts/${accountId}/transactions?limit=50`, {
        credentials: 'include', headers
      });
      if (res.ok) {
        const data = await res.json();
        setAccountTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching account transactions:', error);
    } finally {
      setLoadingAccountTx(false);
    }
  };

  // Open account detail
  const openAccountDetail = (account) => {
    setSelectedAccount(account);
    setActiveSection('cuenta-detalle');
    fetchAccountTransactions(account.id);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Fetch accounts
      const accRes = await fetch(`${API_URL}/api/manobank/accounts`, {
        credentials: 'include', headers
      });
      const accData = await accRes.json();
      setAccounts(accData.accounts || []);
      const total = (accData.accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
      setTotalBalance(total);

      // Fetch cards
      const cardsRes = await fetch(`${API_URL}/api/manobank/my-cards`, {
        credentials: 'include', headers
      });
      const cardsData = await cardsRes.json();
      setCards(cardsData.cards || []);

      // Fetch transactions
      const txRes = await fetch(`${API_URL}/api/manobank/transactions?limit=30`, {
        credentials: 'include', headers
      });
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);

      // Fetch loans
      try {
        const loansRes = await fetch(`${API_URL}/api/manobank/loans`, {
          credentials: 'include', headers
        });
        const loansData = await loansRes.json();
        setLoans(loansData.loans || []);
      } catch (e) {
        console.log('No loans endpoint');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatIBAN = (iban) => {
    if (!iban) return 'ES00 0000 0000 0000 0000 0000';
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login-seguro');
  };

  const fetchCardDetails = async (cardId) => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/my-cards/${cardId}/details`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setShowCardDetails(data.card);
      }
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    toast.success(`${paymentType === 'bizum' ? 'Bizum' : 'Transferencia'} enviada correctamente`);
    setPaymentData({ amount: '', recipient: '', iban: '', phone: '', concept: '' });
  };

  // Sidebar menu items
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cuentas', label: 'Mis Cuentas', icon: Wallet },
    { id: 'tarjetas', label: 'Mis Tarjetas', icon: CreditCard },
    { id: 'pagos', label: 'Pagos', icon: Send },
    { id: 'movimientos', label: 'Movimientos', icon: Receipt },
    { id: 'productos', label: 'Mis Productos', icon: FileText },
    { id: 'ofertas', label: 'Ofertas', icon: Gift },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  // Marketing offers
  const marketingOffers = [
    { icon: Car, title: 'Renting de Vehículos', desc: 'Desde 199€/mes todo incluido', color: 'bg-blue-500', tag: 'NUEVO' },
    { icon: Smartphone, title: 'Telefonía Móvil', desc: 'Tarifas exclusivas clientes ManoBank', color: 'bg-purple-500', tag: 'OFERTA' },
    { icon: Umbrella, title: 'Seguros', desc: 'Protege lo que más importa', color: 'bg-green-500' },
    { icon: Building, title: 'Hipotecas', desc: 'Desde Euribor + 0,49%', color: 'bg-amber-500', tag: 'DESTACADO' },
  ];

  // Recent completed operations (shows from transactions if available, otherwise simulated examples)
  const recentOperations = transactions.length > 0 
    ? transactions.slice(0, 4).map((tx, i) => ({
        id: tx.id || i,
        type: tx.type || 'operacion',
        desc: tx.description || tx.concept || 'Operación bancaria',
        amount: tx.amount,
        date: tx.created_at ? new Date(tx.created_at).toLocaleDateString('es-ES') : 'Hoy',
        status: 'completed'
      }))
    : [
        { id: 1, type: 'transferencia', desc: 'Transferencia a María García', amount: -250, date: '20/01/2026', status: 'completed' },
        { id: 2, type: 'ingreso', desc: 'Nómina Enero 2026', amount: 2450, date: '15/01/2026', status: 'completed' },
        { id: 3, type: 'recibo', desc: 'Recibo Luz - Iberdrola', amount: -89.50, date: '10/01/2026', status: 'completed' },
        { id: 4, type: 'bizum', desc: 'Bizum recibido - Carlos', amount: 25, date: '08/01/2026', status: 'completed' },
      ];

  const getCardGradient = (cardType) => {
    if (cardType?.includes('gold')) return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600';
    if (cardType?.includes('platinum')) return 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600';
    if (cardType?.includes('mastercard')) return 'bg-gradient-to-br from-red-500 via-orange-500 to-red-600';
    if (cardType?.includes('visa')) return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
    if (cardType === 'business') return 'bg-gradient-to-br from-zinc-700 to-zinc-900';
    return 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900">ManoBank</h1>
                <p className="text-xs text-gray-500">Banca Personal</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar operaciones..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Cliente'}</p>
                <p className="text-xs text-gray-500">Último acceso: Hoy</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-64px)] bg-white border-r border-gray-100
          transition-all duration-300 overflow-y-auto
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {item.id === 'ofertas' && (
                  <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">3</span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Contact */}
          <div className="p-4 mx-4 mb-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-medium text-blue-800">¿Necesitas ayuda?</p>
            <p className="text-xs text-blue-600 mt-1">900 123 456</p>
            <p className="text-xs text-blue-600">Lunes a Viernes 8:00-22:00</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          
          {/* ==================== INICIO ==================== */}
          {activeSection === 'inicio' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hola, {user?.name?.split(' ')[0] || 'Cliente'} 👋
                  </h2>
                  <p className="text-gray-500">Resumen de tu posición financiera</p>
                </div>
                <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-gray-100 rounded-lg">
                  {showBalance ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>

              {/* Position Summary - Moved here below greeting */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Posición Global</p>
                    <p className="text-4xl font-bold">
                      {showBalance ? formatCurrency(totalBalance) : '••••••'}
                    </p>
                    <div className="flex items-center gap-2 text-green-300 text-sm mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>+2.5% respecto al mes anterior</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
                      <p className="text-blue-200 text-xs mb-1">Cuentas</p>
                      <p className="text-xl font-bold">{accounts.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
                      <p className="text-blue-200 text-xs mb-1">Tarjetas</p>
                      <p className="text-xl font-bold">{cards.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[100px]">
                      <p className="text-blue-200 text-xs mb-1">Productos</p>
                      <p className="text-xl font-bold">4</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Accounts Summary */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        Mis Cuentas
                      </h3>
                      <button onClick={() => setActiveSection('cuentas')} className="text-sm text-blue-600 hover:underline">
                        Ver todas
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {accounts.slice(0, 2).map((account) => (
                        <button 
                          key={account.id} 
                          onClick={() => openAccountDetail(account)}
                          className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Landmark className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{account.type === 'ahorro' ? 'Cuenta Ahorro' : 'Cuenta Corriente'}</p>
                              <p className="text-sm text-gray-500">{formatIBAN(account.iban)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">
                                {showBalance ? formatCurrency(account.balance) : '••••••'}
                              </p>
                              <p className="text-xs text-blue-600">Ver detalle →</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cards Summary - Solo muestra resumen, tarjetas visibles en "Mis Tarjetas" */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Mis Tarjetas</h3>
                          <p className="text-sm text-gray-500">
                            {cards.length} tarjeta{cards.length !== 1 ? 's' : ''} activa{cards.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveSection('tarjetas')} 
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
                      >
                        <span className="text-sm font-medium">Ver tarjetas</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-green-600" />
                        Últimos Movimientos
                      </h3>
                      <button onClick={() => setActiveSection('movimientos')} className="text-sm text-blue-600 hover:underline">
                        Ver todos
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {transactions.slice(0, 5).map((tx, i) => (
                        <div key={tx.id || i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {tx.amount > 0 ? (
                                <ArrowDownLeft className="w-5 h-5 text-green-600" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{tx.description || tx.concept || 'Operación'}</p>
                              <p className="text-xs text-gray-500">
                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString('es-ES') : 'Hoy'}
                              </p>
                            </div>
                          </div>
                          <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p>No hay movimientos</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Completed Operations */}
                  {recentOperations.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Operaciones Realizadas</h3>
                        </div>
                        <button onClick={() => setActiveSection('movimientos')} className="text-sm text-blue-600 hover:underline">
                          Ver todas
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {recentOperations.map((op) => (
                          <div key={op.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                op.amount > 0 ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {op.amount > 0 ? (
                                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                ) : (
                                  <ArrowUpRight className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{op.desc}</p>
                                <p className="text-sm text-gray-500">{op.date}</p>
                              </div>
                            </div>
                            <p className={`font-semibold ${op.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {op.amount > 0 ? '+' : ''}{formatCurrency(op.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products - Loans, Insurance */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Mis Productos Contratados
                      </h3>
                      <button onClick={() => setActiveSection('productos')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Ver todos <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 grid sm:grid-cols-2 gap-4">
                      {/* Simulated products with click actions */}
                      <button 
                        onClick={() => {
                          setActiveSection('productos');
                          toast.info('Consultando detalles de tu hipoteca...');
                        }}
                        className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800">Hipoteca Variable</p>
                            <p className="text-xs text-green-600">Euribor + 0,69%</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-green-800">142.350,00 €</p>
                        <p className="text-xs text-green-600 mt-1">Pendiente de pago</p>
                        <div className="mt-3 pt-3 border-t border-green-200 flex justify-between text-xs">
                          <span className="text-green-600">Cuota: 685€/mes</span>
                          <span className="text-green-500">Ver detalles →</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveSection('productos');
                          toast.info('Consultando tu seguro de hogar...');
                        }}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Umbrella className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">Seguro Hogar</p>
                            <p className="text-xs text-blue-600">Cobertura total</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">320,00 €/año</p>
                        <p className="text-xs text-blue-600 mt-1">Próxima renovación: Mar 2026</p>
                        <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-xs">
                          <span className="text-blue-600">Cobertura: 150.000€</span>
                          <span className="text-blue-500">Ver póliza →</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveSection('productos');
                          toast.info('Consultando tu préstamo personal...');
                        }}
                        className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <PiggyBank className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-800">Préstamo Personal</p>
                            <p className="text-xs text-purple-600">TAE 5,90%</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">8.500,00 €</p>
                        <p className="text-xs text-purple-600 mt-1">Cuota: 285€/mes</p>
                        <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between text-xs">
                          <span className="text-purple-600">Quedan 30 cuotas</span>
                          <span className="text-purple-500">Amortizar →</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveSection('productos');
                          toast.info('Consultando tu seguro de coche...');
                        }}
                        className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-800">Seguro Coche</p>
                            <p className="text-xs text-amber-600">Todo riesgo</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-800">580,00 €/año</p>
                        <p className="text-xs text-amber-600 mt-1">Vence: Dic 2026</p>
                        <div className="mt-3 pt-3 border-t border-amber-200 flex justify-between text-xs">
                          <span className="text-amber-600">Matrícula: 1234ABC</span>
                          <span className="text-amber-500">Dar parte →</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Quick Actions & Marketing */}
                <div className="space-y-6">
                  {/* Quick Pay Actions */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveSection('pagos')}
                        className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Send className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Transferir</span>
                      </button>
                      <button
                        onClick={() => { setActiveSection('pagos'); setPaymentType('bizum'); }}
                        className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                      >
                        <QrCode className="w-6 h-6 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Bizum</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        <Receipt className="w-6 h-6 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Recibos</span>
                      </button>
                      <button 
                        onClick={() => setActiveSection('productos')}
                        className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Contratar</span>
                      </button>
                    </div>
                  </div>

                  {/* Marketing Offers */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-pink-500" />
                        Ofertas Exclusivas para Ti
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Ofertas personalizadas basadas en tu perfil</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {marketingOffers.map((offer, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            setActiveSection('ofertas');
                            toast.success(`Abriendo oferta: ${offer.title}`);
                          }}
                          className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className={`w-12 h-12 ${offer.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <offer.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{offer.title}</p>
                              {offer.tag && (
                                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-medium animate-pulse">
                                  {offer.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{offer.desc}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-t">
                      <button 
                        onClick={() => setActiveSection('ofertas')}
                        className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2"
                      >
                        Ver todas las ofertas
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Cuenta Protegida</p>
                        <p className="text-sm text-green-600">Seguridad activada</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PAGOS ==================== */}
          {activeSection === 'pagos' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Realizar Pago</h2>

              {/* Payment Type Tabs */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                  {[
                    { id: 'transferencia', label: 'Transferencia', icon: Send },
                    { id: 'bizum', label: 'Bizum', icon: QrCode },
                    { id: 'programada', label: 'Programada', icon: Calendar },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentType(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                        paymentType === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handlePayment} className="p-6 space-y-5">
                  {/* From Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta origen</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50">
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.type} - {formatIBAN(acc.iban)} ({formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipient - Different based on payment type */}
                  {paymentType === 'bizum' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono destinatario</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={paymentData.phone}
                          onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="+34 600 000 000"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IBAN destinatario</label>
                        <input
                          type="text"
                          value={paymentData.iban}
                          onChange={(e) => setPaymentData({...paymentData, iban: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="ES00 0000 0000 0000 0000 0000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiario</label>
                        <input
                          type="text"
                          value={paymentData.recipient}
                          onChange={(e) => setPaymentData({...paymentData, recipient: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del beneficiario"
                        />
                      </div>
                    </>
                  )}

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Importe</label>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xl font-medium"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Concept */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
                    <input
                      type="text"
                      value={paymentData.concept}
                      onChange={(e) => setPaymentData({...paymentData, concept: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Concepto del pago"
                    />
                  </div>

                  {/* Scheduled Date */}
                  {paymentType === 'programada' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de ejecución</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg">
                    <Send className="w-5 h-5 mr-2" />
                    {paymentType === 'bizum' ? 'Enviar Bizum' : 
                     paymentType === 'programada' ? 'Programar Transferencia' : 
                     'Realizar Transferencia'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ==================== CUENTAS ==================== */}
          {activeSection === 'cuentas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Cuentas</h2>
                <Button><Plus className="w-4 h-4 mr-2" />Nueva cuenta</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <button 
                    key={account.id} 
                    onClick={() => openAccountDetail(account)}
                    className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Landmark className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-gray-900">{account.type === 'ahorro' ? 'Cuenta Ahorro' : 'Cuenta Corriente'}</p>
                          <p className="text-sm text-gray-500">{account.account_number}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-4">{showBalance ? formatCurrency(account.balance) : '••••••'}</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 flex-1 font-mono">{formatIBAN(account.iban)}</p>
                      <span className="text-xs text-blue-600 font-medium">Ver movimientos →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================== DETALLE DE CUENTA ==================== */}
          {activeSection === 'cuenta-detalle' && selectedAccount && (
            <div className="space-y-6">
              {/* Header with back button */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedAccount(null); setActiveSection('cuentas'); }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedAccount.type === 'ahorro' ? 'Cuenta Ahorro' : 'Cuenta Corriente'}
                  </h2>
                  <p className="text-gray-500">{selectedAccount.account_number}</p>
                </div>
              </div>

              {/* Account Balance Card */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
                <p className="text-blue-200 text-sm mb-2">Saldo disponible</p>
                <p className="text-5xl font-bold mb-4">
                  {showBalance ? formatCurrency(selectedAccount.balance) : '••••••'}
                </p>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Actualizado: {new Date().toLocaleString('es-ES')}</span>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Datos de la Cuenta
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* IBAN */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">IBAN</p>
                      <p className="font-mono text-lg font-medium text-gray-900">{formatIBAN(selectedAccount.iban)}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(selectedAccount.iban, 'IBAN')}
                      className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                    >
                      <Copy className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  
                  {/* BIC/SWIFT */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">BIC / SWIFT</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono font-medium text-gray-900">{selectedAccount.swift_bic || selectedAccount.bic || 'MNBKESMMXXX'}</p>
                        <button 
                          onClick={() => copyToClipboard(selectedAccount.swift_bic || selectedAccount.bic || 'MNBKESMMXXX', 'BIC')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Nº de Cuenta</p>
                      <p className="font-mono font-medium text-gray-900">{selectedAccount.account_number}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Tipo</p>
                      <p className="font-medium text-gray-900">{selectedAccount.type === 'ahorro' ? 'Ahorro' : 'Corriente'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Divisa</p>
                      <p className="font-medium text-gray-900">{selectedAccount.currency || 'EUR'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 mb-1">Estado</p>
                      <p className={`font-medium ${selectedAccount.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedAccount.status === 'active' ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveSection('pagos')}
                  className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Transferir</span>
                </button>
                <button 
                  onClick={() => { setActiveSection('pagos'); setPaymentType('bizum'); }}
                  className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-purple-200 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Bizum</span>
                </button>
                <button className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-green-200 transition-all flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Extracto</span>
                </button>
                <button className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-amber-200 transition-all flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Certificado</span>
                </button>
              </div>

              {/* Transactions */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-600" />
                    Últimos Movimientos
                  </h3>
                  <button 
                    onClick={() => fetchAccountTransactions(selectedAccount.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingAccountTx ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {loadingAccountTx ? (
                    <div className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                      <p>Cargando movimientos...</p>
                    </div>
                  ) : accountTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay movimientos en esta cuenta</p>
                    </div>
                  ) : (
                    accountTransactions.map((tx, idx) => (
                      <div key={tx.id || idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.amount > 0 ? 
                              <ArrowDownLeft className="w-6 h-6 text-green-600" /> :
                              <ArrowUpRight className="w-6 h-6 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tx.description || tx.concept || 'Movimiento'}</p>
                            <p className="text-sm text-gray-500">
                              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              }) : 'Sin fecha'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Saldo: {formatCurrency(tx.balance_after || 0)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {accountTransactions.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
                      Ver todos los movimientos
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TARJETAS ==================== */}
          {activeSection === 'tarjetas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Tarjetas</h2>
                <Button variant="outline">Solicitar tarjeta</Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className={`aspect-[1.6/1] p-5 text-white relative overflow-hidden ${getCardGradient(card.card_type)}`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="flex justify-between mb-3">
                        <span className="font-bold">ManoBank</span>
                        <span className="text-sm font-bold">{card.card_brand}</span>
                      </div>
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded mb-3" />
                      <p className="font-mono tracking-wider mb-3">{card.card_number_masked}</p>
                      <div className="flex justify-between text-sm">
                        <span>{card.holder_name}</span>
                        <span>{card.expiry}</span>
                      </div>
                      <Wifi className="absolute bottom-4 right-4 w-5 h-5 opacity-60" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500">Estado</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          card.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {card.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => fetchCardDetails(card.id)}>
                        Ver detalles completos
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MOVIMIENTOS ==================== */}
          {activeSection === 'movimientos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Movimientos</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="divide-y">
                  {transactions.map((tx, i) => (
                    <div key={tx.id || i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.amount > 0 ? <ArrowDownLeft className="w-6 h-6 text-green-600" /> : <ArrowUpRight className="w-6 h-6 text-red-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description || tx.concept}</p>
                          <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PRODUCTOS ==================== */}
          {activeSection === 'productos' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Productos</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <Building className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Hipoteca Variable</p>
                      <p className="text-sm text-gray-500">Ref: HIP-2024-001</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Capital pendiente</span><span className="font-semibold">142.350,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cuota mensual</span><span className="font-semibold">685,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tipo interés</span><span className="font-semibold">Euribor + 0,69%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Próximo pago</span><span className="font-semibold">01/02/2026</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Préstamo Personal</p>
                      <p className="text-sm text-gray-500">Ref: PRE-2024-045</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Capital pendiente</span><span className="font-semibold">8.500,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cuota mensual</span><span className="font-semibold">285,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">TAE</span><span className="font-semibold">5,90%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cuotas restantes</span><span className="font-semibold">32</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Umbrella className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Seguro Hogar Plus</p>
                      <p className="text-sm text-gray-500">Póliza: SH-2024-789</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Prima anual</span><span className="font-semibold">320,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cobertura</span><span className="font-semibold">Total</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Vencimiento</span><span className="font-semibold">15/03/2026</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Car className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Seguro Auto</p>
                      <p className="text-sm text-gray-500">Póliza: SA-2024-456</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Prima anual</span><span className="font-semibold">580,00 €</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tipo</span><span className="font-semibold">Todo Riesgo</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Vencimiento</span><span className="font-semibold">20/12/2026</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== OFERTAS ==================== */}
          {activeSection === 'ofertas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Ofertas Exclusivas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Car, title: 'Renting de Vehículos', desc: 'Conduce el coche que quieras desde 199€/mes. Mantenimiento, seguro y asistencia incluidos.', color: 'bg-blue-500', cta: 'Solicitar info' },
                  { icon: Smartphone, title: 'Telefonía Móvil ManoBank', desc: 'Tarifas exclusivas para clientes. Fibra + Móvil desde 29,90€/mes.', color: 'bg-purple-500', cta: 'Ver tarifas' },
                  { icon: Umbrella, title: 'Seguros ManoBank', desc: 'Hogar, vida, salud y auto. 20% descuento el primer año.', color: 'bg-green-500', cta: 'Calcular precio' },
                  { icon: Building, title: 'Hipoteca Fija', desc: 'Desde 2,49% TIN fijo. Sin comisiones de apertura hasta el 31/03.', color: 'bg-amber-500', cta: 'Simular' },
                  { icon: PiggyBank, title: 'Préstamo Instantáneo', desc: 'Hasta 30.000€ en 24h. Sin papeleos, 100% online.', color: 'bg-red-500', cta: 'Solicitar' },
                  { icon: Gift, title: 'Plan Amigo', desc: 'Trae un amigo y gana 50€. Él también gana 50€.', color: 'bg-pink-500', cta: 'Invitar' },
                ].map((offer, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className={`h-32 ${offer.color} flex items-center justify-center`}>
                      <offer.icon className="w-16 h-16 text-white/80" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
                      <p className="text-gray-600 mb-4">{offer.desc}</p>
                      <Button className="w-full">{offer.cta}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== AJUSTES ==================== */}
          {activeSection === 'ajustes' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Ajustes</h2>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y">
                {[
                  { icon: User, label: 'Datos personales', desc: 'Actualiza tu información' },
                  { icon: Lock, label: 'Seguridad', desc: 'Contraseña y verificación' },
                  { icon: Bell, label: 'Notificaciones', desc: 'Alertas y avisos' },
                  { icon: Globe, label: 'Preferencias', desc: 'Idioma y configuración' },
                  { icon: FileText, label: 'Documentos', desc: 'Contratos y extractos' },
                  { icon: HelpCircle, label: 'Ayuda', desc: 'FAQ y contacto' },
                ].map((item, i) => (
                  <button key={i} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-left">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Card Details Modal */}
      {showCardDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className={`p-6 text-white ${getCardGradient(showCardDetails.card_type)}`}>
              <div className="flex justify-between mb-4">
                <span className="font-bold">ManoBank</span>
                <span className="text-sm font-bold">{showCardDetails.card_brand}</span>
              </div>
              <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded mb-3" />
              <p className="font-mono text-xl tracking-widest mb-2">{showCardDetails.card_number_formatted}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div><p className="text-[10px] opacity-70">TITULAR</p><p className="text-sm">{showCardDetails.holder_name}</p></div>
                <div><p className="text-[10px] opacity-70">VÁLIDA</p><p className="font-medium">{showCardDetails.expiry}</p></div>
                <div><p className="text-[10px] opacity-70">CVV</p><p className="font-mono font-bold">{showCardDetails.cvv}</p></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">PIN</p>
                      <p className="text-2xl font-mono font-bold text-amber-900">{showCardDetails.pin}</p>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(showCardDetails.pin, 'PIN')} className="text-amber-600">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2">No compartas tu PIN</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Límite diario</p>
                  <p className="font-semibold">{formatCurrency(showCardDetails.daily_limit)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Límite mensual</p>
                  <p className="font-semibold">{formatCurrency(showCardDetails.monthly_limit)}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowCardDetails(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManoBankDashboard;
