/**
 * Google Login using Firebase Authentication
 * THE SIMPLEST SOLUTION THAT ACTUALLY WORKS!
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirebase } from '../utils/firebaseClient';
import { useUser } from '../stores/userStore';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FirebaseGoogleButton() {
  const { t } = useTranslation(['auth']);
  const { setSelectedUserWithMode } = useUser();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    console.log('='.repeat(50));
    console.log('🎯 [GOOGLE LOGIN START]');
    console.log('='.repeat(50));
    
    if (Platform.OS !== 'web') {
      console.error('❌ Platform is not web:', Platform.OS);
      alert('Google login is currently available on web only');
      return;
    }

    try {
      console.log('1️⃣ Setting loading state...');
      setLoading(true);
      setError('');
      
      console.log('2️⃣ Getting Firebase instance...');
      const { app } = getFirebase();
      console.log('   ✅ Firebase app:', app ? 'EXISTS' : 'NULL');
      
      console.log('3️⃣ Getting Auth instance...');
      const auth = getAuth(app);
      console.log('   ✅ Auth:', auth ? 'EXISTS' : 'NULL');
      
      console.log('4️⃣ Creating Google Provider...');
      const provider = new GoogleAuthProvider();
      console.log('   ✅ Provider created');
      
      console.log('5️⃣ Setting provider parameters...');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      console.log('   ✅ Parameters set');

      console.log('6️⃣ Opening Google popup...');
      console.log('   ⏳ Waiting for user to select account...');
      
      const result = await signInWithPopup(auth, provider);
      
      console.log('7️⃣ Popup returned!');
      console.log('   ✅ Result:', result ? 'EXISTS' : 'NULL');
      
      const user = result.user;
      console.log('8️⃣ User data received:');
      console.log('   - UID:', user.uid);
      console.log('   - Email:', user.email);
      console.log('   - Name:', user.displayName);
      console.log('   - Photo:', user.photoURL);

      console.log('9️⃣ Creating user data object...');
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
      console.log('   ✅ User data created:', userData.email);

      console.log('🔟 Saving to UserStore...');
      await setSelectedUserWithMode(userData, 'real');
      console.log('   ✅ UserStore updated');
      
      console.log('1️⃣1️⃣ Saving to AsyncStorage...');
      await AsyncStorage.setItem('current_user', JSON.stringify(userData));
      await AsyncStorage.setItem('auth_mode', 'real');
      console.log('   ✅ AsyncStorage updated');
      
      console.log('1️⃣2️⃣ Navigating to HomeStack...');
      console.log('   ⏳ Waiting 500ms...');
      
      setTimeout(() => {
        console.log('   🏠 Calling navigation.replace...');
        navigation.replace('HomeStack');
        console.log('='.repeat(50));
        console.log('🎉 [GOOGLE LOGIN SUCCESS]');
        console.log('='.repeat(50));
      }, 500);

    } catch (error: any) {
      console.log('='.repeat(50));
      console.error('❌ [GOOGLE LOGIN ERROR]');
      console.log('='.repeat(50));
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = '';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ההתחברות בוטלה';
        console.log('   ℹ️ User closed the popup');
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'הדפדפן חסם את חלון ההתחברות. אנא אפשר pop-ups.';
        console.error('   ⚠️ Popup was blocked by browser');
      } else {
        errorMessage = 'שגיאה בהתחברות. נסה שוב.';
        console.error('   ⚠️ Unknown error');
      }
      
      setError(errorMessage);
      setLoading(false);
      console.log('='.repeat(50));
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGoogleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#fff" style={styles.icon} />
          ) : (
            <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          )}
          <Text style={styles.text}>
            {loading ? 'מתחבר...' : (t('auth:googleCta') || 'התחבר/הרשם עם גוגל')}
          </Text>
        </View>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
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
    width: '100%',
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

