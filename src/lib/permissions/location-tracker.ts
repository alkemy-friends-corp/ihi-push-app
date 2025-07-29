import { LocationData, PushSubscription } from '../notifications/fcm-service';
import { locationService } from './location-service';
import { pushNotificationService } from '../notifications/fcm-service';
import { UAParser } from 'ua-parser-js';

export interface LocationLog {
  location: LocationData;
  pushSubscription: PushSubscription | null;
  timestamp: number;
}

export interface DeviceInfo {
  deviceName: string;
  deviceType: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  userAgent: string;
}

class LocationTracker {
  private intervalId: NodeJS.Timeout | null = null;
  private pushSubscription: PushSubscription | null = null;
  private isTracking: boolean = false;
  private onLocationUpdate?: (log: LocationLog) => void;
  private deviceInfo: DeviceInfo | null = null;
  private isOnline: boolean = true;
  private isFirstVisit: boolean = true;

  constructor() {
    this.setupNetworkListeners();
    this.initializeDeviceInfo();
    this.checkFirstVisit();
  }

  private checkFirstVisit() {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisitedBefore');
      this.isFirstVisit = !hasVisited;
      if (this.isFirstVisit) {
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    }
  }

  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      const handleOnline = () => {
        this.isOnline = true;
        console.log('🌐 Network: Online');
      };

      const handleOffline = () => {
        this.isOnline = false;
        console.log('🌐 Network: Offline');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Set initial status
      this.isOnline = navigator.onLine;
    }
  }

  private initializeDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      // Return default device info for server-side rendering
      this.deviceInfo = {
        deviceName: 'Unknown Device',
        deviceType: 'desktop',
        browserName: 'Unknown Browser',
        browserVersion: 'Unknown Version',
        osName: 'Unknown OS',
        osVersion: 'Unknown Version',
        userAgent: 'Unknown',
      };
      return this.deviceInfo;
    }

    const userAgent = navigator.userAgent;
    const parser = new UAParser();
    const result = parser.setUA(userAgent).getResult();

    this.deviceInfo = {
      deviceName: result.device.model || 'Unknown Device',
      deviceType: result.device.type || 'desktop',
      browserName: result.browser.name || 'Unknown Browser',
      browserVersion: result.browser.version || 'Unknown Version',
      osName: result.os.name || 'Unknown OS',
      osVersion: result.os.version || 'Unknown Version',
      userAgent,
    };

    return this.deviceInfo;
  }



  setPushSubscription(subscription: PushSubscription | null) {
    this.pushSubscription = subscription;
    console.log('🔑 Push subscription set in location tracker:', subscription ? 'Set' : 'null');
  }

  async startTracking(intervalMs: number = 20000, callback?: (log: LocationLog) => void) {
    if (this.isTracking) {
      console.log('Location tracking is already active');
      return;
    }

    this.onLocationUpdate = callback;
    this.isTracking = true;

    // Try to get push subscription if not set
    if (!this.pushSubscription) {
      const subscription = await pushNotificationService.getPushSubscription();
      this.pushSubscription = subscription;
      console.log('🔑 Push subscription loaded:', subscription ? 'Set' : 'Not available');
    }

    // Get initial location and send immediately
    await this.getAndLogLocation();

    // Set up interval for periodic location updates (20 seconds)
    this.intervalId = setInterval(() => {
      this.getAndLogLocation();
    }, intervalMs);

    console.log(`📍 Location tracking started - getting location every ${intervalMs / 1000} seconds`);
  }

  stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    this.onLocationUpdate = undefined;
    console.log('📍 Location tracking stopped');
  }

  // Send location immediately when user visits (called on page load)
  async sendImmediateLocation(): Promise<boolean> {
    try {
      console.log('🚀 Sending immediate location on user visit...');
      
      // Get push subscription if not available
      if (!this.pushSubscription) {
        const subscription = await pushNotificationService.getPushSubscription();
        this.pushSubscription = subscription;
      }

      const location = await locationService.getCurrentPosition();
      
      if (location) {
        const log: LocationLog = {
          location,
          pushSubscription: this.pushSubscription,
          timestamp: Date.now(),
        };

        // Console log the location data
        console.log('📍 Immediate Location Update:', {
          coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
          accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown',
          pushSubscription: this.pushSubscription ? 'Available' : 'Not available',
          timestamp: new Date(log.timestamp).toLocaleTimeString(),
          online: this.isOnline,
          isFirstVisit: this.isFirstVisit,
        });

        // Send to server immediately
        if (this.isOnline) {
          await this.sendLocationToServer(log, 'immediate');
        } else {
          console.log('🌐 Offline - immediate location data cached for later transmission');
        }

        return true;
      } else {
        console.warn('⚠️ Could not get immediate location data');
        return false;
      }
    } catch (error) {
      console.error('❌ Error getting immediate location:', error);
      return false;
    }
  }

  private async getAndLogLocation() {
    try {
      const location = await locationService.getCurrentPosition();
      
      if (location) {
        const log: LocationLog = {
          location,
          pushSubscription: this.pushSubscription,
          timestamp: Date.now(),
        };

        // Console log the location data
        console.log('📍 Location Update:', {
          coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
          accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown',
          pushSubscription: this.pushSubscription ? 'Available' : 'Not available',
          timestamp: new Date(log.timestamp).toLocaleTimeString(),
          online: this.isOnline,
        });

        // Call callback if provided
        if (this.onLocationUpdate) {
          this.onLocationUpdate(log);
        }

        // Send to server if online
        if (this.isOnline) {
          await this.sendLocationToServer(log, 'periodic');
        } else {
          console.log('🌐 Offline - location data cached for later transmission');
        }
      } else {
        console.warn('⚠️ Could not get location data');
      }
    } catch (error) {
      console.error('❌ Error getting location:', error);
    }
  }

  private async sendLocationToServer(log: LocationLog, type: 'immediate' | 'periodic') {
    try {
      const deviceInfo = this.initializeDeviceInfo();
      
      const payload = {
        location: log.location,
        pushSubscription: log.pushSubscription,
        timestamp: log.timestamp,
        deviceInfo,
        online: this.isOnline,
        type: type, // 'immediate' or 'periodic'
        isFirstVisit: this.isFirstVisit,
      };

      // You can replace this with your actual API endpoint
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ Location data sent to server (${type})`);
      } else {
        console.warn(`⚠️ Failed to send location data to server (${type}):`, response.status);
      }
    } catch (error) {
      console.error(`❌ Error sending location to server (${type}):`, error);
    }
  }

  async registerDevice(): Promise<boolean> {
    try {
      const deviceInfo = this.initializeDeviceInfo();
      
      // Get push subscription if not available
      if (!this.pushSubscription) {
        const subscription = await pushNotificationService.getPushSubscription();
        this.pushSubscription = subscription;
      }
      
      const payload = {
        pushSubscription: this.pushSubscription,
        deviceInfo,
        timestamp: Date.now(),
        isFirstVisit: this.isFirstVisit,
      };

      // You can replace this with your actual device registration endpoint
      const response = await fetch('/api/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Device registered successfully');
        return true;
      } else {
        console.warn('⚠️ Failed to register device:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error registering device:', error);
      return false;
    }
  }

  isActive(): boolean {
    return this.isTracking;
  }

  getCurrentPushSubscription(): PushSubscription | null {
    return this.pushSubscription;
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  isFirstTimeVisit(): boolean {
    return this.isFirstVisit;
  }
}

export const locationTracker = new LocationTracker(); 