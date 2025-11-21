// Minimal configuration constants file
// This file ONLY exports constants with no logic to avoid circular dependencies

// Simple environment detection
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const IS_DEVELOPMENT = isDev;
export const IS_PRODUCTION = !isDev;

// Simple API URL resolution - no complex logic
const getSimpleApiUrl = (): string => {
  // Try environment variables first
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Fallback to production URL
  return IS_PRODUCTION 
    ? 'https://kc-mvp-server-production.up.railway.app'
    : 'http://localhost:3001';
};

// Export as constant, evaluated once
export const API_BASE_URL = getSimpleApiUrl();

// Simple feature flags
export const USE_BACKEND = true;
export const USE_FIRESTORE = false;

