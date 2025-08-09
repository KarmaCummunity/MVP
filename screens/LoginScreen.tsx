import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getFirebase } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { setSelectedUser, setGuestMode, selectedUser, isGuestMode } = useUser();
  const navigation = useNavigation<any>();
  const googleAuthConfig = (Constants.expoConfig?.extra as any)?.googleAuth || {};
  const isGoogleConfigured = Boolean(
    googleAuthConfig?.iosClientId || googleAuthConfig?.androidClientId || googleAuthConfig?.webClientId
  );
  const [, , promptAsync] = Google.useAuthRequest({
    iosClientId: googleAuthConfig.iosClientId,
    androidClientId: googleAuthConfig.androidClientId,
    webClientId: googleAuthConfig.webClientId,
    scopes: ['profile', 'email'],
  });

  const handleLoginWithGoogle = async () => {
    try {
      if (!googleAuthConfig?.iosClientId && !googleAuthConfig?.androidClientId && !googleAuthConfig?.webClientId) {
        Alert.alert('שגיאת קונפיגורציה', 'חסרים Client IDs של Google ב-extra.googleAuth');
        return;
      }
      const result = await promptAsync();
      if (result?.type === 'success' && result.authentication) {
        const { idToken, accessToken } = result.authentication as any;
        const { auth } = await getFirebase();
        if (!auth) {
          Alert.alert('שגיאה', 'Firebase לא מותקן/מוגדר עדיין');
          return;
        }
        const firebaseAuth = await import('firebase/auth');
        const credential = firebaseAuth.GoogleAuthProvider.credential(idToken, accessToken);
        const userCredential = await firebaseAuth.signInWithCredential(auth, credential);
        const u = userCredential.user;
        await setSelectedUser({
          id: u.uid,
          name: u.displayName || 'משתמש',
          email: u.email || '',
          phone: u.phoneNumber || '',
          avatar: u.photoURL || '',
          bio: '',
          karmaPoints: 0,
          joinDate: new Date().toISOString(),
          isActive: true,
          lastActive: new Date().toISOString(),
          location: { city: '', country: 'IL' },
          interests: [],
          roles: ['user'],
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          notifications: [],
          settings: { language: 'he', darkMode: false, notificationsEnabled: true },
        });
      }
    } catch (e) {
      console.error('Google sign-in error', e);
      Alert.alert('שגיאה', 'נכשלה התחברות עם Google');
    }
  };

  const handleGuestMode = async () => {
    console.log('🔐 LoginScreen - handleGuestMode');
    await setGuestMode();
  };

  // useEffect לניווט אוטומטי
  useEffect(() => {
    if (selectedUser || isGuestMode) {
      console.log('🔐 LoginScreen - useEffect - מנווט ל-Home', { 
        selectedUser: !!selectedUser, 
        isGuestMode,
        userName: selectedUser?.name 
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    }
  }, [selectedUser, isGuestMode, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Background Logo */}
        <View style={styles.backgroundLogoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.backgroundLogo} 
            resizeMode="contain"
          />
        </View>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>ברוכים הבאים!</Text>
          <Text style={styles.subtitle}>KC_ID - הקיבוץ הקפיטליסטי של ישראל</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.googleButton, !isGoogleConfigured && styles.googleButtonDisabled]}
              onPress={handleLoginWithGoogle}
              activeOpacity={isGoogleConfigured ? 0.8 : 1}
              disabled={!isGoogleConfigured}
            >
              <Text style={[styles.googleButtonText, !isGoogleConfigured && styles.googleButtonTextDisabled]}>
                {isGoogleConfigured ? 'התחבר עם Google' : 'נדרש להגדיר Google Client IDs'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>המשך כאורח</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Characters Section removed */}

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.infoText}>
            האפליקציה חינמית לחלוטין ללא מטרות רווח
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    opacity: 0.4,
  },
  backgroundLogo: {
    width: '145%',
    height: '145%',
  },
  headerSection: {
    marginBottom: 30,
    alignItems: 'center',
    zIndex: 1,
  },
  footerSection: {
    marginTop: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 100,
    fontWeight: '600',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#FF6B9D',
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
  googleButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  googleButtonTextDisabled: {
    color: '#666666',
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  clearDataButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  clearDataButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 