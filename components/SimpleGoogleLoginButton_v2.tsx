import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { db } from '../utils/databaseService';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/loggerService';

interface SimpleGoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  disabled?: boolean;
  style?: any;
}

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
  const { t } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  
  // State hooks
  const [authState, setAuthState] = useState<'idle' | 'ready' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

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
  const redirectUri = Platform.OS === 'web' 
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://karma-community-kc.com'}/oauthredirect`
    : makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' });

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
        type: response.type,
        hasAuthentication: !!response.authentication 
      });

      try {
        if (response.type === 'success') {
          const idToken = response.authentication?.idToken;
          
          if (!idToken) {
            throw new Error('No ID token received');
          }

          const profile = parseJWT(idToken);
          if (!profile) {
            throw new Error('Invalid token payload');
          }

          logger.info('GoogleLogin', 'Google profile parsed', { 
            email: profile.email,
            name: profile.name 
          });

          const userData = createUserData(profile, t);
          
          // Set user
          await setSelectedUserWithMode(userData, 'real');
          
          // Save to database
          try {
            await db.createUser(userData.id, userData);
          } catch (dbError) {
            logger.warn('GoogleLogin', 'Database save failed', { error: String(dbError) });
          }

          // Success callback
          if (onSuccess) onSuccess(userData);

          // Navigate
          navigation.replace('HomeStack');
          
          setAuthState('success');
          
        } else if (response.type === 'error') {
          throw new Error(response.error?.description || 'OAuth failed');
        } else if (response.type === 'cancel') {
          logger.info('GoogleLogin', 'OAuth cancelled by user');
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
          useProxy: false, 
          windowName: '_self',
          redirectUri 
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
      default: return t('auth:googleCta') || 'התחבר/הרשם עם גוגל';
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

  if (!isGoogleAvailable) {
    logger.warn('GoogleLogin', 'Google authentication not available', { platform: Platform.OS });
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
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
          size={20} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={styles.text}>
          {getButtonText()}
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
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
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
