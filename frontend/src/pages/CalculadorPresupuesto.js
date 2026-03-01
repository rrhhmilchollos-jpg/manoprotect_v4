/**
 * ManoProtect - Calculador Interactivo de Presupuesto
 * El cliente selecciona su vivienda/negocio y recibe un presupuesto personalizado
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  Shield, Home, Building2, Camera, Check, ArrowRight, Zap,
  MapPin, Watch, ChevronRight, Calculator, Sparkles
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SPACE_TYPES = [
  { id: 'piso', label: 'Piso / Apartamento', icon: Home, color: 'sky' },
  { id: 'chalet', label: 'Chalet / Casa', icon: Home, color: 'orange' },
  { id: 'adosado', label: 'Adosado / Duplex', icon: Home, color: 'blue' },
  { id: 'local', label: 'Local comercial', icon: Building2, color: 'emerald' },
  { id: 'oficina', label: 'Oficina', icon: Building2, color: 'teal' },
  { id: 'nave', label: 'Nave / Almacen', icon: Building2, color: 'purple' },
];

const CalculadorPresupuesto = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ space_type: '', sqm: 80, accesses: 2, floors: 1, cameras_extra: 0, has_garden: false });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/budget-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      setStep(4);
    } catch {
      setResult({
        recommended_plan: form.space_type === 'piso' || form.space_type === 'apartamento' ? 'Essential' : form.space_type === 'chalet' || form.space_type === 'adosado' ? 'Premium' : 'Business',
        promo_price: form.space_type === 'piso' ? 24.99 : form.space_type === 'chalet' || form.space_type === 'adosado' ? 39.99 : 54.99,
        regular_price: form.space_type === 'piso' ? 34.99 : form.space_type === 'chalet' || form.space_type === 'adosado' ? 49.99 : 69.99,
        details: { sensors: form.accesses + form.floors, cameras: 2, sirens: 1, contacts: form.accesses, sentinel_included: 1 },
        savings_vs_securitas: 178.8,
      });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="calculador-presupuesto">
      <Helmet>
        <title>Calculador de Presupuesto | ManoProtect - Alarma personalizada</title>
        <meta name="description" content="Calcula el precio de tu alarma en 30 segundos. Presupuesto personalizado segun tu vivienda o negocio. Sin compromiso." />
      </Helmet>

      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md"><Shield className="w-5 h-5 text-white" /></div>
            <span className="text-gray-900 text-lg font-extrabold">ManoProtect</span>
          </Link>
          <Link to="/seguridad-hogar-empresa" className="text-gray-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            Ver kits <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Space type */}
        {step === 1 && (
          <div className="animate-in fade-in" data-testid="step-1">
            <div className="text-center mb-8">
              <Calculator className="w-10 h-10 text-blue-700 mx-auto mb-3" />
              <h1 className="text-2xl font-black text-gray-900 mb-2">Calcula tu presupuesto en 30 segundos</h1>
              <p className="text-gray-500 text-sm">Que tipo de espacio quieres proteger?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPACE_TYPES.map(t => (
                <button key={t.id} onClick={() => { setForm(f => ({ ...f, space_type: t.id })); setStep(2); }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:border-blue-400 ${form.space_type === t.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  data-testid={`type-${t.id}`}>
                  <t.icon className="w-6 h-6 text-blue-700 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">{t.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Size */}
        {step === 2 && (
          <div className="animate-in fade-in" data-testid="step-2">
            <div className="text-center mb-8">
              <MapPin className="w-10 h-10 text-blue-700 mx-auto mb-3" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Detalles del espacio</h2>
              <p className="text-gray-500 text-sm">Metros cuadrados y accesos</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Metros cuadrados: <span className="text-blue-700">{form.sqm} m2</span></label>
                <input type="range" min={30} max={500} value={form.sqm} onChange={e => setForm(f => ({ ...f, sqm: +e.target.value }))}
                  className="w-full accent-blue-700" data-testid="sqm-slider" />
                <div className="flex justify-between text-xs text-gray-400"><span>30 m2</span><span>500 m2</span></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Accesos (puertas exteriores): <span className="text-blue-700">{form.accesses}</span></label>
                <input type="range" min={1} max={8} value={form.accesses} onChange={e => setForm(f => ({ ...f, accesses: +e.target.value }))}
                  className="w-full accent-blue-700" data-testid="accesses-slider" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Plantas: <span className="text-blue-700">{form.floors}</span></label>
                <input type="range" min={1} max={5} value={form.floors} onChange={e => setForm(f => ({ ...f, floors: +e.target.value }))}
                  className="w-full accent-blue-700" data-testid="floors-slider" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Jardin o terraza exterior?</span>
                <button onClick={() => setForm(f => ({ ...f, has_garden: !f.has_garden }))}
                  className={`w-12 h-7 rounded-full transition-all ${form.has_garden ? 'bg-blue-700' : 'bg-gray-300'} relative`}
                  data-testid="garden-toggle">
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${form.has_garden ? 'left-6' : 'left-1'} shadow-md`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm">Atras</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors" data-testid="next-step2">Siguiente</button>
            </div>
          </div>
        )}

        {/* Step 3: Extras */}
        {step === 3 && (
          <div className="animate-in fade-in" data-testid="step-3">
            <div className="text-center mb-8">
              <Camera className="w-10 h-10 text-blue-700 mx-auto mb-3" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Camaras adicionales?</h2>
              <p className="text-gray-500 text-sm">Las basicas ya estan incluidas en tu kit</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Camaras extra: <span className="text-blue-700">{form.cameras_extra}</span></label>
              <input type="range" min={0} max={6} value={form.cameras_extra} onChange={e => setForm(f => ({ ...f, cameras_extra: +e.target.value }))}
                className="w-full accent-blue-700" data-testid="cameras-slider" />
              <p className="text-xs text-gray-400 mt-2">Cada camara extra se instala gratis durante la promocion</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm">Atras</button>
              <button onClick={calculate} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="calculate-btn">
                {loading ? 'Calculando...' : <><Sparkles className="w-4 h-4" /> Calcular presupuesto</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div className="animate-in fade-in" data-testid="step-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Tu presupuesto personalizado</h2>
              <p className="text-gray-500 text-sm">Plan recomendado: <strong className="text-blue-700">ManoProtect {result.recommended_plan}</strong></p>
            </div>
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-xl mb-6">
              <div className="text-center mb-6">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-black text-gray-900">{result.promo_price}</span>
                  <span className="text-gray-500 text-lg mb-1">EUR/mes</span>
                </div>
                <p className="text-orange-500 text-xs font-bold mt-1">Precio promocional 6 primeros meses</p>
                <p className="text-gray-400 text-xs">Despues {result.regular_price} EUR/mes</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Sensores', val: result.details.sensors },
                  { label: 'Camaras', val: result.details.cameras },
                  { label: 'Sirenas', val: result.details.sirens },
                  { label: 'Contactos', val: result.details.contacts },
                ].map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-700">{d.val}</p>
                    <p className="text-xs text-gray-500 font-medium">{d.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-6">
                {[
                  'Equipo e instalacion GRATIS',
                  'SIN permanencia',
                  'Centro de control 24h incluido',
                  `${result.details.sentinel_included} Sentinel SOS de REGALO`,
                  'Anti-inhibicion avanzada',
                  'App ManoProtect incluida',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              {result.savings_vs_securitas > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center mb-4">
                  <p className="text-emerald-700 text-sm font-bold">Ahorras {result.savings_vs_securitas} EUR/ano vs Securitas Direct</p>
                </div>
              )}
              <button onClick={() => navigate('/contacto')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:shadow-xl transition-all"
                data-testid="cta-result">
                Solicitar instalacion GRATIS
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setResult(null); }}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm">Recalcular</button>
              <Link to="/seguridad-hogar-empresa"
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
                Ver kits <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <LandingFooter />
    </div>
  );
};

export default CalculadorPresupuesto;
