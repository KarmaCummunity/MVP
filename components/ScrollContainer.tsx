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
  // Web: Custom scrollable container with CSS overflow
  webScrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto' as any,
      overflowX: 'hidden' as any,
    }),
    height: '100%',
    maxHeight: SCREEN_HEIGHT - 200, // Reserve space for top/bottom bars
  } as any,
  webScrollContent: {
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.8, // Ensure content is scrollable
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