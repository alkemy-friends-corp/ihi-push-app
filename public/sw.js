// Service Worker for PWA Push Notifications and Location Tracking

const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background location tracking variables
let locationTrackingInterval = null;
let currentEndpoint = null;

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  switch (event.data.type) {
    case 'ENABLE_BACKGROUND_LOCATION':
      enableBackgroundLocationTracking(event.data.endpoint);
      break;
    
    case 'DISABLE_BACKGROUND_LOCATION':
      disableBackgroundLocationTracking();
      break;
    
    case 'TEST_NOTIFICATION':
      showTestNotification();
      break;
    
    default:
      console.log('Unknown message type:', event.data.type);
  }
});

// Enable background location tracking
function enableBackgroundLocationTracking(endpoint) {
  console.log('Enabling background location tracking for endpoint:', endpoint);
  
  if (locationTrackingInterval) {
    clearInterval(locationTrackingInterval);
  }
  
  currentEndpoint = endpoint;
  
  // Start tracking every 10 seconds
  locationTrackingInterval = setInterval(() => {
    getCurrentLocationAndSend(endpoint);
  }, 10000);
  
  // Send initial location
  getCurrentLocationAndSend(endpoint);
  
  // Notify main app
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_LOCATION_ENABLED'
      });
    });
  });
}

// Disable background location tracking
function disableBackgroundLocationTracking() {
  console.log('Disabling background location tracking');
  
  if (locationTrackingInterval) {
    clearInterval(locationTrackingInterval);
    locationTrackingInterval = null;
  }
  
  currentEndpoint = null;
  
  // Notify main app
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_LOCATION_DISABLED'
      });
    });
  });
}

// Get current location and send to backend
function getCurrentLocationAndSend(endpoint) {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported in service worker');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      console.log('Background location update:', location);
      sendLocationToBackend(endpoint, location);
    },
    (error) => {
      console.error('Background location error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// Send location to backend
async function sendLocationToBackend(endpoint, location) {
  try {
    const API_BASE_URL = 'https://api-pwa.imranansari.in/api/v1';
    
    const locationPayload = {
      endpoint: endpoint,
      latitude: parseFloat(location.latitude.toFixed(6)),
      longitude: parseFloat(location.longitude.toFixed(6))
    };
    
    const response = await fetch(`${API_BASE_URL}/pwa/enter-location/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationPayload)
    });
    
    if (response.ok) {
      console.log('Background location sent successfully');
    } else {
      console.error('Failed to send background location:', response.status);
    }
  } catch (error) {
    console.error('Error sending background location:', error);
  }
}

// Show test notification
function showTestNotification() {
  const options = {
    body: 'This is a test notification from the service worker',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  self.registration.showNotification('Test Notification', options);
}

// Periodic sync for background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event:', event);
  
  if (event.tag === 'location-sync') {
    event.waitUntil(
      getCurrentLocationAndSend(currentEndpoint)
    );
  }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'location-sync') {
    event.waitUntil(
      getCurrentLocationAndSend(currentEndpoint)
    );
  }
});

console.log('Service Worker registered and ready'); 