// SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Linking, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SettingsItem, { SettingsItemProps } from '../components/SettingsItem';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import LanguageSelector from '../components/LanguageSelector';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  // State for toggle settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.clearCacheConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.clear'), onPress: () => Alert.alert(t('settings.cacheCleared'), t('settings.cacheClearedSuccess')) }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation will be handled automatically by auth state change
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.logoutError'));
            }
          }
        }
      ]
    );
  };

  const navigateTo = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert(t('common.error'), t('settings.linkError')));
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Define your settings data as an array of objects
  const settingsData: (SettingsItemProps | { type: 'sectionHeader', title?: string })[] = [
    { type: 'sectionHeader', title: t('settings.accountSection') },
    {
      title: t('settings.editProfile'),
      iconName: 'person-outline',
      type: 'navigate',
      onPress: () => navigateTo('EditProfileScreen'),
    },
    {
      title: t('settings.privacy'),
      iconName: 'lock-closed-outline',
      type: 'navigate',
      onPress: () => navigateTo('PrivacySettingsScreen'),
    },
    {
      title: t('settings.privacyVisibility'),
      iconName: 'eye-off-outline',
      type: 'toggle',
      value: hideOnlineStatus,
      onValueChange: setHideOnlineStatus,
    },
    { type: 'sectionHeader', title: t('settings.notifications') },
    {
      title: t('settings.notificationsPush'),
      iconName: 'notifications-outline',
      type: 'toggle',
      value: pushNotificationsEnabled,
      onValueChange: setPushNotificationsEnabled,
    },
    {
      title: t('settings.notificationsEmail'),
      iconName: 'mail-outline',
      type: 'toggle',
      value: emailNotificationsEnabled,
      onValueChange: setEmailNotificationsEnabled,
    },
    { type: 'sectionHeader', title: t('settings.appPreferences') },
    {
      title: t('settings.language'),
      iconName: 'language-outline',
      type: 'value',
      displayValue: i18n.language,
      onPress: () => setIsLanguageModalVisible(true),
    },
    {
      title: t('settings.darkMode'),
      iconName: 'moon-outline',
      type: 'toggle',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      title: t('settings.dataSaver'),
      iconName: 'cellular-outline',
      type: 'toggle',
      value: dataSaverMode,
      onValueChange: setDataSaverMode,
    },
    {
      title: t('settings.clearCache'),
      iconName: 'trash-outline',
      type: 'button',
      onPress: handleClearCache,
    },
    { type: 'sectionHeader', title: t('settings.helpSupport') },
    {
      title: t('settings.helpCenter'),
      iconName: 'help-circle-outline',
      type: 'navigate',
      onPress: () => openLink('https://help.karmacommunity.com'),
    },
    {
      title: t('settings.about'),
      iconName: 'information-circle-outline',
      type: 'navigate',
      onPress: () => navigateTo('AboutScreen'),
    },
    { type: 'sectionHeader' },
    {
      title: t('settings.logout'),
      iconName: 'log-out-outline',
      type: 'button',
      onPress: handleLogout,
      isDestructive: true,
    }
  ];

  const renderSettingItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'sectionHeader') {
      return item.title ? (
        <Text style={[styles.sectionHeader, { textAlign: 'right' }]}>{item.title}</Text>
      ) : (
        <View style={styles.sectionSpacer} />
      );
    }
    return <SettingsItem {...item} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <FlatList
        data={settingsData}
        renderItem={renderSettingItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      
      <LanguageSelector
        isVisible={isLanguageModalVisible}
        onClose={() => setIsLanguageModalVisible(false)}
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
  headerTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    marginTop: 8,
  },
  sectionSpacer: {
    height: 20,
  },
});
