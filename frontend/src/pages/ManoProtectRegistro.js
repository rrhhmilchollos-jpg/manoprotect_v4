import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  Check, ArrowRight, ArrowLeft, CreditCard,
  Loader2, AlertCircle, Star, Heart
} from 'lucide-react';
import { trackCTAClick, trackCheckoutStart } from '@/services/conversionTracking';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const cardStyle = {
  style: {
    base: { fontSize: '16px', color: '#1f2937', fontFamily: 'Inter, system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } },
    invalid: { color: '#ef4444' }
  },
  hidePostalCode: true
};

const PLANS = [
  {
    id: 'familiar',
    stripeId: 'cro-monthly',
    name: 'Mensual',
    price: 9.99,
    period: 'mes',
    yearly: false,
    features: ['GPS en segundo plano 24/7', 'Alertas SOS instant\u00e1neas', 'Hasta 5 familiares', 'Zonas seguras', 'Notificaciones push']
  },
  {
    id: 'familiar-anual',
    stripeId: 'cro-yearly',
    name: 'Anual',
    price: 99.99,
    period: 'a\u00f1o',
    yearly: true,
    monthlyEq: 8.33,
    savings: 20,
    popular: true,
    features: ['Todo del Plan Mensual', 'Prioridad en soporte', 'Alertas por WhatsApp', 'Dispositivo GRATIS incluido', 'Garant\u00eda 14 d\u00edas']
  }
];

/* ── Registration Form ── */
const RegForm = ({ plan, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [cardOk, setCardOk] = useState(false);
  const [cardErr, setCardErr] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false, privacy: false });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Completa todos los campos obligatorios');
    if (form.password !== form.confirm) return toast.error('Las contrase\u00f1as no coinciden');
    if (form.password.length < 8) return toast.error('M\u00ednimo 8 caracteres');
    if (!form.terms || !form.privacy) return toast.error('Acepta t\u00e9rminos y privacidad');
    if (!stripe || !elements || !cardOk) return toast.error('Completa los datos de tarjeta');

    setLoading(true);
    trackCheckoutStart(plan.name);

    try {
      const card = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card', card, billing_details: { name: form.name, email: form.email, phone: form.phone || undefined }
      });
      if (error) throw new Error(error.message);

      const res = await fetch(`${API_URL}/api/subscriptions/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email, password: form.password, nombre: form.name,
          plan: plan.stripeId, periodo: plan.yearly ? 'anual' : 'mensual',
          payment_method_id: paymentMethod.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error en el registro');

      if (data.requires_action && data.client_secret) {
        toast.info('Verificando con tu banco...');
        const { error: confirmErr } = await stripe.confirmCardPayment(data.client_secret);
        if (confirmErr) throw new Error(confirmErr.message);
      }

      toast.success(data.message || 'Cuenta creada exitosamente');
      onSuccess(data);
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="registration-form">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Crea tu cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">
          Plan: <span className="font-semibold text-emerald-600">{plan.name}</span>
          {plan.yearly && <span className="text-emerald-500 ml-1">(solo {plan.monthlyEq}\u20ac/mes)</span>}
        </p>
        <p className="text-xs text-amber-600 mt-1">No se cobra durante los 7 d\u00edas de prueba</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="Tu nombre" data-testid="reg-name" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="tu@email.com" data-testid="reg-email" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{"Tel\u00e9fono m\u00f3vil"}</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="+34 600 000 000" data-testid="reg-phone" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{"Contrase\u00f1a *"}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required minLength={8}
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder={"M\u00edn. 8 car."} data-testid="reg-password" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={showPw ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)} required
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="Repetir" data-testid="reg-confirm" />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <CreditCard className="w-4 h-4 inline mr-1" /> {"Tarjeta de d\u00e9bito/cr\u00e9dito *"}
        </label>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 focus-within:ring-2 focus-within:ring-emerald-500">
          <CardElement options={cardStyle} onChange={e => { setCardErr(e.error?.message || null); setCardOk(e.complete); }} />
        </div>
        {cardErr && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{cardErr}</p>}
        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> PCI</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 3D Secure</span>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-100 text-sm">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.terms} onChange={e => set('terms', e.target.checked)}
            className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300" data-testid="reg-terms" />
          <span className="text-gray-600">Acepto los <Link to="/terms-of-service" className="text-emerald-600 underline">{"T\u00e9rminos"}</Link> *</span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={form.privacy} onChange={e => set('privacy', e.target.checked)}
            className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300" data-testid="reg-privacy" />
          <span className="text-gray-600">Acepto la <Link to="/privacy-policy" className="text-emerald-600 underline">{"Pol\u00edtica de Privacidad"}</Link> *</span>
        </label>
      </div>

      <div className="flex gap-3 pt-3">
        <Button type="button" variant="outline" className="flex-1 h-11" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-1" /> {"Atr\u00e1s"}
        </Button>
        <Button type="submit" className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600" disabled={loading || !form.terms || !form.privacy || !cardOk} data-testid="reg-submit">
          {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Procesando...</> : <>Empezar prueba gratis <ArrowRight className="w-4 h-4 ml-1" /></>}
        </Button>
      </div>
    </form>
  );
};

/* ── Main Page ── */
const ManoProtectRegistro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(PLANS.find(p => p.popular) || PLANS[0]);

  useEffect(() => {
    const p = searchParams.get('plan');
    if (p === 'mensual') setSelectedPlan(PLANS[0]);
    if (p === 'anual') setSelectedPlan(PLANS[1]);
  }, [searchParams]);

  const handleSuccess = (data) => {
    navigate('/trial-success', { state: { plan: selectedPlan.name, email: data.email, trialEnd: data.trial_end } });
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="registro-page">
      <Helmet>
        <title>{"Registro | ManoProtect - Protecci\u00f3n familiar 24/7"}</title>
        <meta name="description" content={"Reg\u00edstrate en ManoProtect. Localiza a tu familia en segundos. Desde 9,99\u20ac/mes. 7 d\u00edas gratis."} />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100" data-testid="reg-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:601510950" className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-emerald-600">
              <Phone className="w-4 h-4" /> 601 510 950
            </a>
            <Link to="/login" className="text-gray-500 hover:text-emerald-600 font-medium">Ya tengo cuenta</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">1</div>
          <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="max-w-2xl mx-auto" data-testid="plan-selection">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Elige tu plan</h1>
              <p className="text-gray-500 mt-2">Todos incluyen 7 d\u00edas de prueba gratis. Cancela cuando quieras.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => { setSelectedPlan(plan); trackCTAClick('plan_select', plan.name); }}
                  className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                    selectedPlan.id === plan.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                  data-testid={`plan-card-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {"M\u00c1S POPULAR \u00b7 Ahorra "}{plan.savings}{"\u20ac"}
                    </div>
                  )}

                  {selectedPlan.id === plan.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="text-center pt-1">
                    <h3 className="font-bold text-lg text-gray-900">Plan {plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-extrabold text-gray-900">{plan.price.toFixed(2).replace('.', ',')}{"\u20ac"}</span>
                      <span className="text-gray-400 text-sm">/{plan.period}</span>
                    </div>
                    {plan.monthlyEq && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">Solo {plan.monthlyEq.toFixed(2).replace('.', ',')}{"\u20ac"}/mes</p>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 mt-6 text-base font-bold"
              onClick={() => { setStep(2); trackCheckoutStart(selectedPlan.name); }}
              data-testid="continue-btn"
            >
              Continuar con Plan {selectedPlan.name} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-5 text-xs text-gray-400 mt-5">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Pago seguro</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> 4.8/5</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-blue-400" /> Cancela cuando quieras</span>
            </div>

            <div className="text-center mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <Heart className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700 font-medium">{"Garant\u00eda de tranquilidad"}</p>
              <p className="text-xs text-gray-500 mt-1">{"Si en 7 d\u00edas no te convence, cancela sin compromiso. Sin preguntas."}</p>
            </div>
          </div>
        )}

        {step === 2 && stripePromise && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <Elements stripe={stripePromise}>
                <RegForm plan={selectedPlan} onBack={() => setStep(1)} onSuccess={handleSuccess} />
              </Elements>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManoProtectRegistro;
