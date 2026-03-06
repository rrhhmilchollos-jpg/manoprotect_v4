import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Package, Truck, Clock, Gift, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const PromoSentinelGracias = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingDone, setShippingDone] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: '', telefono: '', direccion: '',
    codigo_postal: '', ciudad: '', provincia: '', pais: 'España', notas: ''
  });

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        await fetch(`${API}/api/promo/sentinel-s/confirm/${orderId}`, { method: 'POST' });
        const res = await fetch(`${API}/api/promo/sentinel-s/order/${orderId}`);
        const data = await res.json();
        setOrder(data);
        if (data.shipping) setShippingDone(true);
      } catch { toast.error('Error al cargar el pedido'); }
      finally { setLoading(false); }
    };
    load();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.telefono || !form.direccion || !form.codigo_postal || !form.ciudad || !form.provincia) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/promo/sentinel-s/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, order_id: orderId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShippingDone(true);
      } else {
        toast.error(data.detail || 'Error al guardar');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  if (!orderId || !order) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-center p-6">
      <div><h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
        <Link to="/" className="text-emerald-400 hover:underline">Volver al inicio</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white" data-testid="promo-gracias-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 py-3 px-4 text-center text-sm font-bold">
        <Gift className="w-4 h-4 inline mr-2" />
        Promoción TikTok — Sentinel S GRATIS con tu suscripción
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/30">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3" data-testid="promo-success-title">
            Pago confirmado
          </h1>
          <p className="text-slate-400 text-lg">Tu Sentinel S está reservado</p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8" data-testid="promo-order-summary">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">Resumen del pedido</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Pedido</span><span className="font-mono text-emerald-400">{order.order_id}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Plan</span><span>{order.plan_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Importe suscripción</span><span>{order.amount}€/{order.plan_type?.includes('yearly') ? 'año' : 'mes'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Sentinel S</span><span className="text-emerald-400 font-bold">GRATIS (0,00€)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Código regalo</span><span className="font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">{order.gift_code}</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Envío en un plazo máximo de 60 días a los primeros 100 suscriptores</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-400" /> Estado del envío</h2>
          <div className="space-y-4">
            {[
              { label: 'Pago confirmado', done: true },
              { label: 'Datos de envío recibidos', done: shippingDone },
              { label: 'Sentinel S en preparación', done: order.status === 'shipped' || order.status === 'delivered' },
              { label: 'Enviado', done: order.status === 'shipped' || order.status === 'delivered', tracking: order.tracking?.tracking_number },
              { label: 'Entregado', done: order.status === 'delivered' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {step.done ? <Check className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <div>
                  <span className={step.done ? 'text-emerald-400 font-medium' : 'text-slate-500'}>{step.label}</span>
                  {step.tracking && <span className="block text-xs text-slate-500 mt-0.5">Tracking: {step.tracking}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Form */}
        {!shippingDone ? (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6" data-testid="promo-shipping-form">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" /> Dirección de envío
            </h2>
            <p className="text-sm text-slate-400 mb-6">Introduce tu dirección para recibir el Sentinel S</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Nombre completo *</label>
                <input data-testid="shipping-nombre" type="text" value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Tu nombre completo" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Teléfono *</label>
                <input data-testid="shipping-telefono" type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="+34 600 000 000" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">País</label>
                <input type="text" value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Dirección completa *</label>
                <input data-testid="shipping-direccion" type="text" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Calle, número, piso, puerta..." />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Código postal *</label>
                <input data-testid="shipping-cp" type="text" value={form.codigo_postal} onChange={e => setForm({ ...form, codigo_postal: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="28001" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ciudad *</label>
                <input data-testid="shipping-ciudad" type="text" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Madrid" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Provincia *</label>
                <input data-testid="shipping-provincia" type="text" value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Madrid" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notas adicionales</label>
                <input type="text" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Portero, horario entrega..." />
              </div>
            </div>

            <button type="submit" disabled={submitting} data-testid="shipping-submit-btn"
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : <><Truck className="w-5 h-5" /> Confirmar dirección de envío</>}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center" data-testid="shipping-confirmed">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Dirección de envío confirmada</h3>
            <p className="text-slate-400 text-sm mb-4">Tu Sentinel S será enviado en un plazo máximo de 60 días.</p>
            <p className="text-slate-400 text-sm">Te notificaremos con el número de seguimiento cuando se envíe.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium" data-testid="promo-back-home">
            <Shield className="w-4 h-4" /> Volver a ManoProtect <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromoSentinelGracias;
