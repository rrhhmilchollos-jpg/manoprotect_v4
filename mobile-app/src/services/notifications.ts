/**
 * Push Notification Service
 * Firebase Cloud Messaging for iOS and Android
 */
import messaging from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

class NotificationService {
  private isInitialized = false;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'mano-threats',
          channelName: 'Alertas de Amenazas',
          channelDescription: 'Notificaciones sobre amenazas detectadas',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Notification channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'mano-family',
          channelName: 'Alertas Familiares',
          channelDescription: 'Notificaciones sobre miembros de la familia',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Family channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'mano-banking',
          channelName: 'Alertas Bancarias',
          channelDescription: 'Notificaciones sobre actividad bancaria sospechosa',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Banking channel created: ${created}`)
      );
    }

    // Configure local notifications
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        this.handleNotification(notification);
      },
      onRegister: (token) => {
        console.log('Push token:', token.token);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: false,
    });

    this.isInitialized = true;
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      return true; // Android grants by default
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async registerToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Save token locally
      await AsyncStorage.setItem('fcm_token', token);

      // Register with backend
      await api.registerPushToken(token, 'android');

      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: any): void {
    const { data, title, message } = notification;

    // Handle different notification types
    switch (data?.type) {
      case 'threat_detected':
        this.handleThreatNotification(data);
        break;
      case 'family_alert':
        this.handleFamilyAlert(data);
        break;
      case 'banking_alert':
        this.handleBankingAlert(data);
        break;
      case 'sos_alert':
        this.handleSOSAlert(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  private handleThreatNotification(data: any): void {
    // Navigate to threat details or show modal
    console.log('Threat notification:', data);
  }

  private handleFamilyAlert(data: any): void {
    console.log('Family alert:', data);
  }

  private handleBankingAlert(data: any): void {
    console.log('Banking alert:', data);
  }

  private handleSOSAlert(data: any): void {
    console.log('SOS alert:', data);
  }

  /**
   * Show local notification
   */
  showLocalNotification(
    title: string,
    message: string,
    channelId: string = 'mano-threats',
    data?: any
  ): void {
    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      data,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });
  }

  /**
   * Schedule a local notification
   */
  scheduleNotification(
    title: string,
    message: string,
    date: Date,
    channelId: string = 'mano-threats'
  ): void {
    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }

  /**
   * Cancel all notifications
   */
  cancelAll(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Set up foreground message handler
   */
  setupForegroundHandler(): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      
      // Show local notification when app is in foreground
      if (remoteMessage.notification) {
        this.showLocalNotification(
          remoteMessage.notification.title || 'MANO',
          remoteMessage.notification.body || '',
          'mano-threats',
          remoteMessage.data
        );
      }
    });
  }

  /**
   * Set up background message handler
   */
  static setBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });
  }

  /**
   * Get initial notification (app opened from notification)
   */
  async getInitialNotification(): Promise<any> {
    const initialNotification = await messaging().getInitialNotification();
    return initialNotification;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
