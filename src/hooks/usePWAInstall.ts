import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      // Solo mostrar si NO está en modo standalone
      if (!standalone) {
        setIsInstallable(true);
      }
    };

    checkStandalone();

    // Escuchar el evento beforeinstallprompt (Chrome/Edge/Android)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (deferredPrompt) {
      // Chrome/Edge/Android - mostrar prompt nativo
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else if (isIOS || isSafari) {
      // iOS Safari - mostrar instrucciones
      alert('📱 PARA INSTALAR EN IPHONE/IOS:\n\n1. Pulsa el botón "Compartir" (icono del cuadrado con flecha arriba)\n2. Desliza hacia abajo y pulsa "Añadir a pantalla de inicio"\n3. Pulsa "Añadir"');
    } else if (isAndroid) {
      // Android Chrome - mostrar instrucciones
      alert('📱 PARA INSTALAR EN ANDROID:\n\n1. Pulsa el botón de menú (3 puntos arriba a la derecha)\n2. Selecciona "Agregar a pantalla de inicio" o "Instalar app"\n3. Pulsa "Agregar"');
    } else {
      // Desktop/otros navegadores
      alert('💻 PARA INSTALAR:\n\nChrome/Edge: Pulsa el icono ➕ en la barra de direcciones\n\nSafari: Archivo > Añadir a Dock\n\nFirefox: Usa el menú ⋮ > Instalar');
    }
  };

  return { isInstallable, installPWA, isStandalone };
}
