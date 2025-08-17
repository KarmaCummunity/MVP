// ScrollContainer.tsx
// Universal scrolling component that handles web and mobile consistently
import React from 'react';
import { 
  ScrollView, 
  ScrollViewProps,
  View, 
  Platform, 
  Dimensions,
  StyleSheet,
  ViewStyle 
} from 'react-native';
import colors from '../globals/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScrollContainerProps extends Omit<ScrollViewProps, 'style' | 'contentContainerStyle'> {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  enableWebScrolling?: boolean;
}

/**
 * ScrollContainer - Universal scrolling component
 * 
 * Features:
 * - Platform-specific scrolling (CSS overflow for web, ScrollView for native)
 * - Consistent behavior across all platforms
 * - Optimized performance for each platform
 * 
 * Usage:
 * ```tsx
 * <ScrollContainer>
 *   <YourContent />
 * </ScrollContainer>
 * ```
 */
export default function ScrollContainer({ 
  children, 
  style = {},
  contentStyle = {},
  enableWebScrolling = true,
  ...scrollViewProps 
}: ScrollContainerProps) {
  
  if (Platform.OS === 'web' && enableWebScrolling) {
    // Web: Custom scrollable container with CSS overflow
    return (
      <View style={[styles.webScrollContainer, style]}>
        <View style={[styles.webScrollContent, contentStyle]}>
          {children}
        </View>
      </View>
    );
  }
  
  // Native: Standard ScrollView for iOS/Android
  return (
    <ScrollView
      style={[styles.nativeScrollView, style]}
      contentContainerStyle={[styles.nativeScrollContent, contentStyle]}
      showsVerticalScrollIndicator={true}
      scrollEnabled={true}
      bounces={Platform.OS === 'ios'}
      overScrollMode={Platform.OS === 'android' ? 'auto' : undefined}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Web: Custom scrollable container with CSS overflow - optimized for mobile web
  webScrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto' as any,
      overflowX: 'hidden' as any,
      // Better mobile web scrolling
      WebkitOverflowScrolling: 'touch' as any,
      scrollBehavior: 'smooth' as any,
    }),
    height: '100%',
    // Remove restrictive maxHeight for mobile web
    maxHeight: '100vh' as any,
    width: '100%',
    maxWidth: '100vw' as any,
  } as any,
  webScrollContent: {
    // Much less padding on mobile web to reduce dead space
    paddingBottom: Dimensions.get('window').width <= 768 ? 20 : 40,
    // Better height calculation for mobile web
    minHeight: '100%' as any,
    width: '100%',
  },
  
  // Native: Standard ScrollView styles
  nativeScrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nativeScrollContent: {
    paddingBottom: 40,
  },
});