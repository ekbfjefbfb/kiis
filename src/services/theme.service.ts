/**
 * Theme Service — gestiona dark mode con persistencia en localStorage.
 * Paleta: Indigo primario + neutrales cálidos — nada más.
 */

type Theme = 'light' | 'dark' | 'system';

class ThemeService {
  private readonly STORAGE_KEY = 'notdeer_theme';
  private listeners: Array<(isDark: boolean) => void> = [];

  constructor() {
    this.applyTheme(this.getTheme());
    // Escuchar cambios del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getTheme() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  getTheme(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) || 'system';
  }

  isDark(): boolean {
    const theme = this.getTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
    this.notifyListeners();
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  onChange(listener: (isDark: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private applyTheme(theme: Theme): void {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private notifyListeners(): void {
    const dark = this.isDark();
    this.listeners.forEach(l => l(dark));
  }
}

export const themeService = new ThemeService();
