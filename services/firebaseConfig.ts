// services/firebaseConfig.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 👉 Paste your real config from Firebase console here
const firebaseConfig = {
  apiKey: "AIzaSyDu7faa0EfHkZU3b5awsofwO8_HU5rd-Vo",
  authDomain: "fitmyear.firebaseapp.com",
  projectId: "fitmyear",
  storageBucket: "fitmyear.firebasestorage.app",
  messagingSenderId: "808949459952",
  appId: "1:808949459952:web:e51e3681ef378a09788b35",
  measurementId: "G-NZ0BX9YDF4",
};

let app: FirebaseApp;

// Avoid initializing twice (fast refresh, etc.)
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
