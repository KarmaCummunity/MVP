// @ts-nocheck
// File overview:
// - Purpose: Entry authentication screen with multiple login modes (Google, email/password, organization, guest, character personas).
// - Reached from: `MainNavigator` as initial route 'LoginScreen'.
// - On success: Resets navigation to `{ name: 'HomeStack' }` (BottomNavigator tabs).
// - Provides: UI states for email flow (2 steps), org lookup, language switcher (he/en with RTL toggle), character selection for demo/real augmented data, guest mode.
// - Reads/writes: AsyncStorage for recent emails and language; queries org applications via `db`, users via `authService` + `restAdapter`.
// - Context: `useUser()` -> `setSelectedUserWithMode`, `setGuestMode`, `selectedUser`, `isGuestMode` to proceed to home upon auth or guest.
// - Navigation side-effects: `navigation.reset()` to 'HomeStack'; can navigate to 'OrgOnboardingScreen'.
// - External deps/services: i18n, firebase-like authService wrappers, restAdapter, databaseService.

// TODO: CRITICAL - This file is extremely long (1200+ lines). Split into smaller components:
//   - EmailLoginForm component
//   - OrganizationLoginForm component  
//   - CharacterSelection component
//   - LanguageSelector component
// TODO: Remove character selection demo functionality - not needed in production
// TODO: Add comprehensive form validation and error handling
// TODO: Implement proper accessibility for all interactive elements
// TODO: Add comprehensive loading states and user feedback
// TODO: Remove hardcoded styles and use theme system consistently
// TODO: Add proper TypeScript interfaces for all props and state
// TODO: Remove console.log statements and use proper logging
// TODO: Add unit tests for all authentication flows
// TODO: Implement proper security measures (rate limiting, etc.)
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// characterTypes import removed - not needed for production
import { useUser } from '../context/UserContext';
import { db } from '../utils/databaseService';
import { restAdapter } from '../utils/restAdapter';
import { getSignInMethods, signInWithEmail as fbSignInWithEmail, signUpWithEmail as fbSignUpWithEmail, sendVerification as fbSendVerification, isEmailVerified as fbIsEmailVerified, sendPasswordReset } from '../utils/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import SimpleGoogleLoginButton from '../components/SimpleGoogleLoginButton';
import { useTranslation } from 'react-i18next';
import i18n from '../app/i18n';
import ScrollContainer from '../components/ScrollContainer';
import { scaleSize, getScreenInfo, vw, vh, biDiTextAlign } from '../globals/responsive';
import { 
  fontSizes, 
  layoutConstants, 
  componentSizes, 
  iconSizes 
} from '../globals/appConstants';
import colors from '../globals/colors';

