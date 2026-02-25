interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
}

export class AuthService {
  private currentUser: UserData | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly DEMO_MODE = true; // Modo demo sin backend

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  private saveToStorage(user: UserData): void {
    this.accessToken = 'demo_token_' + Date.now();
    this.refreshToken = 'demo_refresh_' + Date.now();
    this.currentUser = user;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, this.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, this.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
  }

  async loginWithGoogle(): Promise<boolean> {
    if (this.DEMO_MODE) {
      // Modo demo sin backend
      const demoUser: UserData = {
        email: 'demo@notdeer.app',
        displayName: 'Usuario Demo'
      };
      this.saveToStorage(demoUser);
      return true;
    }

    try {
      const google = (window as any).google;
      if (!google) {
        console.error('Google Sign-In no está cargado');
        return false;
      }

      return new Promise((resolve) => {
        google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID',
          callback: async (response: any) => {
            try {
              const result = await this.sendOAuthToken('google', response.credential);
              resolve(result);
            } catch (error) {
              console.error('Error en OAuth:', error);
              resolve(false);
            }
          }
        });

        google.accounts.id.prompt();
      });
    } catch (error) {
      console.error('Error en login con Google:', error);
      return false;
    }
  }

  private async sendOAuthToken(provider: string, idToken: string): Promise<boolean> {
    // Implementar cuando tengas backend
    return false;
  }

  async register(email: string, password: string, displayName?: string): Promise<boolean> {
    console.log('Register called:', { email, displayName, DEMO_MODE: this.DEMO_MODE });
    
    if (this.DEMO_MODE) {
      // Modo demo sin backend
      const demoUser: UserData = {
        email: email,
        displayName: displayName || email.split('@')[0]
      };
      console.log('Saving demo user:', demoUser);
      this.saveToStorage(demoUser);
      console.log('User saved, returning true');
      return true;
    }
    return false;
  }

  async login(email: string, password: string): Promise<boolean> {
    if (this.DEMO_MODE) {
      // Modo demo sin backend
      const demoUser: UserData = {
        email: email,
        displayName: email.split('@')[0]
      };
      this.saveToStorage(demoUser);
      return true;
    }
    return false;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (this.DEMO_MODE) return true;
    return false;
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
    return !!this.currentUser;
  }

  getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async getValidToken(): Promise<string | null> {
    return this.accessToken;
  }
}
