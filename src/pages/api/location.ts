import type { NextApiRequest, NextApiResponse } from 'next';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
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

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface LocationUpdateRequest {
  location: LocationData;
  pushSubscription: PushSubscription | null;
  timestamp: number;
  deviceInfo: DeviceInfo;
  online: boolean;
  type: 'immediate' | 'periodic';
  isFirstVisit: boolean;
}

interface LocationUpdateResponse {
  success: boolean;
  message: string;
  locationId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationUpdateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { location, pushSubscription, timestamp, deviceInfo, online, type, isFirstVisit }: LocationUpdateRequest = req.body;

    // Validate required fields
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location data is required'
      });
    }

    // Generate a unique location ID
    const locationId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log the location update
    console.log('📍 Location update received:', {
      locationId,
      coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown',
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: `${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
      pushSubscription: pushSubscription ? 'Available' : 'Not provided',
      online,
      type, // 'immediate' or 'periodic'
      isFirstVisit,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Here you would typically:
    // 1. Store location data in your database
    // 2. Associate with device/user
    // 3. Trigger any location-based notifications or actions
    // 4. Update device's last known location
    // 5. Handle immediate vs periodic updates differently
    
    // For now, we'll just return success
    // In a real implementation, you'd save to your database:
    /*
    await db.locations.create({
      id: locationId,
      deviceId: deviceId, // You'd get this from the device registration
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(timestamp),
      pushSubscription,
      online,
      type,
      isFirstVisit,
    });

    // Update device's last known location
    await db.devices.update({
      where: { pushSubscription },
      data: {
        lastLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date(timestamp),
        },
        lastSeen: new Date(timestamp),
        isOnline: online,
      },
    });

    // Handle immediate location updates (first visit or page load)
    if (type === 'immediate') {
      // Send welcome notification or special handling
      await sendWelcomeNotification(pushSubscription, deviceInfo);
    }
    */

    return res.status(200).json({
      success: true,
      message: 'Location update received successfully',
      locationId,
    });

  } catch (error) {
    console.error('❌ Error processing location update:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 