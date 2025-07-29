import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, NotificationPermission, LocationData, PushSubscription } from '@/lib/notifications/fcm-service';
import { locationService } from '@/lib/permissions/location-service';
import { locationTracker, LocationLog } from '@/lib/permissions/location-tracker';
import { toast } from 'sonner';

export interface PermissionState {
  location: NotificationPermission['location'];
  notification: NotificationPermission['notification'];
  isLoading: boolean;
  locationData: LocationData | null;
  pushSubscription: PushSubscription | null;
  isTracking: boolean;
  locationLogs: LocationLog[];
  isFirstVisit: boolean;
}

export const usePermissions = () => {
  const [state, setState] = useState<PermissionState>({
    location: 'prompt',
    notification: 'prompt',
    isLoading: false,
    locationData: null,
    pushSubscription: null,
    isTracking: false,
    locationLogs: [],
    isFirstVisit: false,
  });

  const checkPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check notification permission
      const notificationStatus = pushNotificationService.getCurrentPermissionStatus();
      
      // Check location permission (we'll try to get position to determine status)
      let locationStatus: NotificationPermission['location'] = 'prompt';
      try {
        const locationData = await locationService.getCurrentPosition();
        locationStatus = 'granted';
        setState(prev => ({ ...prev, locationData }));
      } catch {
        locationStatus = 'denied';
      }

      // Try to load push subscription
      let pushSubscription = null;
      const subscription = pushNotificationService.getCurrentPushSubscription();
      if (subscription) {
        pushSubscription = subscription;
        console.log('🔑 Push subscription loaded:', 'Available');
      }

      // Check if first visit
      const isFirstVisit = locationTracker.isFirstTimeVisit();

      setState(prev => ({
        ...prev,
        location: locationStatus,
        notification: notificationStatus,
        pushSubscription,
        isFirstVisit,
        isLoading: false,
      }));

      // Send immediate location if permissions are granted
      if (locationStatus === 'granted') {
        await locationTracker.sendImmediateLocation();
      }
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
        
        // Update location tracker with current push subscription if available
        if (state.pushSubscription) {
          locationTracker.setPushSubscription(state.pushSubscription);
        }
        
        // Send immediate location
        await locationTracker.sendImmediateLocation();
        
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
  }, [state.pushSubscription]);

  const requestNotificationPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Initialize push notification service
      const initialized = await pushNotificationService.initialize();
      
      if (!initialized) {
        setState(prev => ({
          ...prev,
          notification: 'denied',
          isLoading: false,
        }));
        toast.error('Push notifications not supported on this device');
        return false;
      }

      const granted = await pushNotificationService.requestNotificationPermission();
      
      if (granted) {
        const pushSubscription = await pushNotificationService.getPushSubscription();
        setState(prev => ({
          ...prev,
          notification: 'granted',
          pushSubscription,
          isLoading: false,
        }));
        
        // Update location tracker with push subscription
        locationTracker.setPushSubscription(pushSubscription);
        
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
      locationTracker.startTracking(20000, (log: LocationLog) => {
        setState(prev => ({
          ...prev,
          locationLogs: [...prev.locationLogs, log].slice(-10), // Keep last 10 logs
        }));
      });
      setState(prev => ({ ...prev, isTracking: true }));
      toast.success('Location tracking started - updates every 20 seconds');
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