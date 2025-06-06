// config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNoCvUhSyi8ABVDRiZzosmr8r10pwLMkU",
  authDomain: "kc-mvp-front.firebaseapp.com",
  projectId: "kc-mvp-front",
  storageBucket: "kc-mvp-front.firebasestorage.app",
  messagingSenderId: "585892136577",
  appId: "1:585892136577:web:24d26866084acd7b57af80",
  measurementId: "G-HS6BKY4CFD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);