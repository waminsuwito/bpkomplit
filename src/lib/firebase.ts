
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5MPo5udTSUTgitB_oK6I2ZeKOcv3-tS4",
  authDomain: "batchingplantmanager-5f679.firebaseapp.com",
  projectId: "batchingplantmanager-5f679",
  storageBucket: "batchingplantmanager-5f679.appspot.com",
  messagingSenderId: "643284217395",
  appId: "1:643284217395:web:e474af169185d52d3d7d46",
  measurementId: "G-JMF86KVYLP",
  databaseURL: "https://batchingplantmanager-5f679-default-rtdb.firebaseio.com"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { app, auth, firestore, storage, database };
