import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Landmark, Home, CreditCard, Send, History, Settings, LogOut,
  Shield, AlertTriangle, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manobank/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setFraudAlerts(data.fraud_alerts || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoBank</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:block">
                Hola, {user?.name || 'Usuario'}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Alerta de Seguridad</h3>
              <p className="text-red-700 text-sm mt-1">
                Se han detectado {fraudAlerts.length} actividad(es) sospechosa(s). 
                Revisa tus últimas transacciones.
              </p>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-blue-100">Saldo Total</p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-blue-200 hover:text-white"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-4xl font-bold mb-6">
            {showBalance ? `${totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : '••••••'}
          </p>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
              <Send className="w-5 h-5" />
              Transferir
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Ingresar
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: CreditCard, label: 'Tarjetas', color: 'bg-purple-100 text-purple-600' },
            { icon: History, label: 'Historial', color: 'bg-emerald-100 text-emerald-600' },
            { icon: Shield, label: 'Seguridad', color: 'bg-blue-100 text-blue-600' },
            { icon: Settings, label: 'Ajustes', color: 'bg-gray-100 text-gray-600' },
          ].map((action, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-gray-700 font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Cuentas</h2>
          
          {accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{account.name || 'Cuenta Principal'}</p>
                      <p className="text-sm text-gray-500">{account.iban || 'ES00 0000 0000 00 0000000000'}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {showBalance 
                      ? `${(account.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
                      : '••••••'
                    }
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes cuentas todavía</p>
              <button className="mt-4 text-blue-600 font-medium">
                + Abrir nueva cuenta
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Últimos Movimientos</h2>
          
          <div className="space-y-3">
            {/* Placeholder transactions */}
            {[
              { type: 'income', name: 'Nómina', amount: 2150.00, date: 'Hoy' },
              { type: 'expense', name: 'Supermercado', amount: -45.80, date: 'Ayer' },
              { type: 'expense', name: 'Netflix', amount: -12.99, date: '15 Ene' },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'income' 
                      ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      : <ArrowUpRight className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.name}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </p>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
            Ver todo el historial
          </button>
        </div>

        {/* ManoProtect Badge */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-indigo-900">Cuenta protegida por ManoProtect</p>
            <p className="text-sm text-indigo-700">
              Todas tus transacciones son verificadas en tiempo real
            </p>
          </div>
          <a 
            href={process.env.REACT_APP_MANOPROTECT_URL || 'https://manoprotect.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium text-sm"
          >
            Más info →
          </a>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
