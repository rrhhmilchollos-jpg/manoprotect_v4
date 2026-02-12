/**
 * ManoProtect - Landing Page Header
 * Clean, professional navigation
 */
import { useNavigate } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const LOGO_URL = '/manoprotect_logo.webp';

const LandingHeader = () => {
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
          <img
            src={LOGO_URL}
            alt="ManoProtect"
            className="h-9 w-auto"
            width="36"
            height="36"
          />
          <span className="font-bold text-slate-900 text-lg hidden sm:block">ManoProtect</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
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
