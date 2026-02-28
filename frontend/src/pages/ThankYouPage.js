import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, Clock, Mail, ArrowRight, Shield, Heart, Watch, MapPin, Phone, Download, Share2, MessageCircle, FileText } from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Product configurations
const PRODUCT_CONFIG = {
  'sentinel-x': {
    name: 'SENTINEL X',
    icon: <Watch className="w-12 h-12" />,
    image: 'https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png',
    color: 'cyan',
    deliveryTime: '90-120 días',
    description: 'Tu smartwatch de seguridad está en camino'
  },
  'sentinel-x-basic': {
    name: 'SENTINEL X Basic',
    icon: <Watch className="w-12 h-12" />,
    image: 'https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png',
    color: 'green',
    deliveryTime: '90-120 días',
    description: 'Tu Sentinel X Basic GRATIS + Plan Familiar activado'
  },
  'sentinel-j': {
    name: 'SENTINEL J Junior',
    icon: <Watch className="w-12 h-12" />,
    image: null,
    color: 'blue',
    deliveryTime: '90-120 días',
    description: 'Tu Sentinel J para jóvenes + Plan Familiar activado'
  },
  'sentinel-s': {
    name: 'SENTINEL S Niños',
    icon: <Shield className="w-12 h-12" />,
    image: null,
    color: 'cyan',
    deliveryTime: '90-120 días',
    description: 'Tu Sentinel S premium para niños + Plan Familiar activado'
  },
  'sos-device': {
    name: 'Dispositivo SOS',
    icon: <Shield className="w-12 h-12" />,
    image: null,
    color: 'green',
    deliveryTime: '24-48 horas',
    description: 'Tu botón SOS será enviado pronto'
  },
  'sos-button': {
    name: 'Botón SOS',
    icon: <Phone className="w-12 h-12" />,
    image: null,
    color: 'red',
    deliveryTime: '24-48 horas',
    description: 'Tu botón de emergencia está en preparación'
  },
  'gps-tracker': {
    name: 'Localizador GPS',
    icon: <MapPin className="w-12 h-12" />,
    image: null,
    color: 'blue',
    deliveryTime: '24-48 horas',
    description: 'Tu localizador GPS será enviado pronto'
  },
  'subscription': {
    name: 'Suscripción ManoProtect',
    icon: <Heart className="w-12 h-12" />,
    image: null,
    color: 'green',
    deliveryTime: 'Acceso inmediato',
    description: 'Tu cuenta ha sido activada'
  },
  'default': {
    name: 'Tu Pedido',
    icon: <Package className="w-12 h-12" />,
    image: null,
    color: 'green',
    deliveryTime: '24-48 horas',
    description: 'Gracias por tu compra'
  }
};

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get params from URL
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const product = searchParams.get('product') || 'default';
  const plan = searchParams.get('plan');
  const amount = searchParams.get('amount');

  // Determine product type
  const productKey = product.toLowerCase().includes('sentinel') ? 'sentinel-x' :
                     product.toLowerCase().includes('sos') ? 'sos-device' :
                     product.toLowerCase().includes('gps') ? 'gps-tracker' :
                     product.toLowerCase().includes('suscripcion') || plan ? 'subscription' :
                     'default';
  
  const productConfig = PRODUCT_CONFIG[productKey];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`${API_URL}/api/checkout/session/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setOrderDetails(data);
          }
        } catch (error) {
          console.log('Could not fetch order details');
        }
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [sessionId]);

  // Generate order number
  const orderNumber = sessionId ? 
    `MP-${sessionId.slice(-8).toUpperCase()}` : 
    `MP-${Date.now().toString(36).toUpperCase()}`;

  const colorClasses = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-500',
      gradient: 'from-cyan-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-500',
      gradient: 'from-green-500 to-emerald-600'
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      gradient: 'from-red-500 to-orange-600'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      gradient: 'from-blue-500 to-indigo-600'
    }
  };

  const colors = colorClasses[productConfig.color] || colorClasses.green;

  return (
    <>
      <Helmet>
        <title>¡Gracias por tu compra! | ManoProtect</title>
        <meta name="description" content="Tu pedido ha sido confirmado. Gracias por confiar en ManoProtect para tu seguridad." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <LandingHeader />

        <main className="pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-4">
            
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 ${colors.bg} rounded-full mb-6 animate-bounce`}>
                <CheckCircle className={`w-16 h-16 ${colors.text}`} />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-lg text-gray-600">
                {productConfig.description}
              </p>
            </div>

            {/* Order Card */}
            <div className={`bg-white rounded-2xl shadow-xl border ${colors.border} overflow-hidden mb-8`}>
              {/* Header */}
              <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {productConfig.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{productConfig.name}</h2>
                      <p className="text-white/80 text-sm">Pedido #{orderNumber}</p>
                    </div>
                  </div>
                  {productConfig.image && (
                    <img 
                      src={productConfig.image} 
                      alt={productConfig.name}
                      className="w-20 h-20 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Package className="w-4 h-4" />
                      Producto
                    </div>
                    <p className="font-semibold text-gray-900">{productConfig.name}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Tiempo de entrega
                    </div>
                    <p className="font-semibold text-gray-900">{productConfig.deliveryTime}</p>
                  </div>
                </div>

                {/* Amount if available */}
                {(amount || orderDetails?.amount) && (
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <span className="text-gray-600">Total pagado</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {amount || orderDetails?.amount}€
                    </span>
                  </div>
                )}

                {/* Email Notification */}
                <div className={`p-4 ${colors.bg} rounded-xl flex items-start gap-3`}>
                  <Mail className={`w-5 h-5 ${colors.text} mt-0.5`} />
                  <div>
                    <p className="font-medium text-gray-900">Confirmación enviada</p>
                    <p className="text-sm text-gray-600">
                      Hemos enviado los detalles de tu pedido a tu correo electrónico.
                      Revisa también tu carpeta de spam.
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">¿Qué sigue?</h3>
                  <div className="space-y-3">
                    {productKey === 'subscription' ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">1</span>
                          </div>
                          <p className="text-gray-600">Tu cuenta ya está activa con acceso completo</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">2</span>
                          </div>
                          <p className="text-gray-600">Descarga la app ManoProtect en tu móvil</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">3</span>
                          </div>
                          <p className="text-gray-600">Configura tus contactos de emergencia</p>
                        </div>
                      </>
                    ) : productKey === 'sentinel-x' ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-cyan-600 text-sm font-bold">1</span>
                          </div>
                          <p className="text-gray-600">Tu reserva ha sido confirmada</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-cyan-600 text-sm font-bold">2</span>
                          </div>
                          <p className="text-gray-600">Te notificaremos cuando entre en producción</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-cyan-600 text-sm font-bold">3</span>
                          </div>
                          <p className="text-gray-600">Envío estimado en 90-120 días</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">1</span>
                          </div>
                          <p className="text-gray-600">Estamos preparando tu pedido</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">2</span>
                          </div>
                          <p className="text-gray-600">Recibirás un email con el número de seguimiento</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">3</span>
                          </div>
                          <p className="text-gray-600">Entrega en {productConfig.deliveryTime}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/mi-cuenta"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.gradient} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity`}
                data-testid="go-to-account"
              >
                Ir a Mi Cuenta
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                data-testid="continue-shopping"
              >
                Seguir Comprando
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm mb-2">¿Tienes alguna pregunta?</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <a href="mailto:info@manoprotect.com" className={`${colors.text} hover:underline font-medium`}>
                  info@manoprotect.com
                </a>
                <span className="text-gray-300">|</span>
                <a href="tel:+34601510950" className={`${colors.text} hover:underline font-medium`}>
                  +34 601 510 950
                </a>
              </div>
            </div>

          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default ThankYouPage;
