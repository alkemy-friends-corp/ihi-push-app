import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Switch } from "@/components/shadcn/switch";
import { Badge } from "@/components/shadcn/badge";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { Globe, Calendar, MapPin, Shield, AlertTriangle } from "lucide-react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

interface NotificationRegistrationProps {
  onComplete?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

interface DeviceInfo {
  deviceName: string;
  deviceType: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  userAgent: string;
}

const NotificationRegistration: React.FC<NotificationRegistrationProps> = ({ onComplete }) => {
  const [country, setCountry] = useState<string>("");
  const [stayDuration, setStayDuration] = useState<string>("");
  const [locationNotificationsEnabled, setLocationNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [locationPermission, setLocationPermission] = useState<PermissionState>("prompt");
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  // Service worker hook
  const { isSupported: swSupported, isReady: swReady, registration: swRegistration } = useServiceWorker();

  // VAPID public key for push notifications
  const VAPID_PUBLIC_KEY = "BGEFnqs0ocBjQ0ZRsDCVOWiTVNrxLzNQpuFknAS4J3A3-QuD_AljESFgqR5EkKin3cDUPhaZDoG1tnOk765RUrE";
  const API_BASE_URL = "https://api-pwa.imranansari.in/api/v1";

  // Initialize device info on component mount
  useEffect(() => {
    const getDeviceInfo = (): DeviceInfo => {
      const userAgent = navigator.userAgent;
      
      // Simple device detection without external library
      let deviceName = "Unknown Device";
      let deviceType = "desktop";
      let browserName = "Unknown Browser";
      let browserVersion = "Unknown";
      let osName = "Unknown OS";
      let osVersion = "Unknown";

      // Detect OS
      if (userAgent.includes("Android")) {
        osName = "Android";
        deviceType = "mobile";
        const match = userAgent.match(/Android\s+(\d+(?:\.\d+)*)/);
        if (match) osVersion = match[1];
        deviceName = "Android Device";
      } else if (userAgent.includes("iPhone")) {
        osName = "iOS";
        deviceType = "mobile";
        deviceName = "iPhone";
        const match = userAgent.match(/OS\s+(\d+_\d+)/);
        if (match) osVersion = match[1].replace("_", ".");
      } else if (userAgent.includes("iPad")) {
        osName = "iOS";
        deviceType = "tablet";
        deviceName = "iPad";
        const match = userAgent.match(/OS\s+(\d+_\d+)/);
        if (match) osVersion = match[1].replace("_", ".");
      } else if (userAgent.includes("Windows")) {
        osName = "Windows";
        const match = userAgent.match(/Windows NT (\d+\.\d+)/);
        if (match) osVersion = match[1];
      } else if (userAgent.includes("Mac OS X")) {
        osName = "macOS";
        const match = userAgent.match(/Mac OS X (\d+_\d+)/);
        if (match) osVersion = match[1].replace("_", ".");
      } else if (userAgent.includes("Linux")) {
        osName = "Linux";
      }

      // Detect Browser
      if (userAgent.includes("Chrome")) {
        browserName = "Chrome";
        const match = userAgent.match(/Chrome\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (userAgent.includes("Firefox")) {
        browserName = "Firefox";
        const match = userAgent.match(/Firefox\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (userAgent.includes("Safari")) {
        browserName = "Safari";
        const match = userAgent.match(/Version\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (userAgent.includes("Edge")) {
        browserName = "Edge";
        const match = userAgent.match(/Edge\/(\d+)/);
        if (match) browserVersion = match[1];
      }

      return {
        deviceName,
        deviceType,
        browserName,
        browserVersion,
        osName,
        osVersion,
        userAgent,
      };
    };

    setDeviceInfo(getDeviceInfo());
    checkPermissions();
  }, []);

  // Check current permissions
  const checkPermissions = async () => {
    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check location permission
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        setLocationPermission(permission.state);
      } catch (error) {
        console.log("Could not check location permission:", error);
      }
    }
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return true;
    }

    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === "granted";
  };

  // Request location permission and get current location
  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLocationPermission("granted");
      return true;
    } catch (error) {
      console.error("Location permission denied:", error);
      setLocationPermission("denied");
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
    if (!swSupported || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser");
      return null;
    }

    if (!swReady || !swRegistration) {
      alert("Service worker is not ready. Please wait a moment and try again.");
      return null;
    }

    try {
      // Convert VAPID key
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to push notifications
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      setPushSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  };

  // Convert Base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  // Register device with backend
  const registerDevice = async (subscription: PushSubscription): Promise<boolean> => {
    if (!deviceInfo) return false;

    try {
      const subscriptionJson = subscription.toJSON();
      const registrationData = {
        device_name: deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
        browser_name: deviceInfo.browserName,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || "",
        auth: subscriptionJson.keys?.auth || "",
      };

      const response = await fetch(`${API_BASE_URL}/pwa/register-notification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Device registered successfully:", data);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Registration failed:", errorText);
        return false;
      }
    } catch (error) {
      console.error("Error registering device:", error);
      return false;
    }
  };

  // Send location to backend
  const sendLocationToBackend = async (location: LocationData): Promise<void> => {
    if (!pushSubscription) return;

    try {
      const locationPayload = {
        endpoint: pushSubscription.endpoint,
        latitude: parseFloat(location.latitude.toFixed(6)),
        longitude: parseFloat(location.longitude.toFixed(6)),
      };

      await fetch(`${API_BASE_URL}/pwa/enter-location/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationPayload),
      });
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (!locationNotificationsEnabled || !pushSubscription) return;

    const interval = setInterval(async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });

        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(location);
        await sendLocationToBackend(location);
      } catch (error) {
        console.error("Error updating location:", error);
      }
    }, 10000); // Every 10 seconds

    setLocationInterval(interval);
  }, [locationNotificationsEnabled, pushSubscription]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  }, [locationInterval]);

  // Handle consent button click
  const handleConsent = async () => {
    if (!country || !stayDuration) {
      alert("Please select your country and stay duration");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Request notification permission
      const notificationGranted = await requestNotificationPermission();
      if (!notificationGranted) {
        alert("Notification permission is required to receive important updates");
        setIsLoading(false);
        return;
      }

      // Step 2: Request location permission
      const locationGranted = await requestLocationPermission();
      if (!locationGranted) {
        alert("Location permission is required to receive location-based notifications");
        setIsLoading(false);
        return;
      }

      // Step 3: Subscribe to push notifications
      const subscription = await subscribeToPushNotifications();
      if (!subscription) {
        alert("Failed to subscribe to push notifications");
        setIsLoading(false);
        return;
      }

      // Step 4: Register device with backend
      const registrationSuccess = await registerDevice(subscription);
      if (!registrationSuccess) {
        alert("Failed to register device with the server");
        setIsLoading(false);
        return;
      }

      // Step 5: Start location tracking if enabled
      if (locationNotificationsEnabled) {
        startLocationTracking();
      }

      setIsRegistered(true);
      onComplete?.();
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  // Update location tracking when toggle changes
  useEffect(() => {
    if (locationNotificationsEnabled && isRegistered) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [locationNotificationsEnabled, isRegistered, startLocationTracking, stopLocationTracking]);

  if (isRegistered) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-green-800 mb-2">Registration Complete!</h3>
            <p className="text-green-700">
              Your device has been successfully registered. You will now receive location-based notifications.
            </p>
            {currentLocation && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current Location:</strong> {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
          <Globe className="h-6 w-6" />
          Lets receive notifications!
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please enter your stay information and consent to receive notifications.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            Which country are you visiting from?
          </label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="japan">Japan</SelectItem>
              <SelectItem value="usa">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
              <SelectItem value="france">France</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stay Duration */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            How long will you be staying in the Toyosu area?
          </label>
          <Select value={stayDuration} onValueChange={setStayDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select your stay duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3-days">1-3 days</SelectItem>
              <SelectItem value="4-7-days">4-7 days</SelectItem>
              <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
              <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
              <SelectItem value="1-3-months">1-3 months</SelectItem>
              <SelectItem value="3-months-plus">3+ months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location-based Notifications */}
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-red-800">Location-based Notifications</h4>
            </div>
            <Switch
              checked={locationNotificationsEnabled}
              onCheckedChange={setLocationNotificationsEnabled}
            />
          </div>
          <p className="text-sm text-red-700 mb-4">
            Receive essential safety alerts, local recommendations, and exclusive deals based on your location
          </p>

          {/* Permission Warning */}
          {locationPermission === "denied" && (
            <Alert className="border-red-300 bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Location permission is required to receive important notifications during your stay
              </AlertDescription>
            </Alert>
          )}

          {/* Notification Types */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <h5 className="font-medium text-green-800">You will receive notifications about:</h5>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Weather warnings and alerts</li>
              <li>• Disaster and emergency information</li>
              <li>• Safety and security updates</li>
              <li>• Transportation disruptions</li>
              <li>• Local events and attractions</li>
              <li>• Restaurant deals and shopping discounts</li>
            </ul>
          </div>
        </div>

        {/* Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Service Worker:</span>
            <Badge variant={swReady ? "default" : "destructive"}>
              {swReady ? "Ready" : "Loading..."}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Notification Permission:</span>
            <Badge variant={notificationPermission === "granted" ? "default" : "destructive"}>
              {notificationPermission === "granted" ? "Allowed" : "Required"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Location Permission:</span>
            <Badge variant={locationPermission === "granted" ? "default" : "destructive"}>
              {locationPermission === "granted" ? "Allowed" : "Required"}
            </Badge>
          </div>
        </div>

        {/* Consent Button */}
        <Button
          onClick={handleConsent}
          disabled={isLoading || !country || !stayDuration || !swReady}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : !swReady ? (
            "Loading Service Worker..."
          ) : (
            "I consent to receive notifications"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationRegistration; 