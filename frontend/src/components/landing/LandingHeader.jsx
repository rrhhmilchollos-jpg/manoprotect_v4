/**
 * ManoProtect - Landing Page Header
 * Consistent design with search and cart functionality
 */
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('manoprotect_cart');
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((total, item) => total + item.cantidad, 0);
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      }
    };

    updateCartCount();
    
    // Listen for storage changes (cart updates from other pages)
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
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
          to="/alarmas-hogar"
          className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-700 transition-colors"
          data-testid="header-alarmas-btn"
        >
          Alarmas
        </Link>
        <Link 
          to="/escudo-vecinal"
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors"
          data-testid="header-escudo-btn"
        >
          Escudo Vecinal
        </Link>
        <Link 
          to="/blog"
          className="bg-[#4CAF50] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#45a049] transition-colors"
        >
          Blog
        </Link>
        
        <Link 
          to="/login" 
          className="border-2 border-gray-800 text-gray-800 px-5 py-2 font-bold text-sm hover:bg-gray-800 hover:text-white transition-colors"
        >
          MI CUENTA
        </Link>
        
        {/* Cart - links to homepage with cart open */}
        <Link 
          to="/#cart"
          className="relative text-gray-600 hover:text-[#4CAF50] transition-colors"
          data-testid="header-cart-btn"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
        
        {/* Search - links to homepage with search open */}
        <Link 
          to="/#search"
          className="text-gray-600 hover:text-[#4CAF50] transition-colors"
          data-testid="header-search-btn"
        >
          <Search className="w-6 h-6" />
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 text-gray-600 hover:text-[#4CAF50]"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-testid="mobile-menu-btn"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3 shadow-lg z-50">
          <Link
            to="/alarmas-hogar"
            className="block py-2 text-red-600 hover:text-red-700 font-bold"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-alarmas-btn"
          >
            Alarmas Hogar y Empresa
          </Link>
          <Link
            to="/escudo-vecinal"
            className="block py-2 text-blue-500 hover:text-blue-600 font-bold"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="mobile-escudo-btn"
          >
            Escudo Vecinal
          </Link>
          <Link
            to="/dispositivo-sos"
            className="block py-2 text-gray-700 hover:text-[#4CAF50] font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dispositivo SOS
          </Link>
          <Link
            to="/pricing"
            className="block py-2 text-gray-700 hover:text-[#4CAF50] font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Precios
          </Link>
          <Link
            to="/como-funciona"
            className="block py-2 text-gray-700 hover:text-[#4CAF50] font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cómo Funciona
          </Link>
          <Link
            to="/blog"
            className="block py-2 text-gray-700 hover:text-[#4CAF50] font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          
          <div className="pt-3 border-t border-gray-200 flex items-center gap-4">
            <Link
              to="/login"
              className="flex-1 text-center py-2 border-2 border-gray-800 text-gray-800 font-bold text-sm hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              MI CUENTA
            </Link>
            <Link 
              to="/#cart" 
              className="relative text-gray-600 hover:text-[#4CAF50]" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link 
              to="/#search" 
              className="text-gray-600 hover:text-[#4CAF50]" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-6 h-6" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
