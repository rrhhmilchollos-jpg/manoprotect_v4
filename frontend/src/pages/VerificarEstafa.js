import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Shield, Phone, Mail, AlertTriangle, CheckCircle, Search, 
  XCircle, Globe, Users, TrendingUp, Send, Landmark,
  AlertOctagon, Info, ExternalLink, Cloud, Database, Zap, RefreshCw,
  MessageSquare, Bell, ArrowRight, Share2, Copy, Check
} from 'lucide-react';
import AlertSubscription from '../components/AlertSubscription';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const VerificarEstafa = () => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'phone',
    value: '',
    description: '',
    category: 'phishing',
    reporter_email: ''
  });

  // Share functionality
  const getShareText = () => {
    if (!result?.is_scam || !searchValue) return '';
    const type = searchType === 'phone' ? 'número' : 'email';
    return `⚠️ ALERTA DE ESTAFA: El ${type} ${searchValue} ha sido reportado como fraudulento. Verifica cualquier contacto sospechoso en ManoProtect.com/verificar-estafa`;
  };

  const handleShare = async (platform) => {
    const text = getShareText();
    const url = 'https://manoprotect.com/verificar-estafa';
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Alerta de Estafa - ManoProtect',
          text: text,
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
      return;
    }

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Texto copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Error al copiar');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentAlerts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fraud/public/scam-stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts/history?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Introduce un número, email o URL para verificar');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Use REAL threat intelligence APIs
      let endpoint = '';
      let body = {};
      
      if (searchType === 'phone') {
        endpoint = '/api/realtime/check/phone';
        body = { phone: searchValue, country_code: 'ES' };
      } else if (searchType === 'email') {
        endpoint = '/api/realtime/check/email';
        body = { email: searchValue };
      } else if (searchType === 'url') {
        endpoint = '/api/realtime/check/url';
        body = { url: searchValue };
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      // Transform response for UI
      setResult({
        is_scam: !data.is_safe,
        risk_score: data.risk_score,
        reports_count: data.checks?.find(c => c.source === 'ManoProtect Community')?.reports || 0,
        description: data.recommendation,
        checks: data.checks || [],
        warnings: data.warnings || [],
        database_status: data.database_status || 'LIVE'
      });
    } catch (error) {
      toast.error('Error al verificar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    
    if (!reportData.value.trim()) {
      toast.error('Introduce el número, email o URL a reportar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/realtime/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scam_type: reportData.category,
          contact_info: reportData.value,
          description: reportData.description,
          reporter_email: reportData.reporter_email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setShowReportForm(false);
        setReportData({ type: 'phone', value: '', description: '', category: 'phishing', reporter_email: '' });
        fetchStats();
      } else {
        throw new Error(data.detail || 'Error al enviar reporte');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">ManoProtect</span>
              <span className="text-xs text-slate-400 block">Base de Datos Antifraude</span>
            </div>
          </div>
          <a 
            href="/" 
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Ir a ManoProtect <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Verificador de Estafas
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-4">
            Comprueba si un número de teléfono o email está en nuestra base de datos 
            de fraudes conocidos. Protégete contra estafas.
          </p>
          
          {/* Cloud Badge - REAL APIs Connected */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-full px-4 py-2 mt-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">APIs de Seguridad EN VIVO</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Google Safe Browsing</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>VirusTotal</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>AbuseIPDB</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
              <AlertOctagon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.total_reports}</p>
              <p className="text-sm text-slate-400">Reportes totales</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
              <Phone className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.phone_scams}</p>
              <p className="text-sm text-slate-400">Teléfonos fraudulentos</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
              <Mail className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.email_scams}</p>
              <p className="text-sm text-slate-400">Emails fraudulentos</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.verified}</p>
              <p className="text-sm text-slate-400">Verificados</p>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-400" />
            Verificar número o email
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSearchType('phone')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  searchType === 'phone' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Phone className="w-5 h-5" />
                Teléfono
              </button>
              <button
                type="button"
                onClick={() => setSearchType('email')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  searchType === 'email' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
            </div>

            <div className="relative">
              {searchType === 'phone' ? (
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              ) : (
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              )}
              <input
                type={searchType === 'email' ? 'email' : 'tel'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'phone' ? 'Ej: 600123456 o +34600123456' : 'Ej: estafa@ejemplo.com'}
                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Verificar
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-8 mb-8 ${
            result.is_scam 
              ? 'bg-red-900/50 border-2 border-red-500' 
              : 'bg-green-900/50 border-2 border-green-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                result.is_scam ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {result.is_scam ? (
                  <XCircle className="w-8 h-8 text-white" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${result.is_scam ? 'text-red-300' : 'text-green-300'}`}>
                  {result.is_scam ? '⚠️ ¡ALERTA DE ESTAFA!' : '✓ No encontrado'}
                </h3>
                <p className={`text-lg mb-4 ${result.is_scam ? 'text-red-200' : 'text-green-200'}`}>
                  {result.warning || result.message}
                </p>

                {result.is_scam && (
                  <>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm text-white ${getSeverityColor(result.severity)}`}>
                        Severidad: {result.severity}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm bg-slate-600 text-white">
                        Categoría: {result.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm bg-slate-600 text-white">
                        Reportado {result.report_count} veces
                      </span>
                    </div>

                    <div className="bg-red-950/50 rounded-xl p-4">
                      <p className="font-semibold text-red-200 mb-2">Recomendaciones:</p>
                      <ul className="space-y-2">
                        {result.advice?.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-red-100">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Share Buttons */}
                    <div className="mt-6 pt-4 border-t border-red-700/50">
                      <p className="text-sm text-red-200 mb-3 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Comparte esta alerta para proteger a otros:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {/* WhatsApp */}
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
                          data-testid="share-whatsapp"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </button>
                        
                        {/* Twitter/X */}
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                          data-testid="share-twitter"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X
                        </button>
                        
                        {/* Facebook */}
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                          data-testid="share-facebook"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </button>
                        
                        {/* Telegram */}
                        <button
                          onClick={() => handleShare('telegram')}
                          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors text-sm font-medium"
                          data-testid="share-telegram"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          Telegram
                        </button>
                        
                        {/* Copy Link */}
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm font-medium"
                          data-testid="share-copy"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar
                            </>
                          )}
                        </button>
                        
                        {/* Native Share (mobile) */}
                        {navigator.share && (
                          <button
                            onClick={() => handleShare('native')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
                            data-testid="share-native"
                          >
                            <Share2 className="w-4 h-4" />
                            Más
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!result.is_scam && (
                  <div className="bg-green-950/50 rounded-xl p-4">
                    <p className="text-green-200 mb-2">{result.disclaimer}</p>
                    <ul className="space-y-2 mt-3">
                      {result.tips?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-green-100">
                          <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowReportForm(!showReportForm)}
            variant="outline"
            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Reportar número/email sospechoso
          </Button>
        </div>

        {/* Report Form */}
        {showReportForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/50 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-orange-400" />
              Reportar posible estafa
            </h2>

            <form onSubmit={handleReport} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportData({ ...reportData, type: 'phone' })}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm ${
                    reportData.type === 'phone' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <Phone className="w-4 h-4" /> Teléfono
                </button>
                <button
                  type="button"
                  onClick={() => setReportData({ ...reportData, type: 'email' })}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm ${
                    reportData.type === 'email' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <input
                type={reportData.type === 'email' ? 'email' : 'tel'}
                value={reportData.value}
                onChange={(e) => setReportData({ ...reportData, value: e.target.value })}
                placeholder={reportData.type === 'phone' ? 'Número de teléfono' : 'Dirección de email'}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                required
              />

              <select
                value={reportData.category}
                onChange={(e) => setReportData({ ...reportData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
              >
                <option value="phishing">Phishing (suplantación)</option>
                <option value="smishing">Smishing (SMS fraudulento)</option>
                <option value="vishing">Vishing (llamada fraudulenta)</option>
                <option value="scam">Estafa económica</option>
                <option value="spam">Spam persistente</option>
                <option value="other">Otro</option>
              </select>

              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                placeholder="Describe brevemente qué ocurrió (opcional)"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white h-24 resize-none"
              />

              <input
                type="email"
                value={reportData.reporter_email}
                onChange={(e) => setReportData({ ...reportData, reporter_email: e.target.value })}
                placeholder="Tu email (opcional, para seguimiento)"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white rounded-xl"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar reporte
              </Button>
            </form>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Verificación instantánea</h3>
              <p className="text-sm">
                Introduce cualquier número de teléfono o email y comprueba al instante 
                si está en nuestra base de datos de fraudes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. Base de datos colaborativa</h3>
              <p className="text-sm">
                Nuestra base de datos se actualiza constantemente con reportes de usuarios 
                y verificaciones de nuestro equipo antifraude.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. Reporta y ayuda</h3>
              <p className="text-sm">
                Si recibes un intento de estafa, repórtalo para proteger a otros usuarios. 
                Juntos hacemos internet más seguro.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Alerts Section */}
        {recentAlerts.length > 0 && (
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-800/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                Alertas de Seguridad Recientes
              </h2>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert, idx) => (
                <div key={alert.id || idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${
                      alert.risk_level === 'alto' ? 'bg-red-500' : 
                      alert.risk_level === 'medio' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          alert.risk_level === 'alto' ? 'bg-red-500/20 text-red-300' :
                          alert.risk_level === 'medio' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {alert.risk_level === 'alto' ? '🔴 Alto' : alert.risk_level === 'medio' ? '🟡 Medio' : '🟢 Bajo'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Subscription */}
        <div className="mb-8">
          <AlertSubscription variant="inline" />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 ManoProtect · Servicio de verificación antifraude</p>
          <p className="mt-2">
            Si has sido víctima de una estafa, denúncialo a la Policía Nacional o Guardia Civil
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VerificarEstafa;
