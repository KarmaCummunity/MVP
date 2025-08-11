// utils/dbConfig.ts
// שליטה האם להשתמש ב-Firestore או ב-AsyncStorage או Backend REST
// ניתן להפעיל דרך משתני סביבה:
// EXPO_PUBLIC_USE_FIRESTORE=1
// EXPO_PUBLIC_USE_BACKEND=1
// EXPO_PUBLIC_API_BASE_URL=http://localhost:3001

export const USE_FIRESTORE: boolean = process.env.EXPO_PUBLIC_USE_FIRESTORE === '1';
export const USE_BACKEND: boolean = process.env.EXPO_PUBLIC_USE_BACKEND === '1';
export const API_BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

