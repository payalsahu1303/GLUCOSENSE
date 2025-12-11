// Firebase App (core)
import { initializeApp } from "firebase/app";

// Firebase Auth
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

// Firestore (optional, already in your code)
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

// Realtime Database
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  get 
} from "firebase/database";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // <-- important
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // Firestore
const realtimeDb = getDatabase(app); // Realtime Database
const googleProvider = new GoogleAuthProvider();

// Export everything
export {
  app,
  auth,
  db,
  realtimeDb,
  googleProvider,
  signInWithPopup,
  signOut,
  doc,
  setDoc,
  getDoc,
  ref,
  onValue,
  set,
  get,
};
