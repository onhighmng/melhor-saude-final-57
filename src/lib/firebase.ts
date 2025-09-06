// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIeb3jFVg_tdVLBKY9L70AyEnGgF2sbqg",
  authDomain: "melhor-saude.firebaseapp.com",
  projectId: "melhor-saude",
  storageBucket: "melhor-saude.firebasestorage.app",
  messagingSenderId: "761585775501",
  appId: "1:761585775501:web:fb561f6d361756acc743c4",
  measurementId: "G-917C3T1G1J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging };

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get registration token
      const token = await getToken(messaging, {
        vapidKey: 'BK-obwN9rDN1PzejkdgAhuIjeWo1izq_1GUHkh3-vJnbqgKXbz_1DepNI4iImic8sgLdN6RpreUJRwlDxEJ6kNM'
      });
      console.log('FCM Registration Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });