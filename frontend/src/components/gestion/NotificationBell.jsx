import { useState, useEffect, useRef } from 'react';
import { API } from '@/utils/apiBase';
import { Bell, X, Package, ShoppingCart, Wrench, RefreshCw, AlertTriangle, Info } from 'lucide-react';

const gFetch = async (path) => {
  const token = localStorage.getItem('gestion_token');
  const res = await fetch(`${API}/gestion${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
};

const ICONS = {
  stock_bajo: AlertTriangle,
  nuevo_pedido: ShoppingCart,
  nueva_instalacion: Wrench,
  update: RefreshCw,
  info: Info,
};

const COLORS = {
  stock_bajo: 'text-red-400 bg-red-500/20',
  nuevo_pedido: 'text-blue-400 bg-blue-500/20',
  nueva_instalacion: 'text-amber-400 bg-amber-500/20',
  update: 'text-purple-400 bg-purple-500/20',
  info: 'text-slate-400 bg-slate-500/20',
};

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    const data = await gFetch('/notificaciones?limit=20');
    if (data) {
      setNotifs(data.notificaciones || []);
      setUnread(data.no_leidas || 0);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem('gestion_token');
    await fetch(`${API}/gestion/notificaciones/leer`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setUnread(0);
    setNotifs(notifs.map(n => ({ ...n, leida: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="notification-bell"
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-white relative"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden" data-testid="notification-panel">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Notificaciones</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sin notificaciones</p>
            ) : (
              notifs.map(n => {
                const Icon = ICONS[n.tipo] || Info;
                const color = COLORS[n.tipo] || COLORS.info;
                return (
                  <div key={n.notif_id} className={`px-3 py-2.5 border-b border-slate-800/50 ${!n.leida ? 'bg-slate-800/30' : ''}`}>
                    <div className="flex gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color.split(' ')[1]}`}>
                        <Icon className={`w-3.5 h-3.5 ${color.split(' ')[0]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{n.titulo}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{n.mensaje}</p>
                        <p className="text-[9px] text-slate-600 mt-1">{new Date(n.timestamp).toLocaleString('es-ES')}</p>
                      </div>
                      {!n.leida && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
