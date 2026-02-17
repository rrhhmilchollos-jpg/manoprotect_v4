/**
 * ManoProtect - Employee Login Page
 * Secure login for employees only
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/enterprise/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Store session in both localStorage keys for compatibility
      const sessionData = {
        employee_id: data.employee_id,
        name: data.name,
        email: data.email,
        role: data.role,
        session_token: data.session_token
      };
      localStorage.setItem('employee_session', JSON.stringify(sessionData));
      localStorage.setItem('enterprise_session', data.session_token);

      toast.success(`Bienvenido, ${data.name}`);
      navigate('/empleados/dashboard');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <Helmet>
        <title>Portal de Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Portal de Empleados</CardTitle>
          <CardDescription className="text-slate-400">
            Acceso exclusivo para empleados de ManoProtect
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email"
                  placeholder="tu@manoprotect.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                  data-testid="employee-login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                  data-testid="employee-login-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12"
              disabled={loading}
              data-testid="employee-login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-amber-400 mb-1">¿No tienes cuenta?</p>
                <p>Solo el Director General puede crear cuentas de empleado. Contacta con tu supervisor si necesitas acceso.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Volver a la web principal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
