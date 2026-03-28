import React, { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../lib/firebase';

const API = process.env.REACT_APP_BACKEND_URL;

function getFingerprint() {
  const d = [navigator.userAgent, navigator.language, `${screen.width}x${screen.height}`, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|');
  let h = 0; for (let i = 0; i < d.length; i++) { h = ((h << 5) - h) + d.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

const ZONE_ICONS = { sensor_door: 'fa-door-open', sensor_pir: 'fa-satellite-dish', smoke_detector: 'fa-smog', camera: 'fa-video', siren: 'fa-bell', keypad: 'fa-keyboard', panel: 'fa-tablet-screen-button', sensor_window: 'fa-window-maximize', motion: 'fa-walking' };
const EVENT_ICONS = { arm: 'fa-shield-halved', disarm: 'fa-lock-open', sos: 'fa-triangle-exclamation', intrusion: 'fa-person-running', fire: 'fa-fire', tamper: 'fa-screwdriver-wrench', low_battery: 'fa-battery-quarter', panic: 'fa-triangle-exclamation', camera_motion: 'fa-video', door_open: 'fa-door-open', system: 'fa-gear' };
const EVENT_COLORS = { arm: '#00C853', disarm: '#42A5F5', sos: '#FF1744', intrusion: '#FF1744', fire: '#FF6D00', tamper: '#FFD600', low_battery: '#FF9100', panic: '#FF1744', camera_motion: '#42A5F5', door_open: '#FFD600', system: '#78909C' };

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
  const [notification, setNotification] = useState(null);

  // Security state
  const [alarmStatus, setAlarmStatus] = useState(null);
  const [zones, setZones] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState(null);

  // Modals
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
  const [referralCode, setReferralCode] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getHeaders = () => {
    const t = localStorage.getItem('mp_trial_token') || token;
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` };
  };

  // Firebase notifications
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      setNotification({ title: payload.notification?.title, body: payload.notification?.body, critical: payload.data?.critical === 'true' });
      setTimeout(() => setNotification(null), 8000);
      if (token) fetchEvents();
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [token]);

  // Session check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && token) { pollPaymentStatus(sessionId); window.history.replaceState({}, '', window.location.pathname); return; }
    if (token) checkTrialStatus();
    else setScreen('auth');
  }, []);

  // Auto-refresh every 15s when on app
  useEffect(() => {
    if (screen !== 'app') return;
    const interval = setInterval(() => {
      fetchAlarmStatus(); fetchEvents();
    }, 15000);
    return () => clearInterval(interval);
  }, [screen]);

  // API helper
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
      setUser(JSON.parse(localStorage.getItem('mp_trial_user') || '{}'));
      if (data.subscription_status === 'expired') setScreen('paywall');
      else { setScreen('app'); loadAllData(); }
    } catch { logout(); }
  };

  const loadAllData = async () => {
    await Promise.allSettled([fetchAlarmStatus(), fetchZones(), fetchCameras(), fetchEvents(), fetchContacts(), fetchSettings()]);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const fetchAlarmStatus = async () => { try { const d = await apiFetch('/alarm-status'); if (d) setAlarmStatus(d); } catch {} };
  const fetchZones = async () => { try { const d = await apiFetch('/zones'); if (d) setZones(d); } catch {} };
  const fetchCameras = async () => { try { const d = await apiFetch('/cameras'); if (d) setCameras(d); } catch {} };
  const fetchEvents = async () => { try { const d = await apiFetch('/events'); if (d) setEvents(d); } catch {} };
  const fetchContacts = async () => { try { const d = await apiFetch('/emergency-contacts'); if (d) setContacts(d); } catch {} };
  const fetchSettings = async () => { try { const d = await apiFetch('/settings'); if (d) setSettings(d); } catch {} };

  // Auth
  const register = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/client-trial/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password, nombre: form.nombre }) });
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
      const res = await fetch(`${API}/api/client-trial/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password, fingerprint: getFingerprint() }) });
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

  // Stripe
  const startSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/client-trial/checkout`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ origin_url: window.location.origin }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      window.location.href = data.url;
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const pollPaymentStatus = async (sid, attempt = 0) => {
    if (attempt >= 5) return;
    try {
      const res = await fetch(`${API}/api/client-trial/checkout/status/${sid}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_status === 'paid') {
          const stored = JSON.parse(localStorage.getItem('mp_trial_user') || '{}');
          stored.subscription_status = 'active';
          localStorage.setItem('mp_trial_user', JSON.stringify(stored));
          setUser(stored); setTrialStatus(prev => ({ ...prev, subscription_status: 'active' }));
          setScreen('app'); loadAllData(); return;
        }
      }
      setTimeout(() => pollPaymentStatus(sid, attempt + 1), 2000);
    } catch {}
  };

  // Alarm
  const requestArm = (mode) => { setPendingMode(mode); setPinInput(''); setPinError(''); setShowPinModal(true); };
  const confirmArm = async () => {
    if (pinInput.length < 4) { setPinError('PIN de 4 digitos requerido'); return; }
    setLoading(true); setPinError('');
    try {
      const data = await apiFetch('/alarm-status', { method: 'POST', body: JSON.stringify({ mode: pendingMode, pin: pinInput }) });
      if (data) { setAlarmStatus(data); setShowPinModal(false); fetchEvents(); }
    } catch (err) { setPinError(err.message || 'PIN incorrecto'); } finally { setLoading(false); }
  };

  // SOS
  const activateSOS = async () => {
    setSosActive(true); setShowSosConfirm(false);
    try {
      let lat = null, lng = null;
      if (navigator.geolocation) {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        lat = pos.coords.latitude; lng = pos.coords.longitude;
      }
      await apiFetch('/sos', { method: 'POST', body: JSON.stringify({ lat, lng }) });
      fetchEvents();
    } catch {} finally { setTimeout(() => setSosActive(false), 5000); }
  };

  // Contacts
  const addContact = async () => {
    if (!contactForm.name || !contactForm.phone) return;
    try {
      await apiFetch('/emergency-contacts', { method: 'POST', body: JSON.stringify(contactForm) });
      setContactForm({ name: '', phone: '', relation: '' }); setShowAddContact(false); fetchContacts();
    } catch {}
  };
  const deleteContact = async (id) => {
    try { await fetch(`${API}/api/client-trial/emergency-contacts/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchContacts(); } catch {}
  };

  // Settings
  const changePin = async () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return;
    try {
      await apiFetch('/settings', { method: 'PUT', body: JSON.stringify({ pin: newPin }) });
      setSettings(prev => ({ ...prev, pin: newPin })); setShowPinChange(false); setNewPin('');
    } catch {}
  };

  const applyReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      const res = await fetch(`${API}/api/client-trial/referral/apply`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ code: referralCode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      setReferralMsg(data.message); checkTrialStatus();
    } catch (err) { setReferralMsg(err.message); }
  };

  // ========== GLOBAL STYLES ==========
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(0,200,83,0.2)} 50%{box-shadow:0 0 40px rgba(0,200,83,0.4)} }
    @keyframes pulseRed { 0%,100%{box-shadow:0 0 20px rgba(255,23,68,0.3)} 50%{box-shadow:0 0 50px rgba(255,23,68,0.6)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes shieldPulse { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
    .fade-up { animation: fadeUp 0.35s ease-out forwards; }
    .mc-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:16px; }
    .mc-card:active { background:rgba(255,255,255,0.07); }
    .mc-btn { border:none; cursor:pointer; transition:all 0.15s ease; }
    .mc-btn:active { transform:scale(0.97); }
  `;

  // ========== LOADING ==========
  if (screen === 'loading') return (
    <div style={{ minHeight:'100vh', background:'#0B1120', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, fontWeight:800, color:'#fff', letterSpacing:'-0.03em' }}>Mano<span style={{ color:'#00C853' }}>Client+</span></div>
        <div style={{ width:32, height:32, border:'3px solid rgba(0,200,83,0.2)', borderTopColor:'#00C853', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'20px auto' }}></div>
      </div>
    </div>
  );

  // ========== AUTH ==========
  if (screen === 'auth') return (
    <div data-testid="client-auth" style={{ minHeight:'100vh', background:'linear-gradient(170deg, #0B1120 0%, #0D1527 40%, #111D35 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", padding:20 }}>
      <style>{CSS}</style>
      <div style={{ width:'100%', maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg, #00C853, #00A844)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 8px 32px rgba(0,200,83,0.25)' }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize:32, color:'#fff' }}></i>
          </div>
          <h1 style={{ color:'#fff', fontSize:26, fontWeight:800, margin:'0 0 4px', letterSpacing:'-0.03em' }}>Mano<span style={{ color:'#00C853' }}>Client+</span></h1>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:0 }}>by ManoProtectt.com</p>
        </div>

        {/* Tab switch */}
        <div style={{ display:'flex', marginBottom:24, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:3 }}>
          {['login','register'].map(m => (
            <button key={m} data-testid={`auth-tab-${m}`} onClick={() => { setAuthMode(m); setError(''); }}
              className="mc-btn" style={{ flex:1, padding:11, borderRadius:10, background:authMode===m?'rgba(0,200,83,0.12)':'transparent', color:authMode===m?'#00C853':'rgba(255,255,255,0.35)', fontSize:14, fontWeight:600 }}>
              {m==='login'?'Iniciar Sesion':'Crear Cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={authMode==='login'?login:register} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {authMode==='register' && (
            <input data-testid="register-name" type="text" placeholder="Nombre completo" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}
              style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }} />
          )}
          <input data-testid="auth-email" type="email" placeholder="Email" value={form.email} required onChange={e=>setForm(p=>({...p,email:e.target.value}))}
            style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }} />
          <input data-testid="auth-password" type="password" placeholder="Contrasena" value={form.password} required onChange={e=>setForm(p=>({...p,password:e.target.value}))}
            style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:15, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }} />
          {error && <p data-testid="auth-error" style={{ color:'#FF1744', fontSize:13, margin:0, textAlign:'center' }}>{error}</p>}
          <button data-testid="auth-submit" type="submit" disabled={loading} className="mc-btn"
            style={{ padding:15, borderRadius:12, background:'linear-gradient(135deg, #00C853, #00A844)', color:'#fff', fontSize:16, fontWeight:700, opacity:loading?0.7:1, fontFamily:'inherit' }}>
            {loading?'Verificando...':authMode==='login'?'Acceder':'Activar 7 dias gratis'}
          </button>
        </form>
        {authMode==='register' && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, textAlign:'center', marginTop:16 }}>Sin compromiso. Cancela cuando quieras.</p>}
      </div>
    </div>
  );

  // ========== PAYWALL ==========
  if (screen === 'paywall') return (
    <div data-testid="paywall" style={{ minHeight:'100vh', background:'linear-gradient(170deg, #0B1120 0%, #111D35 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", padding:20 }}>
      <style>{CSS}</style>
      <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg, #FF9100, #FF6D00)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:24, fontSize:36 }}>
          <i className="fa-solid fa-lock" style={{ color:'#fff' }}></i>
        </div>
        <h2 style={{ color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 8px' }}>Tu periodo de prueba ha finalizado</h2>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:28 }}>Sigue protegiendo tu hogar con ManoClient+</p>
        <div className="mc-card" style={{ padding:28, textAlign:'left', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:16 }}>
            <span style={{ color:'#fff', fontSize:44, fontWeight:800 }}>9,99</span>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>/mes</span>
          </div>
          {['Alarma conectada 24/7','Camaras en directo','Historial de eventos','Alertas SOS inmediatas','Soporte prioritario'].map((f,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', color:'rgba(255,255,255,0.6)', fontSize:14 }}>
              <i className="fa-solid fa-check-circle" style={{ color:'#00C853', fontSize:13 }}></i>{f}
            </div>
          ))}
        </div>
        <button data-testid="subscribe-btn" onClick={startSubscription} disabled={loading} className="mc-btn"
          style={{ width:'100%', padding:16, borderRadius:12, background:'linear-gradient(135deg, #00C853, #00A844)', color:'#fff', fontSize:17, fontWeight:700, opacity:loading?0.7:1, fontFamily:'inherit' }}>
          {loading?'Redirigiendo...':'Suscribirse ahora'}
        </button>
        {error && <p style={{ color:'#FF1744', fontSize:13, marginTop:8 }}>{error}</p>}
        <button data-testid="paywall-logout" onClick={logout} className="mc-btn" style={{ background:'none', color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:16, fontFamily:'inherit' }}>Cerrar sesion</button>
      </div>
    </div>
  );

  // ========== MAIN APP ==========
  const alarmMode = alarmStatus?.mode || 'disarmed';
  const isArmed = alarmMode !== 'disarmed';
  const modeColor = alarmMode === 'total' ? '#00C853' : alarmMode === 'partial' ? '#FF9100' : '#546E7A';
  const modeLabel = alarmMode === 'total' ? 'CONECTADO' : alarmMode === 'partial' ? 'NOCHE' : 'DESCONECTADO';
  const modeDesc = alarmMode === 'total' ? 'Todas las zonas protegidas' : alarmMode === 'partial' ? 'Modo nocturno activo' : 'Sistema en espera';
  const subStatus = trialStatus?.subscription_status || 'trial';
  const daysLeft = trialStatus?.trial_days_left ?? 0;
  const showTrialWarn = subStatus === 'trial' && daysLeft <= 2;

  return (
    <div data-testid="client-app" style={{ minHeight:'100vh', background:'#0B1120', fontFamily:"'Plus Jakarta Sans',sans-serif", paddingBottom:88 }}>
      <style>{CSS}</style>

      {/* Notification toast */}
      {notification && (
        <div data-testid="push-notification" onClick={()=>setNotification(null)} style={{
          position:'fixed', top:0, left:0, right:0, zIndex:300,
          background:notification.critical?'linear-gradient(90deg,#D50000,#B71C1C)':'linear-gradient(90deg,#1B5E20,#2E7D32)',
          padding:'14px 16px', textAlign:'center', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <i className={`fa-solid ${notification.critical?'fa-triangle-exclamation':'fa-bell'}`} style={{ marginRight:8 }}></i>
          {notification.title} — {notification.body}
        </div>
      )}

      {/* Trial warning bar */}
      {showTrialWarn && (
        <div data-testid="trial-warning" style={{ background:'linear-gradient(90deg,#FF6D00,#FF9100)', padding:'10px 16px', textAlign:'center', fontSize:13, fontWeight:600, color:'#fff' }}>
          <i className="fa-solid fa-clock" style={{ marginRight:6 }}></i>
          Tu prueba termina en {daysLeft} dia{daysLeft!==1?'s':''}
          <span onClick={startSubscription} style={{ textDecoration:'underline', cursor:'pointer', marginLeft:6 }}>Suscribirse</span>
        </div>
      )}

      {/* PIN MODAL */}
      {showPinModal && (
        <div data-testid="pin-modal" style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowPinModal(false); }}>
          <div className="fade-up" style={{ width:'100%', maxWidth:340, background:'#131B2E', borderRadius:24, padding:28, border:`1px solid ${modeColor}30` }}>
            <h3 style={{ color:'#fff', fontSize:18, fontWeight:700, textAlign:'center', margin:'0 0 4px' }}>
              {pendingMode==='disarmed'?'Desconectar':pendingMode==='total'?'Conectar Total':'Conectar Noche'}
            </h3>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textAlign:'center', marginBottom:20 }}>Introduce tu codigo PIN</p>
            {/* PIN dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:20 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:pinInput.length>i?modeColor:'rgba(255,255,255,0.1)', transition:'all 0.15s', boxShadow:pinInput.length>i?`0 0 8px ${modeColor}40`:'none' }}></div>
              ))}
            </div>
            {/* Numpad */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, maxWidth:260, margin:'0 auto 16px' }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((n,i) => (
                n===''?<div key={i}></div>:
                <button key={i} data-testid={`pin-key-${n}`} className="mc-btn"
                  onClick={()=>n==='del'?setPinInput(p=>p.slice(0,-1)):pinInput.length<4?setPinInput(p=>p+n):null}
                  style={{ padding:16, borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'#fff', fontSize:22, fontWeight:600, fontFamily:'inherit' }}>
                  {n==='del'?<i className="fa-solid fa-delete-left" style={{ fontSize:16 }}></i>:n}
                </button>
              ))}
            </div>
            {pinError && <p style={{ color:'#FF1744', fontSize:13, textAlign:'center', marginBottom:8 }}>{pinError}</p>}
            <button data-testid="pin-confirm" onClick={confirmArm} disabled={loading||pinInput.length<4} className="mc-btn"
              style={{ width:'100%', padding:14, borderRadius:12, background:pendingMode==='disarmed'?'linear-gradient(135deg,#42A5F5,#1E88E5)':`linear-gradient(135deg,${modeColor},${modeColor}CC)`, color:'#fff', fontSize:15, fontWeight:700, opacity:(loading||pinInput.length<4)?0.5:1, fontFamily:'inherit' }}>
              {loading?'Verificando...':'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {/* SOS MODAL */}
      {showSosConfirm && (
        <div data-testid="sos-modal" style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowSosConfirm(false); }}>
          <div className="fade-up" style={{ width:'100%', maxWidth:340, background:'#131B2E', borderRadius:24, padding:28, border:'1px solid rgba(255,23,68,0.3)', textAlign:'center' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,23,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'pulseRed 1.5s infinite' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize:36, color:'#FF1744' }}></i>
            </div>
            <h3 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 8px' }}>Alerta de Emergencia</h3>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:24 }}>Se enviara tu ubicacion a la Central y a tus contactos de emergencia.</p>
            <button data-testid="sos-confirm" onClick={activateSOS} className="mc-btn"
              style={{ width:'100%', padding:15, borderRadius:12, background:'linear-gradient(135deg,#FF1744,#D50000)', color:'#fff', fontSize:16, fontWeight:700, marginBottom:10, fontFamily:'inherit' }}>
              Activar SOS
            </button>
            <button data-testid="sos-cancel" onClick={()=>setShowSosConfirm(false)} className="mc-btn"
              style={{ background:'none', color:'rgba(255,255,255,0.35)', fontSize:14, padding:10, width:'100%', fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContact && (
        <div data-testid="add-contact-modal" style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowAddContact(false); }}>
          <div className="fade-up" style={{ width:'100%', maxWidth:360, background:'#131B2E', borderRadius:24, padding:28, border:'1px solid rgba(0,200,83,0.15)' }}>
            <h3 style={{ color:'#fff', fontSize:18, fontWeight:700, margin:'0 0 20px' }}>Nuevo contacto</h3>
            {[['contact-name','text','Nombre',contactForm.name,v=>setContactForm(p=>({...p,name:v}))],
              ['contact-phone','tel','Telefono',contactForm.phone,v=>setContactForm(p=>({...p,phone:v}))],
              ['contact-relation','text','Relacion (familiar, vecino...)',contactForm.relation,v=>setContactForm(p=>({...p,relation:v}))]
            ].map(([tid,type,ph,val,fn])=>(
              <input key={tid} data-testid={tid} type={type} placeholder={ph} value={val} onChange={e=>fn(e.target.value)}
                style={{ width:'100%', padding:'13px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:10, fontFamily:'inherit' }} />
            ))}
            <button data-testid="contact-save" onClick={addContact} className="mc-btn"
              style={{ width:'100%', padding:14, borderRadius:12, background:'linear-gradient(135deg,#00C853,#00A844)', color:'#fff', fontSize:15, fontWeight:700, marginTop:8, fontFamily:'inherit' }}>Guardar</button>
          </div>
        </div>
      )}

      {/* PIN CHANGE MODAL */}
      {showPinChange && (
        <div data-testid="change-pin-modal" style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowPinChange(false); }}>
          <div className="fade-up" style={{ width:'100%', maxWidth:340, background:'#131B2E', borderRadius:24, padding:28, textAlign:'center', border:'1px solid rgba(0,200,83,0.15)' }}>
            <h3 style={{ color:'#fff', fontSize:18, fontWeight:700, margin:'0 0 4px' }}>Cambiar PIN</h3>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, marginBottom:20 }}>Nuevo codigo de 4 digitos</p>
            <input data-testid="new-pin-input" type="tel" maxLength={4} value={newPin} placeholder="----"
              onChange={e=>setNewPin(e.target.value.replace(/\D/g,''))}
              style={{ width:160, padding:'14px', borderRadius:14, border:'1px solid rgba(0,200,83,0.2)', background:'rgba(0,200,83,0.06)', color:'#00C853', fontSize:32, fontWeight:800, textAlign:'center', letterSpacing:16, outline:'none', boxSizing:'border-box', fontFamily:'inherit', margin:'0 auto', display:'block' }} />
            <button data-testid="pin-change-confirm" onClick={changePin} disabled={newPin.length!==4} className="mc-btn"
              style={{ width:'100%', padding:14, borderRadius:12, background:'linear-gradient(135deg,#00C853,#00A844)', color:'#fff', fontSize:15, fontWeight:700, marginTop:20, opacity:newPin.length!==4?0.5:1, fontFamily:'inherit' }}>Guardar PIN</button>
          </div>
        </div>
      )}

      {/* ====== TAB: HOME ====== */}
      {activeTab === 'home' && (
        <div className="fade-up" style={{ padding:'0 16px 16px' }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 12px' }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, fontWeight:500, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:0.5 }}>Mi hogar</p>
              <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:0 }}>{user?.nombre || 'Mi Casa'}</h2>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {subStatus==='trial' && !showTrialWarn && (
                <span style={{ padding:'5px 10px', borderRadius:8, background:'rgba(0,200,83,0.08)', border:'1px solid rgba(0,200,83,0.15)', color:'#00C853', fontSize:11, fontWeight:600 }}>TRIAL {daysLeft}d</span>
              )}
              <button data-testid="refresh-btn" onClick={refreshData} className="mc-btn"
                style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', fontSize:14 }}>
                <i className={`fa-solid fa-arrows-rotate${refreshing?' fa-spin':''}`}></i>
              </button>
            </div>
          </div>

          {/* ALARM STATUS - Central Shield */}
          <div data-testid="alarm-shield" style={{
            background:`radial-gradient(ellipse at center, ${modeColor}08 0%, transparent 70%)`,
            borderRadius:24, padding:'36px 24px 28px', textAlign:'center', marginBottom:16,
            border:`1px solid ${modeColor}18`,
          }}>
            <div style={{
              width:140, height:140, borderRadius:'50%', margin:'0 auto 20px',
              background:`radial-gradient(circle, ${modeColor}12 0%, ${modeColor}04 100%)`,
              border:`3px solid ${modeColor}${isArmed?'60':'25'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:isArmed?'pulseGlow 3s ease-in-out infinite, shieldPulse 4s ease-in-out infinite':'none',
              position:'relative',
            }}>
              <i className={`fa-solid ${isArmed?'fa-shield-halved':'fa-shield'}`} style={{ fontSize:52, color:modeColor, transition:'color 0.3s' }}></i>
              {isArmed && <div style={{ position:'absolute', top:8, right:8, width:16, height:16, borderRadius:'50%', background:modeColor, boxShadow:`0 0 8px ${modeColor}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="fa-solid fa-check" style={{ fontSize:8, color:'#fff' }}></i>
              </div>}
            </div>
            <h2 data-testid="alarm-mode-label" style={{ color:modeColor, fontSize:22, fontWeight:800, margin:'0 0 4px', letterSpacing:'0.08em' }}>{modeLabel}</h2>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:0 }}>{modeDesc}</p>
            {alarmStatus?.updated_at && <p style={{ color:'rgba(255,255,255,0.2)', fontSize:11, marginTop:6 }}>
              {new Date(alarmStatus.updated_at).toLocaleString('es-ES',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})}
            </p>}
          </div>

          {/* ARM CONTROLS - 3 buttons */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { mode:'total', icon:'fa-shield-halved', label:'Conectar', color:'#00C853', desc:'Total' },
              { mode:'partial', icon:'fa-moon', label:'Noche', color:'#FF9100', desc:'Parcial' },
              { mode:'disarmed', icon:'fa-lock-open', label:'Desconectar', color:'#42A5F5', desc:'' },
            ].map(b => {
              const active = alarmMode === b.mode;
              return (
                <button key={b.mode} data-testid={`arm-${b.mode}-btn`} onClick={()=>requestArm(b.mode)} className="mc-btn"
                  style={{ padding:'18px 8px 14px', borderRadius:16, background:active?`${b.color}12`:'rgba(255,255,255,0.03)', border:`1.5px solid ${active?`${b.color}40`:'rgba(255,255,255,0.06)'}`, textAlign:'center' }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${b.color}${active?'18':'08'}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>
                    <i className={`fa-solid ${b.icon}`} style={{ fontSize:18, color:b.color }}></i>
                  </div>
                  <span style={{ display:'block', color:active?b.color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600 }}>{b.label}</span>
                </button>
              );
            })}
          </div>

          {/* SOS Quick Button */}
          <button data-testid="sos-quick-btn" onClick={()=>sosActive?null:setShowSosConfirm(true)} disabled={sosActive} className="mc-btn"
            style={{ width:'100%', padding:'14px', borderRadius:14, background:sosActive?'#D50000':'rgba(255,23,68,0.06)', border:`1.5px solid ${sosActive?'#FF1744':'rgba(255,23,68,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16, animation:sosActive?'pulseRed 1s infinite':'none' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color:'#FF1744', fontSize:18 }}></i>
            <span style={{ color:sosActive?'#fff':'#FF1744', fontSize:14, fontWeight:700 }}>{sosActive?'SOS ACTIVADO — Ayuda en camino':'Alerta SOS de Emergencia'}</span>
          </button>

          {/* Quick grid: Zones + Cameras + Events counts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { icon:'fa-tower-broadcast', count:zones.length, label:'Zonas', color:'#7C4DFF', tab:'zones' },
              { icon:'fa-video', count:cameras.filter(c=>c.status==='online').length, label:'Camaras', color:'#00C853', tab:'cameras' },
              { icon:'fa-clock-rotate-left', count:events.length, label:'Eventos', color:'#42A5F5', tab:'activity' },
            ].map(s => (
              <button key={s.label} data-testid={`stat-${s.tab}`} onClick={()=>setActiveTab(s.tab)} className="mc-btn mc-card"
                style={{ padding:16, textAlign:'center' }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize:20, color:s.color, display:'block', marginBottom:8 }}></i>
                <span style={{ color:'#fff', fontSize:22, fontWeight:800, display:'block' }}>{s.count}</span>
                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:500 }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Recent events */}
          <div className="mc-card" style={{ padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h4 style={{ color:'#fff', fontSize:14, fontWeight:600, margin:0 }}>Actividad reciente</h4>
              <button data-testid="view-all-events" onClick={()=>setActiveTab('activity')} className="mc-btn" style={{ background:'none', color:'#00C853', fontSize:12, fontWeight:600 }}>Ver todo</button>
            </div>
            {events.length===0 ? <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13, textAlign:'center', padding:12 }}>Sin actividad</p>
            : events.slice(0,4).map((ev,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderTop:i?'1px solid rgba(255,255,255,0.04)':'none' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${EVENT_COLORS[ev.type]||'#546E7A'}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${EVENT_ICONS[ev.type]||'fa-circle-info'}`} style={{ color:EVENT_COLORS[ev.type]||'#546E7A', fontSize:13 }}></i>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'#fff', fontSize:13, fontWeight:500, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.detail||ev.type}</p>
                  <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, margin:0 }}>
                    {ev.timestamp?new Date(ev.timestamp).toLocaleString('es-ES',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}):''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== TAB: CAMERAS ====== */}
      {activeTab === 'cameras' && (
        <div className="fade-up" style={{ padding:'16px' }}>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 16px' }}>Camaras</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {cameras.map((c,i) => (
              <div key={i} data-testid={`camera-${c.cam_id}`} className="mc-card" style={{ overflow:'hidden' }}>
                <div style={{ width:'100%', height:100, background:`linear-gradient(135deg, #0D1527, #1A2340)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <i className="fa-solid fa-video" style={{ fontSize:28, color:c.status==='online'?'rgba(0,200,83,0.3)':'rgba(255,23,68,0.3)' }}></i>
                  {c.status==='online' && <div style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:4, background:'rgba(0,200,83,0.15)', padding:'3px 8px', borderRadius:6 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#00C853' }}></div>
                    <span style={{ color:'#00C853', fontSize:10, fontWeight:600 }}>LIVE</span>
                  </div>}
                  {c.status!=='online' && <div style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:4, background:'rgba(255,23,68,0.15)', padding:'3px 8px', borderRadius:6 }}>
                    <span style={{ color:'#FF1744', fontSize:10, fontWeight:600 }}>OFFLINE</span>
                  </div>}
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ color:'#fff', fontSize:13, fontWeight:600, margin:0 }}>{c.name}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, margin:'2px 0 0' }}>{c.location||'Interior'}</p>
                </div>
              </div>
            ))}
          </div>
          {cameras.length===0 && <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.25)' }}>
            <i className="fa-solid fa-video" style={{ fontSize:36, display:'block', marginBottom:10 }}></i>
            <p>No hay camaras configuradas</p>
          </div>}
        </div>
      )}

      {/* ====== TAB: ZONES ====== */}
      {activeTab === 'zones' && (
        <div className="fade-up" style={{ padding:'16px' }}>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 16px' }}>Zonas de seguridad</h2>
          {zones.map((z,i) => {
            const isAlert = z.status === 'alert';
            const battLow = (z.battery||100) < 30;
            return (
              <div key={i} data-testid={`zone-${z.zone_id}`} className="mc-card" style={{ display:'flex', alignItems:'center', gap:14, padding:14, marginBottom:8, borderColor:isAlert?'rgba(255,23,68,0.2)':'rgba(255,255,255,0.06)', background:isAlert?'rgba(255,23,68,0.04)':'rgba(255,255,255,0.04)' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:isAlert?'rgba(255,23,68,0.1)':'rgba(124,77,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${ZONE_ICONS[z.type]||'fa-circle'}`} style={{ color:isAlert?'#FF1744':'#7C4DFF', fontSize:18 }}></i>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#fff', fontSize:14, fontWeight:600, margin:'0 0 2px' }}>{z.name}</p>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, margin:0 }}>{z.type?.replace('_',' ')}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', marginBottom:3 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:z.status==='ok'?'#00C853':isAlert?'#FF1744':'#FF9100' }}></div>
                    <span style={{ color:z.status==='ok'?'#00C853':isAlert?'#FF1744':'#FF9100', fontSize:11, fontWeight:600 }}>{z.status==='ok'?'OK':isAlert?'ALERTA':z.status?.toUpperCase()}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
                    <i className={`fa-solid ${battLow?'fa-battery-quarter':'fa-battery-full'}`} style={{ color:battLow?'#FF9100':'rgba(255,255,255,0.2)', fontSize:11 }}></i>
                    <span style={{ color:battLow?'#FF9100':'rgba(255,255,255,0.2)', fontSize:11 }}>{z.battery||0}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====== TAB: ACTIVITY ====== */}
      {activeTab === 'activity' && (
        <div className="fade-up" style={{ padding:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:0 }}>Actividad</h2>
            <button data-testid="refresh-events" onClick={fetchEvents} className="mc-btn" style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', fontSize:14 }}>
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>
          </div>
          {events.length===0 ? (
            <div style={{ textAlign:'center', padding:48, color:'rgba(255,255,255,0.25)' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize:40, display:'block', marginBottom:12 }}></i>
              <p style={{ fontSize:14 }}>Sin eventos</p>
            </div>
          ) : events.map((ev,i) => {
            const evColor = EVENT_COLORS[ev.type]||'#546E7A';
            const critical = ['sos','intrusion','fire','panic'].includes(ev.type);
            return (
              <div key={i} data-testid={`event-${i}`} style={{ display:'flex', gap:12, marginBottom:2 }}>
                {/* Timeline line */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:28 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`${evColor}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`fa-solid ${EVENT_ICONS[ev.type]||'fa-circle-info'}`} style={{ color:evColor, fontSize:12 }}></i>
                  </div>
                  {i<events.length-1 && <div style={{ width:1, flex:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }}></div>}
                </div>
                {/* Content */}
                <div style={{ flex:1, paddingBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <p style={{ color:'#fff', fontSize:13, fontWeight:600, margin:'0 0 2px' }}>{ev.detail||ev.type}</p>
                    {critical && <span style={{ background:`${evColor}18`, color:evColor, fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, flexShrink:0 }}>CRITICO</span>}
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, margin:0 }}>
                    {ev.timestamp?new Date(ev.timestamp).toLocaleString('es-ES',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):''}
                    {ev.source?` · ${ev.source}`:''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====== TAB: MORE (Settings/Profile) ====== */}
      {activeTab === 'more' && (
        <div className="fade-up" style={{ padding:'16px' }}>
          <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 16px' }}>Ajustes</h2>

          {/* User card */}
          <div className="mc-card" style={{ padding:18, display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
            <div style={{ width:50, height:50, borderRadius:14, background:'linear-gradient(135deg,#00C853,#00A844)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {(user?.nombre||'C')[0].toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ color:'#fff', fontSize:16, fontWeight:600, margin:'0 0 2px' }}>{user?.nombre||user?.email}</p>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, margin:0 }}>{user?.email}</p>
            </div>
            <span style={{ padding:'5px 10px', borderRadius:8, background:subStatus==='active'?'rgba(0,200,83,0.1)':'rgba(255,145,0,0.1)', border:`1px solid ${subStatus==='active'?'rgba(0,200,83,0.2)':'rgba(255,145,0,0.2)'}`, color:subStatus==='active'?'#00C853':'#FF9100', fontSize:11, fontWeight:600 }}>
              {subStatus==='active'?'PREMIUM':'TRIAL'}
            </span>
          </div>

          {/* Settings links */}
          <div className="mc-card" style={{ overflow:'hidden', marginBottom:12 }}>
            {[
              { icon:'fa-key', label:'Cambiar PIN', color:'#7C4DFF', action:()=>setShowPinChange(true), tid:'change-pin-btn' },
              { icon:'fa-address-book', label:'Contactos de emergencia', color:'#42A5F5', action:()=>setShowAddContact(true), tid:'manage-contacts-btn', badge:contacts.length },
              { icon:'fa-bell', label:'Notificaciones push', color:'#00C853', action:()=>requestNotificationPermission(user?.user_id,API), tid:'enable-notif-btn' },
            ].map((item,i) => (
              <button key={i} data-testid={item.tid} onClick={item.action} className="mc-btn"
                style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'none', borderBottom:i<2?'1px solid rgba(255,255,255,0.04)':'none', color:'#fff', textAlign:'left', fontFamily:'inherit' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${item.color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`fa-solid ${item.icon}`} style={{ color:item.color, fontSize:14 }}></i>
                </div>
                <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{item.label}</span>
                {item.badge>0 && <span style={{ background:'rgba(255,255,255,0.06)', padding:'2px 8px', borderRadius:6, color:'rgba(255,255,255,0.4)', fontSize:12 }}>{item.badge}</span>}
                <i className="fa-solid fa-chevron-right" style={{ color:'rgba(255,255,255,0.15)', fontSize:12 }}></i>
              </button>
            ))}
          </div>

          {/* Emergency contacts list */}
          {contacts.length > 0 && (
            <div className="mc-card" style={{ padding:16, marginBottom:12 }}>
              <h4 style={{ color:'#fff', fontSize:14, fontWeight:600, margin:'0 0 12px' }}>Contactos de emergencia</h4>
              {contacts.map((c,i) => (
                <div key={i} data-testid={`contact-${c.contact_id}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop:i?'1px solid rgba(255,255,255,0.04)':'none' }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:'rgba(66,165,245,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className="fa-solid fa-user" style={{ color:'#42A5F5', fontSize:13 }}></i>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#fff', fontSize:13, fontWeight:500, margin:0 }}>{c.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, margin:0 }}>{c.phone}{c.relation?` · ${c.relation}`:''}</p>
                  </div>
                  <button data-testid={`delete-contact-${c.contact_id}`} onClick={()=>deleteContact(c.contact_id)} className="mc-btn"
                    style={{ background:'rgba(255,23,68,0.06)', borderRadius:6, color:'#FF1744', padding:'5px 8px', fontSize:12 }}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Referral */}
          <div className="mc-card" style={{ padding:16, marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <i className="fa-solid fa-gift" style={{ color:'#FF9100' }}></i>
              <h4 style={{ color:'#fff', fontSize:14, fontWeight:600, margin:0 }}>Invita y gana</h4>
            </div>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:10 }}>Comparte tu codigo y ambos recibis +3 dias gratis</p>
            <div style={{ display:'flex', gap:8, alignItems:'center', background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:10 }}>
              <span data-testid="referral-code" style={{ flex:1, color:'#fff', fontSize:18, fontWeight:800, letterSpacing:3 }}>{user?.referral_code||'---'}</span>
              <button data-testid="copy-referral" onClick={()=>navigator.clipboard?.writeText(user?.referral_code||'')} className="mc-btn"
                style={{ background:'rgba(0,200,83,0.12)', borderRadius:8, padding:'6px 12px', color:'#00C853', fontSize:12, fontWeight:600 }}>Copiar</button>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input data-testid="referral-input" placeholder="Codigo amigo" value={referralCode} onChange={e=>setReferralCode(e.target.value)}
                style={{ flex:1, padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.03)', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
              <button data-testid="referral-apply" onClick={applyReferral} className="mc-btn"
                style={{ padding:'10px 16px', borderRadius:10, background:'#00C853', color:'#fff', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>Canjear</button>
            </div>
            {referralMsg && <p style={{ color:'#00C853', fontSize:12, marginTop:6 }}>{referralMsg}</p>}
          </div>

          {/* Upgrade / Logout */}
          {subStatus!=='active' && (
            <button data-testid="upgrade-btn" onClick={startSubscription} className="mc-btn"
              style={{ width:'100%', padding:15, borderRadius:12, background:'linear-gradient(135deg,#FF9100,#FF6D00)', color:'#fff', fontSize:15, fontWeight:700, marginBottom:12, fontFamily:'inherit' }}>
              Suscribirse — 9,99/mes
            </button>
          )}
          <button data-testid="logout-profile-btn" onClick={logout} className="mc-btn"
            style={{ width:'100%', padding:14, borderRadius:12, background:'rgba(255,23,68,0.05)', border:'1px solid rgba(255,23,68,0.12)', color:'#FF1744', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
            Cerrar sesion
          </button>
        </div>
      )}

      {/* ====== BOTTOM NAV ====== */}
      <nav data-testid="client-nav" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:100,
        background:'rgba(11,17,32,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.05)',
        display:'flex', justifyContent:'space-around', padding:'8px 0 18px',
      }}>
        {[
          { id:'home', icon:'fa-house', label:'Inicio' },
          { id:'cameras', icon:'fa-video', label:'Camaras' },
          { id:'zones', icon:'fa-tower-broadcast', label:'Zonas' },
          { id:'activity', icon:'fa-clock-rotate-left', label:'Actividad' },
          { id:'more', icon:'fa-ellipsis', label:'Mas' },
        ].map(t => (
          <button key={t.id} data-testid={`nav-${t.id}`} onClick={()=>setActiveTab(t.id)} className="mc-btn"
            style={{ background:'none', padding:'4px 12px', textAlign:'center', color:activeTab===t.id?'#00C853':'rgba(255,255,255,0.3)' }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize:20, display:'block', marginBottom:3 }}></i>
            <span style={{ fontSize:10, fontWeight:activeTab===t.id?600:400, display:'block' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
