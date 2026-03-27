import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const CHECKLIST_ITEMS = [
  { key: 'verificar_direccion', label: 'Verificar direccion del cliente' },
  { key: 'contacto_cliente', label: 'Contactar con cliente para confirmar' },
  { key: 'material_cargado', label: 'Material cargado en vehiculo' },
  { key: 'panel_instalado', label: 'Panel de control instalado' },
  { key: 'sensores_puertas', label: 'Sensores de puertas/ventanas' },
  { key: 'detectores_movimiento', label: 'Detectores de movimiento' },
  { key: 'camaras_montadas', label: 'Camaras montadas y enfocadas' },
  { key: 'sirena_exterior', label: 'Sirena exterior colocada' },
  { key: 'teclado_rfid', label: 'Teclado RFID configurado' },
  { key: 'test_zonas', label: 'Test de todas las zonas' },
  { key: 'test_comunicacion', label: 'Test comunicacion con CRA' },
  { key: 'formacion_cliente', label: 'Formacion al cliente completada' },
  { key: 'firma_conformidad', label: 'Firma de conformidad obtenida' },
  { key: 'fotos_instalacion', label: 'Fotos de instalacion subidas' },
];

export default function AppInstaladores() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('mp_inst_token') || '');
  const [user, setUser] = useState(null);
  const [agenda, setAgenda] = useState(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [checklist, setChecklist] = useState({});

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (token) {
      const stored = JSON.parse(localStorage.getItem('mp_inst_user') || '{}');
      if (stored.email) { setUser(stored); setScreen('app'); fetchAgenda(); }
    }
  }, []);

  const fetchAgenda = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/gestion/instalador/mi-agenda`, { headers: headers() });
      if (res.ok) { const d = await res.json(); setAgenda(d); }
    } catch (e) { console.error(e); }
  }, [token, headers]);

  const fetchChecklist = async (instalacionId) => {
    try {
      const res = await fetch(`${API}/api/gestion/instalaciones/${instalacionId}/checklist`, { headers: headers() });
      if (res.ok) { const d = await res.json(); setChecklist(d.items || {}); }
    } catch (e) { console.error(e); }
  };

  const saveChecklist = async (instalacionId, items) => {
    try {
      await fetch(`${API}/api/gestion/instalaciones/${instalacionId}/checklist`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ items }),
      });
    } catch (e) { console.error(e); }
  };

  const toggleCheck = (key) => {
    if (!selectedJob) return;
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    saveChecklist(selectedJob.instalacion_id, updated);
  };

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
      if (d.user?.rol !== 'instalador' && d.user?.rol !== 'admin') throw new Error('Acceso solo para instaladores');
      localStorage.setItem('mp_inst_token', d.token);
      localStorage.setItem('mp_inst_user', JSON.stringify(d.user));
      setToken(d.token); setUser(d.user); setScreen('app');
      setTimeout(fetchAgenda, 300);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('mp_inst_token'); localStorage.removeItem('mp_inst_user');
    setToken(''); setUser(null); setAgenda(null); setScreen('login');
  };

  const startJob = async (inst) => {
    try {
      // Update estado to en_progreso
      await fetch(`${API}/api/gestion/instalaciones/${inst.instalacion_id}/estado`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ estado: 'en_progreso' }),
      });
      fetchAgenda();
    } catch (e) { console.error(e); }
  };

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div data-testid="instalador-login" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #162040 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <i className="fa-solid fa-wrench" style={{ color: '#fff' }}></i>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>ManoProtect Instaladores</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Gestion de Instalaciones</p>
          </div>
          <form onSubmit={login}>
            <input data-testid="inst-email" type="email" placeholder="Email corporativo" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            <input data-testid="inst-password" type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }} />
            {error && <p data-testid="inst-login-error" style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button data-testid="inst-login-btn" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Conectando...' : 'Acceder'}
            </button>
          </form>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 20 }}>Demo: instalador@manoprotectt.com / Instalador2025!</p>
        </div>
      </div>
    );
  }

  const jobs = agenda?.instalaciones || [];
  const equipo = agenda?.equipo;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div data-testid="instalador-app" style={{ minHeight: '100vh', background: '#0a1628', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* JOB DETAIL VIEW */}
      {selectedJob && (
        <div data-testid="job-detail" style={{ padding: '20px 16px' }}>
          <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i> Volver a Agenda
          </button>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{selectedJob.cliente_nombre}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 4px' }}><i className="fa-solid fa-location-dot" style={{ marginRight: 6 }}></i>{selectedJob.direccion}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 4px' }}><i className="fa-solid fa-phone" style={{ marginRight: 6 }}></i>{selectedJob.cliente_telefono}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 8px' }}><i className="fa-solid fa-calendar" style={{ marginRight: 6 }}></i>{selectedJob.fecha_programada}</p>
            <span style={{ background: selectedJob.estado === 'completado' ? '#10b98122' : selectedJob.estado === 'en_progreso' ? '#3b82f622' : '#f59e0b22', color: selectedJob.estado === 'completado' ? '#10b981' : selectedJob.estado === 'en_progreso' ? '#3b82f6' : '#f59e0b', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{selectedJob.estado}</span>
          </div>

          {/* Checklist */}
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Checklist de Instalacion ({completedCount}/{CHECKLIST_ITEMS.length})</h3>
          <div style={{ background: 'rgba(16,185,129,0.05)', borderRadius: 10, height: 6, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%`, background: '#10b981', borderRadius: 10, transition: 'width 0.3s' }}></div>
          </div>
          {CHECKLIST_ITEMS.map((item, i) => (
            <button key={item.key} data-testid={`check-${item.key}`} onClick={() => toggleCheck(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: checklist[item.key] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: 12, border: checklist[item.key] ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: 6, textAlign: 'left', boxSizing: 'border-box' }}>
              <i className={`fa-solid ${checklist[item.key] ? 'fa-circle-check' : 'fa-circle'}`} style={{ color: checklist[item.key] ? '#10b981' : 'rgba(255,255,255,0.2)', fontSize: 20 }}></i>
              <span style={{ color: checklist[item.key] ? '#10b981' : 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: checklist[item.key] ? 'line-through' : 'none' }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* AGENDA */}
      {!selectedJob && activeTab === 'agenda' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Hola</p>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.nombre || 'Instalador'}</h2>
            </div>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>

          {/* Stats row */}
          <div data-testid="inst-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Programadas', value: agenda?.total_programadas || 0, color: '#f59e0b' },
              { label: 'En curso', value: agenda?.total_en_curso || 0, color: '#3b82f6' },
              { label: 'Completadas', value: agenda?.total_completadas || 0, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: s.color, fontSize: 26, fontWeight: 800, margin: '0 0 2px' }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Team info */}
          {equipo && (
            <div data-testid="team-info" style={{ background: 'rgba(16,185,129,0.05)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <i className="fa-solid fa-people-group" style={{ color: '#10b981', fontSize: 18 }}></i>
                <span style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>{equipo.nombre}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                {equipo.miembros?.map(m => m.nombre).join(' & ')} — Zona: {equipo.zona || 'Sin asignar'}
              </p>
            </div>
          )}

          {/* Jobs list */}
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Agenda ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
              <i className="fa-solid fa-calendar-check" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
              <p>No hay instalaciones asignadas</p>
            </div>
          ) : jobs.map((j, i) => {
            const stColor = { completado: '#10b981', en_progreso: '#3b82f6', asignado: '#f59e0b', pendiente: '#64748b' }[j.estado] || '#64748b';
            return (
              <div key={i} data-testid={`job-${i}`} onClick={() => { setSelectedJob(j); fetchChecklist(j.instalacion_id); }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{j.cliente_nombre}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{j.direccion}</p>
                  </div>
                  <span style={{ background: `${stColor}22`, color: stColor, padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{j.estado}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}><i className="fa-solid fa-calendar" style={{ marginRight: 4 }}></i>{j.fecha_programada}</span>
                  {(j.estado === 'asignado' || j.estado === 'pendiente') && (
                    <button onClick={(e) => { e.stopPropagation(); startJob(j); }}
                      style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Iniciar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STOCK */}
      {!selectedJob && activeTab === 'stock' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Material en Vehiculo</h2>
          {(agenda?.vehiculo_stock || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}></i>
              <p>No hay stock asignado al vehiculo</p>
              <p style={{ fontSize: 12 }}>El admin asignara material a tu equipo</p>
            </div>
          ) : (agenda?.vehiculo_stock || []).map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#fff', fontSize: 14 }}>{s.nombre || s.producto_id}</span>
              <span style={{ color: '#10b981', fontSize: 14, fontWeight: 700 }}>{s.cantidad}u</span>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE */}
      {!selectedJob && activeTab === 'profile' && (
        <div style={{ padding: '20px 16px' }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Mi Perfil</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700 }}>
                {(user?.nombre || 'I')[0]}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{user?.nombre}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{user?.email}</p>
                <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Instalador</span>
              </div>
            </div>
            {equipo && (
              <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Equipo: </span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{equipo.nombre}</span>
              </div>
            )}
            <button onClick={logout}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>
              Cerrar Sesion
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      {!selectedJob && (
        <nav data-testid="instalador-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', zIndex: 100 }}>
          {[
            { id: 'agenda', icon: 'fa-calendar-check', label: 'Agenda' },
            { id: 'stock', icon: 'fa-boxes-stacked', label: 'Material' },
            { id: 'profile', icon: 'fa-user', label: 'Perfil' },
          ].map(t => (
            <button key={t.id} data-testid={`nav-${t.id}`} onClick={() => { setActiveTab(t.id); if (t.id === 'agenda') fetchAgenda(); }}
              style={{ background: 'none', border: 'none', color: activeTab === t.id ? '#10b981' : 'rgba(255,255,255,0.35)', cursor: 'pointer', textAlign: 'center', padding: '4px 16px' }}>
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 20, display: 'block', marginBottom: 4 }}></i>
              <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
