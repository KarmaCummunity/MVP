import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, Alert, Dimensions } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../stores/userStore';
import { db } from '../utils/databaseService';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/loggerService';
import { getScreenInfo, scaleSize } from '../globals/responsive';
import { getAuth, GoogleAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import { getFirebase } from '../utils/firebaseClient';

interface SimpleGoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  disabled?: boolean;
  style?: any;
}

// Google OAuth response types
interface GoogleAuthSuccessResponse {
  type: 'success';
  params: Record<string, string>;
  authentication: any;
  url: string;
}

interface GoogleAuthErrorResponse {
  type: 'error';
  error: {
    description?: string;
    message?: string;
    [key: string]: any;
  } | null;
  errorCode: string | null;
  params: Record<string, string>;
  authentication: any;
  url: string;
}

interface GoogleAuthCancelResponse {
  type: 'cancel';
  params: Record<string, string>;
  authentication: any;
  url: string;
}

type GoogleAuthResponse = GoogleAuthSuccessResponse | GoogleAuthErrorResponse | GoogleAuthCancelResponse;

// Type guard for Google OAuth success response
const isGoogleAuthSuccess = (response: any): response is GoogleAuthSuccessResponse => {
  return response.type === 'success' && response.params && typeof response.params === 'object';
};

// Parse JWT token payload
const parseJWT = (token: string) => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Validate essential fields
    if (!payload.sub || !payload.email) return null;
    
    // Check token expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        logger.error('GoogleLogin', 'JWT token expired');
        return null;
      }
    }
    
    return payload;
  } catch (error) {
    logger.error('GoogleLogin', 'Failed to parse JWT', { error: String(error) });
    return null;
  }
};

// Create user data from Google profile
const createUserData = (profile: any, t: (k: string) => string) => ({
  id: profile.sub,
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
});

