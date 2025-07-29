// Optimized Service Worker for PWA with 20-second Location Sync
const CACHE_NAME = 'pwa-optimized-v1';
const LOCATION_UPDATE_INTERVAL = 20000; // 20 seconds
const API_BASE_URL = 'https://api-pwa.imranansari.in/api/v1';

// Core URLs to cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// State management
let isLocationTrackingEnabled = false;
let currentEndpoint = null;
let locationInterval = null;
let deviceInfo = null;

// Enhanced logging with timestamps
const log = (message, ...args) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[SW ${timestamp}] ${message}`, ...args);
};

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  log('Installing optimized service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        log('Install completed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        log('Install failed:', error);
      })
  );
});

// Activate event - clean up and claim clients
self.addEventListener('activate', (event) => {
  log('Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
      // Initialize background tracking
      initializeBackgroundTracking()
    ])
  );
});

// Initialize background location tracking
async function initializeBackgroundTracking() {
  try {
    log('Initializing background location tracking...');
    
    // Get stored data
    const storedData = await getStoredData();
    if (storedData.endpoint && storedData.deviceInfo) {
      currentEndpoint = storedData.endpoint;
      deviceInfo = storedData.deviceInfo;
      isLocationTrackingEnabled = true;
      
      log('Found stored data, starting background tracking');
      startLocationTracking();
      
      // Notify clients
      notifyClients({
        type: 'BACKGROUND_TRACKING_STARTED',
        endpoint: currentEndpoint,
        deviceInfo: deviceInfo
      });
    } else {
      log('No stored data found, waiting for initialization');
    }
  } catch (error) {
    log('Error initializing background tracking:', error);
  }
}

// Start location tracking with 20-second intervals
function startLocationTracking() {
  if (locationInterval) {
    clearInterval(locationInterval);
  }
  
  log('Starting location tracking with 20-second intervals');
  
  // Send immediate location update
  sendLocationUpdate();
  
  // Set up periodic updates
  locationInterval = setInterval(() => {
    sendLocationUpdate();
  }, LOCATION_UPDATE_INTERVAL);
}

// Stop location tracking
function stopLocationTracking() {
  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }
  log('Location tracking stopped');
}

// Send location update to API
async function sendLocationUpdate() {
  try {
    if (!currentEndpoint) {
      log('No endpoint available for location update');
      return;
    }
    
    log('Getting current location...');
    const position = await getCurrentPosition();
    
    const locationData = {
      endpoint: currentEndpoint,
      latitude: parseFloat(position.coords.latitude.toFixed(6)),
      longitude: parseFloat(position.coords.longitude.toFixed(6)),
      accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
      timestamp: new Date().toISOString()
    };
    
    log('Sending location update:', {
      lat: locationData.latitude,
      lng: locationData.longitude,
      accuracy: locationData.accuracy
    });
    
    const response = await fetch(`${API_BASE_URL}/pwa/enter-location/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData)
    });
    
    if (response.ok) {
      const result = await response.json();
      log('Location update successful:', result);
      
      // Notify clients of successful update
      notifyClients({
        type: 'LOCATION_UPDATE_SUCCESS',
        data: locationData
      });
    } else {
      const errorText = await response.text();
      log('Location update failed:', response.status, errorText);
      
      // Notify clients of failed update
      notifyClients({
        type: 'LOCATION_UPDATE_FAILED',
        error: errorText
      });
    }
  } catch (error) {
    log('Error sending location update:', error);
    
    // Notify clients of error
    notifyClients({
      type: 'LOCATION_UPDATE_ERROR',
      error: error.message
    });
  }
}

