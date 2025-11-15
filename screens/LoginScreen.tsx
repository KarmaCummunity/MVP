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
import { getScreenInfo, scaleSize } from '../globals/responsive';

export default function LoginScreen() {
  
  const { setCurrentPrincipal } = useUser(); // new API to set user identity and role
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
  const [emailStatusColor, setEmailStatusColor] = useState<string>('#4CAF50');
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
      // Force immediate navigation to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    } catch (error) {
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
        setEmailStatusColor('#2E7D32');
      } else {
        setEmailStatusMessage(`${email} • ${t('auth:email.unknownEmail')}`);
        setEmailStatusColor('#C62828');
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
          setEmailStatusColor('#C62828');
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
        }
          await setCurrentPrincipal({ user: userData as any, role: 'user' });
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
              await setCurrentPrincipal({ user: userData as any, role: 'user' });
            } catch (signinErr) {
              setEmailStatusMessage(t('auth:email.invalidPassword') as string);
              setEmailStatusColor('#C62828');
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
          
          {/* Version Number */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>v1.8.1</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <SimpleGoogleLoginButton />
            



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
                  <Text style={[styles.guestButtonText, { color: '#4C7EFF', fontWeight: '700' }]}>
                    {t('auth:email.cta') }
                  </Text>
                </TouchableOpacity>
              )}

              {emailLoginOpen && (
                <View 
                  style={[
                    styles.orgExpandedRow,
                    (isDesktopWeb || isTablet) && {
                      alignSelf: 'center',
                      minWidth: buttonMinWidth,
                      maxWidth: expandedRowMaxWidth,
                    },
                    !isDesktopWeb && !isTablet && {
                      width: '100%',
                    },
                  ]}
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
                  style={[
                    styles.orgExpandedRow,
                    (isDesktopWeb || isTablet) && {
                      alignSelf: 'center',
                      minWidth: buttonMinWidth,
                      maxWidth: expandedRowMaxWidth,
                    },
                    !isDesktopWeb && !isTablet && {
                      width: '100%',
                    },
                  ]}
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
      backgroundColor: '#F5F9FF',
    },
    container: {
      flex: 1,
      padding: isDesktopWeb ? 40 : isTablet ? 32 : 20,
      position: 'relative',
      ...(isDesktopWeb && {
        maxWidth: 600,
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
      backgroundColor: '#E3F2FD',
      opacity: 0.4,
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
    footerSection: {
      marginTop: isDesktopWeb ? 30 : isTablet ? 25 : 20,
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
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    languageMenu: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
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
      color: '#333333',
      textAlign: 'right',
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
      color: '#444444',
      textAlign: 'center',
      marginBottom: isDesktopWeb ? 50 : isTablet ? 45 : Platform.OS === 'web' ? 40 : 100,
      fontWeight: '600',
      paddingHorizontal: isDesktopWeb ? 20 : 0,
    },
    errorContainer: {
      alignItems: 'center',
      padding: isDesktopWeb ? 30 : isTablet ? 25 : 20,
    },
    errorText: {
      fontSize: isDesktopWeb ? 18 : isTablet ? 17 : scaleSize(16),
      color: '#FF4444',
      textAlign: 'center',
    },
    errorSubtext: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#888888',
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
      backgroundColor: '#FFFFFF',
      borderRadius: isDesktopWeb ? 14 : isTablet ? 13 : 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    // 🔥 buttonsContainer - מרכז את כל הכפתורים
    buttonsContainer: {
      marginBottom: isDesktopWeb ? 30 : isTablet ? 25 : 20,
      width: '100%',
      alignItems: 'center', // Center all buttons instead of stretch
    },
    disabledButton: {
      backgroundColor: '#CCCCCC',
      opacity: 0.6,
    },
    disabledButtonText: {
      color: '#999999',
    },
    // 🔥 guestButton - responsive, מותאם לטקסט, לא מרוח!
    guestButton: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: buttonBorderRadius,
      paddingHorizontal: buttonPaddingH,
      paddingVertical: buttonPaddingV,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignSelf: 'center', // Center button instead of full width
      marginVertical: buttonMarginVertical,
      marginBottom: isDesktopWeb ? 28 : isTablet ? 25 : 22,
      minWidth: buttonMinWidth,
      maxWidth: buttonMaxWidth,
    },
    // 🔥 guestButtonText - ללא width: '100%'
    guestButtonText: {
      fontSize: buttonFontSize,
      fontWeight: '600',
      color: '#666666',
      textAlign: 'center',
      // Removed width: '100%' - let text determine width
    },
    infoText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#666666',
      textAlign: 'center',
    },
    clearDataButton: {
      backgroundColor: '#FF4444',
      borderRadius: isDesktopWeb ? 10 : isTablet ? 9 : 8,
      padding: isDesktopWeb ? 12 : isTablet ? 11 : 10,
      alignItems: 'center',
    },
    clearDataButtonText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // 🔥 orgLoginContainer - מרכז את הכפתורים
    orgLoginContainer: {
      marginVertical: isDesktopWeb ? 4 : isTablet ? 3.5 : 3,
      alignItems: 'center', // Center container
      width: '100%',
    },
    // 🔥 orgButton - ללא width: '100%'
    orgButton: {
      borderColor: '#FF6B9D',
      // Removed width: '100%' - button will use guestButton styles
    },
    // 🔥 emailButton - ללא width: '100%'
    emailButton: {
      borderColor: '#4C7EFF',
      marginTop: isDesktopWeb ? 16 : isTablet ? 14 : 12,
      // Removed width: '100%' - button will use guestButton styles
    },
    // 🔥 orgExpandedRow - responsive, מותאם לכפתורים
    // Note: Dynamic width/alignment is applied in JSX, not in StyleSheet
    orgExpandedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
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
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: inputBorderRadius,
      paddingHorizontal: inputPaddingH,
      paddingVertical: inputPaddingV,
      fontSize: inputFontSize,
    },
    // 🔥 orgActionButton - responsive
    orgActionButton: {
      backgroundColor: '#FF6B9D',
      paddingHorizontal: actionButtonPaddingH,
      paddingVertical: actionButtonPaddingV,
      borderRadius: actionButtonBorderRadius,
    },
    orgActionButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: actionButtonFontSize,
    },
    // 🔥 suggestionsBox - responsive, מותאם לכפתורים
    suggestionsBox: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: suggestionsBoxBorderRadius,
      marginTop: suggestionsBoxMargin,
      marginBottom: suggestionsBoxMargin,
      overflow: 'hidden',
      alignSelf: 'center', // Center suggestions box
      minWidth: buttonMinWidth,
      maxWidth: suggestionsBoxMaxWidth,
    },
    suggestionItem: {
      paddingVertical: isDesktopWeb ? 10 : isTablet ? 9 : 8,
      paddingHorizontal: isDesktopWeb ? 16 : isTablet ? 14 : 12,
    },
    suggestionText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#333333',
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
      alignSelf: 'center', // Center status row
      minWidth: buttonMinWidth,
      maxWidth: statusRowMaxWidth,
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
      color: '#1976D2',
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
      marginBottom: isDesktopWeb ? 24 : isTablet ? 22 : 20,
      alignItems: 'center',
    },
    versionText: {
      fontSize: isDesktopWeb ? 16 : isTablet ? 15 : scaleSize(14),
      color: '#888888',
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontWeight: '500',
    },
  });
};

const styles = createLoginScreenStyles(); 