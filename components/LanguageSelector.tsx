import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { isRTLLanguage } from '../utils/RTLConfig';
import * as Updates from 'expo-updates';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: any;
  isRTL?: boolean;
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: require('../assets/images/flags/en.png'),
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: require('../assets/images/flags/he.png'),
    isRTL: true,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: require('../assets/images/flags/ar.png'),
    isRTL: true,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: require('../assets/images/flags/ru.png'),
  },
];

export default function LanguageSelector({ isVisible, onClose }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();

  const handleLanguageSelect = async (language: LanguageOption) => {
    const wasRTL = isRTLLanguage(i18n.language);
    const willBeRTL = language.isRTL ?? false;

    await i18n.changeLanguage(language.code);
    onClose();

    if (wasRTL !== willBeRTL && Platform.OS === 'android') {
      setTimeout(() => {
        Updates.reloadAsync();
      }, 100);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
          <Text style={styles.modalSubtitle}>{t('settings.selectLanguageDesc')}</Text>
          
          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  i18n.language === language.code && styles.selectedLanguage,
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Image source={language.flag} style={styles.flag} />
                <View style={styles.languageTextContainer}>
                  <Text style={[
                    styles.languageName,
                    i18n.language === language.code && styles.selectedText,
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.languageNameEnglish,
                    i18n.language === language.code && styles.selectedText,
                  ]}>
                    {language.name}
                  </Text>
                </View>
                {i18n.language === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: FontSizes.body,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textSecondary,
  },
  languageList: {
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  selectedLanguage: {
    backgroundColor: colors.pink + '20',
    borderColor: colors.pink,
    borderWidth: 1,
  },
  flag: {
    width: 30,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  languageNameEnglish: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedText: {
    color: colors.pink,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.backgroundPrimary,
    fontSize: FontSizes.body,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignSelf: 'stretch',
  },
  closeButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
}); 