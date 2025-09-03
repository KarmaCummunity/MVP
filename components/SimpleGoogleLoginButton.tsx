import React, { useEffect, useState } from 'react';
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
import { runAuthDiagnostics } from '../utils/authTestUtils';

// Extend window interface for diagnostics tracking
declare global {
  interface Window {
    __authDiagnosticsRun?: boolean;
  }
}

// Auth validation utilities (optimized)
const validateOAuthConfig = (config: any) => {
  const issues = [];
  if (!config.webClientId && Platform.OS === 'web') {
    issues.push('Missing webClientId for web platform');
  }
  if (!config.iosClientId && Platform.OS === 'ios') {
    issues.push('Missing iosClientId for iOS platform');
  }
  if (!config.androidClientId && Platform.OS === 'android') {
    issues.push('Missing androidClientId for Android platform');
  }
  if (!config.redirectUri) {
    issues.push('Missing redirectUri');
  }
  return issues;
};

// Simplified endpoint testing (no CORS issues)
const testOAuthEndpoints = async (config: any) => {
  // Skip network tests in browser to avoid CORS issues
  if (typeof window !== 'undefined') {
    return {
      redirectUri: 'skipped_browser',
      googleDiscovery: 'skipped_browser'
    };
  }
  
  const results = { redirectUri: 'unknown', googleDiscovery: 'unknown' };
  
  // Basic redirect URI validation (format only)
  if (config.redirectUri) {
    try {
      new URL(config.redirectUri); // Just test if it's a valid URL format
      results.redirectUri = 'valid_format';
    } catch (error) {
      results.redirectUri = 'invalid_format';
    }
  }
  
  results.googleDiscovery = 'skipped_cors';
  return results;
};

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
  const extra = (Constants?.expoConfig as any)?.extra ?? {};
  const iosClientId = extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const isGoogleAvailable = (() => {
    const available = (() => {
      if (Platform.OS === 'ios') return !!iosClientId || !!webClientId;
      if (Platform.OS === 'android') return !!androidClientId || !!webClientId;
      if (Platform.OS === 'web') return !!webClientId;
      return false;
    })();
    
    // Log Google availability check
    logger.info('GoogleLogin', 'Google availability check', {
      platform: Platform.OS,
      available,
      hasIosClientId: !!iosClientId,
      hasAndroidClientId: !!androidClientId,
      hasWebClientId: !!webClientId,
      clientIds: {
        ios: iosClientId ? `${iosClientId.substring(0, 10)}...` : 'missing',
        android: androidClientId ? `${androidClientId.substring(0, 10)}...` : 'missing',
        web: webClientId ? `${webClientId.substring(0, 10)}...` : 'missing'
      }
    });
    
    return available;
  })();

  // If Google is not available, render a disabled-looking button without initializing the hook
  if (disabled || !isGoogleAvailable) {
    logger.warn('GoogleLogin', 'Google login unavailable', {
      disabled,
      isGoogleAvailable,
      platform: Platform.OS,
      reason: disabled ? 'manually disabled' : 'client IDs missing'
    });
    
    return (
      <TouchableOpacity style={[styles.button, styles.disabled, style]} disabled>
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>{t('auth:googleCta') || 'התחבר/הרשם עם גוגל'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <GoogleAuthInner onSuccess={onSuccess} style={style} iosClientId={iosClientId} androidClientId={androidClientId} webClientId={webClientId} />
  );
}

function GoogleAuthInner({ onSuccess, style, iosClientId, androidClientId, webClientId }: any) {
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['auth']);
  const [authState, setAuthState] = useState<'idle' | 'configuring' | 'ready' | 'authenticating' | 'success' | 'error'>('idle');
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Single initialization effect
  useEffect(() => {
    if (isInitialized) return;
    
    (async () => {
      setAuthState('configuring');
      logger.info('GoogleLogin', 'Initializing OAuth setup');
      
      try {
        // Check if we have successful OAuth data from redirect
        const oauthSuccess = await AsyncStorage.getItem('oauth_success_flag');
        const userData = await AsyncStorage.getItem('google_auth_user');
        const token = await AsyncStorage.getItem('google_auth_token');
        
        if (oauthSuccess && userData && token) {
          logger.info('GoogleLogin', 'Found successful OAuth data from redirect');
          
          try {
            const parsedUserData = JSON.parse(userData);
            logger.info('GoogleLogin', 'Processing OAuth redirect success', {
              userId: parsedUserData.id,
              email: parsedUserData.email
            });
            
            // Set user in context
            await setSelectedUserWithMode(parsedUserData, 'real');
            
            // Save to database
            try {
              await db.createUser(parsedUserData.id, parsedUserData);
              logger.info('GoogleLogin', 'User saved to database from redirect');
            } catch (dbError) {
              logger.warn('GoogleLogin', 'Failed to save user to database from redirect', { error: String(dbError) });
            }
            
            // Call success callback
            if (onSuccess) {
              onSuccess(parsedUserData);
            }
            
            // Clean up stored data
            await AsyncStorage.removeItem('oauth_success_flag');
            await AsyncStorage.removeItem('google_auth_user');
            await AsyncStorage.removeItem('google_auth_token');
            
            // Navigate to home
            navigation.replace('HomeStack');
            
            setAuthState('success');
            logger.info('GoogleLogin', 'OAuth redirect processing completed successfully');
            return;
            
          } catch (parseError) {
            logger.error('GoogleLogin', 'Failed to process OAuth redirect data', { error: String(parseError) });
            // Clean up bad data
            await AsyncStorage.removeItem('oauth_success_flag');
            await AsyncStorage.removeItem('google_auth_user');
            await AsyncStorage.removeItem('google_auth_token');
          }
        }
        
        // Normal initialization
        await AsyncStorage.removeItem('oauth_in_progress');
        logger.info('GoogleLogin', 'Cleared stuck OAuth state');
      } catch {}
      
      setIsInitialized(true);
      setAuthState('ready');
    })();
  }, [isInitialized, setSelectedUserWithMode, onSuccess, navigation]);

  if (Platform.OS === 'web') {
    try { WebBrowser.maybeCompleteAuthSession(); } catch {}
  }

  // Configure redirect URI based on platform
  let redirectUri;
  if (Platform.OS === 'web') {
    // For web, use the current origin + /oauthredirect
    redirectUri = `${window.location.origin}/oauthredirect`;
    console.log('🔍 Web redirect URI:', redirectUri);
  } else {
    // For mobile, use the custom scheme
    redirectUri = makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' });
    console.log('🔍 Mobile redirect URI:', redirectUri);
  }

  const oauthConfig: any = {
    iosClientId,
    androidClientId,
    webClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri,
  };
  if (webClientId) oauthConfig.expoClientId = webClientId;

  // Configuration validation effect (runs only once after initialization)
  useEffect(() => {
    if (!isInitialized || validationResults) return;
    
    (async () => {
      try {
        const configIssues = validateOAuthConfig(oauthConfig);
        const endpointTests = await testOAuthEndpoints(oauthConfig);
        
        const validation = {
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
          configIssues,
          endpointTests,
          config: {
            hasRedirectUri: !!redirectUri,
            redirectUri,
            hasScopes: oauthConfig.scopes?.length > 0,
            scopes: oauthConfig.scopes,
            responseType: oauthConfig.responseType
          }
        };
        
        setValidationResults(validation);
        
        logger.info('GoogleLogin', 'OAuth configuration validation', validation);
        
        // Skip diagnostics in production to avoid hooks issues
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !window.__authDiagnosticsRun) {
          window.__authDiagnosticsRun = true;
          // Run diagnostics in next tick to avoid hooks order issues
          setTimeout(() => {
            runAuthDiagnostics({
              webClientId,
              iosClientId,
              androidClientId,
              redirectUri
            }).catch(error => {
              logger.error('GoogleLogin', 'Authentication diagnostics failed', { error: String(error) });
            });
          }, 100);
        }
        
        if (configIssues.length > 0) {
          logger.warn('GoogleLogin', 'OAuth configuration issues found', { issues: configIssues });
        } else {
          logger.info('GoogleLogin', 'OAuth configuration validation passed');
        }
      } catch (error) {
        logger.error('GoogleLogin', 'Configuration validation failed', { error: String(error) });
      }
    })();
  }, [isInitialized, validationResults, redirectUri, iosClientId, androidClientId, webClientId]);

  // Log OAuth config only once during development
  useEffect(() => {
    if (!isInitialized) return;
    
    logger.info('GoogleLogin', 'OAuth config being used', {
      ...oauthConfig,
      // Mask sensitive client IDs in logs
      iosClientId: iosClientId ? `${iosClientId.substring(0, 10)}...` : undefined,
      androidClientId: androidClientId ? `${androidClientId.substring(0, 10)}...` : undefined,
      webClientId: webClientId ? `${webClientId.substring(0, 10)}...` : undefined
    });
  }, [isInitialized]); // Only log once after initialization

  // Always use hooks in the same order
  let request: any, response: any, promptAsync: any;
  
  // Primary configuration
  try {
    [request, response, promptAsync] = Google.useAuthRequest(oauthConfig);
    logger.info('GoogleLogin', 'useAuthRequest initialized successfully');
  } catch (e) {
    logger.warn('GoogleLogin', 'useAuthRequest failed', {
      platform: Platform.OS,
      hasIos: !!iosClientId,
      hasAndroid: !!androidClientId,
      hasWeb: !!webClientId,
      error: String(e)
    });
    
    // Fallback configuration - but keep same hook order
    const fallbackConfig: any = {
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      redirectUri,
      expoClientId: webClientId,
    };
    
    try {
      [request, response, promptAsync] = Google.useAuthRequest(fallbackConfig);
    } catch (fallbackError) {
      logger.error('GoogleLogin', 'Fallback useAuthRequest also failed', {
        error: String(fallbackError)
      });
      // Set default values to maintain hook consistency
      request = null;
      response = null;
      promptAsync = null;
    }
  }

  useEffect(() => {
    if (!isInitialized) return;
    
    logger.info('GoogleLogin', 'OAuth request state', {
      request: !!request,
      response: response?.type || 'none',
      promptAsync: !!promptAsync
    });
  }, [request, response, isInitialized]);

  useEffect(() => {
    const handleOAuthResponse = async () => {
      if (!response) return;
      
      logger.info('GoogleLogin', 'OAuth response received', {
        type: response.type,
        url: response.url ? `${response.url.substring(0, 50)}...` : undefined,
        hasAuthentication: !!response.authentication,
        hasParams: !!(response as any)?.params
      });
      
      try {
        if (response.type !== 'success') {
          logger.warn('GoogleLogin', 'OAuth response not successful', {
            type: response.type,
            errorCode: (response as any)?.error_code,
            error: (response as any)?.error
          });
          
          setAuthState('error');
          await AsyncStorage.removeItem('oauth_in_progress');
          
          if (response.type === 'cancel') {
            logger.info('GoogleLogin', 'User cancelled OAuth flow');
            return;
          }
          
          Alert.alert(
            t('auth:errors.oauthTitle') || 'שגיאת אימות',
            t('auth:errors.oauthFailed') || `אימות נכשל: ${(response as any)?.error || 'סיבה לא ידועה'}`
          );
          return;
        }
        
        setAuthState('success');
        
        const idToken = response.authentication?.idToken || (response as any)?.params?.id_token;
        const accessToken = response.authentication?.accessToken || (response as any)?.params?.access_token;
        
        logger.info('GoogleLogin', 'OAuth tokens received', {
          hasIdToken: !!idToken,
          hasAccessToken: !!accessToken,
          idTokenLength: idToken?.length,
          accessTokenLength: accessToken?.length
        });
        
        if (!idToken) {
          logger.error('GoogleLogin', 'No ID token received from Google OAuth response');
          setAuthState('error');
          Alert.alert(
            t('auth:errors.oauthTitle') || 'שגיאה', 
            t('auth:errors.googleSignInNotAvailable') || 'לא ניתן להתחבר עם Google - לא התקבל טוקן'
          );
          return;
        }
        
        const profile = parseJWT(idToken);
        if (!profile) {
          logger.error('GoogleLogin', 'Failed to parse JWT token');
          setAuthState('error');
          Alert.alert(
            t('auth:errors.oauthTitle') || 'שגיאה', 
            'שגיאה בפענוח פרטי המשתמש'
          );
          return;
        }
        
        logger.info('GoogleLogin', 'User profile parsed successfully', {
          userId: profile.sub,
          email: profile.email,
          name: profile.name,
          emailVerified: profile.email_verified
        });
        
        const userData = createUserData(profile, t);
        logger.info('GoogleLogin', 'User data created', { userId: userData.id, email: userData.email });
        
        await setSelectedUserWithMode(userData, 'real');
        logger.info('GoogleLogin', 'User set in context');
        
        try {
          await db.createUser(userData.id, userData);
          logger.info('GoogleLogin', 'User saved to database');
        } catch (dbError) {
          logger.warn('GoogleLogin', 'Failed to save user to database', { error: String(dbError) });
          // Don't fail the auth flow if DB save fails
        }
        
        if (onSuccess) {
          onSuccess(userData);
          logger.info('GoogleLogin', 'onSuccess callback executed');
        }
        
        navigation.replace('HomeStack');
        await AsyncStorage.removeItem('oauth_in_progress');
        
        logger.info('GoogleLogin', 'Authentication flow completed successfully');
        
      } catch (error) {
        logger.error('GoogleLogin', 'OAuth response handling failed', { 
          error: String(error),
          stack: (error as Error)?.stack
        });
        
        setAuthState('error');
        Alert.alert(
          t('auth:errors.oauthTitle') || 'שגיאה', 
          t('auth:errors.loginFailed') || `התחברות נכשלה: ${(error as Error)?.message || 'שגיאה לא צפויה'}`
        );
        await AsyncStorage.removeItem('oauth_in_progress');
      }
    };
    handleOAuthResponse();
  }, [response]);

  const handlePress = async () => {
    if (authState === 'authenticating') {
      logger.warn('GoogleLogin', 'Authentication already in progress');
      return;
    }
    
    setAuthState('authenticating');
    logger.info('GoogleLogin', 'Starting OAuth flow', {
      platform: Platform.OS,
      redirectUri,
      hasPromptAsync: !!promptAsync,
      validationIssues: validationResults?.configIssues?.length || 0
    });
    
    try {
      // Pre-flight checks
      if (validationResults?.configIssues?.length > 0) {
        logger.warn('GoogleLogin', 'Starting OAuth with configuration issues', {
          issues: validationResults.configIssues
        });
      }
      
      if (!promptAsync) {
        throw new Error('OAuth prompt function not available');
      }
      
      await AsyncStorage.setItem('oauth_in_progress', 'true');
      logger.info('GoogleLogin', 'Marked OAuth as in progress');
      
      if (Platform.OS === 'web') {
        logger.info('GoogleLogin', 'Starting web OAuth flow');
        const webConfig = { 
          useProxy: false, 
          windowName: '_self', 
          redirectUri 
        };
        logger.info('GoogleLogin', 'Web OAuth config', webConfig);
        
        const result = await promptAsync(webConfig as any);
        logger.info('GoogleLogin', 'Web OAuth prompt completed', { 
          resultType: result?.type,
          hasUrl: !!result?.url 
        });
      } else {
        logger.info('GoogleLogin', 'Starting mobile OAuth flow');
        const result = await promptAsync();
        logger.info('GoogleLogin', 'Mobile OAuth prompt completed', { 
          resultType: result?.type 
        });
      }
    } catch (error: any) {
      logger.error('GoogleLogin', 'OAuth flow failed', {
        error: String(error),
        message: error?.message,
        stack: error?.stack,
        platform: Platform.OS
      });
      
      setAuthState('error');
      
      const errorMessage = error?.message || String(error);
      const isNetworkError = errorMessage.includes('Network') || errorMessage.includes('fetch');
      const isConfigError = errorMessage.includes('client_id') || errorMessage.includes('redirect_uri');
      
      let userMessage = t('auth:errors.loginFailed') || 'התחברות נכשלה. נסה שוב.';
      
      if (isNetworkError) {
        userMessage = 'בעיית רשת. בדוק את החיבור לאינטרנט ונסה שוב.';
      } else if (isConfigError) {
        userMessage = 'שגיאה בהגדרות האימות. פנה לתמיכה.';
      }
      
      Alert.alert(
        t('auth:errors.oauthTitle') || 'שגיאת אימות OAuth',
        userMessage + (process.env.NODE_ENV === 'development' ? `\n\nפרטים טכניים: ${errorMessage}` : '')
      );
      
      await AsyncStorage.removeItem('oauth_in_progress');
      
      // Reset state after a delay
      setTimeout(() => setAuthState('ready'), 2000);
    }
  };

  const getButtonText = () => {
    switch (authState) {
      case 'configuring':
        return 'מתכונן...';
      case 'authenticating':
        return 'מתחבר...';
      case 'success':
        return 'התחבר בהצלחה!';
      case 'error':
        return 'נסה שוב';
      default:
        return t('auth:googleCta') || 'התחבר/הרשם עם גוגל';
    }
  };
  
  const isButtonDisabled = authState === 'configuring' || authState === 'authenticating';
  
  return (
    <TouchableOpacity 
      style={[styles.button, isButtonDisabled && styles.disabled, style]} 
      onPress={(e) => { e.preventDefault?.(); e.stopPropagation?.(); handlePress(); }} 
      activeOpacity={0.8}
      disabled={isButtonDisabled}
    >
      <View style={styles.content}>
        <Ionicons 
          name={authState === 'success' ? 'checkmark-circle' : 'logo-google'} 
          size={20} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={styles.text}>{getButtonText()}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Create user data from Google profile
const createUserData = (profile: any, t: (k: string, opts?: any) => string) => ({
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
    location: { city: t('common:labels.countryIsrael') || 'ישראל', country: 'IL' },
    interests: [],
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'system', text: t('notifications:welcomeSystem') || 'ברוך הבא לקרמה קומיוניטי!', date: new Date().toISOString() }
    ],
});

