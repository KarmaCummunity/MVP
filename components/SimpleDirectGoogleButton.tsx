/**
 * Simple Google OAuth2 Login Button
 * Direct OAuth implementation without third-party libraries
 */

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../stores/userStore';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '286954674840-vnmcbs34glmvv2hd9a5bp9oe1qjqaa5v.apps.googleusercontent.com';

/**
 * Parse JWT token to extract user profile
 */
const parseJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

export default function SimpleDirectGoogleButton() {
  const { t } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  /**
   * Check for OAuth redirect result on component mount
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const processOAuthRedirect = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('id_token=')) {
        setLoading(true);
        
        try {
          const params = new URLSearchParams(hash.substring(1));
          const idToken = params.get('id_token');
          
          if (!idToken) {
            throw new Error('No ID token found');
          }

          const profile = parseJWT(idToken);
          
          if (!profile) {
            throw new Error('Failed to parse token');
          }

          // Create user data from Google profile
          const userData = {
            id: profile.sub,
            name: profile.name || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            avatar: profile.picture || 'https://i.pravatar.cc/150?img=1',
            phone: '+972500000000',
            bio: '',
            karmaPoints: 0,
            joinDate: new Date().toISOString(),
            isActive: true,
            lastActive: new Date().toISOString(),
            location: { city: 'ישראל', country: 'IL' },
            interests: [],
            roles: ['user'],
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            notifications: [
              { type: 'system', text: 'ברוך הבא לקרמה קומיוניטי!', date: new Date().toISOString() }
            ],
            settings: { 
              language: 'he', 
              darkMode: false, 
              notificationsEnabled: true 
            }
          };

          // Update user store and persist to storage
          await setSelectedUserWithMode(userData, 'real');
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
          await AsyncStorage.setItem('auth_mode', 'real');

          // Clean URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to home screen
          setTimeout(() => {
            navigation.replace('HomeStack');
          }, 500);

        } catch (error) {
          console.error('OAuth authentication error:', error);
          setLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    processOAuthRedirect();
  }, [setSelectedUserWithMode, navigation]);

  /**
   * Initiate Google OAuth flow
   */
  const handleLogin = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      alert('Google login is only available on web');
      return;
    }

    const redirectUri = window.location.origin + window.location.pathname;
    const nonce = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce: nonce,
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleLogin}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons 
          name="logo-google" 
          size={20} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={styles.text}>
          {loading ? 'מתחבר...' : (t('auth:googleCta') || 'התחבר/הרשם עם גוגל')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    minWidth: 250,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

