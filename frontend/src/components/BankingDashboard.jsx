import { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, Plus, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Loader2, Shield, 
  Eye, EyeOff, RefreshCcw, Ban, Check, Clock, Activity, FlaskConical, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BankingDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showIban, setShowIban] = useState({});
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder: '',
    iban: '',
    swift_bic: '',
    account_number: '',
    currency: 'EUR',
    account_type: 'checking',
    alias: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/banking/manual-accounts`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanIban = formData.iban.replace(/\s/g, '').toUpperCase();
    
    if (cleanIban.length < 15) {
      toast.error('El IBAN es demasiado corto');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/banking/manual-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          iban: cleanIban,
          swift_bic: formData.swift_bic.toUpperCase()
        })
      });

      if (response.ok) {
        toast.success('Cuenta bancaria añadida correctamente');
        setShowAddDialog(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al añadir cuenta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_holder: '',
      iban: '',
      swift_bic: '',
      account_number: '',
      currency: 'EUR',
      account_type: 'checking',
      alias: ''
    });
  };

  const deleteAccount = async (accountId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    
    try {
      const response = await fetch(`${API}/banking/manual-accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Cuenta eliminada');
        loadData();
      } else {
        toast.error('Error al eliminar cuenta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const toggleShowIban = (accountId) => {
    setShowIban(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const maskIban = (iban) => iban ? iban.slice(0, 4) + ' **** **** ' + iban.slice(-4) : '';
  const formatIban = (iban) => iban ? iban.match(/.{1,4}/g)?.join(' ') || iban : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="banking-dashboard">
      {/* Testing Phase Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-amber-800">🔒 En fase de pruebas de seguridad</h3>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                BETA
              </Badge>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Esta función está siendo probada para garantizar la máxima seguridad de tus datos bancarios. 
              Por ahora, puedes añadir tus cuentas manualmente. La conexión automática con bancos (Open Banking) 
              estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Cuentas</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm">Verificadas</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.verified).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm">Pendientes</p>
                <p className="text-2xl font-bold">{accounts.filter(a => !a.verified).length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Protección</p>
                <p className="text-2xl font-bold">100%</p>
              </div>
              <Shield className="w-8 h-8 text-zinc-500" />
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
                Mis Cuentas Bancarias
              </CardTitle>
              <CardDescription>Cuentas registradas para monitorización de fraude</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Cuenta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay cuentas registradas</p>
              <p className="text-sm mt-1">Añade una cuenta para comenzar a detectar fraudes</p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir mi primera cuenta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-zinc-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {account.bank_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{account.alias || account.bank_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {account.account_type === 'checking' ? 'Corriente' : 
                           account.account_type === 'savings' ? 'Ahorro' : 'Empresa'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-zinc-600 font-mono">
                          {showIban[account.id] ? formatIban(account.iban) : maskIban(account.iban)}
                        </span>
                        <button 
                          onClick={() => toggleShowIban(account.id)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          {showIban[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500">{account.bank_name}</span>
                        {account.swift_bic && (
                          <span className="text-xs text-zinc-400">• SWIFT: {account.swift_bic}</span>
                        )}
                        <span className="text-xs text-zinc-400">• {account.currency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={account.verified ? 'text-emerald-600 border-emerald-300 bg-emerald-50' : 'text-amber-600 border-amber-300 bg-amber-50'}
                    >
                      {account.verified ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Verificada</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Pendiente</>
                      )}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Añadir Cuenta Bancaria
            </DialogTitle>
            <DialogDescription>
              Introduce los datos de tu cuenta para monitorizar transacciones sospechosas
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Testing Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <strong>Fase de pruebas:</strong> Tus datos están protegidos y cifrados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div>
                <Label htmlFor="bank_name">Nombre del banco *</Label>
                <Input
                  id="bank_name"
                  placeholder="Ej: Santander, BBVA, CaixaBank..."
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  required
                />
              </div>

              {/* Account Holder */}
              <div>
                <Label htmlFor="account_holder">Titular de la cuenta *</Label>
                <Input
                  id="account_holder"
                  placeholder="Nombre completo del titular"
                  value={formData.account_holder}
                  onChange={(e) => setFormData({...formData, account_holder: e.target.value})}
                  required
                />
              </div>

              {/* IBAN */}
              <div className="md:col-span-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase()})}
                  required
                  className="font-mono text-lg tracking-wider"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Formato español: ES + 22 dígitos (ej: ES91 2100 0418 4502 0005 1332)
                </p>
              </div>

              {/* SWIFT/BIC */}
              <div>
                <Label htmlFor="swift_bic">Código SWIFT/BIC</Label>
                <Input
                  id="swift_bic"
                  placeholder="XXXXESMMXXX"
                  value={formData.swift_bic}
                  onChange={(e) => setFormData({...formData, swift_bic: e.target.value.toUpperCase()})}
                  className="font-mono"
                  maxLength={11}
                />
                <p className="text-xs text-zinc-500 mt-1">8 u 11 caracteres</p>
              </div>

              {/* Account Number */}
              <div>
                <Label htmlFor="account_number">Número de cuenta (CCC)</Label>
                <Input
                  id="account_number"
                  placeholder="0000 0000 00 0000000000"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  className="font-mono"
                />
              </div>

              {/* Currency */}
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="USD">🇺🇸 USD - Dólar estadounidense</option>
                  <option value="GBP">🇬🇧 GBP - Libra esterlina</option>
                  <option value="CHF">🇨🇭 CHF - Franco suizo</option>
                </select>
              </div>

              {/* Account Type */}
              <div>
                <Label htmlFor="account_type">Tipo de cuenta</Label>
                <select
                  id="account_type"
                  value={formData.account_type}
                  onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="checking">💳 Cuenta corriente</option>
                  <option value="savings">🏦 Cuenta de ahorro</option>
                  <option value="business">🏢 Cuenta empresa</option>
                </select>
              </div>

              {/* Alias */}
              <div className="md:col-span-2">
                <Label htmlFor="alias">Alias (opcional)</Label>
                <Input
                  id="alias"
                  placeholder="Ej: Cuenta nómina, Ahorros vacaciones, Empresa..."
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">
                Tus datos bancarios están cifrados con AES-256 y solo se usarán para detectar transacciones fraudulentas. 
                Nunca compartimos tu información con terceros.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => { setShowAddDialog(false); resetForm(); }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guardar Cuenta
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankingDashboard;
