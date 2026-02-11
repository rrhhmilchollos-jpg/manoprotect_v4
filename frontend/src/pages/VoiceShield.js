import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Phone, Shield, AlertTriangle, CheckCircle, XCircle, Mic, MicOff,
  ArrowLeft, Activity, FileText, AlertOctagon, Info, Sparkles,
  PhoneOff, Volume2, TrendingUp, Clock, Copy, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Risk level colors
const RISK_COLORS = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500'
};

const RISK_TEXT_COLORS = {
  CRITICAL: 'text-red-600',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-yellow-500',
  LOW: 'text-green-500'
};

const VoiceShield = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [callerNumber, setCallerNumber] = useState('');
  const [callDuration, setCallDuration] = useState(60);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [scamPhrases, setScamPhrases] = useState([]);
  const [activeTab, setActiveTab] = useState('analyze');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadScamPhrases();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/voice-shield/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadScamPhrases = async () => {
    try {
      const response = await fetch(`${API}/voice-shield/scam-phrases/es`);
      if (response.ok) {
        const data = await response.json();
        setScamPhrases(data.phrases || []);
      }
    } catch (error) {
      console.error('Error loading scam phrases:', error);
    }
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim() || transcript.length < 10) {
      toast.error('El texto es demasiado corto para analizar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/voice-shield/analyze-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          transcript: transcript,
          caller_number: callerNumber || null,
          call_duration_seconds: callDuration || 60,
          language: 'es'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
        
        if (data.risk_level === 'CRITICAL' || data.risk_level === 'HIGH') {
          toast.error(`ALERTA: Riesgo ${data.risk_level === 'CRITICAL' ? 'CRITICO' : 'ALTO'} detectado`);
        } else if (data.risk_level === 'MEDIUM') {
          toast.warning('Precaucion: Se detectaron patrones sospechosos');
        } else {
          toast.success('Conversacion analizada: Bajo riesgo');
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al analizar');
      }
    } catch (error) {
      toast.error('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const getRealTimeAlert = async (text) => {
    try {
      const response = await fetch(`${API}/voice-shield/real-time-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, language: 'es' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.should_alert) {
          data.alerts.forEach(alert => {
            toast.error(alert, { duration: 5000 });
          });
        }
      }
    } catch (error) {
      console.error('Real-time alert error:', error);
    }
  };

  // Speech recognition for live transcription
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          // Check for real-time alerts on final transcripts
          getRealTimeAlert(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Error de reconocimiento: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.start();
    setIsRecording(true);
    toast.success('Grabacion iniciada - Habla cerca del microfono');
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    toast.info('Grabacion detenida');
  };

  const copyToClipboard = () => {
    if (analysis) {
      const text = `AI Voice Shield - Analisis de Llamada
Riesgo: ${analysis.risk_level} (${analysis.risk_score}/100)
Alertas: ${analysis.alerts.length}
Resumen: ${analysis.summary}
Recomendaciones: ${analysis.recommendations.join(', ')}`;
      navigator.clipboard.writeText(text);
      toast.success('Copiado al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-zinc-400 hover:text-white"
                data-testid="back-button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 text-indigo-400" />
                  AI Voice Shield
                </h1>
                <p className="text-zinc-400 text-sm">Detecta estafas telefonicas en tiempo real</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Activity className="h-3 w-3 mr-1" /> EN VIVO
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Analisis Totales</p>
                  <p className="text-2xl font-bold text-white">{stats.total_analyses || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertOctagon className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Amenazas Criticas</p>
                  <p className="text-2xl font-bold text-white">{stats.threats_detected?.critical || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Estado</p>
                  <p className="text-lg font-bold text-green-400">{stats.status}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="analyze" className="data-[state=active]:bg-indigo-600">
              <FileText className="h-4 w-4 mr-2" />
              Analizar Llamada
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-indigo-600">
              <Info className="h-4 w-4 mr-2" />
              Frases de Estafa
            </TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Phone className="h-5 w-5 text-indigo-400" />
                    Transcripcion de Llamada
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Escribe o graba la conversacion para analizar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recording Controls */}
                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                        data-testid="start-recording-btn"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Iniciar Grabacion
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className="flex-1 animate-pulse"
                        data-testid="stop-recording-btn"
                      >
                        <MicOff className="h-4 w-4 mr-2" />
                        Detener Grabacion
                      </Button>
                    )}
                  </div>

                  {/* Transcript Input */}
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Escribe aqui la conversacion telefonica que quieres analizar...

Ejemplo: 'Buenos dias, le llamamos del banco Santander. Su cuenta ha sido bloqueada por movimientos sospechosos. Necesitamos que nos proporcione su numero de tarjeta para verificar su identidad...'"
                    className="w-full h-48 p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    data-testid="transcript-input"
                  />

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-400 text-sm block mb-1">Numero del llamante</label>
                      <input
                        type="tel"
                        value={callerNumber}
                        onChange={(e) => setCallerNumber(e.target.value)}
                        placeholder="+34 600 000 000"
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                        data-testid="caller-number-input"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 text-sm block mb-1">Duracion (segundos)</label>
                      <input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(parseInt(e.target.value) || 60)}
                        placeholder="60"
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                        data-testid="call-duration-input"
                      />
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <Button
                    onClick={analyzeTranscript}
                    disabled={loading || !transcript.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    data-testid="analyze-btn"
                  >
                    {loading ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Analizando con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analizar con AI Voice Shield
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    Resultado del Analisis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!analysis ? (
                    <div className="text-center py-12 text-zinc-500">
                      <Phone className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>Introduce la conversacion y haz clic en analizar</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Risk Score */}
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${RISK_COLORS[analysis.risk_level]} mb-4`}>
                          <span className="text-3xl font-bold text-white">{analysis.risk_score}</span>
                        </div>
                        <p className={`text-xl font-bold ${RISK_TEXT_COLORS[analysis.risk_level]}`}>
                          {analysis.risk_level === 'CRITICAL' && 'RIESGO CRITICO'}
                          {analysis.risk_level === 'HIGH' && 'RIESGO ALTO'}
                          {analysis.risk_level === 'MEDIUM' && 'RIESGO MEDIO'}
                          {analysis.risk_level === 'LOW' && 'RIESGO BAJO'}
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-zinc-900/50 rounded-lg">
                        <p className="text-zinc-300">{analysis.summary}</p>
                      </div>

                      {/* Alerts */}
                      {analysis.alerts.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            Alertas Detectadas ({analysis.alerts.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {analysis.alerts.map((alert, idx) => (
                              <div 
                                key={idx}
                                className={`p-3 rounded-lg flex items-start gap-3 ${
                                  alert.severity === 'HIGH' ? 'bg-red-900/30 border border-red-700' :
                                  alert.severity === 'MEDIUM' ? 'bg-yellow-900/30 border border-yellow-700' :
                                  'bg-zinc-800 border border-zinc-700'
                                }`}
                              >
                                {alert.severity === 'HIGH' ? (
                                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                ) : alert.severity === 'MEDIUM' ? (
                                  <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                                ) : (
                                  <Info className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="text-white text-sm">{alert.description}</p>
                                  <p className="text-zinc-500 text-xs">{alert.category}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {analysis.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Recomendaciones
                          </h4>
                          <ul className="space-y-2">
                            {analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-zinc-300 text-sm flex items-start gap-2">
                                <span className="text-indigo-400">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-zinc-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          data-testid="copy-result-btn"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnalysis(null);
                            setTranscript('');
                          }}
                          className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          data-testid="clear-btn"
                        >
                          <PhoneOff className="h-4 w-4 mr-2" />
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Frases Comunes de Estafa
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Aprende a identificar las tacticas mas usadas por estafadores telefonicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scamPhrases.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        item.danger === 'CRITICO' || item.danger === 'CRITICAL' 
                          ? 'bg-red-900/20 border-red-700' 
                          : item.danger === 'ALTO' || item.danger === 'HIGH'
                          ? 'bg-orange-900/20 border-orange-700'
                          : 'bg-yellow-900/20 border-yellow-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Volume2 className={`h-5 w-5 flex-shrink-0 ${
                          item.danger === 'CRITICO' || item.danger === 'CRITICAL' 
                            ? 'text-red-400' 
                            : item.danger === 'ALTO' || item.danger === 'HIGH'
                            ? 'text-orange-400'
                            : 'text-yellow-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">"{item.phrase}"</p>
                          <p className="text-zinc-400 text-sm mt-1">{item.category}</p>
                          <Badge 
                            variant="outline" 
                            className={`mt-2 ${
                              item.danger === 'CRITICO' || item.danger === 'CRITICAL' 
                                ? 'border-red-500 text-red-400' 
                                : item.danger === 'ALTO' || item.danger === 'HIGH'
                                ? 'border-orange-500 text-orange-400'
                                : 'border-yellow-500 text-yellow-400'
                            }`}
                          >
                            Peligro: {item.danger}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-indigo-400" />
                  Consejos de Proteccion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p>Nunca proporciones datos bancarios por telefono</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p>Verifica siempre llamando tu al numero oficial</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p>Desconfia de llamadas con urgencia artificial</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p>No compartas codigos de verificacion SMS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VoiceShield;
