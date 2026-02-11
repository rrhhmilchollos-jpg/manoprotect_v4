/**
 * ManoProtect Shield - Main Security Hub Page
 * All advanced security features in one place
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, ArrowLeft, Fingerprint, Award, Brain, AlertTriangle, 
  Lock, Users, Building2, Zap, Globe, Phone, Wallet, Eye, 
  Vault, Navigation, Radio
} from 'lucide-react';

import UniversalVerifier from '@/components/shield/UniversalVerifier';
import VoiceShieldAI from '@/components/shield/VoiceShieldAI';
import DNADigital from '@/components/shield/DNADigital';
import TrustSeal from '@/components/shield/TrustSeal';
import AntiDeepfake from '@/components/shield/AntiDeepfake';
import DigitalInheritance from '@/components/shield/DigitalInheritance';
import SilentPanicMode from '@/components/shield/SilentPanicMode';
import SmartZones from '@/components/shield/SmartZones';
import ScamPredictor from '@/components/shield/ScamPredictor';
import PhishingSimulation from '@/components/shield/PhishingSimulation';

const FEATURES = [
  {
    id: 'verifier',
    name: 'Verificador Universal',
    description: 'Comprueba URLs, teléfonos, emails',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    badge: 'Popular'
  },
  {
    id: 'voice',
    name: 'Escudo de Voz AI',
    description: 'Detecta manipulación en llamadas',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    badge: 'IA'
  },
  {
    id: 'dna',
    name: 'DNA Digital',
    description: 'Identidad digital verificable',
    icon: Fingerprint,
    color: 'from-cyan-500 to-blue-500',
    badge: 'Único'
  },
  {
    id: 'seal',
    name: 'Sello de Confianza',
    description: 'Badge verificable empresas',
    icon: Award,
    color: 'from-amber-500 to-orange-500',
    badge: 'B2B'
  },
  {
    id: 'deepfake',
    name: 'Anti-Deepfake',
    description: 'Detecta videos/audios falsos',
    icon: Eye,
    color: 'from-rose-500 to-red-500',
    badge: 'Beta'
  },
  {
    id: 'vault',
    name: 'Herencia Digital',
    description: 'Bóveda segura para familia',
    icon: Vault,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Nuevo'
  },
  {
    id: 'panic',
    name: 'Modo Pánico',
    description: 'Alerta silenciosa de emergencia',
    icon: AlertTriangle,
    color: 'from-red-500 to-rose-500',
    badge: 'SOS'
  },
  {
    id: 'zones',
    name: 'Zonas Inteligentes',
    description: 'Aprendizaje de comportamiento',
    icon: Navigation,
    color: 'from-blue-500 to-indigo-500',
    badge: 'IA'
  }
];

const ShieldPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('verifier');

  const renderFeatureComponent = () => {
    switch (activeFeature) {
      case 'verifier':
        return <UniversalVerifier />;
      case 'voice':
        return <VoiceShieldAI />;
      case 'dna':
        return <DNADigital />;
      case 'seal':
        return <TrustSeal />;
      case 'deepfake':
        return <AntiDeepfake />;
      case 'vault':
        return <DigitalInheritance />;
      case 'panic':
        return <SilentPanicMode />;
      case 'zones':
        return <SmartZones />;
      default:
        return <UniversalVerifier />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ManoProtect Shield</h1>
              <p className="text-white/80">
                Centro de Seguridad Avanzada - Protección de Nueva Generación
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Feature Selector */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                activeFeature === feature.id
                  ? 'border-indigo-500 bg-white shadow-lg scale-[1.02]'
                  : 'border-zinc-200 bg-white/50 hover:border-indigo-300 hover:bg-white'
              }`}
            >
              {feature.badge && (
                <Badge 
                  className={`absolute -top-2 -right-2 text-xs ${
                    feature.badge === 'Nuevo' ? 'bg-pink-500' :
                    feature.badge === 'Revolucionario' ? 'bg-cyan-500' :
                    feature.badge === 'Empresas' ? 'bg-amber-500' :
                    'bg-indigo-500'
                  }`}
                >
                  {feature.badge}
                </Badge>
              )}
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-zinc-900">{feature.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{feature.description}</p>
            </button>
          ))}
        </div>

        {/* Active Feature Component */}
        <div className="mb-8">
          {renderFeatureComponent()}
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Privacidad Total</h3>
            <p className="text-sm text-zinc-600">
              Tus datos nunca salen de tu dispositivo. Analizamos patrones, no contenido.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Comunidad Protegida</h3>
            <p className="text-sm text-zinc-600">
              Miles de usuarios reportan estafas. Te alertamos antes de que te afecten.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">IA de Última Generación</h3>
            <p className="text-sm text-zinc-600">
              Detectamos tácticas de manipulación en tiempo real con inteligencia artificial.
            </p>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="bg-white/20 mb-3">Para Empresas</Badge>
              <h3 className="text-2xl font-bold mb-2">ManoProtect Enterprise</h3>
              <p className="text-white/80">
                Protege a tu empresa y clientes con el Sello de Confianza, 
                simulacros de phishing y verificación de transacciones.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-white text-indigo-600 hover:bg-white/90"
                onClick={() => setActiveFeature('seal')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Solicitar Sello
              </Button>
              <Button 
                variant="ghost" 
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => navigate('/pricing')}
              >
                Ver Planes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShieldPage;
