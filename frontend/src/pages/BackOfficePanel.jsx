import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const STAGE_COLORS = {
  lead: '#64748b', contacto: '#8b5cf6', estudio: '#3b82f6', propuesta: '#f59e0b',
  contrato: '#f97316', instalacion: '#06b6d4', activacion: '#10b981', activo: '#22c55e', cancelado: '#ef4444',
};
const STAGE_LABELS = {
  lead: 'Lead', contacto: 'Contacto', estudio: 'Estudio', propuesta: 'Propuesta',
  contrato: 'Contrato', instalacion: 'Instalacion', activacion: 'Activacion', activo: 'Activo', cancelado: 'Cancelado',
};
const STAGES_ORDER = ['lead', 'contacto', 'estudio', 'propuesta', 'contrato', 'instalacion', 'activacion', 'activo'];

export default function BackOfficePanel() {
  const [token, setToken] = useState(localStorage.getItem('mp_bo_token') || '');
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState(token ? 'app' : 'login');
  const [activeTab, setActiveTab] = useState('pipeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Data
  const [usuarios, setUsuarios] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [pipeline, setPipeline] = useState({ leads: [], stage_counts: {} });
  const [audit, setAudit] = useState([]);

  // Modals
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ nombre: '', email: '', telefono: '', rol: 'comercial', zona: '' });
  const [newLead, setNewLead] = useState({ nombre: '', email: '', telefono: '', direccion: '', tipo_inmueble: 'piso', canal: 'web', notas: '' });
  const [tempPassword, setTempPassword] = useState('');

  // Password change
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (token) {
      const stored = JSON.parse(localStorage.getItem('mp_bo_user') || '{}');
      if (stored.email) {
        setUser(stored);
        setScreen('app');
        if (stored.password_temporal) setShowChangePassword(true);
      }
    }
  }, []);

  useEffect(() => {
    if (screen === 'app') {
      fetchUsuarios();
      fetchPipeline();
      fetchAudit();
    }
  }, [screen]);

  const fetchUsuarios = async () => {
    try {
      const r = await fetch(`${API}/api/backoffice/usuarios`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setUsuarios(d.usuarios || []); setUserStats(d.stats || {}); }
    } catch (e) { console.error(e); }
  };
  const fetchPipeline = async () => {
    try {
      const r = await fetch(`${API}/api/backoffice/pipeline`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setPipeline(d); }
    } catch (e) { console.error(e); }
  };
  const fetchAudit = async () => {
    try {
      const r = await fetch(`${API}/api/backoffice/auditoria?limit=50`, { headers: headers() });
      if (r.ok) { const d = await r.json(); setAudit(d.logs || []); }
    } catch (e) { console.error(e); }
  };

  const login = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await fetch(`${API}/api/gestion/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Error');
      if (!['admin', 'superadmin'].includes(d.user?.rol)) throw new Error('Solo administradores');
      localStorage.setItem('mp_bo_token', d.token);
      localStorage.setItem('mp_bo_user', JSON.stringify(d.user));
      setToken(d.token); setUser(d.user); setScreen('app');
      if (d.user.password_temporal) setShowChangePassword(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('mp_bo_token'); localStorage.removeItem('mp_bo_user');
    setToken(''); setUser(null); setScreen('login');
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/backoffice/usuarios`, {
        method: 'POST', headers: headers(), body: JSON.stringify(newUser),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Error');
      setTempPassword(d.password_temporal);
      setShowNewUser(false);
      setNewUser({ nombre: '', email: '', telefono: '', rol: 'comercial', zona: '' });
      fetchUsuarios(); fetchAudit();
    } catch (err) { alert(err.message); }
  };

  const crearLead = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/backoffice/pipeline`, {
        method: 'POST', headers: headers(), body: JSON.stringify(newLead),
      });
      if (r.ok) {
        setShowNewLead(false);
        setNewLead({ nombre: '', email: '', telefono: '', direccion: '', tipo_inmueble: 'piso', canal: 'web', notas: '' });
        fetchPipeline();
      }
    } catch (e) { console.error(e); }
  };

  const avanzarEtapa = async (leadId, etapa) => {
    try {
      await fetch(`${API}/api/backoffice/pipeline/${leadId}/avanzar`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ etapa }),
      });
      fetchPipeline();
      if (selectedLead?.lead_id === leadId) {
        const r = await fetch(`${API}/api/backoffice/pipeline/${leadId}`, { headers: headers() });
        if (r.ok) setSelectedLead(await r.json());
      }
    } catch (e) { console.error(e); }
  };

  const activarCliente = async (leadId) => {
    try {
      const r = await fetch(`${API}/api/backoffice/pipeline/${leadId}/activar-cliente`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({}),
      });
      const d = await r.json();
      if (r.ok) {
        alert(`Cliente activado!\nEmail: ${d.email}\nPassword temporal: ${d.password_temporal}\n\nEnvie estas credenciales al cliente.`);
        fetchPipeline();
      } else {
        alert(d.detail || 'Error al activar');
      }
    } catch (e) { console.error(e); }
  };

  const toggleActivoUsuario = async (userId, activo) => {
    try {
      if (activo) {
        await fetch(`${API}/api/backoffice/usuarios/${userId}/desactivar`, { method: 'PUT', headers: headers() });
      } else {
        await fetch(`${API}/api/backoffice/usuarios/${userId}`, {
          method: 'PUT', headers: headers(), body: JSON.stringify({ activo: true }),
        });
      }
      fetchUsuarios(); fetchAudit();
    } catch (e) { console.error(e); }
  };

  const resetPassword = async (userId) => {
    try {
      const r = await fetch(`${API}/api/backoffice/usuarios/${userId}/resetear-password`, {
        method: 'PUT', headers: headers(),
      });
      const d = await r.json();
      if (r.ok) {
        alert(`Password reseteado!\nNueva contrasena temporal: ${d.password_temporal}`);
        fetchUsuarios();
      }
    } catch (e) { console.error(e); }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/backoffice/cambiar-password`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ new_password: newPassword }),
      });
      if (r.ok) {
        setShowChangePassword(false); setNewPassword('');
        alert('Contrasena actualizada correctamente');
      }
    } catch (e) { console.error(e); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, marginBottom: 8, boxSizing: 'border-box', outline: 'none' };
  const btnPrimary = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
  const btnDanger = { ...btnPrimary, background: '#ef4444' };
  const cardStyle = { background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px', border: '1px solid rgba(255,255,255,0.06)' };

  // LOGIN
  if (screen === 'login') {
    return (
      <div data-testid="backoffice-login" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0b1e 0%, #1a1333 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 420, padding: 36, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <i className="fa-solid fa-building-shield" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Back Office</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>ManoProtect — Administracion Central</p>
          </div>
          <form onSubmit={login}>
            <input data-testid="bo-email" type="email" placeholder="Email administrador" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} style={inputStyle} />
            <input data-testid="bo-password" type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} style={inputStyle} />
            {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{error}</p>}
            <button data-testid="bo-login-btn" type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Accediendo...' : 'Acceder al Back Office'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="backoffice-app" style={{ minHeight: '100vh', background: '#0f0b1e', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      {/* Force password change modal */}
      {showChangePassword && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, maxWidth: 400, padding: 28, background: '#1a1333', border: '1px solid #6366f1' }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Cambio de contrasena obligatorio</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>Tu contrasena es temporal. Debes cambiarla antes de continuar.</p>
            <form onSubmit={cambiarPassword}>
              <input type="password" placeholder="Nueva contrasena (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
              <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Actualizar Contrasena</button>
            </form>
          </div>
        </div>
      )}

      {/* Temp password modal */}
      {tempPassword && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, maxWidth: 420, padding: 28, background: '#1a1333', border: '1px solid #10b981' }}>
            <h3 style={{ color: '#10b981', fontSize: 18, fontWeight: 700, marginBottom: 8 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 8 }}></i>Usuario creado</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>Envie estas credenciales al nuevo usuario:</p>
            <div style={{ background: '#000', borderRadius: 10, padding: 16, fontFamily: 'monospace', fontSize: 14, marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', color: '#10b981' }}>Contrasena temporal:</p>
              <p style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>{tempPassword}</p>
            </div>
            <p style={{ color: '#f59e0b', fontSize: 12, marginBottom: 16 }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }}></i> El usuario debera cambiar la contrasena en su primer login.</p>
            <button onClick={() => setTempPassword('')} style={{ ...btnPrimary, width: '100%' }}>Entendido</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: 'rgba(15,11,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-building-shield" style={{ color: '#fff', fontSize: 16 }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Back Office ManoProtect</h1>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Central de Administracion — {user?.nombre}</p>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: 4 }}></i> Salir
          </button>
        </div>
      </header>

      {/* TABS */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
          {[
            { id: 'pipeline', icon: 'fa-diagram-project', label: 'Pipeline CRM' },
            { id: 'usuarios', icon: 'fa-users-gear', label: 'Usuarios' },
            { id: 'auditoria', icon: 'fa-clipboard-list', label: 'Auditoria' },
          ].map(t => (
            <button key={t.id} data-testid={`tab-${t.id}`} onClick={() => setActiveTab(t.id)}
              style={{ padding: '10px 20px', borderRadius: 10, border: activeTab === t.id ? '1px solid #6366f1' : '1px solid transparent', background: activeTab === t.id ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeTab === t.id ? '#818cf8' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <i className={`fa-solid ${t.icon}`} style={{ marginRight: 6 }}></i>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* ===== PIPELINE CRM ===== */}
        {activeTab === 'pipeline' && (
          <div>
            {/* Pipeline funnel stats */}
            <div data-testid="pipeline-funnel" style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 8 }}>
              {STAGES_ORDER.map((s, i) => (
                <div key={s} style={{ flex: '1 0 auto', minWidth: 100, textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: `${STAGE_COLORS[s]}11`, border: `1px solid ${STAGE_COLORS[s]}33` }}>
                  <p style={{ color: STAGE_COLORS[s], fontSize: 22, fontWeight: 800, margin: 0 }}>{pipeline.stage_counts?.[s] || 0}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: 0 }}>{STAGE_LABELS[s]}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pipeline ({pipeline.total || 0} leads)</h2>
              <button data-testid="new-pipeline-lead" onClick={() => setShowNewLead(true)} style={btnPrimary}>
                <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i> Nuevo Lead
              </button>
            </div>

            {/* New Lead form */}
            {showNewLead && (
              <div data-testid="new-lead-form" style={{ ...cardStyle, marginBottom: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Captura de Lead</h3>
                <form onSubmit={crearLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Nombre completo *" value={newLead.nombre} onChange={e => setNewLead(p => ({...p, nombre: e.target.value}))} style={inputStyle} required />
                  <input placeholder="Telefono *" value={newLead.telefono} onChange={e => setNewLead(p => ({...p, telefono: e.target.value}))} style={inputStyle} required />
                  <input type="email" placeholder="Email" value={newLead.email} onChange={e => setNewLead(p => ({...p, email: e.target.value}))} style={inputStyle} />
                  <input placeholder="Direccion" value={newLead.direccion} onChange={e => setNewLead(p => ({...p, direccion: e.target.value}))} style={inputStyle} />
                  <select value={newLead.tipo_inmueble} onChange={e => setNewLead(p => ({...p, tipo_inmueble: e.target.value}))} style={inputStyle}>
                    <option value="piso">Piso</option><option value="casa">Casa</option><option value="chalet">Chalet</option><option value="negocio">Negocio</option><option value="oficina">Oficina</option>
                  </select>
                  <select value={newLead.canal} onChange={e => setNewLead(p => ({...p, canal: e.target.value}))} style={inputStyle}>
                    <option value="web">Web</option><option value="telefono">Telefono</option><option value="whatsapp">WhatsApp</option><option value="referido">Referido</option><option value="puerta_a_puerta">Puerta a puerta</option><option value="tiktok">TikTok</option>
                  </select>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input placeholder="Notas" value={newLead.notas} onChange={e => setNewLead(p => ({...p, notas: e.target.value}))} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8 }}>
                    <button type="submit" style={btnPrimary}>Crear Lead</button>
                    <button type="button" onClick={() => setShowNewLead(false)} style={{ ...btnPrimary, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* Lead detail modal */}
            {selectedLead && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedLead(null)}>
                <div style={{ ...cardStyle, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto', background: '#1a1333', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{selectedLead.nombre}</h3>
                    <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ background: `${STAGE_COLORS[selectedLead.etapa]}22`, color: STAGE_COLORS[selectedLead.etapa], padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{STAGE_LABELS[selectedLead.etapa]}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{selectedLead.lead_id}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      ['Telefono', selectedLead.telefono], ['Email', selectedLead.email],
                      ['Direccion', selectedLead.direccion], ['Tipo', selectedLead.tipo_inmueble],
                      ['Canal', selectedLead.canal], ['Comercial', selectedLead.comercial_nombre],
                    ].map(([l, v], i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{l}: </span>
                        <span style={{ color: '#fff', fontSize: 13 }}>{v || '-'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stage progression buttons */}
                  {selectedLead.etapa !== 'activo' && selectedLead.etapa !== 'cancelado' && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 8, fontWeight: 600 }}>AVANZAR ETAPA:</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STAGES_ORDER.filter(s => STAGES_ORDER.indexOf(s) > STAGES_ORDER.indexOf(selectedLead.etapa)).map(s => (
                          <button key={s} onClick={() => avanzarEtapa(selectedLead.lead_id, s)}
                            style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: `${STAGE_COLORS[s]}22`, color: STAGE_COLORS[s], fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            {STAGE_LABELS[s]}
                          </button>
                        ))}
                        <button onClick={() => avanzarEtapa(selectedLead.lead_id, 'cancelado')}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Activate client button */}
                  {['instalacion', 'activacion'].includes(selectedLead.etapa) && !selectedLead.client_user_id && (
                    <button data-testid="activate-client-btn" onClick={() => activarCliente(selectedLead.lead_id)}
                      style={{ ...btnPrimary, width: '100%', background: '#10b981', marginBottom: 16 }}>
                      <i className="fa-solid fa-user-check" style={{ marginRight: 6 }}></i> Activar Cliente (Crear cuenta App)
                    </button>
                  )}
                  {selectedLead.client_user_id && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 10, padding: 12, marginBottom: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600, margin: 0 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }}></i>Cliente activo: {selectedLead.client_user_id}</p>
                    </div>
                  )}

                  {/* History */}
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>HISTORIAL:</p>
                  {(selectedLead.historial_etapas || []).map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[h.etapa] || '#64748b', flexShrink: 0 }}></span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{STAGE_LABELS[h.etapa] || h.etapa}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{new Date(h.fecha).toLocaleString('es-ES')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads list */}
            <div style={{ display: 'grid', gap: 8 }}>
              {(pipeline.leads || []).map((l, i) => (
                <div key={i} data-testid={`pipeline-lead-${i}`} onClick={() => setSelectedLead(l)}
                  style={{ ...cardStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{l.nombre}</span>
                      <span style={{ background: `${STAGE_COLORS[l.etapa]}22`, color: STAGE_COLORS[l.etapa], padding: '2px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{STAGE_LABELS[l.etapa]}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{l.telefono} | {l.direccion || '-'} | {l.canal}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{new Date(l.fecha_creacion).toLocaleDateString('es-ES')}</span>
                </div>
              ))}
              {(pipeline.leads || []).length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No hay leads en el pipeline</p>}
            </div>
          </div>
        )}

        {/* ===== USUARIOS ===== */}
        {activeTab === 'usuarios' && (
          <div>
            {/* Stats */}
            <div data-testid="user-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total', value: userStats.total || 0, color: '#6366f1' },
                { label: 'Comerciales', value: userStats.comerciales || 0, color: '#f59e0b' },
                { label: 'Instaladores', value: userStats.instaladores || 0, color: '#10b981' },
                { label: 'Activos', value: userStats.activos || 0, color: '#22c55e' },
                { label: 'Pendientes', value: userStats.pendientes_activacion || 0, color: '#ef4444' },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
                  <p style={{ color: s.color, fontSize: 26, fontWeight: 800, margin: '0 0 2px' }}>{s.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Gestion de Usuarios</h2>
              <button data-testid="new-user-btn" onClick={() => setShowNewUser(true)} style={btnPrimary}>
                <i className="fa-solid fa-user-plus" style={{ marginRight: 6 }}></i> Alta Usuario
              </button>
            </div>

            {/* New user form */}
            {showNewUser && (
              <div data-testid="new-user-form" style={{ ...cardStyle, marginBottom: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Alta de nuevo usuario</h3>
                <form onSubmit={crearUsuario} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Nombre completo *" value={newUser.nombre} onChange={e => setNewUser(p => ({...p, nombre: e.target.value}))} style={inputStyle} required />
                  <input type="email" placeholder="Email corporativo *" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} style={inputStyle} required />
                  <input placeholder="Telefono" value={newUser.telefono} onChange={e => setNewUser(p => ({...p, telefono: e.target.value}))} style={inputStyle} />
                  <select value={newUser.rol} onChange={e => setNewUser(p => ({...p, rol: e.target.value}))} style={inputStyle}>
                    <option value="comercial">Comercial</option><option value="instalador">Instalador</option>
                  </select>
                  <input placeholder="Zona asignada" value={newUser.zona} onChange={e => setNewUser(p => ({...p, zona: e.target.value}))} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: 8 }}>
                    <button type="submit" style={btnPrimary}><i className="fa-solid fa-key" style={{ marginRight: 6 }}></i> Crear y Generar Credenciales</button>
                    <button type="button" onClick={() => setShowNewUser(false)} style={{ ...btnPrimary, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* Users list */}
            <div style={{ display: 'grid', gap: 8 }}>
              {usuarios.map((u, i) => {
                const rolColor = u.rol === 'comercial' ? '#f59e0b' : u.rol === 'instalador' ? '#10b981' : '#6366f1';
                return (
                  <div key={i} data-testid={`user-${i}`} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${rolColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rolColor, fontWeight: 700, fontSize: 16 }}>
                        {(u.nombre || '?')[0]}
                      </div>
                      <div>
                        <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{u.nombre}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                          {u.email} | <span style={{ color: rolColor, fontWeight: 600, textTransform: 'uppercase' }}>{u.rol}</span>
                          {u.zona && ` | Zona: ${u.zona}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {u.password_temporal && <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 600, background: '#f59e0b22', padding: '2px 8px', borderRadius: 6 }}>TEMP</span>}
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.activo !== false ? '#22c55e' : '#ef4444' }}></span>
                      <button onClick={() => resetPassword(u.user_id)} title="Reset password" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f59e0b', padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>
                        <i className="fa-solid fa-key"></i>
                      </button>
                      <button onClick={() => toggleActivoUsuario(u.user_id, u.activo !== false)} style={{ background: u.activo !== false ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${u.activo !== false ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: 6, color: u.activo !== false ? '#ef4444' : '#10b981', padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>
                        {u.activo !== false ? <i className="fa-solid fa-ban"></i> : <i className="fa-solid fa-check"></i>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== AUDITORIA ===== */}
        {activeTab === 'auditoria' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Registro de Auditoria</h2>
            <div style={{ display: 'grid', gap: 6 }}>
              {audit.map((a, i) => (
                <div key={i} data-testid={`audit-${i}`} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${a.accion === 'alta_usuario' ? 'fa-user-plus' : a.accion === 'login' ? 'fa-right-to-bracket' : a.accion === 'desactivar_usuario' ? 'fa-ban' : 'fa-pen'}`} style={{ color: '#818cf8', fontSize: 14 }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0 }}>{a.detalles}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>Por: {a.admin_nombre}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, whiteSpace: 'nowrap' }}>{new Date(a.fecha).toLocaleString('es-ES')}</span>
                </div>
              ))}
              {audit.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>Sin registros de auditoria</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
