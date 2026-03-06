import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/apiBase';
import { toast } from 'sonner';
import {
  Package, Search, ShoppingCart, Plus, Clock, User, LogOut, Phone,
  Mail, MapPin, ChevronRight, AlertTriangle, FileText, Loader2, X, RefreshCw
} from 'lucide-react';
import NotificationBell from '@/components/gestion/NotificationBell';
import UpdateChecker from '@/components/gestion/UpdateChecker';

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

const StatusBadge = ({ estado }) => {
  const colors = {
    pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    enviado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    instalado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[estado] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{estado}</span>;
};

export default function GestionComerciales() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('stock');
  const [stock, setStock] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewPedido, setShowNewPedido] = useState(false);
  const [cart, setCart] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('gestion_user') || 'null');
    if (!u || u.rol !== 'comercial') { navigate('/gestion/login'); return; }
    setUser(u);
  }, [navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, st] = await Promise.all([gFetch('/stock'), gFetch('/pedidos'), gFetch('/dashboard/stats')]);
      setStock(s.stock || []);
      setPedidos(p.pedidos || []);
      setStats(st);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const addToCart = (item) => {
    const exists = cart.find(c => c.producto_id === item.producto_id);
    if (exists) {
      setCart(cart.map(c => c.producto_id === item.producto_id ? { ...c, cantidad: c.cantidad + 1 } : c));
    } else {
      setCart([...cart, { ...item, cantidad: 1 }]);
    }
    toast.success(`${item.nombre} agregado`);
  };

  const [pedidoForm, setPedidoForm] = useState({ cliente_nombre: '', cliente_telefono: '', cliente_email: '', cliente_direccion: '', notas: '' });
  const submitPedido = async () => {
    if (!pedidoForm.cliente_nombre || cart.length === 0) { toast.error('Nombre del cliente y productos son requeridos'); return; }
    try {
      const res = await gFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify({ ...pedidoForm, productos: cart.map(c => ({ producto_id: c.producto_id, nombre: c.nombre, cantidad: c.cantidad, precio: c.precio_unitario })) }),
      });
      toast.success(`Pedido ${res.pedido_id} creado`);
      setCart([]);
      setPedidoForm({ cliente_nombre: '', cliente_telefono: '', cliente_email: '', cliente_direccion: '', notas: '' });
      setShowNewPedido(false);
      loadData();
    } catch (e) { toast.error(e.message); }
  };

  const filteredStock = stock.filter(s => s.nombre.toLowerCase().includes(search.toLowerCase()));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950" data-testid="gestion-comerciales-page">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center"><Package className="w-4 h-4 text-emerald-400" /></div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Comerciales</h1>
            <p className="text-[10px] text-slate-500">{user.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
          <NotificationBell />
          <button data-testid="gestion-logout" onClick={() => { localStorage.removeItem('gestion_token'); localStorage.removeItem('gestion_user'); navigate('/gestion/login'); }} className="p-2 text-slate-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <UpdateChecker appName="comerciales" />

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            { label: 'Mis Pedidos', value: pedidos.length, color: 'text-blue-400' },
            { label: 'Pendientes', value: stats.pedidos_pendientes, color: 'text-yellow-400' },
            { label: 'Stock Items', value: stats.total_stock, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-2">
        {[{ id: 'stock', label: 'Stock', icon: Package }, { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart }, { id: 'nuevo', label: 'Nuevo Pedido', icon: Plus }].map(t => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            onClick={() => { setTab(t.id); if (t.id === 'nuevo') setShowNewPedido(true); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      <div className="p-3 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-slate-500 animate-spin" /></div>
        ) : tab === 'stock' ? (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input data-testid="stock-search" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Buscar producto..." />
            </div>
            <div className="space-y-2">
              {filteredStock.map(item => (
                <div key={item.producto_id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between" data-testid={`stock-item-${item.producto_id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.nombre}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${item.cantidad_disponible < 5 ? 'text-red-400' : 'text-slate-400'}`}>{item.cantidad_disponible} uds</span>
                      <span className="text-xs text-emerald-400">{item.precio_unitario.toFixed(2)}€</span>
                      <span className="text-xs text-slate-600">{item.ubicacion}</span>
                    </div>
                  </div>
                  <button onClick={() => addToCart(item)} className="ml-2 p-2 bg-emerald-600/20 rounded-lg hover:bg-emerald-600/40 text-emerald-400" data-testid={`add-cart-${item.producto_id}`}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {filteredStock.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No se encontraron productos</p>}
            </div>
          </>
        ) : tab === 'pedidos' ? (
          <div className="space-y-2">
            {pedidos.map(p => (
              <div key={p.pedido_id} className="bg-slate-900 border border-slate-800 rounded-xl p-3" data-testid={`pedido-${p.pedido_id}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-indigo-400">{p.pedido_id}</span>
                  <StatusBadge estado={p.estado} />
                </div>
                <p className="text-sm font-medium text-white">{p.cliente_nombre}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  {p.cliente_telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.cliente_telefono}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.fecha_creacion).toLocaleDateString('es-ES')}</span>
                </div>
                {p.productos && p.productos.length > 0 && (
                  <p className="text-xs text-slate-600 mt-1">{p.productos.length} producto(s)</p>
                )}
              </div>
            ))}
            {pedidos.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No tienes pedidos aún</p>}
          </div>
        ) : null}
      </div>

      {/* New Order Modal */}
      {(showNewPedido || tab === 'nuevo') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => { setShowNewPedido(false); setTab('stock'); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-white">Nuevo Pedido</h2>
              <button onClick={() => { setShowNewPedido(false); setTab('stock'); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Nombre del cliente *</label>
                <input data-testid="pedido-cliente-nombre" value={pedidoForm.cliente_nombre} onChange={e => setPedidoForm({ ...pedidoForm, cliente_nombre: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Teléfono</label>
                  <input data-testid="pedido-cliente-telefono" value={pedidoForm.cliente_telefono} onChange={e => setPedidoForm({ ...pedidoForm, cliente_telefono: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Email</label>
                  <input data-testid="pedido-cliente-email" value={pedidoForm.cliente_email} onChange={e => setPedidoForm({ ...pedidoForm, cliente_email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Dirección</label>
                <input data-testid="pedido-cliente-direccion" value={pedidoForm.cliente_direccion} onChange={e => setPedidoForm({ ...pedidoForm, cliente_direccion: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Notas</label>
                <textarea data-testid="pedido-notas" value={pedidoForm.notas} onChange={e => setPedidoForm({ ...pedidoForm, notas: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none h-16" />
              </div>
              {/* Cart */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Productos en el pedido ({cart.length})</label>
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-600 py-3 text-center border border-dashed border-slate-700 rounded-lg">Ve a Stock y agrega productos al carrito</p>
                ) : (
                  <div className="space-y-1.5">
                    {cart.map(c => (
                      <div key={c.producto_id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                        <span className="text-xs text-white truncate flex-1">{c.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400">{c.cantidad}x {c.precio_unitario.toFixed(2)}€</span>
                          <button onClick={() => setCart(cart.filter(x => x.producto_id !== c.producto_id))} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    <p className="text-right text-sm font-bold text-emerald-400">Total: {cart.reduce((a, c) => a + c.cantidad * c.precio_unitario, 0).toFixed(2)}€</p>
                  </div>
                )}
              </div>
              <button data-testid="submit-pedido" onClick={submitPedido} disabled={!pedidoForm.cliente_nombre || cart.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart floating badge */}
      {cart.length > 0 && tab === 'stock' && (
        <div className="fixed bottom-4 right-4 z-40">
          <button onClick={() => { setTab('nuevo'); setShowNewPedido(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-emerald-900/50" data-testid="cart-badge">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-bold">{cart.length}</span>
          </button>
        </div>
      )}
    </div>
  );
}
