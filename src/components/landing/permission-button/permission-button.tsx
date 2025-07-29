import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Badge } from '@/components/shadcn/badge';
import { Bell, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Wifi, WifiOff, Copy, RefreshCw } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

// Enhanced device detection
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Simple device detection without external library
  let deviceName = 'Unknown Device';
  let deviceType = 'desktop';
  let browserName = 'Unknown Browser';
  let browserVersion = 'Unknown';
  let osName = 'Unknown OS';
  let osVersion = 'Unknown';

  // Detect OS
  if (userAgent.includes('Android')) {
    osName = 'Android';
    deviceType = 'mobile';
    const androidMatch = userAgent.match(/Android\s+(\d+(?:\.\d+)*)/);
    if (androidMatch) osVersion = androidMatch[1];
    
    // Try to get device model
    const deviceMatch = userAgent.match(/;\s*([^;)]+)\s*\)/);
    if (deviceMatch && deviceMatch[1]) {
      const deviceModel = deviceMatch[1].trim();
      if (!deviceModel.includes('Mobile') && !deviceModel.includes('Safari')) {
        deviceName = deviceModel;
      } else {
        deviceName = `Android Device (${osVersion})`;
      }
    } else {
      deviceName = `Android Device (${osVersion})`;
    }
  } else if (userAgent.includes('iPhone')) {
    osName = 'iOS';
    deviceType = 'mobile';
    deviceName = 'iPhone';
    const iosMatch = userAgent.match(/OS\s+(\d+_\d+)/);
    if (iosMatch) osVersion = iosMatch[1].replace('_', '.');
  } else if (userAgent.includes('iPad')) {
    osName = 'iOS';
    deviceType = 'tablet';
    deviceName = 'iPad';
    const iosMatch = userAgent.match(/OS\s+(\d+_\d+)/);
    if (iosMatch) osVersion = iosMatch[1].replace('_', '.');
  } else if (userAgent.includes('Windows')) {
    osName = 'Windows';
    const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (windowsMatch) osVersion = windowsMatch[1];
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS';
    const macMatch = userAgent.match(/Mac OS X (\d+_\d+)/);
    if (macMatch) osVersion = macMatch[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux';
  }

  // Detect browser
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch) browserVersion = chromeMatch[1];
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    const safariMatch = userAgent.match(/Version\/(\d+)/);
    if (safariMatch) browserVersion = safariMatch[1];
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
    if (firefoxMatch) browserVersion = firefoxMatch[1];
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
    const edgeMatch = userAgent.match(/Edge\/(\d+)/);
    if (edgeMatch) browserVersion = edgeMatch[1];
  }

  return {
    deviceName,
    deviceType,
    browserName,
    browserVersion,
    osName,
    osVersion,
    userAgent: userAgent
  };
};

// VAPID public key
const VAPID_PUBLIC_KEY = 'BGEFnqs0ocBjQ0ZRsDCVOWiTVNrxLzNQpuFknAS4J3A3-QuD_AljESFgqR5EkKin3cDUPhaZDoG1tnOk765RUrE';

// Convert VAPID key
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
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
};

