import { apiService } from './api.service';

interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserData;
}

export class AuthService {
  private currentUser: UserData | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    this.loadFromStorage();
  }

  private parseJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private isAccessTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = this.parseJwtPayload(token);
    if (!payload) return true; // opaque token: can't validate exp here
    const exp = payload?.exp;
    if (!exp || typeof exp !== 'number') return true;
    const nowSec = Math.floor(Date.now() / 1000);
    // small skew to avoid edge-of-expiry UX bugs
    return exp - 15 > nowSec;
  }

  private loadFromStorage(): void {
    this.accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch {
        this.currentUser = null;
      }
    }

    // If token is expired, do not treat session as authenticated
    if (this.accessToken && !this.isAccessTokenValid(this.accessToken)) {
      this.accessToken = null;
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  private saveToStorage(authData: AuthResponse): void {
    this.accessToken = authData.access_token;
    this.refreshToken = authData.refresh_token;
    this.currentUser = authData.user;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, this.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, this.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
  }

  async loginOAuth(provider: 'google' | 'apple', idToken: string, name?: string): Promise<boolean> {
    try {
      const response = await apiService.post<AuthResponse>('/api/auth/oauth', {
        provider,
        id_token: idToken,
        name,
      });

      if (response && response.access_token) {
        this.saveToStorage(response);
        return true;
      }
      return false;
    } catch (error) {
      console.error('OAuth Login failed:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await apiService.post<{ access_token: string; refresh_token?: string; token_type: string }>('/api/auth/refresh', {
        refresh_token: this.refreshToken,
      });

      if (response && response.access_token) {
        this.accessToken = response.access_token;
        localStorage.setItem(this.ACCESS_TOKEN_KEY, this.accessToken);
        if (response.refresh_token) {
          this.refreshToken = response.refresh_token;
          localStorage.setItem(this.REFRESH_TOKEN_KEY, this.refreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  async login(email: string, password?: string): Promise<boolean> {
    if (!(import.meta as any).env?.DEV) {
      console.error('Password login is disabled in production. Use OAuth.');
      return false;
    }

    const mockIdToken = btoa(JSON.stringify({ email }));
    return this.loginOAuth('google', mockIdToken);
  }

  async register(email: string, password?: string, displayName?: string): Promise<boolean> {
    if (!(import.meta as any).env?.DEV) {
      console.error('Password register is disabled in production. Use OAuth.');
      return false;
    }

    const mockIdToken = btoa(JSON.stringify({ email }));
    return this.loginOAuth('google', mockIdToken, displayName);
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && this.isAccessTokenValid(this.accessToken);
  }

  getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    if (!this.isAccessTokenValid(this.accessToken)) return null;
    return this.accessToken;
  }
}

export const authService = new AuthService();
