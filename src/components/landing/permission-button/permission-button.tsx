import React from 'react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Badge } from '@/components/shadcn/badge';
import { Bell, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Play, Square } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from '@/hooks/useTranslations';

export function PermissionButton() {
  const { t } = useTranslations();
  const {
    location,
    notification,
    isLoading,
    locationData,
    fcmToken,
    isTracking,
    locationLogs,
    requestAllPermissions,
    startLocationTracking,
    stopLocationTracking,
  } = usePermissions();

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
  const hasAnyGranted = location === 'granted' || notification === 'granted';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('permissions.title') || 'Enable Notifications & Location'}
        </CardTitle>
        <CardDescription>
          {t('permissions.description') || 'Get real-time alerts and location-based services'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('permissions.location') || 'Location'}
              </span>
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
              <span className="text-sm font-medium">
                {t('permissions.notifications') || 'Notifications'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(notification)}
              <Badge variant={notification === 'granted' ? 'default' : notification === 'denied' ? 'destructive' : 'secondary'}>
                {getStatusText(notification)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location Data Display */}
        {locationData && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t('permissions.currentLocation') || 'Current Location'}
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

        {/* FCM Token Display */}
        {fcmToken && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t('permissions.fcmToken') || 'FCM Token'}
            </p>
            <p className="text-xs font-mono break-all">
              {fcmToken.substring(0, 20)}...
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={requestAllPermissions}
          disabled={isLoading || isAllGranted}
          className="w-full"
          variant={isAllGranted ? 'outline' : 'default'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('permissions.requesting') || 'Requesting...'}
            </>
          ) : isAllGranted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('permissions.allGranted') || 'All Permissions Granted'}
            </>
          ) : hasAnyGranted ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              {t('permissions.requestRemaining') || 'Request Remaining Permissions'}
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              {t('permissions.enableAll') || 'Enable All Permissions'}
            </>
          )}
        </Button>

        {/* Location Tracking Controls */}
        {isAllGranted && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={startLocationTracking}
                disabled={isTracking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {t('permissions.startTracking') || 'Start Tracking'}
              </Button>
              <Button
                onClick={stopLocationTracking}
                disabled={!isTracking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                {t('permissions.stopTracking') || 'Stop Tracking'}
              </Button>
            </div>
            
            {isTracking && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  📍 Location tracking active - check browser console for updates every 10 seconds
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Logs: {locationLogs.length}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {isAllGranted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              {t('permissions.successMessage') || 'You\'re all set! You\'ll receive notifications and location-based alerts.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 