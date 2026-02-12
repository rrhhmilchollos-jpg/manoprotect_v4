/**
 * Videos Demo IA - Generate AI demo videos with Sora 2
 * Demonstrates ManoProtect features through AI-generated videos
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Video, Play, Download, Loader2, ArrowLeft, Sparkles,
  AlertTriangle, MapPin, Shield, Eye, RefreshCw, CheckCircle,
  Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const DEMO_VIDEOS = [
  {
    id: 'sos_button',
    title: 'Botón SOS',
    description: 'Demostración del botón de pánico y alerta a familiares',
    prompt: 'A smartphone screen showing a red SOS emergency button being pressed, with an alert notification appearing on another phone in split screen. Modern UI, Spanish text "ALERTA SOS ENVIADA", clean design, 8 second demonstration video.',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-600',
    status: 'pending'
  },
  {
    id: 'family_locator',
    title: 'Localizador Familiar',
    description: 'GPS en vivo para mantener a tu familia conectada',
    prompt: 'A smartphone map application showing real-time family member locations with profile avatars, safe zone notifications appearing, and route tracking. Modern app interface, Spanish labels, smooth animations, professional demo video.',
    icon: MapPin,
    color: 'from-blue-500 to-indigo-600',
    status: 'pending'
  },
  {
    id: 'voice_shield',
    title: 'Escudo de Voz Anti-Estafas',
    description: 'IA que detecta llamadas fraudulentas en tiempo real',
    prompt: 'A phone call interface with AI voice analysis overlay detecting a scam caller. Red warning indicators, "ESTAFA DETECTADA" Spanish alert, caller ID verification failing, protection shield animation. Professional security app demo.',
    icon: Shield,
    color: 'from-purple-500 to-violet-600',
    status: 'pending'
  },
  {
    id: 'deepfake_detector',
    title: 'Detector de Deepfakes',
    description: 'Identifica videos y audios manipulados con IA',
    prompt: 'A video analysis interface scanning a video frame, detecting deepfake manipulation with visual overlays highlighting facial inconsistencies. Spanish UI showing "DEEPFAKE DETECTADO" warning, percentage confidence meter, professional security tool demonstration.',
    icon: Eye,
    color: 'from-amber-500 to-orange-600',
    status: 'pending'
  }
];

const VideosDemo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState(DEMO_VIDEOS);
  const [generating, setGenerating] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [totalGenerated, setTotalGenerated] = useState(0);

  // Load existing videos on mount
  useEffect(() => {
    loadExistingVideos();
  }, []);

  const loadExistingVideos = async () => {
    try {
      const response = await fetch(`${API}/demo-videos/list`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.videos) {
          setVideos(prev => prev.map(v => {
            const existing = data.videos.find(ev => ev.id === v.id);
            if (existing) {
              return { ...v, url: existing.url, status: 'ready' };
            }
            return v;
          }));
          setTotalGenerated(data.videos.length);
        }
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const generateVideo = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    setGenerating(videoId);
    setGenerationProgress(0);

    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 2, 90));
    }, 3000);

    try {
      const response = await fetch(`${API}/demo-videos/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          video_id: videoId,
          prompt: video.prompt,
          duration: 8
        })
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setGenerationProgress(100);
        
        setVideos(prev => prev.map(v => 
          v.id === videoId ? { ...v, url: data.url, status: 'ready' } : v
        ));
        setTotalGenerated(prev => prev + 1);
        
        toast.success(`Video "${video.title}" generado correctamente`);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al generar el video');
        setVideos(prev => prev.map(v => 
          v.id === videoId ? { ...v, status: 'error' } : v
        ));
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Error de conexión');
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, status: 'error' } : v
      ));
    } finally {
      setGenerating(null);
      setGenerationProgress(0);
    }
  };

  const generateAllVideos = async () => {
    const pendingVideos = videos.filter(v => v.status !== 'ready');
    for (const video of pendingVideos) {
      await generateVideo(video.id);
    }
  };

  const readyCount = videos.filter(v => v.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-indigo-950/30 to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Videos Demo IA
                <Badge className="bg-white/20 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sora 2
                </Badge>
              </h1>
              <p className="text-white/80">
                Genera videos demostrativos de 8 segundos con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{readyCount}/{videos.length}</p>
                  <p className="text-zinc-400 text-sm">Videos Listos</p>
                </div>
                <div className="h-12 w-px bg-zinc-700 hidden md:block" />
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-300">~2-5 min por video</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-zinc-300">8 segundos c/u</span>
                </div>
              </div>
              
              <Button
                onClick={generateAllVideos}
                disabled={generating !== null || readyCount === videos.length}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="generate-all-btn"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : readyCount === videos.length ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Todos Generados
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Todos ({videos.length - readyCount} pendientes)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generation Progress */}
        {generating && (
          <Card className="bg-indigo-900/30 border-indigo-700/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-white font-medium">
                    Generando: {videos.find(v => v.id === generating)?.title}
                  </p>
                  <p className="text-indigo-300 text-sm">
                    Esto puede tardar 2-5 minutos. No cierres la página.
                  </p>
                </div>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <p className="text-right text-indigo-300 text-sm mt-2">{generationProgress}%</p>
            </CardContent>
          </Card>
        )}

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="bg-zinc-800/50 border-zinc-700 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${video.color}`} />
              
              {/* Video Preview or Placeholder */}
              <div className="aspect-video bg-zinc-900 relative">
                {video.status === 'ready' && video.url ? (
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full object-cover"
                    poster={`/demo-posters/${video.id}.jpg`}
                    data-testid={`video-${video.id}`}
                  >
                    Tu navegador no soporta videos HTML5
                  </video>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${video.color} flex items-center justify-center mb-4`}>
                      <video.icon className="w-10 h-10 text-white" />
                    </div>
                    {video.status === 'error' ? (
                      <Badge variant="destructive">Error al generar</Badge>
                    ) : generating === video.id ? (
                      <Badge className="bg-indigo-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Generando...
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      {video.title}
                      {video.status === 'ready' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-1">{video.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                        <Clock className="w-3 h-3 mr-1" />
                        0:08
                      </Badge>
                      <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                        1280x720
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {video.status === 'ready' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          onClick={() => generateVideo(video.id)}
                          disabled={generating !== null}
                          data-testid={`regenerate-${video.id}`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        {video.url && (
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            asChild
                          >
                            <a href={video.url} download={`${video.id}_demo.mp4`}>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => generateVideo(video.id)}
                        disabled={generating !== null}
                        className={`bg-gradient-to-r ${video.color} hover:opacity-90`}
                        data-testid={`generate-${video.id}`}
                      >
                        {generating === video.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Generar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Generación con Sora 2 de OpenAI
            </CardTitle>
            <CardDescription className="text-zinc-300">
              Utilizamos la última tecnología de generación de video con IA para crear demostraciones realistas de nuestras funcionalidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Alta Calidad</h4>
                <p className="text-zinc-400 text-sm">Videos en HD 1280x720 con animaciones fluidas y profesionales</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Personalizado</h4>
                <p className="text-zinc-400 text-sm">Cada video está diseñado para mostrar características específicas de ManoProtect</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Descargable</h4>
                <p className="text-zinc-400 text-sm">Descarga los videos generados para usar en presentaciones o marketing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideosDemo;
