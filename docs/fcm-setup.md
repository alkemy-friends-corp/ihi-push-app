# FCM (Firebase Cloud Messaging) Setup Guide

This guide explains how to set up Firebase Cloud Messaging for cross-platform push notifications in the Toyosu Spots app.

## Features

- ✅ Background notifications (when app is closed)
- ✅ Foreground notifications (when app is open)
- ✅ Cross-platform support (iOS, Android, Web)
- ✅ Safari support (macOS, iOS)
- ✅ Chrome support (Android, Windows, macOS)
- ✅ Location-based notifications
- ✅ Modular and clean architecture

## Prerequisites

1. Firebase project with Cloud Messaging enabled
2. Web app configuration in Firebase Console
3. VAPID key for web push notifications

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# VAPID Key for Web Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

## Firebase Console Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging in the project settings

### 2. Add Web App
1. In Firebase Console, go to Project Settings
2. Add a new web app
3. Copy the configuration object
4. Update your environment variables

### 3. Generate VAPID Key
1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Generate a new Web Push certificate
3. Copy the VAPID key to your environment variables

## Architecture

### Components

- **FCM Service** (`src/lib/notifications/fcm-service.ts`)
  - Handles Firebase Cloud Messaging initialization
  - Manages notification permissions
  - Handles foreground and background messages
  - Cross-platform compatibility

- **Location Service** (`src/lib/permissions/location-service.ts`)
  - Manages location permissions
  - Provides current location data
  - Handles location watching

- **Permission Hook** (`src/hooks/usePermissions.ts`)
  - React hook for managing permissions
  - Provides permission status and request functions
  - Handles loading states and error handling

- **Permission Button** (`src/components/landing/permission-button/index.tsx`)
  - UI component for requesting permissions
  - Shows permission status
  - Displays location data and FCM token

### Service Worker

The service worker (`public/firebase-messaging-sw.js`) handles:
- Background message processing
- Notification display when app is closed
- Notification click handling
- Cross-platform compatibility

## Usage

### Basic Usage

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const {
    location,
    notification,
    isLoading,
    locationData,
    fcmToken,
    requestAllPermissions,
  } = usePermissions();

  return (
    <button onClick={requestAllPermissions} disabled={isLoading}>
      Enable Notifications & Location
    </button>
  );
}
```

### Individual Permission Requests

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const {
    requestLocationPermission,
    requestNotificationPermission,
  } = usePermissions();

  const handleLocationOnly = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      console.log('Location permission granted');
    }
  };

  const handleNotificationOnly = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      console.log('Notification permission granted');
    }
  };

  return (
    <div>
      <button onClick={handleLocationOnly}>Enable Location</button>
      <button onClick={handleNotificationOnly}>Enable Notifications</button>
    </div>
  );
}
```

## Cross-Platform Support

### iOS Safari
- Requires HTTPS
- User must manually enable notifications in Safari settings
- Limited background processing

### Android Chrome
- Full support for background notifications
- Automatic permission requests
- Rich notification features

### Desktop Browsers
- Chrome: Full support
- Firefox: Full support
- Safari: Limited support (macOS only)

## Testing

### Local Development
1. Use HTTPS (required for service workers)
2. Test on different browsers and devices
3. Check browser console for errors

### Production Testing
1. Deploy to HTTPS environment
2. Test on real devices
3. Verify background notifications work

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Ensure HTTPS is enabled
   - Check browser console for errors
   - Verify Firebase configuration

2. **Notifications Not Showing**
   - Check notification permissions
   - Verify VAPID key is correct
   - Test on supported browsers

3. **Location Not Working**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Test on mobile devices

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('FCM_DEBUG', 'true');
```

## Security Considerations

1. **VAPID Key**: Keep your VAPID key secure
2. **Environment Variables**: Never commit sensitive keys to version control
3. **HTTPS**: Always use HTTPS in production
4. **User Consent**: Always request explicit user consent

## Performance

- Service worker is lightweight and efficient
- Location requests are cached appropriately
- Notifications are handled asynchronously
- Minimal impact on app performance

## Future Enhancements

- [ ] Rich notifications with images
- [ ] Action buttons in notifications
- [ ] Notification categories
- [ ] Advanced targeting based on location
- [ ] Analytics integration
- [ ] A/B testing for notifications 