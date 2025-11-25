/**
 * OAuth Redirect Handler
 * This page handles the Google OAuth redirect and processes the token
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../stores/userStore';

// Parse JWT token
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

export default function OAuthRedirect() {
  const router = useRouter();
  const { setSelectedUserWithMode } = useUser();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processAuth = async () => {
      try {
        const hash = window.location.hash;
        console.log('🔍 [OAuthRedirect] Hash:', hash);

        if (!hash || !hash.includes('id_token=')) {
          console.error('❌ [OAuthRedirect] No id_token found');
          setStatus('error');
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');

        if (!idToken) {
          throw new Error('No ID token');
        }

        console.log('✅ [OAuthRedirect] Found token');
        const profile = parseJWT(idToken);
        console.log('👤 [OAuthRedirect] Profile:', profile);

        if (!profile) {
          throw new Error('Failed to parse token');
        }

        // Create user data
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

        console.log('💾 [OAuthRedirect] Saving user...');
        await setSelectedUserWithMode(userData, 'real');
        await AsyncStorage.setItem('current_user', JSON.stringify(userData));
        await AsyncStorage.setItem('auth_mode', 'real');
        console.log('✅ [OAuthRedirect] User saved!');

        setStatus('success');

        // Navigate to home
        console.log('🏠 [OAuthRedirect] Navigating to home...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);

      } catch (error) {
        console.error('❌ [OAuthRedirect] Error:', error);
        setStatus('error');
        setTimeout(() => router.replace('/'), 2000);
      }
    };

    if (typeof window !== 'undefined') {
      processAuth();
    }
  }, []);

  return (
    <View style={styles.container}>
      {status === 'processing' && (
        <>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.text}>מעבד התחברות...</Text>
        </>
      )}
      {status === 'success' && (
        <Text style={styles.successText}>✅ התחברות הצליחה! מעביר...</Text>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>❌ שגיאה בהתחברות. מעביר חזרה...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  successText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
  },
});
