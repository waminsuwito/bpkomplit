
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSNTS7HvOFKSNkFojAN6qzljX5EGsNtzQ",
  authDomain: "frp-batching-plant-management.firebaseapp.com",
  projectId: "frp-batching-plant-management",
  storageBucket: "frp-batching-plant-management.appspot.com",
  messagingSenderId: "1029241421718",
  appId: "1:1029241421718:web:6d85e62262fc22f26567b7",
  measurementId: "G-952KLPTDVZ",
  // Add the databaseURL for Realtime Database
  databaseURL: "https://frp-batching-plant-management-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { app, auth, firestore, storage, database };
