import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
// Complete auth session on web after redirect
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { USE_BACKEND } from '../utils/dbConfig';
import { restAdapter } from '../utils/restAdapter';

const { height: screenHeight } = Dimensions.get('window');

interface GoogleAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GoogleAccountPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountSelected: (userData: any) => void;
}

export default function GoogleAccountPickerModal({
  visible,
  onClose,
  onAccountSelected,
}: GoogleAccountPickerModalProps) {
  // Ensure web auth session is completed so the response arrives back to the hook on reload
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('🔑 GoogleModal - maybeCompleteAuthSession()');
      WebBrowser.maybeCompleteAuthSession();
    } catch {}
  }, []);

  const { t } = useTranslation(['auth']);
  const [translateY] = useState(new Animated.Value(screenHeight));
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState<'initial' | 'authenticating' | 'selecting'>('initial');

  const isWeb = Platform.OS === 'web';
  const extra = (Constants?.expoConfig as any)?.extra ?? {};
  const androidClientId = extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const redirectUri = isWeb ? makeRedirectUri() : undefined;

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidClientId || undefined,
    webClientId: webClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
    responseType: isWeb ? 'id_token' : 'token',
    ...(redirectUri ? { redirectUri } : {}),
  } as any);

  // Handle Google OAuth response – on success we complete login immediately (no extra selection step)
  useEffect(() => {
    const handleResponse = async () => {
      // eslint-disable-next-line no-console
      console.log('🔑 GoogleModal - response received:', response?.type, response);
      if (response?.type === 'success') {
        try {
          setLoading(true);
          setAuthStep('authenticating');
          
          let userData: any | null = null;
          
          // Get user data from Google
          const accessToken = response.authentication?.accessToken || (response as any)?.params?.access_token;
          if (accessToken) {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profile = await res.json();
            userData = {
              id: profile.sub,
              name: profile.name || profile.given_name || 'Google User',
              email: profile.email,
              avatar: profile.picture,
              isActive: true,
              lastActive: new Date().toISOString(),
              roles: ['user'],
              settings: { language: 'he', darkMode: false, notificationsEnabled: true },
            };
          } else if ((response as any)?.params?.id_token) {
            const idToken = (response as any).params.id_token as string;
            const [, payloadBase64] = idToken.split('.');
            const payloadJson = JSON.parse(decodeURIComponent(escape(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))));
            userData = {
              id: payloadJson.sub,
              name: payloadJson.name || payloadJson.given_name || 'Google User',
              email: payloadJson.email,
              avatar: payloadJson.picture,
              isActive: true,
              lastActive: new Date().toISOString(),
              roles: ['user'],
              settings: { language: 'he', darkMode: false, notificationsEnabled: true },
            };
          }

          if (userData) {
            // eslint-disable-next-line no-console
            console.log('🔑 GoogleModal - userData extracted from Google:', userData);
            // Send to backend for verification and user creation
            if (USE_BACKEND) {
              try {
                const idToken = (response as any)?.params?.id_token;
                const accessToken = response.authentication?.accessToken || (response as any)?.params?.access_token;
                
                const backendResponse = await restAdapter.post<{ ok?: boolean; user?: any; error?: string }>(
                  '/auth/google',
                  {
                  idToken,
                  accessToken,
                  }
                );
                // eslint-disable-next-line no-console
                console.log('🔑 GoogleModal - backend /auth/google result:', backendResponse);
                if (backendResponse.ok && backendResponse.user) {
                  userData = {
                    ...userData,
                    ...backendResponse.user,
                  };
                }
              } catch (error) {
                console.warn('🔑 GoogleModal - Backend auth failed, using client data:', error);
              }
            }

            // Complete login immediately
            // eslint-disable-next-line no-console
            console.log('🔑 GoogleModal - completing login via onAccountSelected');
            onAccountSelected(userData);
            onClose();
          }
        } catch (error) {
          console.error('❌ GoogleModal - Error processing Google response:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (response) {
      handleResponse();
    }
  }, [response]);

  // Animation for modal show/hide
  useEffect(() => {
    if (visible) {
      setAuthStep('authenticating');
      setAccounts([]);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
        tension: 65,
        friction: 8,
      }).start();
      // Auto-start auth when modal opens
      if (request) {
        // eslint-disable-next-line no-console
        console.log('🔑 GoogleModal - auto starting auth');
        handleStartAuth().catch((e) => console.error('❌ GoogleModal - auto auth failed:', e));
      } else {
        console.log('🔑 GoogleModal - request not ready yet');
      }
    } else {
      Animated.spring(translateY, {
        toValue: screenHeight,
        useNativeDriver: Platform.OS !== 'web',
        tension: 65,
        friction: 8,
      }).start();
    }
  }, [visible]);

  // Pan responder for swipe down to close
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleStartAuth = async () => {
    setLoading(true);
    setAuthStep('authenticating');
    
    try {
      if (isWeb) {
        // eslint-disable-next-line no-console
        console.log('🔑 GoogleModal - promptAsync (web)', { redirectUri });
        await promptAsync({ useProxy: false, windowName: '_self', redirectUri } as any);
      } else {
        console.log('🔑 GoogleModal - promptAsync (native)');
        await promptAsync();
      }
    } catch (error) {
      console.error('❌ GoogleModal - Google OAuth error:', error);
      setLoading(false);
      setAuthStep('authenticating');
    }
  };

  const handleAccountSelect = (account: GoogleAccount) => {
    const userData = {
      id: account.id,
      name: account.name,
      email: account.email,
      avatar: account.avatar,
      isActive: true,
      lastActive: new Date().toISOString(),
      roles: ['user'],
      settings: { language: 'he', darkMode: false, notificationsEnabled: true },
    };
    
    onAccountSelected(userData);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.modal,
          {
            transform: [{ translateY }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {authStep === 'initial' && (t('auth:google.chooseAccount') || 'בחר חשבון Google')}
            {authStep === 'authenticating' && (t('auth:google.authenticating') || 'מתחבר...')}
            {authStep === 'selecting' && (t('auth:google.selectAccount') || 'בחר חשבון')}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {authStep === 'authenticating' && (
            <View style={styles.loadingContent}>
              <Animated.View style={styles.loadingSpinner}>
                <Ionicons name="refresh" size={32} color="#4285F4" />
              </Animated.View>
              <Text style={styles.loadingText}>
                {t('auth:google.pleaseWait') || 'אנא המתן...'}
              </Text>
              {!request && (
                <Text style={[styles.loadingText, { marginTop: 8 }]}>Loading Google...</Text>
              )}
            </View>
          )}
          {/* No 'selecting' stage — Google chooser handles account selection */}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.7,
    minHeight: 300,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  initialContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  googleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  accountsContent: {
    paddingTop: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
  },
});
