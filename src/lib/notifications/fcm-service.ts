

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

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'foreground' | 'background' | 'service-worker';
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private vapidKey: string;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;
  private notificationHistory: NotificationItem[] = [];
  private onNotificationReceived?: (notification: NotificationItem) => void;
  private pushSubscription: PushSubscription | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    // Use environment variable or fallback to hardcoded key
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 
      "BGEFnqs0ocBjQ0ZRsDCVOWiTVNrxLzNQpuFknAS4J3A3-QuD_AljESFgqR5EkKin3cDUPhaZDoG1tnOk765RUrE";
    
    // Only check support and auto-initialize in browser environment
    if (typeof window !== 'undefined') {
      this.checkSupport();
      this.autoInitialize();
    }
  }

  private async checkSupport() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.isSupported = false;
      return;
    }
    
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!this.isSupported) {
      console.warn('Push API not supported on this platform');
    }
  }

  private async autoInitialize() {
    if (typeof window !== 'undefined') {
      console.log('🚀 Auto-initializing Push Notification service...');
      await this.initialize();
    }
  }

  private addNotificationToHistory(title: string, body: string, type: NotificationItem['type']) {
    const notification: NotificationItem = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: new Date().toLocaleString(),
      type,
    };

    this.notificationHistory.unshift(notification);
    // Keep only last 50 notifications
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    // Call callback if provided
    if (this.onNotificationReceived) {
      this.onNotificationReceived(notification);
    }

    return notification;
  }

  setNotificationCallback(callback: (notification: NotificationItem) => void) {
    this.onNotificationReceived = callback;
  }

  getNotificationHistory(): NotificationItem[] {
    return [...this.notificationHistory];
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push API not supported on this platform');
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

  // Convert VAPID key to Uint8Array for Web Push API
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get Push Subscription (Native Web Push API)
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      console.warn('Push API not supported');
      return null;
    }

    try {
      // Register service worker if not already registered
      if (!this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered for push subscription');
      }

      // Check if already subscribed
      let subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('🔍 Creating new push subscription...');
        
        // Convert VAPID key to Uint8Array
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidKey);
        
        // Subscribe to push notifications
        subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        console.log('✅ Push subscription created');
      } else {
        console.log('✅ Existing push subscription found');
      }

      // Convert to our format
      this.pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, 
            Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
          auth: btoa(String.fromCharCode.apply(null, 
            Array.from(new Uint8Array(subscription.getKey('auth')!))))
        }
      };

      console.log('📋 Push subscription details:', {
        endpoint: this.pushSubscription.endpoint.substring(0, 50) + '...',
        p256dh: this.pushSubscription.keys.p256dh.substring(0, 20) + '...',
        auth: this.pushSubscription.keys.auth.substring(0, 20) + '...'
      });

      return this.pushSubscription;
    } catch (error) {
      console.error('❌ Error getting push subscription:', error);
      return null;
    }
  }

  async setupBackgroundHandler() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
            const { title, body } = event.data;
            this.addNotificationToHistory(title, body, 'background');
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('Push Notification service already initialized');
      return true;
    }

    await this.checkSupport();
    
    if (!this.isSupported) {
      console.warn('Push API not supported on this platform');
      return false;
    }

    try {
      await this.setupBackgroundHandler();
      
      this.isInitialized = true;
      console.log('✅ Push Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Push Notification service:', error);
      return false;
    }
  }

  async testNotification(): Promise<boolean> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from the PWA app',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test',
      });

      // Auto-close after 3 seconds
      setTimeout(() => notification.close(), 3000);

      // Add to history
      this.addNotificationToHistory('Test Notification', 'This is a test notification from the PWA app', 'foreground');

      return true;
    } catch (error) {
      console.error('Error showing test notification:', error);
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

  getVAPIDKey(): string {
    return this.vapidKey;
  }

  getCurrentPushSubscription(): PushSubscription | null {
    return this.pushSubscription;
  }
}

export const pushNotificationService = new PushNotificationService(); 