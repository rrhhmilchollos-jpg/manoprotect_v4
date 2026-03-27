import React, { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../lib/firebase';

const API = process.env.REACT_APP_BACKEND_URL;

const ZONE_ICONS = {
  sensor_door: 'fa-door-open', sensor_pir: 'fa-eye', smoke_detector: 'fa-cloud',
  camera: 'fa-video', siren: 'fa-bell', keypad: 'fa-keyboard', panel: 'fa-tablet-screen-button',
};
const ZONE_LABELS = {
  sensor_door: 'Sensor Puerta', sensor_pir: 'Detector Movimiento', smoke_detector: 'Detector Humo',
  camera: 'Camara', siren: 'Sirena', keypad: 'Teclado', panel: 'Panel',
};
const EVENT_ICONS = {
  arm: 'fa-shield', disarm: 'fa-lock-open', sos: 'fa-triangle-exclamation',
  intrusion: 'fa-person-running', fire: 'fa-fire', tamper: 'fa-screwdriver-wrench',
  low_battery: 'fa-battery-quarter', panic: 'fa-triangle-exclamation',
};
const EVENT_COLORS = {
  arm: '#10b981', disarm: '#3b82f6', sos: '#ef4444', intrusion: '#ef4444',
  fire: '#f97316', tamper: '#eab308', low_battery: '#f59e0b', panic: '#ef4444',
};

function getFingerprint() {
  const d = [navigator.userAgent, navigator.language, `${screen.width}x${screen.height}`, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|');
  let h = 0; for (let i = 0; i < d.length; i++) { h = ((h << 5) - h) + d.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

// ====== REUSABLE STYLES ======
const S = {
  page: { minHeight: '100vh', background: '#060a14', fontFamily: "'Inter', sans-serif", paddingBottom: 90 },
  card: { background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 16px' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 },
  input: { width: '100%', padding: '13px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4F46E5, #3730A3)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  btnDanger: { width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};

export default function AppCliente() {
  const [screen, setScreen] = useState('loading');
  const [authMode, setAuthMode] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('mp_trial_token') || '');
  const [user, setUser] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', nombre: '' });
  const [referralCode, setReferralCode] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [notification, setNotification] = useState(null);

  // Security state
  const [alarmStatus, setAlarmStatus] = useState(null);
  const [zones, setZones] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState(null);

  // UI modals
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');

  const getHeaders = () => {
    const t = localStorage.getItem('mp_trial_token') || token;
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` };
  };

  // ====== FIREBASE NOTIFICATIONS ======
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      setNotification({
        title: payload.notification?.title, body: payload.notification?.body,
        type: payload.data?.type, critical: payload.data?.critical === 'true',
      });
      setTimeout(() => setNotification(null), 8000);
      // Refresh events on notification
      if (token) fetchEvents();
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [token]);

  // ====== SESSION CHECK ======
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (token) checkTrialStatus();
    else setScreen('auth');
  }, []);

  // ====== DATA FETCHING ======
  const apiFetch = async (path, opts = {}) => {
    const res = await fetch(`${API}/api/client-trial${path}`, { headers: getHeaders(), ...opts });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Error'); }
    return res.json();
  };

  const checkTrialStatus = async () => {
    try {
      const data = await apiFetch('/status');
      if (!data) return;
      setTrialStatus(data);
      const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
      setUser(stored);
      if (data.subscription_status === 'expired') setScreen('paywall');
      else { setScreen('app'); loadAllData(); }
    } catch { logout(); }
  };

  const loadAllData = async () => {
    await Promise.allSettled([fetchAlarmStatus(), fetchZones(), fetchCameras(), fetchEvents(), fetchContacts(), fetchSettings()]);
  };

  const fetchAlarmStatus = async () => {
    try { const d = await apiFetch('/alarm-status'); if (d) setAlarmStatus(d); } catch {}
  };
  const fetchZones = async () => {
    try { const d = await apiFetch('/zones'); if (d) setZones(d); } catch {}
  };
  const fetchCameras = async () => {
    try { const d = await apiFetch('/cameras'); if (d) setCameras(d); } catch {}
  };
  const fetchEvents = async () => {
    try { const d = await apiFetch('/events'); if (d) setEvents(d); } catch {}
  };
  const fetchContacts = async () => {
    try { const d = await apiFetch('/emergency-contacts'); if (d) setContacts(d); } catch {}
  };
  const fetchSettings = async () => {
    try { const d = await apiFetch('/settings'); if (d) setSettings(d); } catch {}
  };

  // ====== AUTH ======
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
      requestNotificationPermission(data.user.user_id, API);
      setTimeout(loadAllData, 500);
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
        requestNotificationPermission(data.user.user_id, API);
        setTimeout(loadAllData, 500);
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('mp_trial_token'); localStorage.removeItem('mp_trial_user');
    setToken(''); setUser(null); setTrialStatus(null); setScreen('auth');
    setAlarmStatus(null); setZones([]); setCameras([]); setEvents([]); setContacts([]); setSettings(null);
  };

  // ====== STRIPE ======
  const startSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/client-trial/checkout`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al crear pago');
      window.location.href = data.url;
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const pollPaymentStatus = async (sessionId, attempt = 0) => {
    if (attempt >= 5) return;
    try {
      const res = await fetch(`${API}/api/client-trial/checkout/status/${sessionId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_status === 'paid') {
          const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
          stored.subscription_status = 'active';
          localStorage.setItem('mp_trial_user', JSON.stringify(stored));
          setUser(stored);
          setTrialStatus(prev => ({ ...prev, subscription_status: 'active' }));
          setScreen('app'); loadAllData();
          return;
        }
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), 2000);
    } catch {}
  };

  // ====== ALARM CONTROL ======
  const requestArm = (mode) => {
    setPendingMode(mode);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const confirmArm = async () => {
    if (pinInput.length < 4) { setPinError('PIN de 4 digitos requerido'); return; }
    setLoading(true); setPinError('');
    try {
      const data = await apiFetch('/alarm-status', {
        method: 'POST',
        body: JSON.stringify({ mode: pendingMode, pin: pinInput }),
      });
      if (data) {
        setAlarmStatus(data);
        setShowPinModal(false);
        fetchEvents();
      }
    } catch (err) {
      setPinError(err.message || 'PIN incorrecto');
    } finally { setLoading(false); }
  };

  // ====== SOS ======
  const activateSOS = async () => {
    setSosActive(true); setShowSosConfirm(false);
    try {
      let lat = null, lng = null;
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      }
      await apiFetch('/sos', { method: 'POST', body: JSON.stringify({ lat, lng }) });
      fetchEvents();
    } catch {} finally { setTimeout(() => setSosActive(false), 5000); }
  };

  // ====== CONTACTS ======
  const addContact = async () => {
    if (!contactForm.name || !contactForm.phone) return;
    try {
      await apiFetch('/emergency-contacts', { method: 'POST', body: JSON.stringify(contactForm) });
      setContactForm({ name: '', phone: '', relation: '' });
      setShowAddContact(false);
      fetchContacts();
    } catch {}
  };

  const deleteContact = async (id) => {
    try {
      await fetch(`${API}/api/client-trial/emergency-contacts/${id}`, { method: 'DELETE', headers: getHeaders() });
      fetchContacts();
    } catch {}
  };

  // ====== SETTINGS ======
  const changePin = async () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return;
    try {
      await apiFetch('/settings', { method: 'PUT', body: JSON.stringify({ pin: newPin }) });
      setSettings(prev => ({ ...prev, pin: newPin }));
      setShowPinChange(false); setNewPin('');
    } catch {}
  };

  const applyReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      const res = await fetch(`${API}/api/client-trial/referral/apply`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ code: referralCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      setReferralMsg(data.message); checkTrialStatus();
    } catch (err) { setReferralMsg(err.message); }
  };

  // ==================== LOADING ====================
  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#060a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #3730A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 2s infinite' }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: 28, color: '#fff' }}></i>
          </div>
          <p style={{ opacity: 0.5, fontSize: 14 }}>Cargando ManoProtect...</p>
        </div>
      </div>
    );
  }

  // ==================== AUTH ====================
  if (screen === 'auth') {
    return (
      <div data-testid="client-auth" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060a14 0%, #0f1629 50%, #131b33 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(79,70,229,0.15)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #3730A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30, boxShadow: '0 0 40px rgba(79,70,229,0.3)' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>ManoProtect</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>Seguridad Inteligente para tu Hogar</p>
          </div>

          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['login', 'register'].map(m => (
              <button key={m} data-testid={`auth-tab-${m}`} onClick={() => { setAuthMode(m); setError(''); }}
                style={{ flex: 1, padding: '12px', border: 'none', background: authMode === m ? 'rgba(79,70,229,0.2)' : 'transparent', color: authMode === m ? '#818CF8' : 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Iniciar Sesion' : 'Registro Gratis'}
              </button>
            ))}
          </div>

          <form onSubmit={authMode === 'login' ? login : register}>
            {authMode === 'register' && (
              <input data-testid="register-name" type="text" placeholder="Tu nombre" value={form.nombre}
                onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
                style={{ ...S.input, marginBottom: 12 }} />
            )}
            <input data-testid="auth-email" type="email" placeholder="Email" value={form.email} required
              onChange={e => setForm(p => ({...p, email: e.target.value}))}
              style={{ ...S.input, marginBottom: 12 }} />
            <input data-testid="auth-password" type="password" placeholder="Contrasena (min. 6)" value={form.password} required
              onChange={e => setForm(p => ({...p, password: e.target.value}))}
              style={{ ...S.input, marginBottom: 16 }} />
            {error && <p data-testid="auth-error" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button data-testid="auth-submit" type="submit" disabled={loading}
              style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Procesando...' : authMode === 'login' ? 'Acceder' : 'Registrarse — 7 dias gratis'}
            </button>
          </form>

          {authMode === 'register' && (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
              7 dias de prueba gratuita. Todas las funciones. Sin compromiso.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================== PAYWALL ====================
  if (screen === 'paywall') {
    return (
      <div data-testid="paywall" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060a14 0%, #0f1629 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
            <i className="fa-solid fa-lock" style={{ color: '#fff' }}></i>
          </div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Tu trial ha expirado</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>Continua protegiendo tu hogar con ManoProtect</p>

          <div style={{ ...S.card, padding: 28, textAlign: 'left' }}>
            <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Plan Mensual</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
              <span style={{ color: '#fff', fontSize: 42, fontWeight: 800 }}>9,99</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>/mes</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Control total de tu alarma', 'Camaras en tiempo real', 'Historial de eventos', 'Alertas SOS inmediatas', 'Soporte prioritario 24/7'].map((f, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-check" style={{ color: '#10b981', fontSize: 12 }}></i> {f}
                </li>
              ))}
            </ul>
          </div>

          <button data-testid="subscribe-btn" onClick={startSubscription} disabled={loading}
            style={{ ...S.btnPrimary, fontSize: 17, fontWeight: 700, padding: '16px', marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Redirigiendo a pago...' : 'Suscribirse ahora'}
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
  const alarmMode = alarmStatus?.mode || 'disarmed';
  const alarmColors = { total: '#10b981', partial: '#f59e0b', disarmed: '#64748b' };
  const alarmLabels = { total: 'ARMADO TOTAL', partial: 'ARMADO PARCIAL', disarmed: 'DESARMADO' };

  return (
    <div data-testid="client-app" style={S.page}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes sosPulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 70% { box-shadow: 0 0 0 20px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>

      {/* Trial Warning */}
      {showWarning && (
        <div data-testid="trial-warning" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#000' }}>
          <i className="fa-solid fa-clock" style={{ marginRight: 6 }}></i>
          Tu trial termina en {daysLeft} dia{daysLeft !== 1 ? 's' : ''}.{' '}
          <span onClick={startSubscription} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Suscribete</span>
        </div>
      )}

      {/* Push Notification Toast */}
      {notification && (
        <div data-testid="push-notification" onClick={() => setNotification(null)} style={{
          background: notification.critical ? 'linear-gradient(90deg, #dc2626, #991b1b)' : 'linear-gradient(90deg, #4F46E5, #3730A3)',
          padding: '14px 16px', textAlign: 'center', fontSize: 14, color: '#fff', cursor: 'pointer',
          animation: notification.critical ? 'pulse 0.5s infinite' : 'none',
        }}>
          <i className={`fa-solid ${notification.critical ? 'fa-triangle-exclamation' : 'fa-bell'}`} style={{ marginRight: 8 }}></i>
          <strong>{notification.title}</strong> — {notification.body}
        </div>
      )}

      {/* Trial Badge */}
      {subStatus === 'trial' && !showWarning && (
        <div style={{ background: 'rgba(79,70,229,0.1)', padding: '8px 16px', textAlign: 'center', fontSize: 12, color: '#818CF8', borderBottom: '1px solid rgba(79,70,229,0.1)' }}>
          <i className="fa-solid fa-gift" style={{ marginRight: 6 }}></i> Trial gratuito — {daysLeft} dias restantes
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div data-testid="pin-modal" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPinModal(false); }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: 340, background: '#0f1629', borderRadius: 20, padding: 28, border: '1px solid rgba(79,70,229,0.2)' }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', margin: '0 0 4px' }}>
              {pendingMode === 'disarmed' ? 'Desarmar Sistema' : `Armar ${pendingMode === 'total' ? 'Total' : 'Parcial'}`}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>Introduce tu PIN de seguridad</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: 48, height: 56, borderRadius: 12,
                  border: `2px solid ${pinInput.length > i ? '#4F46E5' : 'rgba(255,255,255,0.1)'}`,
                  background: pinInput.length > i ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 24, fontWeight: 700,
                }}>{pinInput[i] ? '*' : ''}</div>
              ))}
            </div>
            <input data-testid="pin-input" type="tel" maxLength={4} value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
              autoFocus
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
            {/* Numeric Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 240, margin: '0 auto 16px' }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((n, i) => (
                n === '' ? <div key={i}></div> :
                <button key={i} data-testid={`pin-key-${n}`}
                  onClick={() => n === 'del' ? setPinInput(p => p.slice(0,-1)) : pinInput.length < 4 ? setPinInput(p => p + n) : null}
                  style={{ padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 20, fontWeight: 600, cursor: 'pointer' }}>
                  {n === 'del' ? <i className="fa-solid fa-delete-left" style={{ fontSize: 16 }}></i> : n}
                </button>
              ))}
            </div>
            {pinError && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{pinError}</p>}
            <button data-testid="pin-confirm" onClick={confirmArm} disabled={loading || pinInput.length < 4}
              style={{ ...S.btnPrimary, opacity: (loading || pinInput.length < 4) ? 0.5 : 1, background: pendingMode === 'disarmed' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {/* SOS Confirmation Modal */}
      {showSosConfirm && (
        <div data-testid="sos-modal" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSosConfirm(false); }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: 340, background: '#0f1629', borderRadius: 20, padding: 28, border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'sosPulse 1.5s infinite' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 32, color: '#ef4444' }}></i>
            </div>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Alerta SOS</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
              Se notificara a la CRA y a tus contactos de emergencia con tu ubicacion.
            </p>
            <button data-testid="sos-confirm" onClick={activateSOS}
              style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #ef4444, #b91c1c)', marginBottom: 10 }}>
              Activar SOS ahora
            </button>
            <button data-testid="sos-cancel" onClick={() => setShowSosConfirm(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', padding: '10px', width: '100%' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div data-testid="add-contact-modal" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddContact(false); }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: 360, background: '#0f1629', borderRadius: 20, padding: 28, border: '1px solid rgba(79,70,229,0.2)' }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Nuevo contacto de emergencia</h3>
            <input data-testid="contact-name" type="text" placeholder="Nombre" value={contactForm.name}
              onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
              style={{ ...S.input, marginBottom: 12 }} />
            <input data-testid="contact-phone" type="tel" placeholder="Telefono" value={contactForm.phone}
              onChange={e => setContactForm(p => ({...p, phone: e.target.value}))}
              style={{ ...S.input, marginBottom: 12 }} />
            <input data-testid="contact-relation" type="text" placeholder="Relacion (familiar, vecino...)" value={contactForm.relation}
              onChange={e => setContactForm(p => ({...p, relation: e.target.value}))}
              style={{ ...S.input, marginBottom: 20 }} />
            <button data-testid="contact-save" onClick={addContact}
              style={{ ...S.btnPrimary, marginBottom: 10 }}>
              Guardar contacto
            </button>
            <button onClick={() => setShowAddContact(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', padding: '10px', width: '100%' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showPinChange && (
        <div data-testid="change-pin-modal" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPinChange(false); }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: 340, background: '#0f1629', borderRadius: 20, padding: 28, border: '1px solid rgba(79,70,229,0.2)', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Cambiar PIN</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>Introduce un nuevo PIN de 4 digitos</p>
            <input data-testid="new-pin-input" type="tel" maxLength={4} value={newPin} placeholder="0000"
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              style={{ ...S.input, textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 12, marginBottom: 20 }} />
            <button data-testid="pin-change-confirm" onClick={changePin} disabled={newPin.length !== 4}
              style={{ ...S.btnPrimary, opacity: newPin.length !== 4 ? 0.5 : 1, marginBottom: 10 }}>
              Guardar nuevo PIN
            </button>
            <button onClick={() => { setShowPinChange(false); setNewPin(''); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', padding: '10px', width: '100%' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ===== TAB: HOME ===== */}
      {activeTab === 'home' && (
        <div className="fade-in" style={{ padding: '20px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 2px' }}>Bienvenido</p>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.nombre || 'Cliente'}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '8px 12px', borderRadius: 10, background: subStatus === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(79,70,229,0.1)', border: `1px solid ${subStatus === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(79,70,229,0.2)'}`, fontSize: 11, fontWeight: 600, color: subStatus === 'active' ? '#10b981' : '#818CF8' }}>
                {subStatus === 'active' ? 'PREMIUM' : `TRIAL ${daysLeft}d`}
              </div>
            </div>
          </div>

          {/* Alarm Shield */}
          <div data-testid="alarm-shield" style={{
            background: `linear-gradient(160deg, ${alarmColors[alarmMode]}15, ${alarmColors[alarmMode]}08)`,
            borderRadius: 24, padding: '32px 24px', marginBottom: 16, textAlign: 'center',
            border: `1px solid ${alarmColors[alarmMode]}30`,
            boxShadow: `0 0 60px ${alarmColors[alarmMode]}10`,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${alarmColors[alarmMode]}25, ${alarmColors[alarmMode]}10)`,
              border: `2px solid ${alarmColors[alarmMode]}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 42,
              animation: alarmMode !== 'disarmed' ? 'pulse 3s infinite' : 'none',
            }}>
              <i className={`fa-solid ${alarmMode === 'disarmed' ? 'fa-shield' : 'fa-shield-halved'}`} style={{ color: alarmColors[alarmMode] }}></i>
            </div>
            <h3 data-testid="alarm-mode-label" style={{ color: alarmColors[alarmMode], fontSize: 18, fontWeight: 800, margin: '0 0 4px', letterSpacing: '0.05em' }}>
              {alarmLabels[alarmMode] || 'DESARMADO'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
              {alarmStatus?.updated_at ? `Actualizado: ${new Date(alarmStatus.updated_at).toLocaleTimeString('es-ES')}` : 'Sistema operativo'}
            </p>
          </div>

          {/* Arm/Disarm Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <button data-testid="arm-total-btn" onClick={() => requestArm('total')}
              style={{ padding: '16px 8px', borderRadius: 14, border: `1px solid ${alarmMode === 'total' ? '#10b981' : 'rgba(16,185,129,0.2)'}`, background: alarmMode === 'total' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.04)', color: '#10b981', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-shield" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Armar Total</span>
            </button>
            <button data-testid="arm-partial-btn" onClick={() => requestArm('partial')}
              style={{ padding: '16px 8px', borderRadius: 14, border: `1px solid ${alarmMode === 'partial' ? '#f59e0b' : 'rgba(245,158,11,0.2)'}`, background: alarmMode === 'partial' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.04)', color: '#f59e0b', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-shield-halved" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Parcial</span>
            </button>
            <button data-testid="disarm-btn" onClick={() => requestArm('disarmed')}
              style={{ padding: '16px 8px', borderRadius: 14, border: `1px solid ${alarmMode === 'disarmed' ? '#3b82f6' : 'rgba(59,130,246,0.2)'}`, background: alarmMode === 'disarmed' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.04)', color: '#3b82f6', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-lock-open" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Desarmar</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-tower-broadcast" style={{ color: '#818CF8', fontSize: 16 }}></i>
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>{zones.length}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Zonas</p>
                </div>
              </div>
            </div>
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-video" style={{ color: '#10b981', fontSize: 16 }}></i>
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>{cameras.filter(c => c.status === 'online').length}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Camaras</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>Eventos recientes</h4>
              <button data-testid="view-all-events" onClick={() => setActiveTab('events')} style={{ background: 'none', border: 'none', color: '#818CF8', fontSize: 12, cursor: 'pointer' }}>Ver todos</button>
            </div>
            {events.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Sin eventos recientes</p>
            ) : events.slice(0, 3).map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${EVENT_COLORS[ev.type] || '#64748b'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fa-solid ${EVENT_ICONS[ev.type] || 'fa-circle-info'}`} style={{ color: EVENT_COLORS[ev.type] || '#64748b', fontSize: 13 }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 13, margin: 0, fontWeight: 500 }}>{ev.detail || ev.type}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>
                    {ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: ZONES ===== */}
      {activeTab === 'zones' && (
        <div className="fade-in" style={{ padding: '20px 16px' }}>
          <h2 style={S.title}><i className="fa-solid fa-tower-broadcast" style={{ marginRight: 10, color: '#818CF8' }}></i>Zonas de Seguridad</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {zones.map((z, i) => {
              const battLow = (z.battery || 100) < 30;
              return (
                <div key={i} data-testid={`zone-${z.zone_id}`} style={{
                  ...S.card, display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                  borderColor: z.status === 'alert' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)',
                  background: z.status === 'alert' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: z.status === 'alert' ? 'rgba(239,68,68,0.15)' : 'rgba(79,70,229,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className={`fa-solid ${ZONE_ICONS[z.type] || 'fa-circle'}`}
                      style={{ color: z.status === 'alert' ? '#ef4444' : '#818CF8', fontSize: 18 }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{z.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{ZONE_LABELS[z.type] || z.type}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginBottom: 2 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.status === 'ok' ? '#10b981' : z.status === 'alert' ? '#ef4444' : '#f59e0b' }}></div>
                      <span style={{ color: z.status === 'ok' ? '#10b981' : z.status === 'alert' ? '#ef4444' : '#f59e0b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                        {z.status === 'ok' ? 'OK' : z.status === 'alert' ? 'Alerta' : z.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <i className={`fa-solid ${battLow ? 'fa-battery-quarter' : 'fa-battery-full'}`} style={{ color: battLow ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: 11 }}></i>
                      <span style={{ color: battLow ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontSize: 11 }}>{z.battery || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {zones.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
              <i className="fa-solid fa-tower-broadcast" style={{ fontSize: 36, marginBottom: 12, display: 'block' }}></i>
              <p>Cargando zonas...</p>
            </div>
          )}
          {/* Cameras quick view */}
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '24px 0 12px' }}>
            <i className="fa-solid fa-video" style={{ marginRight: 8, color: '#10b981' }}></i>Camaras
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {cameras.map((c, i) => (
              <div key={i} data-testid={`camera-${c.cam_id}`} style={{
                ...S.card, padding: 16, textAlign: 'center',
              }}>
                <div style={{ width: '100%', height: 80, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <i className="fa-solid fa-video" style={{ fontSize: 24, color: c.status === 'online' ? '#10b981' : '#ef4444' }}></i>
                </div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{c.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.status === 'online' ? '#10b981' : '#ef4444' }}></div>
                  <span style={{ color: c.status === 'online' ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: 500 }}>
                    {c.status === 'online' ? 'En linea' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: SOS ===== */}
      {activeTab === 'sos' && (
        <div className="fade-in" style={{ padding: '20px 16px' }}>
          <h2 style={S.title}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 10, color: '#ef4444' }}></i>Emergencia SOS</h2>

          {/* SOS Button */}
          <div style={{ textAlign: 'center', padding: '40px 0 30px' }}>
            <button data-testid="sos-button"
              onClick={() => sosActive ? null : setShowSosConfirm(true)}
              disabled={sosActive}
              style={{
                width: 160, height: 160, borderRadius: '50%',
                border: sosActive ? '4px solid #ef4444' : '4px solid rgba(239,68,68,0.4)',
                background: sosActive ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                color: sosActive ? '#fff' : '#ef4444',
                fontSize: 48, cursor: sosActive ? 'default' : 'pointer',
                animation: sosActive ? 'sosPulse 1s infinite' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                boxShadow: sosActive ? '0 0 60px rgba(239,68,68,0.4)' : 'none',
              }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </button>
            <p style={{ color: sosActive ? '#ef4444' : 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 600, marginTop: 20 }}>
              {sosActive ? 'SOS ACTIVADO — Ayuda en camino' : 'Pulsa para activar SOS'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
              Se enviara tu ubicacion a la CRA y contactos de emergencia
            </p>
          </div>

          {/* Emergency Contacts */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>
                <i className="fa-solid fa-address-book" style={{ marginRight: 8, color: '#818CF8' }}></i>Contactos de emergencia
              </h3>
              <button data-testid="add-contact-btn" onClick={() => setShowAddContact(true)}
                style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 8, color: '#818CF8', padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 4 }}></i> Anadir
              </button>
            </div>
            {contacts.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: 24 }}>
                <i className="fa-solid fa-user-plus" style={{ fontSize: 28, color: 'rgba(255,255,255,0.2)', marginBottom: 8, display: 'block' }}></i>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Anade contactos de emergencia para que sean notificados en caso de SOS</p>
              </div>
            ) : contacts.map((c, i) => (
              <div key={i} data-testid={`contact-${c.contact_id}`} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-user" style={{ color: '#818CF8', fontSize: 16 }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{c.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{c.phone} {c.relation ? `· ${c.relation}` : ''}</p>
                </div>
                <button data-testid={`delete-contact-${c.contact_id}`} onClick={() => deleteContact(c.contact_id)}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#ef4444', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB: EVENTS ===== */}
      {activeTab === 'events' && (
        <div className="fade-in" style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ ...S.title, margin: 0 }}><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 10, color: '#818CF8' }}></i>Eventos</h2>
            <button data-testid="refresh-events" onClick={fetchEvents}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
              <p style={{ fontSize: 14 }}>Sin eventos recientes</p>
              <p style={{ fontSize: 12 }}>Los eventos de tu sistema apareceran aqui</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {events.map((ev, i) => {
                const evColor = EVENT_COLORS[ev.type] || '#64748b';
                const isCritical = ev.severity === 'critical' || ['sos', 'intrusion', 'fire', 'panic'].includes(ev.type);
                return (
                  <div key={i} data-testid={`event-${i}`} style={{
                    ...S.card, display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                    borderColor: isCritical ? `${evColor}30` : 'rgba(255,255,255,0.06)',
                    background: isCritical ? `${evColor}08` : 'rgba(255,255,255,0.03)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${evColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={`fa-solid ${EVENT_ICONS[ev.type] || 'fa-circle-info'}`} style={{ color: evColor, fontSize: 14 }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>{ev.detail || ev.type}</p>
                        {isCritical && <span style={{ background: `${evColor}20`, color: evColor, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>CRITICO</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                        <span><i className="fa-regular fa-clock" style={{ marginRight: 4 }}></i>
                          {ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                        {ev.source && <span><i className="fa-solid fa-circle-dot" style={{ marginRight: 4 }}></i>{ev.source}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: PROFILE ===== */}
      {activeTab === 'profile' && (
        <div className="fade-in" style={{ padding: '20px 16px' }}>
          <h2 style={S.title}>Mi Perfil</h2>

          {/* User Card */}
          <div style={{ ...S.card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #3730A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700 }}>
                {(user?.nombre || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{user?.nombre || user?.email}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            {[
              ['Estado', subStatus === 'active' ? 'Premium Activo' : subStatus === 'trial' ? `Trial (${daysLeft} dias)` : 'Expirado', subStatus === 'active' ? '#10b981' : '#818CF8'],
              ['Plan', subStatus === 'active' ? '9,99/mes' : 'Trial Gratuito', 'rgba(255,255,255,0.6)'],
              ['PIN de seguridad', settings?.pin ? `****` : '1234', 'rgba(255,255,255,0.6)'],
            ].map(([label, val, color], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</span>
                <span style={{ color, fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div style={{ ...S.card, padding: 0 }}>
            <button data-testid="change-pin-btn" onClick={() => setShowPinChange(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <i className="fa-solid fa-key" style={{ color: '#818CF8', width: 20, textAlign: 'center' }}></i>
              <span style={{ flex: 1, fontSize: 14 }}>Cambiar PIN de seguridad</span>
              <i className="fa-solid fa-chevron-right" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}></i>
            </button>
            <button data-testid="manage-contacts-btn" onClick={() => setActiveTab('sos')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <i className="fa-solid fa-address-book" style={{ color: '#818CF8', width: 20, textAlign: 'center' }}></i>
              <span style={{ flex: 1, fontSize: 14 }}>Contactos de emergencia</span>
              <i className="fa-solid fa-chevron-right" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}></i>
            </button>
          </div>

          {/* Referral Section */}
          <div style={{ background: 'rgba(79,70,229,0.06)', borderRadius: 16, padding: 20, border: '1px solid rgba(79,70,229,0.15)', marginBottom: 12 }}>
            <h3 style={{ color: '#818CF8', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              <i className="fa-solid fa-gift" style={{ marginRight: 8 }}></i>Invita a un amigo
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>Comparte tu codigo y ambos recibis +3 dias de trial gratis</p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span data-testid="referral-code" style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>{user?.referral_code || '---'}</span>
              <button data-testid="copy-referral" onClick={() => { navigator.clipboard?.writeText(user?.referral_code || ''); }}
                style={{ background: 'rgba(79,70,229,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#818CF8', fontSize: 12, cursor: 'pointer' }}>Copiar</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input data-testid="referral-input" placeholder="Codigo de amigo" value={referralCode} onChange={e => setReferralCode(e.target.value)}
                style={{ flex: 1, ...S.input, padding: '10px 12px' }} />
              <button data-testid="referral-apply" onClick={applyReferral}
                style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Aplicar</button>
            </div>
            {referralMsg && <p style={{ color: '#10b981', fontSize: 12, marginTop: 8 }}>{referralMsg}</p>}
          </div>

          {/* Upgrade */}
          {subStatus !== 'active' && (
            <button data-testid="upgrade-btn" onClick={startSubscription}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
              Actualizar a Premium — 9,99/mes
            </button>
          )}

          <button data-testid="logout-profile-btn" onClick={logout} style={S.btnDanger}>
            Cerrar Sesion
          </button>
        </div>
      )}

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav data-testid="client-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(6,10,20,0.95)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '6px 0 16px', zIndex: 100,
      }}>
        {[
          { id: 'home', icon: 'fa-house', label: 'Inicio' },
          { id: 'zones', icon: 'fa-tower-broadcast', label: 'Zonas' },
          { id: 'sos', icon: 'fa-triangle-exclamation', label: 'SOS', isSos: true },
          { id: 'events', icon: 'fa-clock-rotate-left', label: 'Eventos' },
          { id: 'profile', icon: 'fa-user', label: 'Perfil' },
        ].map(t => (
          <button key={t.id} data-testid={`nav-${t.id}`} onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '4px 8px',
              color: t.isSos ? '#ef4444' : activeTab === t.id ? '#818CF8' : 'rgba(255,255,255,0.3)',
            }}>
            {t.isSos ? (
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: sosActive ? '#ef4444' : 'rgba(239,68,68,0.12)',
                border: '2px solid rgba(239,68,68,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 2, marginTop: -14,
                animation: sosActive ? 'sosPulse 1s infinite' : 'none',
              }}>
                <i className={`fa-solid ${t.icon}`} style={{ fontSize: 18, color: sosActive ? '#fff' : '#ef4444' }}></i>
              </div>
            ) : (
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 20, display: 'block', marginBottom: 4 }}></i>
            )}
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id || t.isSos ? 600 : 400, display: 'block' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
