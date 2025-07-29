# New PWA Flow Implementation: Native Web Push API

## 🎯 **Overview**

This implementation removes Firebase FCM and uses only the native Web Push API, implementing the specific user flow requirements:

1. **First-time registration**: Location permission from toggle, notification permission from "I consent" button
2. **Continuous tracking**: Send lat/long to API every 20 seconds
3. **Immediate tracking**: Send lat/long immediately when user visits the system

## 🔄 **New User Flow**

### **Step 1: User Registration Form**
```
┌─────────────────────────────────────┐
│ Let's receive notifications!        │
│                                     │
│ [Country Selection Dropdown]        │
│ [Stay Duration Dropdown]            │
│                                     │
│ [Location-based Notifications]      │
│ ☐ Toggle Switch                     │
│                                     │
│ [I consent to receive notifications]│
│ ┌─────────────────────────────────┐ │
│ │         CONSENT BUTTON          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Step 2: Permission Flow**
1. **Location Permission**: Triggered when user toggles "Location-based Notifications"
2. **Notification Permission**: Triggered when user clicks "I consent to receive notifications"
3. **Device Registration**: Automatic when both permissions are granted

### **Step 3: Location Tracking**
- **Immediate**: Send location when user visits (page load)
- **Periodic**: Send location every 20 seconds when tracking is active

## 🚀 **Key Changes Made**

### **1. Removed Firebase FCM**
- ❌ Removed `firebase/messaging` imports
- ❌ Removed FCM token generation
- ❌ Removed Firebase-specific notification handling
- ✅ Replaced with native Web Push API

### **2. Enhanced Location Tracker**
```typescript
// New features:
- 20-second intervals (instead of 10)
- Immediate location sending on page load
- First-time visit detection
- Enhanced server communication
```

### **3. New UI Flow**
```typescript
// New components:
- Country selection dropdown
- Stay duration dropdown
- Location toggle with permission request
- Consent button for notifications
- Real-time status indicators
```

## 📊 **Implementation Details**

### **Push Notification Service** (`src/lib/notifications/fcm-service.ts`)
```typescript
class PushNotificationService {
  // Native Web Push API implementation
  async getPushSubscription(): Promise<PushSubscription | null>
  async requestNotificationPermission(): Promise<boolean>
  async testNotification(): Promise<boolean>
  
  // VAPID key management
  private urlBase64ToUint8Array(base64String: string): Uint8Array
}
```

### **Location Tracker** (`src/lib/permissions/location-tracker.ts`)
```typescript
class LocationTracker {
  // New methods:
  async sendImmediateLocation(): Promise<boolean>
  async startTracking(intervalMs: number = 20000)
  isFirstTimeVisit(): boolean
  
  // Enhanced tracking:
  - 20-second intervals
  - Immediate location on page load
  - First visit detection
}
```

### **Permission Hook** (`src/hooks/usePermissions.ts`)
```typescript
export const usePermissions = () => {
  // New state:
  - pushSubscription: PushSubscription | null
  - isFirstVisit: boolean
  
  // New behavior:
  - Immediate location sending on permission grant
  - Enhanced permission flow
}
```

### **Permission Button** (`src/components/landing/permission-button/permission-button.tsx`)
```typescript
// New UI components:
- Country selection
- Stay duration selection
- Location toggle with permission request
- Consent button for notifications
- Real-time status display
```

## 🔧 **API Endpoints**

### **Device Registration** (`/api/register-device`)
```typescript
interface RegisterDeviceRequest {
  pushSubscription: PushSubscription | null;
  deviceInfo: DeviceInfo;
  timestamp: number;
  isFirstVisit: boolean;
}
```

### **Location Updates** (`/api/location`)
```typescript
interface LocationUpdateRequest {
  location: LocationData;
  pushSubscription: PushSubscription | null;
  timestamp: number;
  deviceInfo: DeviceInfo;
  online: boolean;
  type: 'immediate' | 'periodic';
  isFirstVisit: boolean;
}
```

## 📱 **User Experience Flow**

### **First-Time User**
1. **Page Load**: User sees registration form
2. **Country/Duration**: User selects their information
3. **Location Toggle**: User enables location-based notifications
   - System requests location permission
   - If granted, sends immediate location
4. **Consent Button**: User clicks "I consent to receive notifications"
   - System requests notification permission
   - If granted, creates push subscription
   - Registers device with server
5. **Success**: User sees confirmation and tracking controls

### **Returning User**
1. **Page Load**: System checks existing permissions
2. **Immediate Location**: Sends location immediately if permission granted
3. **Status Display**: Shows current permission and tracking status
4. **Tracking Controls**: User can start/stop location tracking

## 🔄 **Data Flow**

### **Location Tracking Flow**
```
User Visits Page
       ↓
