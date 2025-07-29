import { useState, useEffect, useCallback } from 'react';
import { fcmService, NotificationPermission, LocationData } from '@/lib/notifications/fcm-service';
import { locationService } from '@/lib/permissions/location-service';
import { locationTracker, LocationLog } from '@/lib/permissions/location-tracker';
import { toast } from 'sonner';

export interface PermissionState {
  location: NotificationPermission['location'];
  notification: NotificationPermission['notification'];
  isLoading: boolean;
  locationData: LocationData | null;
  fcmToken: string | null;
  isTracking: boolean;
  locationLogs: LocationLog[];
}

export const usePermissions = () => {
  const [state, setState] = useState<PermissionState>({
    location: 'prompt',
    notification: 'prompt',
    isLoading: false,
    locationData: null,
    fcmToken: null,
    isTracking: false,
    locationLogs: [],
  });

  const checkPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check notification permission
      const notificationStatus = fcmService.getCurrentPermissionStatus();
      
      // Check location permission (we'll try to get position to determine status)
      let locationStatus: NotificationPermission['location'] = 'prompt';
      try {
        const locationData = await locationService.getCurrentPosition();
        locationStatus = 'granted';
        setState(prev => ({ ...prev, locationData }));
      } catch {
        locationStatus = 'denied';
      }

      // Try to load FCM token from localStorage
      let fcmToken = null;
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('fcmToken');
        if (storedToken) {
          fcmToken = storedToken;
          console.log('🔑 FCM token loaded from localStorage:', storedToken.substring(0, 20) + '...');
        }
      }

      setState(prev => ({
        ...prev,
        location: locationStatus,
        notification: notificationStatus,
        fcmToken,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const granted = await locationService.requestLocationPermission();
      
      if (granted) {
        const locationData = await locationService.getCurrentPosition();
        setState(prev => ({
          ...prev,
          location: 'granted',
          locationData,
          isLoading: false,
        }));
        
        // Update location tracker with current FCM token if available
        if (state.fcmToken) {
          locationTracker.setFCMToken(state.fcmToken);
        }
        
        toast.success('Location permission granted');
        return true;
      } else {
        setState(prev => ({
          ...prev,
          location: 'denied',
          isLoading: false,
        }));
        toast.error('Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setState(prev => ({
        ...prev,
        location: 'denied',
        isLoading: false,
      }));
      toast.error('Failed to get location permission');
      return false;
    }
  }, [state.fcmToken]);

  const requestNotificationPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Initialize FCM service
      const initialized = await fcmService.initialize();
      
      if (!initialized) {
        setState(prev => ({
          ...prev,
          notification: 'denied',
          isLoading: false,
        }));
        toast.error('Push notifications not supported on this device');
        return false;
      }

      const granted = await fcmService.requestNotificationPermission();
      
              if (granted) {
          const fcmToken = await fcmService.getFCMToken();
          setState(prev => ({
            ...prev,
            notification: 'granted',
            fcmToken,
            isLoading: false,
          }));
          
          // Save FCM token to localStorage
          if (fcmToken && typeof window !== 'undefined') {
            localStorage.setItem('fcmToken', fcmToken);
            console.log('💾 FCM token saved to localStorage:', fcmToken.substring(0, 20) + '...');
          }
          
          // Update location tracker with FCM token
          locationTracker.setFCMToken(fcmToken);
          
          toast.success('Notification permission granted');
          return true;
        } else {
        setState(prev => ({
          ...prev,
          notification: 'denied',
          isLoading: false,
        }));
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        notification: 'denied',
        isLoading: false,
      }));
      toast.error('Failed to get notification permission');
      return false;
    }
  }, []);

  const requestAllPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [locationGranted, notificationGranted] = await Promise.all([
        requestLocationPermission(),
        requestNotificationPermission(),
      ]);

      if (locationGranted && notificationGranted) {
        toast.success('All permissions granted successfully!');
      } else if (locationGranted || notificationGranted) {
        toast.info('Some permissions were granted');
      } else {
        toast.error('No permissions were granted');
      }

      return { locationGranted, notificationGranted };
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      toast.error('Failed to request permissions');
      return { locationGranted: false, notificationGranted: false };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [requestLocationPermission, requestNotificationPermission]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const startLocationTracking = useCallback(() => {
    if (state.location === 'granted') {
      locationTracker.startTracking(10000, (log: LocationLog) => {
        setState(prev => ({
          ...prev,
          locationLogs: [...prev.locationLogs, log].slice(-10), // Keep last 10 logs
        }));
      });
      setState(prev => ({ ...prev, isTracking: true }));
      toast.success('Location tracking started - check console for updates');
    } else {
      toast.error('Location permission required to start tracking');
    }
  }, [state.location]);

  const stopLocationTracking = useCallback(() => {
    locationTracker.stopTracking();
    setState(prev => ({ ...prev, isTracking: false }));
    toast.info('Location tracking stopped');
  }, []);

  return {
    ...state,
    requestLocationPermission,
    requestNotificationPermission,
    requestAllPermissions,
    checkPermissions,
    startLocationTracking,
    stopLocationTracking,
  };
}; 