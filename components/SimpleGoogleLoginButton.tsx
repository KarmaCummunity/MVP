import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { USE_BACKEND } from '../utils/dbConfig';
import { db } from '../utils/databaseService';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restAdapter } from '../utils/restAdapter';
import { logger } from '../utils/loggerService';

interface SimpleGoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  disabled?: boolean;
  style?: any;
}

export default function SimpleGoogleLoginButton({
  onSuccess,
  disabled = false,
  style,
}: SimpleGoogleLoginButtonProps) {
  const { t } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();

  // Get Google client IDs from environment
  const extra = (Constants?.expoConfig as any)?.extra ?? {};
  const iosClientId = extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Clear any stuck OAuth state on component mount
  useEffect(() => {
    const clearOAuthState = async () => {
      try {
        await AsyncStorage.removeItem('oauth_in_progress');
        logger.info('GoogleLogin', 'Cleared stuck OAuth state');
        logger.info('GoogleLogin', 'Component mounted', {
          platform: Platform.OS,
          hasConstants: !!Constants?.expoConfig,
          extraKeys: Object.keys(extra)
        });
        logger.info('GoogleLogin', 'Client IDs check', {
          iosClientId: !!iosClientId,
          iosClientIdValue: iosClientId || '(missing)',
          androidClientId: !!androidClientId,
          androidClientIdValue: androidClientId || '(missing)',
          webClientId: !!webClientId,
          webClientIdValue: webClientId || '(missing)'
        });
        logger.info('GoogleLogin', 'isGoogleAvailable calculation', {
          'Platform.OS !== "ios"': Platform.OS !== 'ios',
          '!!iosClientId': !!iosClientId,
          '(Platform.OS !== "ios" || !!iosClientId)': (Platform.OS !== 'ios' || !!iosClientId),
          'Platform.OS !== "web"': Platform.OS !== 'web',
          '!!webClientId': !!webClientId,
          '(Platform.OS !== "web" || !!webClientId)': (Platform.OS !== 'web' || !!webClientId),
          isGoogleAvailable
        });
      } catch (error) {
        console.error('Failed to clear OAuth state:', error);
      }
    };
    clearOAuthState();
  }, []);

  // Check if Google is available - using Web Client ID for all platforms
  const isGoogleAvailable = !!webClientId;

  // Initialize web auth session
  if (Platform.OS === 'web') {
    try { 
      WebBrowser.maybeCompleteAuthSession(); 
    } catch {}
  }

  // Configure OAuth request - using Web Client ID for all platforms (recommended for Expo)
  const oauthConfig: any = {
    clientId: webClientId, // Use web client ID for all platforms
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri: makeRedirectUri({
      scheme: 'com.navesarussi1.KarmaCommunity',
      path: 'oauthredirect',
    }),
  };
  
  // Expo fallback configuration
  if (webClientId) {
    oauthConfig.expoClientId = webClientId;
  }

  logger.info('GoogleLogin', 'OAuth config being used', oauthConfig);
  
  let request: any, response: any, promptAsync: any;
  try {
    [request, response, promptAsync] = Google.useAuthRequest(oauthConfig);
  } catch (e) {
    // If the hook throws, attempt a safer config with just web client ID
    logger.warn('GoogleLogin', 'useAuthRequest threw, retrying with basic config', {
      platform: Platform.OS,
      hasWeb: !!webClientId,
      error: String(e)
    });
    const fallbackConfig: any = {
      clientId: webClientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      redirectUri: makeRedirectUri({
        scheme: 'com.navesarussi1.KarmaCommunity',
        path: 'oauthredirect',
      }),
      expoClientId: webClientId,
    };
    [request, response, promptAsync] = Google.useAuthRequest(fallbackConfig);
  }

  // Log request state changes
  useEffect(() => {
    logger.info('GoogleLogin', 'OAuth request state', {
      request: !!request,
      response: response?.type || 'none',
      promptAsync: !!promptAsync
    });
    if (request) {
      logger.info('GoogleLogin', 'OAuth request config', {
        clientId: request.clientId || 'not set',
        scopes: request.scopes,
        responseType: request.responseType,
        redirectUri: request.redirectUri || 'not set'
      });
    }
  }, [request, response]);

  // Handle OAuth response
  useEffect(() => {
    const handleOAuthResponse = async () => {
      if (!response) {
        logger.info('GoogleLogin', 'No response yet');
        return;
      }

      try {
        logger.info('GoogleLogin', 'OAuth response received', {
          type: response.type,
          url: (response as any)?.url || 'no url',
          params: Object.keys((response as any)?.params || {}),
          authentication: Object.keys((response as any)?.authentication || {}),
          error: (response as any)?.error
        });

        if (response.type === 'cancel') {
          logger.info('GoogleLogin', 'User cancelled OAuth');
          await AsyncStorage.removeItem('oauth_in_progress');
          return;
        }

        if (response.type === 'error') {
          logger.error('GoogleLogin', 'OAuth error', (response as any)?.error);
          await AsyncStorage.removeItem('oauth_in_progress');
          return;
        }

        if (response.type !== 'success') {
          logger.warn('GoogleLogin', 'Unexpected response type', response.type);
          return;
        }

        // Extract user info from token or ID token
        let userData: any | null = null;
        
        // Handle ID token response only (no access token needed)
        const idToken = response.authentication?.idToken || (response as any)?.params?.id_token;
        
        logger.info('GoogleLogin', 'Token extraction', {
          hasIdToken: !!idToken,
          idTokenLength: idToken?.length || 0
        });
        
        if (idToken) {
          logger.info('GoogleLogin', 'Using ID token to extract user info');
          const profile = parseJWT(idToken);
          logger.info('GoogleLogin', 'User profile from JWT', {
            sub: profile?.sub,
            name: profile?.name,
            email: profile?.email,
            picture: !!profile?.picture
          });
          userData = createUserData(profile);
        } else {
          logger.error('GoogleLogin', 'No access token or ID token found!');
        }

        if (!userData) {
          Alert.alert('שגיאה', 'לא ניתן להתחבר עם Google');
          return;
        }

        // Optional backend verification
        if (USE_BACKEND) {
          try {
            const backendResponse = await restAdapter.post('/auth/google', {
              idToken: idToken
            });
            
            if ((backendResponse as any)?.ok && (backendResponse as any)?.user) {
              userData = { ...userData, ...(backendResponse as any).user };
            }
          } catch (error) {
            console.warn('🔑 Backend auth failed, continuing with client data:', error);
          }
        }

        // Set user in context and navigate
        await setSelectedUserWithMode(userData, 'real');
        
        // Save to backend if enabled
        if (USE_BACKEND) {
          try {
            await db.createUser(userData.id, userData);
          } catch (error) {
            console.warn('🔑 Failed to save user to backend:', error);
          }
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(userData);
        }

        // Navigate to home
        navigation.replace('HomeStack');
        
        await AsyncStorage.removeItem('oauth_in_progress');

      } catch (error) {
        console.error('❌ SimpleGoogleLogin - Error:', error);
        Alert.alert('שגיאה', 'התחברות נכשלה. נסה שוב.');
        await AsyncStorage.removeItem('oauth_in_progress');
      }
    };

    handleOAuthResponse();
  }, [response]);

  // Handle button press
  const handlePress = async () => {
    logger.info('GoogleLogin', 'handlePress called');
    
    if (disabled || !isGoogleAvailable) {
      logger.warn('GoogleLogin', 'Button disabled or Google not available', {
        disabled,
        isGoogleAvailable,
        platform: Platform.OS,
        webClientId: !!webClientId
      });
      return;
    }

    try {
      logger.info('GoogleLogin', 'Starting OAuth flow', {
        promptAsync: !!promptAsync,
        request: !!request
      });
      
      if (!promptAsync) {
        logger.error('GoogleLogin', 'promptAsync not available!');
        Alert.alert('שגיאה', 'OAuth לא זמין');
        return;
      }
      
      if (!request) {
        logger.error('GoogleLogin', 'OAuth request not ready!');
        Alert.alert('שגיאה', 'OAuth request לא מוכן');
        return;
      }
      
      logger.info('GoogleLogin', 'Setting oauth_in_progress');
      await AsyncStorage.setItem('oauth_in_progress', 'true');
      
      if (Platform.OS === 'web') {
        const config = {
          useProxy: false,
          windowName: '_self',
          redirectUri: makeRedirectUri()
        };
        logger.info('GoogleLogin', 'Starting web OAuth', config);
        
        logger.info('GoogleLogin', 'About to call promptAsync...');
        const result = await promptAsync(config as any);
        logger.info('GoogleLogin', 'promptAsync completed', result);
      } else {
        logger.info('GoogleLogin', 'Starting native OAuth');
        const result = await promptAsync();
        logger.info('GoogleLogin', 'promptAsync result', result);
      }
    } catch (error: any) {
      logger.error('GoogleLogin', 'Auth error', {
        error: error?.message || error,
        stack: error?.stack
      });
      Alert.alert('שגיאה OAuth', `OAuth נכשל: ${error?.message || error}`);
      await AsyncStorage.removeItem('oauth_in_progress');
    }
  };

  // Create user data from Google profile
  const createUserData = (profile: any) => ({
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

  // Parse JWT token payload (simplified)
  const parseJWT = (token: string) => {
    try {
      const [, payloadBase64] = token.split('.');
      return JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  };

  if (disabled || !isGoogleAvailable) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabled, style]} disabled>
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>
            {t('auth:googleCta') || 'התחבר עם Google'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={(e) => {
        e.preventDefault?.();
        e.stopPropagation?.();
        logger.info('GoogleLogin', 'Button pressed!');
        handlePress();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>
          {t('auth:googleCta') || 'התחבר עם Google'}
        </Text>
      </View>
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
  },
});
