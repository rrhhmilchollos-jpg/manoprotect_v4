import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Shield, AlertTriangle, CheckCircle, Upload, Image, Mic, Video,
  ArrowLeft, Eye, AlertOctagon, Info, Sparkles, FileWarning,
  Camera, X, Loader2, BookOpen, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const RISK_CONFIG = {
  CRITICAL: { color: 'bg-red-600', text: 'text-red-500', label: 'CRITICO' },
  HIGH: { color: 'bg-orange-500', text: 'text-orange-500', label: 'ALTO' },
  MEDIUM: { color: 'bg-yellow-500', text: 'text-yellow-500', label: 'MEDIO' },
  LOW: { color: 'bg-green-500', text: 'text-green-500', label: 'BAJO' }
};

const DeepfakeShield = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [education, setEducation] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadEducation();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API}/deepfake-shield/stats`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadEducation = async () => {
    try {
      const response = await fetch(`${API}/deepfake-shield/education`);
      if (response.ok) {
        const data = await response.json();
        setEducation(data);
      }
    } catch (error) {
      console.error('Error loading education:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      audio: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'],
      video: ['video/mp4', 'video/webm', 'video/quicktime']
    };

    if (!validTypes[activeTab]?.some(type => file.type.startsWith(type.split('/')[0]))) {
      toast.error(`Por favor selecciona un archivo de ${activeTab}`);
      return;
    }

    setSelectedFile(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFile = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo primero');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(selectedFile);
      });

      let endpoint = '';
      let body = {};

      switch (activeTab) {
        case 'image':
          endpoint = '/deepfake-shield/analyze/image';
          body = { image_base64: base64, context: 'user_upload' };
          break;
        case 'audio':
          endpoint = '/deepfake-shield/analyze/audio';
          body = { audio_base64: base64 };
          break;
        case 'video':
          endpoint = '/deepfake-shield/analyze/video-frame';
          body = { frame_base64: base64 };
          break;
      }

      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        loadStats();

        if (data.risk_level === 'CRITICAL') {
          toast.error('ALERTA: Alta probabilidad de deepfake detectada');
        } else if (data.risk_level === 'HIGH') {
          toast.warning('Precaucion: Se detectaron indicadores sospechosos');
        } else if (data.risk_level === 'LOW') {
          toast.success('El contenido parece autentico');
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al analizar');
      }
    } catch (error) {
      toast.error('Error de conexion');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const riskConfig = result ? RISK_CONFIG[result.risk_level] : null;

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
                  <Eye className="h-6 w-6 text-purple-400" />
                  Anti-Deepfake Shield
                </h1>
                <p className="text-zinc-400 text-sm">Detecta manipulaciones con IA en imagenes, audio y video</p>
              </div>
            </div>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              <Sparkles className="h-3 w-3 mr-1" /> IA Activa
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Analisis Totales</p>
                  <p className="text-2xl font-bold text-white">{stats.total_analyses}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertOctagon className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Deepfakes Detectados</p>
                  <p className="text-2xl font-bold text-white">{stats.deepfakes_detected}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <FileWarning className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Criticos</p>
                  <p className="text-2xl font-bold text-white">{stats.critical_detections}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Tasa Deteccion</p>
                  <p className="text-2xl font-bold text-white">{stats.detection_rate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis Section */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Analizar Contenido</CardTitle>
              <CardDescription className="text-zinc-400">
                Sube una imagen, audio o video para detectar manipulaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Media Type Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearFile(); }}>
                <TabsList className="bg-zinc-900 border border-zinc-700 w-full">
                  <TabsTrigger value="image" className="flex-1 data-[state=active]:bg-purple-600">
                    <Image className="h-4 w-4 mr-2" />
                    Imagen
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex-1 data-[state=active]:bg-purple-600">
                    <Mic className="h-4 w-4 mr-2" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-purple-600">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* File Upload Area */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={activeTab === 'image' ? 'image/*' : activeTab === 'audio' ? 'audio/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">
                      Haz clic o arrastra un archivo de {activeTab}
                    </p>
                    <p className="text-zinc-500 text-sm mt-2">
                      {activeTab === 'image' && 'JPG, PNG, WebP, GIF'}
                      {activeTab === 'audio' && 'MP3, WAV, OGG'}
                      {activeTab === 'video' && 'MP4, WebM, MOV'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {activeTab === 'image' && filePreview && (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-contain bg-zinc-900 rounded-lg"
                      />
                    )}
                    {activeTab === 'audio' && (
                      <div className="bg-zinc-900 rounded-lg p-4">
                        <audio controls src={filePreview} className="w-full" />
                      </div>
                    )}
                    {activeTab === 'video' && filePreview && (
                      <video 
                        src={filePreview} 
                        controls 
                        className="w-full h-48 object-contain bg-zinc-900 rounded-lg"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-zinc-800/80 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <Button
                onClick={analyzeFile}
                disabled={!selectedFile || analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                data-testid="analyze-btn"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Detectar Deepfake
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Resultado del Analisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Sube un archivo para analizarlo</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Risk Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${riskConfig?.color} mb-4`}>
                      <span className="text-3xl font-bold text-white">{result.risk_score}</span>
                    </div>
                    <p className={`text-xl font-bold ${riskConfig?.text}`}>
                      {result.is_deepfake ? 'DEEPFAKE DETECTADO' : 'PARECE AUTENTICO'}
                    </p>
                    <Badge className={`mt-2 ${riskConfig?.color}`}>
                      Riesgo {riskConfig?.label}
                    </Badge>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Confianza del analisis</span>
                      <span className="text-white">{result.confidence}%</span>
                    </div>
                    <Progress value={result.confidence} className="h-2" />
                  </div>

                  {/* Indicators */}
                  {result.indicators?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        Indicadores Detectados ({result.indicators.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.indicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              indicator.severity === 'HIGH' ? 'bg-red-900/20 border-red-700' :
                              indicator.severity === 'MEDIUM' ? 'bg-yellow-900/20 border-yellow-700' :
                              'bg-zinc-800 border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-white text-sm font-medium">{indicator.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {indicator.confidence}%
                              </Badge>
                            </div>
                            <p className="text-zinc-400 text-xs mt-1">{indicator.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Recomendaciones
                      </h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-zinc-300 text-sm flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Education Section */}
        {education && (
          <Card className="mt-8 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-400" />
                {education.what_is_deepfake?.title}
              </CardTitle>
              <CardDescription className="text-zinc-300">
                {education.what_is_deepfake?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Riesgos de los Deepfakes</h4>
                  <div className="space-y-2">
                    {education.what_is_deepfake?.risks?.map((risk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-300 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">Como Protegerte</h4>
                  <div className="space-y-2">
                    {education.protection_tips?.slice(0, 5).map((tip, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-300 text-sm">
                        <Shield className="h-4 w-4 text-green-400" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeepfakeShield;
