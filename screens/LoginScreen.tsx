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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { characterTypes } from '../globals/characterTypes';
import { useUser } from '../context/UserContext';
import { db } from '../utils/databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { setSelectedUser, setGuestMode, selectedUser, isGuestMode } = useUser();
  const { t } = useTranslation(['auth']);
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
      Alert.alert('בחירת דמות', 'אנא בחר דמות לפני הכניסה');
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
          { type: 'system', text: 'ברוך הבא!', date: new Date().toISOString() },
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

  const toggleOrgLogin = () => {
    const next = !orgLoginOpen;
    setOrgLoginOpen(next);
    Animated.timing(orgOpenAnim, {
      toValue: next ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
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
          <Text style={styles.title}>ברוכים הבאים!</Text>
          <Text style={styles.subtitle}>הקיבוץ הקפיטליסטי של ישראל</Text>
          
          <View style={styles.buttonsContainer}>
            <GoogleLoginButton />
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
                {selectedCharacter ? 'התחבר' : 'בחר דמות תחילה'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>המשך כאורח</Text>
            </TouchableOpacity>

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
                    placeholder={'הכנס שם ארגון'}
                    placeholderTextColor="#B0B0B0"
                    value={orgQuery}
                    onChangeText={setOrgQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleOrgConfirm}
                  />
                  <TouchableOpacity
                    style={[styles.orgActionButton, isCheckingOrg && styles.disabledButton]}
                    onPress={handleOrgConfirm}
                    disabled={isCheckingOrg}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.orgActionButtonText}>{isCheckingOrg ? 'בודק...' : 'המשך'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Characters Section */}
        <View style={styles.charactersSection}>
          <Text style={styles.characterTitle}>בחר דמות להתחברות:</Text>
          <Text style={styles.characterSubtitle}>לחץ שוב על דמות נבחרת כדי לבטל</Text>
          
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
                <Text style={styles.errorText}>שגיאה בטעינת הדמויות</Text>
                <Text style={styles.errorSubtext}>characterTypes length: {characterTypes?.length || 'undefined'}</Text>
              </View>
            )}
          </ScrollView>
        </View>

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
  charactersSection: {
    flex: 1,
    marginBottom: 20,
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
  // Org login styles
  orgLoginContainer: {
    marginTop: 12,
  },
  orgButton: {
    borderColor: '#FF6B9D',
  },
  orgExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 6,
    gap: 8,
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
}); 