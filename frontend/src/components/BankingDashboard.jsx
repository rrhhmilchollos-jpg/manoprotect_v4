import { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, Plus, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, XCircle, Loader2, Shield, 
  Eye, RefreshCcw, Ban, Check, Clock, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BankingDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [connecting, setConnecting] = useState(false);
  const [supportedBanks, setSupportedBanks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load summary
      const summaryRes = await fetch(`${API}/banking/summary`, { credentials: 'include' });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
        setSupportedBanks(data.supported_banks || []);
      }

      // Load transactions
      const txRes = await fetch(`${API}/banking/transactions?days=30`, { credentials: 'include' });
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectBank = async () => {
    if (!selectedBank) {
      toast.error('Selecciona un banco');
      return;
    }

    setConnecting(true);
    try {
      const response = await fetch(`${API}/banking/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bank_name: selectedBank,
          account_type: accountType
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowConnectDialog(false);
        setSelectedBank('');
        loadData();
      } else {
        toast.error(data.error || 'Error al conectar cuenta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setConnecting(false);
    }
  };

  const handleTransaction = async (txId, action) => {
    try {
      const response = await fetch(`${API}/banking/transactions/${txId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al procesar transacción');
    }
  };

  const getRiskBadge = (riskScore, status) => {
    if (status === 'blocked') {
      return <Badge className="bg-red-500"><Ban className="w-3 h-3 mr-1" /> Bloqueada</Badge>;
    }
    if (status === 'approved') {
      return <Badge className="bg-emerald-500"><Check className="w-3 h-3 mr-1" /> Aprobada</Badge>;
    }
    if (status === 'flagged') {
      return <Badge className="bg-amber-500"><AlertTriangle className="w-3 h-3 mr-1" /> En revisión</Badge>;
    }
    
    if (riskScore >= 70) {
      return <Badge className="bg-red-500">Crítico</Badge>;
    } else if (riskScore >= 50) {
      return <Badge className="bg-amber-500">Alto</Badge>;
    } else if (riskScore >= 30) {
      return <Badge className="bg-yellow-500">Medio</Badge>;
    }
    return <Badge className="bg-emerald-500">Bajo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="banking-dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Cuentas</p>
                <p className="text-2xl font-bold">{summary?.accounts_connected || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm">Protección</p>
                <p className="text-2xl font-bold">{summary?.protection_rate || 100}%</p>
              </div>
              <Shield className="w-8 h-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm">Sospechosas</p>
                <p className="text-2xl font-bold">{summary?.suspicious_transactions || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Analizado</p>
                <p className="text-2xl font-bold">€{(summary?.total_amount_monitored || 0).toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Cuentas Conectadas
              </CardTitle>
              <CardDescription>Cuentas bancarias monitorizadas por MANO</CardDescription>
            </div>
            <Button onClick={() => setShowConnectDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Conectar Cuenta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {summary?.accounts?.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay cuentas conectadas</p>
              <p className="text-sm mt-1">Conecta una cuenta para comenzar a monitorizar</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {summary?.accounts?.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{account.bank_name}</div>
                      <div className="text-sm text-zinc-500">
                        ****{account.last_four} • {account.account_type === 'checking' ? 'Corriente' : 'Ahorro'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.is_monitored ? (
                      <Badge className="bg-emerald-500">
                        <Shield className="w-3 h-3 mr-1" /> Protegida
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pausada</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Transacciones Recientes
              </CardTitle>
              <CardDescription>Últimas 30 días de actividad</CardDescription>
            </div>
            <Button variant="outline" onClick={loadData} size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay transacciones recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    tx.is_suspicious ? 'border-amber-300 bg-amber-50' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.is_suspicious ? 'bg-amber-100' : 'bg-zinc-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <TrendingUp className={`w-5 h-5 ${tx.is_suspicious ? 'text-amber-600' : 'text-emerald-600'}`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 ${tx.is_suspicious ? 'text-amber-600' : 'text-red-600'}`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{tx.merchant || tx.description}</div>
                      <div className="text-sm text-zinc-500">
                        {new Date(tx.created_at).toLocaleDateString('es-ES')} • {tx.category}
                      </div>
                      {tx.risk_factors?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {tx.risk_factors.slice(0, 2).map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : ''}`}>
                        €{Math.abs(tx.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500">
                        Riesgo: {tx.risk_score?.toFixed(0) || 0}%
                      </div>
                    </div>
                    {getRiskBadge(tx.risk_score, tx.status)}
                    {tx.status === 'flagged' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-emerald-600 border-emerald-200"
                          onClick={() => handleTransaction(tx.id, 'approve')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-200"
                          onClick={() => handleTransaction(tx.id, 'block')}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Bank Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Conectar Cuenta Bancaria</DialogTitle>
            <DialogDescription>
              Conecta tu cuenta para que MANO monitorice tus transacciones en busca de fraudes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Banco</label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu banco" />
                </SelectTrigger>
                <SelectContent>
                  {supportedBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tipo de Cuenta</label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Cuenta Corriente</SelectItem>
                  <SelectItem value="savings">Cuenta de Ahorro</SelectItem>
                  <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Modo Demo
              </p>
              <p className="text-amber-700 mt-1">
                Esta es una simulación. En producción, se utilizaría Open Banking API para conectar con tu banco real de forma segura.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={connectBank} 
              disabled={connecting || !selectedBank}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankingDashboard;
