/**
 * ManoProtect - Final CTA Section
 * Enfoque: Localización Familiar + SOS
 */
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CTASection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="px-6 py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <MapPin className="w-8 h-8 text-white" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Localiza a tu familia y protégelos hoy
        </h2>
        <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
          Sabe dónde están tus seres queridos en todo momento. Con el botón SOS pueden pedirte ayuda con un clic.
        </p>

        {/* Emotional message */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
          <Heart className="w-5 h-5 text-red-300" />
          <span className="text-white font-medium">La tranquilidad de saber que tu familia está bien</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            data-testid="final-cta-primary"
            size="lg"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-full px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isAuthenticated ? 'Ir a Mi Panel' : 'Probar 7 Días Gratis'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            data-testid="final-cta-secondary"
            variant="outline"
            size="lg"
            onClick={() => navigate('/plans')}
            className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg font-semibold transition-all"
          >
            Ver Planes Familiares
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Sin tarjeta de crédito
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Cancela cuando quieras
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            +10.000 familias protegidas
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
