/**
 * SERVICIO NATIVO SOS - ManoProtect
 * 
 * Este módulo conecta React Native con los servicios nativos de Android
 * para el sistema de alerta crítica SOS.
 * 
 * Funcionalidades:
 * 1. Iniciar/Detener alerta crítica con sirena (ignora modo silencioso)
 * 2. GPS tracking en segundo plano
 * 3. Mostrar pantalla sobre lock screen
 * 4. Enviar/recibir acknowledgments
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { SOSNativeModule } = NativeModules;

// Event emitter for native events
const sosEventEmitter = Platform.OS === 'android' && SOSNativeModule 
  ? new NativeEventEmitter(SOSNativeModule) 
  : null;

// Types
export interface SOSLocation {
  latitude: number;
  longitude: number;
}

export interface SOSAlertData {
  alertId: string;
  senderName: string;
  latitude: number;
  longitude: number;
  message?: string;
}

// Event listeners storage
type EventCallback = (data: any) => void;
const eventListeners: { [key: string]: EventCallback[] } = {};

/**
 * Servicio de Alerta Crítica SOS
 */
class SOSNativeService {
  private isInitialized: boolean = false;

  /**
   * Inicializar el servicio y configurar listeners
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[SOS] Native SOS service only available on Android');
      return false;
    }

    if (!SOSNativeModule) {
      console.error('[SOS] SOSNativeModule not available');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      // Setup event listeners
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('[SOS] Native SOS service initialized');
      return true;
    } catch (error) {
      console.error('[SOS] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Configurar listeners de eventos nativos
   */
  private setupEventListeners(): void {
    if (!sosEventEmitter) return;

    // Location updates from native GPS tracking
    sosEventEmitter.addListener('onSOSLocationUpdate', (data) => {
      this.emitToListeners('locationUpdate', data);
    });

    // FCM token received
    sosEventEmitter.addListener('onFCMTokenReceived', (token) => {
      this.emitToListeners('fcmToken', token);
    });

    // Alert acknowledged
    sosEventEmitter.addListener('onAlertAcknowledged', (alertId) => {
      this.emitToListeners('acknowledged', alertId);
    });

    // General location update from broadcast
    sosEventEmitter.addListener('onLocationUpdate', (data) => {
      this.emitToListeners('locationUpdate', data);
    });
  }

  /**
   * Emitir evento a listeners registrados
   */
  private emitToListeners(event: string, data: any): void {
    const listeners = eventListeners[event] || [];
    listeners.forEach(callback => callback(data));
  }

  /**
   * INICIAR ALERTA CRÍTICA SOS
   * 
   * Esta función inicia el servicio nativo que:
   * - Activa la sirena usando STREAM_ALARM (ignora modo silencioso)
   * - Sube el volumen al 100%
   * - Inicia vibración continua (patrón SOS)
   * - Inicia GPS tracking en segundo plano
   * - Muestra pantalla sobre lock screen
   * 
   * @param data - Datos de la alerta SOS
   */
  async startCriticalAlert(data: SOSAlertData): Promise<boolean> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      console.warn('[SOS] startCriticalAlert only available on Android');
      return false;
    }

    try {
      const result = await SOSNativeModule.startCriticalAlert(
        data.alertId,
        data.senderName,
        data.latitude,
        data.longitude,
        data.message || '¡Emergencia SOS!'
      );
      console.log('[SOS] Critical alert started:', data.alertId);
      return result;
    } catch (error) {
      console.error('[SOS] Failed to start critical alert:', error);
      return false;
    }
  }

  /**
   * DETENER ALERTA CRÍTICA
   * 
   * Detiene todos los componentes de la alerta:
   * - Sirena
   * - Vibración
   * - GPS tracking
   * - Pantalla de lock screen
   * - Restaura volumen original
   */
  async stopCriticalAlert(): Promise<boolean> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return false;
    }

    try {
      const result = await SOSNativeModule.stopCriticalAlert();
      console.log('[SOS] Critical alert stopped');
      return result;
    } catch (error) {
      console.error('[SOS] Failed to stop critical alert:', error);
      return false;
    }
  }

  /**
   * ENVIAR ACKNOWLEDGMENT
   * 
   * Llamado cuando un familiar confirma que ha visto la alerta.
   * Esto detiene la sirena en TODOS los dispositivos de la familia.
   * 
   * @param alertId - ID de la alerta a confirmar
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return false;
    }

    try {
      const result = await SOSNativeModule.acknowledgeAlert(alertId);
      console.log('[SOS] Alert acknowledged:', alertId);
      return result;
    } catch (error) {
      console.error('[SOS] Failed to acknowledge alert:', error);
      return false;
    }
  }

  /**
   * OBTENER TOKEN FCM
   */
  async getFCMToken(): Promise<string | null> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return null;
    }

    try {
      return await SOSNativeModule.getFCMToken();
    } catch (error) {
      console.error('[SOS] Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * VERIFICAR SI HAY ALERTA ACTIVA
   */
  async isAlertActive(): Promise<boolean> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return false;
    }

    try {
      return await SOSNativeModule.isAlertActive();
    } catch (error) {
      return false;
    }
  }

  /**
   * OBTENER UBICACIÓN ACTUAL DE LA ALERTA
   */
  async getCurrentAlertLocation(): Promise<SOSLocation | null> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return null;
    }

    try {
      return await SOSNativeModule.getCurrentAlertLocation();
    } catch (error) {
      return null;
    }
  }

  /**
   * OBTENER ID DE ALERTA ACTUAL
   */
  async getCurrentAlertId(): Promise<string | null> {
    if (Platform.OS !== 'android' || !SOSNativeModule) {
      return null;
    }

    try {
      return await SOSNativeModule.getCurrentAlertId();
    } catch (error) {
      return null;
    }
  }

  /**
   * REGISTRAR LISTENER DE EVENTOS
   * 
   * @param event - Tipo de evento: 'locationUpdate' | 'fcmToken' | 'acknowledged'
   * @param callback - Función a llamar cuando ocurra el evento
   */
  addEventListener(event: string, callback: EventCallback): void {
    if (!eventListeners[event]) {
      eventListeners[event] = [];
    }
    eventListeners[event].push(callback);
  }

  /**
   * ELIMINAR LISTENER DE EVENTOS
   */
  removeEventListener(event: string, callback: EventCallback): void {
    if (!eventListeners[event]) return;
    eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
  }

  /**
   * LIMPIAR TODOS LOS LISTENERS
   */
  removeAllListeners(): void {
    Object.keys(eventListeners).forEach(key => {
      eventListeners[key] = [];
    });
  }
}

// Singleton instance
const sosNativeService = new SOSNativeService();

export default sosNativeService;
export { sosNativeService };
