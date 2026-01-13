import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Download, FileText, TrendingUp, Users, Briefcase, ArrowLeft, CheckCircle, Lock, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const Downloads = () => {
  const navigate = useNavigate();
  const { user, isInvestor } = useAuth();
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (docType, filename, format = 'md') => {
    setDownloading(`${docType}-${format}`);
    try {
      const endpoint = format === 'pdf' 
        ? `${API}/investor/download-pdf/${docType}`
        : `${API}/investor/download/${docType}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Acceso denegado. Se requiere acceso de inversor aprobado.');
          navigate('/investor/register');
          return;
        }
        throw new Error('Error al descargar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'pdf' ? '.pdf' : '.md';
      a.download = filename.replace(/\.(pdf|md)$/, extension);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${filename.replace(/\.(pdf|md)$/, extension)} descargado correctamente`);
    } catch (error) {
      toast.error('Error al descargar el archivo');
      console.error('Download error:', error);
    } finally {
      setDownloading(null);
    }
  };

  const documents = [
    {
      id: 'business-plan',
      title: 'Plan de Negocio Completo',
      description: '120 páginas de documentación exhaustiva para inversores institucionales',
      icon: Briefcase,
      filename: 'MANO_Plan_de_Negocio_CONFIDENCIAL_2025.md',
      size: '72 KB',
      pages: '120 páginas',
      color: 'indigo',
      highlights: [
        'Análisis de mercado €12B TAM',
        'Proyecciones financieras 5 años',
        'ROI 100-160x en 4 años',
        'Estrategia go-to-market completa'
      ]
    },
    {
      id: 'financial-model',
      title: 'Modelo Financiero Detallado',
      description: 'Proyecciones mensuales, trimestrales y escenarios de sensibilidad',
      icon: TrendingUp,
      filename: 'MANO_Financial_Model_CONFIDENCIAL_2025.md',
      size: '10 KB',
      pages: '25 páginas',
      color: 'emerald',
      highlights: [
        'Unit economics (LTV/CAC 20x)',
        '3 escenarios: Best/Base/Worst',
        'Cash flow mensual detallado',
        '89 métricas SaaS clave'
      ]
    },
    {
      id: 'pitch-deck',
      title: 'Pitch Deck Inversores',
      description: '11 slides optimizadas para presentación a VCs y Business Angels',
      icon: FileText,
      filename: 'MANO_Pitch_Deck_CONFIDENCIAL_2025.md',
      size: '23 KB',
      pages: '11 slides',
      color: 'orange',
      highlights: [
        'Problema y solución clara',
        'Mercado €2.5B SAM',
        'Tracción actual validada',
        'Ask: €500K Pre-Seed'
      ]
    },
    {
      id: 'dossier-b2b',
      title: 'Dossier Comercial B2B',
      description: 'Propuesta de valor para bancos, ayuntamientos y empresas',
      icon: Users,
      filename: 'MANO_Dossier_B2B_CONFIDENCIAL_2025.md',
      size: '9 KB',
      pages: '47 páginas',
      color: 'blue',
      highlights: [
        'ROI +142% para bancos',
        'Casos de uso específicos',
        'Modelos de implementación',
        'Pricing personalizado'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
                alt="MANO Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-600 text-white">
              <Lock className="w-3 h-3 mr-1" />
              Acceso Verificado
            </Badge>
            <span className="text-sm text-zinc-600">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-amber-600 text-white px-4 py-2 text-sm mb-6">
            Documentación Confidencial para Inversores Verificados
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Centro de <span className="text-indigo-600">Descargas</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Accede a toda la documentación comercial y financiera de MANO. 
            Estos documentos son confidenciales y están protegidos por NDA implícito.
          </p>
        </div>

        {/* Confidentiality Notice */}
        <Card className="mb-12 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800 mb-2">Aviso de Confidencialidad</h3>
                <p className="text-amber-700 text-sm">
                  Los documentos disponibles en esta sección son <strong>estrictamente confidenciales</strong> y 
                  están destinados exclusivamente para su uso personal en la evaluación de inversión en MANO. 
                  Queda prohibida su distribución, reproducción o compartición sin autorización expresa por escrito.
                  Todas las descargas quedan registradas para auditoría.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {documents.map((doc) => (
            <Card 
              key={doc.id}
              className="border-2 hover:border-indigo-400 transition-all card-hover bg-white"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <doc.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-600">{doc.pages}</div>
                    <div className="text-xs text-zinc-500">{doc.size}</div>
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{doc.title}</CardTitle>
                <CardDescription className="text-base">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {doc.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-700">{highlight}</span>
                    </div>
                  ))}
                </div>
                <Button
                  data-testid={`download-${doc.id}`}
                  onClick={() => handleDownload(doc.id, doc.filename)}
                  disabled={downloading === doc.id}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12 shadow-sm active:scale-95 transition-all"
                >
                  {downloading === doc.id ? (
                    'Descargando...'
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Descargar Documento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl">¿Necesitas más información?</CardTitle>
            <CardDescription className="text-base">
              Nuestro equipo de relaciones con inversores está disponible para responder cualquier pregunta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="font-semibold mb-2 text-indigo-900">Email</div>
                <a href="mailto:inversores@mano-protect.com" className="text-indigo-600 hover:underline">
                  inversores@mano-protect.com
                </a>
              </div>
              <div>
                <div className="font-semibold mb-2 text-indigo-900">Teléfono</div>
                <a href="tel:+34900123456" className="text-indigo-600 hover:underline">
                  +34 900 123 456
                </a>
              </div>
              <div>
                <div className="font-semibold mb-2 text-indigo-900">Demo</div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-indigo-300 hover:bg-indigo-50 text-indigo-700"
                >
                  Ver Demo Live
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <div className="mt-12 p-6 bg-zinc-100 rounded-lg border border-zinc-200">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-zinc-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-zinc-700">
              <p className="font-semibold mb-2">Aviso Legal</p>
              <p>
                Estos documentos contienen información confidencial protegida por acuerdos de no divulgación. 
                Las proyecciones financieras están basadas en supuestos razonables pero no constituyen garantías. 
                El acceso a esta documentación implica aceptación de las obligaciones de confidencialidad.
                <br/><br/>
                <strong>Usuario verificado:</strong> {user?.email} | <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
