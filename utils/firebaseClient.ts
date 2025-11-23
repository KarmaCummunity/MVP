// utils/firebaseClient.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import Constants from 'expo-constants';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Note: Fill real values from Firebase console or use environment variables
const extra = (Constants?.expoConfig as any)?.extra || (Constants as any)?.manifest?.extra || {};
const mode = (extra?.mode as string) || (process.env.NODE_ENV === 'production' ? 'prod' : 'dev');
const extraFb = (extra?.firebase?.[mode]) || {};
const firebaseConfig: Record<string, string | undefined> = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.EXPO_PUBLIC_FIREBASE_API_KEY || extraFb.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extraFb.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extraFb.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extraFb.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extraFb.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.EXPO_PUBLIC_FIREBASE_APP_ID || extraFb.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

export function getFirebase() {
  if (!getApps().length) {
    // Basic validation of critical configuration for clearer developer errors
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
      const msg = 'Firebase configuration is missing. Please set EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID.';
      console.error(msg);
      throw new Error(msg);
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  if (!db) {
    db = getFirestore(app);
    // Enable offline persistence (deprecation warning may appear in future Firebase versions; non-blocking)
    try {
      enableIndexedDbPersistence(db);
    } catch (e) {
      // May fail in Chrome/multiple tabs — non-blocking
      // console removed?.message);
    }
  }
  if (!storage) {
    storage = getStorage(app);
  }

  return { app, db, storage };
}

export type { Firestore };


