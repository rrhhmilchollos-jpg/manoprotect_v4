/**
 * Biometric Authentication Service
 * Face ID (iOS) / Fingerprint (Android)
 */
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics();

export interface BiometricResult {
  success: boolean;
  error?: string;
}

class BiometricService {
  private biometryType: string | null = null;

  /**
   * Check if biometrics is available on device
   */
  async isAvailable(): Promise<{ available: boolean; biometryType: string | null }> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      this.biometryType = biometryType || null;
      return { available, biometryType: this.biometryType };
    } catch (error) {
      return { available: false, biometryType: null };
    }
  }

  /**
   * Get human-readable biometry type name
   */
  getBiometryName(): string {
    switch (this.biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Huella Digital';
      default:
        return 'Biometría';
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage?: string): Promise<BiometricResult> {
    try {
      const { available } = await this.isAvailable();
      if (!available) {
        return { success: false, error: 'Biometría no disponible' };
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: promptMessage || 'Confirma tu identidad',
        cancelButtonText: 'Cancelar',
      });

      return { success };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error de autenticación' };
    }
  }

  /**
   * Store credentials securely with biometric protection
   */
  async storeCredentials(email: string, password: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(email, password, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        service: 'mano-app-credentials',
      });
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials with biometric authentication
   */
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'mano-app-credentials',
      });
      
      if (credentials) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  }

  /**
   * Check if credentials are stored
   */
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'mano-app-credentials',
      });
      return !!credentials;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: 'mano-app-credentials' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable biometric login for current user
   */
  async enableBiometricLogin(email: string, password: string): Promise<BiometricResult> {
    const { available } = await this.isAvailable();
    if (!available) {
      return { success: false, error: 'Biometría no disponible en este dispositivo' };
    }

    // Authenticate first
    const authResult = await this.authenticate('Activa el acceso biométrico');
    if (!authResult.success) {
      return authResult;
    }

    // Store credentials
    const stored = await this.storeCredentials(email, password);
    if (!stored) {
      return { success: false, error: 'No se pudieron guardar las credenciales' };
    }

    return { success: true };
  }

  /**
   * Login with biometrics
   */
  async biometricLogin(): Promise<{ success: boolean; credentials?: { email: string; password: string }; error?: string }> {
    const hasCredentials = await this.hasStoredCredentials();
    if (!hasCredentials) {
      return { success: false, error: 'No hay credenciales guardadas' };
    }

    const authResult = await this.authenticate('Inicia sesión con biometría');
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const credentials = await this.getCredentials();
    if (!credentials) {
      return { success: false, error: 'Error al recuperar credenciales' };
    }

    return { success: true, credentials };
  }
}

export const biometricService = new BiometricService();
export default biometricService;
