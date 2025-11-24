// File overview:
// - Purpose: Modern Material Design login screen with all authentication methods visible
// - Reached from: `MainNavigator` as initial route 'LoginScreenNew'.
// - On success: Resets navigation to `{ name: 'HomeStack' }` (BottomNavigator tabs).
// - Provides: Google, Email/Password, Organization, and Guest authentication options
// - Context: `useUser()` -> `setCurrentPrincipal` + `role` to set user/guest/admin and navigate home.
// - Navigation side-effects: `navigation.reset()` to 'HomeStack'; can navigate to 'OrgOnboardingScreen'.

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  I18nManager,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../stores/userStore';
import { db } from '../utils/databaseService';
import { restAdapter } from '../utils/restAdapter';
import {
  getSignInMethods,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  sendVerification as fbSendVerification,
  sendPasswordReset,
} from '../utils/authService';
import {
  registerWithEmail,
  loginWithEmail,
  checkEmailExists,
} from '../utils/customAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleGoogleLoginButton from '../components/SimpleGoogleLoginButton';
import { useTranslation } from 'react-i18next';
import i18n from '../app/i18n';
import ScrollContainer from '../components/ScrollContainer';
import { getScreenInfo, scaleSize } from '../globals/responsive';

const { width } = Dimensions.get('window');
const { isTablet, isDesktop } = getScreenInfo();
const isDesktopWeb = Platform.OS === 'web' && width > 1024;

