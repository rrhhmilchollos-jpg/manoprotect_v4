import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AppComerciales() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('mp_com_token') || '');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ cliente_nombre: '', cliente_telefono: '', cliente_email: '', cliente_direccion: '', notas: '' });

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (token) {
      const stored = JSON.parse(localStorage.getItem('mp_com_user') || '{}');
      if (stored.email) { setUser(stored); setScreen('app'); fetchStats(); }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/gestion/comercial/mis-stats`, { headers: headers() });
      if (res.ok) { const d = await res.json(); setStats(d); }
    } catch (e) { console.error(e); }
  }, [token, headers]);

  const login = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/gestion/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || 'Error de autenticacion');
      if (d.user?.rol !== 'comercial' && d.user?.rol !== 'admin') throw new Error('Acceso solo para comerciales');
      localStorage.setItem('mp_com_token', d.token);
      localStorage.setItem('mp_com_user', JSON.stringify(d.user));
      setToken(d.token); setUser(d.user); setScreen('app');
      setTimeout(fetchStats, 300);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('mp_com_token'); localStorage.removeItem('mp_com_user');
    setToken(''); setUser(null); setStats(null); setScreen('login');
  };

  const createLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/gestion/pedidos`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ ...newLead, productos: [{ producto_id: 'kit-plus', cantidad: 1 }] }),
      });
      if (res.ok) {
        setShowNewLead(false);
        setNewLead({ cliente_nombre: '', cliente_telefono: '', cliente_email: '', cliente_direccion: '', notas: '' });
        fetchStats();
      }
    } catch (e) { console.error(e); }
  };

  const updateEstado = async (pedidoId, nuevoEstado) => {
    try {
      await fetch(`${API}/api/gestion/pedidos/${pedidoId}/estado`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      fetchStats();
    } catch (e) { console.error(e); }
  };

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div data-testid="comercial-login" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c1222 0%, #1a2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <i className="fa-solid fa-briefcase" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>ManoProtect Comercial</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>CRM de Ventas</p>
          </div>
          <form onSubmit={login}>
            <input data-testid="com-email" type="email" placeholder="Email corporativo" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            <input data-testid="com-password" type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }} />
            {error && <p data-testid="com-login-error" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button data-testid="com-login-btn" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Conectando...' : 'Acceder'}
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 20 }}>Demo: comercial@manoprotectt.com / Comercial2025!</p>
        </div>
      </div>
    );
  }

  const pedidos = stats?.recent_pedidos || [];

  return (
    <div data-testid="comercial-app" style={{ minHeight: '100vh', background: '#0c1222', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Hola</p>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.nombre || 'Comercial'}</h2>
            </div>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>

          {/* KPIs */}
          <div data-testid="kpi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total Leads', value: stats?.total || 0, color: '#3b82f6', icon: 'fa-users' },
              { label: 'Cerrados', value: stats?.cerrados || 0, color: '#10b981', icon: 'fa-check-circle' },
              { label: 'Pendientes', value: stats?.pendientes || 0, color: '#f59e0b', icon: 'fa-clock' },
              { label: 'Conversion', value: `${stats?.conversion || 0}%`, color: '#8b5cf6', icon: 'fa-chart-line' },
            ].map((k, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '18px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <i className={`fa-solid ${k.icon}`} style={{ color: k.color, fontSize: 18, marginBottom: 8, display: 'block' }}></i>
                <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 2px' }}>{k.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Commission */}
          <div data-testid="commission-card" style={{ background: 'linear-gradient(135deg, #f59e0b22, #d9770622)', borderRadius: 16, padding: 20, border: '1px solid rgba(245,158,11,0.2)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 4px' }}>Comisiones acumuladas</p>
                <p style={{ color: '#f59e0b', fontSize: 28, fontWeight: 800, margin: 0 }}>{stats?.comisiones || 0} EUR</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '0 0 4px' }}>Por venta</p>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{stats?.comision_por_venta || 250} EUR</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADS */}
      {activeTab === 'leads' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>Mis Leads ({pedidos.length})</h2>
            <button data-testid="new-lead-btn" onClick={() => setShowNewLead(true)}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i> Nuevo
            </button>
          </div>

          {/* New Lead Modal */}
          {showNewLead && (
            <div data-testid="new-lead-form" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Nuevo Lead</h3>
              <form onSubmit={createLead}>
                {[
                  { key: 'cliente_nombre', ph: 'Nombre completo', type: 'text' },
                  { key: 'cliente_telefono', ph: 'Telefono', type: 'tel' },
                  { key: 'cliente_email', ph: 'Email', type: 'email' },
                  { key: 'cliente_direccion', ph: 'Direccion', type: 'text' },
                  { key: 'notas', ph: 'Notas (opcional)', type: 'text' },
                ].map(f => (
                  <input key={f.key} data-testid={`lead-${f.key}`} type={f.type} placeholder={f.ph} value={newLead[f.key]} onChange={e => setNewLead(p => ({...p, [f.key]: e.target.value}))}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 14, marginBottom: 8, boxSizing: 'border-box', outline: 'none' }} />
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#f59e0b', color: '#000', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                  <button type="button" onClick={() => setShowNewLead(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {/* Leads List */}
          {pedidos.map((p, i) => {
            const stColor = { pendiente: '#f59e0b', confirmado: '#3b82f6', instalado: '#10b981', cancelado: '#ef4444' }[p.estado] || '#64748b';
            return (
              <div key={i} data-testid={`lead-${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{p.cliente_nombre}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{p.cliente_telefono}</p>
                  </div>
                  <span style={{ background: `${stColor}22`, color: stColor, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{p.estado}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 8px' }}>{p.cliente_direccion}</p>
                {p.estado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => updateEstado(p.pedido_id, 'confirmado')}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
                    <button onClick={() => updateEstado(p.pedido_id, 'cancelado')}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Mi Perfil</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700 }}>
                {(user?.nombre || 'C')[0]}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{user?.nombre}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user?.email}</p>
                <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Comercial</span>
              </div>
            </div>
            <button onClick={logout}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Cerrar Sesion
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav data-testid="comercial-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(12,18,34,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100 }}>
        {[
          { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
          { id: 'leads', icon: 'fa-users', label: 'Leads' },
          { id: 'profile', icon: 'fa-user', label: 'Perfil' },
        ].map(t => (
          <button key={t.id} data-testid={`nav-${t.id}`} onClick={() => { setActiveTab(t.id); if (t.id === 'dashboard' || t.id === 'leads') fetchStats(); }}
            style={{ background: 'none', border: 'none', color: activeTab === t.id ? '#f59e0b' : 'rgba(255,255,255,0.35)', cursor: 'pointer', textAlign: 'center', padding: '4px 16px' }}>
            <i className={`fa-solid ${t.icon}`} style={{ fontSize: 20, display: 'block', marginBottom: 4 }}></i>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
