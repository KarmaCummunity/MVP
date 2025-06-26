import { I18nManager, Platform } from 'react-native';

export const setupRTL = (): void => {
  // Enable RTL support
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  
  // For Android, you might need to restart the app after enabling RTL
  if (Platform.OS === 'android' && !I18nManager.isRTL) {
    // console.log('RTL enabled. Please restart the app for changes to take effect.');
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
