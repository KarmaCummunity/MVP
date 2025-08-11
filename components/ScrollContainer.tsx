import React from 'react';
import { Platform, Dimensions, View, ScrollView, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  children: React.ReactNode;
  bottomPadding?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  nativeOnScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  nestedScrollEnabled?: boolean;
};

export default function ScrollContainer({
  children,
  bottomPadding = 24,
  style,
  contentStyle,
  showsVerticalScrollIndicator = false,
  nativeOnScroll,
  scrollEventThrottle = 16,
  nestedScrollEnabled = true,
}: Props) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            flex: 1,
            overflow: 'auto' as any,
            WebkitOverflowScrolling: 'touch' as any,
            overscrollBehavior: 'contain' as any,
            height: SCREEN_HEIGHT as any,
            maxHeight: SCREEN_HEIGHT as any,
            width: '100%' as any,
            touchAction: 'auto' as any,
          },
          style,
        ]}
      >
        <View
          style={[
            { minHeight: SCREEN_HEIGHT * 1.2, paddingBottom: bottomPadding },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[{ paddingBottom: bottomPadding }, contentStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={scrollEventThrottle}
      nestedScrollEnabled={nestedScrollEnabled}
      onScroll={nativeOnScroll}
    >
      {children}
    </ScrollView>
  );
}


