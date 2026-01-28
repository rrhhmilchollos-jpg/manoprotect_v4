import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Landmark, Home, CreditCard, Send, History, Settings, LogOut,
  Shield, AlertTriangle, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff,
  Copy, Download, RefreshCw, X, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    from_account_id: '',
    destination_iban: '',
    destination_name: '',
    amount: '',
    concept: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);

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
        setTransactions(data.transactions || []);
        setFraudAlerts(data.fraud_alerts || []);
        setTotalBalance(data.total_balance || 0);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/transfers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferData,
          amount: parseFloat(transferData.amount)
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.warning) {
          toast.warning(data.warning);
        } else {
          toast.success('Transferencia realizada correctamente');
        }
        setShowTransferModal(false);
        setTransferData({
          from_account_id: '',
          destination_iban: '',
          destination_name: '',
          amount: '',
          concept: ''
        });
        fetchDashboard();
      } else {
        toast.error(data.detail || 'Error al realizar la transferencia');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setTransferLoading(false);
    }
  };

  const downloadCertificate = async (accountId) => {
    try {
      const response = await fetch(`${API_URL}/api/accounts/${accountId}/certificate`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado_${accountId}.pdf`;
        a.click();
        toast.success('Certificado descargado');
      } else {
        toast.error('Error al descargar el certificado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

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
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoBank</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={fetchDashboard}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <span className="text-gray-600 hidden sm:block">
                {user?.name || 'Usuario'}
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
            <button 
              onClick={() => {
                if (accounts.length > 0) {
                  setTransferData({ ...transferData, from_account_id: accounts[0].account_id });
                  setShowTransferModal(true);
                } else {
                  toast.error('No tienes cuentas activas');
                }
              }}
              className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Mis Cuentas</h2>
            <button className="text-blue-600 font-medium text-sm hover:underline">
              + Nueva cuenta
            </button>
          </div>
          
          {accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cuenta {account.account_type?.charAt(0).toUpperCase() + account.account_type?.slice(1)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{account.iban}</span>
                          <button 
                            onClick={() => copyToClipboard(account.iban?.replace(/\s/g, ''))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {showBalance 
                          ? `${(account.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
                          : '••••••'
                        }
                      </p>
                      <p className="text-xs text-gray-500">Disponible</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <button 
                      onClick={() => downloadCertificate(account.account_id)}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Certificado
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-sm text-gray-600 hover:underline">
                      Movimientos
                    </button>
                  </div>
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
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.amount > 0 
                        ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        : <ArrowUpRight className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description || 'Movimiento'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay movimientos recientes
            </div>
          )}

          {transactions.length > 0 && (
            <button className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
              Ver todo el historial
            </button>
          )}
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Nueva Transferencia</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta origen
                </label>
                <select
                  value={transferData.from_account_id}
                  onChange={(e) => setTransferData({ ...transferData, from_account_id: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.iban} - {acc.balance?.toLocaleString('es-ES')} €
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN destino
                </label>
                <input
                  type="text"
                  value={transferData.destination_iban}
                  onChange={(e) => setTransferData({ ...transferData, destination_iban: e.target.value })}
                  placeholder="ES00 0000 0000 00 0000000000"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del beneficiario
                </label>
                <input
                  type="text"
                  value={transferData.destination_name}
                  onChange={(e) => setTransferData({ ...transferData, destination_name: e.target.value })}
                  placeholder="Juan García López"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto (opcional)
                </label>
                <input
                  type="text"
                  value={transferData.concept}
                  onChange={(e) => setTransferData({ ...transferData, concept: e.target.value })}
                  placeholder="Transferencia"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl flex items-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="text-indigo-700">
                  Esta transferencia será verificada por ManoProtect
                </span>
              </div>

              <button
                type="submit"
                disabled={transferLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {transferLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Transferencia
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
