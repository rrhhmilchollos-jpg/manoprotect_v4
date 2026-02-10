/**
 * ManoProtect Shield - Voice Shield AI Component
 * Real-time call analysis for manipulation detection
 */
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Phone, Mic, MicOff, AlertTriangle, Shield, Brain, Volume2, Loader2, CheckCircle, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TACTIC_LABELS = {
  urgency: { label: 'Urgencia', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
  authority: { label: 'Autoridad', color: 'bg-purple-100 text-purple-800', icon: '👮' },
  fear: { label: 'Miedo', color: 'bg-red-100 text-red-800', icon: '😨' },
  greed: { label: 'Avaricia', color: 'bg-yellow-100 text-yellow-800', icon: '💰' },
  scarcity: { label: 'Escasez', color: 'bg-blue-100 text-blue-800', icon: '⌛' },
  social_proof: { label: 'Prueba Social', color: 'bg-green-100 text-green-800', icon: '👥' },
  reciprocity: { label: 'Reciprocidad', color: 'bg-pink-100 text-pink-800', icon: '🎁' },
};

const VoiceShieldAI = () => {
  const [transcript, setTranscript] = useState('');
  const [callerNumber, setCallerNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecordingSupported(false);
    }
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'es-ES';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const analyzeCall = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API}/shield/voice/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          caller_number: callerNumber || null
        })
      });

      if (!response.ok) throw new Error('Error en el análisis');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          Escudo de Voz AI
        </CardTitle>
        <CardDescription>
          Detecta tácticas de manipulación en llamadas telefónicas en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Caller Number */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            Número del llamante (opcional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={callerNumber}
              onChange={(e) => setCallerNumber(e.target.value)}
              placeholder="+34 600 000 000"
              className="pl-10"
            />
          </div>
        </div>

        {/* Recording Controls */}
        {recordingSupported && (
          <div className="flex items-center gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? 'destructive' : 'outline'}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Detener Grabación
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Grabar Conversación
                </>
              )}
            </Button>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                Grabando...
              </div>
            )}
          </div>
        )}

        {/* Transcript */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            Transcripción de la llamada
          </label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Escribe o graba lo que te está diciendo el llamante..."
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={analyzeCall} 
          disabled={loading || !transcript.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Shield className="w-5 h-5 mr-2" />
          )}
          Analizar Llamada
        </Button>

        {/* Result */}
        {result && (
          <div className={`p-6 rounded-xl border-2 ${
            result.is_suspicious 
              ? 'bg-red-50 border-red-300' 
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            {/* Risk Score */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {result.is_suspicious ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                )}
                <div>
                  <p className={`font-bold text-lg ${result.is_suspicious ? 'text-red-700' : 'text-emerald-700'}`}>
                    {result.is_suspicious ? 'LLAMADA SOSPECHOSA' : 'LLAMADA SEGURA'}
                  </p>
                  <p className="text-sm text-zinc-600">
                    Riesgo: {result.risk_score}%
                  </p>
                </div>
              </div>
              
              {/* Risk Meter */}
              <div className="w-24 h-24 relative">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={result.risk_score >= 60 ? '#dc2626' : result.risk_score >= 30 ? '#f59e0b' : '#10b981'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${result.risk_score * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                  {result.risk_score}%
                </span>
              </div>
            </div>

            {/* Detected Tactics */}
            {result.detected_tactics?.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2 text-zinc-700">Tácticas detectadas:</p>
                <div className="flex flex-wrap gap-2">
                  {result.detected_tactics.map((tactic) => {
                    const info = TACTIC_LABELS[tactic] || { label: tactic, color: 'bg-zinc-100', icon: '❓' };
                    return (
                      <Badge key={tactic} className={info.color}>
                        {info.icon} {info.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="space-y-2 mb-4">
                {result.warnings.map((warning, idx) => (
                  <div key={idx} className="p-3 bg-white/50 rounded-lg text-sm">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Caller Verification */}
            {result.caller_verified && (
              <div className="p-3 bg-emerald-100 rounded-lg mb-4">
                <p className="text-emerald-700 font-medium">
                  ✅ Llamante verificado con DNA Digital
                </p>
                <p className="text-sm text-emerald-600">
                  Código: {result.caller_dna}
                </p>
              </div>
            )}

            {/* Recommendation */}
            <div className={`p-4 rounded-lg ${
              result.is_suspicious ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              <p className={`font-bold ${result.is_suspicious ? 'text-red-700' : 'text-emerald-700'}`}>
                {result.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-xs text-zinc-500 text-center space-y-1">
          <p>La IA analiza patrones de manipulación: urgencia, miedo, autoridad falsa, etc.</p>
          <p>Funciona en tiempo real mientras hablas por teléfono.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceShieldAI;
