import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, AlertTriangle, Shield, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API}/notifications`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API}/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? {...n, is_read: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'threat':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'family':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'sos':
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-zinc-50';
    
    switch(type) {
      case 'threat':
        return 'bg-red-50';
      case 'family':
        return 'bg-emerald-50';
      case 'sos':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="notification-center-btn"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white shadow-lg border rounded-lg p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={loading}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-zinc-50 cursor-pointer transition-colors ${
                    getNotificationColor(notification.notification_type, notification.is_read)
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${
                          notification.is_read ? 'text-zinc-600' : 'text-zinc-900'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(notification.created_at).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-zinc-500 hover:text-zinc-700 w-full"
              onClick={() => setOpen(false)}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
