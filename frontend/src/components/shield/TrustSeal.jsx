/**
 * ManoProtect Shield - Trust Seal Component
 * Business verification badge system
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Award, Search, Building2, CheckCircle, XCircle, Loader2, Copy, ExternalLink, Shield, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIERS = {
  basic: { label: 'Básico', color: 'bg-zinc-100 text-zinc-800', price: '29€/mes' },
  professional: { label: 'Profesional', color: 'bg-blue-100 text-blue-800', price: '99€/mes' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-800', price: '299€/mes' },
  government: { label: 'Gobierno', color: 'bg-emerald-100 text-emerald-800', price: 'Consultar' },
};

const TrustSeal = () => {
  const [activeTab, setActiveTab] = useState('verify');
  
  // Verify state
  const [sealCode, setSealCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  
  // Apply state
  const [applyForm, setApplyForm] = useState({
    business_name: '',
    business_cif: '',
    website: '',
    email: '',
    phone: '',
    tier: 'basic'
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const handleVerify = async () => {
    if (!sealCode.trim()) return;
    
    setVerifyLoading(true);
    setVerifyResult(null);
    
    try {
      const response = await fetch(`${API}/shield/seal/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seal_code: sealCode.trim() })
      });
      
      const data = await response.json();
      setVerifyResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applyForm.business_name || !applyForm.email || !applyForm.website) return;
    
    setApplyLoading(true);
    setApplyResult(null);
    
    try {
      const response = await fetch(`${API}/shield/seal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm)
      });
      
      const data = await response.json();
      setApplyResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
  };

  const copyEmbedCode = () => {
    if (applyResult?.embed_code) {
      navigator.clipboard.writeText(applyResult.embed_code);
    }
  };

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          Sello de Confianza
        </CardTitle>
        <CardDescription>
          Demuestra a tus clientes que tu empresa está verificada por ManoProtect
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Verificar Sello
            </TabsTrigger>
            <TabsTrigger value="apply" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Solicitar Sello
            </TabsTrigger>
          </TabsList>

          {/* VERIFY TAB */}
          <TabsContent value="verify" className="space-y-4">
            <p className="text-sm text-zinc-600">
              ¿Ves un Sello de Confianza en una web? Verifica aquí si es auténtico.
            </p>

            <div className="flex gap-2">
              <Input
                value={sealCode}
                onChange={(e) => setSealCode(e.target.value)}
                placeholder="SEAL-XXXXXXXX"
                className="flex-1 font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button 
                onClick={handleVerify} 
                disabled={verifyLoading || !sealCode.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {verifyResult && (
              <div className={`p-4 rounded-lg border-2 ${
                verifyResult.valid 
                  ? 'bg-emerald-50 border-emerald-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {verifyResult.valid ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-bold ${verifyResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                      {verifyResult.message}
                    </p>
                    {verifyResult.business_name && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-zinc-600">
                          Empresa: <span className="font-medium">{verifyResult.business_name}</span>
                        </p>
                        {verifyResult.tier && (
                          <Badge className={TIERS[verifyResult.tier]?.color || ''}>
                            {TIERS[verifyResult.tier]?.label || verifyResult.tier}
                          </Badge>
                        )}
                        {verifyResult.trust_score && (
                          <p className="text-sm text-zinc-600">
                            Puntuación: <span className="font-medium">{verifyResult.trust_score}%</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-zinc-50 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-700 mb-2">¿Cómo funciona?</h4>
              <ol className="text-sm text-zinc-600 space-y-1">
                <li>1. Las empresas muestran el sello en su web</li>
                <li>2. Al hacer clic, se verifica en tiempo real</li>
                <li>3. Si es válido, puedes confiar en esa empresa</li>
              </ol>
            </div>
          </TabsContent>

          {/* APPLY TAB */}
          <TabsContent value="apply" className="space-y-4">
            <p className="text-sm text-zinc-600">
              Obtén el Sello de Confianza para tu empresa y aumenta las conversiones.
            </p>

            {/* Tier Selection */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TIERS).slice(0, 3).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setApplyForm({...applyForm, tier: key})}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    applyForm.tier === key 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-zinc-200 hover:border-amber-300'
                  }`}
                >
                  <Badge className={tier.color}>{tier.label}</Badge>
                  <p className="text-sm font-medium mt-1">{tier.price}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Nombre de la empresa"
                value={applyForm.business_name}
                onChange={(e) => setApplyForm({...applyForm, business_name: e.target.value})}
              />
              <Input
                placeholder="CIF / NIF"
                value={applyForm.business_cif}
                onChange={(e) => setApplyForm({...applyForm, business_cif: e.target.value})}
              />
              <Input
                placeholder="Sitio web (con https://)"
                value={applyForm.website}
                onChange={(e) => setApplyForm({...applyForm, website: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={applyForm.email}
                  onChange={(e) => setApplyForm({...applyForm, email: e.target.value})}
                />
                <Input
                  placeholder="Teléfono"
                  value={applyForm.phone}
                  onChange={(e) => setApplyForm({...applyForm, phone: e.target.value})}
                />
              </div>
            </div>

            <Button 
              onClick={handleApply}
              disabled={applyLoading || !applyForm.business_name || !applyForm.email || !applyForm.website}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {applyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Award className="w-4 h-4 mr-2" />
              )}
              Solicitar Sello de Confianza
            </Button>

            {applyResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-700">¡Solicitud enviada!</p>
                    <p className="text-sm text-zinc-600 mt-1">
                      Código de sello: 
                      <code className="ml-2 bg-emerald-100 px-2 py-1 rounded font-mono">
                        {applyResult.seal_code}
                      </code>
                    </p>
                  </div>
                </div>
                
                {applyResult.embed_code && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-700">Código para tu web:</span>
                      <Button variant="ghost" size="sm" onClick={copyEmbedCode}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="text-xs bg-zinc-100 p-2 rounded overflow-x-auto">
                      {applyResult.embed_code}
                    </pre>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Clock className="w-4 h-4" />
                  Verificación en proceso (24-48h)
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrustSeal;
