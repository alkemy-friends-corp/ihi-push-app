import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };
const firebaseConfig = {
    apiKey: "AIzaSyDSsxP6H34HrlbM-YDCP0Cyk7pBAIMV0Uw",
    authDomain: "pushapp-b12a0.firebaseapp.com",
    projectId: "pushapp-b12a0",
    storageBucket: "pushapp-b12a0.firebasestorage.app",
    messagingSenderId: "448410253464",
    appId: "1:448410253464:web:877b327d5594dfc4f238ed",
    measurementId: "G-RVKXJSGW3N"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: ReturnType<typeof getMessaging> | null = null;

// Check if messaging is supported
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { app, messaging }; 