import Constants from 'expo-constants';

// File overview:
// - Purpose: Central configuration for backend usage, API base URL, caching, sync, offline, and feature flags.
// - Reached from: `apiService`, `enhancedDatabaseService`, and many utils to decide backend vs local.
// - Exports: USE_BACKEND, USE_FIRESTORE, API_BASE_URL, endpoints, cache/sync/perf/feature configs.
// Database and Backend Configuration
// This file controls whether to use the backend API or local storage

// Environment configuration - safe check for __DEV__
let isDevelopmentMode = false;
try {
  isDevelopmentMode = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
} catch (e) {
  // If __DEV__ is not defined, assume production
  isDevelopmentMode = false;
}
export const IS_DEVELOPMENT = isDevelopmentMode;
export const IS_PRODUCTION = !isDevelopmentMode;

const DEFAULT_API_BASE_URLS = {
  development: 'http://localhost:3001',
  production: 'https://kc-mvp-server-production.up.railway.app',
};

type ExpoExtra = Record<string, any>;
const expoExtra: ExpoExtra = (() => {
  try {
    return (Constants?.expoConfig as any)?.extra || (Constants as any)?.manifest?.extra || {};
  } catch (_error) {
    return {};
  }
})();

const sanitizeBaseUrl = (value?: string | null): string | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed === '/' || trimmed === './' || trimmed === '.') {
    return '';
  }
  return trimmed.replace(/\/+$/, '');
};

const resolveApiBaseUrl = (): string => {
  const candidates = [
    process.env.EXPO_PUBLIC_API_BASE_URL,
    process.env.EXPO_PUBLIC_API_URL,
    expoExtra?.EXPO_PUBLIC_API_BASE_URL,
    expoExtra?.EXPO_PUBLIC_API_URL,
    expoExtra?.apiBaseUrl,
  ];

  for (const candidate of candidates) {
    const sanitized = sanitizeBaseUrl(candidate);
    if (sanitized !== null) {
      return sanitized;
    }
  }

  return IS_PRODUCTION
    ? DEFAULT_API_BASE_URLS.production
    : DEFAULT_API_BASE_URLS.development;
};

const RESOLVED_API_BASE_URL = resolveApiBaseUrl();

// Backend configuration
export const BACKEND_CONFIG = {
  // Base URLs for different environments
  development: DEFAULT_API_BASE_URLS.development,
  production: DEFAULT_API_BASE_URLS.production,
  resolved: RESOLVED_API_BASE_URL,
  
  // Feature flags
  USE_REAL_API: true, // Set to false to use fake data during development
  USE_CACHING: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // API timeouts
  REQUEST_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Determine if we should use the backend
export const USE_BACKEND = BACKEND_CONFIG.USE_REAL_API && (
  IS_DEVELOPMENT || IS_PRODUCTION
);

// Firestore configuration (currently disabled)
export const USE_FIRESTORE = false;

// Get the appropriate API URL
export const getApiUrl = (): string => RESOLVED_API_BASE_URL;

// Canonical API base URL used across the app
export const API_BASE_URL = RESOLVED_API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER_REGISTER: '/api/users/register',
  USER_LOGIN: '/api/users/login',
  USER_PROFILE: '/api/users',
  USER_STATS: '/api/users/{id}/stats',
  USER_ACTIVITIES: '/api/users/{id}/activities',
  
  // Donation endpoints
  DONATIONS: '/api/donations',
  DONATION_CATEGORIES: '/api/donations/categories',
  DONATION_STATS: '/api/donations/stats/summary',
  
  // Ride endpoints
  RIDES: '/api/rides',
  RIDE_BOOK: '/api/rides/{id}/book',
  RIDE_STATS: '/api/rides/stats/summary',
  
  // Chat endpoints
  CHAT_CONVERSATIONS: '/api/chat/conversations',
  CHAT_MESSAGES: '/api/chat/messages',
  CHAT_SEARCH: '/api/chat/search',
  
  // Stats endpoints
  COMMUNITY_STATS: '/api/stats/community',
  DASHBOARD_STATS: '/api/stats/dashboard',
  REAL_TIME_STATS: '/api/stats/real-time',
  CATEGORY_ANALYTICS: '/api/stats/analytics/categories',
  
  // Health check
  HEALTH: '/health',
};

