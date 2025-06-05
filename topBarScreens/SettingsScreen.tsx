// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, Linking, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import SettingsItem from '../components/SettingsItem';
import Colors from '../globals/Colors'; // Adjust path
import Icon from 'react-native-vector-icons/Ionicons'; // For header back button

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // State for toggle settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);

  // State for value-display settings
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // In a real app, use a global state/context

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app's cache? This will free up storage space.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: () => Alert.alert("Cache Cleared", "App cache has been cleared.") }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", onPress: () => Alert.alert("Logged Out", "You have been logged out.") }
        // In a real app, dispatch a logout action, clear token, navigate to login screen
      ]
    );
  };

  const navigateTo = (screenName: string, params?: any) => {
    // In a real app, you'd navigate to specific screens
    // For this example, we'll just show an alert or navigate to dummy screens if they exist
    Alert.alert("Navigate To", `Navigating to ${screenName}`);
    // Example: navigation.navigate(screenName, params);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert("Error", `Could not open URL: ${err.message}`));
  };

  // Define your settings data as an array of objects
  const settingsData = [
    { type: 'sectionHeader', title: 'חשבון' },
    {
      id: 'edit_profile',
      title: 'עריכת פרופיל',
      iconName: 'person-outline',
      type: 'navigate',
      onPress: () => navigateTo('EditProfileScreen'),
    },
    {
      id: 'change_password',
      title: 'שינוי סיסמה',
      iconName: 'key-outline',
      type: 'navigate',
      onPress: () => navigateTo('ChangePasswordScreen'),
    },
    {
      id: 'privacy',
      title: 'פרטיות',
      description: 'שלוט במי יכול לראות את הפעילות שלך',
      iconName: 'lock-closed-outline',
      type: 'navigate',
      onPress: () => navigateTo('PrivacySettingsScreen'),
    },
    {
      id: 'security',
      title: 'אבטחה',
      description: 'אימות דו-שלבי, פעילות התחברות',
      iconName: 'shield-checkmark-outline',
      type: 'navigate',
      onPress: () => navigateTo('SecuritySettingsScreen'),
    },
    {
      id: 'hide_online_status',
      title: 'הסתרת סטטוס מקוון',
      iconName: 'eye-off-outline',
      type: 'toggle',
      value: hideOnlineStatus,
      onValueChange: setHideOnlineStatus,
    },
    { type: 'sectionHeader', title: 'הודעות' },
    {
      id: 'push_notifications',
      title: 'התראות Push',
      description: 'התראות על הודעות, לייקים, תגובות ועוד',
      iconName: 'notifications-outline',
      type: 'toggle',
      value: pushNotificationsEnabled,
      onValueChange: setPushNotificationsEnabled,
    },
    {
      id: 'email_notifications',
      title: 'התראות דוא"ל',
      iconName: 'mail-outline',
      type: 'toggle',
      value: emailNotificationsEnabled,
      onValueChange: setEmailNotificationsEnabled,
    },
    { type: 'sectionHeader', title: 'העדפות אפליקציה' },
    {
      id: 'language',
      title: 'שפה',
      iconName: 'language-outline',
      type: 'value',
      displayValue: selectedLanguage,
      onPress: () => Alert.alert("בחירת שפה", "ממשק לבחירת שפה"), // In a real app, open a modal/picker
    },
    {
      id: 'dark_mode',
      title: 'מצב כהה',
      iconName: 'moon-outline',
      type: 'toggle',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      id: 'data_saver',
      title: 'מצב חיסכון בנתונים',
      description: 'הפחתת איכות תמונה/וידאו',
      iconName: 'cellular-outline',
      type: 'toggle',
      value: dataSaverMode,
      onValueChange: setDataSaverMode,
    },
    {
      id: 'autoplay_videos',
      title: 'הפעלת וידאו אוטומטית',
      iconName: 'play-circle-outline',
      type: 'toggle',
      value: autoplayVideos,
      onValueChange: setAutoplayVideos,
    },
    {
      id: 'clear_cache',
      title: 'ניקוי זיכרון מטמון',
      iconName: 'trash-outline',
      type: 'button',
      onPress: handleClearCache,
    },
    { type: 'sectionHeader', title: 'עזרה ותמיכה' },
    {
      id: 'help_center',
      title: 'מרכז העזרה',
      iconName: 'help-circle-outline',
      type: 'navigate',
      onPress: () => openLink('https://help.instagram.com/'), // Example link
    },
    {
      id: 'report_problem',
      title: 'דווח על בעיה',
      iconName: 'bug-outline',
      type: 'navigate',
      onPress: () => navigateTo('ReportProblemScreen'),
    },
    {
      id: 'contact_us',
      title: 'צור קשר',
      iconName: 'call-outline',
      type: 'navigate',
      onPress: () => navigateTo('ContactUsScreen'),
    },
    {
      id: 'privacy_policy',
      title: 'מדיניות פרטיות',
      iconName: 'document-text-outline',
      type: 'navigate',
      onPress: () => openLink('https://help.instagram.com/519522125107875'), // Example link
    },
    {
      id: 'terms_of_service',
      title: 'תנאי שירות',
      iconName: 'reader-outline',
      type: 'navigate',
      onPress: () => openLink('https://help.instagram.com/581066165568187'), // Example link
    },
    { type: 'sectionHeader', title: 'אודות' },
    {
      id: 'app_version',
      title: 'גרסת אפליקציה',
      iconName: 'information-circle-outline',
      type: 'value',
      displayValue: '1.0.0 (Build 123)',
    },
    { type: 'sectionHeader', title: '' }, // Empty section for spacing before logout
    {
      id: 'logout',
      title: 'התנתק',
      iconName: 'log-out-outline',
      type: 'button',
      onPress: handleLogout,
      isDestructive: true,
    },
    {
      id: 'delete_account',
      title: 'מחק חשבון',
      iconName: 'trash-bin-outline',
      type: 'button',
      onPress: () => Alert.alert("מחק חשבון", "האם אתה בטוח שברצונך למחוק את חשבונך?"),
      isDestructive: true,
    },
  ];

  const renderSettingItem = ({ item }: { item: any }) => {
    if (item.type === 'sectionHeader') {
      return item.title ? <Text style={styles.sectionHeader}>{item.title}</Text> : <View style={styles.sectionSpacer} />;
    }
    return <SettingsItem {...item} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הגדרות</Text>
        <View style={styles.headerButton} /> {/* Placeholder for consistent spacing */}
      </View>
      <FlatList
        data={settingsData}
        keyExtractor={(item, index) => item.id || `section-${item.title || index}`}
        renderItem={renderSettingItem}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'stretch',
    writingDirection: 'rtl',
    backgroundColor: Colors.backgroundPrimary,
    marginTop: Platform.OS === 'android' ? 30 : 0, // Adjust for Android status bar
    marginBottom: Platform.OS === 'android' ? 40 : 0, // Adjust for Android status bar
  },
  header: {
    flexDirection: 'row-reverse', // For RTL layout
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerButton: {
    width: 24, // To keep consistent spacing with the icon
  },
  listContentContainer: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 18,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundPrimary, // Section background color
    marginTop: 10,
    marginBottom: 5,
  },
  sectionSpacer: {
    height: 200, // Space for empty section headers
    backgroundColor: Colors.backgroundPrimary,
  }
});