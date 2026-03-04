import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevenir que el navegador muestre su propio prompt
      e.preventDefault();
      // Guardar el evento para dispararlo luego
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verificar si ya está en modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      // Guía manual para iOS y navegadores que no soportan el prompt automático
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert('PARA INSTALAR EN IPHONE:\n1. Pulsa el botón "Compartir" (el icono del cuadrado con flecha abajo).\n2. Desliza hacia abajo y pulsa "Añadir a pantalla de inicio".');
      } else {
        alert('PARA INSTALAR:\nPulsa los tres puntos del navegador y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".');
      }
      return;
    }
    
    // Mostrar el prompt nativo guardado
    deferredPrompt.prompt();
    
    // Esperar a la elección del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: El usuario eligió ${outcome}`);
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, installPWA };
}
