import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Phone, Mail, MessageSquare, Link as LinkIcon, ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Knowledge = () => {
  const navigate = useNavigate();
  const [knowledgeBase, setKnowledgeBase] = useState(null);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await axios.get(`${API}/knowledge-base`);
      setKnowledgeBase(response.data);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
  };

  const getThreatIcon = (id) => {
    switch(id) {
      case 'phishing': return Mail;
      case 'smishing': return MessageSquare;
      case 'vishing': return Phone;
      case 'identity-theft': return Shield;
      default: return AlertTriangle;
    }
  };

  if (!knowledgeBase) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-pulse" />
          <p className="text-zinc-600">Cargando base de conocimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" alt="ManoProtect Logo" className="h-7 w-auto" />
              <span className="text-xl font-bold">Base de Conocimiento</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Intro */}
        <Card className="mb-8 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Info className="w-6 h-6" />
              Conoce las amenazas digitales
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Aprende a identificar y protegerte de los fraudes más comunes en internet
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Threat Types */}
        <Tabs defaultValue={knowledgeBase.threat_types[0]?.id} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent">
            {knowledgeBase.threat_types.map((threat) => {
              const Icon = getThreatIcon(threat.id);
              return (
                <TabsTrigger
                  key={threat.id}
                  value={threat.id}
                  data-testid={`tab-${threat.id}`}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white border-2 border-zinc-200 h-auto py-3 rounded-lg"
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {threat.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {knowledgeBase.threat_types.map((threat) => {
            const Icon = getThreatIcon(threat.id);
            return (
              <TabsContent key={threat.id} value={threat.id} className="mt-6">
                <Card className="bg-white border-zinc-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      {threat.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {threat.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Indicators */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Señales de Alerta
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {threat.indicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200"
                          >
                            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                            <span className="text-sm text-orange-900">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prevention */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Cómo Protegerte
                      </h3>
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-emerald-900">{threat.prevention}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-zinc-200">
                      <Button
                        data-testid="analyze-now-btn"
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
                      >
                        Analizar Contenido Sospechoso
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* General Tips */}
        <Card className="mt-8 bg-white border-zinc-200">
          <CardHeader>
            <CardTitle>Consejos Generales de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Nunca compartas contraseñas o datos bancarios por teléfono, email o SMS",
                "Verifica siempre la identidad de quien te contacta por canales oficiales",
                "Desconfía de mensajes que crean urgencia o presión",
                "Usa autenticación de dos factores en todas tus cuentas importantes",
                "Mantén actualizados tus dispositivos y aplicaciones",
                "Revisa regularmente tus movimientos bancarios",
                "No hagas clic en enlaces de fuentes desconocidas",
                "Cuando tengas dudas, usa MANO para verificar"
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                  </div>
                  <span className="text-zinc-700">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Knowledge;