/**
 * ManoProtect - SOS Device Order Page
 * Página para pedir dispositivos SOS físicos tipo llavero
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, Package, Truck, Users, Plus, Minus, MapPin, Phone,
  CheckCircle, AlertTriangle, Battery, Wifi, Volume2, Navigation,
  ArrowLeft, ShoppingCart, CreditCard, Clock, Heart, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Device images (generated)
const DEVICE_IMAGES = {
  front: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/f99ed06308511adbc1daae4f2950cd5204c0a6d6e9b0c0050741934a2dde5029.png',
  lifestyle: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/8af36fc33ec933f216de400947176c9dbee8cbb7f7db0def7967975ba764dd69.png',
  technical: 'https://static.prod-images.emergentagent.com/jobs/48047d8d-d356-432e-9b76-e0dcfdb8856b/images/4b647ec828d739fb0904598a6e137bae97a1f71b4929ea76564f21cfc820d543.png'
};

// Pricing - PROMOCIÓN LANZAMIENTO: TODO GRATIS
const PRICING = {
  single: 0,          // GRATIS durante promoción de lanzamiento
  familyIncluded: 0,  // Gratis con plan familiar
  additional: 0,      // GRATIS adicionales durante promoción
  familyPack: 0,      // GRATIS pack familiar
};

// Promoción activa hasta Abril 2026
const PROMO_ACTIVE = true;
const PROMO_END_DATE = "30 de Abril 2026";

// Features list
const FEATURES = [
  { icon: Navigation, title: 'GPS en Tiempo Real', desc: 'Precisión de 2.5 metros' },
  { icon: Phone, title: 'Llamada al 112', desc: 'Conexión directa con emergencias' },
  { icon: Volume2, title: 'Audio Bidireccional', desc: 'Habla con tus familiares' },
  { icon: Battery, title: '7 Días de Batería', desc: 'Carga USB incluida' },
  { icon: Wifi, title: 'Sin Configuración', desc: 'Funciona al encenderlo' },
  { icon: Shield, title: 'Detección de Caídas', desc: 'Alerta automática' },
];

export default function SOSDeviceOrder() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [familyMembers, setFamilyMembers] = useState(1);
  const [activeImage, setActiveImage] = useState('front');
  const [loading, setLoading] = useState(false);
  
  // Shipping info
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    notes: ''
  });

  // Calculate price based on user plan
  const calculatePrice = () => {
    const userPlan = user?.plan || 'free';
    
    if (userPlan === 'family' || userPlan === 'family-monthly' || userPlan === 'family-yearly') {
      // Plan familiar: 1 gratis, adicionales a 29€
      if (quantity === 1) return 0;
      return (quantity - 1) * PRICING.additional;
    }
    
    // Sin plan familiar: precio completo
    return quantity * PRICING.single;
  };

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQty);
  };

  const handleFamilyMembersChange = (delta) => {
    const newMembers = Math.max(1, Math.min(10, familyMembers + delta));
    setFamilyMembers(newMembers);
    // Auto-adjust quantity to match family members
    setQuantity(newMembers);
  };

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para realizar el pedido');
      navigate('/login');
      return;
    }

    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.province) {
      toast.error('Por favor, completa todos los campos de envío');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/sos-device/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quantity,
          family_members: familyMembers,
          shipping: shippingInfo,
          total_price: calculatePrice()
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('¡Pedido realizado! Te contactaremos para confirmar el envío.');
        navigate('/dashboard');
      } else {
        toast.error('Error al procesar el pedido');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const userPlan = user?.plan || 'free';
  const hasFamilyPlan = userPlan.includes('family');
  const totalPrice = calculatePrice();

  return (
    <>
      <Helmet>
        <title>Botón SOS Físico - ManoProtect</title>
        <meta name="description" content="Dispositivo SOS tipo llavero con GPS y conexión al 112. Protege a tu familia con el botón de emergencia ManoProtect." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-teal-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/smart-locator')}
              className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Localizador
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ManoProtect SOS Button</h1>
                <p className="text-white/80">
                  Dispositivo físico de emergencia con GPS y conexión al 112
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <img 
                  src={DEVICE_IMAGES[activeImage]} 
                  alt="ManoProtect SOS Keychain"
                  className="w-full h-auto rounded-xl"
                />
              </div>
              
              {/* Thumbnail selector */}
              <div className="flex gap-3">
                {Object.entries(DEVICE_IMAGES).map(([key, url]) => (
                  <button
                    key={key}
                    onClick={() => setActiveImage(key)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === key ? 'border-emerald-500 shadow-lg' : 'border-zinc-200'
                    }`}
                  >
                    <img src={url} alt={key} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Features */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Características del Dispositivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {FEATURES.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg">
                        <feature.icon className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{feature.title}</p>
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
              {/* PROMO LANZAMIENTO BANNER */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Star className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">🎉 PROMOCIÓN DE LANZAMIENTO</p>
                    <p className="text-white/90">Dispositivo SOS <span className="font-bold text-yellow-200">100% GRATIS</span></p>
                    <p className="text-sm text-white/80">Solo pagas el envío · Oferta válida hasta {PROMO_END_DATE}</p>
                  </div>
                </div>
              </div>

              {/* Plan Badge */}
              {hasFamilyPlan && (
                <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800">¡Plan Familiar Activo!</p>
                      <p className="text-sm text-emerald-700">Tu primer dispositivo SOS es GRATIS</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Family Members Counter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Personas en tu Hogar
                  </CardTitle>
                  <CardDescription>
                    ¿Cuántas personas viven contigo? Recomendamos 1 dispositivo por persona.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleFamilyMembersChange(-1)}
                      disabled={familyMembers <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-emerald-600">{familyMembers}</span>
                      <p className="text-sm text-zinc-500">personas</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleFamilyMembersChange(1)}
                      disabled={familyMembers >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity Counter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Dispositivos a Enviar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-emerald-600">{quantity}</span>
                      <p className="text-sm text-zinc-500">dispositivos</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Price breakdown */}
                  <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      {hasFamilyPlan && (
                        <div className="flex justify-between text-emerald-600">
                          <span>1x Dispositivo (Plan Familiar)</span>
                          <span>GRATIS</span>
                        </div>
                      )}
                      {quantity > 1 && hasFamilyPlan && (
                        <div className="flex justify-between">
                          <span>{quantity - 1}x Dispositivos adicionales</span>
                          <span>{(quantity - 1) * PRICING.additional}€</span>
                        </div>
                      )}
                      {!hasFamilyPlan && (
                        <div className="flex justify-between">
                          <span>{quantity}x Dispositivos</span>
                          <span>{quantity * PRICING.single}€</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-emerald-600">{totalPrice}€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
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
                      placeholder="Nombre completo"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                    />
                    <Input
                      placeholder="Teléfono de contacto"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    />
                  </div>
                  <Input
                    placeholder="Dirección completa (calle, número, piso...)"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Ciudad"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    />
                    <Input
                      placeholder="Código Postal"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                    />
                    <Input
                      placeholder="Provincia"
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                    />
                  </div>
                  <Input
                    placeholder="Notas para el repartidor (opcional)"
                    value={shippingInfo.notes}
                    onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
                  />
                </CardContent>
              </Card>

              {/* Order Button */}
              <Button 
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  'Procesando...'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {totalPrice === 0 ? 'Solicitar Dispositivo Gratis' : `Pedir por ${totalPrice}€`}
                  </>
                )}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Pago seguro
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-emerald-500" />
                  Envío 24-48h
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Garantía 2 años
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>¿Cómo funciona el ManoProtect SOS Button?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Recibe el Dispositivo</h4>
                  <p className="text-sm text-zinc-500">Te lo enviamos por mensajería express en 24-48h</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wifi className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Escanea el QR</h4>
                  <p className="text-sm text-zinc-500">Vincula el dispositivo a tu cuenta escaneando el código</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Configura Contactos</h4>
                  <p className="text-sm text-zinc-500">Añade a los familiares que recibirán las alertas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Pulsa en Emergencia</h4>
                  <p className="text-sm text-zinc-500">Tus familiares y el 112 recibirán la alerta con tu ubicación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