// Data synchronization settings
export const SYNC_CONFIG = {
  // How often to sync data when app is active (milliseconds)
  ACTIVE_SYNC_INTERVAL: 30 * 1000, // 30 seconds
  
  // How often to sync data when app is in background (milliseconds)
  BACKGROUND_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Collections that should sync automatically
  AUTO_SYNC_COLLECTIONS: [
    'donations',
    'rides',
    'community_stats',
    'user_activities'
  ],
  
  // Collections that require manual sync
  MANUAL_SYNC_COLLECTIONS: [
    'chat_messages',
    'notifications'
  ]
};

// Local storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'karma_user_data',
  USER_SETTINGS: 'karma_user_settings',
  CACHED_DONATIONS: 'karma_cached_donations',
  CACHED_RIDES: 'karma_cached_rides',
  CACHED_STATS: 'karma_cached_stats',
  LAST_SYNC: 'karma_last_sync',
  OFFLINE_QUEUE: 'karma_offline_queue',
};

// Offline mode configuration
export const OFFLINE_CONFIG = {
  // Maximum number of actions to queue when offline
  MAX_QUEUE_SIZE: 100,
  
  // Actions that can be performed offline
  OFFLINE_ACTIONS: [
    'create_donation',
    'update_profile',
    'send_message',
    'bookmark_item'
  ],
  
  // Data that should be available offline
  OFFLINE_DATA: [
    'user_profile',
    'donation_categories',
    'recent_donations',
    'user_conversations'
  ]
};

// Logging configuration
export const LOGGING_CONFIG = {
  ENABLE_API_LOGGING: IS_DEVELOPMENT,
  ENABLE_SYNC_LOGGING: IS_DEVELOPMENT,
  ENABLE_ERROR_LOGGING: true,
  LOG_LEVEL: IS_DEVELOPMENT ? 'debug' : 'error',
};

// Cache configuration
export const CACHE_CONFIG = {
  // Cache keys with their expiration times (milliseconds)
  CACHE_EXPIRY: {
    user_profile: 15 * 60 * 1000, // 15 minutes
    donation_categories: 60 * 60 * 1000, // 1 hour
    community_stats: 10 * 60 * 1000, // 10 minutes
    donations_list: 5 * 60 * 1000, // 5 minutes
    rides_list: 5 * 60 * 1000, // 5 minutes
    chat_conversations: 2 * 60 * 1000, // 2 minutes
  },
  
  // Maximum cache size per collection
  MAX_CACHE_SIZE: {
    donations: 1000,
    rides: 500,
    messages: 10000,
    activities: 500,
  }
};

// Performance monitoring
export const PERFORMANCE_CONFIG = {
  // Track API response times
  TRACK_API_PERFORMANCE: IS_DEVELOPMENT,
  
  // Alert if API response time exceeds this (milliseconds)
  SLOW_API_THRESHOLD: 3000,
  
  // Track app performance metrics
  TRACK_APP_PERFORMANCE: true,
  
  // Report performance issues automatically
  AUTO_REPORT_ISSUES: IS_PRODUCTION,
};

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  // New backend API
  USE_NEW_API: true,
  
  // Real-time features
  ENABLE_REAL_TIME_CHAT: true,
  ENABLE_REAL_TIME_STATS: true,
  
  // Advanced features
  ENABLE_ANALYTICS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  
  // Experimental features
  ENABLE_AI_RECOMMENDATIONS: false,
  ENABLE_ADVANCED_SEARCH: true,
};

// Validation function - call manually when needed
export const validateConfig = (): boolean => {
  try {
    // Check if API URL is valid
    const apiUrl = getApiUrl();
    const isRelativeUrl = apiUrl === '';
    const isAbsoluteUrl = /^https?:\/\//i.test(apiUrl);

    if (!isRelativeUrl && !isAbsoluteUrl) {
      console.warn('⚠️ Invalid API URL:', apiUrl);
      return false;
    }

    if (IS_PRODUCTION && isRelativeUrl) {
      console.warn('⚠️ API base URL resolves to current origin in production. Make sure your hosting layer proxies /api to the backend or set EXPO_PUBLIC_API_BASE_URL explicitly.');
    }
    
    console.log('✅ Configuration validated successfully');
    console.log('🔧 Config:', {
      useBackend: USE_BACKEND,
      apiUrl: isRelativeUrl ? '(current origin)' : apiUrl,
      environment: IS_PRODUCTION ? 'production' : 'development',
      features: Object.entries(FEATURE_FLAGS)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature)
    });
    
    return true;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    return false;
  }
};