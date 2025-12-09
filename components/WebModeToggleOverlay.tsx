// WebModeToggleOverlay.tsx
// A web-only toggle control to switch between 'אפליקציה' and 'אתר בית'. Hidden on native.
// 
// IMPORTANT CHANGES:
// - Position changes based on web mode: centered in both 'site' and 'app' modes
// - In app mode: positioned centered above top bar (higher z-index) and stays persistent across all screens
// - In site mode: centered at top of screen over landing page content
// - Seamless switching between site mode (landing page) and app mode (login/home)
// - Enhanced styling for better visibility and user experience
// 
// VISIBILITY LOGIC:
// - Toggle button is HIDDEN for authenticated users (users who created an account)
// - Toggle button is SHOWN for guest users and non-authenticated users
// - This provides a cleaner UI for logged-in users who don't need to switch modes
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useWebMode } from '../stores/webModeStore';
import { useUser } from '../stores/userStore';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { navigationQueue } from '../utils/navigationQueue';
import { checkNavigationGuards, getGuardContext } from '../utils/navigationGuards';

const WebModeToggleOverlay: React.FC = () => {
  if (Platform.OS !== 'web') return null as any;
  const { mode, setMode } = useWebMode();
  const { isAuthenticated, isGuestMode, selectedUser, isAdmin } = useUser();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Hide toggle button if user is authenticated (not guest mode)
  // Show only for guests or non-authenticated users
  if (isAuthenticated && !isGuestMode && selectedUser) {
    return null as any;
  }

  // Dynamic container style based on mode
  const containerStyle = mode === 'app' ? styles.containerApp : styles.containerSite;

  const handleToggle = async () => {
    const newMode = mode === 'site' ? 'app' : 'site';
    setMode(newMode);
    
    // Determine target route based on new mode and authentication
    let targetRoute: string;
    if (newMode === 'app') {
      // Switch to app mode - navigate to appropriate screen based on authentication
      if (isAuthenticated || isGuestMode) {
        targetRoute = 'HomeStack';
      } else {
        targetRoute = 'LoginScreen';
      }
    } else {
      // Switch to site mode - navigate to landing page
      targetRoute = 'LandingSiteScreen';
    }

    // Check guards before navigation
    const guardContext = {
      isAuthenticated,
      isGuestMode,
      isAdmin,
      mode: newMode,
    };

    const guardResult = await checkNavigationGuards(
      {
        type: 'reset',
        index: 0,
        routes: [{ name: targetRoute }],
      },
      guardContext
    );

    if (!guardResult.allowed) {
      // If guard blocks, try redirect if provided
      if (guardResult.redirectTo) {
        await navigationQueue.reset(0, [{ name: guardResult.redirectTo }], 2);
      }
      return;
    }

    // Use navigation queue with high priority (2) for mode changes
    await navigationQueue.reset(0, [{ name: targetRoute }], 2);
  };

  return (
    <View style={containerStyle}>
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
    pointerEvents: 'box-none',
  },
  // App mode: positioned at top-right corner, above app content and top bar (persistent across all screens)
  containerApp: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 9999, // Higher z-index to stay above top bar
    pointerEvents: 'box-none',
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

export default WebModeToggleOverlay;


