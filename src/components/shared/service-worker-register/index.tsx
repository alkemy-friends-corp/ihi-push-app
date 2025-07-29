import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔧 Registering service worker...');
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('✅ Service worker registered successfully:', registration);

          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service worker is ready');

          // Set up message listener for service worker communication
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📱 Service Worker message received:', event.data);
          });

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service worker update found');
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New service worker installed, refresh to activate');
                }
              });
            }
          });

        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
        }
      } else {
        console.warn('⚠️ Service Worker not supported');
      }
    };

    registerServiceWorker();
  }, []);

  return null;
} 