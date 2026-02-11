/**
 * ManoProtect Shield - Universal Verifier Component
 * Verify URLs, phones, emails, businesses before trusting them
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, AlertTriangle, CheckCircle, Phone, Mail, Globe, Building2, Loader2, AlertCircle, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Use REAL-TIME API for live data
const REALTIME_API = `${process.env.REACT_APP_BACKEND_URL}/api/realtime`;

const VERIFICATION_TYPES = [
  { id: 'url', label: 'URL / Web', icon: Globe, placeholder: 'https://ejemplo.com' },
  { id: 'phone', label: 'Teléfono', icon: Phone, placeholder: '+34 600 000 000' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'ejemplo@email.com' },
  { id: 'business', label: 'Empresa', icon: Building2, placeholder: 'Nombre o CIF de empresa' },
];

const getRiskColor = (level) => {
  switch (level) {
    case 'safe': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-zinc-100 text-zinc-800 border-zinc-300';
  }
};

const getRiskIcon = (level) => {
  switch (level) {
    case 'safe': return <CheckCircle className="w-6 h-6 text-emerald-600" />;
    case 'low': return <Shield className="w-6 h-6 text-blue-600" />;
    case 'medium': return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    case 'high': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    case 'critical': return <XCircle className="w-6 h-6 text-red-600" />;
    default: return <Search className="w-6 h-6 text-zinc-600" />;
  }
};

const getRiskLabel = (level) => {
  switch (level) {
    case 'safe': return 'SEGURO';
    case 'low': return 'RIESGO BAJO';
    case 'medium': return 'RIESGO MEDIO';
    case 'high': return 'RIESGO ALTO';
    case 'critical': return 'PELIGROSO';
    default: return 'DESCONOCIDO';
  }
};

const UniversalVerifier = () => {
  const [content, setContent] = useState('');
  const [verificationType, setVerificationType] = useState('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use REAL-TIME API for live data
      let endpoint;
      let body;
      
      switch (verificationType) {
        case 'url':
          endpoint = `${REALTIME_API}/check/url`;
          body = { url: content.trim() };
          break;
        case 'phone':
          endpoint = `${REALTIME_API}/check/phone`;
          body = { phone: content.trim(), country_code: 'ES' };
          break;
        case 'email':
          endpoint = `${REALTIME_API}/check/email`;
          body = { email: content.trim() };
          break;
        default:
          endpoint = `${REALTIME_API}/check/url`;
          body = { url: content.trim() };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error en la verificación');
      
      const data = await response.json();
      
      // Transform to expected format
      setResult({
        is_safe: data.is_safe,
        risk_level: data.risk_score >= 70 ? 'critical' : 
                    data.risk_score >= 50 ? 'high' : 
                    data.risk_score >= 30 ? 'medium' : 
                    data.risk_score >= 10 ? 'low' : 'safe',
        risk_score: data.risk_score,
        verification_type: verificationType,
        details: data.details || {},
        recommendations: data.recommendation ? [data.recommendation] : [],
        known_reports: data.checks?.find(c => c.source === 'ManoProtect Community')?.reports || 0,
        community_warnings: data.warnings || [],
        checks: data.checks || [],
        verified_entity: data.checks?.find(c => c.status === 'TRUSTED') ? {
          owner_name: data.checks.find(c => c.status === 'TRUSTED').owner
        } : null,
        database_status: 'LIVE'
      });
    } catch (err) {
      setError('No se pudo realizar la verificación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const currentType = VERIFICATION_TYPES.find(t => t.id === verificationType);

  return (
    <Card className="border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          Verificador Universal
        </CardTitle>
        <CardDescription>
          Comprueba si un enlace, teléfono, email o empresa es de confianza antes de interactuar
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Type Selection */}
        <div className="flex flex-wrap gap-2">
          {VERIFICATION_TYPES.map(type => (
            <Button
              key={type.id}
              variant={verificationType === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setVerificationType(type.id);
                setResult(null);
                setContent('');
              }}
              className={verificationType === type.id ? 'bg-indigo-600' : ''}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <currentType.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentType?.placeholder}
              className="pl-10 h-12 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <Button 
            onClick={handleVerify} 
            disabled={loading || !content.trim()}
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Verificar
              </>
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`p-6 rounded-xl border-2 ${getRiskColor(result.risk_level)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getRiskIcon(result.risk_level)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getRiskColor(result.risk_level)}>
                    {getRiskLabel(result.risk_level)}
                  </Badge>
                  <span className="text-sm font-medium">
                    Puntuación de riesgo: {result.risk_score}%
                  </span>
                  {result.database_status === 'LIVE' && (
                    <Badge className="bg-emerald-500 animate-pulse">EN VIVO</Badge>
                  )}
                </div>

                {/* Security Checks Performed */}
                {result.checks?.length > 0 && (
                  <div className="mt-3 bg-zinc-50 rounded-lg p-3">
                    <p className="font-semibold text-zinc-700 text-sm mb-2">Verificaciones realizadas:</p>
                    <div className="space-y-1">
                      {result.checks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {check.status === 'OK' || check.status === 'TRUSTED' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : check.status === 'WARNING' ? (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-zinc-600">{check.source}</span>
                          {check.status === 'TRUSTED' && check.owner && (
                            <span className="text-emerald-600 font-medium">({check.owner})</span>
                          )}
                          {check.reports && (
                            <span className="text-red-600 font-medium">({check.reports} reportes)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.community_warnings?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="font-semibold text-zinc-700">Alertas detectadas:</p>
                    {result.community_warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm pl-4">{warning}</p>
                    ))}
                  </div>
                )}

                {/* DNA Digital verified */}
                {result.verified_entity && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-emerald-700 font-medium">
                      ✅ Identidad verificada con DNA Digital
                    </p>
                    <p className="text-sm text-emerald-600">
                      Propietario: {result.verified_entity.owner_name}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="mt-4 p-3 bg-zinc-100 rounded-lg">
                    <p className="font-bold text-zinc-800">{result.recommendations[0]}</p>
                  </div>
                )}

                {result.known_reports > 0 && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    📊 Reportado {result.known_reports} veces por la comunidad ManoProtect
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-zinc-500 text-center space-y-1">
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Base de datos EN VIVO - Actualizada en tiempo real
          </p>
          <p>Fuentes: Google Safe Browsing, VirusTotal, PhishTank, Comunidad ManoProtect</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversalVerifier;
