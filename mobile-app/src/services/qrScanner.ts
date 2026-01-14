/**
 * QR Code Scanner Service
 * For scanning suspicious QR codes and links
 */
import { Platform, Linking } from 'react-native';

export interface ScanResult {
  type: string;
  data: string;
  isSuspicious: boolean;
  threatLevel: 'safe' | 'warning' | 'danger';
  reason?: string;
}

class QRScannerService {
  // Known malicious URL patterns
  private suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl\.com/i,
    /goo\.gl/i,
    /cutt\.ly/i,
    /rb\.gy/i,
    /t\.co/i,
    /ow\.ly/i,
    /is\.gd/i,
    /buff\.ly/i,
    /adf\.ly/i,
    // Phishing patterns
    /login.*secure/i,
    /verify.*account/i,
    /update.*payment/i,
    /confirm.*identity/i,
    // Fake domains
    /paypa[l1].*\.(?!com)/i,
    /amaz[o0]n.*\.(?!com)/i,
    /g[o0]{2}gle.*\.(?!com)/i,
    /faceb[o0]{2}k.*\.(?!com)/i,
    /bancosantander.*\.(?!es)/i,
    /bbva.*\.(?!es)/i,
    /caixabank.*\.(?!es)/i,
  ];

  // Known safe domains
  private safeDomains = [
    'google.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    'youtube.com',
    'amazon.com',
    'amazon.es',
    'paypal.com',
    'bancosantander.es',
    'bbva.es',
    'caixabank.es',
    'ing.es',
    'apple.com',
    'microsoft.com',
  ];

  /**
   * Analyze scanned QR code content
   */
  analyzeQRCode(data: string): ScanResult {
    const type = this.detectContentType(data);
    
    if (type === 'url') {
      return this.analyzeURL(data);
    } else if (type === 'phone') {
      return this.analyzePhone(data);
    } else if (type === 'email') {
      return this.analyzeEmail(data);
    } else if (type === 'wifi') {
      return this.analyzeWiFi(data);
    } else {
      return this.analyzeText(data);
    }
  }

  /**
   * Detect content type from QR data
   */
  private detectContentType(data: string): string {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return 'url';
    }
    if (data.startsWith('tel:') || /^\+?[\d\s-]{9,}$/.test(data)) {
      return 'phone';
    }
    if (data.startsWith('mailto:') || /^[\w.-]+@[\w.-]+\.\w+$/.test(data)) {
      return 'email';
    }
    if (data.startsWith('WIFI:')) {
      return 'wifi';
    }
    return 'text';
  }

  /**
   * Analyze URL for threats
   */
  private analyzeURL(url: string): ScanResult {
    let threatLevel: 'safe' | 'warning' | 'danger' = 'safe';
    let reason: string | undefined;

    // Check against suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(url)) {
        threatLevel = 'danger';
        reason = 'URL sospechosa detectada. Posible intento de phishing.';
        break;
      }
    }

    // Check if using HTTP instead of HTTPS
    if (url.startsWith('http://') && threatLevel === 'safe') {
      threatLevel = 'warning';
      reason = 'Conexión no segura (HTTP). Los datos podrían ser interceptados.';
    }

    // Extract domain and check if safe
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check if it's a known safe domain
      const isSafeDomain = this.safeDomains.some(safe => 
        domain === safe || domain.endsWith('.' + safe)
      );

      if (isSafeDomain && threatLevel !== 'danger') {
        threatLevel = 'safe';
        reason = undefined;
      }

      // Check for suspicious subdomains (e.g., paypal.malicious.com)
      for (const safe of this.safeDomains) {
        if (domain.includes(safe.split('.')[0]) && !domain.endsWith(safe)) {
          threatLevel = 'danger';
          reason = `Dominio sospechoso imitando a ${safe}`;
          break;
        }
      }
    } catch (e) {
      // Invalid URL
      threatLevel = 'warning';
      reason = 'URL malformada';
    }

    return {
      type: 'url',
      data: url,
      isSuspicious: threatLevel !== 'safe',
      threatLevel,
      reason,
    };
  }

  /**
   * Analyze phone number
   */
  private analyzePhone(data: string): ScanResult {
    const phone = data.replace('tel:', '').trim();
    
    // Check for premium rate numbers (Spain)
    const premiumPatterns = [
      /^80[2-7]/,  // 80x numbers
      /^90[3-7]/,  // 90x premium
    ];

    const isPremium = premiumPatterns.some(p => p.test(phone.replace(/\D/g, '')));

    return {
      type: 'phone',
      data: phone,
      isSuspicious: isPremium,
      threatLevel: isPremium ? 'warning' : 'safe',
      reason: isPremium ? 'Número de tarificación especial. Puede tener coste adicional.' : undefined,
    };
  }

  /**
   * Analyze email address
   */
  private analyzeEmail(data: string): ScanResult {
    const email = data.replace('mailto:', '').trim();
    
    // Check for suspicious patterns in email
    const suspiciousEmailPatterns = [
      /support.*@(?!apple|google|microsoft|paypal)/i,
      /security.*@/i,
      /verify.*@/i,
      /account.*@/i,
    ];

    const isSuspicious = suspiciousEmailPatterns.some(p => p.test(email));

    return {
      type: 'email',
      data: email,
      isSuspicious,
      threatLevel: isSuspicious ? 'warning' : 'safe',
      reason: isSuspicious ? 'Dirección de email potencialmente sospechosa.' : undefined,
    };
  }

  /**
   * Analyze WiFi configuration
   */
  private analyzeWiFi(data: string): ScanResult {
    // WiFi QR format: WIFI:T:WPA;S:NetworkName;P:Password;;
    const hasPassword = data.includes('P:') && !data.includes('P:;');
    const encryption = data.match(/T:(\w+)/)?.[1] || 'NONE';

    let threatLevel: 'safe' | 'warning' | 'danger' = 'safe';
    let reason: string | undefined;

    if (encryption === 'NONE' || encryption === '' || encryption === 'nopass') {
      threatLevel = 'warning';
      reason = 'Red WiFi sin cifrado. Tus datos no estarán protegidos.';
    } else if (encryption === 'WEP') {
      threatLevel = 'warning';
      reason = 'Cifrado WEP obsoleto. Se recomienda WPA2/WPA3.';
    }

    return {
      type: 'wifi',
      data: data,
      isSuspicious: threatLevel !== 'safe',
      threatLevel,
      reason,
    };
  }

  /**
   * Analyze plain text
   */
  private analyzeText(data: string): ScanResult {
    // Check for suspicious keywords
    const suspiciousKeywords = [
      'contraseña',
      'password',
      'pin',
      'tarjeta',
      'cuenta bancaria',
      'urgente',
      'verificar',
      'premio',
      'ganador',
    ];

    const lowerData = data.toLowerCase();
    const isSuspicious = suspiciousKeywords.some(kw => lowerData.includes(kw));

    return {
      type: 'text',
      data: data,
      isSuspicious,
      threatLevel: isSuspicious ? 'warning' : 'safe',
      reason: isSuspicious ? 'El texto contiene palabras frecuentes en estafas.' : undefined,
    };
  }

  /**
   * Open URL safely (with warning)
   */
  async openURLSafely(url: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error opening URL:', error);
      return false;
    }
  }
}

export const qrScannerService = new QRScannerService();
export default qrScannerService;
