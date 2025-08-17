import { Dimensions, Platform, I18nManager, ScaledSize } from 'react-native';

// TODO: Add comprehensive TypeScript interfaces for all responsive utilities
// TODO: Implement proper breakpoint system with named breakpoints
// TODO: Add comprehensive device detection (iPhone models, Android variants)
// TODO: Create responsive hook system with proper subscription management
// TODO: Add comprehensive orientation change handling
// TODO: Implement proper accessibility scaling support
// TODO: Add comprehensive performance optimization for responsive calculations
// TODO: Create proper responsive testing and validation tools
// TODO: Add comprehensive documentation for responsive design patterns
// TODO: Implement proper responsive image and asset management

// Screen info helpers
export const getScreenInfo = () => {
  const { width, height } = Dimensions.get('window');
  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);
  const isTablet = shortest >= 600; // TODO: Use proper tablet breakpoint constants
  const isDesktop = Platform.OS === 'web' && width >= 1024; // TODO: Use proper desktop breakpoint constants
  const isSmallPhone = shortest < 360; // TODO: Use proper small phone breakpoint constants
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

// Enhanced scale based on iPhone 11 baseline width (414) with better mobile web support
// TODO: Make baseline configurable and support multiple device baselines
// TODO: Add proper scale caching to improve performance
// TODO: Implement proper scale testing across different devices
// TODO: Add scale limits and validation to prevent extreme scaling
export const scaleSize = (size: number) => {
  const { width, height } = Dimensions.get('window');
  const baseline = 414; // TODO: Move to constants file
  
  // For web, use better mobile detection and scaling
  if (Platform.OS === 'web') {
    // Check if it's a mobile browser based on viewport size
    const isMobileWeb = width <= 768 && (width / height < 1.2); // Portrait-ish mobile
    
    if (isMobileWeb) {
      // More aggressive scaling for mobile web to ensure readability
      const mobileFactor = Math.min(Math.max(width / baseline, 0.9), 1.4);
      return Math.round(size * mobileFactor);
    } else {
      // Desktop web - moderate scaling
      const desktopFactor = Math.min(Math.max(width / 1024, 0.8), 1.2);
      return Math.round(size * desktopFactor);
    }
  }
  
  // Original scaling for native mobile
  const factor = Math.min(Math.max(width / baseline, 0.85), 1.25);
  return Math.round(size * factor);
};

export const vw = (percent: number) => Dimensions.get('window').width * (percent / 100);
export const vh = (percent: number) => Dimensions.get('window').height * (percent / 100);

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Enhanced web platform detection
export const isMobileWeb = () => {
  if (!isWeb) return false;
  const { width, height } = Dimensions.get('window');
  return width <= 768 && (width / height < 1.5); // Mobile web viewport
};

export const isTabletWeb = () => {
  if (!isWeb) return false;
  const { width, height } = Dimensions.get('window');
  return width > 768 && width <= 1024;
};

export const isDesktopWeb = () => {
  if (!isWeb) return false;
  const { width } = Dimensions.get('window');
  return width > 1024;
};

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


