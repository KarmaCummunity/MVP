import { Dimensions, Platform, I18nManager, ScaledSize } from 'react-native';

// Screen info helpers
export const getScreenInfo = () => {
  const { width, height } = Dimensions.get('window');
  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  const isTablet = shortest >= 600;
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const isSmallPhone = shortest < 360;
  return { width, height, shortest, longest, isTablet, isDesktop, isSmallPhone };
};

export type Orientation = 'portrait' | 'landscape';

export const getOrientation = (): Orientation => {
  const { width, height } = Dimensions.get('window');
  return height >= width ? 'portrait' : 'landscape';
};

export const isPortrait = () => getOrientation() === 'portrait';
export const isLandscape = () => getOrientation() === 'landscape';

// React hook to track orientation at runtime
export const useOrientation = (): Orientation => {
  const { width, height } = Dimensions.get('window');
  // Basic, lightweight: any change in window dims implies orientation change
  return height >= width ? 'portrait' : 'landscape';
};

// Simple scale based on iPhone 11 baseline width (414) with caps
export const scaleSize = (size: number) => {
  const { width } = Dimensions.get('window');
  const baseline = 414;
  const factor = Math.min(Math.max(width / baseline, 0.85), 1.25);
  return Math.round(size * factor);
};

export const vw = (percent: number) => Dimensions.get('window').width * (percent / 100);
export const vh = (percent: number) => Dimensions.get('window').height * (percent / 100);

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Per requirement: on web, left/right should be flipped relative to mobile (mainly texts)
// We assume app is RTL on mobile; web should visually invert left/right for texts and inline spacing
type Align = 'left' | 'right' | 'center';

export const biDiTextAlign = (mobileDefault: Align = 'right'): Align => {
  if (isWeb) {
    if (mobileDefault === 'left') return 'right';
    if (mobileDefault === 'right') return 'left';
    return 'center';
  }
  // Mobile respects RTL via I18nManager; but we follow requested behavior and keep given default for mobile
  return mobileDefault;
};

export const marginStartEnd = (mobileStart: number = 0, mobileEnd: number = 0) => {
  // On web invert start/end
  const isRTL = I18nManager.isRTL;
  const resolvedStart = isRTL ? mobileEnd : mobileStart;
  const resolvedEnd = isRTL ? mobileStart : mobileEnd;
  if (isWeb) {
    // invert
    return { marginLeft: resolvedEnd, marginRight: resolvedStart };
  }
  return { marginLeft: resolvedStart, marginRight: resolvedEnd };
};

export const paddingStartEnd = (mobileStart: number = 0, mobileEnd: number = 0) => {
  const isRTL = I18nManager.isRTL;
  const resolvedStart = isRTL ? mobileEnd : mobileStart;
  const resolvedEnd = isRTL ? mobileStart : mobileEnd;
  if (isWeb) {
    return { paddingLeft: resolvedEnd, paddingRight: resolvedStart };
  }
  return { paddingLeft: resolvedStart, paddingRight: resolvedEnd };
};

export const rowDirection = (mobileDefault: 'row' | 'row-reverse' = 'row') => {
  // For rows, keep mobile default; invert for web to mirror
  if (isWeb) {
    return mobileDefault === 'row' ? 'row-reverse' : 'row';
  }
  return mobileDefault;
};


