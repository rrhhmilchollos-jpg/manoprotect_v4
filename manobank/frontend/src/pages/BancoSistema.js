import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Landmark, Users, CreditCard, FileText, Shield, Settings, LogOut,
  AlertTriangle, TrendingUp, Clock, ChevronRight, Search, Bell
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BancoSistema = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({});
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/banco/dashboard`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        navigate('/banco');
        return;
      }
      
      const data = await response.json();
      setEmployee(data.employee);
      setStats(data.stats || {});
      setFraudAlerts(data.recent_fraud_alerts || []);
    } catch (error) {
      console.error('Error:', error);
      navigate('/banco');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/banco');
  };

  const menuItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
    { id: 'customers', icon: Users, label: 'Clientes' },
    { id: 'accounts', icon: CreditCard, label: 'Cuentas' },
    { id: 'kyc', icon: FileText, label: 'KYC Pendiente' },
    { id: 'fraud', icon: Shield, label: 'Alertas Fraude' },
    { id: 'settings', icon: Settings, label: 'Configuración' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold block">ManoBank</span>
              <span className="text-xs text-slate-400">Sistema Interno</span>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="p-4 border-b border-slate-700">
          <p className="font-medium text-sm">{employee?.name || 'Empleado'}</p>
          <p className="text-xs text-slate-400">{employee?.role || 'Usuario'}</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.id === 'fraud' && fraudAlerts.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {fraudAlerts.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente, cuenta, DNI..."
                className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-6 h-6" />
              {fraudAlerts.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Clientes', value: stats.total_customers || 0, icon: Users, color: 'bg-blue-500' },
                  { label: 'Cuentas', value: stats.total_accounts || 0, icon: CreditCard, color: 'bg-emerald-500' },
                  { label: 'KYC Pendiente', value: stats.pending_kyc || 0, icon: Clock, color: 'bg-amber-500' },
                  { label: 'Alertas Fraude', value: stats.fraud_alerts || 0, icon: AlertTriangle, color: 'bg-red-500' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Fraud Alerts from ManoProtect */}
              {fraudAlerts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-lg font-bold text-gray-900">
                      Alertas de ManoProtect
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    {fraudAlerts.map((alert, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">{alert.title || 'Actividad sospechosa'}</p>
                            <p className="text-sm text-red-700">{alert.description || 'Se requiere revisión'}</p>
                          </div>
                        </div>
                        <button className="text-red-600 font-medium text-sm hover:underline">
                          Revisar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ManoProtect Integration */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Integración ManoProtect Activa</h3>
                    <p className="text-indigo-200">
                      Todas las transacciones son verificadas en tiempo real contra la base de datos de fraudes
                    </p>
                  </div>
                  <a 
                    href={process.env.REACT_APP_MANOPROTECT_URL || 'https://manoprotect.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                  >
                    Ir a ManoProtect
                  </a>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {menuItems.find(m => m.id === activeTab)?.icon && 
                  React.createElement(menuItems.find(m => m.id === activeTab).icon, { className: "w-8 h-8 text-gray-400" })
                }
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500">
                Esta sección estará disponible próximamente
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BancoSistema;
