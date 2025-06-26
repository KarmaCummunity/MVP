// SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Linking, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import SettingsItem, { SettingsItemProps } from '../components/SettingsItem';
import colors from '../globals/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { setupRTL } from '../utils/RTLConfig';

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
  const [selectedLanguage, setSelectedLanguage] = useState('עברית');

  const handleClearCache = () => {

    Alert.alert(
      "ניקוי זיכרון מטמון",
      "האם אתה בטוח שברצונך לנקות את זיכרון המטמון של האפליקציה? פעולה זו תפנה שטח אחסון.",
      [
        { text: "ביטול", style: "cancel" },
        { text: "נקה", onPress: () => Alert.alert("זיכרון מטמון נוקה", "זיכרון המטמון של האפליקציה נוקה בהצלחה.") }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "התנתקות",
      "האם אתה בטוח שברצונך להתנתק?",
      [
        { text: "ביטול", style: "cancel" },
        { text: "התנתק", onPress: () => Alert.alert("התנתקת", "התנתקת בהצלחה.") }
      ]
    );
  };

  const navigateTo = (screenName: string, params?: any) => {
    Alert.alert("מעבר למסך", `מנווט למסך: ${screenName}`);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => Alert.alert("שגיאה", `לא ניתן לפתוח את הקישור: ${err.message}`));
  };

  // Define your settings data as an array of objects
  const settingsData: (SettingsItemProps | { type: 'sectionHeader', title?: string })[] = [
    { type: 'sectionHeader', title: 'חשבון' },
    {
      title: 'עריכת פרופיל',
      iconName: 'person-outline',
      type: 'navigate',
      onPress: () => navigateTo('EditProfileScreen'),
    },
    {
      title: 'שינוי סיסמה',
      iconName: 'key-outline',
      type: 'navigate',
      onPress: () => navigateTo('ChangePasswordScreen'),
    },
    {
      title: 'פרטיות',
      description: 'שלוט במי יכול לראות את הפעילות שלך',
      iconName: 'lock-closed-outline',
      type: 'navigate',
      onPress: () => navigateTo('PrivacySettingsScreen'),
    },
    {
      title: 'אבטחה',
      description: 'אימות דו-שלבי, פעילות התחברות',
      iconName: 'shield-checkmark-outline',
      type: 'navigate',
      onPress: () => navigateTo('SecuritySettingsScreen'),
    },
    {
      title: 'הסתרת סטטוס מקוון',
      iconName: 'eye-off-outline',
      type: 'toggle',
      value: hideOnlineStatus,
      onValueChange: setHideOnlineStatus,
    },
    { type: 'sectionHeader', title: 'הודעות' },
    {
      title: 'התראות Push',
      description: 'התראות על הודעות, לייקים, תגובות ועוד',
      iconName: 'notifications-outline',
      type: 'toggle',
      value: pushNotificationsEnabled,
      onValueChange: setPushNotificationsEnabled,
    },
    {
      title: 'התראות דוא"ל',
      iconName: 'mail-outline',
      type: 'toggle',
      value: emailNotificationsEnabled,
      onValueChange: setEmailNotificationsEnabled,
    },
    { type: 'sectionHeader', title: 'העדפות אפליקציה' },
    {
      title: 'שפה',
      iconName: 'language-outline',
      type: 'value',
      displayValue: selectedLanguage,
      onPress: () => Alert.alert("בחירת שפה", "ממשק לבחירת שפה"),
    },
    {
      title: 'מצב כהה',
      iconName: 'moon-outline',
      type: 'toggle',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      title: 'מצב חיסכון בנתונים',
      description: 'הפחתת איכות תמונה/וידאו',
      iconName: 'cellular-outline',
      type: 'toggle',
      value: dataSaverMode,
      onValueChange: setDataSaverMode,
    },
    {
      title: 'הפעלת וידאו אוטומטית',
      iconName: 'play-circle-outline',
      type: 'toggle',
      value: autoplayVideos,
      onValueChange: setAutoplayVideos,
    },
    {
      title: 'ניקוי זיכרון מטמון',
      iconName: 'trash-outline',
      type: 'button',
      onPress: handleClearCache,
    },
    { type: 'sectionHeader', title: 'עזרה ותמיכה' },
    {
      title: 'מרכז העזרה',
      iconName: 'help-circle-outline',
      type: 'navigate',
      onPress: () => openLink('https://reactnative.dev/docs/linking'),
    },
    {
      title: 'דווח על בעיה',
      iconName: 'bug-outline',
      type: 'navigate',
      onPress: () => navigateTo('ReportProblemScreen'),
    },
    {
      title: 'צור קשר',
      iconName: 'call-outline',
      type: 'navigate',
      onPress: () => navigateTo('ContactUsScreen'),
    },
    {
      title: 'מדיניות פרטיות',
      iconName: 'document-text-outline',
      type: 'navigate',
      onPress: () => openLink('https://reactnative.dev/docs/linking'),
    },
    {
      title: 'תנאי שירות',
      iconName: 'reader-outline',
      type: 'navigate',
      onPress: () => openLink('https://reactnative.dev/docs/linking'),
    },
    { type: 'sectionHeader', title: 'אודות' },
    {
      title: 'גרסת אפליקציה',
      iconName: 'information-circle-outline',
      type: 'value',
      displayValue: '1.0.0 (Build 123)',
    },
    { type: 'sectionHeader' },
    {
      title: 'התנתק',
      iconName: 'log-out-outline',
      type: 'button',
      onPress: handleLogout,
      isDestructive: true,
    },
    {
      title: 'מחק חשבון',
      iconName: 'trash-bin-outline',
      type: 'button',
      onPress: () => Alert.alert("מחק חשבון", "האם אתה בטוח שברצונך למחוק את חשבונך?\nפעולה זו בלתי הפיכה."),
      isDestructive: true,
    },
  ];

  const renderSettingItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'sectionHeader') {
      return item.title ? (
        <Text style={localStyles.sectionHeader}>{item.title}</Text>
      ) : (
        <View style={localStyles.sectionSpacer} />
      );
    }
    return <SettingsItem {...(item as SettingsItemProps)} />;
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>הגדרות</Text>
        <View style={localStyles.headerButton} />
      </View>
      <FlatList
        data={settingsData}
        keyExtractor={(item, index) => 
          item.type === 'sectionHeader' 
            ? `section-${item.title || index}` 
            : `setting-${item.title}-${index}`
        }
        renderItem={renderSettingItem}
        contentContainerStyle={localStyles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: colors.backgroundPrimary,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 18,
    alignSelf: 'flex-end',
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundPrimary,
    marginTop: 10,
    marginBottom: 5,
  },
  sectionSpacer: {
    height: 20,
    backgroundColor: colors.backgroundPrimary,
  }
});
