export class AuthService {
    constructor() {
        this.currentUser = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.ACCESS_TOKEN_KEY = 'access_token';
        this.REFRESH_TOKEN_KEY = 'refresh_token';
        this.USER_KEY = 'current_user';
        this.DEMO_MODE = true; // Modo demo sin backend
        this.loadFromStorage();
    }
    loadFromStorage() {
        this.accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        this.refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
        }
    }
    saveToStorage(user) {
        this.accessToken = 'demo_token_' + Date.now();
        this.refreshToken = 'demo_refresh_' + Date.now();
        this.currentUser = user;
        localStorage.setItem(this.ACCESS_TOKEN_KEY, this.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, this.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
    }
    async loginWithGoogle() {
        if (this.DEMO_MODE) {
            // Modo demo sin backend
            const demoUser = {
                email: 'demo@notdeer.app',
                displayName: 'Usuario Demo'
            };
            this.saveToStorage(demoUser);
            return true;
        }
        try {
            const google = window.google;
            if (!google) {
                console.error('Google Sign-In no está cargado');
                return false;
            }
            return new Promise((resolve) => {
                google.accounts.id.initialize({
                    client_id: 'YOUR_GOOGLE_CLIENT_ID',
                    callback: async (response) => {
                        try {
                            const result = await this.sendOAuthToken('google', response.credential);
                            resolve(result);
                        }
                        catch (error) {
                            console.error('Error en OAuth:', error);
                            resolve(false);
                        }
                    }
                });
                google.accounts.id.prompt();
            });
        }
        catch (error) {
            console.error('Error en login con Google:', error);
            return false;
        }
    }
    async sendOAuthToken(provider, idToken) {
        // Implementar cuando tengas backend
        return false;
    }
    async register(email, password, displayName) {
        console.log('Register called:', { email, displayName, DEMO_MODE: this.DEMO_MODE });
        if (this.DEMO_MODE) {
            // Modo demo sin backend
            const demoUser = {
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
    async login(email, password) {
        if (this.DEMO_MODE) {
            // Modo demo sin backend
            const demoUser = {
                email: email,
                displayName: email.split('@')[0]
            };
            this.saveToStorage(demoUser);
            return true;
        }
        return false;
    }
    async refreshAccessToken() {
        if (this.DEMO_MODE)
            return true;
        return false;
    }
    async logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.currentUser = null;
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
    isAuthenticated() {
        return !!this.currentUser;
    }
    getCurrentUser() {
        return this.currentUser;
    }
    getAccessToken() {
        return this.accessToken;
    }
    async getValidToken() {
        return this.accessToken;
    }
}
