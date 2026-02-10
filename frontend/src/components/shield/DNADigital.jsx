/**
 * ManoProtect Shield - DNA Digital Component
 * Verify identities with unique digital fingerprints
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Fingerprint, Search, UserPlus, Building2, CheckCircle, XCircle, Loader2, Shield, Phone, Mail, Globe } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DNADigital = () => {
  const [activeTab, setActiveTab] = useState('verify');
  
  // Verify state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyType, setVerifyType] = useState('phone');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  
  // Register state
  const [registerForm, setRegisterForm] = useState({
    owner_name: '',
    owner_type: 'personal',
    email: '',
    phone: '',
    company_name: '',
    website: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerResult, setRegisterResult] = useState(null);

  const handleVerify = async () => {
    if (!verifyInput.trim()) return;
    
    setVerifyLoading(true);
    setVerifyResult(null);
    
    try {
      const body = {};
      if (verifyType === 'phone') body.phone = verifyInput;
      else if (verifyType === 'email') body.email = verifyInput;
      else if (verifyType === 'website') body.website = verifyInput;
      else body.dna_code = verifyInput;
      
      const response = await fetch(`${API}/shield/dna/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      setVerifyResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.owner_name || !registerForm.email) return;
    
    setRegisterLoading(true);
    setRegisterResult(null);
    
    try {
      const response = await fetch(`${API}/shield/dna/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      
      const data = await response.json();
      setRegisterResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Card className="border-cyan-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-cyan-600" />
          </div>
          DNA Digital
        </CardTitle>
        <CardDescription>
          Identidad digital verificable única - Demuestra que eres quien dices ser
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Verificar
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Registrar
            </TabsTrigger>
          </TabsList>

          {/* VERIFY TAB */}
          <TabsContent value="verify" className="space-y-4">
            <p className="text-sm text-zinc-600">
              ¿Te llaman diciendo ser de tu banco? Verifica si tienen DNA Digital auténtico.
            </p>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'phone', label: 'Teléfono', icon: Phone },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'website', label: 'Web', icon: Globe },
                { id: 'code', label: 'Código DNA', icon: Fingerprint },
              ].map(type => (
                <Button
                  key={type.id}
                  variant={verifyType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVerifyType(type.id)}
                  className={verifyType === type.id ? 'bg-cyan-600' : ''}
                >
                  <type.icon className="w-4 h-4 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder={
                  verifyType === 'phone' ? '+34 600 000 000' :
                  verifyType === 'email' ? 'email@ejemplo.com' :
                  verifyType === 'website' ? 'www.ejemplo.com' :
                  'MP-DNA-XXXXXXXX'
                }
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button 
                onClick={handleVerify} 
                disabled={verifyLoading || !verifyInput.trim()}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {verifyResult && (
              <div className={`p-4 rounded-lg border-2 ${
                verifyResult.verified 
                  ? 'bg-emerald-50 border-emerald-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {verifyResult.verified ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-bold ${verifyResult.verified ? 'text-emerald-700' : 'text-red-700'}`}>
                      {verifyResult.verified ? '✅ IDENTIDAD VERIFICADA' : '❌ NO VERIFICADO'}
                    </p>
                    {verifyResult.owner_name && (
                      <p className="text-sm text-zinc-600 mt-1">
                        Propietario: <span className="font-medium">{verifyResult.owner_name}</span>
                      </p>
                    )}
                    {verifyResult.dna_code && (
                      <p className="text-sm text-zinc-600">
                        DNA: <code className="bg-zinc-100 px-1 rounded">{verifyResult.dna_code}</code>
                      </p>
                    )}
                    {verifyResult.trust_score > 0 && (
                      <p className="text-sm text-zinc-600">
                        Confianza: <Badge variant="outline">{verifyResult.trust_score}%</Badge>
                      </p>
                    )}
                    {verifyResult.warning_message && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ {verifyResult.warning_message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="space-y-4">
            <p className="text-sm text-zinc-600">
              Obtén tu DNA Digital para que tus clientes puedan verificar que eres legítimo.
            </p>

            <div className="flex gap-2">
              <Button
                variant={registerForm.owner_type === 'personal' ? 'default' : 'outline'}
                onClick={() => setRegisterForm({...registerForm, owner_type: 'personal'})}
                className={registerForm.owner_type === 'personal' ? 'bg-cyan-600' : ''}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Personal
              </Button>
              <Button
                variant={registerForm.owner_type === 'business' ? 'default' : 'outline'}
                onClick={() => setRegisterForm({...registerForm, owner_type: 'business'})}
                className={registerForm.owner_type === 'business' ? 'bg-cyan-600' : ''}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Empresa
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                placeholder={registerForm.owner_type === 'business' ? 'Nombre de la empresa' : 'Tu nombre completo'}
                value={registerForm.owner_name}
                onChange={(e) => setRegisterForm({...registerForm, owner_name: e.target.value})}
              />
              <Input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              />
              <Input
                placeholder="Teléfono"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
              />
              {registerForm.owner_type === 'business' && (
                <Input
                  placeholder="Sitio web"
                  value={registerForm.website}
                  onChange={(e) => setRegisterForm({...registerForm, website: e.target.value})}
                />
              )}
            </div>

            <Button 
              onClick={handleRegister}
              disabled={registerLoading || !registerForm.owner_name || !registerForm.email}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {registerLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Fingerprint className="w-4 h-4 mr-2" />
              )}
              Solicitar DNA Digital
            </Button>

            {registerResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-700">¡Solicitud enviada!</p>
                    <p className="text-sm text-zinc-600 mt-1">
                      Tu código DNA Digital: 
                      <code className="ml-2 bg-emerald-100 px-2 py-1 rounded font-mono">
                        {registerResult.dna_code}
                      </code>
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Recibirás un email cuando tu identidad sea verificada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DNADigital;
