/**
 * Simple Google Login Button using Firebase Authentication
 * This is the cleanest, most reliable way to do Google Auth on web
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { getFirebase } from '../utils/firebaseClient';
import { useUser } from '../stores/userStore';
import { useTranslation } from 'react-i18next';

export default function FirebaseGoogleButton() {
  const { t } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Check for redirect result on mount
  React.useEffect(() => {
    const checkRedirectResult = async () => {
      if (Platform.OS !== 'web') return;
      
      try {
        const { app } = getFirebase();
        const auth = getAuth(app);
        
        console.log('🔍 Checking for redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('✅ Got redirect result:', result.user.email);
          setLoading(true);
          
          const user = result.user;
          const userData = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar: user.photoURL || 'https://i.pravatar.cc/150?img=1',
            phone: user.phoneNumber || '+972500000000',
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

          console.log('💾 Updating user store...');
          await setSelectedUserWithMode(userData, 'real');
          
          console.log('🎉 Login complete! Navigating to home...');
          setTimeout(() => {
            navigation.replace('HomeStack');
          }, 500);
        } else {
          console.log('ℹ️ No redirect result found');
        }
      } catch (error) {
        console.error('❌ Error checking redirect result:', error);
      }
    };
    
    checkRedirectResult();
  }, []);

  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      setError('Google login is currently available on web only');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Starting Google login with Firebase...');
      
      // Get Firebase auth instance
      const { app } = getFirebase();
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🔐 Starting Google redirect...');
      
      // Sign in with redirect (more reliable than popup)
      await signInWithRedirect(auth, provider);
      
      // The page will redirect to Google and come back
      // The redirect result will be handled in useEffect above

    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      setError('התחברות נכשלה. אנא נסה שוב.');
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity 
        style={[
          styles.button,
          loading && styles.buttonDisabled
        ]} 
        onPress={handleGoogleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#fff" style={styles.icon} />
          ) : (
            <Ionicons 
              name="logo-google" 
              size={20} 
              color="#fff" 
              style={styles.icon} 
            />
          )}
          <Text style={styles.text}>
            {loading ? 'מתחבר...' : (t('auth:googleCta') || 'התחבר/הרשם עם גוגל')}
          </Text>
        </View>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
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
  buttonDisabled: {
    opacity: 0.6,
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

