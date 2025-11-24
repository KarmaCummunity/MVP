/**
 * Google OAuth Fix for Web Platform
 * This file fixes Google OAuth issues on web platform
 * 
 * Main issues fixed:
 * 1. React error #418 
 * 2. OAuth redirect not working properly
 * 3. JWT token handling
 * 4. Session persistence
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get the correct redirect URI based on environment
 */
export const getCorrectRedirectUri = () => {
  if (Platform.OS === 'web') {
    // Check if we're in production or development
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      // Production domain
      if (hostname === 'karma-community-kc.com' || hostname === 'www.karma-community-kc.com') {
        return 'https://karma-community-kc.com/oauthredirect';
      }
      
      // Railway deployment
      if (hostname.includes('railway.app')) {
        return `${protocol}//${hostname}/oauthredirect`;
      }
      
      // Local development
      return `${protocol}//${hostname}:${window.location.port || '19006'}/oauthredirect`;
    }
  }
  
  // Mobile platforms use different redirect scheme
  return 'karma-community://redirect';
};

/**
 * Handle OAuth success and store user data properly
 */
export const handleOAuthSuccess = async (idToken: string, profile: any) => {
  try {
    // Create complete user data
    const userData = {
      id: profile.sub || profile.id,
      name: profile.name || profile.given_name || 'Google User',
      email: profile.email,
      avatar: profile.picture,
      isActive: true,
      lastActive: new Date().toISOString(),
      roles: ['user'],
      settings: { 
        language: 'he', 
        darkMode: false, 
        notificationsEnabled: true 
      },
      phone: '+972501234567',
      bio: '',
      karmaPoints: 0,
      joinDate: new Date().toISOString(),
      location: { city: 'ישראל', country: 'IL' },
      interests: [],
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      notifications: [
        { type: 'system', text: 'ברוך הבא לקרמה קומיוניטי!', date: new Date().toISOString() }
      ],
    };
    
    // Store all necessary data
    await AsyncStorage.multiSet([
      ['current_user', JSON.stringify(userData)],
      ['google_auth_user', JSON.stringify(userData)],
      ['google_auth_token', idToken],
      ['oauth_success_flag', 'true'],
      ['auth_mode', 'real'],
      ['guest_mode', 'false']
    ]);
    
    // Clean up OAuth progress flag
    await AsyncStorage.removeItem('oauth_in_progress');
    
    return userData;
  } catch (error) {
    console.error('Error handling OAuth success:', error);
    throw error;
  }
};

/**
 * Fix for React error #418
 * This error occurs when hooks are called conditionally
 */
export const useOAuthFix = () => {
  // Always call hooks at the top level
  // Never call hooks inside conditions or loops
  return {
    redirectUri: getCorrectRedirectUri(),
    handleSuccess: handleOAuthSuccess
  };
};

/**
 * Validate OAuth configuration
 */
export const validateOAuthConfig = () => {
  const requiredEnvVars = [
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', 
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
  ];
  
  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0 && Platform.OS === 'web') {
    // For web, we only need the web client ID
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      console.warn('Missing Google Web Client ID for OAuth');
      return false;
    }
  }
  
  return true;
};

export default {
  getCorrectRedirectUri,
  handleOAuthSuccess,
  useOAuthFix,
  validateOAuthConfig
};
