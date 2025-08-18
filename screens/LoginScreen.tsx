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

export default function LoginScreen() {
  // TODO: Extract state management to custom hooks (useAuthState, useLoginForm)
  // TODO: Implement proper state validation and error boundaries
  // TODO: Add comprehensive analytics tracking for auth flow
  const { setSelectedUserWithMode, setGuestMode, selectedUser, isGuestMode } = useUser();
  const { t } = useTranslation(['auth', 'common', 'settings']);
  // Character selection removed for production
  const navigation = useNavigation<any>();
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
            style={styles.backgroundLogo} 
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
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth:orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 30 : 50, // Less top space on web
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? '40%' : '50%', // Less height on web
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    opacity: 0.4,
  },
  backgroundLogo: {
    width: Platform.OS === 'web' ? '120%' : '145%', // Smaller on web
    height: Platform.OS === 'web' ? '120%' : '145%', // Smaller on web
  },
  headerSection: {
    marginBottom: 30,
    alignItems: 'center',
    zIndex: 1,
  },
  // Characters section removed for production
  footerSection: {
    marginTop: 20,
  },
  languageFabContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  languageFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingVertical: 6,
    marginTop: 5,
    minWidth: 130,
  },
  languageMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageMenuText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  title: {
    marginTop: Platform.OS === 'web' ? 20 : 30,
    fontSize: Platform.OS === 'web' ? 34 : 38,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: Platform.OS === 'web' ? 50 : 80,
    fontWeight: '500',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  // Character-related styles removed for production
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 5,
  },
  // All character-related styles removed for production
  buttonsContainer: {
    marginBottom: 20,
    width: '100%',
    alignSelf: 'stretch',
  },
  // Button styles for general use
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#4C7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    marginVertical: 8,
    marginBottom: 24,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
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
  // Org login styles
  orgLoginContainer: {
    marginVertical: 3,
  },
  orgButton: {
    borderColor: '#FF6B9D',
    width: '100%',
  },
  emailButton: {
    borderColor: '#4C7EFF',
    marginTop: 12,
    width: '100%',
  },
  orgExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 0,
    marginVertical: 3,
    gap: 8,
    width: '100%',
  },
  orgMiniButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,157,0.08)',
  },
  orgInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  orgActionButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  orgActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  eyeToggle: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailStatusRow: {
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  emailStatusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  smallResetButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    marginLeft: 8,
  },
  smallResetContainer: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  smallResetText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  passwordEyeButton: {
    marginLeft: 6,
    width: 40,
    height: 40,
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