// File overview:
// - Purpose: Entry authentication screen with multiple login modes (Google, email/password, organization, guest).
// - Reached from: `MainNavigator` as initial route 'LoginScreen'.
// - On success: Resets navigation to `{ name: 'HomeStack' }` (BottomNavigator tabs).
// - Provides: UI states for email flow (2 steps), org lookup, language switcher (he/en with RTL toggle), guest mode.
// - Reads/writes: AsyncStorage for recent emails and language; queries org applications via `db`, users via `authService` + `restAdapter`.
// - Context: `useUser()` -> `setCurrentPrincipal` + `role` to לקבוע אורח/משתמש/מנהל ולנווט הביתה.
// - Navigation side-effects: `navigation.reset()` to 'HomeStack'; can navigate to 'OrgOnboardingScreen'.
// - External deps/services: i18n, firebase-like authService wrappers, restAdapter, databaseService.

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  Animated,
  Dimensions,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createShadowStyle } from '../globals/styles';
import { useUser } from '../stores/userStore';
import { db } from '../utils/databaseService';
import { restAdapter } from '../utils/restAdapter';
import { navigationQueue } from '../utils/navigationQueue';
import { checkNavigationGuards } from '../utils/navigationGuards';
import { getSignInMethods, signInWithEmail as fbSignInWithEmail, signUpWithEmail as fbSignUpWithEmail, sendVerification as fbSendVerification, isEmailVerified as fbIsEmailVerified, sendPasswordReset } from '../utils/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import FirebaseGoogleButton from '../components/FirebaseGoogleButton';
import { useTranslation } from 'react-i18next';
import i18n from '../app/i18n';
import ScrollContainer from '../components/ScrollContainer';
import { getScreenInfo, scaleSize } from '../globals/responsive';
import { APP_VERSION } from '../globals/constants';
import colors from '../globals/colors';

