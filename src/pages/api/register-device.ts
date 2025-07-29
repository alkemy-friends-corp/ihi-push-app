import type { NextApiRequest, NextApiResponse } from 'next';

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

interface RegisterDeviceRequest {
  pushSubscription: PushSubscription | null;
  deviceInfo: DeviceInfo;
  timestamp: number;
  isFirstVisit: boolean;
}

interface RegisterDeviceResponse {
  success: boolean;
  message: string;
  deviceId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterDeviceResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { pushSubscription, deviceInfo, timestamp, isFirstVisit }: RegisterDeviceRequest = req.body;

    // Validate required fields
    if (!deviceInfo) {
      return res.status(400).json({
        success: false,
        message: 'Device information is required'
      });
    }

    // Generate a unique device ID
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log the registration attempt
    console.log('📱 Device registration:', {
      deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: `${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
      os: `${deviceInfo.osName} ${deviceInfo.osVersion}`,
      pushSubscription: pushSubscription ? 'Available' : 'Not provided',
      isFirstVisit,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Here you would typically:
    // 1. Store device information in your database
    // 2. Associate push subscription with device
    // 3. Set up any necessary subscriptions or preferences
    // 4. Handle first-time visit logic
    
    // For now, we'll just return success
    // In a real implementation, you'd save to your database:
    /*
    await db.devices.create({
      id: deviceId,
      pushSubscription,
      deviceInfo,
      registeredAt: new Date(timestamp),
      isActive: true,
      isFirstVisit,
    });
    */

    return res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      deviceId,
    });

  } catch (error) {
    console.error('❌ Error registering device:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 