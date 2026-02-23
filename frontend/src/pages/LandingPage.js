/**
 * ManoProtect - Landing Page
 * Con búsqueda funcional y carrito profesional con checkout Stripe
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, Star, Play, ChevronRight, MapPin, Lock, Phone, Shield, Users, Search, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LandingFooter from '@/components/landing/LandingFooter';

const API = process.env.REACT_APP_BACKEND_URL;

// Productos disponibles para búsqueda
const productos = [
  { id: 1, nombre: 'Dispositivo SOS', descripcion: 'Localizador GPS con botón de emergencia', precio: 0, precioEnvio: 4.95, url: '/dispositivo-sos', imagen: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&h=100&fit=crop' },
  { id: 2, nombre: 'Plan Básico', descripcion: 'Protección esencial para tu familia', precio: 0, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
  { id: 3, nombre: 'Plan Premium', descripcion: 'Protección completa con todas las funciones', precio: 9.99, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
  { id: 4, nombre: 'Plan Familiar', descripcion: 'Protege a toda tu familia', precio: 14.99, url: '/pricing', imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop' },
];

// Páginas para búsqueda
const paginas = [
  { nombre: 'Cómo Funciona', url: '/como-funciona' },
  { nombre: 'Precios y Planes', url: '/pricing' },
  { nombre: 'Seguridad Familiar', url: '/seguridad-familiar' },
  { nombre: 'Protección Mayores', url: '/seguridad-mayores' },
  { nombre: 'Quiénes Somos', url: '/quienes-somos' },
  { nombre: 'Contacto', url: '/contacto' },
  { nombre: 'FAQ - Preguntas Frecuentes', url: '/faq' },
];

// Social proof data - random Spanish names and cities (outside component to avoid re-creation)
const SOCIAL_PROOF_NAMES = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Carmen', 'David', 'Isabel', 'Javier', 'Elena'];
const SOCIAL_PROOF_CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Murcia', 'Palma', 'Alicante'];
const SOCIAL_PROOF_PRODUCTS = ['SENTINEL X', 'Dispositivo SOS', 'Plan Familiar'];

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showVideo, setShowVideo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ productos: [], paginas: [] });
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Social Proof Notification State
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofData, setSocialProofData] = useState({ name: '', city: '', product: '' });

  // Social Proof Effect
  useEffect(() => {
    const showNotification = () => {
      const randomName = SOCIAL_PROOF_NAMES[Math.floor(Math.random() * SOCIAL_PROOF_NAMES.length)];
      const randomCity = SOCIAL_PROOF_CITIES[Math.floor(Math.random() * SOCIAL_PROOF_CITIES.length)];
      const randomProduct = SOCIAL_PROOF_PRODUCTS[Math.floor(Math.random() * SOCIAL_PROOF_PRODUCTS.length)];
      
      setSocialProofData({ name: randomName, city: randomCity, product: randomProduct });
      setShowSocialProof(true);
      
      // Hide after 5 seconds
      setTimeout(() => {
        setShowSocialProof(false);
      }, 5000);
    };

    // Show first notification after 10 seconds
    const initialTimeout = setTimeout(showNotification, 10000);
    
    // Then show every 30-60 seconds randomly
    const interval = setInterval(() => {
      showNotification();
    }, 30000 + Math.random() * 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Handle URL hash for opening search/cart from other pages
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#search') {
      setShowSearch(true);
      // Clean the hash from URL
      window.history.replaceState(null, '', location.pathname);
    } else if (hash === '#cart') {
      setShowCart(true);
      // Clean the hash from URL
      window.history.replaceState(null, '', location.pathname);
    }
  }, [location]);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('manoprotect_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('manoprotect_cart', JSON.stringify(cart));
  }, [cart]);

  // Checkout con Stripe
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Check if all items are free (like free device with just shipping)
    const hasPayableItems = cart.some(item => item.precio > 0) || cartEnvio > 0;
    
    if (!hasPayableItems) {
      toast.error('No hay productos de pago en el carrito');
      navigate('/dispositivo-sos');
      return;
    }

    setCheckoutLoading(true);
    
    try {
      const response = await fetch(`${API}/api/payments/cart/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio,
            cantidad: item.cantidad,
            imagen: item.imagen
          })),
          shipping_cost: cartEnvio,
          origin_url: window.location.origin
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Clear cart before redirecting to Stripe
        localStorage.setItem('manoprotect_cart_backup', JSON.stringify(cart));
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
        // If cart only has free items, redirect to device page
        if (cart.every(item => item.precio === 0)) {
          navigate('/dispositivo-sos');
        }
      } else {
        toast.error('Error al procesar el pago');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Función de búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({ productos: [], paginas: [] });
      return;
    }
    const queryLower = query.toLowerCase();
    const productosEncontrados = productos.filter(p => 
      p.nombre.toLowerCase().includes(queryLower) || 
      p.descripcion.toLowerCase().includes(queryLower)
    );
    const paginasEncontradas = paginas.filter(p => 
      p.nombre.toLowerCase().includes(queryLower)
    );
    setSearchResults({ productos: productosEncontrados, paginas: paginasEncontradas });
  };

  // Funciones del carrito
  const addToCart = (producto) => {
    const existingItem = cart.find(item => item.id === producto.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCart([...cart, { ...producto, cantidad: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newCantidad = item.cantidad + delta;
        return newCantidad > 0 ? { ...item, cantidad: newCantidad } : item;
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const cartEnvio = cart.length > 0 ? 4.95 : 0;
  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <Helmet>
        <title>ManoProtect - Localizador GPS para Familias | #1 en España</title>
        <meta name="description" content="Localizador GPS para familias que protege lo que más quieres." />
      </Helmet>

      {/* ============ HEADER ============ */}
      <header className="bg-white py-3 px-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🖐</span>
          </div>
          <span className="text-[#4CAF50] text-2xl font-bold">ManoProtect</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Link al Blog */}
          <Link 
            to="/blog" 
            className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-[#4CAF50] transition-colors font-medium text-sm"
            data-testid="header-blog-link"
          >
            <span>📰</span>
            <span>Alertas</span>
          </Link>
          
          <Link to="/login" className="hidden sm:block border-2 border-gray-800 text-gray-800 px-5 py-2 font-bold text-sm hover:bg-gray-800 hover:text-white transition-colors">
            MI CUENTA
          </Link>
          
          {/* Carrito */}
          <button 
            onClick={() => setShowCart(true)} 
            className="relative text-gray-600 hover:text-[#4CAF50] transition-colors"
            data-testid="cart-btn"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          
          {/* Búsqueda */}
          <button 
            onClick={() => setShowSearch(true)} 
            className="text-gray-600 hover:text-[#4CAF50] transition-colors"
            data-testid="search-btn"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ============ MODAL BÚSQUEDA ============ */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
          <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Barra de búsqueda */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, páginas..."
                className="flex-1 text-lg outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery.length < 2 ? (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Escribe al menos 2 caracteres para buscar</p>
                  <div className="mt-4 text-sm">
                    <p className="font-medium text-gray-700 mb-2">Búsquedas populares:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['GPS', 'Dispositivo SOS', 'Precios', 'Familia'].map(term => (
                        <button 
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-[#4CAF50] hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Productos */}
                  {searchResults.productos.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Productos</h3>
                      {searchResults.productos.map(producto => (
                        <div
                          key={producto.id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <Link
                            to={producto.url}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center gap-4 flex-1"
                          >
                            <img src={producto.imagen} alt={producto.nombre} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{producto.nombre}</p>
                              <p className="text-sm text-gray-500">{producto.descripcion}</p>
                            </div>
                            <span className="font-bold text-[#4CAF50]">
                              {producto.precio === 0 ? 'GRATIS' : `${producto.precio}€/mes`}
                            </span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: producto.id,
                                nombre: producto.nombre,
                                descripcion: producto.descripcion,
                                precio: producto.precio,
                                imagen: producto.imagen
                              });
                              toast.success(`${producto.nombre} añadido al carrito`);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-[#4CAF50] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#45a049] transition-all flex items-center gap-1 whitespace-nowrap"
                            data-testid={`add-to-cart-${producto.id}`}
                          >
                            <Plus className="w-4 h-4" />
                            Añadir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Páginas */}
                  {searchResults.paginas.length > 0 && (
                    <div className="p-4 border-t">
                      <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Páginas</h3>
                      {searchResults.paginas.map(pagina => (
                        <Link
                          key={pagina.url}
                          to={pagina.url}
                          onClick={() => setShowSearch(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-700">{pagina.nombre}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Sin resultados */}
                  {searchResults.productos.length === 0 && searchResults.paginas.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <p>No se encontraron resultados para "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL CARRITO ============ */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header carrito */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Tu Carrito ({cartCount})
              </h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                  <Link 
                    to="/dispositivo-sos" 
                    onClick={() => setShowCart(false)}
                    className="inline-block bg-[#4CAF50] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#45a049] transition-colors"
                  >
                    Ver Dispositivos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <img src={item.imagen} alt={item.nombre} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.nombre}</h3>
                        <p className="text-sm text-gray-500">{item.descripcion}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-8 text-center">{item.cantidad}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-[#4CAF50]">
                            {item.precio === 0 ? 'GRATIS' : `${(item.precio * item.cantidad).toFixed(2)}€`}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-green-400 hover:text-green-600 self-start"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer carrito */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{cartTotal === 0 ? 'GRATIS' : `${cartTotal.toFixed(2)}€`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío Express 24-48h</span>
                    <span>{cartEnvio.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#4CAF50]">{(cartTotal + cartEnvio).toFixed(2)}€</span>
                  </div>
                </div>
                
                {/* Botón de Checkout */}
                {cartTotal > 0 ? (
                  <button 
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full bg-[#4CAF50] text-white py-4 rounded-xl font-bold hover:bg-[#45a049] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="checkout-btn"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pagar con Stripe
                      </>
                    )}
                  </button>
                ) : (
                  <Link 
                    to="/dispositivo-sos"
                    onClick={() => setShowCart(false)}
                    className="block w-full bg-[#4CAF50] text-white text-center py-4 rounded-xl font-bold hover:bg-[#45a049] transition-colors"
                  >
                    Finalizar Pedido
                  </Link>
                )}
                
                <p className="text-xs text-center text-gray-500">
                  🔒 Pago seguro con encriptación SSL de Stripe
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section className="relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.pexels.com/photos/4148842/pexels-photo-4148842.jpeg?auto=compress&cs=tinysrgb&w=1920')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-full text-sm mb-6">
            <span>⭐</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-bold ml-2">4.8/5</span>
            <span className="text-gray-300 text-xs ml-2">Basado en 327 opiniones verificadas</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              <span className="text-gray-800">Localizador GPS</span><br />
              <span className="text-gray-800">para familias que</span><br />
              <span className="text-[#4CAF50]">protege lo que más quieres</span>
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Sabe dónde están tus hijos y mayores<br />
              y recibe alertas en tiempo real.
            </p>

            <div className="inline-flex items-center gap-2 bg-white border-2 border-green-500 px-4 py-2 rounded mb-6">
              <span className="text-green-500 font-bold">#</span>
              <span className="text-gray-800 font-bold">1 en localizadores GPS para familias en España</span>
              <span className="text-xl">🇪🇸</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link 
                to="/dispositivo-sos"
                className="bg-[#4CAF50] text-white font-bold px-6 py-3 text-sm hover:bg-[#45a049] transition-colors"
                data-testid="hero-cta-gps"
              >
                VER GPS PARA FAMILIAS
              </Link>
              <Link 
                to="/como-funciona"
                className="border-2 border-[#4CAF50] text-[#4CAF50] font-bold px-6 py-3 text-sm hover:bg-[#4CAF50] hover:text-white transition-colors"
                data-testid="hero-cta-how"
              >
                CÓMO FUNCIONA
              </Link>
              <Link 
                to="/blog"
                className="border-2 border-gray-800 text-gray-800 font-bold px-6 py-3 text-sm hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                data-testid="hero-cta-blog"
              >
                <span>📰</span>
                ALERTAS Y NOTICIAS
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span className="font-bold">4,8/5 en 327 familias</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span>📋</span>
                <span>Basado en 327 opiniones.</span>
              </div>
              <div className="flex items-center gap-1 text-[#4CAF50]">
                <Lock className="w-4 h-4" />
                <span className="font-bold">Pago 100% Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="bg-white py-4 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#4CAF50] font-bold text-lg">+2,000 familias protegidas en España</span>
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ SENTINEL X PROMO BANNER ============ */}
      <section className="relative bg-black py-10 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-blue-900/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Product Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative group flex justify-center">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl rounded-full transform scale-50" />
                
                <Link to="/sentinel-x" className="block">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                    alt="ManoProtect SENTINEL X - Smartwatch de Seguridad"
                    className="relative z-10 w-48 sm:w-56 lg:w-64 transform group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                    data-testid="sentinel-x-promo-image"
                  />
                </Link>
                
                {/* Floating badge */}
                <div className="absolute top-0 right-8 lg:right-16 animate-bounce">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🔥 NUEVO
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-3">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                Edición Fundadores - Solo 500 unidades
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                SENTINEL X
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Tu Guardián Personal
                </span>
              </h2>
              
              <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto lg:mx-0">
                El smartwatch que actúa cuando tú no puedes. SOS invisible, grabación en la nube 
                y trayecto seguro. <span className="text-cyan-400 font-semibold">Funciona sin teléfono.</span>
              </p>

              {/* Key features */}
              <div className="grid grid-cols-2 gap-2 mb-4 max-w-sm mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  SOS Invisible
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Modo PIN Falso
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Grabación Nube
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  5 días batería
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <div className="text-center sm:text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">149€</span>
                    <span className="text-gray-500 line-through text-sm">249€</span>
                  </div>
                  <p className="text-green-400 text-xs">Ahorras 100€</p>
                </div>
                
                <Link 
                  to="/sentinel-x"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                  data-testid="sentinel-x-promo-cta"
                >
                  Ver SENTINEL X
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-3 mt-4 justify-center lg:justify-start text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-500" />
                  <span>Garantía 12 meses</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-500" />
                  <span>Envío Europa</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-cyan-500" />
                  <span>Devolución fácil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZA Y PROTEGE ============ */}
      <section className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/4148842/pexels-photo-4148842.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Familia con GPS"
                className="rounded-lg shadow-xl w-full"
              />
              <button 
                onClick={() => setShowVideo(true)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                  <Play className="w-8 h-8 text-[#4CAF50] ml-1" fill="currentColor" />
                </div>
              </button>
              
              <div className="absolute bottom-4 left-4 right-4">
                <Link 
                  to="/dispositivo-sos"
                  className="block bg-[#4CAF50] text-white text-center font-bold py-3 text-sm hover:bg-[#45a049]"
                >
                  VER DISPOSITIVOS DISPONIBLES
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Localiza y Protege<br />
                a tus Seres Queridos
              </h2>

              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-gray-700">Encuentra a tus seres queridos al instante, sin cuotas fijas.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-gray-700">Tus hijos o mayores te alertan al instante si necesitan ayuda</p>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                  <p className="text-gray-700">Recibe avisos si salen de zona seguras configuradas al instante al móvil, email o SMS</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPRA SIN RIESGOS ============ */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Compra sin riesgos, tranquilidad garantizada
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <span className="font-bold text-gray-800">30 DÍAS SIN RIESGOS</span>
                  <span className="text-gray-600 ml-2">- Prueba el GPS durante 30 días.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <span className="font-bold text-gray-800">ENVÍO RÁPIDO</span>
                  <span className="text-gray-500 ml-1">DESDE ESPAÑA</span>
                  <span className="text-gray-600 ml-2">Entrega en 24-48h desde España, seguimiento del pedido.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <span className="font-bold text-gray-800">PAGO SEGURO</span>
                  <span className="text-gray-500 ml-1">GARANTIZADO</span>
                  <span className="text-gray-600 ml-2">Transacciones cifradas SSL</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-1" strokeWidth={3} />
                <div>
                  <span className="font-bold text-gray-800">SOPORTE REAL</span>
                  <span className="text-gray-500 ml-1">POR WHATSAPP</span>
                  <span className="text-gray-600 ml-2">Asistencia personalizada 24/7</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 mt-4">
                <span className="font-bold text-gray-800">¿Qué garantía ofrecen?</span>
                <span className="text-gray-500 text-sm">30 días de prueba sin compromiso.</span>
                <ChevronRight className="w-5 h-5 text-[#4CAF50]" />
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/4625010/pexels-photo-4625010.jpeg?auto=compress&cs=tinysrgb&w=500"
                alt="Madre e hijo"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute bottom-4 left-4 right-4">
                <Link 
                  to="/dispositivo-sos"
                  className="block bg-[#4CAF50] text-white text-center font-bold py-3 text-sm hover:bg-[#45a049]"
                >
                  COMPRAR GPS AHORA
                </Link>
              </div>
              <a 
                href="https://wa.me/34601510950"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -right-3 bottom-20 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg"
              >
                <Phone className="w-6 h-6 text-white" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section className="relative py-12" style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1565C0 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/3768005/pexels-photo-3768005.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Mujer con teléfono"
                className="rounded-lg shadow-xl h-full object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-white mb-8">
                Opiniones Reales <span className="text-white/80">de Nuestros Clientes</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face" alt="Laura" className="w-10 h-10 rounded-full" />
                    <div>
                      <span className="font-bold text-gray-800">Laura S.</span>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 ml-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">Gracias a ManoProtect, siempre sé dónde están mis hijos. Estoy mucho más tranquila cuando salen solos.</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Pedro" className="w-10 h-10 rounded-full" />
                    <div>
                      <span className="font-bold text-gray-800">Pedro M.</span>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 ml-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">Un GPS que salva vidas. Lo recomiendo 100%. El botón SOS nos da mucha tranquilidad.</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face" alt="Marta" className="w-10 h-10 rounded-full" />
                    <div>
                      <span className="font-bold text-gray-800">Marta G.</span>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 ml-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">Mis padres mayores ahora están mucho más seguros. ¡Muy contenta con la compra!</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" alt="Carlos" className="w-10 h-10 rounded-full" />
                    <div>
                      <span className="font-bold text-gray-800">Carlos R.</span>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 ml-auto" />
                  </div>
                  <p className="text-gray-600 text-sm">El mejor localizador que he probado. La app funciona perfectamente y el soporte es excelente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUIÉNES SOMOS ============ */}
      <section className="bg-[#4CAF50] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">🖐</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Quiénes Somos</h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Fuimos creados para ofrecer tranquilidad a las familias españolas. Creamos soluciones GPS de alta calidad que permiten localizar y proteger a tus seres queridos en todo momento.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-end text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Empresa de<br />Prevención</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Equipo<br />Dedicado</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Tecnología<br />GPS avanzada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section 
        className="relative py-12 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.pexels.com/photos/4148842/pexels-photo-4148842.jpeg?auto=compress&cs=tinysrgb&w=1920')` }}
      >
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Empieza a proteger a tu familia hoy mismo
          </h2>
          <Link 
            to="/dispositivo-sos"
            className="inline-flex items-center gap-2 bg-[#4CAF50] text-white font-bold px-10 py-4 hover:bg-[#45a049] transition-colors text-lg"
          >
            COMPRAR GPS AHORA
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Social Proof Notification */}
      {showSocialProof && (
        <div 
          className="fixed bottom-24 left-6 z-40 animate-in slide-in-from-left duration-500"
          data-testid="social-proof-notification"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-xs flex items-start gap-3 relative overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600" />
            
            {/* Watch icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <img 
                src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/acz8j630_Reloj%20inteligente%20ManoProtect%20SENTINEL%20X.png"
                alt="SENTINEL X"
                className="w-10 h-10 object-contain"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium">
                🔔 <span className="font-bold">{socialProofData.name}</span> de {socialProofData.city}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                acaba de reservar un <span className="text-cyan-600 font-semibold">{socialProofData.product}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Hace unos segundos</p>
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setShowSocialProof(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Verified badge */}
            <div className="absolute bottom-2 right-3 flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Verificado</span>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowVideo(false)} 
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300 transition-colors"
            >
              &times;
            </button>
            <video 
              className="w-full h-full object-contain"
              controls
              autoPlay
              src="https://customer-assets.emergentagent.com/job_8161c713-bb69-4bfd-84d2-fde54657d491/artifacts/zbay1jyq_ManoProtect%20Sentinel%20X%20Oferta_720p_caption%20%281%29.mp4"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      )}

      {/* WhatsApp Flotante */}
      <a 
        href="https://wa.me/34601510950"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-30"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};

export default LandingPage;
