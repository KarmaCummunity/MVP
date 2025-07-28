// config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these with your actual Firebase configuration
// 1. Go to https://console.firebase.google.com
// 2. Click on your project (or create a new one)
// 3. Click the gear icon ⚙️ → Project Settings
// 4. Scroll down to "Your apps" section
// 5. If no app exists, click "Add app" → Web (</> icon)
// 6. Copy the configuration object and replace the values below

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Looks like: "AIzaSyD-XXXXXXXXXXXXXXXXXX"
  authDomain: "YOUR_AUTH_DOMAIN", // Looks like: "your-project.firebaseapp.com"
  projectId: "YOUR_PROJECT_ID", // Looks like: "your-project-id"
  storageBucket: "YOUR_STORAGE_BUCKET", // Looks like: "your-project.appspot.com"
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Looks like: "123456789012"
  appId: "YOUR_APP_ID", // Looks like: "1:123456789012:web:abcdef123456"
  measurementId: "YOUR_MEASUREMENT_ID" // Optional - Looks like: "G-XXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);