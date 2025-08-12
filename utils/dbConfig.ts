// utils/dbConfig.ts
// Control whether to use Firestore, AsyncStorage or Backend REST
// Can be enabled via environment variables:
// EXPO_PUBLIC_USE_FIRESTORE=1
// EXPO_PUBLIC_USE_BACKEND=1
// EXPO_PUBLIC_API_BASE_URL=http://localhost:3001

import { Platform } from 'react-native';

export const USE_FIRESTORE: boolean = process.env.EXPO_PUBLIC_USE_FIRESTORE === '1';
export const USE_BACKEND: boolean = process.env.EXPO_PUBLIC_USE_BACKEND === '1';

// Choose sensible default for local dev if not provided via env
const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://localhost:3001',
});

export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL || defaultBaseUrl!;