export function PermissionButton() {
  const { t } = useTranslations();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number; accuracy?: number} | null>(null);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  const [updateCount, setUpdateCount] = useState(0);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'active' | 'inactive'>('inactive');

  // Initialize component
  useEffect(() => {
    initializeComponent();
    setupNetworkListener();
    setupServiceWorkerListener();
  }, []);

  const initializeComponent = async () => {
    try {
      // Get device info
      const device = getDeviceInfo();
      setDeviceInfo(device);

      // Check current permissions
      setNotificationPermission(Notification.permission);
      await checkLocationPermission();

      // Check for existing push subscription
      await checkExistingSubscription();

      // Check service worker status
      await checkServiceWorkerStatus();
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  };

  const setupNetworkListener = () => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const setupServiceWorkerListener = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Service Worker message:', event.data);
        
        switch (event.data.type) {
          case 'TRACKING_INITIALIZED':
            setIsTracking(true);
            break;
          case 'TRACKING_STOPPED':
            setIsTracking(false);
            break;
          case 'LOCATION_UPDATE_SUCCESS':
            setCurrentLocation(event.data.data);
            setLastUpdate(new Date().toLocaleTimeString());
            setUpdateCount(prev => prev + 1);
            break;
          case 'BACKGROUND_TRACKING_STARTED':
            setIsTracking(true);
            setPushSubscription({ endpoint: event.data.endpoint } as PushSubscription);
            break;
        }
      });
    }
  };

  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      setLocationPermission('prompt');
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
    } catch (error) {
      setLocationPermission('prompt');
    }
  };

  const checkExistingSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setPushSubscription(subscription);
        console.log('Found existing push subscription');
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      setServiceWorkerStatus(registration.active ? 'active' : 'inactive');
    } catch (error) {
      console.error('Error checking service worker status:', error);
    }
  };

  const handleConsentClick = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting consent process...');
      
      // Step 1: Request notification permission
      console.log('📱 Step 1: Requesting notification permission...');
      const notificationGranted = await requestNotificationPermission();
      if (!notificationGranted) {
        throw new Error('Notification permission denied');
      }
      console.log('✅ Notification permission granted');

      // Step 2: Request location permission
      console.log('📍 Step 2: Requesting location permission...');
      const locationGranted = await requestLocationPermission();
      if (!locationGranted) {
        throw new Error('Location permission denied');
      }
      console.log('✅ Location permission granted');

      // Step 3: Get current location
      console.log('📍 Step 3: Getting current location...');
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      console.log('✅ Current location obtained:', location);

      // Step 4: Create push subscription
      console.log('🔑 Step 4: Creating push subscription...');
      const subscription = await createPushSubscription();
      if (!subscription) {
        throw new Error('Failed to create push subscription');
      }
      console.log('✅ Push subscription created:', subscription.endpoint.substring(0, 50) + '...');

      // Step 5: Register device with backend
      console.log('🌐 Step 5: Registering device with backend...');
      const registrationSuccess = await registerDevice(subscription, location);
      if (!registrationSuccess) {
        throw new Error('Failed to register device');
      }
      console.log('✅ Device registered successfully');

      // Step 6: Initialize service worker tracking
      console.log('🔧 Step 6: Initializing service worker tracking...');
      await initializeServiceWorkerTracking(subscription);
      console.log('✅ Service worker tracking initialized');

      console.log('🎉 Consent process completed successfully!');
      
    } catch (error) {
      console.error('❌ Consent process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Setup failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission already denied');
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    return permission === 'granted';
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    try {
      await getCurrentPosition();
      setLocationPermission('granted');
      return true;
    } catch (error) {
      setLocationPermission('denied');
      throw new Error('Location permission denied');
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  const getCurrentLocation = async () => {
    const position = await getCurrentPosition();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  };

  const createPushSubscription = async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      setPushSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Error creating push subscription:', error);
      return null;
    }
  };

  const registerDevice = async (subscription: PushSubscription, location: any): Promise<boolean> => {
    try {
      const subscriptionJson = subscription.toJSON();
      const registrationData = {
        device_name: deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
        browser_name: deviceInfo.browserName,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
        latitude: location.latitude,
        longitude: location.longitude
      };

      console.log('Registering device with data:', registrationData);

      const response = await fetch('https://api-pwa.imranansari.in/api/v1/pwa/register-notification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Device registration successful:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Device registration failed:', response.status, errorText);
        
        // Check if device already exists
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.endpoint && errorData.endpoint.includes('already exists')) {
            console.log('Device already exists, treating as success');
            return true;
          }
        } catch (parseError) {
          // Continue with error
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  };

  const initializeServiceWorkerTracking = async (subscription: PushSubscription) => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      registration.active?.postMessage({
        type: 'INITIALIZE_TRACKING',
        data: {
          endpoint: subscription.endpoint,
          deviceInfo: deviceInfo
        }
      });

      console.log('Service worker tracking initialized');
    } catch (error) {
      console.error('Error initializing service worker tracking:', error);
      throw error;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not Set';
    }
  };

  const isAllGranted = notificationPermission === 'granted' && locationPermission === 'granted';

  return (
    <div className="space-y-4">
      {/* Main Consent Card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enable Location & Notifications
          </CardTitle>
          <CardDescription>
            Grant permissions to receive location-based alerts and notifications every 20 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Status */}
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {networkStatus ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Network</span>
            </div>
            <Badge variant={networkStatus ? 'default' : 'destructive'}>
              {networkStatus ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Permission Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(locationPermission)}
                <Badge variant={locationPermission === 'granted' ? 'default' : locationPermission === 'denied' ? 'destructive' : 'secondary'}>
                  {getStatusText(locationPermission)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(notificationPermission)}
                <Badge variant={notificationPermission === 'granted' ? 'default' : notificationPermission === 'denied' ? 'destructive' : 'secondary'}>
                  {getStatusText(notificationPermission)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Consent Button */}
          <Button
            onClick={handleConsentClick}
            disabled={isLoading || isAllGranted}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : isAllGranted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                All Set!
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                I Consent to Location & Notifications
              </>
            )}
          </Button>

          {/* Success Message */}
          {isAllGranted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                ✅ You're all set! Location tracking is active every 20 seconds.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Information Card */}
      {deviceInfo && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-sm">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{deviceInfo.deviceName}</p>
              <p className="text-xs text-muted-foreground">
                {deviceInfo.browserName} {deviceInfo.browserVersion} • {deviceInfo.osName} {deviceInfo.osVersion}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Type: {deviceInfo.deviceType}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Location Card */}
      {currentLocation && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
              {currentLocation.accuracy && (
                <p className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(currentLocation.accuracy)}m
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Last Update: {lastUpdate}
              </p>
              {isTracking && (
                <p className="text-xs text-green-600 mt-1">
                  🔄 Auto-tracking every 20s • Updates: {updateCount}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(`${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`)}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Coordinates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Push Subscription Token Card */}
      {pushSubscription && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-sm">Push Subscription Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-mono break-all">
                Endpoint: {pushSubscription.endpoint.substring(0, 50)}...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {isTracking ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(pushSubscription.endpoint)}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Endpoint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Service Worker Status */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-sm">Service Worker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Background Tracking</span>
            <Badge variant={serviceWorkerStatus === 'active' ? 'default' : 'secondary'}>
              {serviceWorkerStatus === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 