import { useState, useEffect, useCallback } from 'react';
import { Bell, MapPin, X, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API = process.env.REACT_APP_BACKEND_URL;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unread_count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, { method: 'POST', credentials: 'include' });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const getIcon = (type) => {
    if (type?.includes('location')) return <MapPin className="w-4 h-4 text-blue-500" />;
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="relative" data-testid="notification-bell">
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        data-testid="notification-bell-btn"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse" data-testid="notification-badge">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden" data-testid="notification-panel">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-900">Notificaciones</h4>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1" data-testid="mark-all-read">
                    <CheckCheck className="w-3 h-3" /> Leer todo
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  Sin notificaciones
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className={`p-3 border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''} hover:bg-gray-50 transition-colors`} data-testid={`notification-${i}`}>
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        {n.data?.maps_url && (
                          <a href={n.data.maps_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1" data-testid={`notification-map-${i}`}>
                            <ExternalLink className="w-3 h-3" /> Ver en mapa
                          </a>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {n.created_at ? new Date(n.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
