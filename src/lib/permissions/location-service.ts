import { LocationData } from '../notifications/fcm-service';

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation not supported');
      return false;
    }

    try {
      const position = await this.getCurrentPosition();
      return !!position;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<LocationData | null> {
    if (!('geolocation' in navigator)) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute cache
        }
      );
    });
  }

  async watchPosition(
    onSuccess: (location: LocationData) => void,
    onError?: (error: GeolocationPositionError) => void
  ): Promise<number | null> {
    if (!('geolocation' in navigator)) {
      return null;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          onSuccess(locationData);
        },
        (error) => {
          console.error('Geolocation watch error:', error);
          onError?.(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // 30 seconds cache for watching
        }
      );

      return watchId;
    } catch (error) {
      console.error('Error setting up location watch:', error);
      return null;
    }
  }

  clearWatch(watchId: number): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  isLocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  getCurrentPermissionStatus(): 'granted' | 'denied' | 'prompt' {
    if (!('geolocation' in navigator)) {
      return 'denied';
    }
    return 'prompt';
  }
}

export const locationService = new LocationService(); 