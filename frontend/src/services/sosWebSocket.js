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
   * Play emergency siren - CRITICAL ALERT
   * This siren will NOT stop until someone acknowledges the emergency
   * Uses maximum volume and bypasses silent mode via Web Audio API
   */
  playSiren() {
    if (this.audioContext && this.audioContext.state !== 'closed') return; // Already playing

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create compressor for maximum loudness
      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, this.audioContext.currentTime);
      compressor.knee.setValueAtTime(40, this.audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      compressor.attack.setValueAtTime(0, this.audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      compressor.connect(this.audioContext.destination);
      
      const createSirenCycle = (startTime, duration) => {
        // Primary siren oscillator (high frequency sweep)
        const osc1 = this.audioContext.createOscillator();
        // Secondary oscillator (low frequency for "wail" effect)
        const osc2 = this.audioContext.createOscillator();
        // Third oscillator for more urgency
        const osc3 = this.audioContext.createOscillator();
        
        const gain = this.audioContext.createGain();
        const master = this.audioContext.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(master);
        master.connect(compressor);

        // Primary siren: 600Hz to 1400Hz sweep (police siren style)
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(600, startTime);
        osc1.frequency.linearRampToValueAtTime(1400, startTime + duration / 2);
        osc1.frequency.linearRampToValueAtTime(600, startTime + duration);

        // Secondary: Lower frequency for depth
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(300, startTime);
        osc2.frequency.linearRampToValueAtTime(600, startTime + duration / 2);
        osc2.frequency.linearRampToValueAtTime(300, startTime + duration);

        // Third: Very high pitch for urgency
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1200, startTime);
        osc3.frequency.linearRampToValueAtTime(2000, startTime + duration / 2);
        osc3.frequency.linearRampToValueAtTime(1200, startTime + duration);

        // MAXIMUM VOLUME
        gain.gain.setValueAtTime(0.5, startTime);
        master.gain.setValueAtTime(1.0, startTime); // FULL VOLUME

        osc1.start(startTime);
        osc2.start(startTime);
        osc3.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
        osc3.stop(startTime + duration);
      };

      // Play siren in continuous loop
      const playLoop = () => {
        if (this.audioContext && this.audioContext.state !== 'closed') {
          // Create 4 overlapping siren cycles for continuous sound
          for (let i = 0; i < 4; i++) {
            createSirenCycle(this.audioContext.currentTime + (i * 1.2), 1.2);
          }
        }
      };

      // Start immediately
      playLoop();
      
      // Continue playing every 4.8 seconds (4 cycles * 1.2s)
      this.sirenInterval = setInterval(playLoop, 4800);
      
      // Also activate continuous vibration pattern (SOS pattern: ... --- ...)
      if ('vibrate' in navigator) {
        // SOS vibration: short short short, long long long, short short short
        const sosPattern = [
          200, 100, 200, 100, 200, 300,  // S: ...
          400, 100, 400, 100, 400, 300,  // O: ---
          200, 100, 200, 100, 200, 500   // S: ...
        ];
        
        // Repeat vibration pattern
        this.vibrationInterval = setInterval(() => {
          navigator.vibrate(sosPattern);
        }, 3000);
        
        // Start first vibration immediately
        navigator.vibrate(sosPattern);
      }

      // Flash screen red for visual alert
      this.startScreenFlash();
      
      console.log('[SOS] 🚨 EMERGENCY SIREN ACTIVATED - Maximum Volume');
      
    } catch (error) {
      console.error('[SOS] Error playing siren:', error);
    }
  }

  /**
   * Flash screen red for visual emergency alert
   */
  startScreenFlash() {
    if (this.flashInterval) return;
    
    let isRed = false;
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.id = 'sos-flash-overlay';
    this.flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(220, 38, 38, 0.3);
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(this.flashOverlay);
    
    this.flashInterval = setInterval(() => {
      isRed = !isRed;
      if (this.flashOverlay) {
        this.flashOverlay.style.opacity = isRed ? '1' : '0';
      }
    }, 500);
  }

  /**
   * Stop screen flash
   */
  stopScreenFlash() {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
    if (this.flashOverlay && this.flashOverlay.parentNode) {
      this.flashOverlay.parentNode.removeChild(this.flashOverlay);
      this.flashOverlay = null;
    }
  }

  /**
   * Stop siren - Only call this when emergency is ACKNOWLEDGED
   */
  stopSiren() {
    console.log('[SOS] 🔇 Stopping emergency siren');
    
    // Stop audio
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Stop vibration
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    
    // Stop screen flash
    this.stopScreenFlash();
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
