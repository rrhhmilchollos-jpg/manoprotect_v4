import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Download, FileText, TrendingUp, Users, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Downloads = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (docType, filename) => {
    setDownloading(docType);
    try {
      const response = await fetch(`${API}/download/${docType}`);
      
      if (!response.ok) {
        throw new Error('Error al descargar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.pdf', '.md'); // Download as markdown
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${filename.replace('.pdf', '.md')} descargado correctamente`);
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
      filename: 'MANO_Plan_de_Negocio_2025.pdf',
      size: '2.8 MB',
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
      filename: 'MANO_Financial_Model_2025-2029.pdf',
      size: '850 KB',
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
      filename: 'MANO_Pitch_Deck_Pre-Seed.pdf',
      size: '3.2 MB',
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
      filename: 'MANO_Dossier_Comercial_B2B.pdf',
      size: '1.5 MB',
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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="bg-indigo-600 text-white px-4 py-2 text-sm mb-6">
            Documentación Oficial para Inversores
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Centro de <span className="text-indigo-600">Descargas</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Accede a toda la documentación comercial y financiera de MANO. 
            Perfecta para due diligence, presentaciones y análisis de inversión.
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {documents.map((doc) => (
            <Card 
              key={doc.id}
              className={`border-2 hover:border-${doc.color}-400 transition-all card-hover bg-white`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-${doc.color}-100 flex items-center justify-center`}>
                    <doc.icon className={`w-7 h-7 text-${doc.color}-600`} />
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
                  className={`w-full bg-${doc.color}-600 hover:bg-${doc.color}-700 text-white rounded-lg h-12 shadow-sm active:scale-95 transition-all`}
                >
                  {downloading === doc.id ? (
                    'Descargando...'
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-2xl">¿Necesitas más información?</CardTitle>
            <CardDescription className="text-base">
              Estamos disponibles para responder cualquier pregunta sobre MANO
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
            <Shield className="w-6 h-6 text-zinc-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-zinc-700">
              <p className="font-semibold mb-2">Aviso de Confidencialidad</p>
              <p>
                Estos documentos contienen información confidencial y están destinados únicamente 
                para inversores potenciales y partners estratégicos. Las proyecciones financieras 
                están basadas en assumptions razonables pero no constituyen garantías. 
                Prohibida su distribución sin autorización escrita de MANO.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;