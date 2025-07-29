# PWA Implementation with Location & Push Notifications

This document describes the implementation of a Progressive Web App (PWA) with location tracking and push notification capabilities.

## Features Implemented

### 1. Notification Registration Component
- **File**: `src/components/landing/notification-registration.tsx`
- **Features**:
  - Country and stay duration selection
  - Location-based notifications toggle
  - Real-time permission status display
  - Device information detection
  - Push notification subscription
  - Location tracking (every 10 seconds)

### 2. Service Worker
- **File**: `public/sw.js`
- **Features**:
  - Push notification handling
  - Background location tracking
  - Cache management
  - Message handling from main app

### 3. PWA Manifest
- **File**: `public/manifest.json`
- **Features**:
  - App installation support
  - Standalone display mode
  - Theme colors and icons
  - App shortcuts

### 4. Service Worker Hook
- **File**: `src/hooks/useServiceWorker.ts`
- **Features**:
  - Service worker registration
  - Status monitoring
  - Ready state management

## Implementation Details

### Location Tracking
- Requests location permission from user
- Tracks location every 10 seconds when enabled
- Sends location data to backend API
- Works in background via service worker

### Push Notifications
- Uses VAPID keys for secure push messaging
- Requests notification permission
- Subscribes to push notifications
- Handles incoming notifications in service worker

### Backend Integration
- **Registration Endpoint**: `POST /api/v1/pwa/register-notification/`
- **Location Endpoint**: `POST /api/v1/pwa/enter-location/`
- **Device Check Endpoint**: `POST /api/v1/pwa/check-device/`

### API Payloads

#### Device Registration
```json
{
  "device_name": "iPhone",
  "device_type": "mobile",
  "browser_name": "Safari",
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "base64-encoded-p256dh-key",
  "auth": "base64-encoded-auth-key"
}
```

#### Location Update
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "latitude": 35.658581,
  "longitude": 139.745438
}
```

## Usage

### 1. User Flow
1. User visits the app
2. Selects country and stay duration
3. Toggles location-based notifications
4. Clicks "I consent to receive notifications"
5. Grants notification and location permissions
6. Device is registered with backend
7. Location tracking starts automatically

### 2. Permissions Required
- **Notification Permission**: Required for push notifications
- **Location Permission**: Required for location-based features
- **Service Worker**: Required for background functionality

### 3. Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (iOS restrictions)
- Mobile browsers: Varies by platform

## Technical Requirements

### Dependencies
- Next.js 15.4.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons

### Environment Variables
- VAPID_PUBLIC_KEY: For push notification authentication
- API_BASE_URL: Backend API endpoint

### Browser APIs Used
- Service Worker API
- Push API
- Geolocation API
- Notifications API
- Permissions API

## Security Considerations

1. **HTTPS Required**: PWA features only work over HTTPS
2. **VAPID Keys**: Secure push notification authentication
3. **Permission-based**: User must explicitly grant permissions
4. **Data Privacy**: Location data only sent when user consents

## Testing

### Local Development
1. Run `npm run dev`
2. Open browser to `http://localhost:3000`
3. Test notification registration flow
4. Check browser console for logs

### Production Testing
1. Deploy to HTTPS environment
2. Test on mobile devices
3. Verify PWA installation
4. Test background location tracking

## Troubleshooting

### Common Issues
1. **Service Worker Not Registering**: Check HTTPS and file path
2. **Push Notifications Not Working**: Verify VAPID keys
3. **Location Permission Denied**: Check browser settings
4. **PWA Not Installable**: Verify manifest.json and HTTPS

### Debug Logs
- Check browser console for detailed logs
- Service worker logs appear in separate console
- Network tab shows API requests

## Future Enhancements

1. **Offline Support**: Enhanced caching strategies
2. **Background Sync**: Periodic data synchronization
3. **Rich Notifications**: Custom notification UI
4. **Geofencing**: Location-based triggers
5. **Analytics**: Usage tracking and metrics

## Files Modified/Created

### New Files
- `src/components/landing/notification-registration.tsx`
- `src/hooks/useServiceWorker.ts`
- `public/sw.js`
- `public/manifest.json`
- `PWA_IMPLEMENTATION.md`

### Modified Files
- `src/components/landing/landing.tsx`
- `src/components/landing/index.ts`
- `src/pages/_document.tsx`

## API Endpoints

### Backend Requirements
The implementation expects these backend endpoints:

1. **POST /api/v1/pwa/register-notification/**
   - Registers device for push notifications
   - Returns success/error response

2. **POST /api/v1/pwa/enter-location/**
   - Receives location updates
   - Associates location with device endpoint

3. **POST /api/v1/pwa/check-device/**
   - Checks if device is already registered
   - Returns registration status

## VAPID Configuration

The app uses a hardcoded VAPID public key for development. In production:

1. Generate VAPID key pair
2. Store private key securely on backend
3. Use public key in frontend
4. Configure backend to send push notifications

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |
| Background Location | ✅ | ✅ | ❌ | ✅ |
| PWA Installation | ✅ | ✅ | ✅ | ✅ |

*Note: Safari on iOS has significant limitations for PWA features* 