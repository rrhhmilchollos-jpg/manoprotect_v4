/**
 * ManoProtect - WebSocket Client for Real-time SOS
 * Handles real-time communication for emergency alerts
 */
import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || '';

class SOSWebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.userName = null;
    this.onSOSAlert = null;
    this.onSOSResolved = null;
    this.onLocationUpdate = null;
    this.onSOSAcknowledged = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId, userName) {
    if (this.socket?.connected) {
      console.log('[WS] Already connected');
      return;
    }

    this.userId = userId;
    this.userName = userName;

    const wsUrl = WS_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    
    this.socket = io(wsUrl, {
      path: '/ws/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[WS] Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Register user after connection
      this.register();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error.message);
      this.reconnectAttempts++;
    });

    // Registration confirmation
    this.socket.on('registered', (data) => {
      console.log('[WS] Registered successfully:', data);
    });

    // SOS Alert received (for family members)
    this.socket.on('sos_alert', (data) => {
      console.log('[WS] SOS Alert received:', data);
      
      // Play siren if requested
      if (data.play_siren) {
        this.playSiren();
      }
      
      // Vibrate device
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
      }
      
      // Callback
      if (this.onSOSAlert) {
        this.onSOSAlert(data);
      }
    });

    // SOS resolved
    this.socket.on('sos_resolved', (data) => {
      console.log('[WS] SOS Resolved:', data);
      this.stopSiren();
      
      if (this.onSOSResolved) {
        this.onSOSResolved(data);
      }
    });

    // SOS acknowledged by family
    this.socket.on('sos_acknowledged', (data) => {
      console.log('[WS] SOS Acknowledged:', data);
      
      if (this.onSOSAcknowledged) {
        this.onSOSAcknowledged(data);
      }
    });

    // Location update
    this.socket.on('location_update', (data) => {
      console.log('[WS] Location update:', data);
      
      if (this.onLocationUpdate) {
        this.onLocationUpdate(data);
      }
    });

    // SOS confirmed (sent successfully)
    this.socket.on('sos_confirmed', (data) => {
      console.log('[WS] SOS Confirmed:', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('[WS] Error:', data);
    });
  }

  /**
   * Register user with server
   */
  register() {
    if (!this.socket?.connected || !this.userId) return;
    
    this.socket.emit('register', {
      user_id: this.userId,
      user_name: this.userName
    });
  }

  /**
   * Activate SOS alert
   */
  activateSOS(alertId, location, message = '¡Emergencia!') {
    if (!this.socket?.connected) {
      console.error('[WS] Not connected');
      return false;
    }

    this.socket.emit('sos_activate', {
      alert_id: alertId,
      location: location,
      message: message
    });

    return true;
  }

  /**
   * Deactivate SOS alert
   */
  deactivateSOS(alertId) {
    if (!this.socket?.connected) return false;

    this.socket.emit('sos_deactivate', {
      alert_id: alertId
    });

    this.stopSiren();
    return true;
  }

  /**
   * Send location update during SOS
   */
  updateLocation(alertId, location) {
    if (!this.socket?.connected) return false;

    this.socket.emit('location_update', {
      alert_id: alertId,
      location: location
    });

    return true;
  }

  /**
   * Acknowledge SOS alert (as family member)
   */
  acknowledgeSOS(alertId) {
    if (!this.socket?.connected) return false;

    this.socket.emit('acknowledge_sos', {
      alert_id: alertId
    });

    return true;
  }

  /**
   * Play emergency siren
   */
  playSiren() {
    if (this.audioContext) return; // Already playing

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const createSirenCycle = (startTime, duration) => {
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const master = this.audioContext.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(master);
        master.connect(this.audioContext.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(600, startTime);
        osc1.frequency.linearRampToValueAtTime(1200, startTime + duration / 2);
        osc1.frequency.linearRampToValueAtTime(600, startTime + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, startTime);
        osc2.frequency.linearRampToValueAtTime(800, startTime + duration / 2);
        osc2.frequency.linearRampToValueAtTime(400, startTime + duration);

        gain.gain.setValueAtTime(0.4, startTime);
        master.gain.setValueAtTime(0.7, startTime);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      const playLoop = () => {
        if (this.audioContext && this.audioContext.state !== 'closed') {
          for (let i = 0; i < 4; i++) {
            createSirenCycle(this.audioContext.currentTime + (i * 1.5), 1.5);
          }
        }
      };

      playLoop();
      this.sirenInterval = setInterval(playLoop, 6000);
      
    } catch (error) {
      console.error('[WS] Error playing siren:', error);
    }
  }

  /**
   * Stop siren
   */
  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  /**
   * Set callback for SOS alerts
   */
  setOnSOSAlert(callback) {
    this.onSOSAlert = callback;
  }

  /**
   * Set callback for SOS resolved
   */
  setOnSOSResolved(callback) {
    this.onSOSResolved = callback;
  }

  /**
   * Set callback for location updates
   */
  setOnLocationUpdate(callback) {
    this.onLocationUpdate = callback;
  }

  /**
   * Set callback for SOS acknowledged
   */
  setOnSOSAcknowledged(callback) {
    this.onSOSAcknowledged = callback;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.stopSiren();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Check if connected
   */
  isSocketConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const sosWebSocket = new SOSWebSocketClient();

export default sosWebSocket;
export { SOSWebSocketClient };
