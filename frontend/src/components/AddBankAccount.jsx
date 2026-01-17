import { useState, useEffect } from 'react';
import { Building2, CreditCard, AlertTriangle, CheckCircle, Loader2, Shield, Plus, Trash2, Eye, EyeOff, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AddBankAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showIban, setShowIban] = useState({});
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder: '',
    iban: '',
    swift_bic: '',
    account_number: '',
    sort_code: '',
    currency: 'EUR',
    account_type: 'checking',
    alias: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch(`${API}/banking/manual-accounts`, {
        credentials: 'include'
      });
      
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
    
    // Validate IBAN format
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
    const cleanIban = formData.iban.replace(/\s/g, '').toUpperCase();
    
    if (!ibanRegex.test(cleanIban)) {
      toast.error('El formato del IBAN no es válido');
      return;
    }

    // Validate SWIFT/BIC format
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const cleanSwift = formData.swift_bic.replace(/\s/g, '').toUpperCase();
    
    if (formData.swift_bic && !swiftRegex.test(cleanSwift)) {
      toast.error('El formato del SWIFT/BIC no es válido');
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
          swift_bic: cleanSwift
        })
      });

      if (response.ok) {
        toast.success('Cuenta bancaria añadida correctamente');
        setShowForm(false);
        setFormData({
          bank_name: '',
          account_holder: '',
          iban: '',
          swift_bic: '',
          account_number: '',
          sort_code: '',
          currency: 'EUR',
          account_type: 'checking',
          alias: ''
        });
        loadAccounts();
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

  const deleteAccount = async (accountId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    
    try {
      const response = await fetch(`${API}/banking/manual-accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Cuenta eliminada');
        loadAccounts();
      } else {
        toast.error('Error al eliminar cuenta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const toggleShowIban = (accountId) => {
    setShowIban(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskIban = (iban) => {
    if (!iban) return '';
    return iban.slice(0, 4) + ' **** **** **** ' + iban.slice(-4);
  };

  const formatIban = (iban) => {
    if (!iban) return '';
    return iban.match(/.{1,4}/g)?.join(' ') || iban;
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Testing Phase Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-amber-800">🔒 En fase de pruebas de seguridad</h3>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                BETA
              </Badge>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Esta función está siendo probada para garantizar la máxima seguridad de tus datos bancarios. 
              La conexión automática con bancos estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Añadir Cuenta Bancaria
              </CardTitle>
              <CardDescription>
                Añade tus cuentas manualmente para análisis de fraude
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Add Account Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-50 rounded-xl space-y-4">
              <h4 className="font-semibold text-lg mb-4">Datos de la cuenta bancaria</h4>
              
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
                    className="font-mono"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Formato: ES + 22 dígitos (ej: ES91 2100 0418 4502 0005 1332)
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
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    8 u 11 caracteres (ej: CAIXESBBXXX)
                  </p>
                </div>

                {/* Account Number (optional) */}
                <div>
                  <Label htmlFor="account_number">Número de cuenta (opcional)</Label>
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
                    <option value="USD">🇺🇸 USD - Dólar</option>
                    <option value="GBP">🇬🇧 GBP - Libra</option>
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
                    <option value="checking">Cuenta corriente</option>
                    <option value="savings">Cuenta de ahorro</option>
                    <option value="business">Cuenta empresa</option>
                  </select>
                </div>

                {/* Alias */}
                <div>
                  <Label htmlFor="alias">Alias (opcional)</Label>
                  <Input
                    id="alias"
                    placeholder="Ej: Cuenta nómina, Ahorros..."
                    value={formData.alias}
                    onChange={(e) => setFormData({...formData, alias: e.target.value})}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg mt-4">
                <Shield className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">
                  Tus datos bancarios están cifrados y protegidos. Solo se usarán para detectar fraudes en tus transacciones.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
              </div>
            </form>
          )}

          {/* Accounts List */}
          {accounts.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold">Cuentas registradas ({accounts.length})</h4>
              {accounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
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
                      <p className="text-xs text-zinc-500 mt-1">
                        {account.bank_name} • {account.currency} • Titular: {account.account_holder}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={account.verified ? 'text-emerald-600 border-emerald-300' : 'text-amber-600 border-amber-300'}
                    >
                      {account.verified ? '✓ Verificada' : '⏳ Pendiente'}
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
          ) : !showForm && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No tienes cuentas bancarias registradas</p>
              <p className="text-sm text-zinc-400 mt-1">
                Añade una cuenta para empezar a detectar fraudes en tus transacciones
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBankAccount;
