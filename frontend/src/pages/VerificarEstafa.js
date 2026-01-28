import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Shield, Phone, Mail, AlertTriangle, CheckCircle, Search, 
  XCircle, Globe, Users, TrendingUp, Send, Landmark,
  AlertOctagon, Info, ExternalLink, Cloud, Database, Zap, RefreshCw
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const VerificarEstafa = () => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'phone',
    value: '',
    description: '',
    category: 'phishing',
    reporter_email: ''
  });

  useEffect(() => {
    fetchStats();
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Introduce un número o email para verificar');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/fraud/public/verify-scam?value=${encodeURIComponent(searchValue)}&type=${searchType}`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error('Error al verificar');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    
    if (!reportData.value.trim()) {
      toast.error('Introduce el número o email a reportar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/fraud/public/report-scam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">ManoBank</span>
              <span className="text-xs text-slate-400 block">Base de Datos Antifraude</span>
            </div>
          </div>
          <a 
            href="/manobank-promo" 
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Ir a ManoBank <ExternalLink className="w-4 h-4" />
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
          
          {/* Cloud Badge - Firebase Connected */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-full px-4 py-2 mt-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Conectado a Firebase Cloud</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              <span>Google Firestore</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Tiempo Real</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Público</span>
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
        <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700">
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
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 ManoBank S.A. · CIF: B19427723 · Servicio de verificación antifraude</p>
          <p className="mt-2">
            Si has sido víctima de una estafa, denúncialo a la Policía Nacional o Guardia Civil
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VerificarEstafa;
