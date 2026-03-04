import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Si no hay preferencia guardada, usamos el esquema del sistema
    if (!saved) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return saved === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Forzamos la limpieza de clases previas para evitar conflictos
    root.classList.remove('dark', 'light');
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return { isDark, toggleDarkMode };
}
