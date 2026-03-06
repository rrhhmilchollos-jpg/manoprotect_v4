import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/apiBase';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wrench, ScrollText,
  Plus, LogOut, RefreshCw, Loader2, X, Pencil, Trash2, UserPlus,
  ChevronDown, BarChart3, AlertTriangle, CheckCircle2, Clock, Eye, UsersRound
} from 'lucide-react';
import NotificationBell from '@/components/gestion/NotificationBell';

const gFetch = async (path, opts = {}) => {
  const token = localStorage.getItem('gestion_token');
  const res = await fetch(`${API}/gestion${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
  if (res.status === 401) { localStorage.removeItem('gestion_token'); window.location.href = '/gestion/login'; return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error');
  return data;
};

const RolBadge = ({ rol }) => {
  const c = { admin: 'bg-indigo-500/20 text-indigo-400', comercial: 'bg-emerald-500/20 text-emerald-400', instalador: 'bg-amber-500/20 text-amber-400' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c[rol] || 'bg-slate-700 text-slate-300'}`}>{rol}</span>;
};

const StatusBadge = ({ estado }) => {
  const c = {
    pendiente: 'bg-yellow-500/20 text-yellow-400', confirmado: 'bg-blue-500/20 text-blue-400',
    enviado: 'bg-purple-500/20 text-purple-400', instalado: 'bg-emerald-500/20 text-emerald-400',
    cancelado: 'bg-red-500/20 text-red-400', asignado: 'bg-blue-500/20 text-blue-400',
    en_progreso: 'bg-purple-500/20 text-purple-400', completado: 'bg-emerald-500/20 text-emerald-400'
  };
  return <span className={`px-2 py-0.5 rounded text-xs ${c[estado] || 'bg-slate-700 text-slate-300'}`}>{estado}</span>;
};