export default function LoginScreen() {
  // TODO: Extract state management to custom hooks (useAuthState, useLoginForm)
  // TODO: Implement proper state validation and error boundaries
  // TODO: Add comprehensive analytics tracking for auth flow
  const { setSelectedUserWithMode, setGuestMode, selectedUser, isGuestMode } = useUser();
  const { t } = useTranslation(['auth', 'common', 'settings']);
  const navigation = useNavigation<any>();
  
  // Responsive screen info
  const { isTablet, isDesktop, isSmallPhone } = getScreenInfo();
  // Org login UI state
  const [orgLoginOpen, setOrgLoginOpen] = useState(false);
  const [orgQuery, setOrgQuery] = useState('');
  const [isCheckingOrg, setIsCheckingOrg] = useState(false);
  const orgOpenAnim = React.useRef(new Animated.Value(0)).current; // 0 closed, 1 open

  // Email login/register UI state
  const [emailLoginOpen, setEmailLoginOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'email' | 'password'>('email');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isEmailBusy, setIsEmailBusy] = useState(false);
  const emailOpenAnim = React.useRef(new Animated.Value(0)).current; // 0 closed, 1 open
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [emailStatusColor, setEmailStatusColor] = useState<string>('#4CAF50');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(true);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [orgEmailSuggestions, setOrgEmailSuggestions] = useState<string[]>([]);
  const KNOWN_EMAILS_KEY = 'known_emails';

  // Language menu state
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  
  // Security: Rate limiting for login attempts
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
  const MAX_LOGIN_ATTEMPTS = 10;
  const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

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

  // Character login functions removed for production

  const handleGuestMode = async () => {
    console.log('🔐 LoginScreen - handleGuestMode - Starting');
    try {
      await setGuestMode();
      console.log('🔐 LoginScreen - handleGuestMode - Guest mode set, navigating...');
      // Force immediate navigation to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    } catch (error) {
      console.error('🔐 LoginScreen - handleGuestMode - Error:', error);
      // Even if there's an error, try to navigate (fallback)
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    }
  };

  const resetEmailState = () => {
    setEmailStep('email');
    setPasswordValue('');
    setIsEmailBusy(false);
    setEmailExists(null);
    setEmailStatusMessage(null);
    setEmailSuggestions([]);
  };

  const resetOrgState = () => {
    setOrgQuery('');
    setIsCheckingOrg(false);
  };

  const toggleOrgLogin = () => {
    const next = !orgLoginOpen;
    if (next && emailLoginOpen) {
      setEmailLoginOpen(false);
      Animated.timing(emailOpenAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      resetEmailState();
    }
    setOrgLoginOpen(next);
    if (!next) resetOrgState();
    Animated.timing(orgOpenAnim, {
      toValue: next ? 1 : 0,
      duration: 260,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const toggleEmailLogin = () => {
    const next = !emailLoginOpen;
    if (next && orgLoginOpen) {
      setOrgLoginOpen(false);
      Animated.timing(orgOpenAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      resetOrgState();
    }
    setEmailLoginOpen(next);
    if (!next) resetEmailState();
    Animated.timing(emailOpenAnim, {
      toValue: next ? 1 : 0,
      duration: 260,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

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
      const methods = await getSignInMethods(lower);
      const hasPasswordProvider = Array.isArray(methods) && methods.some((m) => m && m.toLowerCase().includes('password'));
      if (hasPasswordProvider) return true;
      const cacheRaw = await AsyncStorage.getItem(KNOWN_EMAILS_KEY);
      const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
      if (Array.isArray(cache) && cache.includes(lower)) return true;
      return false;
    } catch (_) {
      const cacheRaw = await AsyncStorage.getItem(KNOWN_EMAILS_KEY);
      const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
      return Array.isArray(cache) && cache.includes(lower);
    }
  };

  // Enhanced email validation for production
  const validateEmailFormat = (email: string): boolean => {
    if (!email || email.length === 0) return false;
    if (email.length > 254) return false; // RFC 5321 limit
    
    // More robust email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.toLowerCase());
  };

  // Password strength validation
  const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
    if (!password) return { isValid: false, message: t('auth:validation.passwordRequired') as string };
    if (password.length < 8) return { isValid: false, message: t('auth:validation.passwordTooShort') as string };
    if (password.length > 128) return { isValid: false, message: t('auth:validation.passwordTooLong') as string };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (strength < 3) return { isValid: false, message: t('auth:validation.passwordWeak') as string };
    
    return { isValid: true };
  };

  useEffect(() => {
    if (!emailLoginOpen || emailStep !== 'email') {
      setEmailSuggestions([]);
      return;
    }
    const q = emailValue.trim().toLowerCase();
    if (!q) { setEmailSuggestions(recentEmails.slice(0, 5)); return; }
    setEmailSuggestions(recentEmails.filter((e) => e.toLowerCase().includes(q)).slice(0, 5));
  }, [emailValue, emailLoginOpen, emailStep, recentEmails]);

  useEffect(() => {
    if (!orgLoginOpen) { setOrgEmailSuggestions([]); return; }
    const q = orgQuery.trim().toLowerCase();
    if (!q) { setOrgEmailSuggestions(recentEmails.slice(0, 5)); return; }
    setOrgEmailSuggestions(recentEmails.filter((e) => e.toLowerCase().includes(q)).slice(0, 5));
  }, [orgQuery, orgLoginOpen, recentEmails]);

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
        setEmailStatusMessage(`${email} • ${t('auth:email.unknownEmail')}`);
        setEmailStatusColor('#C62828');
      }
      setEmailStep('password');
      setPasswordValue('');
    } catch (err) {
      console.error('Email check failed:', err);
        Alert.alert(t('common:error') as string, t('common:genericTryAgain') as string);
    } finally {
      setIsEmailBusy(false);
    }
  };

  const handleEmailSubmit = async () => {
      try {
        // Check rate limiting
        if (isRateLimited) {
          const timeLeft = lockoutEndTime ? Math.ceil((lockoutEndTime.getTime() - Date.now()) / 1000) : 0;
          if (timeLeft > 0) {
            Alert.alert(
              t('auth:security.rateLimitTitle') as string, 
              `${t('auth:security.rateLimitMessage')} ${Math.ceil(timeLeft / 60)} דקות`
            );
            return;
          } else {
            setIsRateLimited(false);
            setLockoutEndTime(null);
            setLoginAttempts(0);
          }
        }

        const email = emailValue.trim().toLowerCase();
        if (!email || !validateEmailFormat(email)) {
          Alert.alert(t('common:error') as string, t('auth:email.invalidFormat') as string);
          return;
        }
        const passwordValidation = validatePasswordStrength(passwordValue);
        if (!passwordValidation.isValid) {
          Alert.alert(t('common:error') as string, passwordValidation.message || t('auth:email.passwordTooShort') as string);
          return;
        }
      setIsEmailBusy(true);

      const exists = await isKnownEmail(email);
      setEmailExists(exists);

      const nowIso = new Date().toISOString();
      if (exists) {
        let fbUser;
        try {
          fbUser = await fbSignInWithEmail(email, passwordValue);
        } catch (e: any) {
          // Handle failed login attempt
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            setIsRateLimited(true);
            setLockoutEndTime(new Date(Date.now() + LOCKOUT_DURATION));
            setEmailStatusMessage(t('auth:security.accountLocked') as string);
            setEmailStatusColor('#D32F2F');
          } else {
            setEmailStatusMessage(`${t('auth:email.invalidPassword')} (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`);
            setEmailStatusColor('#C62828');
          }
          return;
        }
        const userData = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          phone: fbUser.phoneNumber || '+9720000000',
          avatar: fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
          bio: '',
          karmaPoints: 0,
          joinDate: nowIso,
          isActive: true,
          lastActive: nowIso,
          location: { city: t('common:labels.countryIsrael') as string, country: 'IL' },
          interests: [],
          roles: ['user'],
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          notifications: [],
          settings: { language: 'he', darkMode: false, notificationsEnabled: true },
        } as any;
        try {
          await restAdapter.create('users', userData.id, userData.id, userData);
        } catch (e) {
          console.log('Saving user on server failed (non-critical):', e);
        }
          await setSelectedUserWithMode(userData as any, 'real');
      } else {
        try {
          const fbUser = await fbSignUpWithEmail(email, passwordValue);
          await fbSendVerification(fbUser);
          Alert.alert(t('auth:email.verifyTitle') as string, t('auth:email.verifySent') as string);
        } catch (e: any) {
          if (String(e?.code || '').includes('auth/email-already-in-use')) {
            try {
              const fbUser = await fbSignInWithEmail(email, passwordValue);
              const userData = {
                id: fbUser.uid,
                name: fbUser.displayName || email.split('@')[0],
                email: fbUser.email || email,
                phone: fbUser.phoneNumber || '+9720000000',
                avatar: fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
                bio: '',
                karmaPoints: 0,
                joinDate: nowIso,
                isActive: true,
                lastActive: nowIso,
                location: { city: t('common:labels.countryIsrael') as string, country: 'IL' },
                interests: [],
                roles: ['user'],
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
                notifications: [],
                settings: { language: 'he', darkMode: false, notificationsEnabled: true },
              } as any;
              try { await restAdapter.create('users', userData.id, userData.id, userData); } catch (_) {}
              await saveRecentEmail(email);
              await setSelectedUserWithMode(userData as any, 'real');
            } catch (signinErr) {
              setEmailStatusMessage(t('auth:email.invalidPassword') as string);
              setEmailStatusColor('#C62828');
            }
          } else {
            console.error('Sign up failed:', e);
            Alert.alert(t('common:error') as string, t('auth:email.signupFailed') as string);
          }
        }
      }
    } catch (err) {
      console.error('Email submit failed:', err);
      Alert.alert(t('common:error') as string, t('common:genericTryAgain') as string);
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

      // 1) Search by email (primary key), otherwise by name from admin queue
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
        // 2) Create minimal org user and login
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

        await setSelectedUserWithMode(orgUser as any, 'real');
        return;
      }

      if (pending) {
        Alert.alert(t('auth:org.pendingTitle') as string, t('auth:org.pendingMessage') as string);
        return;
      }

      // 3) Not found — navigate to org onboarding screen
      navigation.navigate('OrgOnboardingScreen' as never);
    } catch (err) {
      console.error('Org login check failed:', err);
        Alert.alert(t('common:error') as string, t('auth:org.checkFailed') as string);
    } finally {
      setIsCheckingOrg(false);
    }
  };

    // Auto-navigation after successful authentication
  useEffect(() => {
    if (selectedUser && !isGuestMode) {
      // Navigate to home after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    }
  }, [selectedUser, isGuestMode, navigation]);

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
      
      <View style={styles.container}>
        {/* Background Logo */}
        <View style={styles.backgroundLogoContainer} pointerEvents="none">
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.backgroundLogo as any} 
            resizeMode="contain"
          />
        </View>
        
        {/* Header Section */}
         <View style={styles.headerSection}>
          <Text style={styles.title}>{t('auth:title') || t('common:welcomeShort')}</Text>
          <Text style={styles.subtitle}>{t('auth:subtitle') || ''}</Text>
          
          <View style={styles.buttonsContainer}>
            {/* Primary Authentication Method */}
            <SimpleGoogleLoginButton />
            

            {/* Email Register/Login CTA */}
            <View 
              style={styles.orgLoginContainer}
              accessible={true}
              
              importantForAccessibility="yes"
            >
              {!emailLoginOpen && (
                <TouchableOpacity
                  style={[styles.guestButton, styles.emailButton]}
                  onPress={toggleEmailLogin}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.guestButtonText, { color: '#4C7EFF', fontWeight: '700' }]}>
                    {t('auth:email.cta') }
                  </Text>
                </TouchableOpacity>
              )}

              {emailLoginOpen && (
                <View 
                  style={styles.orgExpandedRow}
                  accessible={true}
                  
                  importantForAccessibility="yes"
                >
                  <Animated.View style={[styles.orgMiniButton, { opacity: emailOpenAnim }] }>
                    <TouchableOpacity onPress={toggleEmailLogin} activeOpacity={0.8}>
                      <Ionicons name="mail-outline" size={20} color="#4C7EFF" />
                    </TouchableOpacity>
                  </Animated.View>
                  {emailStep === 'email' ? (
                    <TextInput
                      style={styles.orgInput}
                      placeholder={t('auth:email.placeholder')}
                      placeholderTextColor="#B0B0B0"
                      value={emailValue}
                      textAlign="right"
                      onChangeText={setEmailValue}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      inputMode="email"
                      keyboardType="email-address"
                      returnKeyType="done"
                      onSubmitEditing={handleEmailContinue}
                      accessible={true}
                      accessibilityLabel={t('auth:email.placeholder')}
                      accessibilityHint={t('auth:email.accessibilityHint') || 'Enter your email address'}
                      importantForAccessibility="yes"
                    />
                  ) : (
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.orgInput, { paddingRight: 40 }]}
                        placeholder={t('auth:email.passwordPlaceholder')}
                        placeholderTextColor="#B0B0B0"
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
                        accessibilityHint={t('auth:email.passwordAccessibilityHint') || 'Enter your password'}
                        importantForAccessibility="yes"
                      />
                      <TouchableOpacity onPress={() => setPasswordVisible(v => !v)} style={styles.eyeToggle}>
                        <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {emailStep === 'email' ? (
                    <TouchableOpacity
                      style={[styles.orgActionButton, isEmailBusy && styles.disabledButton]}
                      onPress={handleEmailContinue}
                      disabled={isEmailBusy}
                      activeOpacity={0.85}
                    >
                      <View style={styles.buttonContent}>
                        {isEmailBusy && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />}
                        <Text style={styles.orgActionButtonText}>{isEmailBusy ? t('auth:email.checking') : t('auth:email.continue')}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.orgActionButton, isEmailBusy && styles.disabledButton]}
                      onPress={handleEmailSubmit}
                      disabled={isEmailBusy}
                      activeOpacity={0.85}
                    >
                      <View style={styles.buttonContent}>
                        {isEmailBusy && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />}
                        <Text style={styles.orgActionButtonText}>{isEmailBusy ? t('auth:email.submitting') : t('auth:email.submit')}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Suggestions dropdown */}
              {emailLoginOpen && emailStep === 'email' && emailSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {emailSuggestions.map((sug) => (
                    <TouchableOpacity key={sug} style={styles.suggestionItem} onPress={() => { setEmailValue(sug); setEmailSuggestions([]); }}>
                      <Text style={styles.suggestionText}>{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Status line under email block */}
              {emailStatusMessage && (
                <>
                  <View style={styles.emailStatusRow}>
                    <Text style={[styles.emailStatusText, { color: emailStatusColor }]}>
                      {emailStatusMessage}
                    </Text>
                  </View>
                  {emailStatusColor === '#C62828' && emailStep === 'password' && (
                    <View style={styles.smallResetContainer}>
                      <TouchableOpacity
                        style={styles.smallResetButton}
                        onPress={async () => {
                          try {
                            await sendPasswordReset(emailValue.trim().toLowerCase());
                          } catch (_) {}
                          Linking.openURL('https://mail.google.com/mail');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallResetText}>{t('auth:email.resetPassword')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Enter Organization CTA - collapsible with input */}
            <View 
              style={styles.orgLoginContainer}
              accessible={true}
              
              importantForAccessibility="yes"
            >
              {!orgLoginOpen && (
                <TouchableOpacity
                  style={[styles.guestButton, styles.orgButton]}
                  onPress={toggleOrgLogin}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.guestButtonText, { color: '#FF6B9D', fontWeight: '700' }]}>
                    {t('auth:org.cta')}
                  </Text>
                </TouchableOpacity>
              )}

              {orgLoginOpen && (
                <View 
                  style={styles.orgExpandedRow}
                  accessible={true}
                  
                  importantForAccessibility="yes"
                >
                  <Animated.View style={[styles.orgMiniButton, { opacity: orgOpenAnim }] }>
                    <TouchableOpacity onPress={toggleOrgLogin} activeOpacity={0.8}>
                      <Ionicons name="business-outline" size={20} color="#FF6B9D" />
                    </TouchableOpacity>
                  </Animated.View>
                  <TextInput
                    style={styles.orgInput}
                    placeholder={t('auth:org.placeholder')}
                    placeholderTextColor="#B0B0B0"
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
                    accessibilityHint={t('auth:org.accessibilityHint') || 'Enter your organization email'}
                    importantForAccessibility="yes"
                  />
                  <TouchableOpacity
                    style={[styles.orgActionButton, isCheckingOrg && styles.disabledButton]}
                    onPress={handleOrgConfirm}
                    disabled={isCheckingOrg}
                    activeOpacity={0.85}
                  >
                    <View style={styles.buttonContent}>
                      {isCheckingOrg && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />}
                      <Text style={styles.orgActionButtonText}>{isCheckingOrg ? t('auth:org.checking') : t('auth:org.continue')}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              {orgLoginOpen && orgEmailSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {orgEmailSuggestions.map((sug) => (
                    <TouchableOpacity key={sug} style={styles.suggestionItem} onPress={() => { setOrgQuery(sug); setOrgEmailSuggestions([]); }}>
                      <Text style={styles.suggestionText}>{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>


            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>{t('auth:continueAsGuest')}</Text>
            </TouchableOpacity>

            {/* Character login removed for production */}
          </View>
        </View>

        {/* Improved Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.infoText}>{t('common:freeAppNotice')}</Text>
          <Text style={styles.versionText}>גרסה 1.0.0 | אפליקציה בטוחה ומאושרת</Text>
        </View>
      </View>
        </ScrollContainer>
        {/* Language switcher (top-right) */}
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

// Responsive variables outside component for better performance
const { isTablet, isDesktop, isSmallPhone } = getScreenInfo();

const spacing = {
  xs: scaleSize(layoutConstants.SPACING.XS),
  sm: scaleSize(layoutConstants.SPACING.SM),
  md: scaleSize(layoutConstants.SPACING.MD),
  lg: scaleSize(layoutConstants.SPACING.LG),
  xl: scaleSize(layoutConstants.SPACING.XL),
};

const responsive = {
  padding: isDesktop ? spacing.xl : isTablet ? spacing.lg : spacing.md,
  titleSize: isDesktop ? scaleSize(42) : isTablet ? scaleSize(38) : scaleSize(34),
  subtitleSize: isDesktop ? scaleSize(22) : isTablet ? scaleSize(20) : scaleSize(18),
  buttonPadding: isDesktop ? spacing.lg : isTablet ? spacing.md : spacing.sm,
  logoSize: isDesktop ? '100%' : isTablet ? '110%' : '120%',
  maxWidth: isDesktop ? vw(40) : isTablet ? vw(60) : vw(90),
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    container: {
      flex: 1,
      padding: responsive.padding,
      position: 'relative',
      maxWidth: responsive.maxWidth,
      alignSelf: 'center',
      width: '100%',
    },
    backgroundLogoContainer: {
      position: 'absolute',
      top: isDesktop ? vh(8) : isTablet ? vh(10) : vh(12),
      left: 0,
      right: 0,
      height: isDesktop ? vh(35) : isTablet ? vh(40) : vh(45),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.blueLight || '#E3F2FD',
      opacity: 0.3,
    },
    backgroundLogo: {
      width: responsive.logoSize as any,
      height: responsive.logoSize as any,
    },
    headerSection: {
      marginBottom: isDesktop ? spacing.xl : spacing.lg,
      alignItems: 'center',
      zIndex: 1,
      paddingHorizontal: spacing.md,
    },
    footerSection: {
      marginTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    languageFabContainer: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.md,
      alignItems: 'flex-end',
      zIndex: 20,
    },
    languageFab: {
      width: scaleSize(componentSizes.buttonSmall + 4),
      height: scaleSize(componentSizes.buttonSmall + 4),
      borderRadius: scaleSize((componentSizes.buttonSmall + 4) / 2),
      backgroundColor: colors.transparent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    languageMenu: {
      backgroundColor: colors.backgroundPrimary,
      borderWidth: 1,
      borderColor: colors.border || '#E8E8E8',
      borderRadius: scaleSize(layoutConstants.borderRadiusMedium),
      paddingVertical: spacing.xs,
      marginTop: spacing.xs,
      minWidth: scaleSize(130),
      shadowColor: colors.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    languageMenuItem: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    languageMenuText: {
      fontSize: scaleSize(fontSizes.body),
      color: colors.textPrimary,
      textAlign: biDiTextAlign('right'),
      fontWeight: '500',
    },
    title: {
      marginTop: isDesktop ? spacing.lg : spacing.md,
      fontSize: responsive.titleSize,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: responsive.subtitleSize,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: isDesktop ? spacing.xl * 2 : isTablet ? spacing.xl : spacing.lg,
      fontWeight: '500',
      lineHeight: responsive.subtitleSize * 1.4,
      paddingHorizontal: spacing.md,
    },
    // Error handling styles
    errorContainer: {
      alignItems: 'center',
      padding: spacing.lg,
    },
    errorText: {
      fontSize: scaleSize(fontSizes.medium),
      color: colors.error || '#FF4444',
      textAlign: 'center',
      fontWeight: '600',
    },
    errorSubtext: {
      fontSize: scaleSize(fontSizes.body),
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  // All character-related styles removed for production
    buttonsContainer: {
      marginBottom: spacing.lg,
      width: '100%',
      alignSelf: 'stretch',
      gap: spacing.sm,
    },
    // Button styles for general use
    disabledButton: {
      backgroundColor: colors.disabled || '#CCCCCC',
      opacity: 0.6,
    },
    disabledButtonText: {
      color: colors.textDisabled || '#999999',
    },
    guestButton: {
      backgroundColor: colors.backgroundPrimary,
      borderWidth: 2,
      borderColor: colors.blueLight || '#E0E7FF',
      borderRadius: scaleSize(layoutConstants.borderRadiusMedium),
      padding: responsive.buttonPadding,
      alignItems: 'center',
      shadowColor: colors.primary || '#4C7EFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      width: '100%',
      marginVertical: spacing.xs,
      minHeight: scaleSize(componentSizes.buttonLarge),
    },
    guestButtonText: {
      fontSize: scaleSize(fontSizes.medium),
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
      width: '100%',
    },
    infoText: {
      fontSize: scaleSize(fontSizes.body),
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    versionText: {
      fontSize: scaleSize(fontSizes.small),
      color: colors.textTertiary || '#999999',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    clearDataButton: {
      backgroundColor: colors.error || '#FF4444',
      borderRadius: scaleSize(layoutConstants.borderRadiusSmall),
      padding: spacing.sm,
      alignItems: 'center',
    },
    clearDataButtonText: {
      fontSize: scaleSize(fontSizes.body),
      color: colors.backgroundPrimary,
      fontWeight: '600',
    },
    // Organization and Email login styles
    orgLoginContainer: {
      marginVertical: spacing.xs,
    },
    orgButton: {
      borderColor: colors.pink || '#FF6B9D',
      width: '100%',
    },
    emailButton: {
      borderColor: colors.primary || '#4C7EFF',
      marginTop: spacing.sm,
      width: '100%',
    },
    orgExpandedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundPrimary,
      borderWidth: 1,
      borderColor: colors.border || '#E8E8E8',
      borderRadius: scaleSize(layoutConstants.borderRadiusMedium),
      padding: spacing.xs,
      marginHorizontal: 0,
      marginVertical: spacing.xs,
      gap: spacing.xs,
      width: '100%',
      minHeight: scaleSize(componentSizes.buttonMedium + 8),
    },
    orgMiniButton: {
      width: scaleSize(componentSizes.buttonMedium),
      height: scaleSize(componentSizes.buttonMedium),
      borderRadius: scaleSize(layoutConstants.borderRadiusSmall),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.pinkLight || 'rgba(255,107,157,0.08)',
    },
    orgInput: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
      borderWidth: 1,
      borderColor: colors.border || '#E8E8E8',
      borderRadius: scaleSize(layoutConstants.borderRadiusSmall),
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      fontSize: scaleSize(fontSizes.body),
      color: colors.textPrimary,
      textAlign: biDiTextAlign('right'),
    },
    orgActionButton: {
      backgroundColor: colors.pink || '#FF6B9D',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: scaleSize(layoutConstants.borderRadiusSmall),
      minWidth: scaleSize(80),
    },
    orgActionButtonText: {
      color: colors.backgroundPrimary,
      fontWeight: '700',
      fontSize: scaleSize(fontSizes.body),
      textAlign: 'center',
    },
    suggestionsBox: {
      backgroundColor: colors.backgroundPrimary,
      borderWidth: 1,
      borderColor: colors.border || '#E8E8E8',
      borderRadius: scaleSize(layoutConstants.borderRadiusSmall),
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      overflow: 'hidden',
      shadowColor: colors.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    suggestionItem: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.headerBorder || '#F0F0F0',
    },
    suggestionText: {
      fontSize: scaleSize(fontSizes.body),
      color: colors.textPrimary,
      textAlign: biDiTextAlign('right'),
    },
    inputWrapper: {
      position: 'relative',
      flex: 1,
    },
    eyeToggle: {
      position: 'absolute',
      right: spacing.xs,
      top: 0,
      bottom: 0,
      width: scaleSize(componentSizes.buttonMedium),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emailStatusRow: {
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    emailStatusText: {
      fontSize: scaleSize(fontSizes.small),
      fontWeight: '600',
      textAlign: biDiTextAlign('right'),
    },
    smallResetButton: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: colors.transparent,
      marginLeft: spacing.xs,
    },
    smallResetContainer: {
      paddingHorizontal: spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: spacing.xs / 2,
    },
    smallResetText: {
      fontSize: scaleSize(fontSizes.small),
      color: colors.primary || '#1976D2',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    passwordEyeButton: {
      marginLeft: spacing.xs,
      width: scaleSize(componentSizes.buttonMedium),
      height: scaleSize(componentSizes.buttonMedium),
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Button content for loading states
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
});