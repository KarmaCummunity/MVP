// SettingsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Linking, Platform, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SettingsItem, { SettingsItemProps } from '../components/SettingsItem';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { signOut } = useUser();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State for toggle settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClearCache = () => {
    Alert.alert(
      t('settings_clearCache'),
      t('settings_clearCacheConfirm'),
      [
        { text: t('common_cancel'), style: 'cancel' },
        { text: t('common_clear'), onPress: () => Alert.alert(t('settings_cacheCleared'), t('settings_cacheClearedSuccess')) }
      ]
    );
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t('settings_logoutConfirm'));
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert(
        t('settings_logout'),
        t('settings_logoutConfirm'),
        [
          { text: t('common_cancel'), style: 'cancel' },
          { 
            text: t('settings_logout'), 
            onPress: performLogout
          }
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      await signOut();
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateTo = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert(t('common_error'), t('settings_linkError')));
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Define your settings data as an array of objects
  const settingsData: (SettingsItemProps | { type: 'sectionHeader', title?: string, icon?: string, color?: string })[] = [
    { 
      type: 'sectionHeader', 
      title: t('settings_accountSection'),
      icon: 'person-circle-outline',
      color: colors.pink
    },
    {
      title: t('settings_editProfile'),
      iconName: 'person-outline',
      type: 'navigate',
      onPress: () => navigateTo('EditProfileScreen'),
    },
    {
      title: t('settings_privacy'),
      iconName: 'shield-checkmark-outline',
      type: 'navigate',
      onPress: () => navigateTo('PrivacySettingsScreen'),
    },
    {
      title: t('settings_privacyVisibility'),
      iconName: 'eye-off-outline',
      type: 'toggle',
      value: hideOnlineStatus,
      onValueChange: setHideOnlineStatus,
    },
    { 
      type: 'sectionHeader', 
      title: t('settings_notifications'),
      icon: 'notifications-circle-outline',
      color: colors.orange
    },
    {
      title: t('settings_notificationsPush'),
      iconName: 'notifications-outline',
      type: 'toggle',
      value: pushNotificationsEnabled,
      onValueChange: setPushNotificationsEnabled,
    },
    {
      title: t('settings_notificationsEmail'),
      iconName: 'mail-outline',
      type: 'toggle',
      value: emailNotificationsEnabled,
      onValueChange: setEmailNotificationsEnabled,
    },
    { 
      type: 'sectionHeader', 
      title: t('settings_appPreferences'),
      icon: 'settings-outline',
      color: colors.blue
    },
    {
      title: t('settings_darkMode'),
      iconName: 'moon-outline',
      type: 'toggle',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      title: t('settings_dataSaver'),
      iconName: 'cellular-outline',
      type: 'toggle',
      value: dataSaverMode,
      onValueChange: setDataSaverMode,
    },
    {
      title: t('settings_clearCache'),
      iconName: 'trash-outline',
      type: 'button',
      onPress: handleClearCache,
    },
    { 
      type: 'sectionHeader', 
      title: t('settings_helpSupport'),
      icon: 'help-circle-outline',
      color: colors.success
    },
    {
      title: t('settings_helpCenter'),
      iconName: 'help-circle-outline',
      type: 'navigate',
      onPress: () => openLink('https://help.karmacommunity.com'),
    },
    {
      title: t('settings_about'),
      iconName: 'information-circle-outline',
      type: 'navigate',
      onPress: () => navigateTo('AboutScreen'),
    },
    { type: 'sectionHeader' },
    {
      title: t('settings_logout'),
      iconName: 'log-out-outline',
      type: 'button',
      onPress: handleLogout,
      isDestructive: true,
    }
  ];
  
  console.log('🔄 settingsData created with', settingsData.length, 'items');

  const renderSettingItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'sectionHeader') {
      return item.title ? (
        <Animated.View 
          style={[
            styles.sectionHeaderContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeaderContent}>
            {item.icon && (
              <View style={[styles.sectionIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
            )}
            <Text style={[styles.sectionHeader, { textAlign: 'right' }]}>{item.title}</Text>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.sectionSpacer} />
      );
    }
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <SettingsItem {...item} />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Modern Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('settings_title')}</Text>
          <Text style={styles.headerSubtitle}>הגדרות האפליקציה</Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>
      
      <FlatList
        data={settingsData}
        renderItem={renderSettingItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    marginTop: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionHeader: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionSpacer: {
    height: 20,
  },
});
