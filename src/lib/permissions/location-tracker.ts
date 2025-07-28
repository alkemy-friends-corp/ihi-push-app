import { LocationData } from '../notifications/fcm-service';
import { locationService } from './location-service';

export interface LocationLog {
  location: LocationData;
  fcmToken: string | null;
  timestamp: number;
}

class LocationTracker {
  private intervalId: NodeJS.Timeout | null = null;
  private fcmToken: string | null = null;
  private isTracking: boolean = false;
  private onLocationUpdate?: (log: LocationLog) => void;

  setFCMToken(token: string | null) {
    this.fcmToken = token;
  }

  startTracking(intervalMs: number = 10000, callback?: (log: LocationLog) => void) {
    if (this.isTracking) {
      console.log('Location tracking is already active');
      return;
    }

    this.onLocationUpdate = callback;
    this.isTracking = true;

    // Try to get FCM token from localStorage if not set
    if (!this.fcmToken && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('fcmToken');
      if (storedToken) {
        this.fcmToken = storedToken;
        console.log('🔑 FCM token loaded from localStorage:', storedToken.substring(0, 20) + '...');
      }
    }

    // Get initial location
    this.getAndLogLocation();

    // Set up interval for periodic location updates
    this.intervalId = setInterval(() => {
      this.getAndLogLocation();
    }, intervalMs);

    console.log(`Location tracking started - getting location every ${intervalMs / 1000} seconds`);
  }

  stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    this.onLocationUpdate = undefined;
    console.log('Location tracking stopped');
  }

  private async getAndLogLocation() {
    try {
      const location = await locationService.getCurrentPosition();
      
      if (location) {
        const log: LocationLog = {
          location,
          fcmToken: this.fcmToken,
          timestamp: Date.now(),
        };

        // Console log the location data
        console.log('📍 Location Update:', {
          coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
          accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown',
          fcmToken: this.fcmToken ? `${this.fcmToken.substring(0, 20)}...` : 'Not available',
          timestamp: new Date(log.timestamp).toLocaleTimeString(),
        });

        // Call callback if provided
        if (this.onLocationUpdate) {
          this.onLocationUpdate(log);
        }
      } else {
        console.warn('⚠️ Could not get location data');
      }
    } catch (error) {
      console.error('❌ Error getting location:', error);
    }
  }

  isActive(): boolean {
    return this.isTracking;
  }

  getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }
}

export const locationTracker = new LocationTracker(); 