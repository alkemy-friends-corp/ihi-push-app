import { useEffect } from 'react';
import { fcmService } from '@/lib/notifications/fcm-service';

export function FCMInitializer() {
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        console.log('🌐 Page loaded - initializing FCM service...');
        
        // Initialize FCM service
        const initialized = await fcmService.initialize();
        
        if (initialized) {
          console.log('✅ FCM service ready for background notifications');
          
          // Check if notification permission is already granted
          const permissionStatus = fcmService.getCurrentPermissionStatus();
          if (permissionStatus === 'granted') {
            console.log('🔔 Notification permission already granted');
            
            // Try to get FCM token
            try {
              const token = await fcmService.getFCMToken();
              if (token) {
                console.log('🔑 FCM token available:', token.substring(0, 20) + '...');
                
                // Store token for other components to use
                if (typeof window !== 'undefined') {
                  localStorage.setItem('fcmToken', token);
                  console.log('💾 FCM token saved to localStorage');
                }
              }
            } catch (error) {
              console.warn('⚠️ Could not get FCM token:', error);
            }
          } else {
            console.log('📱 Notification permission not granted yet');
          }
        } else {
          console.warn('⚠️ FCM service initialization failed');
        }
      } catch (error) {
        console.error('❌ Error during FCM initialization:', error);
      }
    };

    // Initialize on component mount
    initializeFCM();
  }, []);

  // This component doesn't render anything
  return null;
} 