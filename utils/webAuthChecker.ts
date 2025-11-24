/**
 * Web Authentication Status Checker
 * Purpose: Verify authentication and critical systems for web platform
 * This helps diagnose issues with Google OAuth, Chat, and Search systems
 */

import { Platform } from 'react-native';

interface SystemStatus {
  googleAuth: boolean;
  chatSystem: boolean;
  searchSystem: boolean;
  firebaseConfig: boolean;
  backendConnection: boolean;
  webCompatibility: boolean;
}

export const checkWebSystemsHealth = async (): Promise<SystemStatus> => {
  const status: SystemStatus = {
    googleAuth: false,
    chatSystem: false,
    searchSystem: false,
    firebaseConfig: false,
    backendConnection: false,
    webCompatibility: false,
  };

  try {
    // Check if we're on web platform
    status.webCompatibility = Platform.OS === 'web';

    // Check Google OAuth configuration
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    status.googleAuth = !!googleClientId && googleClientId.length > 0;

    // Check Firebase configuration
    const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    const useFirestore = process.env.EXPO_PUBLIC_USE_FIRESTORE;
    status.firebaseConfig = !!firebaseApiKey && useFirestore !== '0';

    // Check backend connection
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (apiBaseUrl) {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        status.backendConnection = response.ok;
      } catch {
        status.backendConnection = false;
      }
    }

    // Check chat system availability
    try {
      const { chatService } = await import('./chatService');
      status.chatSystem = typeof chatService === 'object' && 
                          typeof chatService.createConversation === 'function';
    } catch {
      status.chatSystem = false;
    }

    // Check search system availability
    try {
      const { SearchScreen } = await import('../bottomBarScreens/SearchScreen');
      status.searchSystem = !!SearchScreen;
    } catch {
      status.searchSystem = false;
    }

  } catch (error) {
    // Silent fail for production
  }

  return status;
};

export const getSystemHealthSummary = (status: SystemStatus): string => {
  const issues = [];
  
  if (!status.webCompatibility) {
    issues.push('❌ Not running on web platform');
  }
  if (!status.googleAuth) {
    issues.push('❌ Google OAuth not configured');
  }
  if (!status.firebaseConfig) {
    issues.push('⚠️ Firebase not configured (may be using local storage)');
  }
  if (!status.backendConnection) {
    issues.push('❌ Backend server not reachable');
  }
  if (!status.chatSystem) {
    issues.push('❌ Chat system not available');
  }
  if (!status.searchSystem) {
    issues.push('❌ Search system not available');
  }

  if (issues.length === 0) {
    return '✅ All systems operational';
  }

  return issues.join('\n');
};

// Auto-check on web platform
if (Platform.OS === 'web' && typeof __DEV__ !== 'undefined' && __DEV__) {
  checkWebSystemsHealth().then(status => {
    const summary = getSystemHealthSummary(status);
    if (summary !== '✅ All systems operational') {
      // Use a single grouped console for dev debugging
      console.group('🔍 Web Systems Health Check');
      console.log(summary);
      console.log('Status:', status);
      console.groupEnd();
    }
  });
}
