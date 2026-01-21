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
  ArrowRight, MoreHorizontal, Banknote, RefreshCw
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
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch accounts
      const accRes = await fetch(`${API_URL}/api/manobank/accounts`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const accData = await accRes.json();
      setAccounts(accData.accounts || []);
      
      // Calculate total balance
      const total = (accData.accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
      setTotalBalance(total);

      // Fetch cards
      const cardsRes = await fetch(`${API_URL}/api/manobank/my-cards`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const cardsData = await cardsRes.json();
      setCards(cardsData.cards || []);

      // Fetch transactions
      const txRes = await fetch(`${API_URL}/api/manobank/transactions?limit=20`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);

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

  // Menu items
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'cuentas', label: 'Mis Cuentas', icon: Wallet },
    { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
    { id: 'transferencias', label: 'Transferencias', icon: Send },
    { id: 'movimientos', label: 'Movimientos', icon: Receipt },
    { id: 'productos', label: 'Productos', icon: PiggyBank },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Left - Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
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

          {/* Center - Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar operaciones, productos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right - Actions */}
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
                title="Cerrar sesión"
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
          transition-all duration-300 overflow-hidden
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
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom section */}
          {sidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Sesión segura</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          {/* Welcome Banner */}
          {activeSection === 'inicio' && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Hola, {user?.name?.split(' ')[0] || 'Cliente'} 👋
              </h2>
              <p className="text-gray-500">Aquí tienes el resumen de tus finanzas</p>
            </div>
          )}

          {/* Quick Actions Bar */}
          {activeSection === 'inicio' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Send, label: 'Transferir', color: 'bg-blue-500', onClick: () => setActiveSection('transferencias') },
                { icon: QrCode, label: 'Bizum', color: 'bg-purple-500' },
                { icon: Receipt, label: 'Recibos', color: 'bg-amber-500' },
                { icon: Plus, label: 'Nuevo producto', color: 'bg-green-500' }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Main Grid */}
          {activeSection === 'inicio' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Balance & Accounts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-blue-100 text-sm">Posición global</p>
                        <div className="flex items-center gap-3 mt-1">
                          <h3 className="text-4xl font-bold">
                            {showBalance ? formatCurrency(totalBalance) : '••••••'}
                          </h3>
                          <button 
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-lg">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                      <div>
                        <p className="text-xs text-blue-200">Cuentas</p>
                        <p className="text-lg font-semibold">{accounts.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-200">Tarjetas</p>
                        <p className="text-lg font-semibold">{cards.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-200">Este mes</p>
                        <p className="text-lg font-semibold text-green-300">+2.5%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accounts List */}
                <div className="bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Mis Cuentas</h3>
                    <button 
                      onClick={() => setActiveSection('cuentas')}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {accounts.slice(0, 3).map((account) => (
                      <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              account.type === 'ahorro' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {account.type === 'ahorro' ? (
                                <PiggyBank className={`w-6 h-6 ${account.type === 'ahorro' ? 'text-green-600' : 'text-blue-600'}`} />
                              ) : (
                                <Wallet className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {account.type === 'ahorro' ? 'Cuenta Ahorro' : 
                                 account.type === 'nomina' ? 'Cuenta Nómina' : 'Cuenta Corriente'}
                              </p>
                              <p className="text-sm text-gray-500">{formatIBAN(account.iban)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {showBalance ? formatCurrency(account.balance) : '••••'}
                            </p>
                            <p className="text-xs text-gray-400">Disponible</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {accounts.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No tienes cuentas activas</p>
                        <Button className="mt-4" size="sm">Abrir cuenta</Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Últimos movimientos</h3>
                    <button 
                      onClick={() => setActiveSection('movimientos')}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {transactions.slice(0, 5).map((tx, i) => (
                      <div key={tx.id || i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'income' || tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'income' || tx.amount > 0 ? (
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
                        <p className={`font-semibold ${
                          tx.type === 'income' || tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.type === 'income' || tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay movimientos recientes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Cards & Shortcuts */}
              <div className="space-y-6">
                {/* Active Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Mi Tarjeta</h3>
                    <button 
                      onClick={() => setActiveSection('tarjetas')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Gestionar
                    </button>
                  </div>
                  
                  {cards.length > 0 ? (
                    <div className={`aspect-[1.6/1] rounded-2xl p-5 text-white relative overflow-hidden ${
                      cards[0]?.card_type?.includes('gold') ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' :
                      cards[0]?.card_type?.includes('platinum') ? 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600' :
                      cards[0]?.card_type?.includes('mastercard') ? 'bg-gradient-to-br from-red-500 via-orange-500 to-red-600' :
                      'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'
                    }`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium opacity-80">ManoBank</span>
                        <span className="text-xs font-bold">{cards[0]?.card_brand || 'VISA'}</span>
                      </div>
                      
                      {/* Chip */}
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded mb-3">
                        <div className="w-6 h-5 border border-yellow-600/30 rounded-sm m-0.5" />
                      </div>
                      
                      <p className="font-mono text-lg tracking-wider mb-3">
                        {cards[0]?.card_number_masked || '•••• •••• •••• ••••'}
                      </p>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] opacity-70">TITULAR</p>
                          <p className="text-xs font-medium">{cards[0]?.holder_name || user?.name?.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] opacity-70">VÁLIDA</p>
                          <p className="text-xs font-medium">{cards[0]?.expiry || 'MM/AA'}</p>
                        </div>
                      </div>
                      
                      <Wifi className="absolute bottom-4 right-4 w-5 h-5 opacity-50" />
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] rounded-2xl bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Sin tarjetas</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Accesos rápidos</h3>
                  <div className="space-y-2">
                    {[
                      { icon: FileText, label: 'Extractos', desc: 'Descarga tus movimientos' },
                      { icon: Lock, label: 'Seguridad', desc: 'Gestiona tus claves' },
                      { icon: Phone, label: 'Contacto', desc: '900 123 456' },
                    ].map((item, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Status */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Cuenta protegida</p>
                      <p className="text-sm text-green-600">Todas las medidas de seguridad activas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cuentas Section */}
          {activeSection === 'cuentas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Cuentas</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva cuenta
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          account.type === 'ahorro' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Wallet className={`w-6 h-6 ${account.type === 'ahorro' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {account.type === 'ahorro' ? 'Cuenta Ahorro' : 'Cuenta Corriente'}
                          </p>
                          <p className="text-sm text-gray-500">{account.account_number}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Saldo disponible</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {showBalance ? formatCurrency(account.balance) : '••••••'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 flex-1 font-mono">{formatIBAN(account.iban)}</p>
                      <button 
                        onClick={() => copyToClipboard(account.iban, 'IBAN')}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tarjetas Section */}
          {activeSection === 'tarjetas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Tarjetas</h2>
                <Button variant="outline">Solicitar tarjeta</Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Card Visual */}
                    <div className={`aspect-[1.6/1] p-5 text-white relative ${
                      card.card_type?.includes('gold') ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' :
                      card.card_type?.includes('platinum') ? 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600' :
                      card.card_type?.includes('mastercard') ? 'bg-gradient-to-br from-red-500 via-orange-500 to-red-600' :
                      'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'
                    }`}>
                      <div className="flex justify-between mb-4">
                        <span className="font-bold">ManoBank</span>
                        <span className="text-sm font-bold">{card.card_brand}</span>
                      </div>
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded mb-4" />
                      <p className="font-mono tracking-wider mb-4">{card.card_number_masked}</p>
                      <div className="flex justify-between text-sm">
                        <span>{card.holder_name}</span>
                        <span>{card.expiry}</span>
                      </div>
                    </div>
                    
                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">Estado</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          card.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {card.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedCard(card)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transferencias Section */}
          {activeSection === 'transferencias' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Nueva Transferencia</h2>
              
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuenta origen
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.type} - {formatIBAN(acc.iban)} ({formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN destino
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="ES00 0000 0000 0000 0000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beneficiario
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del beneficiario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importe
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 pr-12"
                        placeholder="0,00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concepto
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Concepto de la transferencia"
                    />
                  </div>

                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-5 h-5 mr-2" />
                    Realizar transferencia
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Movimientos Section */}
          {activeSection === 'movimientos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Movimientos</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
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
                          {tx.amount > 0 ? (
                            <ArrowDownLeft className="w-6 h-6 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description || tx.concept}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManoBankDashboard;
