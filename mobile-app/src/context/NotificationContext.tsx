/**
 * Notification Context
 * Global notification state and handlers
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notificationService from '../services/notifications';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'threat' | 'family' | 'banking' | 'system';
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isInitialized: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
    }
  }, [isAuthenticated, user]);

  const initializeNotifications = async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();
      
      // Register push token
      await notificationService.registerToken();
      
      // Set up foreground handler
      const unsubscribe = notificationService.setupForegroundHandler();
      
      // Check for initial notification
      const initialNotification = await notificationService.getInitialNotification();
      if (initialNotification) {
        handleIncomingNotification(initialNotification);
      }

      setIsInitialized(true);

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  };

  const handleIncomingNotification = (remoteMessage: any) => {
    const notification: Notification = {
      id: remoteMessage.messageId || Date.now().toString(),
      title: remoteMessage.notification?.title || 'MANO',
      message: remoteMessage.notification?.body || '',
      type: remoteMessage.data?.type || 'system',
      timestamp: new Date(),
      read: false,
      data: remoteMessage.data,
    };

    addNotification(notification);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isInitialized,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