Check Permissions
       ↓
Send Immediate Location (if granted)
       ↓
User Starts Tracking
       ↓
Send Location Every 20 Seconds
       ↓
Server Processes Location Data
```

### **Notification Flow**
```
User Clicks Consent
       ↓
Request Notification Permission
       ↓
Create Push Subscription
       ↓
Register Device with Server
       ↓
Server Can Send Push Notifications
```

## 🛠 **Technical Implementation**

### **VAPID Key Management**
```typescript
// Convert VAPID key for Web Push API
private urlBase64ToUint8Array(base64String: string): Uint8Array {
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
}
```

### **Push Subscription Creation**
```typescript
const subscription = await swReg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: applicationServerKey,
});
```

### **Immediate Location Sending**
```typescript
async sendImmediateLocation(): Promise<boolean> {
  const location = await locationService.getCurrentPosition();
  if (location) {
    await this.sendLocationToServer(log, 'immediate');
    return true;
  }
  return false;
}
```

## 📊 **Server-Side Integration**

### **Sending Push Notifications**
```javascript
// Using web-push library
const webpush = require('web-push');

webpush.sendNotification(
  pushSubscription, // From client
  JSON.stringify({
    title: 'Welcome to Toyosu!',
    body: 'We\'ll keep you updated with local information.',
    icon: '/icon.png'
  })
);
```

### **Location Data Processing**
```javascript
// Handle different location update types
if (type === 'immediate') {
  // First visit or page load
  await sendWelcomeNotification(pushSubscription, deviceInfo);
} else if (type === 'periodic') {
  // Regular tracking updates
  await processLocationUpdate(location, deviceInfo);
}
```

## 🎯 **Benefits of New Implementation**

### **1. Independence**
- ✅ No Firebase dependency
- ✅ Standard web technologies
- ✅ More control over implementation

### **2. Better User Experience**
- ✅ Clear permission flow
- ✅ Immediate location sending
- ✅ Real-time status updates
- ✅ Enhanced UI with form fields

### **3. Improved Performance**
- ✅ 20-second intervals (optimized)
- ✅ Immediate location on page load
- ✅ Efficient permission handling

### **4. Enhanced Security**
- ✅ Native Web Push API security
- ✅ VAPID key authentication
- ✅ User-visible notifications only

## 🔧 **Configuration**

### **Environment Variables**
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### **Service Worker**
The implementation uses the existing `/firebase-messaging-sw.js` service worker for push notification handling.

## 🚀 **Usage Examples**

### **Basic Implementation**
```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/landing/permission-button';

function App() {
  const { location, notification, startLocationTracking } = usePermissions();

  return (
    <div>
      <PermissionButton />
      <p>Location: {location}</p>
      <p>Notification: {notification}</p>
    </div>
  );
}
```

### **Custom Location Tracking**
```typescript
import { locationTracker } from '@/lib/permissions/location-tracker';

// Start tracking with 20-second intervals
locationTracker.startTracking(20000, (log) => {
  console.log('Location update:', log);
});

// Send immediate location
await locationTracker.sendImmediateLocation();
```

### **Custom Notification Handling**
```typescript
import { pushNotificationService } from '@/lib/notifications/fcm-service';

// Get push subscription
const subscription = await pushNotificationService.getPushSubscription();

// Test notification
await pushNotificationService.testNotification();
```

## 📈 **Monitoring & Analytics**

### **Console Logs**
The implementation provides comprehensive console logging:
- 📍 Location updates (immediate and periodic)
- 🔑 Push subscription creation
- 📱 Device registration
- 🌐 Network status changes
- ✅ Permission status updates

### **Server Logs**
API endpoints log:
- Device registration attempts
- Location update frequency
- First-time vs returning users
- Network connectivity status

## 🔮 **Future Enhancements**

### **Planned Features**
1. **Geofencing**: Location-based triggers
2. **Smart Intervals**: Adaptive update frequency
3. **Offline Support**: Queue location updates
4. **Analytics Dashboard**: Track user engagement
5. **Custom Notifications**: Location-based alerts

### **Performance Optimizations**
1. **Battery Optimization**: Power-aware tracking
2. **Data Compression**: Reduce payload size
3. **Smart Caching**: Cache location data
4. **Background Sync**: Sync when online

## 🎉 **Conclusion**

The new implementation successfully:
- ✅ Removes Firebase FCM dependency
- ✅ Implements native Web Push API
- ✅ Provides clear user flow
- ✅ Sends immediate location on page load
- ✅ Tracks location every 20 seconds
- ✅ Handles first-time vs returning users
- ✅ Provides comprehensive logging and monitoring

This creates a robust, independent PWA notification and location tracking system that meets all the specified requirements! 