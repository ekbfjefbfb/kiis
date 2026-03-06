import { apiService } from './api.service';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  photoURL?: string;
  displayName?: string;
  name?: string;
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
    // Validar que el token tenga formato JWT (3 partes separadas por puntos)
    if (idToken.split('.').length !== 3) {
      console.error('Invalid ID Token format: must be a JWT with 3 parts');
      return false;
    }

    try {
      const response = await apiService.post<AuthResponse>('/auth/oauth', {
        provider,
        id_token: idToken,
        name: name || null
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
      const response = await apiService.post<{ access_token: string; token_type: string; expires_in: number }>('/auth/refresh', {
        refresh_token: this.refreshToken
      });
      
      if (response && response.access_token) {
        this.accessToken = response.access_token;
        if (this.accessToken) {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, this.accessToken);
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

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email,
        password
      });
      
      if (response && response.access_token) {
        this.saveToStorage(response);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(email: string, password: string, fullName: string): Promise<boolean> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', {
        email,
        password,
        full_name: fullName
      });
      
      if (response && response.access_token) {
        this.saveToStorage(response);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.accessToken;
  }

  getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = new AuthService();
