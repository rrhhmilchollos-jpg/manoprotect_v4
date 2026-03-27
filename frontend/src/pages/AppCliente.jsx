import React, { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../lib/firebase';

const API = process.env.REACT_APP_BACKEND_URL;

const DEVICE_ICONS = {
  panel: 'fa-tablet-screen-button', sensor_door: 'fa-door-open', sensor_pir: 'fa-eye',
  smoke_detector: 'fa-cloud', camera: 'fa-video', siren: 'fa-bell', keypad: 'fa-keyboard',
};
const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

// Device fingerprint
function getFingerprint() {
  const d = [navigator.userAgent, navigator.language, `${screen.width}x${screen.height}`, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|');
  let h = 0; for (let i = 0; i < d.length; i++) { h = ((h << 5) - h) + d.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

export default function AppCliente() {
  const [screen, setScreen] = useState('loading');
  const [authMode, setAuthMode] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('mp_trial_token') || '');
  const [user, setUser] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [installData, setInstallData] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', nombre: '' });
  const [referralCode, setReferralCode] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [arming, setArming] = useState(false);
  const [notification, setNotification] = useState(null);
  const pollRef = useRef(null);

  const headers = useCallback(() => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }), [token]);

  // Listen for foreground notifications
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      const n = { title: payload.notification?.title, body: payload.notification?.body, type: payload.data?.type, critical: payload.data?.critical === 'true' };
      setNotification(n);
      setTimeout(() => setNotification(null), 8000);
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Check session on mount
  useEffect(() => {
    // Check for Stripe return
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (token) { checkTrialStatus(); }
    else { setScreen('auth'); }
  }, []);

  const checkTrialStatus = async () => {
    try {
      const res = await fetch(`${API}/api/client-trial/status`, { headers: headers() });
      if (!res.ok) { logout(); return; }
      const data = await res.json();
      setTrialStatus(data);
      const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
      setUser(stored);
      if (data.subscription_status === 'expired') { setScreen('paywall'); }
      else { setScreen('app'); fetchInstallation(); }
    } catch { logout(); }
  };

  const register = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/client-trial/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, nombre: form.nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error de registro');
      localStorage.setItem('mp_trial_token', data.token);
      localStorage.setItem('mp_trial_user', JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
      setTrialStatus({ subscription_status: 'trial', trial_days_left: data.user.trial_days_left, show_expiry_warning: false, price_monthly: 9.99 });
      setScreen('app');
      // Request push notifications permission
      requestNotificationPermission(data.user.user_id, API);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const login = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const fp = getFingerprint();
      const res = await fetch(`${API}/api/client-trial/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, fingerprint: fp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error de autenticacion');
      localStorage.setItem('mp_trial_token', data.token);
      localStorage.setItem('mp_trial_user', JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
      if (data.user.subscription_status === 'expired') {
        setTrialStatus({ subscription_status: 'expired', trial_days_left: 0, price_monthly: 9.99 });
        setScreen('paywall');
      } else {
        setTrialStatus({ subscription_status: data.user.subscription_status, trial_days_left: data.user.trial_days_left, show_expiry_warning: data.user.trial_days_left <= 2, price_monthly: 9.99 });
        setScreen('app');
        // Request push notifications permission
        requestNotificationPermission(data.user.user_id, API);
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('mp_trial_token'); localStorage.removeItem('mp_trial_user');
    setToken(''); setUser(null); setInstallData(null); setTrialStatus(null);
    setScreen('auth'); clearInterval(pollRef.current);
  };

  const fetchInstallation = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
      setUser(stored);
    } catch {}
  };

  const startSubscription = async () => {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const res = await fetch(`${API}/api/client-trial/checkout`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ origin_url: origin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al crear pago');
      window.location.href = data.url;
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const pollPaymentStatus = async (sessionId, attempt = 0) => {
    if (attempt >= 5) return;
    try {
      const res = await fetch(`${API}/api/client-trial/checkout/status/${sessionId}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_status === 'paid') {
          const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
          stored.subscription_status = 'active';
          localStorage.setItem('mp_trial_user', JSON.stringify(stored));
          setUser(stored);
          setTrialStatus(prev => ({ ...prev, subscription_status: 'active' }));
          setScreen('app');
          return;
        }
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 2000);
    } catch {}
  };

  const applyReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      const res = await fetch(`${API}/api/client-trial/referral/apply`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ code: referralCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      setReferralMsg(data.message);
      checkTrialStatus();
    } catch (err) { setReferralMsg(err.message); }
  };

  const armSystem = async (mode) => {
    if (arming) return; setArming(true);
    try {
      const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
      if (stored.installation_id) {
        await fetch(`${API}/api/cra/installations/${stored.installation_id}/arm`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({ mode, code: '1234' }),
        });
      }
    } catch {} finally { setArming(false); }
  };

  // ==================== LOADING ====================
  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <i className="fa-solid fa-shield-halved fa-spin" style={{ fontSize: 48, color: '#3b82f6', marginBottom: 16 }}></i>
          <p style={{ opacity: 0.6, fontSize: 14 }}>Cargando ManoProtect...</p>
        </div>
      </div>
    );
  }

  // ==================== AUTH (LOGIN / REGISTER) ====================
  if (screen === 'auth') {
    return (
      <div data-testid="client-auth" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f36 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <i className="fa-solid fa-shield-halved" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>ManoProtect</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Seguridad Inteligente para tu Hogar</p>
          </div>

          {/* Toggle tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {['login', 'register'].map(m => (
              <button key={m} data-testid={`auth-tab-${m}`} onClick={() => { setAuthMode(m); setError(''); }}
                style={{ flex: 1, padding: '12px', border: 'none', background: authMode === m ? 'rgba(59,130,246,0.2)' : 'transparent', color: authMode === m ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {m === 'login' ? 'Iniciar Sesion' : 'Registro Gratis'}
              </button>
            ))}
          </div>

          <form onSubmit={authMode === 'login' ? login : register}>
            {authMode === 'register' && (
              <input data-testid="register-name" type="text" placeholder="Tu nombre" value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            )}
            <input data-testid="auth-email" type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            <input data-testid="auth-password" type="password" placeholder="Contrasena" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }} />
            {error && <p data-testid="auth-error" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button data-testid="auth-submit" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Procesando...' : authMode === 'login' ? 'Acceder' : 'Registrarse — 7 dias gratis'}
            </button>
          </form>

          {authMode === 'register' && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
              7 dias de prueba gratuita. Todas las funciones desbloqueadas. Sin compromiso.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== PAYWALL ====================
  if (screen === 'paywall') {
    return (
      <div data-testid="paywall" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f36 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
            <i className="fa-solid fa-lock" style={{ color: '#fff' }}></i>
          </div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Tu trial ha expirado</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>Continua protegiendo tu hogar con ManoProtect</p>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
            <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Plan Mensual</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              <span style={{ color: '#fff', fontSize: 42, fontWeight: 800 }}>9,99</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>/mes</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
              {['Control total de tu alarma', 'Camaras en tiempo real', 'Historial de eventos', 'Alertas SOS inmediatas', 'Soporte prioritario 24/7'].map((f, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-check" style={{ color: '#10b981', fontSize: 12 }}></i> {f}
                </li>
              ))}
            </ul>
          </div>

          <button data-testid="subscribe-btn" onClick={startSubscription} disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Redirigiendo a pago...' : 'Continuar suscripcion'}
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</p>}
          <button data-testid="paywall-logout" onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>Cerrar sesion</button>
        </div>
      </div>
    );
  }

  // ==================== MAIN APP ====================
  const subStatus = trialStatus?.subscription_status || user?.subscription_status || 'trial';
  const daysLeft = trialStatus?.trial_days_left ?? user?.trial_days_left ?? 0;
  const showWarning = subStatus === 'trial' && daysLeft <= 2;

  return (
    <div data-testid="client-app" style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* Trial Warning Banner */}
      {showWarning && (
        <div data-testid="trial-warning" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#000' }}>
          <i className="fa-solid fa-clock"></i> Tu trial termina en {daysLeft} dia{daysLeft !== 1 ? 's' : ''}. <span onClick={startSubscription} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Sigue con nosotros</span>
        </div>
      )}

      {/* Push Notification Alert */}
      {notification && (
        <div data-testid="push-notification" onClick={() => setNotification(null)} style={{
          background: notification.critical ? 'linear-gradient(90deg, #dc2626, #991b1b)' : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
          padding: '14px 16px', textAlign: 'center', fontSize: 14, color: '#fff', cursor: 'pointer',
          animation: notification.critical ? 'pulse 1s infinite' : 'none',
        }}>
          <i className={`fa-solid ${notification.critical ? 'fa-triangle-exclamation' : 'fa-bell'}`} style={{ marginRight: 8 }}></i>
          <strong>{notification.title}</strong> — {notification.body}
        </div>
      )}

      {/* Trial/Active Badge */}
      {subStatus === 'trial' && !showWarning && (
        <div style={{ background: 'rgba(59,130,246,0.1)', padding: '8px 16px', textAlign: 'center', fontSize: 12, color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
          <i className="fa-solid fa-gift"></i> Trial gratuito — {daysLeft} dias restantes
        </div>
      )}

      {/* ===== HOME ===== */}
      {activeTab === 'home' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Bienvenido</p>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.nombre || 'Cliente'}</h2>
            </div>
            <button data-testid="client-logout-btn" onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>

          {/* Security Status */}
          <div data-testid="security-status" style={{
            background: 'linear-gradient(135deg, #334155, #1e293b)', borderRadius: 20, padding: 28, marginBottom: 20, textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>
              <i className="fa-solid fa-shield-halved" style={{ color: '#3b82f6' }}></i>
            </div>
            <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>SISTEMA ACTIVO</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Proteccion las 24h</p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { icon: 'fa-shield', label: 'Armar Total', color: '#10b981', action: () => armSystem('total') },
              { icon: 'fa-shield-halved', label: 'Armar Parcial', color: '#f59e0b', action: () => armSystem('partial') },
              { icon: 'fa-lock-open', label: 'Desarmar', color: '#3b82f6', action: () => armSystem('disarmed') },
              { icon: 'fa-triangle-exclamation', label: 'SOS', color: '#ef4444', action: () => { if (window.confirm('Activar ALERTA SOS?')) {} } },
            ].map((a, i) => (
              <button key={i} data-testid={`quick-action-${i}`} onClick={a.action} disabled={arming}
                style={{ padding: '18px 12px', borderRadius: 14, border: `1px solid ${a.color}22`, background: `${a.color}11`, color: a.color, cursor: 'pointer', textAlign: 'center' }}>
                <i className={`fa-solid ${a.icon}`} style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</span>
              </button>
            ))}
          </div>

          {/* Subscription Info */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Estado</span>
              <span style={{ color: subStatus === 'active' ? '#10b981' : '#3b82f6', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                {subStatus === 'active' ? 'Suscripcion Activa' : `Trial (${daysLeft}d)`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== CAMERAS ===== */}
      {activeTab === 'cameras' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Camaras</h2>
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
            <i className="fa-solid fa-video" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
            <p>Tus camaras apareceran aqui cuando se configuren</p>
          </div>
        </div>
      )}

      {/* ===== EVENTS ===== */}
      {activeTab === 'events' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Historial de Eventos</h2>
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
            <p>Sin eventos recientes</p>
          </div>
        </div>
      )}

      {/* ===== PROFILE ===== */}
      {activeTab === 'profile' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Mi Perfil</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700 }}>
                {(user?.nombre || 'C')[0]}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{user?.nombre || user?.email}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            {[
              ['Estado', subStatus === 'active' ? 'Suscripcion Activa' : subStatus === 'trial' ? `Trial (${daysLeft} dias)` : 'Expirado'],
              ['Plan', subStatus === 'active' ? 'Premium 9,99/mes' : 'Trial Gratuito'],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Referral Section */}
          <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 16, padding: 20, border: '1px solid rgba(59,130,246,0.15)', marginBottom: 16 }}>
            <h3 style={{ color: '#3b82f6', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              <i className="fa-solid fa-gift" style={{ marginRight: 8 }}></i>Invita a un amigo
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>Comparte tu codigo y ambos recibis +3 dias de trial gratis</p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span data-testid="referral-code" style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>{user?.referral_code || '---'}</span>
              <button onClick={() => { navigator.clipboard?.writeText(user?.referral_code || ''); }} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#3b82f6', fontSize: 12, cursor: 'pointer' }}>Copiar</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input data-testid="referral-input" placeholder="Codigo de amigo" value={referralCode} onChange={e => setReferralCode(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none' }} />
              <button data-testid="referral-apply" onClick={applyReferral} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
            </div>
            {referralMsg && <p style={{ color: '#10b981', fontSize: 12, marginTop: 8 }}>{referralMsg}</p>}
          </div>

          {subStatus !== 'active' && (
            <button data-testid="upgrade-btn" onClick={startSubscription}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
              Actualizar a Premium — 9,99/mes
            </button>
          )}

          <button data-testid="logout-profile-btn" onClick={logout}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Cerrar Sesion
          </button>
        </div>
      )}

      {/* ===== BOTTOM NAV ===== */}
      <nav data-testid="client-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100 }}>
        {[
          { id: 'home', icon: 'fa-house', label: 'Inicio' },
          { id: 'cameras', icon: 'fa-video', label: 'Camaras' },
          { id: 'events', icon: 'fa-clock-rotate-left', label: 'Eventos' },
          { id: 'profile', icon: 'fa-user', label: 'Perfil' },
        ].map(t => (
          <button key={t.id} data-testid={`nav-${t.id}`} onClick={() => setActiveTab(t.id)}
            style={{ background: 'none', border: 'none', color: activeTab === t.id ? '#3b82f6' : 'rgba(255,255,255,0.35)', cursor: 'pointer', textAlign: 'center', padding: '4px 12px' }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 20, display: 'block', marginBottom: 4 }}></i>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
