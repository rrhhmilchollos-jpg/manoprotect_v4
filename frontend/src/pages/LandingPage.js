/**
 * ManoProtect - Landing de Alta Conversión
 * Enfocada en padres con hijos · Estrategia CRO completa
 * Hero emocional → Dolor → Solución → Prueba social → Precio anclado → CTA
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, Star, ChevronRight, MapPin, Lock, Phone, Shield, Users, Search, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Loader2, AlertTriangle, Zap, Eye, Bell, Clock, ArrowRight, Heart, Gift, Watch } from 'lucide-react';
import { toast } from 'sonner';
import LandingFooter from '@/components/landing/LandingFooter';

const API = process.env.REACT_APP_BACKEND_URL;

const productos = [
  { id: 1, nombre: 'Dispositivo SOS', descripcion: 'Localizador GPS con botón de emergencia', precio: 0, precioEnvio: 4.95, url: '/dispositivo-sos', imagen: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&h=100&fit=crop' },
  { id: 2, nombre: 'Plan Básico', descripcion: 'Protección esencial para tu familia', precio: 0, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
  { id: 3, nombre: 'Plan Premium', descripcion: 'Protección completa con todas las funciones', precio: 9.99, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
  { id: 4, nombre: 'Plan Familiar', descripcion: 'Protege a toda tu familia', precio: 14.99, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
];

const paginas = [
  { nombre: 'Cómo Funciona', url: '/como-funciona' },
  { nombre: 'Precios y Planes', url: '/pricing' },
  { nombre: 'Seguridad Familiar', url: '/seguridad-familiar' },
  { nombre: 'Contacto', url: '/contacto' },
];

const SOCIAL_PROOF_NAMES = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Carmen', 'David', 'Isabel'];
const SOCIAL_PROOF_CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza'];
const SOCIAL_PROOF_PRODUCTS = ['SENTINEL X Basic', 'SENTINEL J', 'SENTINEL S', 'Plan Familiar'];

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ productos: [], paginas: [] });
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofData, setSocialProofData] = useState({ name: '', city: '', product: '' });
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);
  const [activeUsers] = useState(() => 1847 + Math.floor(Math.random() * 200));
  const [promoData, setPromoData] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Load promo status
  useEffect(() => {
    fetch(`${API}/api/promo/sentinel-s/status`)
      .then(r => r.json())
      .then(d => setPromoData(d))
      .catch(() => {});
  }, []);

  const handlePromoCheckout = async (planType) => {
    setPromoLoading(true);
    try {
      const res = await fetch(`${API}/api/promo/sentinel-s/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType, origin_url: window.location.origin })
      });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error(data.detail || 'Error al procesar');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setPromoLoading(false); }
  };

  // Social proof
  useEffect(() => {
    const show = () => {
      setSocialProofData({
        name: SOCIAL_PROOF_NAMES[Math.floor(Math.random() * SOCIAL_PROOF_NAMES.length)],
        city: SOCIAL_PROOF_CITIES[Math.floor(Math.random() * SOCIAL_PROOF_CITIES.length)],
        product: SOCIAL_PROOF_PRODUCTS[Math.floor(Math.random() * SOCIAL_PROOF_PRODUCTS.length)]
      });
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 5000);
    };
    const t = setTimeout(show, 8000);
    const i = setInterval(show, 25000 + Math.random() * 20000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  // Exit intent popup
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitPopupShown) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitPopupShown]);

  // GA4 event tracking helper
  const trackEvent = (eventName, params = {}) => {
    if (window.gtag) window.gtag('event', eventName, params);
    if (window.fbq) window.fbq('track', eventName, params);
  };

  // URL hash
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#search') { setShowSearch(true); window.history.replaceState(null, '', location.pathname); }
    if (hash === '#cart') { setShowCart(true); window.history.replaceState(null, '', location.pathname); }
  }, [location]);

  // Cart
  useEffect(() => { const s = localStorage.getItem('manoprotect_cart'); if (s) setCart(JSON.parse(s)); }, []);
  useEffect(() => { localStorage.setItem('manoprotect_cart', JSON.stringify(cart)); }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('El carrito está vacío'); return; }
    const hasPayable = cart.some(item => item.precio > 0) || cartEnvio > 0;
    if (!hasPayable) { navigate('/dispositivo-sos'); return; }
    setCheckoutLoading(true);
    trackEvent('begin_checkout', { value: cartTotal + cartEnvio });
    try {
      const response = await fetch(`${API}/api/payments/cart/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ id: i.id, nombre: i.nombre, descripcion: i.descripcion || '', precio: i.precio, cantidad: i.cantidad, imagen: i.imagen })), shipping_cost: cartEnvio, origin_url: window.location.origin })
      });
      const data = await response.json();
      if (data.url) { localStorage.setItem('manoprotect_cart_backup', JSON.stringify(cart)); window.location.href = data.url; }
      else toast.error(data.error || 'Error al procesar');
    } catch { toast.error('Error de conexión'); } finally { setCheckoutLoading(false); }
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults({ productos: [], paginas: [] }); return; }
    const ql = q.toLowerCase();
    setSearchResults({
      productos: productos.filter(p => p.nombre.toLowerCase().includes(ql) || p.descripcion.toLowerCase().includes(ql)),
      paginas: paginas.filter(p => p.nombre.toLowerCase().includes(ql))
    });
  };

  const addToCart = (p) => {
    const ex = cart.find(i => i.id === p.id);
    if (ex) setCart(cart.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    else setCart([...cart, { ...p, cantidad: 1 }]);
  };
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const updateQuantity = (id, d) => setCart(cart.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + d) } : i));
  const cartTotal = cart.reduce((t, i) => t + i.precio * i.cantidad, 0);
  const cartEnvio = cart.length > 0 ? 4.95 : 0;
  const cartCount = cart.reduce((t, i) => t + i.cantidad, 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <Helmet>
        <title>ManoProtect - Localiza a tu familia en emergencias | GPS + SOS</title>
        <meta name="description" content="La app que permite localizar a tu familia en segundos en caso de emergencia. GPS en segundo plano + Botón SOS + Alertas. Prueba 7 días gratis." />
      </Helmet>

      {/* ============ HEADER SIMPLIFICADO ============ */}
      <header className="bg-white py-3 px-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40" data-testid="main-header">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#10B981] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#10B981] text-xl font-bold tracking-tight">ManoProtect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#como-funciona" className="hover:text-[#10B981] transition-colors" data-testid="nav-como-funciona">Cómo funciona</a>
          <a href="#precios" className="hover:text-[#10B981] transition-colors" data-testid="nav-precios">Precios</a>
          <a href="#seguridad" className="hover:text-[#10B981] transition-colors" data-testid="nav-seguridad">Seguridad</a>
          <Link to="/contacto" className="hover:text-[#10B981] transition-colors" data-testid="nav-contacto">Contacto</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-[#10B981] transition-colors" data-testid="nav-login">
            Mi Cuenta
          </Link>
          <button onClick={() => setShowCart(true)} className="relative text-gray-600 hover:text-[#10B981]" data-testid="cart-btn">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#10B981] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>
          <button onClick={() => setShowSearch(true)} className="text-gray-600 hover:text-[#10B981]" data-testid="search-btn">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============ SEARCH MODAL ============ */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
          <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar productos, planes..." className="flex-1 text-lg outline-none" value={searchQuery} onChange={e => handleSearch(e.target.value)} autoFocus />
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4">
              {searchResults.productos.map(p => (
                <Link key={p.id} to={p.url} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-1"><p className="font-bold text-gray-800 text-sm">{p.nombre}</p><p className="text-xs text-gray-500">{p.descripcion}</p></div>
                  <span className="text-[#10B981] font-bold text-sm">{p.precio === 0 ? 'GRATIS' : `${p.precio}€`}</span>
                </Link>
              ))}
              {searchResults.paginas.map(p => (
                <Link key={p.nombre} to={p.url} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{p.nombre}</span>
                </Link>
              ))}
              {searchQuery.length >= 2 && searchResults.productos.length === 0 && searchResults.paginas.length === 0 && (
                <p className="text-center text-gray-400 py-4">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ CART MODAL ============ */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Tu carrito ({cartCount})</h3>
              <button onClick={() => setShowCart(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3" /><p>Carrito vacío</p></div>
              ) : cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <div className="flex-1"><p className="font-semibold text-sm text-gray-900">{item.nombre}</p><p className="text-xs text-gray-500">{item.precio === 0 ? 'GRATIS' : `${item.precio}€`}</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border rounded flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border rounded flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{cartTotal === 0 ? 'GRATIS' : `${cartTotal.toFixed(2)}€`}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Envío</span><span>{cartEnvio.toFixed(2)}€</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="text-[#10B981]">{(cartTotal + cartEnvio).toFixed(2)}€</span></div>
                <button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-[#10B981] text-white py-3 rounded-xl font-bold hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 disabled:opacity-50" data-testid="checkout-btn">
                  {checkoutLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</> : <><CreditCard className="w-5 h-5" /> Pagar</>}
                </button>
                <p className="text-[10px] text-center text-gray-400">Pago seguro con Stripe · SSL cifrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ HERO — IMPACTO EMOCIONAL ============ */}
      <section className="relative bg-gradient-to-br from-slate-50 to-white overflow-hidden" data-testid="hero-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">{activeUsers.toLocaleString()} familias protegidas</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                <span className="text-xs text-gray-500 ml-1">4.8/5</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-5" data-testid="hero-title">
              ¿Y si tu hijo no responde al móvil durante
              <span className="text-[#10B981]"> 40 minutos</span>?
            </h1>

            <p className="text-lg text-gray-500 mb-8 max-w-xl leading-relaxed">
              ManoProtect te permite <strong className="text-gray-800">localizar a tu hijo en segundos</strong> y recibir alertas SOS en caso de emergencia, incluso con la app cerrada.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                to="/sentinel-x"
                onClick={() => trackEvent('cta_click', { location: 'hero', label: 'proteger_hijo' })}
                className="inline-flex items-center gap-2 bg-[#10B981] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#059669] transition-all text-base shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02]"
                data-testid="hero-cta-main"
              >
                <Shield className="w-5 h-5" /> Proteger a Mi Hijo Ahora
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-6 py-4 rounded-xl hover:border-[#10B981] hover:text-[#10B981] transition-all text-base"
                data-testid="hero-cta-how"
              >
                Cómo funciona <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#10B981]" /><span>Prueba gratuita 7 días</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#10B981]" /><span>Cancelación en cualquier momento</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#10B981]" /><span>Protección 24/7</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROMO SENTINEL S — TIKTOK CAMPAIGN ============ */}
      {promoData && promoData.active && (
        <section className="relative overflow-hidden" id="promo-sentinel" data-testid="promo-sentinel-section">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }} />
          
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-14">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Text */}
              <div className="text-center lg:text-left">
                {/* Urgency badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-bold mb-4 animate-pulse">
                  <Gift className="w-4 h-4" />
                  OFERTA LIMITADA — Solo {promoData.remaining} de {promoData.total} disponibles
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4" data-testid="promo-title">
                  Sentinel S
                  <span className="block text-yellow-200">GRATIS</span>
                  <span className="block text-xl sm:text-2xl font-bold mt-1 text-white/90">con tu suscripción</span>
                </h2>
                
                <p className="text-white/80 text-base mb-6 max-w-md mx-auto lg:mx-0">
                  Suscríbete a ManoProtect y llévate un <strong className="text-white">reloj Sentinel S valorado en 149€</strong> completamente gratis. Campaña exclusiva TikTok.
                </p>

                {/* Counter bar */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-6 max-w-md mx-auto lg:mx-0" data-testid="promo-counter">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">Unidades reclamadas</span>
                    <span className="text-yellow-300 font-bold">{promoData.claimed}/{promoData.total}</span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, (promoData.claimed / promoData.total) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Envío máx. 60 días a los 100 primeros suscriptores
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                  <button
                    onClick={() => handlePromoCheckout('sentinel-promo-monthly')}
                    disabled={promoLoading}
                    className="flex-1 bg-white text-red-600 font-extrabold py-4 px-6 rounded-xl hover:bg-yellow-50 transition-all hover:scale-[1.02] shadow-xl text-center disabled:opacity-50"
                    data-testid="promo-cta-monthly"
                  >
                    {promoLoading ? 'Procesando...' : <>9,99€/mes<br /><span className="text-xs font-semibold text-red-400">+ Sentinel S GRATIS</span></>}
                  </button>
                  <button
                    onClick={() => handlePromoCheckout('sentinel-promo-yearly')}
                    disabled={promoLoading}
                    className="flex-1 bg-yellow-400 text-black font-extrabold py-4 px-6 rounded-xl hover:bg-yellow-300 transition-all hover:scale-[1.02] shadow-xl text-center relative disabled:opacity-50"
                    data-testid="promo-cta-yearly"
                  >
                    <span className="absolute -top-2.5 right-3 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">AHORRA 20€</span>
                    {promoLoading ? 'Procesando...' : <>99,99€/año<br /><span className="text-xs font-semibold text-black/60">+ Sentinel S GRATIS</span></>}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 1 por usuario</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Sin permanencia</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Pago seguro Stripe</span>
                </div>
              </div>

              {/* Right: Product showcase */}
              <div className="flex justify-center order-first lg:order-last">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-75" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
                    <div className="absolute -top-4 -right-4 bg-red-500 text-white font-black text-sm px-4 py-2 rounded-xl rotate-6 shadow-lg">
                      GRATIS
                    </div>
                    <Watch className="w-32 h-32 text-white/90 mx-auto mb-4 drop-shadow-2xl" />
                    <h3 className="text-white font-bold text-xl mb-1">SENTINEL S</h3>
                    <p className="text-white/60 text-sm mb-3">Reloj GPS + SOS para mayores</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-yellow-300">0€</span>
                      <span className="text-white/40 line-through text-lg">149€</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-white/70 text-left">
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> GPS en tiempo real</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Botón SOS de emergencia</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Detector de caídas</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Llamada directa</div>
                      <div className="flex items-center gap-2"><Check className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Resistente al agua</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ TRUST BAR ============ */}
      <section className="bg-white py-4 border-y border-gray-100" data-testid="trust-bar">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4" /><span className="font-semibold">Pago 100% seguro</span></div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2 font-semibold">
            <span className="bg-[#1A1F71] text-white text-[10px] px-2 py-0.5 rounded font-bold">VISA</span>
            <span className="bg-[#EB001B] text-white text-[10px] px-2 py-0.5 rounded font-bold">MC</span>
            <span className="text-gray-400">Stripe</span>
          </div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span className="font-semibold">Garantía 14 días</span></div>
          <span className="hidden sm:block text-gray-200">|</span>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span className="font-semibold">Soporte 24/7</span></div>
        </div>
      </section>

      {/* ============ ACTIVACIÓN EMOCIONAL — POR QUÉ ============ */}
      <section className="py-16 bg-white" id="seguridad" data-testid="why-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué necesitas ManoProtect?</h2>
            <p className="text-gray-500">El 78% de los padres ha sentido angustia al no saber dónde estaba su hijo durante más de 30 minutos. <strong className="text-gray-800">No se trata de control. Se trata de tranquilidad.</strong></p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <AlertTriangle className="w-7 h-7" />, color: 'red', title: 'Emergencias familiares', desc: 'Un accidente, una caída, un problema de salud. Cada segundo cuenta cuando no sabes dónde está tu hijo.' },
              { icon: <Eye className="w-7 h-7" />, color: 'amber', title: 'Desapariciones temporales', desc: 'Sale del colegio y no llega a casa. No contesta al móvil. 40 minutos de angustia que puedes evitar.' },
              { icon: <Shield className="w-7 h-7" />, color: 'emerald', title: 'Tranquilidad real', desc: 'Saber que puedes localizarle en segundos, que recibirás una alerta si necesita ayuda. Eso es ManoProtect.' },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-2xl border border-gray-100 hover:border-${item.color}-200 hover:shadow-lg transition-all`} data-testid={`why-card-${i}`}>
                <div className={`w-12 h-12 bg-${item.color}-50 rounded-xl flex items-center justify-center text-${item.color}-500 mb-4`}>{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="py-16 bg-slate-50" id="como-funciona" data-testid="how-section">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Cómo funciona</h2>
          <p className="text-center text-gray-500 mb-12">En 3 pasos simples. Sin complicaciones.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: <Phone className="w-8 h-8" />, title: 'Instala la app', desc: 'Instala ManoProtect en tu móvil y en el de tu hijo. Solo lleva 2 minutos.' },
              { step: '2', icon: <MapPin className="w-8 h-8" />, title: 'Activa la protección', desc: 'Activa el GPS en segundo plano. Funciona incluso con la app cerrada y el móvil bloqueado.' },
              { step: '3', icon: <Bell className="w-8 h-8" />, title: 'Protección 24/7', desc: 'Solicita ubicación en cualquier momento. Recibe alertas SOS instantáneas. Tu familia protegida.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center" data-testid={`step-${i}`}>
                <div className="w-16 h-16 bg-white border-2 border-[#10B981] rounded-2xl flex items-center justify-center text-[#10B981] mx-auto mb-4 shadow-sm">{item.icon}</div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center text-white text-xs font-bold">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'how_works' })} className="inline-flex items-center gap-2 bg-[#10B981] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-200" data-testid="how-cta">
              Activar Protección Familiar <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SENTINEL X BANNER ============ */}
      <section className="relative bg-black py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-cyan-900/20" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative flex justify-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl rounded-full transform scale-50" />
              <Link to="/sentinel-x"><img src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png" alt="SENTINEL X" className="relative z-10 w-48 lg:w-64 hover:scale-105 transition-transform duration-500 drop-shadow-2xl" data-testid="sentinel-x-img" /></Link>
            </div>
            <div className="text-center lg:text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs mb-3">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> DISPOSITIVO GRATIS – Solo pagas envío
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">SENTINEL X <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">100% GRATIS</span></h2>
              <p className="text-gray-400 text-sm mb-4">Reloj con botón SOS + GPS + Alertas. <span className="text-green-400 font-semibold">Versiones 4G desde 149€.</span></p>
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <div><span className="text-3xl font-bold text-green-400">GRATIS</span><span className="text-gray-500 line-through text-sm ml-2">249€</span><p className="text-green-400 text-xs">Solo 9,95€ envío · Hasta 30 Marzo 2026</p></div>
                <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'sentinel_banner' })} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-500/25" data-testid="sentinel-x-cta">
                  Pedir GRATIS <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ELIMINAR OBJECIONES ============ */}
      <section className="py-16 bg-white" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Preguntas frecuentes</h2>
          {[
            { q: '¿Consume mucha batería?', a: 'No. ManoProtect está optimizado para bajo consumo. El GPS en segundo plano usa menos del 3% de batería al día.' },
            { q: '¿Es legal rastrear a mi hijo?', a: 'Sí. Como padre o tutor legal, tienes derecho a supervisar la ubicación de tu hijo menor. ManoProtect siempre requiere consentimiento explícito.' },
            { q: '¿Funciona con la app cerrada?', a: 'Sí. El GPS en segundo plano funciona con la app cerrada, la pantalla apagada y el teléfono bloqueado.' },
            { q: '¿Mi hijo puede desactivarlo?', a: 'No. Los permisos se bloquean automáticamente después de la configuración inicial. Solo se pueden modificar contactando con ManoProtect y verificando identidad con DNI.' },
            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Cancela tu suscripción cuando quieras. Si no te convence en los primeros 14 días, te devolvemos el dinero.' },
          ].map((faq, i) => (
            <details key={i} className="group border-b border-gray-100 py-4" data-testid={`faq-${i}`}>
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 hover:text-[#10B981] transition-colors">
                {faq.q}
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ PLANES DE PRECIO ============ */}
      <section className="py-16 bg-slate-50" id="precios" data-testid="pricing-section">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-500 mb-2">Una estafa digital media cuesta más de 600€. Una denuncia falsa puede costar miles.</p>
            <h2 className="text-3xl font-bold text-gray-900">La tranquilidad empieza desde 9,99€/mes</h2>
          </div>
          <p className="text-center text-gray-500 mb-10">9,99€ es menos que una cena familiar. Y protege a todos.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow" data-testid="plan-mensual">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Plan Mensual</h3>
              <p className="text-gray-500 text-sm mb-4">Cancela cuando quieras</p>
              <div className="mb-4"><span className="text-4xl font-extrabold text-gray-900">9,99€</span><span className="text-gray-400">/mes</span></div>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                {['GPS en segundo plano 24/7', 'Botón SOS + alertas', 'Hasta 5 familiares', 'Zonas seguras', 'Notificaciones push'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" />{f}</li>
                ))}
              </ul>
              <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'pricing', plan: 'mensual' })} className="block w-full text-center py-3 border-2 border-[#10B981] text-[#10B981] font-bold rounded-xl hover:bg-[#10B981] hover:text-white transition-all" data-testid="plan-mensual-cta">
                Empezar ahora
              </Link>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#10B981] p-6 relative shadow-lg shadow-emerald-100" data-testid="plan-anual">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-xs font-bold px-4 py-1 rounded-full">MÁS POPULAR · Ahorra 20€</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Plan Anual</h3>
              <p className="text-gray-500 text-sm mb-4">El más elegido por las familias</p>
              <div className="mb-1"><span className="text-4xl font-extrabold text-gray-900">99,99€</span><span className="text-gray-400">/año</span></div>
              <p className="text-xs text-[#10B981] font-semibold mb-4">Solo 8,33€/mes · Ahorra 19,89€ al año</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                {['Todo del Plan Mensual', 'GPS en segundo plano 24/7', 'Prioridad en soporte', 'Alertas por WhatsApp', 'Dispositivo GRATIS incluido'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" />{f}</li>
                ))}
              </ul>
              <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'pricing', plan: 'anual' })} className="block w-full text-center py-3 bg-[#10B981] text-white font-bold rounded-xl hover:bg-[#059669] transition-all" data-testid="plan-anual-cta">
                Empezar ahora · Mejor precio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="py-16 bg-white" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Lo que dicen las familias</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Laura M.', city: 'Madrid', text: 'Gracias a ManoProtect localicé a mi hijo cuando perdió el autobús. En 10 segundos supe dónde estaba. No tiene precio.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
              { name: 'Carlos R.', city: 'Barcelona', text: 'Me da una tranquilidad increíble cuando mi hija sale por la noche. Sé que si pasa algo, el SOS me llega al instante.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
              { name: 'Marta G.', city: 'Valencia', text: 'Funciona incluso con la pantalla bloqueada. Mi hijo ni se entera y yo duermo tranquila. Lo recomiendo a todas las madres.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-gray-100" data-testid={`testimonial-${i}`}>
                <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div><p className="font-bold text-gray-900 text-sm">{t.name}</p><p className="text-xs text-gray-400">{t.city}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GARANTÍA ============ */}
      <section className="py-12 bg-emerald-50 border-y border-emerald-100" data-testid="guarantee-section">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Garantía de tranquilidad</h2>
          <p className="text-gray-600 mb-4">Si en 14 días no sientes más tranquilidad, <strong>cancela sin compromiso y te devolvemos el dinero.</strong> Sin preguntas.</p>
          <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'guarantee' })} className="inline-flex items-center gap-2 bg-[#10B981] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-200" data-testid="guarantee-cta">
            Proteger a Mi Familia Ahora <Heart className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-16 bg-gray-900" data-testid="final-cta">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">La tranquilidad no tiene precio.</h2>
          <p className="text-gray-400 mb-8">Pero hoy empieza con 7 días gratis.</p>
          <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'final' })} className="inline-flex items-center gap-2 bg-[#10B981] text-white font-bold px-10 py-5 rounded-xl hover:bg-[#059669] transition-all text-lg shadow-xl shadow-emerald-500/20 hover:scale-105" data-testid="final-cta-btn">
            Proteger a Mi Familia Ahora <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-gray-500 text-sm mt-4">Sin compromiso · Cancela cuando quieras · 14 días de garantía</p>
        </div>
      </section>

      <LandingFooter />

      {/* ============ EXIT INTENT POPUP ============ */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" data-testid="exit-popup">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowExitPopup(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-7 h-7 text-[#10B981]" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Antes de irte...</h3>
            <p className="text-gray-500 mb-6">Prueba ManoProtect <strong className="text-[#10B981]">7 días completamente gratis</strong>. Sin tarjeta. Sin compromiso.</p>
            <Link to="/sentinel-x" onClick={() => { setShowExitPopup(false); trackEvent('cta_click', { location: 'exit_popup' }); }} className="block w-full bg-[#10B981] text-white font-bold py-4 rounded-xl hover:bg-[#059669] transition-all mb-3" data-testid="exit-popup-cta">
              Probar 7 días gratis
            </Link>
            <button onClick={() => setShowExitPopup(false)} className="text-sm text-gray-400 hover:text-gray-600">No gracias, prefiero no proteger a mi familia</button>
          </div>
        </div>
      )}

      {/* ============ SOCIAL PROOF NOTIFICATION ============ */}
      {showSocialProof && (
        <div className="fixed bottom-20 left-4 z-40 animate-in slide-in-from-left duration-500 sm:bottom-24 sm:left-6" data-testid="social-proof-notification">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 max-w-xs flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-[#10B981]" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800"><strong>{socialProofData.name}</strong> de {socialProofData.city}</p>
              <p className="text-[11px] text-gray-500">acaba de activar <span className="text-[#10B981] font-semibold">{socialProofData.product}</span></p>
            </div>
            <button onClick={() => setShowSocialProof(false)} className="text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {/* ============ BOTÓN FLOTANTE FIJO MÓVIL ============ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white border-t border-gray-200 p-3" data-testid="mobile-sticky-cta">
        <Link to="/sentinel-x" onClick={() => trackEvent('cta_click', { location: 'mobile_sticky' })} className="flex items-center justify-center gap-2 w-full bg-[#10B981] text-white font-bold py-3.5 rounded-xl shadow-lg">
          <Shield className="w-5 h-5" /> Proteger Ahora
        </Link>
      </div>

      {/* WhatsApp */}
      <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-30 hover:scale-110 transition-transform">
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};

export default LandingPage;
