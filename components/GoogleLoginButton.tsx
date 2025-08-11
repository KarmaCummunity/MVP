import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useUser } from '../context/UserContext';
import { USE_BACKEND } from '../utils/dbConfig';
import { db } from '../utils/databaseService';

export default function GoogleLoginButton() {
  const { setSelectedUser } = useUser();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  const onPress = async () => {
    try {
      const useProxy = true; // נוח לפיתוח
      await promptAsync({ useProxy });
    } catch (e) {
      console.error('❌ Google OAuth error:', e);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (response?.type === 'success' && response.authentication?.accessToken) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
          });
          const profile = await res.json();
          const userData = {
            id: profile.sub,
            name: profile.name || profile.given_name || 'Google User',
            email: profile.email,
            avatar: profile.picture,
            isActive: true,
            lastActive: new Date().toISOString(),
            roles: ['user'],
            settings: { language: 'he', darkMode: false, notificationsEnabled: true },
          } as any;
          await setSelectedUser(userData);
          if (USE_BACKEND) {
            try { await db.createUser(userData.id, userData); } catch {}
          }
        } catch (e) {
          console.error('❌ Failed to fetch Google profile:', e);
        }
      }
    };
    void run();
  }, [response, setSelectedUser]);

  return (
    <TouchableOpacity style={[styles.button, !request && styles.disabled]} disabled={!request} onPress={onPress}>
      <Text style={styles.text}>התחברות עם גוגל</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#EA4335',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
});


