// WebModeToggleOverlay.tsx
// A web-only toggle control to switch between 'אפליקציה' and 'אתר בית'. Hidden on native.
// 
// IMPORTANT CHANGES:
// - Position changes based on web mode: centered in both 'site' and 'app' modes
// - In app mode: positioned centered above top bar (higher z-index) and stays persistent across all screens
// - In site mode: centered at top of screen over landing page content
// - Seamless switching between site mode (landing page) and app mode (login/home)
// - Enhanced styling for better visibility and user experience
import React, { useCallback, useMemo, useRef } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useWebMode } from '../stores/webModeStore';
import { useUser } from '../stores/userStore';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

const WebModeToggleOverlay: React.FC = () => {
  if (Platform.OS !== 'web') return null as any;
  const { mode, setMode } = useWebMode();
  const { isAuthenticated, isGuestMode } = useUser();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const lastModeRef = useRef(mode);

  // Memoize container style based on mode to prevent unnecessary re-renders
  const containerStyle = useMemo(() => 
    mode === 'app' ? styles.containerApp : styles.containerSite, 
    [mode]
  );

  const handleToggle = useCallback(() => {
    // Prevent duplicate toggles
    if (lastModeRef.current === mode) {
      if (mode === 'site') {
        // Switch to app mode
        lastModeRef.current = 'app';
        setMode('app');
        // Navigate to appropriate screen based on authentication
        if (isAuthenticated || isGuestMode) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeStack' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        }
      } else {
        // Switch to site mode
        lastModeRef.current = 'site';
        setMode('site');
        navigation.reset({
          index: 0,
          routes: [{ name: 'LandingSiteScreen' }],
        });
      }
    }
  }, [mode, setMode, navigation, isAuthenticated, isGuestMode]);

  // Sync ref with mode
  React.useEffect(() => {
    lastModeRef.current = mode;
  }, [mode]);

  return (
    <View pointerEvents="box-none" style={containerStyle}>
      <TouchableOpacity onPress={handleToggle} activeOpacity={0.9} style={styles.wrapper}>
        <View style={styles.background}>
          <View style={[styles.segment, mode === 'site' ? styles.selected : styles.unselected]}>
            <Text style={[styles.text, mode === 'site' ? styles.textSelected : undefined]}>אתר בית</Text>
          </View>
          <View style={[styles.segment, mode === 'app' ? styles.selected : styles.unselected]}>
            <Text style={[styles.text, mode === 'app' ? styles.textSelected : undefined]}>אפליקציה</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Site mode: positioned at top-right corner
  containerSite: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 1000,
  },
  // App mode: positioned at top-right corner, above app content and top bar (persistent across all screens)
  containerApp: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 9999, // Higher z-index to stay above top bar
  },
  wrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  background: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.toggleBackground,
    borderRadius: 999,
    height: 30,
    borderWidth: 1,
    borderColor: colors.headerBorder,
  },
  segment: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.toggleActive,
  },
  unselected: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: FontSizes.small,
    fontWeight: '700',
    color: colors.toggleText,
  },
  textSelected: {
    color: colors.textPrimary,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(WebModeToggleOverlay);

