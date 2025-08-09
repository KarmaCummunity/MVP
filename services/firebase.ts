import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

let cachedApp: any = null;
let cachedAuth: any = null;

export const getFirebase = async (): Promise<{ app: any; auth: any }> => {
  if (cachedApp && cachedAuth) return { app: cachedApp, auth: cachedAuth };

  try {
    const firebaseConfig = ((Constants.expoConfig?.extra as any)?.firebase || {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    }) as any;

    const appModule: any = await (new Function("return import('firebase/app')"))();
    const authModule: any = await (new Function("return import('firebase/auth')"))();

    const app = appModule.getApps().length === 0
      ? appModule.initializeApp(firebaseConfig)
      : appModule.getApp();

    let auth: any;
    if (Platform.OS === 'web') {
      auth = authModule.getAuth(app);
    } else {
      try {
        auth = authModule.getAuth(app);
      } catch {
        auth = authModule.initializeAuth(app, {
          persistence: authModule.getReactNativePersistence(AsyncStorage),
        });
      }
    }

    cachedApp = app;
    cachedAuth = auth;
    return { app, auth };
  } catch (e) {
    // Firebase packages not installed yet
    return { app: null, auth: null } as any;
  }
};



