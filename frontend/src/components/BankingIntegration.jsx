import { useState, useEffect } from 'react';
import { Building2, Link2, AlertTriangle, CheckCircle, Loader2, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BankingIntegration = () => {
  const [status, setStatus] = useState(null);
  const [banks, setBanks] = useState([]);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('ES');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API}/banking/status`);
      const data = await response.json();
      setStatus(data);
      
      if (data.configured) {
        loadBanks();
        loadLinkedAccounts();
      }
    } catch (error) {
      console.error('Error checking banking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBanks = async () => {
    try {
      const response = await fetch(`${API}/banking/institutions/${country}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBanks(data.institutions || []);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const loadLinkedAccounts = async () => {
    try {
      const response = await fetch(`${API}/banking/accounts`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const linkBank = async (bankId) => {
    setLinking(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard?bank_callback=true`;
      
      const response = await fetch(`${API}/banking/link-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          institution_id: bankId,
          redirect_url: redirectUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Redirigiendo al banco...');
        window.location.href = data.link;
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al conectar banco');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLinking(false);
    }
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

  if (!status?.configured) {
    return (
      <Card className="bg-white border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            Open Banking
          </CardTitle>
          <CardDescription>Conecta tu banco para análisis de fraude</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Pendiente de configuración</p>
              <p className="text-sm text-amber-600">{status?.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Open Banking
              </CardTitle>
              <CardDescription>Conecta tu banco para detectar fraudes en tiempo real</CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg mb-4">
            <Shield className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">Proveedor: {status?.provider}</p>
              <p className="text-sm text-emerald-600">Análisis de transacciones con IA para detectar patrones sospechosos</p>
            </div>
          </div>

          {/* Linked Accounts */}
          {linkedAccounts.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Cuentas Vinculadas</h4>
              <div className="space-y-2">
                {linkedAccounts.map((account) => (
                  <div 
                    key={account.account_id}
                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{account.account_id.slice(0, 20)}...</p>
                        <p className="text-xs text-zinc-500">
                          Vinculada: {new Date(account.linked_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Transacciones
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Country Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">País del banco</label>
            <select 
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setTimeout(loadBanks, 100);
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="ES">🇪🇸 España</option>
              <option value="DE">🇩🇪 Alemania</option>
              <option value="FR">🇫🇷 Francia</option>
              <option value="IT">🇮🇹 Italia</option>
              <option value="PT">🇵🇹 Portugal</option>
              <option value="NL">🇳🇱 Países Bajos</option>
              <option value="BE">🇧🇪 Bélgica</option>
              <option value="GB">🇬🇧 Reino Unido</option>
            </select>
          </div>

          {/* Bank List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {banks.slice(0, 8).map((bank) => (
              <div 
                key={bank.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {bank.logo ? (
                    <img src={bank.logo} alt={bank.name} className="w-8 h-8 rounded" />
                  ) : (
                    <Building2 className="w-8 h-8 text-zinc-400" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{bank.name}</p>
                    <p className="text-xs text-zinc-500">{bank.transaction_days} días historial</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => linkBank(bank.id)}
                  disabled={linking}
                >
                  {linking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {banks.length > 8 && (
            <p className="text-sm text-zinc-500 text-center mt-4">
              Y {banks.length - 8} bancos más disponibles...
            </p>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={loadBanks}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar lista de bancos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingIntegration;
