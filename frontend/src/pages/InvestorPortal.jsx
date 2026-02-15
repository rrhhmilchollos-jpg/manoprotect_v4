/**
 * InvestorPortal - Portal for approved investors to access documents
 * Requires verified Spanish fiscal company (CIF validated)
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, Download, Shield, CheckCircle, Building2, 
  Lock, AlertCircle, Loader2, ExternalLink, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Document categories
const DOCUMENT_CATEGORIES = {
  essential: {
    title: 'Documentos Esenciales',
    description: 'Información clave para la toma de decisiones',
    docs: ['one-pager', 'pitch-deck', 'business-plan']
  },
  financial: {
    title: 'Información Financiera',
    description: 'Proyecciones y modelos económicos',
    docs: ['financial-model', 'business-plan-full']
  },
  technical: {
    title: 'Documentación Técnica',
    description: 'Arquitectura y roadmap de producto',
    docs: ['roadmap-tecnico', 'pitch-deck-extended']
  },
  commercial: {
    title: 'Material Comercial',
    description: 'Información para partners y B2B',
    docs: ['dossier-b2b']
  }
};

const DOC_INFO = {
  'business-plan': {
    name: 'Plan de Negocio Completo',
    description: 'Visión, mercado, estrategia y proyecciones a 5 años',
    pages: '~50 páginas',
    icon: FileText
  },
  'financial-model': {
    name: 'Modelo Financiero',
    description: 'Proyecciones financieras detalladas con 3 escenarios',
    pages: '~15 páginas',
    icon: FileText
  },
  'pitch-deck': {
    name: 'Pitch Deck',
    description: 'Presentación ejecutiva para inversores',
    pages: '~20 slides',
    icon: FileText
  },
  'dossier-b2b': {
    name: 'Dossier Comercial B2B',
    description: 'Material para empresas y partnerships',
    pages: '~12 páginas',
    icon: FileText
  },
  'one-pager': {
    name: 'One Pager Ejecutivo',
    description: 'Resumen de inversión en una página',
    pages: '1 página',
    icon: FileText
  },
  'roadmap-tecnico': {
    name: 'Roadmap Técnico',
    description: 'Plan de desarrollo tecnológico y milestones',
    pages: '~10 páginas',
    icon: FileText
  },
  'business-plan-full': {
    name: 'Business Plan Extendido',
    description: 'Análisis completo con due diligence',
    pages: '~70 páginas',
    icon: FileText
  },
  'pitch-deck-extended': {
    name: 'Pitch Deck Extendido',
    description: 'Presentación con casos de uso y demo',
    pages: '~35 slides',
    icon: FileText
  }
};

const InvestorPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    try {
      // Check if user has investor role
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/investor/verify-access`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setHasAccess(data.has_access);
        setDownloadHistory(data.download_history || []);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docType) => {
    setDownloading(docType);
    try {
      const response = await fetch(`${API}/investor/download-pdf/${docType}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al descargar');
      }

      // Get HTML content and open in new tab for printing
      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.success(`${DOC_INFO[docType]?.name || docType} abierto - Usa Ctrl+P para imprimir como PDF`);
      
      // Refresh download history
      checkAccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // Not logged in - show registration CTA
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Portal de Inversores</h1>
          <p className="text-slate-300 mb-8">
            Accede a documentación exclusiva para inversores verificados. 
            Requerimos verificación de empresa fiscal española (CIF válido).
          </p>
          
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Proceso de verificación:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="text-slate-300">Registro con CIF de empresa española</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <span className="text-slate-300">Verificación por nuestro equipo (24-48h)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <span className="text-slate-300">Acceso completo a documentación</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/investor/register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Solicitar Acceso
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but no investor access - show pending/rejected status
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Acceso Restringido</h1>
          <p className="text-slate-300 mb-8">
            Tu cuenta no tiene acceso al portal de inversores. 
            Si ya has solicitado acceso, estamos revisando tu solicitud.
          </p>
          
          <Card className="bg-amber-900/30 border-amber-600/50 mb-8">
            <CardContent className="p-6">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-200">
                Las solicitudes se verifican en un plazo de 24-48 horas laborables. 
                Verificamos que la empresa esté registrada fiscalmente en España.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/investor/status')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Consultar Estado
            </Button>
            <Button
              onClick={() => navigate('/investor/register')}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Nueva Solicitud
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full access - show documents
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-emerald-400" />
              <Badge className="bg-emerald-600 text-white">Inversor Verificado</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white">Portal de Inversores</h1>
            <p className="text-slate-400">Documentación confidencial de ManoProtect</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            Volver al Inicio
          </Button>
        </div>

        {/* Verification Badge */}
        <Card className="bg-emerald-900/30 border-emerald-600/50 mb-8">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-emerald-200 font-medium">Empresa Verificada</p>
              <p className="text-emerald-300/70 text-sm">
                Tu empresa ha sido verificada como entidad fiscal española. 
                Tienes acceso completo a toda la documentación.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        {Object.entries(DOCUMENT_CATEGORIES).map(([categoryKey, category]) => (
          <div key={categoryKey} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">{category.title}</h2>
            <p className="text-slate-400 mb-4">{category.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.docs.map(docType => {
                const doc = DOC_INFO[docType];
                if (!doc) return null;
                
                const DocIcon = doc.icon;
                const isDownloading = downloading === docType;
                
                return (
                  <Card 
                    key={docType} 
                    className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-indigo-600/30 rounded-lg flex items-center justify-center">
                          <DocIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          {doc.pages}
                        </Badge>
                      </div>
                      
                      <h3 className="text-white font-semibold mb-1">{doc.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{doc.description}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(docType)}
                          disabled={isDownloading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          size="sm"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Download History */}
        {downloadHistory.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tu Historial de Descargas</CardTitle>
              <CardDescription>Últimos documentos consultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {downloadHistory.slice(0, 10).map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-white">{DOC_INFO[item.doc_type]?.name || item.doc_type}</span>
                    </div>
                    <span className="text-slate-500 text-sm">
                      {new Date(item.downloaded_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Documento confidencial. Distribución restringida a inversores verificados.
            <br />
            © 2026 ManoProtect - Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestorPortal;
