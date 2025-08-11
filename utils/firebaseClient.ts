// utils/firebaseClient.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// הערה: יש למלא ערכים אמיתיים מהקונסולה של Firebase או להשתמש במשתני סביבה
const firebaseConfig: Record<string, string | undefined> = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
}

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

export function getFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  if (!db) {
    db = getFirestore(app);
    // הפעלת Offline persistence כאשר רץ מחוץ ל-Web או אם אפשרי
    try {
      enableIndexedDbPersistence(db);
    } catch (e) {
      // יכול להיכשל בכרום/מולטיפלים טאבים — זה לא חוסם
      console.warn('Firestore persistence not enabled:', (e as any)?.message);
    }
  }
  if (!storage) {
    storage = getStorage(app);
  }

  return { app, db, storage };
}

export type { Firestore };


