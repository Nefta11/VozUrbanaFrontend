/**
 * useNetworkStatus - Hook para detectar el estado de la conexión a internet
 *
 * Detecta automáticamente cuando el navegador pierde o recupera conexión
 * y puede ejecutar callbacks personalizados en cada evento
 */

import { useState, useEffect } from 'react';

const useNetworkStatus = (options = {}) => {
  const {
    onOnline = null,
    onOffline = null,
    checkInterval = null // Opcional: intervalo en ms para verificar conexión
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Handlers para eventos del navegador
    const handleOnline = () => {
      console.log('✅ Conexión a internet restaurada');
      setIsOnline(true);

      // Si estábamos offline, notificar que volvimos online
      if (wasOffline) {
        setWasOffline(false);
        if (onOnline) {
          onOnline();
        }
      }
    };

    const handleOffline = () => {
      console.log('❌ Conexión a internet perdida');
      setIsOnline(false);
      setWasOffline(true);

      if (onOffline) {
        onOffline();
      }
    };

    // Registrar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Opcional: verificación periódica adicional
    let intervalId;
    if (checkInterval) {
      intervalId = setInterval(() => {
        const currentStatus = navigator.onLine;
        if (currentStatus !== isOnline) {
          if (currentStatus) {
            handleOnline();
          } else {
            handleOffline();
          }
        }
      }, checkInterval);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOnline, wasOffline, onOnline, onOffline, checkInterval]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline
  };
};

export default useNetworkStatus;