// Parse JWT token payload with comprehensive validation
const parseJWT = (token: string) => {
  try {
    if (!token || typeof token !== 'string') {
      logger.error('GoogleLogin', 'Invalid token provided to parseJWT', { tokenType: typeof token });
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      logger.error('GoogleLogin', 'JWT token has invalid structure', { partsCount: parts.length });
      return null;
    }
    
    const [header, payloadBase64, signature] = parts;
    
    // Validate header
    let headerObj;
    try {
      headerObj = JSON.parse(atob(header.replace(/-/g, '+').replace(/_/g, '/')));
      logger.info('GoogleLogin', 'JWT header parsed', { alg: headerObj.alg, typ: headerObj.typ });
    } catch (error) {
      logger.error('GoogleLogin', 'Failed to parse JWT header', { error: String(error) });
      return null;
    }
    
    // Parse payload
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Validate essential fields
    if (!payload.sub) {
      logger.error('GoogleLogin', 'JWT payload missing sub (user ID)');
      return null;
    }
    
    if (!payload.email) {
      logger.warn('GoogleLogin', 'JWT payload missing email');
    }
    
    // Check token expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        logger.error('GoogleLogin', 'JWT token has expired', {
          exp: payload.exp,
          now,
          expiredBy: now - payload.exp
        });
        return null;
      }
    }
    
    logger.info('GoogleLogin', 'JWT token validated successfully', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      iss: payload.iss,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat
    });
    
    return payload;
  } catch (error) {
    logger.error('GoogleLogin', 'Failed to parse JWT token', { 
      error: String(error),
      tokenLength: token?.length
    });
    return null;
  }
};

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
