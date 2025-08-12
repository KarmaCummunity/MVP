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
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { characterTypes } from '../globals/characterTypes';
import { useUser } from '../context/UserContext';
import { db } from '../utils/databaseService';
import { restAdapter } from '../utils/restAdapter';
import { getSignInMethods, signInWithEmail as fbSignInWithEmail, signUpWithEmail as fbSignUpWithEmail, sendVerification as fbSendVerification, isEmailVerified as fbIsEmailVerified, sendPasswordReset } from '../utils/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useTranslation } from 'react-i18next';
import i18n from '../app/i18n';

export default function LoginScreen() {
  const { setSelectedUser, setGuestMode, selectedUser, isGuestMode } = useUser();
  const { t } = useTranslation(['auth', 'common', 'settings']);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [animationValues] = useState(() => 
    characterTypes.reduce((acc, character) => {
      acc[character.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );
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
          Alert.alert(t('settings:restartRequired', { defaultValue: 'נדרש אתחול' }) as string, t('settings:restartDesc', { defaultValue: 'שינוי כיוון הטקסט דורש אתחול האפליקציה.' }) as string);
        }
      }
    } finally {
      setLanguageMenuOpen(false);
    }
  };

  const handleCharacterSelect = (characterId: string) => {
    if (selectedCharacter === characterId) {
      setSelectedCharacter(null);
      console.log('🔐 LoginScreen - Character deselected:', characterId);
      
      Animated.spring(animationValues[characterId], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      setSelectedCharacter(characterId);
      console.log('🔐 LoginScreen - Character selected:', characterId);
      
      Animated.spring(animationValues[characterId], {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLoginWithGoogle = async () => {
    if (!selectedCharacter) {
      Alert.alert(t('auth:characters.selectTitle'), t('auth:characters.selectSubtitle'));
      return;
    }

    const character = characterTypes.find(c => c.id === selectedCharacter);
    console.log('🔐 LoginScreen - character:', character);
    if (character) {
      const userData = {
        id: character.id,
        name: character.name,
        email: `${character.id}@karmacommunity.com`,
        phone: '+972501234567',
        avatar: character.avatar,
        bio: character.bio,
        karmaPoints: character.karmaPoints,
        joinDate: character.joinDate,
        isActive: true,
        lastActive: new Date().toISOString(),
        location: character.location,
        interests: character.interests,
        roles: character.roles,
        postsCount: character.postsCount,
        followersCount: character.followersCount,
        followingCount: character.followingCount,
          notifications: [
            { type: 'system', text: t('home:welcome') || 'שלום', date: new Date().toISOString() },
          ],
        settings: {
          language: character.preferences.language,
          darkMode: false,
          notificationsEnabled: character.preferences.notifications,
        },
      };
      
      await setSelectedUser(userData);
    }
  };

  const handleGuestMode = async () => {
    console.log('🔐 LoginScreen - handleGuestMode');
    await setGuestMode();
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
        Alert.alert('שגיאה', 'אנא הזן מייל תקין');
        return;
      }
      setIsEmailBusy(true);
      const exists = await isKnownEmail(email);
      setEmailExists(exists);
      if (exists) {
        setEmailStatusMessage(`${email} • ${t('auth:email.knownUser', { defaultValue: 'מייל מוכר. הכנס סיסמה' })}`);
        setEmailStatusColor('#2E7D32');
      } else {
        setEmailStatusMessage(`${email} • ${t('auth:email.unknownEmail', { defaultValue: 'מייל לא מוכר, יש להירשם' })}`);
        setEmailStatusColor('#C62828');
      }
      setEmailStep('password');
      setPasswordValue('');
    } catch (err) {
      console.error('Email check failed:', err);
      Alert.alert('שגיאה', 'נכשלה בדיקת המייל. נסו שוב.');
    } finally {
      setIsEmailBusy(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      const email = emailValue.trim().toLowerCase();
      if (!email || !validateEmailFormat(email)) {
        Alert.alert('שגיאה', 'אנא הזן מייל תקין');
        return;
      }
      if (!passwordValue || passwordValue.length < 6) {
        Alert.alert('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים');
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
          setEmailStatusMessage(t('auth:email.invalidPassword', { defaultValue: 'סיסמה לא נכונה' }) as string);
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
          location: { city: 'ישראל', country: 'IL' },
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
          console.log('שמירת משתמש בשרת נכשלה (לא קריטי):', e);
        }
        await setSelectedUser(userData);
      } else {
        try {
          const fbUser = await fbSignUpWithEmail(email, passwordValue);
          await fbSendVerification(fbUser);
          Alert.alert('אימות מייל', 'שלחנו קישור אימות למייל שלך. לאחר אישור, חזרו למסך והתחברו כדי להשלים רישום.');
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
                location: { city: 'ישראל', country: 'IL' },
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
              await setSelectedUser(userData);
            } catch (signinErr) {
              setEmailStatusMessage(t('auth:email.invalidPassword', { defaultValue: 'סיסמה לא נכונה' }) as string);
              setEmailStatusColor('#C62828');
            }
          } else {
            console.error('Sign up failed:', e);
            Alert.alert('שגיאה', 'הרישום נכשל. נסו שוב.');
          }
        }
      }
    } catch (err) {
      console.error('Email submit failed:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה. נסו שוב.');
    } finally {
      setIsEmailBusy(false);
    }
  };

  const handleOrgConfirm = async () => {
    try {
      const query = orgQuery.trim();
      if (!query) {
        Alert.alert('שגיאה', 'אנא הזן שם ארגון או אימייל');
        return;
      }
      setIsCheckingOrg(true);

      // 1) חיפוש לפי אימייל (מפתח ראשי), אחרת לפי שם מתוך תור אדמין
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
        // 2) יצירת משתמש ארגוני מינימלי והתחברות
        const email = String(approved.contactEmail || (isEmail ? query : '')).toLowerCase();
        const orgUser = {
          id: `org_${approved.id}`,
          name: approved.orgName || 'ארגון',
          email: email || `org_${approved.id}@example.org`,
          phone: approved.contactPhone || '+9720000000',
          avatar: 'https://i.pravatar.cc/150?img=12',
          bio: 'חשבון ארגוני',
          karmaPoints: 0,
          joinDate: new Date().toISOString(),
          isActive: true,
          lastActive: new Date().toISOString(),
          location: { city: approved.city || 'ישראל', country: 'IL' },
          interests: [],
          roles: ['org_admin'],
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          notifications: [],
          settings: { language: 'he', darkMode: false, notificationsEnabled: true },
        } as any;

        await setSelectedUser(orgUser);
        return;
      }

      if (pending) {
        Alert.alert('ממתין לאישור', 'הבקשה שלכם ממתינה לאישור מנהלי המערכת. תקבלו גישה לאחר האישור.');
        return;
      }

      // 3) לא נמצא — ננווט למסך רישום ארגונים
      navigation.navigate('OrgOnboardingScreen' as never);
    } catch (err) {
      console.error('Org login check failed:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בבדיקת הארגון. נסו שוב.');
    } finally {
      setIsCheckingOrg(false);
    }
  };

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
          <Text style={styles.title}>{t('auth:title') || t('common:welcomeShort')}</Text>
          <Text style={styles.subtitle}>{t('auth:subtitle') || ''}</Text>
          
          <View style={styles.buttonsContainer}>
            <GoogleLoginButton />



            {/* Email Register/Login CTA - collapsible with input + status line */}
            <View style={styles.orgLoginContainer}>
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
                <View style={styles.orgExpandedRow}>
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
                      <Text style={styles.orgActionButtonText}>{isEmailBusy ? (t('auth:email.checking') || 'בודק...') : (t('auth:email.continue') || 'המשך')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.orgActionButton, isEmailBusy && styles.disabledButton]}
                      onPress={handleEmailSubmit}
                      disabled={isEmailBusy}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.orgActionButtonText}>{isEmailBusy ? (t('auth:email.submitting') || 'שולח...') : (t('auth:email.submit') || 'הרשם/היכנס')}</Text>
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
                        <Text style={styles.smallResetText}>{t('auth:email.resetPassword', { defaultValue: 'איפוס סיסמה' })}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Enter Organization CTA - collapsible with input */}
            <View style={styles.orgLoginContainer}>
              {!orgLoginOpen && (
                <TouchableOpacity
                  style={[styles.guestButton, styles.orgButton]}
                  onPress={toggleOrgLogin}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.guestButtonText, { color: '#FF6B9D', fontWeight: '700' }]}>
                    {t('auth:org.cta') || 'הכנס ארגון / עמותה'}
                  </Text>
                </TouchableOpacity>
              )}

              {orgLoginOpen && (
                <View style={styles.orgExpandedRow}>
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
                  />
                  <TouchableOpacity
                    style={[styles.orgActionButton, isCheckingOrg && styles.disabledButton]}
                    onPress={handleOrgConfirm}
                    disabled={isCheckingOrg}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.orgActionButtonText}>{isCheckingOrg ? (t('auth:org.checking') || 'בודק...') : (t('auth:org.continue') || 'המשך')}</Text>
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

            <TouchableOpacity
              style={[
                styles.googleButton,
                !selectedCharacter && styles.disabledButton
              ]}
              onPress={handleLoginWithGoogle}
              disabled={!selectedCharacter}
              activeOpacity={selectedCharacter ? 0.8 : 1}
            >
              <Text style={[
                styles.googleButtonText,
                !selectedCharacter && styles.disabledButtonText
              ]}>
               {selectedCharacter ? t('auth:loginCta') : t('auth:characters.selectUserFirst')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Characters Section */}
        <View style={styles.charactersSection}>
          <Text style={styles.characterTitle}>{t('auth:characters.selectTitle')}</Text>
          <Text style={styles.characterSubtitle}>{t('auth:characters.selectSubtitle')}</Text>
          
          <ScrollView 
            horizontal 
            style={styles.charactersContainer} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.charactersContent}
          >
            {characterTypes && characterTypes.length > 0 ? (
              characterTypes.map((character) => (
                <TouchableOpacity
                  key={character.id}
                  style={[
                    styles.characterCard,
                    selectedCharacter === character.id && styles.selectedCharacter,
                  ]}
                  onPress={() => handleCharacterSelect(character.id)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: animationValues[character.id] }],
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: character.avatar }} style={styles.characterAvatar} />
                      {selectedCharacter === character.id && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={24} color="#FF6B9D" />
                        </View>
                      )}
                    </View>
                    <View style={styles.characterInfo}>
                      <Text style={[
                        styles.characterName,
                        selectedCharacter === character.id && styles.selectedCharacterName
                      ]}>
                        {character.name}
                      </Text>
                      <Text style={[
                        styles.characterDescription,
                        selectedCharacter === character.id && styles.selectedCharacterDescription
                      ]}>
                        {character.description}
                      </Text>
                      <View style={styles.characterStats}>
                        <Text style={[
                          styles.characterStat,
                          selectedCharacter === character.id && styles.selectedCharacterStat
                        ]}>
                          💎 {character.karmaPoints} נקודות
                        </Text>
                        <Text style={[
                          styles.characterStat,
                          selectedCharacter === character.id && styles.selectedCharacterStat
                        ]}>
                          📍 {character.location.city}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.errorContainer}>
                 <Text style={styles.errorText}>{t('auth:characters.loadError')}</Text>
                <Text style={styles.errorSubtext}>characterTypes length: {characterTypes?.length || 'undefined'}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.infoText}>{t('common:freeAppNotice')}</Text>
        </View>
      </View>
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
              <Text style={styles.languageMenuText}>{t('common:languages.he', { defaultValue: 'עברית' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageMenuItem}
              onPress={() => applyLanguage('en')}
            >
              <Text style={styles.languageMenuText}>{t('common:languages.en', { defaultValue: 'English' })}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  charactersSection: {
    flex: 1,
    marginBottom: 20,
  },
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
    marginTop: 8,
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
    marginTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 100,
    fontWeight: '600',
  },
  characterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 5,
    textAlign: 'center',
  },
  characterSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  charactersContainer: {
    flex: 1,
  },
  charactersContent: {
    paddingHorizontal: 15,
  },
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
  characterCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 220,
    width: Math.max(Dimensions.get('window').width * 0.3, 130), // 30% מהמסך או מינימום 130px
    maxWidth: 170,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCharacter: {
    // borderColor: '#FF6B9ֿD',
    backgroundColor: 'rgba(255, 240, 245, 0.95)',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  characterName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  characterDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  characterStats: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  characterStat: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  selectedCharacterName: {
    color: '#FF6B9D',
    fontWeight: '700',
  },
  selectedCharacterDescription: {
    color: '#FF6B9D',
  },
  selectedCharacterStat: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  buttonsContainer: {
    marginBottom: 20,
    width: '100%',
    alignSelf: 'stretch',
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
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
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
    width: '100%',
    marginVertical: 6,
    marginBottom: 22,
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
}); 