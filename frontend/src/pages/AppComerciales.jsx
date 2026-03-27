import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Users, Package, FileText, LogOut, ChevronRight, Phone, Mail, MapPin, Star, TrendingUp, Clock, Check, Plus, Search, DollarSign, Eye, ShoppingCart } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const CATALOG = [
  { id: 'kit-basico', name: 'Kit Basico Hogar', price: 299.99, monthly: 29.99, desc: 'Panel + 2 sensores puerta + 1 PIR + sirena + mando', img: '/images/optimized/sentinel-s.webp', popular: false },
  { id: 'kit-plus', name: 'Kit Plus Hogar', price: 499.99, monthly: 39.99, desc: 'Panel + 4 sensores puerta + 2 PIR + sirena + 2 mandos + camara interior', img: '/images/optimized/sentinel-j.webp', popular: true },
  { id: 'kit-premium', name: 'Kit Premium Hogar', price: 799.99, monthly: 49.99, desc: 'Panel + 6 sensores + 3 PIR + sirena + teclado + 2 camaras + detector humo', img: '/images/optimized/sentinel-x.webp', popular: false },
  { id: 'kit-negocio', name: 'Kit Negocio', price: 999.99, monthly: 59.99, desc: 'Panel + 8 sensores + 4 PIR + 2 sirenas + teclado + 3 camaras 4K', img: '/images/optimized/sentinel-x.webp', popular: false },
  { id: 'cam-ext', name: 'Camara Exterior 4K', price: 149.99, monthly: 0, desc: 'Vision nocturna, IP67, deteccion IA', img: '/images/optimized/sentinel-x.webp', popular: false },
  { id: 'cam-int', name: 'Camara Interior HD', price: 89.99, monthly: 0, desc: 'Audio bidireccional, seguimiento automatico', img: '/images/optimized/sentinel-j.webp', popular: false },
  { id: 'sentinel-s', name: 'Sentinel S', price: 149.99, monthly: 0, desc: 'Reloj SOS con GPS, pulsera panico, localizacion', img: '/images/optimized/sentinel-s.webp', popular: true },
  { id: 'sentinel-lock', name: 'Sentinel Lock Pro', price: 299.99, monthly: 0, desc: 'Cerradura inteligente con huella, codigo, tarjeta NFC', img: '/images/optimized/sentinel-x.webp', popular: false },
];

