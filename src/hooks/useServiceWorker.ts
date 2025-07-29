import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isReady: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isReady: false,
    registration: null,
  });

  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
      }

      setState(prev => ({ ...prev, isSupported: true }));

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState(prev => ({ 
          ...prev, 
          isRegistered: true, 
          registration 
        }));

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        
        setState(prev => ({ ...prev, isReady: true }));
        
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  return state;
}; 