export default function LoginScreen() {

  const { setCurrentPrincipal, isAuthenticated, isGuestMode } = useUser(); // new API to set user identity and role
  const { t } = useTranslation(['auth', 'common', 'settings']); // translations for the login screen

  // Get responsive values for dynamic styles in JSX
  const { width } = Dimensions.get('window');
  const { isTablet, isDesktop } = getScreenInfo();
  const isDesktopWeb = Platform.OS === 'web' && width > 1024;
  const buttonMinWidth = isDesktopWeb ? 280 : isTablet ? 240 : 200;
  const expandedRowMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
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
  const [emailStatusColor, setEmailStatusColor] = useState<string>(colors.success);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(true);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [orgEmailSuggestions, setOrgEmailSuggestions] = useState<string[]>([]);
  const KNOWN_EMAILS_KEY = 'known_emails';

  // Language menu state
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

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

      // Check guards before navigation
      // After setCurrentPrincipal, user is authenticated as guest
      const guardContext = {
        isAuthenticated: true,
        isGuestMode: true,
        isAdmin: false,
      };

      const guardResult = await checkNavigationGuards(
        {
          type: 'reset',
          index: 0,
          routes: [{ name: 'HomeStack' }],
        },
        guardContext
      );

      if (!guardResult.allowed) {
        // If guard blocks, try redirect if provided
        if (guardResult.redirectTo) {
          await navigationQueue.reset(0, [{ name: guardResult.redirectTo }], 2);
        }
        return;
      }

      // Use navigation queue with high priority (2) for auth changes
      await navigationQueue.reset(0, [{ name: 'HomeStack' }], 2);
    } catch (error) {
      // Even if there's an error, try to navigate (fallback)
      await navigationQueue.reset(0, [{ name: 'HomeStack' }], 2);
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
      } catch (_) { }
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
    } catch (_) { }
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

  const validateEmailFormat = (email: string) => {
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return re.test(String(email).toLowerCase());
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
        setEmailStatusColor(colors.success);
      } else {
        setEmailStatusMessage(`${email} • ${t('auth:email.unknownEmail')}`);
        setEmailStatusColor(colors.error);
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
      if (exists) {
        let fbUser;
        try {
          fbUser = await fbSignInWithEmail(email, passwordValue);
        } catch (e: any) {
          setEmailStatusMessage(t('auth:email.invalidPassword') as string);
          setEmailStatusColor(colors.error);
          return;
        }
        // Get UUID from server using firebase_uid
        try {
          const { apiService } = await import('../utils/apiService');
          const resolveResponse = await apiService.resolveUserId({ 
            firebase_uid: fbUser.uid,
            email: fbUser.email || email 
          });
          
          if (!resolveResponse.success || !(resolveResponse as any).user) {
            // Fallback: try to get user by email
            const userResponse = await apiService.getUserById(fbUser.email || email);
            if (userResponse.success && userResponse.data) {
              const serverUser = userResponse.data;
              const userData = {
                id: serverUser.id, // UUID from database
                name: serverUser.name || fbUser.displayName || email.split('@')[0],
                email: serverUser.email || fbUser.email || email,
                phone: serverUser.phone || fbUser.phoneNumber || '+9720000000',
                avatar: serverUser.avatar_url || fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
                bio: serverUser.bio || '',
                karmaPoints: serverUser.karma_points || 0,
                joinDate: serverUser.join_date || serverUser.created_at || nowIso,
                isActive: serverUser.is_active !== false,
                lastActive: serverUser.last_active || nowIso,
                location: { city: serverUser.city || t('common:labels.countryIsrael') as string, country: serverUser.country || 'IL' },
                interests: serverUser.interests || [],
                roles: serverUser.roles || ['user'],
                postsCount: serverUser.posts_count || 0,
                followersCount: serverUser.followers_count || 0,
                followingCount: serverUser.following_count || 0,
                notifications: [],
                settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
              } as any;
              await setCurrentPrincipal({ user: userData as any, role: 'user' });
              return;
            }
            throw new Error('Failed to get user from server');
          }
          
          // Use UUID from server
          const serverUser = (resolveResponse as any).user;
          const userData = {
            id: serverUser.id, // UUID from database - this is the primary identifier
            name: serverUser.name || fbUser.displayName || email.split('@')[0],
            email: serverUser.email || fbUser.email || email,
            phone: serverUser.phone || fbUser.phoneNumber || '+9720000000',
            avatar: serverUser.avatar || fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
            bio: serverUser.bio || '',
            karmaPoints: serverUser.karmaPoints || 0,
            joinDate: serverUser.createdAt || serverUser.joinDate || nowIso,
            isActive: serverUser.isActive !== false,
            lastActive: serverUser.lastActive || nowIso,
            location: serverUser.location || { city: t('common:labels.countryIsrael') as string, country: 'IL' },
            interests: serverUser.interests || [],
            roles: serverUser.roles || ['user'],
            postsCount: serverUser.postsCount || 0,
            followersCount: serverUser.followersCount || 0,
            followingCount: serverUser.followingCount || 0,
            notifications: [],
            settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
          } as any;
          await setCurrentPrincipal({ user: userData as any, role: 'user' });
        } catch (error) {
          console.error('Failed to get user UUID from server:', error);
          setEmailStatusMessage(t('auth:email.invalidPassword') as string);
          setEmailStatusColor(colors.error);
        }
      } else {
        try {
          const fbUser = await fbSignUpWithEmail(email, passwordValue);
          await fbSendVerification(fbUser);
          Alert.alert(t('auth:email.verifyTitle') as string, t('auth:email.verifySent') as string);
        } catch (e: any) {
          if (String(e?.code || '').includes('auth/email-already-in-use')) {
            try {
              const fbUser = await fbSignInWithEmail(email, passwordValue);
              
              // Get UUID from server using firebase_uid
              const { apiService } = await import('../utils/apiService');
              const resolveResponse = await apiService.resolveUserId({ 
                firebase_uid: fbUser.uid,
                email: fbUser.email || email 
              });
              
              if (!resolveResponse.success || !(resolveResponse as any).user) {
                // Fallback: try to get user by email
                const userResponse = await apiService.getUserById(fbUser.email || email);
                if (userResponse.success && userResponse.data) {
                  const serverUser = userResponse.data;
                  const userData = {
                    id: serverUser.id, // UUID from database
                    name: serverUser.name || fbUser.displayName || email.split('@')[0],
                    email: serverUser.email || fbUser.email || email,
                    phone: serverUser.phone || fbUser.phoneNumber || '+9720000000',
                    avatar: serverUser.avatar_url || fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
                    bio: serverUser.bio || '',
                    karmaPoints: serverUser.karma_points || 0,
                    joinDate: serverUser.join_date || serverUser.created_at || nowIso,
                    isActive: serverUser.is_active !== false,
                    lastActive: serverUser.last_active || nowIso,
                    location: { city: serverUser.city || t('common:labels.countryIsrael') as string, country: serverUser.country || 'IL' },
                    interests: serverUser.interests || [],
                    roles: serverUser.roles || ['user'],
                    postsCount: serverUser.posts_count || 0,
                    followersCount: serverUser.followers_count || 0,
                    followingCount: serverUser.following_count || 0,
                    notifications: [],
                    settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
                  } as any;
                  // User is already in database from resolveUserId/getUserById - no need to create via restAdapter
                  await saveRecentEmail(email);
                  await setCurrentPrincipal({ user: userData as any, role: 'user' });
                  return;
                }
                throw new Error('Failed to get user from server');
              }
              
              // Use UUID from server
              const serverUser = (resolveResponse as any).user;
              const userData = {
                id: serverUser.id, // UUID from database - this is the primary identifier
                name: serverUser.name || fbUser.displayName || email.split('@')[0],
                email: serverUser.email || fbUser.email || email,
                phone: serverUser.phone || fbUser.phoneNumber || '+9720000000',
                avatar: serverUser.avatar || fbUser.photoURL || 'https://i.pravatar.cc/150?img=1',
                bio: serverUser.bio || '',
                karmaPoints: serverUser.karmaPoints || 0,
                joinDate: serverUser.createdAt || serverUser.joinDate || nowIso,
                isActive: serverUser.isActive !== false,
                lastActive: serverUser.lastActive || nowIso,
                location: serverUser.location || { city: t('common:labels.countryIsrael') as string, country: 'IL' },
                interests: serverUser.interests || [],
                roles: serverUser.roles || ['user'],
                postsCount: serverUser.postsCount || 0,
                followersCount: serverUser.followersCount || 0,
                followingCount: serverUser.followingCount || 0,
                notifications: [],
                settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
              } as any;
              // User is already in database from resolveUserId/getUserById - no need to create via restAdapter
              await saveRecentEmail(email);
              await setCurrentPrincipal({ user: userData as any, role: 'user' });
            } catch (signinErr: any) {
              setEmailStatusMessage(t('auth:email.invalidPassword') as string);
              setEmailStatusColor(colors.error);
            }
          } else {
            Alert.alert(t('common:error') as string, t('auth:email.signupFailed') as string);
          }
        }
      }
    } catch (err) {
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

        await setCurrentPrincipal({ user: orgUser as any, role: 'user' });
        return;
      }

      if (pending) {
        Alert.alert(t('auth:org.pendingTitle') as string, t('auth:org.pendingMessage') as string);
        return;
      }

      // 3) Not found — navigate to org onboarding screen
      navigation.navigate('OrgOnboardingScreen' as never);
    } catch (err) {
      Alert.alert(t('common:error') as string, t('auth:org.checkFailed') as string);
    } finally {
      setIsCheckingOrg(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        accessible={true}
        accessibilityViewIsModal={false}
      >
        <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
        <ScrollContainer
          contentStyle={{ flexGrow: 1, paddingBottom: 0 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'interactive'}
          contentInsetAdjustmentBehavior="always"
        >

          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              {/* Mode Toggle Button */}
              <View style={styles.topButtonsContainer}>
                {/* Language switcher */}
                <View pointerEvents="box-none" style={styles.languageButtonContainer}>
                  <TouchableOpacity
                    style={styles.languageButton}
                    activeOpacity={0.8}
                    onPress={() => setLanguageMenuOpen((prev) => !prev)}
                  >
                    <Ionicons name="globe-outline" size={22} color={colors.textPrimary} />
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
              </View>

              <Text style={styles.title}>{t('auth:title') || t('common:welcomeShort')}</Text>
              <Text style={styles.subtitle}>{t('auth:subtitle') || ''}</Text>

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/new_logo_black.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.buttonsContainer}>
                <FirebaseGoogleButton />

                {/* Email Register/Login CTA - collapsible with input + status line */}
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
                      <Text style={[styles.guestButtonText, { color: colors.primary, fontWeight: '700' }]}>
                        {t('auth:email.cta')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {emailLoginOpen && (
                    <View
                      style={[
                        styles.orgExpandedRow,
                        {
                          width: '100%',
                        },
                      ]}
                      accessible={true}

                      importantForAccessibility="yes"
                    >
                      <Animated.View style={[styles.orgMiniButton, { opacity: emailOpenAnim }]}>
                        <TouchableOpacity onPress={toggleEmailLogin} activeOpacity={0.8}>
                          <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </Animated.View>
                      {emailStep === 'email' ? (
                        <TextInput
                          style={styles.orgInput}
                          placeholder={t('auth:email.placeholder')}
                          placeholderTextColor={colors.textTertiary}
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
                            placeholderTextColor={colors.textTertiary}
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
                            <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
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
                          <Text style={styles.orgActionButtonText}>{isEmailBusy ? t('auth:email.checking') : t('auth:email.continue')}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.orgActionButton, isEmailBusy && styles.disabledButton]}
                          onPress={handleEmailSubmit}
                          disabled={isEmailBusy}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.orgActionButtonText}>{isEmailBusy ? t('auth:email.submitting') : t('auth:email.submit')}</Text>
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
                      {emailStatusColor === colors.error && emailStep === 'password' && (
                        <View style={styles.smallResetContainer}>
                          <TouchableOpacity
                            style={styles.smallResetButton}
                            onPress={async () => {
                              try {
                                await sendPasswordReset(emailValue.trim().toLowerCase());
                              } catch (_) { }
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
                      <Text style={[styles.guestButtonText, { color: colors.secondary, fontWeight: '700' }]}>
                        {t('auth:org.cta')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {orgLoginOpen && (
                    <View
                      style={[
                        styles.orgExpandedRow,
                        {
                          width: '100%',
                        },
                      ]}
                      accessible={true}

                      importantForAccessibility="yes"
                    >
                      <Animated.View style={[styles.orgMiniButton, { opacity: orgOpenAnim }]}>
                        <TouchableOpacity onPress={toggleOrgLogin} activeOpacity={0.8}>
                          <Ionicons name="business-outline" size={20} color={colors.secondary} />
                        </TouchableOpacity>
                      </Animated.View>
                      <TextInput
                        style={styles.orgInput}
                        placeholder={t('auth:org.placeholder')}
                        placeholderTextColor={colors.textTertiary}
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
                        <Text style={styles.orgActionButtonText}>{isCheckingOrg ? t('auth:org.checking') : t('auth:org.continue')}</Text>
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

              </View>
            </View>


            {/* Footer Section */}
            <View style={styles.footerSection}>
              <Text style={styles.infoText}>{t('common:freeAppNotice')}</Text>
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>v{APP_VERSION}</Text>
              </View>
            </View>
          </View>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Create responsive styles function
const createLoginScreenStyles = () => {
  const { width } = Dimensions.get('window');
  const { isTablet, isDesktop } = getScreenInfo();
  const isDesktopWeb = Platform.OS === 'web' && width > 1024;
  const isMobileWeb = Platform.OS === 'web' && width <= 768;

  // Responsive button values
  const buttonPaddingH = isDesktopWeb ? 32 : isTablet ? 28 : 24;
  const buttonPaddingV = isDesktopWeb ? 16 : isTablet ? 14 : 12;
  const buttonMinWidth = isDesktopWeb ? 280 : isTablet ? 240 : 200;
  const buttonMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
  const buttonBorderRadius = isDesktopWeb ? 14 : isTablet ? 13 : 12;
  const buttonFontSize = isDesktopWeb ? 18 : isTablet ? 17 : scaleSize(16);
  const buttonMarginBottom = isDesktopWeb ? 16 : isTablet ? 14 : 12;
  const buttonMarginVertical = isDesktopWeb ? 8 : isTablet ? 7 : 6;

  // Expanded row values
  const expandedRowMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
  const expandedRowPadding = isDesktopWeb ? 8 : isTablet ? 7 : 6;
  const expandedRowGap = isDesktopWeb ? 10 : isTablet ? 9 : 8;
  const expandedRowBorderRadius = isDesktopWeb ? 14 : isTablet ? 13 : 12;

  // Input values
  const inputPaddingH = isDesktopWeb ? 16 : isTablet ? 14 : 12;
  const inputPaddingV = isDesktopWeb ? 12 : isTablet ? 11 : 10;
  const inputFontSize = isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14);
  const inputBorderRadius = isDesktopWeb ? 12 : isTablet ? 11 : 10;

  // Action button values
  const actionButtonPaddingH = isDesktopWeb ? 20 : isTablet ? 18 : 16;
  const actionButtonPaddingV = isDesktopWeb ? 14 : isTablet ? 13 : 12;
  const actionButtonFontSize = isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14);
  const actionButtonBorderRadius = isDesktopWeb ? 12 : isTablet ? 11 : 10;

  // Mini button values
  const miniButtonSize = isDesktopWeb ? 44 : isTablet ? 42 : 40;
  const miniButtonBorderRadius = isDesktopWeb ? 11 : isTablet ? 10.5 : 10;

  // Suggestions box values
  const suggestionsBoxMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
  const suggestionsBoxBorderRadius = isDesktopWeb ? 12 : isTablet ? 11 : 10;
  const suggestionsBoxMargin = isDesktopWeb ? 8 : isTablet ? 7 : 6;

  // Status row values
  const statusRowMaxWidth = isDesktopWeb ? 400 : isTablet ? 360 : '100%';
  const statusRowPadding = isDesktopWeb ? 8 : isTablet ? 7 : 6;
  const statusRowFontSize = isDesktopWeb ? 15 : isTablet ? 14 : scaleSize(13);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundTertiary,
    },
    container: {
      flex: 1,
      paddingTop: isDesktopWeb ? 20 : isTablet ? 20 : 20,
      paddingHorizontal: isDesktopWeb ? 40 : isTablet ? 32 : 20,
      position: 'relative',
      width: '100%',
      justifyContent: 'space-between',
    },
    topButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: isDesktopWeb ? 20 : isTablet ? 18 : 16,
      paddingHorizontal: isDesktopWeb ? 0 : isTablet ? 0 : 0,
    },
    languageButtonContainer: {
      alignItems: 'flex-start',
      zIndex: 20,
    },
    languageButton: {
      width: isDesktopWeb ? 40 : isTablet ? 38 : 36,
      height: isDesktopWeb ? 40 : isTablet ? 38 : 36,
      borderRadius: isDesktopWeb ? 20 : isTablet ? 19 : 18,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isDesktopWeb ? 30 : isTablet ? 25 : 20,
      marginTop: isDesktopWeb ? 20 : isTablet ? 18 : 16,
    },
    logo: {
      width: isDesktopWeb ? 280 : isTablet ? 250 : 220,
      height: isDesktopWeb ? 280 : isTablet ? 250 : 220,
    },
    headerSection: {
      // marginBottom: isDesktopWeb ? 40 : isTablet ? 35 : 30,
      alignItems: 'center',
      zIndex: 1,
      width: '100%',
      // paddingTop: isDesktopWeb ? 20 : isTablet ? 16 : 12,
    },
    footerSection: {
      marginBottom: isDesktopWeb ? 8 : isTablet ? 7 : 6,
      marginTop: isDesktopWeb ? 20 : isTablet ? 18 : 16,
    },
    languageMenu: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: isDesktopWeb ? 12 : isTablet ? 11 : 10,
      paddingVertical: isDesktopWeb ? 8 : isTablet ? 7 : 6,
      marginTop: isDesktopWeb ? 6 : isTablet ? 5.5 : 5,
      minWidth: isDesktopWeb ? 150 : isTablet ? 140 : 130,
    },
    languageMenuItem: {
      paddingHorizontal: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      paddingVertical: isDesktopWeb ? 10 : isTablet ? 9 : 8,
    },
    languageMenuText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: colors.textPrimary,
      textAlign: 'right',
    },
    title: {
      marginTop: 0,
      fontSize: isDesktopWeb ? 42 : isTablet ? 36 : scaleSize(32),
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: isDesktopWeb ? 12 : isTablet ? 11 : 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: isDesktopWeb ? 20 : isTablet ? 18 : scaleSize(16),
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: isDesktopWeb ? 20 : isTablet ? 18 : 16,
      fontWeight: '600',
      paddingHorizontal: isDesktopWeb ? 20 : 0,
    },
    errorContainer: {
      alignItems: 'center',
      padding: isDesktopWeb ? 30 : isTablet ? 25 : 20,
    },
    errorText: {
      fontSize: isDesktopWeb ? 18 : isTablet ? 17 : scaleSize(16),
      color: colors.error,
      textAlign: 'center',
    },
    errorSubtext: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: isDesktopWeb ? 8 : isTablet ? 6 : 5,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: isDesktopWeb ? 10 : isTablet ? 9 : 8,
    },
    checkmarkContainer: {
      position: 'absolute',
      top: isDesktopWeb ? -6 : isTablet ? -5.5 : -5,
      right: isDesktopWeb ? -6 : isTablet ? -5.5 : -5,
      backgroundColor: colors.white,
      borderRadius: isDesktopWeb ? 14 : isTablet ? 13 : 12,
      ...createShadowStyle('colors.black', { width: 0, height: 1 }, 0.2, 2),
      elevation: 2,
    },
    // 🔥 buttonsContainer - מרכז את כל הכפתורים
    buttonsContainer: {
      marginTop: isDesktopWeb ? 40 : isTablet ? 40 : 30,
      marginBottom: isDesktopWeb ? 30 : isTablet ? 25 : 20,
      width: '100%',
      alignItems: 'stretch', // Stretch buttons to full width
      gap: isDesktopWeb ? 16 : isTablet ? 14 : 12, // Equal spacing between buttons
    },
    disabledButton: {
      backgroundColor: colors.textTertiary,
      opacity: 0.6,
    },
    disabledButtonText: {
      color: colors.textTertiary,
    },
    // 🔥 guestButton - responsive, מותאם לטקסט, לא מרוח!
    guestButton: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: buttonBorderRadius,
      paddingHorizontal: buttonPaddingH,
      paddingVertical: buttonPaddingV,
      alignItems: 'center',
      ...createShadowStyle('colors.black', { width: 0, height: 2 }, 0.1, 4),
      elevation: 3,
      width: '100%', // Full width instead of centered
      marginVertical: 0, // Remove vertical margin, use gap in container instead
      marginBottom: 0, // Remove bottom margin, use gap in container instead
    },
    // 🔥 guestButtonText - ללא width: '100%'
    guestButtonText: {
      fontSize: buttonFontSize,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
      // Removed width: '100%' - let text determine width
    },
    infoText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: colors.textSecondary,
      textAlign: 'center',
    },
    clearDataButton: {
      backgroundColor: colors.error,
      borderRadius: isDesktopWeb ? 10 : isTablet ? 9 : 8,
      padding: isDesktopWeb ? 12 : isTablet ? 11 : 10,
      alignItems: 'center',
    },
    clearDataButtonText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: colors.white,
      fontWeight: '600',
    },
    // 🔥 orgLoginContainer - מרכז את הכפתורים
    orgLoginContainer: {
      alignSelf: 'center',
      marginTop: "1%",
      // alignItems: 'stretch', // Stretch to full width
      width: '80%',
      height: '50%',
    },
    // 🔥 orgButton - ללא width: '100%'
    orgButton: {
      borderColor: colors.secondary,
      // Removed width: '100%' - button will use guestButton styles
    },
    // 🔥 emailButton - ללא width: '100%'
    emailButton: {
      borderColor: colors.primary,
      marginTop: 0, // Remove top margin, use gap in container instead
      // Removed width: '100%' - button will use guestButton styles
    },
    // 🔥 orgExpandedRow - responsive, מותאם לכפתורים
    // Note: Dynamic width/alignment is applied in JSX, not in StyleSheet
    orgExpandedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: expandedRowBorderRadius,
      padding: expandedRowPadding,
      marginHorizontal: 0,
      marginVertical: isDesktopWeb ? 4 : isTablet ? 3.5 : 3,
      gap: expandedRowGap,
    },
    // 🔥 orgMiniButton - responsive
    orgMiniButton: {
      width: miniButtonSize,
      height: miniButtonSize,
      borderRadius: miniButtonBorderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,107,157,0.08)',
    },
    // 🔥 orgInput - responsive
    orgInput: {
      flex: 1,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: inputBorderRadius,
      paddingHorizontal: inputPaddingH,
      paddingVertical: inputPaddingV,
      fontSize: inputFontSize,
    },
    // 🔥 orgActionButton - responsive
    orgActionButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: actionButtonPaddingH,
      paddingVertical: actionButtonPaddingV,
      borderRadius: actionButtonBorderRadius,
    },
    orgActionButtonText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: actionButtonFontSize,
    },
    // 🔥 suggestionsBox - responsive, מותאם לכפתורים
    suggestionsBox: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: suggestionsBoxBorderRadius,
      marginTop: suggestionsBoxMargin,
      marginBottom: suggestionsBoxMargin,
      overflow: 'hidden',
      width: '100%', // Full width instead of centered
    },
    suggestionItem: {
      paddingVertical: isDesktopWeb ? 10 : isTablet ? 9 : 8,
      paddingHorizontal: isDesktopWeb ? 16 : isTablet ? 14 : 12,
    },
    suggestionText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: colors.textPrimary,
      textAlign: 'right',
    },
    inputWrapper: {
      position: 'relative',
      flex: 1,
    },
    // 🔥 eyeToggle - responsive
    eyeToggle: {
      position: 'absolute',
      right: isDesktopWeb ? 6 : isTablet ? 5.5 : 5,
      top: 0,
      bottom: 0,
      width: miniButtonSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // 🔥 emailStatusRow - responsive, מותאם לכפתורים
    emailStatusRow: {
      marginTop: suggestionsBoxMargin,
      marginBottom: suggestionsBoxMargin,
      paddingHorizontal: statusRowPadding,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      width: '100%', // Full width instead of centered
    },
    emailStatusText: {
      fontSize: statusRowFontSize,
      fontWeight: '600',
      textAlign: 'right',
    },
    smallResetButton: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
      marginLeft: isDesktopWeb ? 10 : isTablet ? 9 : 8,
    },
    smallResetContainer: {
      paddingHorizontal: isDesktopWeb ? 8 : isTablet ? 7 : 6,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: isDesktopWeb ? 6 : isTablet ? 5 : 4,
    },
    smallResetText: {
      fontSize: isDesktopWeb ? 15 : isTablet ? 14 : scaleSize(13),
      color: colors.primary,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    passwordEyeButton: {
      marginLeft: isDesktopWeb ? 8 : isTablet ? 7 : 6,
      width: miniButtonSize,
      height: miniButtonSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Version styles
    versionContainer: {
      marginTop: isDesktopWeb ? 12 : isTablet ? 10 : 8,
      alignItems: 'center',
    },
    versionText: {
      fontSize: isDesktopWeb ? 14 : isTablet ? 13 : scaleSize(12),
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontWeight: '500',
    },
  });
};

const styles = createLoginScreenStyles(); 
