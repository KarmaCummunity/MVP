import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import he from '../locales/he.json';

export const resources = {
  he,
} as const;

// Initialize with Hebrew only
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'he',
  fallbackLng: 'he',
  resources,
  debug: false,
});

export default i18next; 