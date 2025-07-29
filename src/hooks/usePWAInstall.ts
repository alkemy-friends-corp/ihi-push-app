import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Navigator interface for iOS standalone mode
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (typeof window !== 'undefined') {
        // Check if running in standalone mode (installed PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInStandaloneMode = window.navigator.standalone === true;
        setIsInstalled(isStandalone || isInStandaloneMode);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered: ', registration);
        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      }
    };

    checkIfInstalled();
    registerServiceWorker();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during install:', error);
      return false;
    }
  };

  const showInstallInstructions = () => {
    // Detect platform and show appropriate instructions
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      // iOS Safari
      alert('To install this app on your iPhone/iPad:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
    } else if (/android/.test(userAgent)) {
      // Android Chrome
      alert('To install this app on your Android device:\n\n1. Tap the menu button (three dots)\n2. Tap "Add to Home screen"\n3. Tap "Add" to confirm');
    } else {
      // Desktop browsers
      alert('To install this app:\n\n1. Look for the install icon in your browser\'s address bar\n2. Click the install icon\n3. Follow the prompts to install');
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    showInstallInstructions,
  };
}; 