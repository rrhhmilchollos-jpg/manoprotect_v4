/**
 * ManoProtect - SOS Services Page
 * Página completa de servicios SOS: dispositivo físico, planes y funcionalidades
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, Package, Truck, Users, Plus, Minus, MapPin, Phone, Home,
  CheckCircle, AlertTriangle, Battery, Wifi, Volume2, Navigation, Heart,
  ArrowLeft, ShoppingCart, CreditCard, Clock, Star, ArrowRight, Check,
  Smartphone, Watch, Bell, Map, Lock, Zap, Award, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Device images - Base images
const DEVICE_IMAGES = {
  front: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/f99ed06308511adbc1daae4f2950cd5204c0a6d6e9b0c0050741934a2dde5029.png',
  lifestyle: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/8af36fc33ec933f216de400947176c9dbee8cbb7f7db0def7967975ba764dd69.png',
  technical: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/4b647ec828d739fb0904598a6e137bae97a1f71b4929ea76564f21cfc820d543.png'
};

// Shipping costs - Escalates with quantity
const SHIPPING_COSTS = {
  1: 4.95,
  2: 6.95,
  3: 8.95,
  4: 10.95,
  5: 12.95,
  6: 14.95,
  7: 16.95,
  8: 18.95,
  9: 20.95,
  10: 22.95
};

// ManoProtect Support Phone
const MANOPROTECT_SUPPORT_PHONE = '601510950';

// Device design styles based on age/target
const DEVICE_STYLES = [
  { id: 'juvenil', name: 'Estilo Juvenil', desc: 'Diseño moderno y colorido', targetAge: 'Jóvenes 15-30' },
  { id: 'adulto', name: 'Estilo Adulto', desc: 'Diseño elegante y discreto', targetAge: 'Adultos 30-60' },
  { id: 'senior', name: 'Estilo Senior', desc: 'Diseño fácil y ergonómico', targetAge: 'Mayores 60+' }
];

// Color options
const COLOR_OPTIONS = [
  { id: 'azul-cielo', name: 'Azul Cielo', hex: '#87CEEB', category: 'joven' },
  { id: 'verde-menta', name: 'Verde Menta', hex: '#98FF98', category: 'joven' },
  { id: 'naranja-energy', name: 'Naranja Energy', hex: '#FF6B35', category: 'joven' },
  { id: 'rosa-coral', name: 'Rosa Coral', hex: '#FF6B6B', category: 'femenino' },
  { id: 'lila-lavanda', name: 'Lila Lavanda', hex: '#E6E6FA', category: 'femenino' },
  { id: 'azul-marino', name: 'Azul Marino', hex: '#1E3A5F', category: 'masculino' },
  { id: 'gris-titanio', name: 'Gris Titanio', hex: '#5C5C5C', category: 'masculino' },
  { id: 'negro-mate', name: 'Negro Mate', hex: '#1C1C1C', category: 'masculino' },
  { id: 'champagne', name: 'Champagne', hex: '#F7E7CE', category: 'elegante' },
  { id: 'burdeos', name: 'Burdeos', hex: '#800020', category: 'elegante' },
  { id: 'plata', name: 'Plata', hex: '#C0C0C0', category: 'unisex' },
  { id: 'blanco-perla', name: 'Blanco Perla', hex: '#FEFEFA', category: 'unisex' },
];

// Features del dispositivo
const DEVICE_FEATURES = [
  { icon: Navigation, title: 'GPS Tiempo Real', desc: 'Precisión 2.5m' },
  { icon: Phone, title: 'Llamada al 112', desc: 'Conexión directa' },
  { icon: Volume2, title: 'Audio Bidireccional', desc: 'Habla con familiares' },
  { icon: Battery, title: '7 Días Batería', desc: 'Carga USB incluida' },
  { icon: Wifi, title: 'Sin Configuración', desc: 'Funciona al encender' },
  { icon: Shield, title: 'Detección Caídas', desc: 'Alerta automática' },
];

// Planes
const PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    period: 'Gratis',
    description: 'Para empezar a protegerte',
    features: [
      'Botón SOS en App',
      '10 análisis/mes',
      'Alertas básicas',
      'Soporte email'
    ],
    cta: 'Empezar Gratis',
    popular: false,
    color: 'zinc'
  },
  {
    id: 'individual',
    name: 'Individual',
    monthlyPrice: 29.99,
    yearlyPrice: 249.99,
    description: 'Protección completa para ti',
    features: [
      'Todo de Básico +',
      'Análisis ilimitados',
      'GPS en tiempo real',
      '1 Dispositivo SOS GRATIS',
      'Soporte prioritario 24/7',
      'Sin anuncios'
    ],
    cta: 'Suscribirse',
    popular: true,
    color: 'indigo',
    savings: 110
  },
  {
    id: 'familiar',
    name: 'Familiar',
    monthlyPrice: 49.99,
    yearlyPrice: 399.99,
    description: 'Protección para toda la familia',
    features: [
      'Todo de Individual +',
      'Hasta 5 miembros',
      '5 Dispositivos SOS GRATIS',
      'Panel familiar completo',
      'Zonas seguras ilimitadas',
      'Historial 1 año'
    ],
    cta: 'Proteger Familia',
    popular: false,
    color: 'emerald',
    savings: 200
  }
];

export default function SOSServices() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dispositivo');
  const [isAnnual, setIsAnnual] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('plata');
  const [activeImage, setActiveImage] = useState('front');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  
  // Shipping info
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: ''
  });

  // Check URL params for payment status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');
    const tab = params.get('tab');
    
    if (tab === 'planes') {
      setActiveTab('planes');
    }
    
    if (payment === 'success' && sessionId) {
      pollPaymentStatus(sessionId);
    } else if (payment === 'cancelled') {
      toast.error('Pago cancelado');
    }
  }, []);

  // Poll payment status
  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    if (attempts >= 5) {
      toast.error('Tiempo de espera agotado. Verifica tu email para confirmación.');
      return;
    }

    try {
      const response = await fetch(`${API}/api/payments/device/status/${sessionId}`);
      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        setPaymentStatus('success');
        toast.success('¡Pago completado! Tu dispositivo SOS será enviado pronto.');
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
        toast.error('La sesión de pago expiró. Intenta de nuevo.');
      } else {
        // Keep polling
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  // Submit device order - redirect to Stripe
  const handleSubmitOrder = async () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.province) {
      toast.error('Por favor, completa todos los campos de envío');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/payments/device/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quantity,
          color: selectedColor,
          shipping: shippingInfo,
          origin_url: window.location.origin
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error('Error al crear sesión de pago');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a plan - redirect to Stripe
  const handleSubscribe = async (planId) => {
    if (planId === 'basic') {
      navigate('/register');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/payments/subscription/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: isAnnual ? 'yearly' : 'monthly',
          origin_url: window.location.origin
        })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Error al crear sesión de pago');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Track order
  const handleTrackOrder = async () => {
    if (!trackingInput.trim()) {
      toast.error('Introduce un número de seguimiento');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/orders/track/${trackingInput}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingResult(data);
      } else {
        toast.error('Pedido no encontrado');
        setTrackingResult(null);
      }
    } catch (error) {
      toast.error('Error al buscar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Servicios SOS - ManoProtect | Botón de Emergencia y Planes</title>
        <meta name="description" content="Dispositivo SOS físico con GPS, planes de protección familiar y botón de emergencia. Protege a tu familia con ManoProtect." />
      </Helmet>
      
      <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Home className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Servicios SOS ManoProtect</h1>
                  <p className="text-white/80 text-sm">Protección completa para emergencias</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <Button onClick={() => navigate('/dashboard')} className="bg-white text-red-600 hover:bg-zinc-100">
                    Mi Panel
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => navigate('/login')} variant="outline" className="border-white text-white hover:bg-white/10">
                      Iniciar Sesión
                    </Button>
                    <Button onClick={() => navigate('/register')} className="bg-white text-red-600 hover:bg-zinc-100">
                      Registrarse
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {[
                { id: 'dispositivo', label: '🔴 Dispositivo SOS', icon: Package },
                { id: 'planes', label: '💰 Planes y Precios', icon: CreditCard },
                { id: 'funciones', label: '⚡ Funcionalidades', icon: Zap },
                { id: 'tracking', label: '📦 Seguir Pedido', icon: Truck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          
          {/* TAB 1: Dispositivo SOS */}
          {activeTab === 'dispositivo' && (
            <div className="space-y-8">
              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <Gift className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">🎉 PROMOCIÓN LANZAMIENTO</p>
                      <p className="text-white/90">Dispositivo SOS <span className="font-bold text-yellow-200">100% GRATIS</span> - Solo pagas envío</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-400 text-yellow-900 text-lg px-4 py-2">
                    Hasta 30 Abril 2026
                  </Badge>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Gallery */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <img 
                      src={DEVICE_IMAGES[activeImage]} 
                      alt="ManoProtect SOS Button"
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                  <div className="flex gap-3">
                    {Object.entries(DEVICE_IMAGES).map(([key, url]) => (
                      <button
                        key={key}
                        onClick={() => setActiveImage(key)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === key ? 'border-red-500 shadow-lg' : 'border-zinc-200'
                        }`}
                      >
                        <img src={url} alt={key} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Features Grid */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Características del Dispositivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {DEVICE_FEATURES.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-zinc-50 rounded-lg">
                            <feature.icon className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{feature.title}</p>
                              <p className="text-xs text-zinc-500">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Form */}
                <div className="space-y-6">
                  {/* Quantity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-red-600" />
                        Cantidad de Dispositivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-6">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-center">
                          <span className="text-5xl font-bold text-red-600">{quantity}</span>
                          <p className="text-sm text-zinc-500">dispositivo{quantity > 1 ? 's' : ''}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Price */}
                      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex justify-between items-center">
                          <span>{quantity}x Dispositivo SOS</span>
                          <div className="text-right">
                            <span className="line-through text-zinc-400 mr-2">{quantity * 49}€</span>
                            <span className="font-bold text-emerald-600">GRATIS</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span>Envío Express 24-48h</span>
                          <span>4,95€</span>
                        </div>
                        <div className="border-t border-emerald-300 mt-3 pt-3 flex justify-between items-center">
                          <span className="font-bold text-lg">TOTAL</span>
                          <span className="font-bold text-2xl text-emerald-600">4,95€</span>
                        </div>
                        <p className="text-xs text-center text-emerald-700 mt-2">
                          ¡Ahorras {quantity * 49}€ con la promoción!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Color Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🎨 Elige el Color</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-6 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColor(color.id)}
                            className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                              selectedColor === color.id ? 'border-red-500 shadow-lg' : 'border-transparent'
                            }`}
                            title={color.name}
                          >
                            <div 
                              className="w-8 h-8 rounded-full mx-auto border border-zinc-300"
                              style={{ backgroundColor: color.hex }}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-sm text-zinc-600 mt-3">
                        Seleccionado: <strong>{COLOR_OPTIONS.find(c => c.id === selectedColor)?.name}</strong>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Shipping Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-red-600" />
                        Dirección de Envío
                      </CardTitle>
                      <CardDescription>
                        <Badge className="bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Envío Express 24-48h
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Nombre completo *"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        />
                        <Input
                          placeholder="Teléfono *"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        />
                      </div>
                      <Input
                        placeholder="Dirección completa (calle, número, piso...) *"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="Ciudad *"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        />
                        <Input
                          placeholder="C.P. *"
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        />
                        <Input
                          placeholder="Provincia *"
                          value={shippingInfo.province}
                          onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="w-full h-16 text-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-xl"
                    data-testid="submit-sos-order"
                  >
                    {loading ? 'Procesando...' : (
                      <>
                        <ShoppingCart className="w-6 h-6 mr-3" />
                        Solicitar GRATIS (Envío: 4,95€)
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Pago seguro</span>
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-emerald-500" /> Envío 24-48h</span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-500" /> Garantía 2 años</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Planes y Precios */}
          {activeTab === 'planes' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Elige tu Plan de Protección</h2>
                <p className="text-zinc-600 max-w-2xl mx-auto mb-4">
                  Protección contra fraudes y seguridad familiar. Sin sorpresas, cancela cuando quieras.
                </p>
                
                {/* Trial Info Banner */}
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Gift className="w-4 h-4" />
                  <span>7 días de prueba GRATIS en todos los planes</span>
                </div>
                
                {/* Toggle Mensual/Anual */}
                <div className="inline-flex items-center gap-4 bg-zinc-100 rounded-full p-2">
                  <span className={`px-4 py-2 rounded-full transition-all ${!isAnnual ? 'bg-white shadow font-medium' : 'text-zinc-500'}`}>
                    Mensual
                  </span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                  <span className={`px-4 py-2 rounded-full transition-all ${isAnnual ? 'bg-white shadow font-medium' : 'text-zinc-500'}`}>
                    Anual
                  </span>
                  {isAnnual && <Badge className="bg-emerald-100 text-emerald-700">Ahorra hasta 33%</Badge>}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                  const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
                  const monthlyEquiv = isAnnual && plan.yearlyPrice ? (plan.yearlyPrice / 12).toFixed(2) : null;
                  const isPaid = plan.id !== 'basic';
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative overflow-hidden transition-all hover:shadow-xl ${
                        plan.popular ? 'border-2 border-indigo-500 shadow-lg scale-105' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                          Más Popular
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${plan.color}-100 flex items-center justify-center`}>
                          <Shield className={`w-8 h-8 text-${plan.color}-600`} />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="mb-4">
                          <span className="text-5xl font-bold">€{price || 0}</span>
                          <span className="text-zinc-500">/{isAnnual ? 'año' : 'mes'}</span>
                          {monthlyEquiv && (
                            <p className="text-sm text-emerald-600 mt-1">Solo €{monthlyEquiv}/mes</p>
                          )}
                          {plan.savings && isAnnual && (
                            <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                              Ahorras €{plan.savings}/año
                            </Badge>
                          )}
                        </div>
                        
                        {/* Trial Info for paid plans */}
                        {isPaid && (
                          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800 font-medium">
                              🎁 7 días GRATIS
                            </p>
                            <p className="text-xs text-amber-600">
                              Se cobra automáticamente después del trial si no cancelas
                            </p>
                          </div>
                        )}
                        
                        <ul className="space-y-3 text-left mb-6">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={loading}
                          className={`w-full h-12 ${
                            plan.popular 
                              ? 'bg-indigo-600 hover:bg-indigo-700' 
                              : plan.id === 'familiar'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-zinc-800 hover:bg-zinc-900'
                          }`}
                        >
                          {isPaid ? 'Empezar Prueba Gratis' : plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        
                        {/* Card requirement notice */}
                        {isPaid && (
                          <p className="text-xs text-zinc-400 mt-3">
                            💳 Requiere tarjeta de crédito/débito (no prepago)
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Cancellation Policy */}
              <Card className="bg-zinc-50 border-zinc-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Política de Cancelación</h4>
                      <ul className="space-y-2 text-sm text-zinc-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Cancela en cualquier momento durante los 7 días de prueba sin cargo
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Si cancelas, se asigna automáticamente el Plan Básico gratuito
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          No se aceptan tarjetas prepago para evitar fraudes
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Comparison Info */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">¿Por qué elegir el Plan Familiar?</h3>
                    <p className="text-zinc-600">La mejor protección para toda tu familia</p>
                  </div>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                        <Users className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold">5 Miembros</h4>
                      <p className="text-sm text-zinc-500">Protege a toda la familia</p>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                        <Package className="w-7 h-7 text-red-600" />
                      </div>
                      <h4 className="font-semibold">5 Dispositivos SOS</h4>
                      <p className="text-sm text-zinc-500">Incluidos GRATIS</p>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        <Map className="w-7 h-7 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">Zonas Seguras</h4>
                      <p className="text-sm text-zinc-500">Ilimitadas</p>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                        <Award className="w-7 h-7 text-purple-600" />
                      </div>
                      <h4 className="font-semibold">Ahorra €200</h4>
                      <p className="text-sm text-zinc-500">Con pago anual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: Funcionalidades */}
          {activeTab === 'funciones' && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades del Sistema SOS</h2>
                <p className="text-zinc-600 max-w-2xl mx-auto">
                  Todo lo que necesitas para proteger a tu familia en situaciones de emergencia
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Bell,
                    title: 'Botón SOS Instantáneo',
                    desc: 'Pulsa el botón y tus familiares reciben alerta inmediata con tu ubicación GPS exacta.',
                    color: 'red'
                  },
                  {
                    icon: Navigation,
                    title: 'GPS en Tiempo Real',
                    desc: 'Ubicación con precisión de 2.5 metros actualizada cada segundo.',
                    color: 'blue'
                  },
                  {
                    icon: Phone,
                    title: 'Llamada al 112',
                    desc: 'Conexión directa con servicios de emergencia desde el dispositivo.',
                    color: 'orange'
                  },
                  {
                    icon: Volume2,
                    title: 'Audio Bidireccional',
                    desc: 'Habla y escucha a través del dispositivo sin necesidad de teléfono.',
                    color: 'purple'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Detección de Caídas',
                    desc: 'El dispositivo detecta caídas automáticamente y envía alerta.',
                    color: 'amber'
                  },
                  {
                    icon: Map,
                    title: 'Zonas Seguras',
                    desc: 'Define áreas seguras y recibe alertas cuando alguien sale de ellas.',
                    color: 'emerald'
                  },
                  {
                    icon: Smartphone,
                    title: 'App Móvil Completa',
                    desc: 'Gestiona todo desde la app: alertas, ubicaciones, contactos y más.',
                    color: 'indigo'
                  },
                  {
                    icon: Users,
                    title: 'Panel Familiar',
                    desc: 'Administra todos los miembros de la familia desde un solo lugar.',
                    color: 'teal'
                  },
                  {
                    icon: Lock,
                    title: 'Privacidad Garantizada',
                    desc: 'Tus datos están protegidos con encriptación de nivel bancario.',
                    color: 'zinc'
                  }
                ].map((feature, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-4`}>
                        <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-zinc-600 text-sm">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-red-600 to-orange-500 text-white border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">¿Listo para proteger a tu familia?</h3>
                  <p className="mb-6 text-white/90">Obtén tu dispositivo SOS GRATIS durante la promoción de lanzamiento</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setActiveTab('dispositivo')}
                      className="bg-white text-red-600 hover:bg-zinc-100 h-12 px-8"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      Solicitar Dispositivo GRATIS
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('planes')}
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 h-12 px-8"
                    >
                      Ver Planes y Precios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: Seguir Pedido */}
          {activeTab === 'tracking' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Seguimiento de Pedido</h2>
                <p className="text-zinc-600">Introduce tu número de seguimiento para ver el estado de tu envío</p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <Input 
                      placeholder="Número de seguimiento (ej: MP-123456)"
                      className="h-14 text-lg"
                    />
                    <Button className="w-full h-14 text-lg bg-red-600 hover:bg-red-700">
                      <Truck className="w-5 h-5 mr-2" />
                      Buscar Pedido
                    </Button>
                  </div>
                  
                  <div className="mt-8 p-6 bg-zinc-50 rounded-xl">
                    <p className="text-center text-zinc-500">
                      Una vez realices tu pedido, recibirás un email con el número de seguimiento.
                      <br />
                      El envío suele tardar 24-48 horas laborables.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-zinc-500 mb-4">¿Todavía no has hecho tu pedido?</p>
                <Button onClick={() => setActiveTab('dispositivo')} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Solicitar Dispositivo SOS
                </Button>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="bg-zinc-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold mb-4">ManoProtect SOS</h4>
                <p className="text-zinc-400 text-sm">
                  Protección de emergencias para toda la familia con tecnología GPS y conexión al 112.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Servicios</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li><button onClick={() => setActiveTab('dispositivo')} className="hover:text-white">Dispositivo SOS</button></li>
                  <li><button onClick={() => setActiveTab('planes')} className="hover:text-white">Planes y Precios</button></li>
                  <li><button onClick={() => setActiveTab('funciones')} className="hover:text-white">Funcionalidades</button></li>
                  <li><button onClick={() => setActiveTab('tracking')} className="hover:text-white">Seguir Pedido</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li><Link to="/privacy-policy" className="hover:text-white">Privacidad</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-white">Términos</Link></li>
                  <li><Link to="/refund-policy" className="hover:text-white">Reembolsos</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contacto</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li>info@manoprotect.com</li>
                  <li>+34 900 123 456</li>
                  <li>España</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-500">
              © 2025 ManoProtect. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
