import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '@/utils/apiBase';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, Users, UserPlus, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function FamiliaAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [familiaId, setFamiliaId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/familia/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ familia_id: familiaId, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al iniciar sesión');
      toast.success(`Bienvenido, ${data.name}`);
      navigate('/mi-seguridad');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/familia/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ familia_id: familiaId, nombre, email, password, telefono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      toast.success('Cuenta creada correctamente');
      navigate('/mi-seguridad');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/familia/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familia_id: familiaId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      toast.success('Instrucciones enviadas a tu email');
      setResetMode(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/familia/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      toast.success('Contraseña actualizada');
      setMode('login');
      setResetMode(false);
      setResetToken('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" data-testid="familia-auth-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-3">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white">ManoProtect Familia</h1>
          <p className="text-slate-400 text-xs mt-1">Acceso seguro para tu hogar</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-slate-900 rounded-lg p-0.5 mb-5 border border-slate-800">
          {[
            { id: 'login', label: 'Acceder', icon: KeyRound },
            { id: 'register', label: 'Registro', icon: UserPlus },
            { id: 'forgot', label: 'Recuperar', icon: Lock },
          ].map(t => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => { setMode(t.id); setResetMode(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${mode === t.id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <t.icon className="w-3 h-3" />{t.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">ID de Familia</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input data-testid="familia-id-input" type="text" value={familiaId} onChange={e => setFamiliaId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none uppercase" placeholder="Ej: GARCIA2025" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input data-testid="familia-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="tu@email.com" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input data-testid="familia-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contraseña" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <button data-testid="familia-login-btn" type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Accediendo...' : 'Acceder'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">ID de Familia (crear o usar existente)</label>
                <input data-testid="reg-familia-id" type="text" value={familiaId} onChange={e => setFamiliaId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none uppercase" placeholder="Ej: GARCIA2025" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Nombre completo</label>
                <input data-testid="reg-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="Juan García" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
                <input data-testid="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="tu@email.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Teléfono</label>
                <input data-testid="reg-telefono" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="+34 612 345 678" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Contraseña</label>
                <input data-testid="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="Min. 8 caracteres" required />
              </div>
              <button data-testid="familia-register-btn" type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Creando cuenta...' : 'Crear Cuenta Familiar'}
              </button>
            </form>
          )}

          {mode === 'forgot' && !resetMode && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-400">Introduce tu ID de familia y email para recuperar tu contraseña.</p>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">ID de Familia</label>
                <input data-testid="forgot-familia-id" type="text" value={familiaId} onChange={e => setFamiliaId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none uppercase" placeholder="GARCIA2025" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Email</label>
                <input data-testid="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="tu@email.com" required />
              </div>
              <button data-testid="forgot-submit-btn" type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm">
                {loading ? 'Enviando...' : 'Solicitar Recuperación'}
              </button>
            </form>
          )}

          {mode === 'forgot' && resetMode && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-400">Introduce el token de recuperación y tu nueva contraseña.</p>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Token de recuperación</label>
                <input data-testid="reset-token" type="text" value={resetToken} onChange={e => setResetToken(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none font-mono text-xs" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Nueva contraseña</label>
                <input data-testid="reset-new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none" placeholder="Min. 8 caracteres" required />
              </div>
              <button data-testid="reset-submit-btn" type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm">
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>

        <button onClick={() => navigate('/')} className="block mx-auto mt-5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Volver a ManoProtect.com
        </button>
      </div>
    </div>
  );
}
