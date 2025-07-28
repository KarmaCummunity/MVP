import { I18nManager, Platform } from 'react-native';
import i18next from './i18n';

// Languages that should use RTL layout
const RTL_LANGUAGES = ['he', 'ar'];

export const isRTLLanguage = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

export const setupRTL = (language?: string): void => {
  const shouldBeRTL = isRTLLanguage(language || i18next.language);
  
  // Only change if needed
  if (I18nManager.isRTL !== shouldBeRTL) {
    // Enable/disable RTL support based on language
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    
    // For Android, you might need to restart the app after enabling RTL
    if (Platform.OS === 'android') {
      // console.log('RTL changed. Please restart the app for changes to take effect.');
    }
  }
};

// Helper function to get RTL-aware flex direction
export const getRTLFlexDirection = (
  defaultDirection: 'row' | 'row-reverse' = 'row'
): 'row' | 'row-reverse' => {
  if (defaultDirection === 'row') {
    return I18nManager.isRTL ? 'row-reverse' : 'row';
  } else {
    return I18nManager.isRTL ? 'row' : 'row-reverse';
  }
};

// Helper function to get RTL-aware text alignment
export const getRTLTextAlign = (
  defaultAlign: 'left' | 'right' | 'center' = 'left'
): 'left' | 'right' | 'center' => {
  if (defaultAlign === 'left') {
    return I18nManager.isRTL ? 'right' : 'left';
  } else if (defaultAlign === 'right') {
    return I18nManager.isRTL ? 'left' : 'right';
  }
  return defaultAlign;
};

// Helper function to get RTL-aware margins
export const getRTLMargin = (
  left: number = 0, 
  right: number = 0
): { marginLeft: number; marginRight: number } => {
  return I18nManager.isRTL 
    ? { marginLeft: right, marginRight: left }
    : { marginLeft: left, marginRight: right };
};

// Helper function to get RTL-aware padding
export const getRTLPadding = (
  left: number = 0, 
  right: number = 0
): { paddingLeft: number; paddingRight: number } => {
  return I18nManager.isRTL 
    ? { paddingLeft: right, paddingRight: left }
    : { paddingLeft: left, paddingRight: right };
};

// Type for RTL-aware style object
export interface RTLStyleObject {
  flexDirection?: 'row' | 'row-reverse';
  textAlign?: 'left' | 'right' | 'center';
  marginLeft?: number;
  marginRight?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

// Listen for language changes and update RTL accordingly
i18next.on('languageChanged', (lng) => {
  setupRTL(lng);
});
