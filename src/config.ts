// Backend API Configuration - Auto-connect
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000',
  AUTH_URL: '',
  CHAT_URL: '',
  SEARCH_URL: '',
  WS_URL: ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws')
};

export const OAUTH_CONFIG = {
  GOOGLE_CLIENT_ID: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
};
