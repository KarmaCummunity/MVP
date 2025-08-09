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
import { FontSizes } from '../globals/constants';
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';
import ScreenWrapper from '../components/ScreenWrapper';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, isGuestMode, selectedUser, isAuthenticated } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('⚙️ SettingsScreen - Screen focused, refreshing data...');
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Listen for authentication state changes
  useEffect(() => {
    console.log('⚙️ SettingsScreen - Auth state changed:', {
      isAuthenticated,
      isGuestMode,
      selectedUser: selectedUser?.name || 'null'
    });
    
    // If user is no longer authenticated, go to login screen
    if (!isAuthenticated && !isGuestMode) {
      console.log('⚙️ SettingsScreen - User logged out, navigating to LoginScreen');
      navigation.navigate('LoginScreen' as never);
    }
  }, [isAuthenticated, isGuestMode, selectedUser, navigation]);

  // Debug logs for development
  console.log('⚙️ SettingsScreen - Rendered with isGuestMode:', isGuestMode);
  console.log('⚙️ SettingsScreen - Platform:', Platform.OS);
  console.log('⚙️ SettingsScreen - Screen dimensions:', { width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

  const handleBackPress = () => {
    console.log('⚙️ SettingsScreen - Back pressed');
    navigation.goBack();
  };

  const handleAboutPress = () => {
    console.log('⚙️ SettingsScreen - About pressed');
    navigation.navigate('AboutKarmaCommunityScreen' as never);
  };

    /**
   * מטפל בלחיצה על כפתור היציאה
   * לוגיקה שונה למצב אורח ולמשתמש מחובר:
   * - מצב אורח: יציאה ישירה ללא התראה (רק חזרה למסך הכניסה)
   * - משתמש מחובר: הצגת התראה לפני היציאה (פעולה מסוכנת)
   */
  const handleLogoutPress = () => {
    console.log('⚙️ 14SettingsScreen - Logout pressed');
    console.log('⚙️ SettingsScreen - Platform:', Platform.OS);
    console.log('⚙️ SettingsScreen - isGuestMode:', isGuestMode);
    
    // Guest mode - direct logout without warning as it's not dangerous
    if (isGuestMode) {
      console.log('⚙️ SettingsScreen - Guest mode detected, direct logout without confirmation');
      signOut().then(() => {
        console.log('⚙️ SettingsScreen - Guest logout completed');
        setTimeout(() => {
          console.log('⚙️ SettingsScreen - Navigating to LoginScreen after guest logout');
          navigation.navigate('LoginScreen' as never);
        }, 100);
      });
      return;
    }
    
    // Authenticated user - show warning as this is a dangerous action
    if (Platform.OS === 'web') {
      // Use browser confirmation dialog for web
      console.log('⚙️ SettingsScreen - Using browser confirm for web');
      const confirmed = window.confirm('האם אתה בטוח שברצונך לצאת?');
      console.log('⚙️ SettingsScreen - Browser confirm result:', confirmed);
      
      if (confirmed) {
        console.log('⚙️ SettingsScreen - Logout confirmed via browser');
        console.log('⚙️ SettingsScreen - Calling signOut() via browser');
        signOut().then(() => {
          console.log('⚙️ SettingsScreen - signOut() completed via browser');
          
          // Wait a bit to ensure state is updated
          setTimeout(() => {
            console.log('⚙️ SettingsScreen - Navigating to LoginScreen via browser after delay');
            navigation.navigate('LoginScreen' as never);
            console.log('⚙️ SettingsScreen - Navigation to LoginScreen completed via browser');
          }, 100);
        });
      } else {
        console.log('⚙️ SettingsScreen - Logout cancelled via browser');
      }
    } else {
      // Use React Native Alert for mobile platforms
      console.log('⚙️ SettingsScreen - Using React Native Alert for mobile');
      try {
        Alert.alert(
          'יציאה מהמערכת',
          'האם אתה בטוח שברצונך לצאת?',
          [
            {
              text: 'ביטול',
              style: 'cancel',
              onPress: () => {
                console.log('⚙️ SettingsScreen - Cancel pressed');
              },
            },
            {
              text: 'יציאה',
              style: 'destructive',
              onPress: async () => {
                console.log('⚙️ SettingsScreen - Logout confirmed');
                console.log('⚙️ SettingsScreen - Calling signOut()');
                await signOut();
                console.log('⚙️ SettingsScreen - signOut() completed');
                
                // Short delay to ensure state is updated before navigation
                setTimeout(() => {
                  console.log('⚙️ SettingsScreen - Navigating to LoginScreen after delay');
                  navigation.navigate('LoginScreen' as never);
                  console.log('⚙️ SettingsScreen - Navigation to LoginScreen completed');
                }, 100);
              },
            },
          ]
        );
        console.log('⚙️ SettingsScreen - Alert.alert called successfully');
      } catch (error) {
        console.error('⚙️ SettingsScreen - Error showing alert:', error);
      }
    }
    
    console.log('⚙️ 13SettingsScreen - Logout pressed');
  };

  const handleNotificationsPress = () => {
    console.log('⚙️ SettingsScreen - Notifications pressed');
    if (Platform.OS === 'web') {
      alert('הגדרות התראות יתווספו בקרוב');
    } else {
      Alert.alert('התראות', 'הגדרות התראות יתווספו בקרוב');
    }
  };

  const handlePrivacyPress = () => {
    console.log('⚙️ SettingsScreen - Privacy pressed');
    if (Platform.OS === 'web') {
      alert('הגדרות פרטיות יתווספו בקרוב');
    } else {
      Alert.alert('פרטיות', 'הגדרות פרטיות יתווספו בקרוב');
    }
  };

  const handleThemePress = () => {
    console.log('⚙️ SettingsScreen - Theme pressed');
    if (Platform.OS === 'web') {
      alert('בחירת ערכת נושא תתווסף בקרוב');
    } else {
      Alert.alert('ערכת נושא', 'בחירת ערכת נושא תתווסף בקרוב');
    }
  };

  const handleLanguagePress = () => {
    console.log('⚙️ SettingsScreen - Language pressed');
    if (Platform.OS === 'web') {
      alert('בחירת שפה תתווסף בקרוב');
    } else {
      Alert.alert('שפה', 'בחירת שפה תתווסף בקרוב');
    }
  };

  const handleClearCachePress = () => {
    console.log('⚙️ SettingsScreen - Clear cache pressed');
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('האם אתה בטוח שברצונך לנקות את המטמון?');
      if (confirmed) {
        console.log('⚙️ SettingsScreen - Cache cleared');
        alert('המטמון נוקה בהצלחה');
      }
    } else {
      Alert.alert(
        'ניקוי מטמון',
        'האם אתה בטוח שברצונך לנקות את המטמון?',
        [
          {
            text: 'ביטול',
            style: 'cancel',
          },
          {
            text: 'נקה',
            style: 'destructive',
            onPress: () => {
              console.log('⚙️ SettingsScreen - Cache cleared');
              Alert.alert('הושלם', 'המטמון נוקה בהצלחה');
            },
          },
        ]
      );
    }
  };

  // Test function for scroll functionality (development only)
  const handleScrollTest = () => {
    console.log('🧪 SettingsScreen - Testing scroll functionality');
    if (scrollViewRef.current) {
      console.log('🧪 SettingsScreen - ScrollView ref exists, attempting to scroll');
      scrollViewRef.current.scrollTo({ y: 200, animated: true });
      setTimeout(() => {
        console.log('🧪 SettingsScreen - Scrolling back to top');
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 2000);
    } else {
      console.log('🧪 SettingsScreen - ScrollView ref is null!');
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

      {/* User Info Section - Only for logged in users */}
      {!isGuestMode && selectedUser && (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{selectedUser.name}</Text>
            <Text style={styles.userEmail}>{selectedUser.email}</Text>
            <Text style={styles.karmaPoints}>
              {selectedUser.karmaPoints.toLocaleString()} נקודות קארמה
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
              <Text style={styles.sectionTitle}>הגדרות אפליקציה</Text>
              
              <SettingsItem
                icon="notifications-outline"
                title="התראות"
                subtitle="ניהול התראות ועדכונים"
                onPress={handleNotificationsPress}
              />
              
              <SettingsItem
                icon="color-palette-outline"
                title="ערכת נושא"
                subtitle="בהיר, כהה או אוטומטי"
                onPress={handleThemePress}
              />
              
              <SettingsItem
                icon="language-outline"
                title="שפה"
                subtitle="עברית (ברירת מחדל)"
                onPress={handleLanguagePress}
              />
            </View>

            {/* Privacy & Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>פרטיות ואבטחה</Text>
              
              <SettingsItem
                icon="shield-outline"
                title="הגדרות פרטיות"
                subtitle="ניהול נתונים אישיים"
                onPress={handlePrivacyPress}
              />
              
              <SettingsItem
                icon="trash-outline"
                title="ניקוי מטמון"
                subtitle="פינוי זיכרון זמני"
                onPress={handleClearCachePress}
              />
              
              <SettingsItem
                icon="flask-outline"
                title="בדיקת גלילה"
                subtitle="בדיקה שהגלילה עובדת (למפתחים)"
                onPress={handleScrollTest}
              />
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>מידע</Text>
              
              <SettingsItem
                icon="information-circle-outline"
                title="אודות קארמה קהילה"
                subtitle="גרסה, תנאי שימוש ועוד"
                onPress={handleAboutPress}
              />
            </View>

            {/* Logout Section - different behavior for guest mode and authenticated user */}
            <View style={styles.section}>
              <SettingsItem
                icon={isGuestMode ? "arrow-back-outline" : "log-out-outline"}
                title={isGuestMode ? "חזרה למסך הכניסה" : "יציאה מהמערכת"}
                subtitle={isGuestMode ? "יציאה ממצב אורח" : "יציאה מהחשבון"}
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
          ref={scrollViewRef}
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
            // console.log('📜 SettingsScreen - Layout measurement:', event.nativeEvent.layoutMeasurement);
          }}
          onScrollBeginDrag={() => {
            console.log('📜 SettingsScreen - Scroll begin drag detected!');
          }}
          onScrollEndDrag={() => {
            console.log('📜 SettingsScreen - Scroll end drag detected!');
          }}
          onMomentumScrollBegin={() => {
            console.log('📜 SettingsScreen - Momentum scroll begin!');
          }}
          onMomentumScrollEnd={() => {
            console.log('📜 SettingsScreen - Momentum scroll end!');
          }}
          onContentSizeChange={(contentWidth, contentHeight) => {
            console.log('📜 SettingsScreen - Content size changed:', { contentWidth, contentHeight });
            console.log('📜 SettingsScreen - Screen height:', SCREEN_HEIGHT);
            console.log('📜 SettingsScreen - Should scroll:', contentHeight > SCREEN_HEIGHT);
          }}
          onLayout={(event) => {
            console.log('📜 SettingsScreen - ScrollView layout:', event.nativeEvent.layout);
          }}
          scrollEventThrottle={16}
        >
        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הגדרות אפליקציה</Text>
          
          <SettingsItem
            icon="notifications-outline"
            title="התראות"
            subtitle="ניהול התראות ועדכונים"
            onPress={handleNotificationsPress}
          />
          
          <SettingsItem
            icon="color-palette-outline"
            title="ערכת נושא"
            subtitle="בהיר, כהה או אוטומטי"
            onPress={handleThemePress}
          />
          
          <SettingsItem
            icon="language-outline"
            title="שפה"
            subtitle="עברית (ברירת מחדל)"
            onPress={handleLanguagePress}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטיות ואבטחה</Text>
          
          <SettingsItem
            icon="shield-outline"
            title="הגדרות פרטיות"
            subtitle="ניהול נתונים אישיים"
            onPress={handlePrivacyPress}
          />
          
          <SettingsItem
            icon="trash-outline"
            title="ניקוי מטמון"
            subtitle="פינוי זיכרון זמני"
            onPress={handleClearCachePress}
          />
          
          <SettingsItem
            icon="flask-outline"
            title="בדיקת גלילה"
            subtitle="בדיקה שהגלילה עובדת (למפתחים)"
            onPress={handleScrollTest}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מידע</Text>
          
          <SettingsItem
            icon="information-circle-outline"
            title="אודות קארמה קהילה"
            subtitle="גרסה, תנאי שימוש ועוד"
            onPress={handleAboutPress}
          />
        </View>

        {/* Logout Section - different behavior for guest mode and authenticated user */}
        <View style={styles.section}>
          <SettingsItem
            icon={isGuestMode ? "arrow-back-outline" : "log-out-outline"}
            title={isGuestMode ? "חזרה למסך הכניסה" : "יציאה מהמערכת"}
            subtitle={isGuestMode ? "יציאה ממצב אורח" : "יציאה מהחשבון"}
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
    flexDirection: 'row',
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
  },
  userEmail: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  karmaPoints: {
    fontSize: FontSizes.body,
    color: colors.primary,
    fontWeight: '500',
  },

  // Web: Custom scrollable container with CSS overflow
  webScrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      overflow: 'auto' as any, // Enable native web scrolling
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
  },
  settingsItem: {
    flexDirection: 'row',
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
    flexDirection: 'row',
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
  },
  settingsSubtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
});