export default function SimpleGoogleLoginButton({
  onSuccess,
  disabled = false,
  style,
}: SimpleGoogleLoginButtonProps) {
  // All hooks must be at the top level, always in the same order
  const { t, i18n } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  
  // State hooks
  const [authState, setAuthState] = useState<'idle' | 'ready' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTranslationReady, setIsTranslationReady] = useState(false);
  
  // Debug translation hook
  useEffect(() => {
    if (i18n.isInitialized) {
      logger.info('GoogleLogin', 'Translation initialized', { 
        language: i18n.language,
        namespaces: i18n.reportNamespaces?.getUsedNamespaces() || [],
        hasAuthNamespace: i18n.hasResourceBundle(i18n.language, 'auth'),
        availableLanguages: Object.keys(i18n.options.resources || {}),
        currentResources: i18n.options.resources?.[i18n.language] || {}
      });
      
      // Check if auth namespace resources are loaded
      const authResources = i18n.options.resources?.[i18n.language]?.auth as any;
      if (authResources) {
        logger.info('GoogleLogin', 'Auth namespace resources found', {
          hasGoogleCta: !!authResources.googleCta,
          googleCtaValue: authResources.googleCta
        });
      } else {
        logger.warn('GoogleLogin', 'Auth namespace resources not found', {
          language: i18n.language,
          availableNamespaces: Object.keys(i18n.options.resources?.[i18n.language] || {})
        });
      }
      
      // Test translation directly from i18n instance
      try {
        const directTranslation = i18n.t('googleCta', { ns: 'auth' });
        logger.info('GoogleLogin', 'Direct translation test', { 
          key: 'googleCta',
          result: directTranslation,
          isWorking: directTranslation && directTranslation !== 'googleCta'
        });
        
        // Also test the hook translation
        const testTranslation = t('googleCta', { ns: 'auth' });
        logger.info('GoogleLogin', 'Hook translation test', { 
          key: 'googleCta',
          result: testTranslation,
          isWorking: testTranslation && testTranslation !== 'googleCta'
        });
        
        // Test a simple key to see if translation is working at all
        const simpleTest = t('title', { ns: 'auth' });
        logger.info('GoogleLogin', 'Simple translation test', {
          key: 'title',
          result: simpleTest,
          isWorking: simpleTest && simpleTest !== 'title'
        });
        
        // Set translation ready if either test was successful
        if ((testTranslation && testTranslation !== 'googleCta' && testTranslation.trim() !== '') ||
            (directTranslation && directTranslation !== 'googleCta' && directTranslation.trim() !== '') ||
            (simpleTest && simpleTest !== 'title' && simpleTest.trim() !== '')) {
          setIsTranslationReady(true);
        }
      } catch (error) {
        logger.error('GoogleLogin', 'Translation test failed', { error: String(error) });
      }
    }
    
    // Fallback: if translation is not ready after 3 seconds, use fallback text
    const timeoutId = setTimeout(() => {
      if (!isTranslationReady) {
        logger.warn('GoogleLogin', 'Translation timeout, using fallback');
        setIsTranslationReady(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [i18n.isInitialized, i18n.language, t, isTranslationReady]);
  
  // Get client IDs
  const extra = (Constants?.expoConfig as any)?.extra ?? {};
  const iosClientId = extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Check if Google is available
  const isGoogleAvailable = (() => {
    if (Platform.OS === 'ios') return !!(iosClientId || webClientId);
    if (Platform.OS === 'android') return !!(androidClientId || webClientId);
    if (Platform.OS === 'web') return !!webClientId;
    return false;
  })();

  // Configure redirect URI
  // IMPORTANT: This URI must be added to Google Cloud Console > OAuth 2.0 Client > Authorized redirect URIs
  const redirectUri = Platform.OS === 'web' 
    ? (() => {
        if (typeof window !== 'undefined') {
          // Use actual origin for localhost development
          const origin = window.location.origin;
          logger.debug('GoogleLogin', 'Using redirect URI from window.location', { origin });
          return `${origin}/oauthredirect`;
        }
        return 'https://karma-community-kc.com/oauthredirect';
      })()
    : makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' });
  
  // Log redirect URI for debugging (helps identify what needs to be added to Google Console)
  useEffect(() => {
    logger.info('GoogleLogin', 'Redirect URI configured', { 
      redirectUri, 
      platform: Platform.OS,
      note: 'If you see redirect_uri_mismatch error, add this exact URI to Google Cloud Console'
    });
  }, [redirectUri]);

  // OAuth configuration
  const oauthConfig = {
    iosClientId,
    androidClientId,
    webClientId,
    expoClientId: webClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token' as const,
    redirectUri,
  };

  // Always call useAuthRequest - no conditional hooks!
  const [request, response, promptAsync] = isGoogleAvailable 
    ? Google.useAuthRequest(oauthConfig)
    : [null, null, null];

  // Handle successful OAuth data from redirect
  const handleStoredAuthData = useCallback(async () => {
    try {
      const oauthSuccess = await AsyncStorage.getItem('oauth_success_flag');
      const userData = await AsyncStorage.getItem('google_auth_user');
      const token = await AsyncStorage.getItem('google_auth_token');
      
      if (oauthSuccess && userData && token) {
        logger.info('GoogleLogin', 'Processing stored OAuth success data');
        
        const parsedUserData = JSON.parse(userData);
        
        // Set user in context
        await setSelectedUserWithMode(parsedUserData, 'real');
        
        // Save to database
        try {
          await db.createUser(parsedUserData.id, parsedUserData);
          logger.info('GoogleLogin', 'User saved to database');
        } catch (dbError) {
          logger.warn('GoogleLogin', 'DB save failed', { error: String(dbError) });
        }
        
        // Success callback
        if (onSuccess) onSuccess(parsedUserData);
        
        // Clean up
        await AsyncStorage.multiRemove(['oauth_success_flag', 'google_auth_user', 'google_auth_token']);
        
        // Small delay to ensure state is updated and MainNavigator re-renders
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate
        navigation.replace('HomeStack');
        
        setAuthState('success');
        return true;
      }
    } catch (error) {
      logger.error('GoogleLogin', 'Failed to process stored auth data', { error: String(error) });
    }
    return false;
  }, [setSelectedUserWithMode, onSuccess, navigation]);

  // Initialization effect
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        setAuthState('ready');
        
        // Check for stored auth data first
        const handled = await handleStoredAuthData();
        if (handled && mounted) return;
        
        // Clear any stuck state
        await AsyncStorage.removeItem('oauth_in_progress');
        
        if (mounted) {
          setIsInitialized(true);
          logger.info('GoogleLogin', 'Initialized successfully', { 
            isGoogleAvailable, 
            redirectUri,
            platform: Platform.OS 
          });
        }
      } catch (error) {
        logger.error('GoogleLogin', 'Initialization failed', { error: String(error) });
        if (mounted) {
          setAuthState('error');
          setErrorMessage('Failed to initialize Google authentication');
        }
      }
    };

    initialize();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run once

  // Handle OAuth response
  useEffect(() => {
    if (!response || !isInitialized) return;

    const handleResponse = async () => {
      logger.info('GoogleLogin', 'OAuth response received', { 
        type: response.type
      });

      try {
        if (response.type === 'success' && isGoogleAuthSuccess(response)) {
          // For id_token response type, the token is in response.params.id_token
          const idToken = response.params.id_token;
          
          if (!idToken) {
            logger.error('GoogleLogin', 'No ID token found in response params', {
              availableParams: Object.keys(response.params),
              params: response.params
            });
            throw new Error('No ID token received');
          }

          logger.info('GoogleLogin', 'ID token received', { 
            tokenLength: idToken.length,
            tokenStart: idToken.substring(0, 20) + '...'
          });

          const profile = parseJWT(idToken);
          if (!profile) {
            throw new Error('Invalid token payload');
          }

          logger.info('GoogleLogin', 'Google profile parsed', { 
            email: profile.email,
            name: profile.name,
            sub: profile.sub
          });

          // 🔥 NEW: Sign in to Firebase Auth with Google credential
          // This enables Firebase persistence and the onAuthStateChanged listener
          try {
            const { app } = getFirebase();
            const auth = getAuth(app);
            const credential = GoogleAuthProvider.credential(idToken);
            
            logger.info('GoogleLogin', 'Signing in to Firebase with Google credential');
            const firebaseUserCredential = await signInWithCredential(auth, credential);
            const firebaseUser = firebaseUserCredential.user;
            
            logger.info('GoogleLogin', 'Firebase sign-in successful', {
              uid: firebaseUser.uid,
              email: firebaseUser.email
            });
            
            // Update Firebase profile if needed
            if (!firebaseUser.displayName && profile.name) {
              await updateProfile(firebaseUser, {
                displayName: profile.name,
                photoURL: profile.picture
              });
              logger.info('GoogleLogin', 'Updated Firebase user profile');
            }
            
            // The Firebase Auth listener in UserContext will automatically:
            // 1. Create the userData
            // 2. Save to AsyncStorage
            // 3. Update the context
            // 4. Enable automatic session restore
            
            logger.info('GoogleLogin', 'Google login completed - Firebase Auth listener will handle the rest');
            
          } catch (firebaseError) {
            logger.error('GoogleLogin', 'Firebase sign-in failed, falling back to manual auth', {
              error: String(firebaseError)
            });
            
            // Fallback: Manual authentication (old flow)
            const userData = createUserData(profile, t);
            await setSelectedUserWithMode(userData, 'real');
            
            try {
              await db.createUser(userData.id, userData);
              logger.info('GoogleLogin', 'User saved to database (fallback)');
            } catch (dbError) {
              logger.warn('GoogleLogin', 'Database save failed (fallback)', { error: String(dbError) });
            }
            
            if (onSuccess) onSuccess(userData);
          }

          // Small delay to ensure state is updated and MainNavigator re-renders
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate to home
          navigation.replace('HomeStack');
          setAuthState('success');
          
        } else if (response.type === 'error') {
          const errorMessage = response.error?.description || response.error?.message || 'OAuth failed';
          logger.error('GoogleLogin', 'OAuth error response', {
            error: response.error,
            errorMessage
          });
          throw new Error(errorMessage);
        } else if (response.type === 'cancel') {
          logger.info('GoogleLogin', 'OAuth cancelled by user');
          setAuthState('ready');
        } else if (response.type === 'dismiss' || response.type === 'opened' || response.type === 'locked') {
          logger.info('GoogleLogin', 'OAuth response dismissed/opened/locked', { type: response.type });
          setAuthState('ready');
        } else {
          logger.warn('GoogleLogin', 'Unknown response type', { response });
          setAuthState('ready');
        }
      } catch (error) {
        logger.error('GoogleLogin', 'OAuth response handling failed', { error: String(error) });
        setAuthState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        Alert.alert(
          'Authentication Error',
          error instanceof Error ? error.message : 'Authentication failed'
        );
      } finally {
        await AsyncStorage.removeItem('oauth_in_progress');
      }
    };

    handleResponse();
  }, [response, isInitialized, setSelectedUserWithMode, onSuccess, navigation, t]);

  // Handle button press
  const handlePress = useCallback(async () => {
    if (!isGoogleAvailable || !promptAsync || authState === 'authenticating') {
      return;
    }

    try {
      setAuthState('authenticating');
      setErrorMessage('');
      
      await AsyncStorage.setItem('oauth_in_progress', 'true');
      
      logger.info('GoogleLogin', 'Starting OAuth flow');
      
      if (Platform.OS === 'web') {
        await promptAsync({ 
          windowName: '_self'
        });
      } else {
        await promptAsync();
      }
      
    } catch (error) {
      logger.error('GoogleLogin', 'OAuth prompt failed', { error: String(error) });
      setAuthState('error');
      setErrorMessage('Failed to start authentication');
      await AsyncStorage.removeItem('oauth_in_progress');
      
      Alert.alert(
        'Authentication Error', 
        'Failed to start Google authentication. Please try again.'
      );
    }
  }, [isGoogleAvailable, promptAsync, authState, redirectUri]);

  // Get button text based on state
  const getButtonText = () => {
    switch (authState) {
      case 'idle': return 'מתכונן...';
      case 'authenticating': return 'מתחבר...';
      case 'success': return 'התחבר בהצלחה!';
      case 'error': return 'נסה שוב';
      default: {
        // Show loading while translation is initializing
        if (!isTranslationReady) {
          return 'טוען...';
        }
        
        // Fallback text in Hebrew (default language)
        const fallbackText = 'התחבר/הרשם עם גוגל';
        
        try {
          const translatedText = t('googleCta', { ns: 'auth' });
          
          // Log the translation attempt for debugging
          logger.debug('GoogleLogin', 'Translation attempt', { 
            key: 'googleCta',
            namespace: 'auth',
            result: translatedText,
            isTranslationReady,
            currentLanguage: i18n.language
          });
          
          // Return translated text if it's valid
          if (translatedText && translatedText !== 'googleCta' && translatedText.trim() !== '') {
            return translatedText;
          }
          
          // Return fallback if translation is not valid
          return fallbackText;
        } catch (error) {
          logger.warn('GoogleLogin', 'Translation failed, using fallback', { error: String(error) });
          return fallbackText;
        }
      }
    }
  };
  
  // Fallback button text that doesn't rely on translation
  const getFallbackButtonText = () => {
    switch (authState) {
      case 'idle': return 'מתכונן...';
      case 'authenticating': return 'מתחבר...';
      case 'success': return 'התחבר בהצלחה!';
      case 'error': return 'נסה שוב';
      default: return 'התחבר/הרשם עם גוגל';
    }
  };

  // Get button icon
  const getButtonIcon = () => {
    switch (authState) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      default: return 'logo-google';
    }
  };

  // Check if button should be disabled
  const isButtonDisabled = !isGoogleAvailable || !promptAsync || authState === 'authenticating' || disabled;

  // Get responsive values
  const { isTablet, isDesktop, width } = getScreenInfo();
  const isDesktopWeb = Platform.OS === 'web' && width > 1024;
  const buttonPaddingH = isDesktopWeb ? 32 : isTablet ? 28 : 24;
  const buttonPaddingV = isDesktopWeb ? 16 : isTablet ? 14 : 12;
  const buttonMinWidth = isDesktopWeb ? 280 : isTablet ? 240 : 200;
  const buttonMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
  const buttonBorderRadius = isDesktopWeb ? 14 : isTablet ? 13 : 12;
  const buttonFontSize = isDesktopWeb ? 18 : isTablet ? 17 : scaleSize(16);
  const buttonIconSize = isDesktopWeb ? 22 : isTablet ? 21 : 20;

  if (!isGoogleAvailable) {
    logger.warn('GoogleLogin', 'Google authentication not available', { platform: Platform.OS });
  }

  return (
    <TouchableOpacity 
      style={[
        {
          backgroundColor: '#4285F4',
          borderRadius: buttonBorderRadius,
          paddingHorizontal: buttonPaddingH,
          paddingVertical: buttonPaddingV,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          alignSelf: 'center',
          minWidth: buttonMinWidth,
          maxWidth: buttonMaxWidth,
        },
        isButtonDisabled && styles.disabled,
        authState === 'error' && styles.error,
        authState === 'success' && styles.success,
        style
      ]} 
      onPress={handlePress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons 
          name={getButtonIcon()} 
          size={buttonIconSize} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={[styles.text, { fontSize: buttonFontSize }]}>
          {(() => {
            const buttonText = getButtonText() || getFallbackButtonText();
            // Ensure we always return a valid string, never undefined or empty
            return buttonText && typeof buttonText === 'string' && buttonText.trim() !== '' 
              ? buttonText 
              : 'התחבר/הרשם עם גוגל';
          })()}
        </Text>
      </View>
      
      {errorMessage && authState === 'error' && (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: '#ccc',
  },
  error: {
    backgroundColor: '#dc3545',
  },
  success: {
    backgroundColor: '#28a745',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});
// Force update Wed Sep  3 22:44:11 EEST 2025
