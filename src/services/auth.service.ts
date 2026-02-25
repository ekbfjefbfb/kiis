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
  private readonly DEMO_MODE = true;

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

  async login(email: string, password: string): Promise<boolean> {
    if (this.DEMO_MODE) {
      const demoUser: UserData = {
        email: email,
        displayName: email.split('@')[0]
      };
      this.saveToStorage(demoUser);
      return true;
    }
    return false;
  }

  async register(email: string, password: string, displayName?: string): Promise<boolean> {
    if (this.DEMO_MODE) {
      const demoUser: UserData = {
        email: email,
        displayName: displayName || email.split('@')[0]
      };
      this.saveToStorage(demoUser);
      return true;
    }
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

export const authService = new AuthService();