export default function AppComerciales() {
  const [token, setToken] = useState(localStorage.getItem('comercial_token'));
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState({ nombre: '', telefono: '', email: '', direccion: '', notas: '' });

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const r = await fetch(`${API}/api/gestion/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const d = await r.json();
      if (r.ok && d.token) {
        localStorage.setItem('comercial_token', d.token);
        setToken(d.token);
        setUser(d.user);
      } else {
        setLoginError(d.detail || 'Credenciales incorrectas');
      }
    } catch { setLoginError('Error de conexion'); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('comercial_token'); setToken(null); setUser(null); };

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API}/api/gestion/pedidos`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setLeads(Array.isArray(d) ? d : d.pedidos || []); }
    } catch {}
  }, [token]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const addLead = async () => {
    if (!newLead.nombre || !newLead.telefono) return;
    setLeads(p => [{ ...newLead, id: Date.now(), estado: 'nuevo', fecha: new Date().toLocaleDateString('es-ES'), comercial: user?.nombre }, ...p]);
    setNewLead({ nombre: '', telefono: '', email: '', direccion: '', notas: '' });
    setShowNewLead(false);
  };

  const stats = { total: leads.length || 12, cerrados: 3, pendientes: 7, conversion: 25 };

  if (!token) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <Helmet><title>ManoProtect Comerciales</title></Helmet>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-black text-white">ManoProtect</h1>
          <p className="text-blue-300 text-sm">App Comerciales</p>
        </div>
        <form onSubmit={login} className="bg-blue-900/50 border border-blue-800 rounded-2xl p-6 space-y-4" data-testid="comercial-login-form">
          <input type="email" placeholder="Email comercial" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} className="w-full bg-blue-900 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400" required data-testid="comercial-email" />
          <input type="password" placeholder="Contrasena" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} className="w-full bg-blue-900 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400" required data-testid="comercial-password" />
          {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" data-testid="comercial-login-btn">{loading ? 'Accediendo...' : 'Acceder'}</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-950 text-white pb-20">
      <Helmet><title>ManoProtect - Comerciales</title></Helmet>
      <header className="bg-blue-900 border-b border-blue-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" /><span className="font-bold text-sm">Comerciales</span></div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-300">{user?.nombre || user?.email}</span>
          <button onClick={logout} className="text-blue-500 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {tab === 'dashboard' && (
          <div className="space-y-4" data-testid="comercial-dashboard">
            <h2 className="font-bold text-lg">Mi rendimiento</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Leads totales', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
                { label: 'Cerrados', value: stats.cerrados, icon: <Check className="w-5 h-5" />, color: 'text-emerald-400' },
                { label: 'Pendientes', value: stats.pendientes, icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
                { label: 'Conversion', value: `${stats.conversion}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
              ].map((s, i) => (
                <div key={i} className="bg-blue-900/50 border border-blue-800 rounded-xl p-4 text-center">
                  <div className={`${s.color} mx-auto mb-2 flex justify-center`}>{s.icon}</div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-blue-300">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-900/50 border border-blue-800 rounded-xl p-4">
              <h3 className="font-bold text-sm mb-2">Comisiones este mes</h3>
              <p className="text-3xl font-black text-emerald-400">750,00 EUR</p>
              <p className="text-xs text-blue-300 mt-1">3 ventas cerradas x 250 EUR/venta</p>
            </div>
          </div>
        )}

        {tab === 'catalogo' && (
          <div className="space-y-4" data-testid="comercial-catalogo">
            <h2 className="font-bold text-lg">Catalogo de productos</h2>
            {selectedProduct ? (
              <div className="bg-blue-900/50 border border-blue-800 rounded-2xl p-4">
                <button onClick={() => setSelectedProduct(null)} className="text-blue-400 text-sm mb-3 flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" /> Volver</button>
                <div className="text-center mb-4">
                  <img src={selectedProduct.img} alt={selectedProduct.name} className="w-24 h-24 object-contain mx-auto mb-3" />
                  <h3 className="text-xl font-black">{selectedProduct.name}</h3>
                  <p className="text-blue-300 text-sm mt-1">{selectedProduct.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-300">Precio equipo</p>
                    <p className="text-xl font-black">{selectedProduct.price} EUR</p>
                  </div>
                  {selectedProduct.monthly > 0 && <div className="bg-blue-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-300">Cuota mensual</p>
                    <p className="text-xl font-black">{selectedProduct.monthly} EUR/mes</p>
                  </div>}
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Crear presupuesto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {CATALOG.map(p => (
                  <button key={p.id} onClick={() => setSelectedProduct(p)} className="w-full bg-blue-900/50 border border-blue-800 hover:border-blue-600 rounded-xl p-3 flex items-center gap-3 text-left transition-colors" data-testid={`product-${p.id}`}>
                    <img src={p.img} alt={p.name} className="w-14 h-14 object-contain rounded-lg bg-blue-800/50 p-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{p.name}</p>
                        {p.popular && <span className="bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">TOP</span>}
                      </div>
                      <p className="text-xs text-blue-300 line-clamp-1">{p.desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 font-bold text-sm">{p.price} EUR</span>
                        {p.monthly > 0 && <span className="text-blue-400 text-xs">+ {p.monthly} EUR/mes</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'leads' && (
          <div className="space-y-4" data-testid="comercial-leads">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Mis leads</h2>
              <button onClick={() => setShowNewLead(true)} className="bg-blue-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4" /> Nuevo</button>
            </div>
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-blue-400" /><input type="text" placeholder="Buscar lead..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full bg-blue-900 border border-blue-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-blue-500 focus:outline-none focus:border-blue-500" /></div>
            {showNewLead && (
              <div className="bg-blue-900/80 border border-blue-700 rounded-xl p-4 space-y-3">
                <input placeholder="Nombre *" value={newLead.nombre} onChange={e => setNewLead(p => ({...p, nombre: e.target.value}))} className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-500" />
                <input placeholder="Telefono *" value={newLead.telefono} onChange={e => setNewLead(p => ({...p, telefono: e.target.value}))} className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-500" />
                <input placeholder="Email" value={newLead.email} onChange={e => setNewLead(p => ({...p, email: e.target.value}))} className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-500" />
                <input placeholder="Direccion" value={newLead.direccion} onChange={e => setNewLead(p => ({...p, direccion: e.target.value}))} className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-500" />
                <div className="flex gap-2">
                  <button onClick={addLead} className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm">Guardar</button>
                  <button onClick={() => setShowNewLead(false)} className="flex-1 bg-blue-800 text-white py-2 rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}
            {[
              { nombre: 'Garcia Martinez, Juan', tel: '612 345 678', estado: 'visita_programada', fecha: '28/03/2026', kit: 'Kit Plus Hogar' },
              { nombre: 'Lopez Fernandez, Maria', tel: '634 567 890', estado: 'presupuesto_enviado', fecha: '27/03/2026', kit: 'Kit Premium Hogar' },
              { nombre: 'Rodriguez Perez, Carlos', tel: '656 789 012', estado: 'nuevo', fecha: '27/03/2026', kit: '-' },
              { nombre: 'Sanchez Gil, Ana', tel: '678 901 234', estado: 'cerrado', fecha: '25/03/2026', kit: 'Kit Basico Hogar' },
              { nombre: 'Moreno Ruiz, Pablo', tel: '690 123 456', estado: 'seguimiento', fecha: '24/03/2026', kit: 'Kit Negocio' },
            ].filter(l => !searchQ || l.nombre.toLowerCase().includes(searchQ.toLowerCase())).map((l, i) => (
              <div key={i} className="bg-blue-900/50 border border-blue-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm">{l.nombre}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${l.estado === 'cerrado' ? 'bg-emerald-500/20 text-emerald-400' : l.estado === 'nuevo' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{l.estado.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-blue-300 flex items-center gap-1"><Phone className="w-3 h-3" /> {l.tel}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-blue-500">{l.kit}</span>
                  <span className="text-xs text-blue-500">{l.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="space-y-4" data-testid="comercial-perfil">
            <h2 className="font-bold text-lg">Mi perfil</h2>
            <div className="bg-blue-900/50 border border-blue-800 rounded-xl p-4 text-center">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">👤</div>
              <p className="font-bold">{user?.nombre || 'Comercial'}</p>
              <p className="text-sm text-blue-300">{user?.email}</p>
              <p className="text-xs text-blue-500 mt-1">Comercial ManoProtect</p>
            </div>
            <button onClick={logout} className="w-full bg-red-600/10 border border-red-600/30 text-red-400 py-3 rounded-xl font-bold">Cerrar sesion</button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-blue-900 border-t border-blue-800 flex" data-testid="comercial-nav">
        {[
          { id: 'dashboard', icon: <TrendingUp className="w-5 h-5" />, label: 'Dashboard' },
          { id: 'catalogo', icon: <Package className="w-5 h-5" />, label: 'Catalogo' },
          { id: 'leads', icon: <Users className="w-5 h-5" />, label: 'Leads' },
          { id: 'perfil', icon: <Star className="w-5 h-5" />, label: 'Perfil' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-blue-400' : 'text-blue-700'}`}>
            {t.icon}<span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
