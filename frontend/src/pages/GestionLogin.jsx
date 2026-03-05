import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/apiBase';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = {
  admin: { label: 'Administración', path: '/gestion/admin', color: 'from-indigo-600 to-indigo-800' },
  comercial: { label: 'Comerciales', path: '/gestion/comerciales', color: 'from-emerald-600 to-emerald-800' },
  instalador: { label: 'Instaladores', path: '/gestion/instaladores', color: 'from-amber-600 to-amber-800' },
};

export default function GestionLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/gestion/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión');
      localStorage.setItem('gestion_token', data.token);
      localStorage.setItem('gestion_user', JSON.stringify(data.user));
      toast.success(`Bienvenido, ${data.user.nombre}`);
      const info = ROLES[data.user.rol];
      navigate(info?.path || '/gestion/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" data-testid="gestion-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistema de Gestión</h1>
          <p className="text-slate-400 text-sm mt-1">ManoProtect CRA Professional</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                data-testid="gestion-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                data-testid="gestion-login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Contraseña"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            data-testid="gestion-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Iniciando sesión...' : 'Acceder al Sistema'}
          </button>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">Acceso exclusivo para personal autorizado de ManoProtect</p>
          </div>
        </form>

        <button
          onClick={() => navigate('/')}
          className="block mx-auto mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Volver a ManoProtect.com
        </button>
      </div>
    </div>
  );
}
