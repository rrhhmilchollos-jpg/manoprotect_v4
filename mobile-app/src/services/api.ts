/**
 * MANO API Service
 * Handles all communication with the backend
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL - Configure via environment or build config
// For development/preview: Use your backend URL
// For production: Update to your production domain
const API_BASE_URL = __DEV__ 
  ? 'https://secure-gateway-33.preview.emergentagent.com/api'
  : 'https://manoprotect.com/api';

class ApiService {
  private client: AxiosInstance;
  private sessionToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies in requests
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.sessionToken) {
          this.sessionToken = await AsyncStorage.getItem('session_token');
        }
        if (this.sessionToken) {
          config.headers.Authorization = `Bearer ${this.sessionToken}`;
          // Also send as cookie header for compatibility
          config.headers.Cookie = `session_token=${this.sessionToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and extract token from cookies
    this.client.interceptors.response.use(
      (response) => {
        // Try to extract session token from Set-Cookie header
        this.extractTokenFromResponse(response);
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Extract session token from response headers or body
   */
  private extractTokenFromResponse(response: AxiosResponse): void {
    // Check body first (some endpoints return it directly)
    if (response.data?.session_token) {
      this.sessionToken = response.data.session_token;
      AsyncStorage.setItem('session_token', this.sessionToken);
      return;
    }

    // Try to extract from Set-Cookie header
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookie of cookies) {
        const match = cookie.match(/session_token=([^;]+)/);
        if (match) {
          this.sessionToken = match[1];
          AsyncStorage.setItem('session_token', this.sessionToken);
          break;
        }
      }
    }
  }

  // ==================== AUTH ====================
  
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.session_token) {
      this.sessionToken = response.data.session_token;
      await AsyncStorage.setItem('session_token', this.sessionToken);
    }
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async register(email: string, name: string, password: string) {
    const response = await this.client.post('/auth/register', { email, name, password });
    if (response.data.session_token) {
      this.sessionToken = response.data.session_token;
      await AsyncStorage.setItem('session_token', this.sessionToken);
    }
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    }
    this.sessionToken = null;
    await AsyncStorage.multiRemove(['session_token', 'user']);
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== THREATS ====================

  async analyzeContent(content: string, contentType: string) {
    const response = await this.client.post('/analyze', { content, content_type: contentType });
    return response.data;
  }

  async getThreats(limit: number = 20) {
    const response = await this.client.get(`/threats?limit=${limit}`);
    return response.data;
  }

  async reportFalsePositive(threatId: string, reason: string) {
    const response = await this.client.post(`/threats/${threatId}/report`, { reason });
    return response.data;
  }

  async shareThreat(threatId: string, shareType: string) {
    const response = await this.client.post(`/threats/${threatId}/share`, { share_type: shareType });
    return response.data;
  }

  async getStats() {
    const response = await this.client.get('/stats');
    return response.data;
  }

  // ==================== FAMILY ====================

  async getFamilyDashboard() {
    const response = await this.client.get('/family/dashboard');
    return response.data;
  }

  async getFamilyMembers() {
    const response = await this.client.get('/family/members');
    return response.data;
  }

  async addFamilyMember(member: {
    name: string;
    phone?: string;
    email?: string;
    relationship: string;
    is_senior: boolean;
    simplified_mode: boolean;
    alert_level: string;
  }) {
    const response = await this.client.post('/family/members', member);
    return response.data;
  }

  async updateFamilyMember(memberId: string, updates: any) {
    const response = await this.client.patch(`/family/members/${memberId}`, updates);
    return response.data;
  }

  async deleteFamilyMember(memberId: string) {
    const response = await this.client.delete(`/family/members/${memberId}`);
    return response.data;
  }

  async getFamilyAlerts() {
    const response = await this.client.get('/family/alerts');
    return response.data;
  }

  // ==================== BANKING ====================

  async getSupportedBanks() {
    const response = await this.client.get('/banking/supported-banks');
    return response.data;
  }

  async getBankAccounts() {
    const response = await this.client.get('/banking/accounts');
    return response.data;
  }

  async connectBank(bankName: string, accountType: string = 'checking') {
    const response = await this.client.post('/banking/connect', { bank_name: bankName, account_type: accountType });
    return response.data;
  }

  async getTransactions(accountId?: string, days: number = 30, suspiciousOnly: boolean = false) {
    const params = new URLSearchParams();
    if (accountId) params.append('account_id', accountId);
    params.append('days', days.toString());
    params.append('suspicious_only', suspiciousOnly.toString());
    const response = await this.client.get(`/banking/transactions?${params}`);
    return response.data;
  }

  async analyzeTransaction(amount: number, description: string, merchant?: string) {
    const response = await this.client.post('/banking/analyze-transaction', { amount, description, merchant });
    return response.data;
  }

  async getBankingSummary() {
    const response = await this.client.get('/banking/summary');
    return response.data;
  }

  // ==================== REWARDS ====================

  async getRewardsStatus() {
    const response = await this.client.get('/rewards');
    return response.data;
  }

  async claimDailyReward() {
    const response = await this.client.post('/rewards/claim-daily');
    return response.data;
  }

  async getLeaderboard(limit: number = 10) {
    const response = await this.client.get(`/rewards/leaderboard?limit=${limit}`);
    return response.data;
  }

  // ==================== PROFILE ====================

  async getProfile() {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(updates: any) {
    const response = await this.client.patch('/profile', updates);
    return response.data;
  }

  // ==================== NOTIFICATIONS ====================

  async registerPushToken(token: string, platform: 'ios' | 'android') {
    const response = await this.client.post('/push/register', { token, platform });
    return response.data;
  }

  async unregisterPushToken() {
    const response = await this.client.delete('/push/unregister');
    return response.data;
  }

  // ==================== TRUSTED CONTACTS ====================

  async getTrustedContacts() {
    const response = await this.client.get('/contacts/trusted');
    return response.data;
  }

  async addTrustedContact(contact: {
    name: string;
    phone: string;
    relationship: string;
    is_emergency: boolean;
  }) {
    const response = await this.client.post('/contacts/trusted', contact);
    return response.data;
  }

  async deleteTrustedContact(contactId: string) {
    const response = await this.client.delete(`/contacts/trusted/${contactId}`);
    return response.data;
  }

  async sendSOSAlert(location?: string, message?: string) {
    const response = await this.client.post('/sos/alert', { location, message });
    return response.data;
  }
}

export const api = new ApiService();
export default api;
