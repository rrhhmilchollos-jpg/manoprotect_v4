import { useState } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Brain, Loader2, 
  Search, MessageSquare, Phone, Mail, Link as LinkIcon,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ThreatAnalyzer = () => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('message');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const contentTypes = [
    { value: 'message', label: 'Mensaje de texto', icon: MessageSquare },
    { value: 'sms', label: 'SMS', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'url', label: 'URL / Enlace', icon: LinkIcon },
    { value: 'call', label: 'Llamada (transcripción)', icon: Phone },
  ];

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error('Introduce contenido para analizar');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${API}/ml/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          content_type: contentType
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.is_threat) {
        toast.error(`⚠️ Amenaza detectada: Nivel ${data.risk_level}`);
      } else {
        toast.success('✅ Contenido analizado: Sin amenazas detectadas');
      }
    } catch (error) {
      toast.error('Error al analizar contenido');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const getRiskLabel = (level) => {
    switch(level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      default: return 'Bajo';
    }
  };

  return (
    <div className="space-y-6" data-testid="threat-analyzer">
      {/* Input Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Analizador de Amenazas con IA
          </CardTitle>
          <CardDescription>
            Analiza mensajes, emails, URLs o llamadas sospechosas usando inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de contenido</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Contenido a analizar</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                contentType === 'url' 
                  ? 'Pega aquí la URL sospechosa...'
                  : contentType === 'email'
                  ? 'Pega aquí el contenido del email sospechoso...'
                  : 'Pega aquí el mensaje sospechoso...'
              }
              className="mt-1 min-h-32"
              data-testid="content-input"
            />
          </div>

          <Button
            onClick={analyzeContent}
            disabled={analyzing || !content.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            data-testid="analyze-btn"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analizando con IA...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analizar Amenaza
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className={`border-2 ${result.is_threat ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.is_threat ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <span className="text-red-800">Amenaza Detectada</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <span className="text-emerald-800">Sin Amenazas</span>
                  </>
                )}
              </CardTitle>
              <Badge className={getRiskColor(result.risk_level)}>
                {getRiskLabel(result.risk_level)} - {result.risk_score}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Score Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nivel de Riesgo</span>
                <span className="font-medium">{result.risk_score}%</span>
              </div>
              <Progress 
                value={result.risk_score} 
                className={`h-3 ${result.is_threat ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
              />
            </div>

            {/* Threat Types */}
            {result.threat_types?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tipos de amenaza detectados:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.threat_types.map((type, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis */}
            <div className={`p-4 rounded-lg ${result.is_threat ? 'bg-red-100' : 'bg-emerald-100'}`}>
              <h4 className="font-medium mb-2">Análisis:</h4>
              <p className="text-sm">{result.analysis}</p>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg border-2 ${result.is_threat ? 'border-red-300 bg-white' : 'border-emerald-300 bg-white'}`}>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recomendación:
              </h4>
              <p className="text-sm">{result.recommendation}</p>
            </div>

            {/* Detailed Info Toggle */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ocultar detalles técnicos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver detalles técnicos
                </>
              )}
            </Button>

            {showDetails && (
              <div className="space-y-3 pt-3 border-t">
                {/* Patterns Detected */}
                {result.patterns_detected?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Patrones detectados:</h5>
                    <div className="flex flex-wrap gap-1">
                      {result.patterns_detected.map((pattern, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence */}
                <div className="flex items-center justify-between text-sm">
                  <span>Confianza del modelo:</span>
                  <Badge variant="outline">{(result.confidence * 100).toFixed(0)}%</Badge>
                </div>

                {/* Analysis Method */}
                <div className="flex items-center justify-between text-sm">
                  <span>Método de análisis:</span>
                  <Badge variant="outline">
                    {result.analysis_method === 'hybrid_llm_ml' ? 'IA + ML Híbrido' : 'Machine Learning'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-zinc-50 border-zinc-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            ¿Cómo funciona el análisis?
          </h4>
          <ul className="text-sm text-zinc-600 space-y-1">
            <li>• <strong>Machine Learning:</strong> Detecta patrones conocidos de fraude</li>
            <li>• <strong>Análisis de URLs:</strong> Identifica phishing y sitios maliciosos</li>
            <li>• <strong>IA Generativa (GPT-5.2):</strong> Analiza contexto y semántica</li>
            <li>• <strong>Puntuación híbrida:</strong> Combina múltiples señales para mayor precisión</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatAnalyzer;
