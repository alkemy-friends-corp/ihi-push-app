import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Badge } from '@/components/shadcn/badge';
import { Bell, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Play, Square, Wifi, WifiOff, History } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from '@/hooks/useTranslations';
import { pushNotificationService, NotificationItem } from '@/lib/notifications/fcm-service';
import { locationTracker, DeviceInfo } from '@/lib/permissions/location-tracker';
import { locationService } from '@/lib/permissions/location-service';

export function PermissionButton() {
  const { t } = useTranslations();
  const {
    location,
    notification,
    isLoading,
    locationData,
    pushSubscription,
    isTracking,
    locationLogs,
    startLocationTracking,
    stopLocationTracking,
  } = usePermissions();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [locationToggleEnabled, setLocationToggleEnabled] = useState(false);

  useEffect(() => {
    // Set up notification callback
    pushNotificationService.setNotificationCallback((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Get initial notification history
    setNotifications(pushNotificationService.getNotificationHistory());

    // Get device info
    const info = locationTracker.getDeviceInfo();
    setDeviceInfo(info);

    // Get push subscription if available
    pushNotificationService.getCurrentPushSubscription();

    // Set up network status listener
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setNetworkStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLocationToggle = async (enabled: boolean) => {
    setLocationToggleEnabled(enabled);
    
    if (enabled) {
      // Request location permission when toggle is enabled
      try {
        const granted = await locationService.requestLocationPermission();
        if (granted) {
          // toast.success('Location permission granted'); // toast is not imported
          console.log('Location permission granted');
          // Send immediate location
          await locationTracker.sendImmediateLocation();
        } else {
          // toast.error('Location permission denied'); // toast is not imported
          console.warn('Location permission denied');
          setLocationToggleEnabled(false);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setLocationToggleEnabled(false);
      }
    }
  };

  const handleConsentClick = async () => {
    // Request notification permission when consent button is clicked
    try {
      const granted = await pushNotificationService.requestNotificationPermission();
      if (granted) {
        await pushNotificationService.getPushSubscription();
        // toast.success('Notification permission granted'); // toast is not imported
        console.log('Notification permission granted');
        
        // Register device if both permissions are granted
        if (locationToggleEnabled) {
          await registerDevice();
        }
      } else {
        // toast.error('Notification permission denied'); // toast is not imported
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const registerDevice = async () => {
    if (!pushSubscription) {
      console.warn('No push subscription available for device registration');
      return;
    }

    try {
      const success = await locationTracker.registerDevice();
      if (success) {
        console.log('✅ Device registered successfully');
      } else {
        console.warn('⚠️ Device registration failed');
      }
    } catch (error) {
      console.error('❌ Error registering device:', error);
    }
  };

  const testNotification = async () => {
    try {
      const success = await pushNotificationService.testNotification();
      if (success) {
        console.log('✅ Test notification sent');
      } else {
        console.warn('⚠️ Failed to send test notification');
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  };

  const getStatusIcon = (status: 'granted' | 'denied' | 'prompt') => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'prompt':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: 'granted' | 'denied' | 'prompt') => {
    switch (status) {
      case 'granted':
        return t('permissions.granted') || 'Granted';
      case 'denied':
        return t('permissions.denied') || 'Denied';
      case 'prompt':
        return t('permissions.prompt') || 'Not Set';
    }
  };

  const isAllGranted = location === 'granted' && notification === 'granted';

  return (
    <div className="space-y-4">
      {/* Main Permission Card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Let&apos;s receive notifications!
          </CardTitle>
          <CardDescription>
            Please enter your stay information and consent to receive notifications.
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

          {/* Country Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Which country are you visiting from?</span>
            </div>
            <select className="w-full p-2 border rounded-lg">
              <option>Select your country</option>
              <option>Japan</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>Other</option>
            </select>
          </div>

          {/* Stay Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">How long will you be staying in the Toyosu area?</span>
            </div>
            <select className="w-full p-2 border rounded-lg">
              <option>Select your stay duration</option>
              <option>1-3 days</option>
              <option>4-7 days</option>
              <option>1-2 weeks</option>
              <option>2-4 weeks</option>
              <option>1+ months</option>
            </select>
          </div>

          {/* Location-based Notifications Toggle */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location-based Notifications</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={locationToggleEnabled}
                  onChange={(e) => handleLocationToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Receive essential safety alerts, local recommendations, and exclusive deals based on your location.
            </p>
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              Location permission is required to receive important notifications during your stay.
            </div>
          </div>

          {/* Permission Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(location)}
                <Badge variant={location === 'granted' ? 'default' : location === 'denied' ? 'destructive' : 'secondary'}>
                  {getStatusText(location)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(notification)}
                <Badge variant={notification === 'granted' ? 'default' : notification === 'denied' ? 'destructive' : 'secondary'}>
                  {getStatusText(notification)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Device Info */}
          {deviceInfo && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Device Info</p>
              <p className="text-sm font-medium">{deviceInfo.deviceName}</p>
              <p className="text-xs text-muted-foreground">
                {deviceInfo.browserName} {deviceInfo.browserVersion} • {deviceInfo.osName}
              </p>
            </div>
          )}

          {/* Location Data Display */}
          {locationData && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Current Location
              </p>
              <p className="text-sm font-mono">
                {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </p>
              {locationData.accuracy && (
                <p className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(locationData.accuracy)}m
                </p>
              )}
            </div>
          )}

          {/* Push Subscription Display */}
          {pushSubscription && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Push Subscription
              </p>
              <p className="text-xs font-mono break-all">
                Endpoint: {pushSubscription.endpoint.substring(0, 30)}...
              </p>
              <p className="text-xs font-mono break-all">
                P256DH: {pushSubscription.keys.p256dh.substring(0, 20)}...
              </p>
              <p className="text-xs font-mono break-all">
                Auth: {pushSubscription.keys.auth.substring(0, 20)}...
              </p>
            </div>
          )}

          {/* Consent Button */}
          <Button
            onClick={handleConsentClick}
            disabled={isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                I consent to receive notifications
              </>
            )}
          </Button>

          {/* Success Message */}
          {isAllGranted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                You&apos;re all set! You&apos;ll receive notifications and location-based alerts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Tracking Controls */}
      {isAllGranted && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={startLocationTracking}
                disabled={isTracking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Tracking
              </Button>
              <Button
                onClick={stopLocationTracking}
                disabled={!isTracking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Tracking
              </Button>
            </div>
            
            {isTracking && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  📍 Location tracking active - updates every 20 seconds
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Logs: {locationLogs.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notification Controls */}
      {notification === 'granted' && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={testNotification}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Bell className="mr-2 h-4 w-4" />
                Test Notification
              </Button>
              <Button
                onClick={() => setShowNotificationHistory(!showNotificationHistory)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <History className="mr-2 h-4 w-4" />
                History ({notifications.length})
              </Button>
            </div>

            {/* Notification History */}
            {showNotificationHistory && notifications.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-2 bg-muted rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{notification.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{notification.body}</p>
                    <p className="text-muted-foreground text-xs mt-1">{notification.timestamp}</p>
                  </div>
                ))}
              </div>
            )}

            {showNotificationHistory && notifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 