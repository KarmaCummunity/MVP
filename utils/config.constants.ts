// Minimal configuration constants file
// This file ONLY exports constants with no logic to avoid circular dependencies

// Simple environment detection
const projectEnv = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ENVIRONMENT)
  || (typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production');

export const IS_DEVELOPMENT = projectEnv === 'development';
export const IS_PRODUCTION = projectEnv === 'production';
export const CURRENT_ENVIRONMENT = projectEnv;

// Simple API URL resolution - no complex logic
const getSimpleApiUrl = (): string => {
  // Try environment variables first
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Fallback to appropriate environment URL
  return IS_PRODUCTION
    ? 'https://kc-mvp-server-production.up.railway.app'
    : 'https://kc-mvp-server-dev.up.railway.app';
};

// Export as constant, evaluated once
export const API_BASE_URL = getSimpleApiUrl();

// Simple feature flags
export const USE_BACKEND = true;
export const USE_FIRESTORE = false;

