import { messaging } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';

export interface NotificationPermission {
  location: 'granted' | 'denied' | 'prompt';
  notification: 'granted' | 'denied' | 'prompt';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

class FCMService {
  private vapidKey: string;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
    this.checkSupport();
    this.autoInitialize();
  }

  private async checkSupport() {
    try {
      const { isSupported } = await import('firebase/messaging');
      this.isSupported = await isSupported();
    } catch (error) {
      console.warn('FCM not supported:', error);
      this.isSupported = false;
    }
  }

  private async autoInitialize() {
    if (typeof window !== 'undefined') {
      console.log('🚀 Auto-initializing FCM service...');
      await this.initialize();
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('FCM not supported on this platform');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.isSupported || !messaging) {
      console.warn('FCM not supported or messaging not initialized');
      return null;
    }

    try {
      const token = await getToken(messaging, {
        vapidKey: this.vapidKey,
      });
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async setupForegroundHandler() {
    if (!this.isSupported || !messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification using browser's notification API
      if (Notification.permission === 'granted') {
        const notification = new Notification(payload.notification?.title || 'New Message', {
          body: payload.notification?.body,
          icon: payload.notification?.icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.data?.tag || 'default',
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }

      // Show toast notification
      toast(payload.notification?.title || 'New Message', {
        description: payload.notification?.body,
        duration: 5000,
      });
    });
  }

  async setupBackgroundHandler() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('FCM service already initialized');
      return true;
    }

    await this.checkSupport();
    
    if (!this.isSupported) {
      console.warn('FCM not supported on this platform');
      return false;
    }

    try {
      await this.setupForegroundHandler();
      await this.setupBackgroundHandler();
      
      this.isInitialized = true;
      console.log('✅ FCM service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing FCM service:', error);
      return false;
    }
  }

  isNotificationSupported(): boolean {
    return this.isSupported && 'Notification' in window;
  }

  getCurrentPermissionStatus(): NotificationPermission['notification'] {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission as NotificationPermission['notification'];
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const fcmService = new FCMService(); 