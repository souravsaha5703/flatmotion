import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "flatmotion-bceca.firebaseapp.com",
  projectId: "flatmotion-bceca",
  storageBucket: "flatmotion-bceca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-EH94YVK043"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);