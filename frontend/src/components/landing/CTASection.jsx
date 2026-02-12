/**
 * ManoProtect - Final CTA Section
 * Clean, conversion-focused call to action
 */
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CTASection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="px-6 py-20 bg-gradient-to-br from-indigo-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Shield className="w-8 h-8 text-white" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Empieza a proteger a tu familia hoy
        </h2>
        <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
          7 días gratis, sin tarjeta de crédito. Cancela cuando quieras.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            data-testid="final-cta-primary"
            size="lg"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isAuthenticated ? 'Ir a Mi Panel' : 'Crear Cuenta Gratis'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            data-testid="final-cta-secondary"
            variant="outline"
            size="lg"
            onClick={() => navigate('/plans')}
            className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg font-semibold transition-all"
          >
            Ver Planes y Precios
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Sin compromiso
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            RGPD Compliant
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Empresa española
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