export default function LoginScreenNew() {
  const { setCurrentPrincipal } = useUser();
  const { t } = useTranslation(['auth', 'common', 'settings']);
  const navigation = useNavigation<any>();

  // Email/Password state
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailStep, setEmailStep] = useState<'email' | 'password'>('email');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isEmailBusy, setIsEmailBusy] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [emailStatusColor, setEmailStatusColor] = useState<string>('#4CAF50');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

  // Organization state
  const [orgQuery, setOrgQuery] = useState('');
  const [isCheckingOrg, setIsCheckingOrg] = useState(false);
  const [orgEmailSuggestions, setOrgEmailSuggestions] = useState<string[]>([]);

  // Language menu state
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;
  const cardAnim4 = useRef(new Animated.Value(0)).current;

  const KNOWN_EMAILS_KEY = 'known_emails';

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        Animated.timing(cardAnim1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim3, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim4, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Load recent emails
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('recent_emails');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) setRecentEmails(list);
        }
        const knownRaw = await AsyncStorage.getItem(KNOWN_EMAILS_KEY);
        if (!raw && knownRaw) {
          const list = JSON.parse(knownRaw);
          if (Array.isArray(list)) setRecentEmails(list);
        }
      } catch (_) {}
    })();
  }, []);

  // Email suggestions
  useEffect(() => {
    if (emailStep !== 'email') {
      setEmailSuggestions([]);
      return;
    }
    const q = emailValue.trim().toLowerCase();
    if (!q) {
      setEmailSuggestions(recentEmails.slice(0, 5));
      return;
    }
    setEmailSuggestions(recentEmails.filter((e) => e.toLowerCase().includes(q)).slice(0, 5));
  }, [emailValue, emailStep, recentEmails]);

  // Org email suggestions
  useEffect(() => {
    const q = orgQuery.trim().toLowerCase();
    if (!q) {
      setOrgEmailSuggestions(recentEmails.slice(0, 5));
      return;
    }
    setOrgEmailSuggestions(recentEmails.filter((e) => e.toLowerCase().includes(q)).slice(0, 5));
  }, [orgQuery, recentEmails]);

  const applyLanguage = async (lang: 'he' | 'en') => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      await i18n.changeLanguage(lang);
      const isRTL = lang === 'he';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        if (Platform.OS !== 'web') {
          Alert.alert(t('settings:restartRequired') as string, t('settings:restartDesc') as string);
        }
      }
    } finally {
      setLanguageMenuOpen(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      await setCurrentPrincipal({ user: null as any, role: 'guest' });
      // Small delay to ensure state is updated and MainNavigator re-renders
      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    } catch (error) {
      // Small delay even on error
      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    }
  };

  const saveRecentEmail = async (email: string) => {
    try {
      const normalized = String(email || '').trim().toLowerCase();
      if (!normalized) return;
      const list = [normalized, ...recentEmails.filter((e) => e.toLowerCase() !== normalized)].slice(0, 10);
      setRecentEmails(list);
      await AsyncStorage.setItem('recent_emails', JSON.stringify(list));
      await AsyncStorage.setItem(KNOWN_EMAILS_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  const isKnownEmail = async (email: string): Promise<boolean> => {
    const lower = email.trim().toLowerCase();
    try {
      // Check database first (primary authentication method)
      const exists = await checkEmailExists(lower);
      if (exists) {
        console.log('✅ Email found in database:', lower.substring(0, 3) + '***');
        return true;
      }
      
      // Check cache as fallback
      const cacheRaw = await AsyncStorage.getItem(KNOWN_EMAILS_KEY);
      const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
      if (Array.isArray(cache) && cache.includes(lower)) {
        console.log('✅ Email found in cache:', lower.substring(0, 3) + '***');
        return true;
      }
      
      // Also check Firebase Auth for backward compatibility
      try {
        const methods = await getSignInMethods(lower);
        const hasPasswordProvider = Array.isArray(methods) && methods.some((m) => m && m.toLowerCase().includes('password'));
        if (hasPasswordProvider) {
          console.log('✅ Email found via Firebase Auth:', lower.substring(0, 3) + '***');
          return true;
        }
      } catch (fbError) {
        // Ignore Firebase errors - we're using custom auth now
        console.warn('Firebase check failed (using custom auth):', fbError);
      }
      
      console.log('❌ Email not found:', lower.substring(0, 3) + '***');
      return false;
    } catch (error: any) {
      console.warn('isKnownEmail error:', {
        email: lower.substring(0, 3) + '***',
        error: error?.message || String(error)
      });
      
      // On error, check cache as fallback
      try {
        const cacheRaw = await AsyncStorage.getItem(KNOWN_EMAILS_KEY);
        const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
        if (Array.isArray(cache) && cache.includes(lower)) {
          console.log('✅ Email found in cache (after error):', lower.substring(0, 3) + '***');
          return true;
        }
      } catch (cacheError) {
        // Ignore cache errors
      }
      
      // If there's an error checking, allow user to try anyway
      // Don't block them - let them attempt login
      return false;
    }
  };

  const validateEmailFormat = (email: string) => {
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailContinue = async () => {
    try {
      const email = emailValue.trim().toLowerCase();
      if (!email || !validateEmailFormat(email)) {
        Alert.alert(t('common:error') as string, t('auth:email.invalidFormat') as string);
        return;
      }
      setIsEmailBusy(true);
      const exists = await isKnownEmail(email);
      setEmailExists(exists);
      if (exists) {
        setEmailStatusMessage(`${email} • ${t('auth:email.knownUser')}`);
        setEmailStatusColor('#2E7D32');
      } else {
        // Even if email is "unknown", allow user to try - they might exist but getSignInMethods failed
        setEmailStatusMessage(`${email} • ${t('auth:email.unknownEmail')} (ניתן לנסות בכל זאת)`);
        setEmailStatusColor('#FF9800'); // Orange instead of red - indicates "try anyway"
      }
      setEmailStep('password');
      setPasswordValue('');
    } catch (err) {
      Alert.alert(t('common:error') as string, t('common:genericTryAgain') as string);
    } finally {
      setIsEmailBusy(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      const email = emailValue.trim().toLowerCase();
      if (!email || !validateEmailFormat(email)) {
        Alert.alert(t('common:error') as string, t('auth:email.invalidFormat') as string);
        return;
      }
      if (!passwordValue || passwordValue.length < 6) {
        Alert.alert(t('common:error') as string, t('auth:email.passwordTooShort') as string);
        return;
      }
      setIsEmailBusy(true);

      const exists = await isKnownEmail(email);
      setEmailExists(exists);

      const nowIso = new Date().toISOString();
      
      // Use custom authentication (database-backed) instead of Firebase
      let customUser;
      
      if (exists) {
        // Email is known - try login with custom auth
        try {
          console.log('🔐 Attempting custom login for known email:', email.substring(0, 3) + '***');
          customUser = await loginWithEmail(email, passwordValue);
          console.log('✅ Custom login successful');
        } catch (e: any) {
          // Display the error message (already in Hebrew from customAuthService)
          const errorMsg = e?.message || t('auth:email.invalidPassword') as string;
          setEmailStatusMessage(errorMsg);
          setEmailStatusColor('#C62828');
          setIsEmailBusy(false);
          return;
        }
      } else {
        // Email is unknown - try login first (might exist but check failed)
        // If login fails, try registration
        try {
          console.log('🔐 Attempting custom login for "unknown" email (might exist):', email.substring(0, 3) + '***');
          customUser = await loginWithEmail(email, passwordValue);
          console.log('✅ Custom login successful (email was actually registered)');
        } catch (loginError: any) {
          // If login fails, try registration
          console.log('ℹ️ Login failed, attempting registration');
          try {
            customUser = await registerWithEmail(email, passwordValue);
            console.log('✅ Custom registration successful');
            // Show success message for new registration
            Alert.alert(
              t('auth:email.registrationSuccess') as string || 'הרשמה הושלמה בהצלחה',
              t('auth:email.welcomeMessage') as string || 'ברוך הבא! החשבון שלך נוצר בהצלחה'
            );
          } catch (regError: any) {
            // Registration failed - show error
            const errorMsg = regError?.message || t('auth:email.registrationFailed') as string;
            setEmailStatusMessage(errorMsg);
            setEmailStatusColor('#C62828');
            setIsEmailBusy(false);
            return;
          }
        }
      }
      
      // If we have a user (from login or registration), proceed
      if (customUser) {
        // Ensure user data has all required fields
        const userData = {
          id: customUser.id || email,
          name: customUser.name || email.split('@')[0],
          email: customUser.email || email,
          phone: customUser.phone || '+9720000000',
          avatar: customUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customUser.name || email.split('@')[0])}&background=random`,
          bio: customUser.bio || '',
          karmaPoints: customUser.karmaPoints || 0,
          joinDate: customUser.joinDate || nowIso,
          isActive: customUser.isActive !== undefined ? customUser.isActive : true,
          lastActive: customUser.lastActive || nowIso,
          location: customUser.location || { city: t('common:labels.countryIsrael') as string, country: 'IL' },
          interests: customUser.interests || [],
          roles: customUser.roles || ['user'],
          postsCount: customUser.postsCount || 0,
          followersCount: customUser.followersCount || 0,
          followingCount: customUser.followingCount || 0,
          notifications: customUser.notifications || [],
          settings: customUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
        } as any;
        
        // Save email to recent emails
        await saveRecentEmail(email);
        
        // Set user as current principal
        await setCurrentPrincipal({ user: userData as any, role: 'user' });
        
        // Small delay to ensure state is updated and MainNavigator re-renders
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to home
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeStack' }],
        });
      }
    } catch (err: any) {
      // Display the actual error message if available
      const errorMsg = err?.message || t('common:genericTryAgain') as string;
      Alert.alert(t('common:error') as string, errorMsg);
    } finally {
      setIsEmailBusy(false);
    }
  };

  const handleOrgConfirm = async () => {
    try {
      const query = orgQuery.trim();
      if (!query) {
        Alert.alert(t('common:error') as string, t('auth:org.enterNameOrEmail') as string);
        return;
      }
      setIsCheckingOrg(true);

      let applications: any[] = [];
      const isEmail = query.includes('@');
      if (isEmail) {
        const emailKey = query.toLowerCase();
        applications = await db.listOrgApplications(emailKey);
      } else {
        const all = await db.listOrgApplications('admin_org_queue');
        applications = (all || []).filter((a: any) =>
          String(a.orgName || '').toLowerCase().includes(query.toLowerCase())
        );
      }

      const approved = applications.find((a: any) => a.status === 'approved');
      const pending = applications.find((a: any) => a.status === 'pending');

      if (approved) {
        const email = String(approved.contactEmail || (isEmail ? query : '')).toLowerCase();
        const orgUser = {
          id: `org_${approved.id}`,
          name: approved.orgName || (t('auth:org.defaultName') as string),
          email: email || `org_${approved.id}@example.org`,
          phone: approved.contactPhone || '+9720000000',
          avatar: 'https://i.pravatar.cc/150?img=12',
          bio: t('auth:org.defaultBio') as string,
          karmaPoints: 0,
          joinDate: new Date().toISOString(),
          isActive: true,
          lastActive: new Date().toISOString(),
          location: { city: approved.city || (t('common:labels.countryIsrael') as string), country: 'IL' },
          interests: [],
          roles: ['org_admin'],
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          notifications: [],
          settings: { language: 'he', darkMode: false, notificationsEnabled: true },
        } as any;

        await setCurrentPrincipal({ user: orgUser as any, role: 'user' });
        // Small delay to ensure state is updated and MainNavigator re-renders
        await new Promise(resolve => setTimeout(resolve, 100));
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeStack' }],
        });
        return;
      }

      if (pending) {
        Alert.alert(t('auth:org.pendingTitle') as string, t('auth:org.pendingMessage') as string);
        return;
      }

      navigation.navigate('OrgOnboardingScreen' as never);
    } catch (err) {
      Alert.alert(t('common:error') as string, t('auth:org.checkFailed') as string);
    } finally {
      setIsCheckingOrg(false);
    }
  };

  const cardOpacity1 = cardAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslateY1 = cardAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const cardOpacity2 = cardAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslateY2 = cardAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const cardOpacity3 = cardAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslateY3 = cardAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const cardOpacity4 = cardAnim4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslateY4 = cardAnim4.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        accessible={true}
        accessibilityViewIsModal={false}
      >
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ScrollContainer
          contentStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'interactive'}
          contentInsetAdjustmentBehavior="always"
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Background Logo */}
            <View style={styles.backgroundLogoContainer} pointerEvents="none">
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.backgroundLogo}
                resizeMode="contain"
              />
            </View>

            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>{t('auth:title') || t('common:welcomeShort')}</Text>
              <Text style={styles.subtitle}>{t('auth:subtitle') || ''}</Text>
            </View>

            {/* Authentication Cards */}
            <View style={styles.cardsContainer}>
              {/* Google Login Card */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity1,
                    transform: [{ translateY: cardTranslateY1 }],
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                  <Text style={styles.cardTitle}>{t('auth:googleCta') || 'התחבר/הרשם עם גוגל'}</Text>
                </View>
                <View style={styles.cardContent}>
                  <SimpleGoogleLoginButton />
                </View>
              </Animated.View>

              {/* Email/Password Card */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity2,
                    transform: [{ translateY: cardTranslateY2 }],
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="mail-outline" size={24} color="#4C7EFF" />
                  <Text style={styles.cardTitle}>{t('auth:email.cta')}</Text>
                </View>
                <View style={styles.cardContent}>
                  {emailStep === 'email' ? (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder={t('auth:email.placeholder')}
                        placeholderTextColor="#9E9E9E"
                        value={emailValue}
                        textAlign="right"
                        onChangeText={setEmailValue}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        inputMode="email"
                        keyboardType="email-address"
                        returnKeyType="next"
                        onSubmitEditing={handleEmailContinue}
                        accessible={true}
                        accessibilityLabel={t('auth:email.placeholder')}
                      />
                      {emailSuggestions.length > 0 && (
                        <View style={styles.suggestionsBox}>
                          {emailSuggestions.map((sug) => (
                            <TouchableOpacity
                              key={sug}
                              style={styles.suggestionItem}
                              onPress={() => {
                                setEmailValue(sug);
                                setEmailSuggestions([]);
                              }}
                            >
                              <Text style={styles.suggestionText}>{sug}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, isEmailBusy && styles.buttonDisabled]}
                        onPress={handleEmailContinue}
                        disabled={isEmailBusy}
                        activeOpacity={0.8}
                      >
                        {isEmailBusy ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.buttonText}>{t('auth:email.continue')}</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[styles.input, { paddingRight: 50 }]}
                          placeholder={t('auth:email.passwordPlaceholder')}
                          placeholderTextColor="#9E9E9E"
                          value={passwordValue}
                          onChangeText={setPasswordValue}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textAlign="right"
                          secureTextEntry={!passwordVisible}
                          returnKeyType="done"
                          onSubmitEditing={handleEmailSubmit}
                          accessible={true}
                          accessibilityLabel={t('auth:email.passwordPlaceholder')}
                        />
                        <TouchableOpacity
                          onPress={() => setPasswordVisible((v) => !v)}
                          style={styles.eyeToggle}
                        >
                          <Ionicons
                            name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {emailStatusMessage && (
                        <Text style={[styles.statusText, { color: emailStatusColor }]}>
                          {emailStatusMessage}
                        </Text>
                      )}
                      {emailStatusColor === '#C62828' && (
                        <TouchableOpacity
                          style={styles.resetPasswordButton}
                          onPress={async () => {
                            try {
                              await sendPasswordReset(emailValue.trim().toLowerCase());
                              Alert.alert(t('auth:email.resetSent') as string);
                            } catch (_) {}
                            Linking.openURL('https://mail.google.com/mail');
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.resetPasswordText}>{t('auth:email.resetPassword')}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, isEmailBusy && styles.buttonDisabled]}
                        onPress={handleEmailSubmit}
                        disabled={isEmailBusy}
                        activeOpacity={0.8}
                      >
                        {isEmailBusy ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.buttonText}>{t('auth:email.submit')}</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                          setEmailStep('email');
                          setPasswordValue('');
                          setEmailStatusMessage(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.backButtonText}>{t('common:back')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </Animated.View>

              {/* Organization Login Card */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity3,
                    transform: [{ translateY: cardTranslateY3 }],
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="business-outline" size={24} color="#FF6B9D" />
                  <Text style={styles.cardTitle}>{t('auth:org.cta')}</Text>
                </View>
                <View style={styles.cardContent}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth:org.placeholder')}
                    placeholderTextColor="#9E9E9E"
                    value={orgQuery}
                    onChangeText={setOrgQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign="right"
                    autoComplete="email"
                    textContentType="emailAddress"
                    inputMode="email"
                    returnKeyType="done"
                    onSubmitEditing={handleOrgConfirm}
                    accessible={true}
                    accessibilityLabel={t('auth:org.placeholder')}
                  />
                  {orgEmailSuggestions.length > 0 && (
                    <View style={styles.suggestionsBox}>
                      {orgEmailSuggestions.map((sug) => (
                        <TouchableOpacity
                          key={sug}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setOrgQuery(sug);
                            setOrgEmailSuggestions([]);
                          }}
                        >
                          <Text style={styles.suggestionText}>{sug}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary, isCheckingOrg && styles.buttonDisabled]}
                    onPress={handleOrgConfirm}
                    disabled={isCheckingOrg}
                    activeOpacity={0.8}
                  >
                    {isCheckingOrg ? (
                      <ActivityIndicator size="small" color="#FF6B9D" />
                    ) : (
                      <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
                        {t('auth:org.continue')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Guest Mode Card */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardGuest,
                  {
                    opacity: cardOpacity4,
                    transform: [{ translateY: cardTranslateY4 }],
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="person-outline" size={24} color="#666666" />
                  <Text style={[styles.cardTitle, styles.cardTitleGuest]}>{t('auth:continueAsGuest')}</Text>
                </View>
                <View style={styles.cardContent}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonOutline]}
                    onPress={handleGuestMode}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.buttonOutlineText]}>
                      {t('auth:continueAsGuest')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <Text style={styles.infoText}>{t('common:freeAppNotice')}</Text>
            </View>
          </Animated.View>
        </ScrollContainer>

        {/* Language Switcher */}
        <View pointerEvents="box-none" style={styles.languageFabContainer}>
          <TouchableOpacity
            style={styles.languageFab}
            activeOpacity={0.8}
            onPress={() => setLanguageMenuOpen((prev) => !prev)}
          >
            <Ionicons name="globe-outline" size={22} color="#333" />
          </TouchableOpacity>
          {languageMenuOpen && (
            <View style={styles.languageMenu}>
              <TouchableOpacity
                style={styles.languageMenuItem}
                onPress={() => applyLanguage('he')}
              >
                <Text style={styles.languageMenuText}>{t('common:languages.he')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.languageMenuItem}
                onPress={() => applyLanguage('en')}
              >
                <Text style={styles.languageMenuText}>{t('common:languages.en')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = () => {
  const buttonPaddingH = isDesktopWeb ? 32 : isTablet ? 28 : 24;
  const buttonPaddingV = isDesktopWeb ? 16 : isTablet ? 14 : 12;
  const cardMaxWidth = isDesktopWeb ? 500 : isTablet ? 450 : '100%';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F5F9FF',
    },
    container: {
      flex: 1,
      padding: isDesktopWeb ? 40 : isTablet ? 32 : 20,
      position: 'relative',
      ...(isDesktopWeb && {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      }),
    },
    backgroundLogoContainer: {
      position: 'absolute',
      top: isDesktopWeb ? 40 : isTablet ? 30 : Platform.OS === 'web' ? 30 : 50,
      left: 0,
      right: 0,
      height: isDesktopWeb ? '35%' : Platform.OS === 'web' ? '40%' : '50%',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.15,
    },
    backgroundLogo: {
      width: isDesktopWeb ? '100%' : Platform.OS === 'web' ? '120%' : '145%',
      height: isDesktopWeb ? '100%' : Platform.OS === 'web' ? '120%' : '145%',
    },
    headerSection: {
      marginBottom: isDesktopWeb ? 40 : isTablet ? 35 : 30,
      alignItems: 'center',
      zIndex: 1,
      width: '100%',
    },
    title: {
      marginTop: isDesktopWeb ? 20 : isTablet ? 15 : Platform.OS === 'web' ? 10 : 20,
      fontSize: isDesktopWeb ? 42 : isTablet ? 36 : scaleSize(32),
      fontWeight: 'bold',
      color: '#2C2C2C',
      marginBottom: isDesktopWeb ? 12 : isTablet ? 11 : 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: isDesktopWeb ? 20 : isTablet ? 18 : scaleSize(16),
      color: '#666666',
      textAlign: 'center',
      marginBottom: isDesktopWeb ? 30 : isTablet ? 25 : 20,
      fontWeight: '500',
      paddingHorizontal: isDesktopWeb ? 20 : 0,
    },
    cardsContainer: {
      width: '100%',
      alignItems: 'center',
      gap: isDesktopWeb ? 20 : isTablet ? 18 : 16,
      marginBottom: isDesktopWeb ? 30 : isTablet ? 25 : 20,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: isDesktopWeb ? 24 : isTablet ? 22 : 20,
      width: '100%',
      maxWidth: cardMaxWidth,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: isDesktopWeb ? 16 : isTablet ? 14 : 12,
    },
    cardGuest: {
      backgroundColor: '#FAFAFA',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      gap: 12,
    },
    cardTitle: {
      fontSize: isDesktopWeb ? 20 : isTablet ? 18 : scaleSize(16),
      fontWeight: '700',
      color: '#2C2C2C',
    },
    cardTitleGuest: {
      color: '#666666',
      fontWeight: '600',
    },
    cardContent: {
      gap: isDesktopWeb ? 16 : isTablet ? 14 : 12,
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingHorizontal: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      paddingVertical: isDesktopWeb ? 14 : isTablet ? 12 : 10,
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#2C2C2C',
    },
    inputWrapper: {
      position: 'relative',
    },
    eyeToggle: {
      position: 'absolute',
      right: isDesktopWeb ? 12 : isTablet ? 10 : 8,
      top: 0,
      bottom: 0,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      borderRadius: 12,
      paddingHorizontal: buttonPaddingH,
      paddingVertical: buttonPaddingV,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isDesktopWeb ? 52 : isTablet ? 48 : 44,
    },
    buttonPrimary: {
      backgroundColor: '#4C7EFF',
    },
    buttonSecondary: {
      backgroundColor: '#FF6B9D',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#666666',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      fontWeight: '700',
      color: '#FFFFFF',
    },
    buttonSecondaryText: {
      color: '#FFFFFF',
    },
    buttonOutlineText: {
      color: '#666666',
    },
    suggestionsBox: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: -8,
    },
    suggestionItem: {
      paddingVertical: isDesktopWeb ? 12 : isTablet ? 10 : 8,
      paddingHorizontal: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    suggestionText: {
      fontSize: isDesktopWeb ? 15 : isTablet ? 14 : scaleSize(13),
      color: '#2C2C2C',
      textAlign: 'right',
    },
    statusText: {
      fontSize: isDesktopWeb ? 14 : isTablet ? 13 : scaleSize(12),
      fontWeight: '600',
      textAlign: 'right',
      marginTop: -8,
    },
    resetPasswordButton: {
      paddingVertical: 8,
      alignSelf: 'flex-end',
    },
    resetPasswordText: {
      fontSize: isDesktopWeb ? 14 : isTablet ? 13 : scaleSize(12),
      color: '#1976D2',
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    backButton: {
      paddingVertical: 8,
      alignSelf: 'flex-end',
    },
    backButtonText: {
      fontSize: isDesktopWeb ? 14 : isTablet ? 13 : scaleSize(12),
      color: '#666666',
      fontWeight: '600',
    },
    footerSection: {
      marginTop: isDesktopWeb ? 30 : isTablet ? 25 : 20,
      alignItems: 'center',
    },
    infoText: {
      fontSize: isDesktopWeb ? 14 : isTablet ? 13 : scaleSize(12),
      color: '#888888',
      textAlign: 'center',
    },
    languageFabContainer: {
      position: 'absolute',
      top: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      right: isDesktopWeb ? 20 : isTablet ? 18 : 16,
      alignItems: 'flex-end',
      zIndex: 20,
    },
    languageFab: {
      width: isDesktopWeb ? 40 : isTablet ? 38 : 36,
      height: isDesktopWeb ? 40 : isTablet ? 38 : 36,
      borderRadius: isDesktopWeb ? 20 : isTablet ? 19 : 18,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    languageMenu: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: 12,
      paddingVertical: 8,
      marginTop: 6,
      minWidth: 150,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    languageMenuItem: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    languageMenuText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#333333',
      textAlign: 'right',
    },
  });
};

const styles = createStyles();

