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
  const extra = (Constants?.expoConfig as any)?.extra ?? {};
  const iosClientId = extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const isGoogleAvailable = (() => {
    if (Platform.OS === 'ios') return !!iosClientId || !!webClientId;
    if (Platform.OS === 'android') return !!androidClientId || !!webClientId;
    if (Platform.OS === 'web') return !!webClientId;
    return false;
  })();

  // If Google is not available, render a disabled-looking button without initializing the hook
  if (disabled || !isGoogleAvailable) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabled, style]} disabled>
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>{t('auth:googleCta') || 'התחבר עם Google'}</Text>
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

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem('oauth_in_progress');
        logger.info('GoogleLogin', 'Cleared stuck OAuth state');
      } catch {}
    })();
  }, []);

  if (Platform.OS === 'web') {
    try { WebBrowser.maybeCompleteAuthSession(); } catch {}
  }

  const oauthConfig: any = {
    iosClientId,
    androidClientId,
    webClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri: makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' }),
  };
  if (webClientId) oauthConfig.expoClientId = webClientId;

  logger.info('GoogleLogin', 'OAuth config being used', oauthConfig);

  let request: any, response: any, promptAsync: any;
  try {
    [request, response, promptAsync] = Google.useAuthRequest(oauthConfig);
  } catch (e) {
    logger.warn('GoogleLogin', 'useAuthRequest threw, retrying with Expo Go fallback', {
      platform: Platform.OS,
      hasIos: !!iosClientId,
      hasAndroid: !!androidClientId,
      hasWeb: !!webClientId,
      error: String(e)
    });
    const fallbackConfig: any = {
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      redirectUri: makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' }),
      expoClientId: webClientId,
    };
    [request, response, promptAsync] = Google.useAuthRequest(fallbackConfig);
  }

  useEffect(() => {
    logger.info('GoogleLogin', 'OAuth request state', {
      request: !!request,
      response: response?.type || 'none',
      promptAsync: !!promptAsync
    });
  }, [request, response]);

  useEffect(() => {
    const handleOAuthResponse = async () => {
      if (!response) return;
      try {
        if (response.type !== 'success') {
          await AsyncStorage.removeItem('oauth_in_progress');
          return;
        }
        const idToken = response.authentication?.idToken || (response as any)?.params?.id_token;
        if (!idToken) {
          Alert.alert('שגיאה', 'לא ניתן להתחבר עם Google');
          return;
        }
        const profile = parseJWT(idToken);
        const userData = createUserData(profile);
        await setSelectedUserWithMode(userData, 'real');
        try { await db.createUser(userData.id, userData); } catch {}
        if (onSuccess) onSuccess(userData);
        navigation.replace('HomeStack');
        await AsyncStorage.removeItem('oauth_in_progress');
      } catch (error) {
        Alert.alert('שגיאה', 'התחברות נכשלה. נסה שוב.');
        await AsyncStorage.removeItem('oauth_in_progress');
      }
    };
    handleOAuthResponse();
  }, [response]);

  const handlePress = async () => {
    try {
      await AsyncStorage.setItem('oauth_in_progress', 'true');
      if (Platform.OS === 'web') {
        const result = await promptAsync({ useProxy: false, windowName: '_self', redirectUri: makeRedirectUri() } as any);
      } else {
        await promptAsync();
      }
    } catch (error: any) {
      Alert.alert('שגיאה OAuth', `OAuth נכשל: ${error?.message || error}`);
      await AsyncStorage.removeItem('oauth_in_progress');
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={(e) => { e.preventDefault?.(); e.stopPropagation?.(); handlePress(); }} activeOpacity={0.8}>
      <View style={styles.content}>
        <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>{t('auth:googleCta') || 'התחבר עם Google'}</Text>
      </View>
    </TouchableOpacity>
  );
}

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
