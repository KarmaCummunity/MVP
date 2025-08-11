import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useUser } from '../context/UserContext';
import { USE_BACKEND } from '../utils/dbConfig';
import { db } from '../utils/databaseService';

type GoogleLoginButtonProps = {
  onSuccess?: (user: any) => void;
};

export default function GoogleLoginButton({ onSuccess }: GoogleLoginButtonProps) {
  const { setSelectedUser } = useUser();
  const isWeb = Platform.OS === 'web';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const redirectUri = isWeb && typeof window !== 'undefined' ? window.location.origin : undefined;

  // מניעת קריסה בווב אם אין webClientId בזמן פיתוח/Build
  if (isWeb && !webClientId) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabled]} disabled>
        <Text style={styles.text}>התחברות עם גוגל</Text>
      </TouchableOpacity>
    );
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidClientId || undefined,
    webClientId: webClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
    responseType: isWeb ? 'id_token' : 'token',
    // ברשת (web) נשתמש בדומיין עצמו כ־redirectUri כדי להתאים להגדרות Google
    ...(redirectUri ? { redirectUri } : {}),
  } as any);

  const onPress = async () => {
    try {
      // High-signal log for button press
      // eslint-disable-next-line no-console
      console.log('🔑 GoogleLoginButton - onPress - starting auth', { isWeb, redirectUri, hasRequest: !!request });
      if (isWeb) {
        await promptAsync({ useProxy: false, windowName: '_self', redirectUri } as any);
      } else {
        await promptAsync();
      }
    } catch (e) {
      console.error('❌ Google OAuth error:', e);
    }
  };

  useEffect(() => {
    // השלם את סשן ה־OAuth בכל פלטפורמה (ייבוא דינמי כדי לא לשבור build)
    import('expo-web-browser').then((m) => m.maybeCompleteAuthSession()).catch(() => {});
    const run = async () => {
      // eslint-disable-next-line no-console
      console.log('🔑 GoogleLoginButton - useEffect response', response);
      if (response?.type === 'success') {
        try {
          let userData: any | null = null;

          // 1) Native/Android path with access token
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
            // 2) Web path with id_token (no extra request needed)
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
            console.log('🔑 GoogleLoginButton - resolved userData', userData);
            await setSelectedUser(userData);
            if (USE_BACKEND) {
              try { await db.createUser(userData.id, userData); } catch {}
            }
            if (onSuccess) {
              onSuccess(userData);
            }
          } else {
            console.warn('⚠️ Google OAuth returned success without token/id_token');
          }
        } catch (e) {
          console.error('❌ Failed to process Google response:', e);
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


