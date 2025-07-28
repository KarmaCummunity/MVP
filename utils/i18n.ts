 
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import he from '../locales/he.json';
import ru from '../locales/ru.json';
import ar from '../locales/ar.json';

const LANGUAGE_KEY = '@language';

const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return storedLang;
  } catch (error) {
    console.error('Error reading stored language:', error);
    return null;
  }
};

const [{ languageCode }] = Localization.getLocales();

export const resources = {
  en,
  he,
  ru,
  ar,
} as const;

// Initialize with system language, will be overridden by stored preference if exists
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: languageCode ?? 'en',
  fallbackLng: 'en',
  resources,
});

// Load stored language preference
getStoredLanguage().then(storedLang => {
  if (storedLang) {
    i18next.changeLanguage(storedLang);
  }
});

// Add language change listener to persist selection
i18next.on('languageChanged', (lng) => {
  AsyncStorage.setItem(LANGUAGE_KEY, lng).catch(error => {
    console.error('Error saving language preference:', error);
  });
});

export default i18next; 