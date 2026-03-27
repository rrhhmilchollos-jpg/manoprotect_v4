import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const DEVICE_ICONS = {
  panel: 'fa-tablet-screen-button',
  sensor_door: 'fa-door-open',
  sensor_pir: 'fa-eye',
  smoke_detector: 'fa-cloud',
  camera: 'fa-video',
  siren: 'fa-bell',
  keypad: 'fa-keyboard',
};

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function AppCliente() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('mp_client_token') || '');
  const [user, setUser] = useState(null);
  const [installData, setInstallData] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [arming, setArming] = useState(false);
  const pollRef = useRef(null);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // Auto-login if token exists
  useEffect(() => {
    if (token) {
      fetchInstallation();
    }
  }, []);

  const fetchInstallation = useCallback(async () => {
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('mp_client_user') || '{}');
      const instId = stored.installation_id;
      if (!instId) { logout(); return; }
      setUser(stored);
      const res = await fetch(`${API}/api/client-app/installation/${instId}`, { headers: headers() });
      if (!res.ok) { logout(); return; }
      const data = await res.json();
      setInstallData(data);
      setScreen('app');
      // Fetch events
      const evRes = await fetch(`${API}/api/client-app/installation/${instId}/events`, { headers: headers() });
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(evData.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  // Poll for updates every 10s
  useEffect(() => {
    if (screen === 'app' && user?.installation_id) {
      pollRef.current = setInterval(() => {
        fetchInstallation();
      }, 10000);
      return () => clearInterval(pollRef.current);
    }
  }, [screen, user]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/client-app/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error de autenticacion');
      localStorage.setItem('mp_client_token', data.token);
      localStorage.setItem('mp_client_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      await fetchInstallationWithToken(data.token, data.user.installation_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallationWithToken = async (tk, instId) => {
    if (!instId) return;
    const res = await fetch(`${API}/api/client-app/installation/${instId}`, {
      headers: { 'Authorization': `Bearer ${tk}`, 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setInstallData(data);
      setScreen('app');
    }
  };

  const logout = () => {
    localStorage.removeItem('mp_client_token');
    localStorage.removeItem('mp_client_user');
    setToken('');
    setUser(null);
    setInstallData(null);
    setScreen('login');
    clearInterval(pollRef.current);
  };

  const armSystem = async (mode) => {
    if (!installData || arming) return;
    setArming(true);
    try {
      const res = await fetch(`${API}/api/cra/installations/${installData.id}/arm`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ mode, code: installData.access_code || '1234' }),
      });
      if (res.ok) {
        await fetchInstallation();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setArming(false);
    }
  };

  const triggerSOS = async (type = 'panic') => {
    if (!user?.installation_id) return;
    try {
      await fetch(`${API}/api/client-app/installation/${user.installation_id}/sos`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ sos_type: type }),
      });
      alert('ALERTA SOS ENVIADA A LA CRA. Mantengase seguro.');
      await fetchInstallation();
    } catch (e) {
      console.error(e);
    }
  };

  const armed = installData?.armed_status || 'disarmed';
  const isArmed = armed !== 'disarmed';

  // ==================== LOGIN ====================
  if (screen === 'login') {
    return (
      <div data-testid="client-login" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f36 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <i className="fa-solid fa-shield-halved" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>ManoProtect</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>App Cliente — Seguridad Inteligente</p>
          </div>
          <form onSubmit={login}>
            <input data-testid="client-email" type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            <input data-testid="client-password" type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }} />
            {error && <p data-testid="client-login-error" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button data-testid="client-login-btn" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Conectando...' : 'Acceder'}
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 20 }}>Demo: cliente@demo.manoprotectt.com / Cliente2025!</p>
        </div>
      </div>
    );
  }

  // ==================== APP ====================
  const devices = installData?.devices || [];
  const cameras = devices.filter(d => d.device_type === 'camera');

  return (
    <div data-testid="client-app" style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* ===== HOME ===== */}
      {activeTab === 'home' && (
        <div style={{ padding: '20px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Bienvenido</p>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.nombre || 'Cliente'}</h2>
            </div>
            <button data-testid="client-logout-btn" onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>

          {/* Security Status Card */}
          <div data-testid="security-status" style={{
            background: isArmed ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #334155, #1e293b)',
            borderRadius: 20, padding: 28, marginBottom: 20, textAlign: 'center',
            border: isArmed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: isArmed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>
              <i className={`fa-solid ${isArmed ? 'fa-lock' : 'fa-lock-open'}`} style={{ color: '#fff' }}></i>
            </div>
            <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
              {armed === 'total' ? 'ARMADO TOTAL' : armed === 'partial' ? 'ARMADO PARCIAL' : 'DESARMADO'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{installData?.address || ''}, {installData?.city || ''}</p>
          </div>

          {/* Arm/Disarm buttons */}
          <div data-testid="arm-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            <button data-testid="arm-total-btn" onClick={() => armSystem('total')} disabled={arming}
              style={{ padding: '16px 8px', borderRadius: 14, border: armed === 'total' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', background: armed === 'total' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: armed === 'total' ? '#10b981' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-shield" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>TOTAL</span>
            </button>
            <button data-testid="arm-partial-btn" onClick={() => armSystem('partial')} disabled={arming}
              style={{ padding: '16px 8px', borderRadius: 14, border: armed === 'partial' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', background: armed === 'partial' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', color: armed === 'partial' ? '#f59e0b' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-shield-halved" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>PARCIAL</span>
            </button>
            <button data-testid="disarm-btn" onClick={() => armSystem('disarmed')} disabled={arming}
              style={{ padding: '16px 8px', borderRadius: 14, border: armed === 'disarmed' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', background: armed === 'disarmed' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', color: armed === 'disarmed' ? '#3b82f6' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <i className="fa-solid fa-lock-open" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>
              <span style={{ fontSize: 11, fontWeight: 600 }}>DESARMAR</span>
            </button>
          </div>

          {/* SOS Button */}
          <button data-testid="sos-btn" onClick={() => { if (window.confirm('¿Activar ALERTA SOS? Se notificara a la CRA inmediatamente.')) triggerSOS('panic'); }}
            style={{ width: '100%', padding: '18px', borderRadius: 14, border: '2px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 18, fontWeight: 800, cursor: 'pointer', letterSpacing: 2, marginBottom: 20 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 10 }}></i> SOS EMERGENCIA
          </button>

          {/* Devices Grid */}
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Mis dispositivos ({devices.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {devices.map((d, i) => (
              <div key={i} data-testid={`device-${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <i className={`fa-solid ${DEVICE_ICONS[d.device_type] || 'fa-microchip'}`} style={{ color: d.status === 'online' ? '#10b981' : '#ef4444', fontSize: 18 }}></i>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{d.zone}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>{d.model}</p>
                {d.battery_level != null && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-battery-three-quarters" style={{ color: d.battery_level > 20 ? '#10b981' : '#ef4444', fontSize: 11 }}></i>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{d.battery_level}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CAMERAS ===== */}
      {activeTab === 'cameras' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Camaras</h2>
          {cameras.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
              <i className="fa-solid fa-video-slash" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
              <p>No hay camaras configuradas</p>
            </div>
          ) : cameras.map((c, i) => (
            <div key={i} data-testid={`camera-${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, overflow: 'hidden', marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ height: 180, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <i className="fa-solid fa-video" style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)', display: 'block', marginBottom: 8 }}></i>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Stream RTSP pendiente</span>
                </div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{c.zone}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{c.model}</p>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'online' ? '#10b981' : '#ef4444' }}></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== EVENTS ===== */}
      {activeTab === 'events' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Historial de Eventos</h2>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
              <p>Sin eventos recientes</p>
            </div>
          ) : events.map((ev, i) => (
            <div key={i} data-testid={`event-${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, borderLeft: `3px solid ${SEVERITY_COLORS[ev.severity] || '#64748b'}`, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: SEVERITY_COLORS[ev.severity] || '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{ev.event_type?.replace('_', ' ')}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{new Date(ev.created_at).toLocaleString('es-ES')}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{ev.description}</p>
              {ev.zone && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '4px 0 0' }}>Zona: {ev.zone}</p>}
            </div>
          ))}
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
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{user?.nombre}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            {[
              ['Telefono', user?.telefono || '-'],
              ['Instalacion', installData?.id || '-'],
              ['Plan', installData?.plan_type || '-'],
              ['Direccion', `${installData?.address || ''}, ${installData?.city || ''}`],
              ['Dispositivos', `${devices.length} activos`],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
          {/* Emergency contacts */}
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Contactos de Emergencia</h3>
          {(installData?.emergency_contacts || []).map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0 }}>{c.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{c.relation}</p>
              </div>
              <a href={`tel:${c.phone}`} style={{ color: '#3b82f6', fontSize: 13 }}>{c.phone}</a>
            </div>
          ))}
          <button data-testid="logout-profile-btn" onClick={logout}
            style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
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
