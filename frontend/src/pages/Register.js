import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const { t } = useI18n();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: t('auth.register.passwordMinLength') }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.register.passwordsNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('auth.register.passwordMinLength'));
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.name, formData.password);
    
    if (result.success) {
      toast.success(t('auth.register.success'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleRegister = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-2 border-zinc-200 shadow-xl bg-white">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" 
              alt="ManoProtect Logo" 
              className="h-16 w-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.joinMano')}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Register Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-2 hover:bg-zinc-50"
            onClick={handleGoogleRegister}
            data-testid="google-register-btn"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.register.withGoogle')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-zinc-500">{t('auth.login.orWithEmail')}</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">{t('auth.register.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  data-testid="name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">{t('auth.register.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">{t('auth.register.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12"
                  required
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-xs space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className={`flex items-center gap-1 ${req.met ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">{t('auth.register.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('auth.register.creating')}</>
              ) : (
                t('auth.register.button')
              )}
            </Button>
          </form>

          <p className="text-xs text-zinc-500 text-center">
            {t('auth.register.terms')}
          </p>

          <div className="text-center text-sm text-zinc-600">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              {t('auth.register.signIn')}
            </Link>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-700">
              {t('auth.login.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
