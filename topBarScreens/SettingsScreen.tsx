// File overview:
// - Purpose: App settings screen (language, theme, notifications, privacy, org/admin links). Handles logout with guest/auth distinctions.
// - Reached from: Top bar (via `TopBarNavigator`) and directly from multiple stacks as 'SettingsScreen'.
// - Provides: Platform-specific scroll (web vs native), language modal and i18n+RTL application, navigation to About, Org Dashboard, Admin Approvals.
// - Reads from context: `useUser()` -> `isGuestMode`, `selectedUser`, `isAuthenticated`, `signOut`.
// - Side effects: On logout, navigates to 'LoginScreen'; on language change, persists to AsyncStorage and toggles RTL.
/**
 * SettingsScreen - Modern Settings Interface
 * 
 * Features:
 * - Platform-specific scrolling (CSS overflow for web, ScrollView for native)
 * - User profile display for logged-in users
 * - Guest mode support with appropriate UI adjustments
 * - Comprehensive settings options with modern UI design
 * - Smooth scrolling on all platforms
 * 
 * @author Karma Community Team
 * @version 2.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { biDiTextAlign, rowDirection, getScreenInfo, scaleSize } from '../globals/responsive';
import { FontSizes } from '../globals/constants';
import { useUser } from '../stores/userStore';
import GuestModeNotice from '../components/GuestModeNotice';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTranslation } from 'react-i18next';
import i18n from '../app/i18n';
import { I18nManager, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, isGuestMode, selectedUser, isAuthenticated } = useUser();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation(['settings','common']);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'he');
  const [showLangModal, setShowLangModal] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // console removed
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Listen for authentication state changes
  useEffect(() => {
    // console removed
    
    // If user is no longer authenticated, go to login screen
    if (!isAuthenticated && !isGuestMode) {
      // console removed
      navigation.navigate('LoginScreen' as never);
    }
  }, [isAuthenticated, isGuestMode, selectedUser, navigation]);

  // Debug logs for development
  // console removed
  // console removed
  // console removed

  const handleBackPress = () => {
    // console removed
    navigation.goBack();
  };

  const handleAboutPress = () => {
    // console removed
    navigation.navigate('AboutKarmaCommunityScreen' as never);
  };

    /**
   * מטפל בלחיצה על כפתור היציאה
   * לוגיקה שונה למצב אורח ולמשתמש מחובר:
   * - מצב אורח: יציאה ישירה ללא התראה (רק חזרה למסך הכניסה)
   * - משתמש מחובר: הצגת התראה לפני היציאה (פעולה מסוכנת)
   */
  const handleLogoutPress = () => {
    // console removed
    // console removed
    // console removed
    
    // Guest mode - direct logout without warning as it's not dangerous
    if (isGuestMode) {
      // console removed
      signOut().then(() => {
        // console removed
        setTimeout(() => {
          // console removed
          navigation.navigate('LoginScreen' as never);
        }, 100);
      });
      return;
    }
    
    // Authenticated user - show warning as this is a dangerous action
    if (Platform.OS === 'web') {
      // Use browser confirmation dialog for web
      // console removed
      const confirmed = window.confirm(t('settings:logoutMessage'));
      // console removed
      
      if (confirmed) {
        // console removed
        // console removed via browser');
        signOut().then(() => {
          // console removed completed via browser');
          
          // Wait a bit to ensure state is updated
          setTimeout(() => {
            // console removed
            navigation.navigate('LoginScreen' as never);
            // console removed
          }, 100);
        });
      } else {
        // console removed
      }
    } else {
      // Use React Native Alert for mobile platforms
      // console removed
      try {
        Alert.alert(
          t('settings:logoutTitle'),
          t('settings:logoutMessage'),
          [
            {
              text: t('common:cancel'),
              style: 'cancel',
              onPress: () => {
                // console removed
              },
            },
            {
              text: t('settings:logoutConfirm'),
              style: 'destructive',
              onPress: async () => {
                // console removed
                // console removed');
                await signOut();
                // console removed completed');
                
                // Short delay to ensure state is updated before navigation
                setTimeout(() => {
                  // console removed
                  navigation.navigate('LoginScreen' as never);
                  // console removed
                }, 100);
              },
            },
          ]
        );
        // console removed
      } catch (error) {
        console.error('⚙️ SettingsScreen - Error showing alert:', error);
      }
    }
    
    // console removed
  };

  const handleNotificationsPress = () => {
    // console removed
    if (Platform.OS === 'web') {
      alert(t('settings:notificationsComingSoon'));
    } else {
      Alert.alert(t('settings:notificationsTitle'), t('settings:notificationsComingSoon'));
    }
  };

  const handlePrivacyPress = () => {
    // console removed
    if (Platform.OS === 'web') {
      alert(t('settings:privacyComingSoon'));
    } else {
      Alert.alert(t('settings:privacyTitle'), t('settings:privacyComingSoon'));
    }
  };

  const handleThemePress = () => {
    // console removed
    if (Platform.OS === 'web') {
      alert(t('settings:themeComingSoon'));
    } else {
      Alert.alert(t('settings:themeTitle'), t('settings:themeComingSoon'));
    }
  };

  const applyLanguage = async (lang: 'he' | 'en') => {
    await AsyncStorage.setItem('app_language', lang);
    await i18n.changeLanguage(lang);
    setCurrentLang(lang);
    const isRTL = lang === 'he';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      if (Platform.OS !== 'web') {
        Alert.alert(t('settings:restartRequired'), t('settings:restartDesc'));
      }
    }
    setShowLangModal(false);
  };

  const handleLanguagePress = () => {
    setShowLangModal(true);
  };

  const handleClearCachePress = () => {
    // console removed
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('settings:clearCacheConfirm'));
      if (confirmed) {
        // console removed
        alert(t('settings:cacheCleared'));
      }
    } else {
      Alert.alert(
        t('settings:clearCache'),
        t('settings:clearCacheConfirm'),
        [
          {
            text: t('common:cancel'),
            style: 'cancel',
          },
          {
            text: t('settings:clear'),
            style: 'destructive',
            onPress: () => {
              // console removed
              Alert.alert(t('common:done'), t('settings:cacheCleared'));
            },
          },
        ]
      );
    }
  };

  // Test function for scroll functionality (development only)
  const handleScrollTest = () => {
    // console removed
    if (scrollViewRef.current) {
      // console removed
      scrollViewRef.current.scrollTo({ y: 200, animated: true });
      setTimeout(() => {
        // console removed
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 2000);
    } else {
      // console removed
    }
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    color = colors.textPrimary,
    dangerous = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    color?: string;
    dangerous?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsItem, dangerous && styles.dangerousItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, dangerous && styles.dangerousIconContainer]}>
          <Ionicons 
            name={icon as any} 
            size={22} 
            color={dangerous ? colors.error : colors.primary} 
          />
              </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsTitle, { color: dangerous ? colors.error : color }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
          </View>
      {showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('settings:selectLanguage')}</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => applyLanguage('he')}>
              <Text style={styles.modalOptionText}>{`${t('settings:lang.he')} ${currentLang === 'he' ? '✓' : ''}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => applyLanguage('en')}>
              <Text style={styles.modalOptionText}>{`${t('settings:lang.en')} ${currentLang === 'en' ? '✓' : ''}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, { marginTop: 8 }]} onPress={() => setShowLangModal(false)}>
              <Text style={[styles.modalOptionText, { color: colors.textSecondary }]}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Info Section - Only for logged in users */}
      {!isGuestMode && selectedUser && (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{selectedUser.name}</Text>
            <Text style={styles.userEmail}>{selectedUser.email}</Text>
            <Text style={styles.karmaPoints}>
              {selectedUser.karmaPoints.toLocaleString()} {t('profile:stats.karmaPointsSuffix')}
            </Text>
          </View>
        </View>
      )}

      {/* Guest Mode Notice */}
      {isGuestMode && <GuestModeNotice variant="compact" />}

      {/* Settings List - Platform-specific scroll implementation */}
      {Platform.OS === 'web' ? (
        // Web: Custom scrollable View with CSS overflow
        <View style={styles.webScrollContainer}>
          <View style={styles.webScrollContent}>
            {/* App Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings:appSettings')}</Text>
              
              <SettingsItem
                icon="notifications-outline"
                title={t('settings:notifications')}
                subtitle={t('settings:notificationsDesc')}
                onPress={handleNotificationsPress}
              />
              
              <SettingsItem
                icon="color-palette-outline"
                title={t('settings:theme')}
                subtitle={t('settings:themeDesc')}
                onPress={handleThemePress}
              />
              
              <SettingsItem
                icon="language-outline"
                title={t('settings:language')}
                subtitle={currentLang === 'he' ? t('settings:lang.he') : t('settings:lang.en')}
                onPress={handleLanguagePress}
              />
            </View>

            {/* Privacy & Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings:privacySection')}</Text>
              
              <SettingsItem
                icon="shield-outline"
                title={t('settings:privacy')}
                subtitle={t('settings:privacyDesc')}
                onPress={handlePrivacyPress}
              />
              
              <SettingsItem
                icon="trash-outline"
                title={t('settings:clearCache')}
                subtitle={t('settings:clearCacheDesc')}
                onPress={handleClearCachePress}
              />
              
              <SettingsItem
                icon="flask-outline"
                title={t('settings:scrollTestTitle')}
                subtitle={t('settings:scrollTestSubtitle')}
                onPress={handleScrollTest}
              />
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings:aboutSection')}</Text>
              
              <SettingsItem
                icon="information-circle-outline"
                title={t('settings:about')}
                subtitle={t('settings:aboutDesc')}
                onPress={handleAboutPress}
              />
            </View>

            {/* Logout Section - different behavior for guest mode and authenticated user */}
            <View style={styles.section}>
              <SettingsItem
                icon={isGuestMode ? "arrow-back-outline" : "log-out-outline"}
                title={isGuestMode ? t('settings:guestBack') : t('settings:logout')}
                subtitle={isGuestMode ? t('settings:guestBackDesc') : t('settings:logoutDesc')}
                onPress={handleLogoutPress}
                showArrow={false}
                dangerous={!isGuestMode} // Red only for authenticated user (dangerous action)
              />
            </View>
          </View>
        </View>
      ) : (
        // Native: Standard ScrollView for iOS/Android
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          bounces={Platform.OS === 'ios'}
          overScrollMode={Platform.OS === 'android' ? 'auto' : undefined}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            // // console removed
          }}
          onScrollBeginDrag={() => {
            // console removed
          }}
          onScrollEndDrag={() => {
            // console removed
          }}
          onMomentumScrollBegin={() => {
            // console removed
          }}
          onMomentumScrollEnd={() => {
            // console removed
          }}
          onContentSizeChange={(contentWidth, contentHeight) => {
            // console removed
            // console removed
            // console removed
          }}
          onLayout={(event) => {
            // console removed
          }}
          scrollEventThrottle={16}
        >
        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings:appSettings')}</Text>
          {/* Org Dashboard (for org admins) */}
          {selectedUser && selectedUser.roles?.includes('org_admin') && (
            <SettingsItem
              icon="briefcase-outline"
              title={t('settings:orgDashboardTitle')}
              subtitle={t('settings:orgDashboardSubtitle')}
              onPress={() => navigation.navigate('OrgDashboardScreen' as never)}
            />
          )}

          {/* Admin approvals (for admins) */}
          {selectedUser && selectedUser.roles?.includes('admin') && (
            <SettingsItem
              icon="checkmark-done-outline"
              title={t('settings:adminApprovalsTitle')}
              subtitle={t('settings:adminApprovalsSubtitle')}
              onPress={() => navigation.navigate('AdminOrgApprovalsScreen' as never)}
            />
          )}
          
          <SettingsItem
            icon="notifications-outline"
            title={t('settings:notifications')}
            subtitle={t('settings:notificationsDesc')}
            onPress={handleNotificationsPress}
          />
          
          <SettingsItem
            icon="color-palette-outline"
            title={t('settings:theme')}
            subtitle={t('settings:themeDesc')}
            onPress={handleThemePress}
          />
          
          <SettingsItem
            icon="language-outline"
            title={t('settings:language')}
            subtitle={currentLang === 'he' ? t('settings:lang.he') : t('settings:lang.en')}
            onPress={handleLanguagePress}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings:privacySection')}</Text>
          
          <SettingsItem
            icon="shield-outline"
            title={t('settings:privacy')}
            subtitle={t('settings:privacyDesc')}
            onPress={handlePrivacyPress}
          />
          
          <SettingsItem
            icon="trash-outline"
            title={t('settings:clearCache')}
            subtitle={t('settings:clearCacheDesc')}
            onPress={handleClearCachePress}
          />
          
          <SettingsItem
            icon="flask-outline"
            title={t('settings:scrollTestTitle')}
            subtitle={t('settings:scrollTestSubtitle')}
            onPress={handleScrollTest}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings:aboutSection')}</Text>
          
          <SettingsItem
            icon="information-circle-outline"
            title={t('settings:about')}
            subtitle={t('settings:aboutDesc')}
            onPress={handleAboutPress}
          />
        </View>

        {/* Logout Section - different behavior for guest mode and authenticated user */}
        <View style={styles.section}>
          <SettingsItem
            icon={isGuestMode ? "arrow-back-outline" : "log-out-outline"}
            title={isGuestMode ? t('settings:guestBack') : t('settings:logout')}
            subtitle={isGuestMode ? t('settings:guestBackDesc') : t('settings:logoutDesc')}
            onPress={handleLogoutPress}
            showArrow={false}
            dangerous={!isGuestMode} // Red only for authenticated user (dangerous action)
          />
        </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: rowDirection('row'),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: FontSizes.heading1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  userSection: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: biDiTextAlign('right'),
  },
  userEmail: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: biDiTextAlign('right'),
  },
  karmaPoints: {
    fontSize: FontSizes.body,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Web: Custom scrollable container with CSS overflow
  webScrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto' as any,
      overflowX: 'hidden' as any,
    }),
    height: '100%',
    maxHeight: SCREEN_HEIGHT - 200, // Reserve space for header
  } as any,
  webScrollContent: {
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 1.2, // Ensure content is scrollable
  },
  // Native: Standard ScrollView styles
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    marginRight: 4,
    textAlign: biDiTextAlign('right'),
  },
  settingsItem: {
    flexDirection: rowDirection('row'),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  dangerousItem: {
    backgroundColor: colors.errorLight,
  },
  settingsItemLeft: {
    flexDirection: rowDirection('row'),
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pinkLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerousIconContainer: {
    backgroundColor: colors.errorLight,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: biDiTextAlign('right'),
  },
  settingsSubtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: biDiTextAlign('right'),
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: '#fff', width: 300, borderRadius: 12, padding: 16, gap: 8 },
  modalTitle: { fontSize: FontSizes.medium, color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  modalOption: { paddingVertical: 10 },
  modalOptionText: { fontSize: FontSizes.body, color: colors.textPrimary, textAlign: 'center' },
});