// Get current position with enhanced error handling
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Geolocation timeout'));
    }, 15000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = 'Unknown geolocation error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  log('Push notification received');
  
  let notificationData = {
    title: 'PWA Notification',
    body: 'You have a new message',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'pwa-notification'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      log('Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  log('Message received:', type, data);
  
  switch (type) {
    case 'INITIALIZE_TRACKING':
      handleInitializeTracking(data);
      break;
      
    case 'STOP_TRACKING':
      handleStopTracking();
      break;
      
    case 'TEST_NOTIFICATION':
      handleTestNotification();
      break;
      
    case 'GET_STATUS':
      handleGetStatus(event.source);
      break;
      
    default:
      log('Unknown message type:', type);
  }
});

// Handle tracking initialization
async function handleInitializeTracking(data) {
  try {
    log('Initializing tracking with data:', data);
    
    const { endpoint, deviceInfo: deviceData } = data;
    
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }
    
    currentEndpoint = endpoint;
    deviceInfo = deviceData;
    isLocationTrackingEnabled = true;
    
    // Store data for persistence
    await storeData({ endpoint, deviceInfo: deviceData });
    
    // Start location tracking
    startLocationTracking();
    
    // Notify clients
    notifyClients({
      type: 'TRACKING_INITIALIZED',
      endpoint: currentEndpoint,
      deviceInfo: deviceInfo
    });
    
    log('Tracking initialized successfully');
  } catch (error) {
    log('Error initializing tracking:', error);
    notifyClients({
      type: 'TRACKING_INITIALIZATION_FAILED',
      error: error.message
    });
  }
}

// Handle stop tracking
function handleStopTracking() {
  log('Stopping tracking...');
  
  stopLocationTracking();
  isLocationTrackingEnabled = false;
  currentEndpoint = null;
  deviceInfo = null;
  
  // Clear stored data
  clearStoredData();
  
  // Notify clients
  notifyClients({
    type: 'TRACKING_STOPPED'
  });
  
  log('Tracking stopped successfully');
}

// Handle test notification
function handleTestNotification() {
  log('Showing test notification');
  
  self.registration.showNotification('Test Notification', {
    body: 'This is a test notification from the service worker',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'test-notification'
  });
}

// Handle status request
function handleGetStatus(client) {
  const status = {
    isTracking: isLocationTrackingEnabled,
    endpoint: currentEndpoint,
    deviceInfo: deviceInfo,
    lastUpdate: new Date().toISOString()
  };
  
  client.postMessage({
    type: 'STATUS_RESPONSE',
    status: status
  });
}

// Notify all clients
async function notifyClients(message) {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });
  } catch (error) {
    log('Error notifying clients:', error);
  }
}

// Store data in IndexedDB
async function storeData(data) {
  try {
    const db = await openDB('pwa-data', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tracking')) {
          db.createObjectStore('tracking', { keyPath: 'id' });
        }
      },
    });
    
    await db.put('tracking', { id: 'current', ...data });
    log('Data stored successfully');
  } catch (error) {
    log('Error storing data:', error);
  }
}

// Get stored data from IndexedDB
async function getStoredData() {
  try {
    const db = await openDB('pwa-data', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tracking')) {
          db.createObjectStore('tracking', { keyPath: 'id' });
        }
      },
    });
    
    const data = await db.get('tracking', 'current');
    return data || {};
  } catch (error) {
    log('Error getting stored data:', error);
    return {};
  }
}

// Clear stored data
async function clearStoredData() {
  try {
    const db = await openDB('pwa-data', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tracking')) {
          db.createObjectStore('tracking', { keyPath: 'id' });
        }
      },
    });
    
    await db.delete('tracking', 'current');
    log('Stored data cleared');
  } catch (error) {
    log('Error clearing stored data:', error);
  }
}

// IndexedDB helper
function openDB(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => upgradeCallback(request.result);
  });
}

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return fallback for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Periodic sync for background updates (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'location-sync' && isLocationTrackingEnabled) {
    log('Periodic sync triggered for location update');
    event.waitUntil(sendLocationUpdate());
  }
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync' && isLocationTrackingEnabled) {
    log('Background sync triggered for location update');
    event.waitUntil(sendLocationUpdate());
  }
});

log('Optimized service worker loaded - 20-second location sync enabled'); 