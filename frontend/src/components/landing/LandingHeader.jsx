/**
 * ManoProtect - Landing Page Header
 * Clean, professional navigation with search and cart icons
 */
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Menu, X, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

const LandingHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('manoprotect_cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const count = cart.reduce((total, item) => total + item.cantidad, 0);
      setCartCount(count);
    }
  }, []);

  return (
    <header className="bg-white py-3 px-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🖐</span>
        </div>
        <span className="text-[#4CAF50] text-2xl font-bold">ManoProtect</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        <Link 
          to="/login" 
          className="border-2 border-gray-800 text-gray-800 px-5 py-2 font-bold text-sm hover:bg-gray-800 hover:text-white transition-colors"
        >
          MI CUENTA
        </Link>
        
        {/* Cart - links to homepage */}
        <Link 
          to="/?cart=open"
          className="relative text-gray-600 hover:text-[#4CAF50] transition-colors"
          data-testid="header-cart-btn"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        
        {/* Search - links to homepage */}
        <Link 
          to="/?search=open"
          className="text-gray-600 hover:text-[#4CAF50] transition-colors"
          data-testid="header-search-btn"
        >
          <Search className="w-6 h-6" />
        </Link>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-testid="mobile-menu-btn"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-2 shadow-lg">
          <Link
            to="/dispositivo-sos"
            className="block py-2 text-gray-700 hover:text-[#4CAF50]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dispositivo SOS
          </Link>
          <Link
            to="/pricing"
            className="block py-2 text-gray-700 hover:text-[#4CAF50]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Precios
          </Link>
          <Link
            to="/como-funciona"
            className="block py-2 text-gray-700 hover:text-[#4CAF50]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cómo Funciona
          </Link>
          <div className="pt-2 border-t border-gray-200 flex items-center gap-4">
            <Link
              to="/login"
              className="flex-1 text-center py-2 border-2 border-gray-800 text-gray-800 font-bold text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              MI CUENTA
            </Link>
            <Link to="/?cart=open" className="text-gray-600" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <Link to="/?search=open" className="text-gray-600" onClick={() => setMobileMenuOpen(false)}>
              <Search className="w-6 h-6" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// Keep this part for backwards compatibility but simplified
const LandingHeaderLegacy = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/')}
          data-testid="header-logo"
        >
          <div className="w-9 h-9 bg-[#4CAF50] rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🖐</span>
          </div>
          <span className="font-bold text-slate-900 text-lg hidden sm:block">ManoProtect</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            data-testid="header-blog-btn"
            onClick={() => navigate('/blog')}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 h-10 font-medium shadow-sm"
          >
            Blog Estafas
          </Button>
          <Button
            data-testid="header-sos-btn"
            onClick={() => navigate('/servicios-sos')}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 h-10 font-medium shadow-sm"
          >
            Botón SOS
          </Button>
          <Button
            data-testid="header-pricing-btn"
            variant="ghost"
            onClick={() => navigate('/plans')}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-5 h-10"
          >
            Precios
          </Button>
          <Button
            data-testid="header-investors-btn"
            variant="ghost"
            onClick={() => navigate('/investor/register')}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-5 h-10"
          >
            Inversores
          </Button>
          
          <div className="w-px h-6 bg-slate-200 mx-2" />
          
          {isAuthenticated ? (
            <Button
              data-testid="header-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-10 font-medium"
            >
              Mi Panel
            </Button>
          ) : (
            <>
              <Button
                data-testid="header-login-btn"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-5 h-10"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
              <Button
                data-testid="header-register-btn"
                onClick={() => navigate('/register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-10 font-medium"
              >
                Registrarse
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => { navigate('/servicios-sos'); setMobileMenuOpen(false); }}
          >
            Botón SOS
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => { navigate('/plans'); setMobileMenuOpen(false); }}
          >
            Precios
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => { navigate('/investor/register'); setMobileMenuOpen(false); }}
          >
            Inversores
          </Button>
          <div className="pt-2 border-t border-slate-200">
            {isAuthenticated ? (
              <Button
                className="w-full bg-indigo-600"
                onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              >
                Mi Panel
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full bg-indigo-600"
                  onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