export default function GestionAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [stock, setStock] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [logs, setLogs] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [modal, setModal] = useState(null); // { type: 'new_user' | 'new_stock' | 'edit_stock' | 'assign_installer', data: ... }

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('gestion_user') || 'null');
    if (!u || u.rol !== 'admin') { navigate('/gestion/login'); return; }
    setUser(u);
  }, [navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, us, sk, pe, ins, lo, eq] = await Promise.all([
        gFetch('/dashboard/stats'), gFetch('/usuarios'), gFetch('/stock'),
        gFetch('/pedidos'), gFetch('/instalaciones'), gFetch('/logs?limit=50'), gFetch('/equipos')
      ]);
      setStats(st); setUsuarios(us.usuarios || []); setStock(sk.stock || []);
      setPedidos(pe.pedidos || []); setInstalaciones(ins.instalaciones || []); setLogs(lo.logs || []); setEquipos(eq.equipos || []);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  // USER MANAGEMENT
  const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', rol: 'comercial' });
  const createUser = async () => {
    try {
      await gFetch('/usuarios', { method: 'POST', body: JSON.stringify(newUser) });
      toast.success('Usuario creado');
      setModal(null);
      setNewUser({ nombre: '', email: '', password: '', rol: 'comercial' });
      loadAll();
    } catch (e) { toast.error(e.message); }
  };
  const deleteUser = async (uid) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try { await gFetch(`/usuarios/${uid}`, { method: 'DELETE' }); toast.success('Usuario desactivado'); loadAll(); } catch (e) { toast.error(e.message); }
  };

  // STOCK MANAGEMENT
  const [newStock, setNewStock] = useState({ nombre: '', producto_tipo: 'sensor_pir', cantidad_disponible: 0, ubicacion: '', precio_unitario: 0, descripcion: '' });
  const createStock = async () => {
    try {
      await gFetch('/stock', { method: 'POST', body: JSON.stringify(newStock) });
      toast.success('Producto creado');
      setModal(null);
      setNewStock({ nombre: '', producto_tipo: 'sensor_pir', cantidad_disponible: 0, ubicacion: '', precio_unitario: 0, descripcion: '' });
      loadAll();
    } catch (e) { toast.error(e.message); }
  };
  const deleteStock = async (pid) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try { await gFetch(`/stock/${pid}`, { method: 'DELETE' }); toast.success('Eliminado'); loadAll(); } catch (e) { toast.error(e.message); }
  };
  const updateStockQty = async (pid, qty) => {
    try { await gFetch(`/stock/${pid}`, { method: 'PUT', body: JSON.stringify({ cantidad_disponible: qty }) }); toast.success('Stock actualizado'); loadAll(); } catch (e) { toast.error(e.message); }
  };

  // PEDIDOS
  const updatePedido = async (pid, estado) => {
    try { await gFetch(`/pedidos/${pid}`, { method: 'PUT', body: JSON.stringify({ estado }) }); toast.success('Pedido actualizado'); loadAll(); } catch (e) { toast.error(e.message); }
  };

  // INSTALACIONES
  const asignarInstalador = async (instId, instaladorId) => {
    try {
      await gFetch(`/instalaciones/${instId}/asignar`, { method: 'PUT', body: JSON.stringify({ instalador_id: instaladorId }) });
      toast.success('Instalador asignado');
      setModal(null);
      loadAll();
    } catch (e) { toast.error(e.message); }
  };
  const asignarEquipo = async (instId, equipoId) => {
    try {
      await gFetch(`/instalaciones/${instId}/asignar-equipo`, { method: 'PUT', body: JSON.stringify({ equipo_id: equipoId }) });
      toast.success('Equipo asignado a la instalación');
      setModal(null);
      loadAll();
    } catch (e) { toast.error(e.message); }
  };

  // EQUIPOS
  const [newEquipo, setNewEquipo] = useState({ nombre: '', zona: '', miembros: [] });
  const createEquipo = async () => {
    try {
      await gFetch('/equipos', { method: 'POST', body: JSON.stringify(newEquipo) });
      toast.success('Equipo creado');
      setModal(null);
      setNewEquipo({ nombre: '', zona: '', miembros: [] });
      loadAll();
    } catch (e) { toast.error(e.message); }
  };
  const deleteEquipo = async (eid) => {
    if (!window.confirm('¿Desactivar este equipo?')) return;
    try { await gFetch(`/equipos/${eid}`, { method: 'DELETE' }); toast.success('Equipo desactivado'); loadAll(); } catch (e) { toast.error(e.message); }
  };
  const updateEquipoMiembros = async (eid, miembros) => {
    try { await gFetch(`/equipos/${eid}`, { method: 'PUT', body: JSON.stringify({ miembros }) }); toast.success('Equipo actualizado'); loadAll(); } catch (e) { toast.error(e.message); }
  };

  const instaladores = usuarios.filter(u => u.rol === 'instalador' && u.activo);

  if (!user) return null;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'equipos', label: 'Equipos', icon: UsersRound },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'instalaciones', label: 'Instalaciones', icon: Wrench },
    { id: 'logs', label: 'Auditoría', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex" data-testid="gestion-admin-page">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-indigo-400" /></div>
            <div>
              <p className="text-xs font-bold text-white">Admin Panel</p>
              <p className="text-[10px] text-slate-500">ManoProtect CRA</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} data-testid={`nav-${n.id}`} onClick={() => setSection(n.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${section === n.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <n.icon className="w-4 h-4" />{n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate">{user.nombre}</p>
          <button data-testid="gestion-logout" onClick={() => { localStorage.removeItem('gestion_token'); localStorage.removeItem('gestion_user'); navigate('/gestion/login'); }}
            className="mt-2 w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-1.5">
            <LogOut className="w-3.5 h-3.5" />Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600/20 flex items-center justify-center"><LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" /></div>
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={loadAll} className="p-2 text-slate-400"><RefreshCw className="w-4 h-4" /></button>
            <NotificationBell />
            <button onClick={() => { localStorage.removeItem('gestion_token'); localStorage.removeItem('gestion_user'); navigate('/gestion/login'); }} className="p-2 text-slate-400"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="lg:hidden flex overflow-x-auto border-b border-slate-800 px-1 no-scrollbar">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-2.5 text-xs border-b-2 transition-colors ${section === n.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}>
              <n.icon className="w-3.5 h-3.5" />{n.label}
            </button>
          ))}
        </div>

        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
          ) : section === 'dashboard' ? (
            /* DASHBOARD */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Dashboard</h2>
                <button onClick={loadAll} className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><RefreshCw className="w-3 h-3" />Actualizar</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Usuarios Activos', value: stats?.total_usuarios, icon: Users, color: 'text-indigo-400 bg-indigo-600/20' },
                  { label: 'Comerciales', value: stats?.total_comerciales, icon: Users, color: 'text-emerald-400 bg-emerald-600/20' },
                  { label: 'Instaladores', value: stats?.total_instaladores, icon: Wrench, color: 'text-amber-400 bg-amber-600/20' },
                  { label: 'Productos Stock', value: stats?.total_stock, icon: Package, color: 'text-blue-400 bg-blue-600/20' },
                  { label: 'Pedidos Total', value: stats?.total_pedidos, icon: ShoppingCart, color: 'text-purple-400 bg-purple-600/20' },
                  { label: 'Pedidos Pendientes', value: stats?.pedidos_pendientes, icon: Clock, color: 'text-yellow-400 bg-yellow-600/20' },
                  { label: 'Inst. Pendientes', value: stats?.instalaciones_pendientes, icon: AlertTriangle, color: 'text-orange-400 bg-orange-600/20' },
                  { label: 'Inst. Completadas', value: stats?.instalaciones_completadas, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-600/20' },
                  { label: 'Equipos', value: stats?.total_equipos, icon: UsersRound, color: 'text-cyan-400 bg-cyan-600/20' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color.split(' ')[1]}`}><s.icon className={`w-3.5 h-3.5 ${s.color.split(' ')[0]}`} /></div>
                    </div>
                    <p className="text-xl font-bold text-white">{s.value ?? 0}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Low stock alert */}
              {stats?.stock_bajo && stats.stock_bajo.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" />Stock Bajo</h3>
                  <div className="space-y-1">
                    {stats.stock_bajo.map(s => (
                      <div key={s.producto_id} className="flex items-center justify-between text-xs">
                        <span className="text-white">{s.nombre}</span>
                        <span className="text-red-400 font-bold">{s.cantidad_disponible} uds</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : section === 'usuarios' ? (
            /* USUARIOS */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Gestión de Usuarios</h2>
                <button data-testid="new-user-btn" onClick={() => setModal({ type: 'new_user' })} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />Nuevo</button>
              </div>
              <div className="space-y-2">
                {usuarios.map(u => (
                  <div key={u.user_id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between" data-testid={`user-${u.user_id}`}>
                    <div>
                      <p className="text-sm font-medium text-white">{u.nombre} {!u.activo && <span className="text-red-400 text-xs">(inactivo)</span>}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RolBadge rol={u.rol} />
                      <button onClick={() => deleteUser(u.user_id)} className="p-1.5 text-slate-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : section === 'equipos' ? (
            /* EQUIPOS */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Equipos de Instalación</h2>
                <button data-testid="new-equipo-btn" onClick={() => setModal({ type: 'new_equipo' })} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Nuevo Equipo</button>
              </div>
              <div className="space-y-3">
                {equipos.filter(e => e.activo !== false).map(eq => (
                  <div key={eq.equipo_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4" data-testid={`equipo-${eq.equipo_id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-600/20 flex items-center justify-center"><UsersRound className="w-4 h-4 text-cyan-400" /></div>
                        <div>
                          <p className="text-sm font-bold text-white">{eq.nombre}</p>
                          <p className="text-xs text-slate-500">{eq.zona || 'Sin zona'} &middot; {eq.equipo_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'edit_equipo', data: eq })} className="p-1.5 text-slate-600 hover:text-cyan-400"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteEquipo(eq.equipo_id)} className="p-1.5 text-slate-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(eq.miembros_detalle || []).length === 0 && <p className="text-xs text-slate-600 italic">Sin miembros asignados</p>}
                      {(eq.miembros_detalle || []).map(m => (
                        <span key={m.user_id} className="inline-flex items-center gap-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full">
                          <Wrench className="w-3 h-3" />{m.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {equipos.filter(e => e.activo !== false).length === 0 && <p className="text-center text-slate-500 text-sm py-10">No hay equipos creados. Crea tu primer equipo de instalación.</p>}
              </div>
            </div>
          ) : section === 'stock' ? (
            /* STOCK */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Inventario / Stock</h2>
                <button data-testid="new-stock-btn" onClick={() => setModal({ type: 'new_stock' })} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Nuevo Producto</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 px-2">Producto</th><th className="text-left py-2 px-2">Tipo</th><th className="text-right py-2 px-2">Cantidad</th><th className="text-right py-2 px-2">Precio</th><th className="text-left py-2 px-2">Ubicación</th><th className="py-2 px-2"></th>
                  </tr></thead>
                  <tbody>
                    {stock.map(s => (
                      <tr key={s.producto_id} className="border-b border-slate-800/50 hover:bg-slate-900/50" data-testid={`stock-row-${s.producto_id}`}>
                        <td className="py-2 px-2 text-white">{s.nombre}</td>
                        <td className="py-2 px-2 text-slate-400">{s.producto_tipo}</td>
                        <td className={`py-2 px-2 text-right font-mono ${s.cantidad_disponible < 5 ? 'text-red-400' : 'text-white'}`}>{s.cantidad_disponible}</td>
                        <td className="py-2 px-2 text-right text-emerald-400">{s.precio_unitario?.toFixed(2)}€</td>
                        <td className="py-2 px-2 text-slate-500 text-xs">{s.ubicacion}</td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => { const q = prompt('Nueva cantidad:', s.cantidad_disponible); if (q !== null) updateStockQty(s.producto_id, parseInt(q)); }} className="p-1 text-slate-600 hover:text-blue-400"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => deleteStock(s.producto_id)} className="p-1 text-slate-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : section === 'pedidos' ? (
            /* PEDIDOS */
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Pedidos</h2>
              <div className="space-y-2">
                {pedidos.map(p => (
                  <div key={p.pedido_id} className="bg-slate-900 border border-slate-800 rounded-xl p-3" data-testid={`pedido-row-${p.pedido_id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-indigo-400">{p.pedido_id}</span>
                      <StatusBadge estado={p.estado} />
                    </div>
                    <p className="text-sm text-white">{p.cliente_nombre} <span className="text-slate-500">por {p.comercial_nombre}</span></p>
                    <p className="text-xs text-slate-600">{p.productos?.length || 0} productos - {new Date(p.fecha_creacion).toLocaleDateString('es-ES')}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {['pendiente', 'confirmado', 'enviado', 'instalado', 'cancelado'].filter(e => e !== p.estado).map(e => (
                        <button key={e} onClick={() => updatePedido(p.pedido_id, e)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded">{e}</button>
                      ))}
                      {p.estado === 'confirmado' && (
                        <button onClick={() => setModal({ type: 'create_inst', data: p })} className="text-[10px] bg-amber-600/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">
                          Crear Instalación
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pedidos.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No hay pedidos</p>}
              </div>
            </div>
          ) : section === 'instalaciones' ? (
            /* INSTALACIONES */
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Instalaciones</h2>
              <div className="space-y-2">
                {instalaciones.map(inst => (
                  <div key={inst.instalacion_id} className="bg-slate-900 border border-slate-800 rounded-xl p-3" data-testid={`inst-row-${inst.instalacion_id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-indigo-400">{inst.instalacion_id}</span>
                      <StatusBadge estado={inst.estado} />
                    </div>
                    <p className="text-sm text-white">{inst.cliente_nombre}</p>
                    <p className="text-xs text-slate-500">{inst.direccion}</p>
                    {inst.instalador_nombre && <p className="text-xs text-amber-400 mt-1">Instalador: {inst.instalador_nombre}</p>}
                    {inst.equipo_nombre && (
                      <div className="mt-1.5 bg-cyan-600/10 border border-cyan-500/20 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs text-cyan-400 font-medium flex items-center gap-1"><UsersRound className="w-3 h-3" />Equipo: {inst.equipo_nombre}</p>
                        {inst.equipo_miembros_nombres && inst.equipo_miembros_nombres.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{inst.equipo_miembros_nombres.join(', ')}</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {inst.estado === 'pendiente' && (
                        <>
                          <button onClick={() => setModal({ type: 'assign_team', data: inst })} className="text-xs bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 px-2.5 py-1.5 rounded-lg" data-testid={`assign-team-${inst.instalacion_id}`}>
                            Asignar Equipo
                          </button>
                          <button onClick={() => setModal({ type: 'assign_installer', data: inst })} className="text-xs bg-amber-600/20 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg">
                            Asignar Instalador
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {instalaciones.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No hay instalaciones</p>}
              </div>
            </div>
          ) : section === 'logs' ? (
            /* LOGS */
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Logs de Auditoría</h2>
              <div className="space-y-1">
                {logs.map((l, i) => (
                  <div key={l.log_id || i} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-start gap-3 text-xs">
                    <span className="text-slate-600 shrink-0">{new Date(l.timestamp).toLocaleString('es-ES')}</span>
                    <span className="text-indigo-400 shrink-0 w-20 truncate">{l.nombre_usuario}</span>
                    <span className="text-slate-400 font-mono shrink-0">{l.accion}</span>
                    <span className="text-slate-600 truncate">{l.detalle}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {modal.type === 'new_user' && 'Nuevo Usuario'}
                {modal.type === 'new_stock' && 'Nuevo Producto'}
                {modal.type === 'assign_installer' && 'Asignar Instalador'}
                {modal.type === 'create_inst' && 'Crear Instalación'}
                {modal.type === 'new_equipo' && 'Nuevo Equipo'}
                {modal.type === 'edit_equipo' && 'Editar Equipo'}
                {modal.type === 'assign_team' && 'Asignar Equipo'}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {modal.type === 'new_user' && (
                <>
                  <input data-testid="modal-user-nombre" placeholder="Nombre" value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <input data-testid="modal-user-email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <input data-testid="modal-user-password" placeholder="Contraseña" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <select data-testid="modal-user-rol" value={newUser.rol} onChange={e => setNewUser({ ...newUser, rol: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="comercial">Comercial</option>
                    <option value="instalador">Instalador</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <button data-testid="modal-create-user" onClick={createUser} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm">Crear Usuario</button>
                </>
              )}
              {modal.type === 'new_stock' && (
                <>
                  <input placeholder="Nombre del producto" value={newStock.nombre} onChange={e => setNewStock({ ...newStock, nombre: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <select value={newStock.producto_tipo} onChange={e => setNewStock({ ...newStock, producto_tipo: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    {['panel', 'sensor_pir', 'sensor_magnetico', 'camera', 'siren', 'keypad', 'sentinel_lock', 'detector_humo', 'mando', 'otro'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Cantidad" value={newStock.cantidad_disponible} onChange={e => setNewStock({ ...newStock, cantidad_disponible: parseInt(e.target.value) || 0 })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <input type="number" step="0.01" placeholder="Precio €" value={newStock.precio_unitario} onChange={e => setNewStock({ ...newStock, precio_unitario: parseFloat(e.target.value) || 0 })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  </div>
                  <input placeholder="Ubicación" value={newStock.ubicacion} onChange={e => setNewStock({ ...newStock, ubicacion: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <button onClick={createStock} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm">Crear Producto</button>
                </>
              )}
              {modal.type === 'assign_installer' && (
                <>
                  <p className="text-xs text-slate-400">Selecciona un instalador para <strong className="text-white">{modal.data.instalacion_id}</strong></p>
                  <div className="space-y-2">
                    {instaladores.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay instaladores disponibles</p>}
                    {instaladores.map(inst => (
                      <button key={inst.user_id} onClick={() => asignarInstalador(modal.data.instalacion_id, inst.user_id)}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center"><Wrench className="w-4 h-4 text-amber-400" /></div>
                        <div>
                          <p className="text-sm text-white">{inst.nombre}</p>
                          <p className="text-xs text-slate-500">{inst.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {modal.type === 'create_inst' && <CreateInstForm pedido={modal.data} onDone={() => { setModal(null); loadAll(); }} />}
              {modal.type === 'new_equipo' && (
                <>
                  <input data-testid="modal-equipo-nombre" placeholder="Nombre del equipo (ej: Equipo Madrid Norte)" value={newEquipo.nombre} onChange={e => setNewEquipo({ ...newEquipo, nombre: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <input placeholder="Zona (ej: Madrid Norte)" value={newEquipo.zona} onChange={e => setNewEquipo({ ...newEquipo, zona: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                  <p className="text-xs text-slate-400">Selecciona los instaladores del equipo:</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {instaladores.length === 0 && <p className="text-xs text-slate-600 py-2 text-center">No hay instaladores disponibles</p>}
                    {instaladores.map(inst => (
                      <label key={inst.user_id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2.5 cursor-pointer hover:border-cyan-500/50">
                        <input type="checkbox" checked={newEquipo.miembros.includes(inst.user_id)} onChange={e => {
                          setNewEquipo(prev => ({
                            ...prev,
                            miembros: e.target.checked ? [...prev.miembros, inst.user_id] : prev.miembros.filter(id => id !== inst.user_id)
                          }));
                        }} className="accent-cyan-500" />
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <p className="text-sm text-white">{inst.nombre}</p>
                          <p className="text-xs text-slate-500">{inst.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button data-testid="modal-create-equipo" onClick={createEquipo} disabled={!newEquipo.nombre} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm">Crear Equipo ({newEquipo.miembros.length} miembros)</button>
                </>
              )}
              {modal.type === 'edit_equipo' && (
                <EditEquipoForm equipo={modal.data} instaladores={instaladores} onSave={async (eid, miembros) => { await updateEquipoMiembros(eid, miembros); setModal(null); }} />
              )}
              {modal.type === 'assign_team' && (
                <>
                  <p className="text-xs text-slate-400">Selecciona un equipo para la instalación <strong className="text-white">{modal.data.instalacion_id}</strong> - {modal.data.cliente_nombre}</p>
                  <div className="space-y-2">
                    {equipos.filter(e => e.activo !== false).length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay equipos disponibles. Crea uno primero.</p>}
                    {equipos.filter(e => e.activo !== false).map(eq => (
                      <button key={eq.equipo_id} onClick={() => asignarEquipo(modal.data.instalacion_id, eq.equipo_id)}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 text-left" data-testid={`select-team-${eq.equipo_id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 flex items-center justify-center"><UsersRound className="w-4 h-4 text-cyan-400" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{eq.nombre}</p>
                            <p className="text-xs text-slate-500">{eq.zona || 'Sin zona'} &middot; {(eq.miembros_detalle || []).length} miembros</p>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {(eq.miembros_detalle || []).map(m => (
                                <span key={m.user_id} className="text-[10px] text-amber-400 bg-amber-600/10 px-1.5 py-0.5 rounded">{m.nombre}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateInstForm({ pedido, onDone }) {
  const [form, setForm] = useState({ pedido_id: pedido.pedido_id, direccion: pedido.cliente_direccion || '', cliente_nombre: pedido.cliente_nombre, cliente_telefono: pedido.cliente_telefono || '', fecha_programada: '', notas: '' });
  const submit = async () => {
    try {
      await gFetch('/instalaciones', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Instalación creada');
      onDone();
    } catch (e) { toast.error(e.message); }
  };
  return (
    <>
      <p className="text-xs text-slate-400">Crear instalación para pedido <strong className="text-white">{pedido.pedido_id}</strong></p>
      <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
      <input type="date" placeholder="Fecha programada" value={form.fecha_programada} onChange={e => setForm({ ...form, fecha_programada: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
      <input placeholder="Notas" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
      <button onClick={submit} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-lg text-sm">Crear Instalación</button>
    </>
  );
}

function EditEquipoForm({ equipo, instaladores, onSave }) {
  const [miembros, setMiembros] = useState(equipo.miembros || []);
  return (
    <>
      <p className="text-xs text-slate-400">Equipo: <strong className="text-white">{equipo.nombre}</strong> ({equipo.zona || 'Sin zona'})</p>
      <p className="text-xs text-slate-400">Selecciona los miembros:</p>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {instaladores.map(inst => (
          <label key={inst.user_id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2.5 cursor-pointer hover:border-cyan-500/50">
            <input type="checkbox" checked={miembros.includes(inst.user_id)} onChange={e => {
              setMiembros(prev => e.target.checked ? [...prev, inst.user_id] : prev.filter(id => id !== inst.user_id));
            }} className="accent-cyan-500" />
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <p className="text-sm text-white">{inst.nombre}</p>
              <p className="text-xs text-slate-500">{inst.email}</p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={() => onSave(equipo.equipo_id, miembros)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg text-sm">Guardar ({miembros.length} miembros)</button>
    </>
  );
}
