// File overview:
// - Purpose: Stack navigator for the Home tab.
// - Reached from: `BottomNavigator` -> Tab 'HomeScreen'.
// - Provides: Custom header via `TopBarNavigator` that can be hidden with route param `hideTopBar`; initial route 'HomeMain'.
// - Screens: HomeMain (HomeScreen), ChatList, ChatDetail, Notifications, About, Settings, Bookmarks, UserProfile, Followers, PostsReels (modal), WebView.
// - Params of interest: `hideTopBar`, `showPosts` passed by HomeScreen to control header and content.
// - External deps: react-navigation stack, TopBarNavigator wrapper.
import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';

import HomeScreen from '../bottomBarScreens/HomeScreen';
import ChatListScreen from '../topBarScreens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import NewChatScreen from '../screens/NewChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutKarmaCommunityScreen from '../topBarScreens/AboutKarmaCommunityScreen';
import SettingsScreen from '../topBarScreens/SettingsScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import PostsReelsScreenWrapper from '../components/PostsReelsScreenWrapper';
import WebViewScreen from '../screens/WebViewScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FollowersScreen from '../screens/FollowersScreen';
import DiscoverPeopleScreen from '../screens/DiscoverPeopleScreen';
import LandingSiteScreen from '../screens/LandingSiteScreen';

import TopBarNavigator from './TopBarNavigator';
import { useWebMode } from '../stores/webModeStore';
import { useUser } from '../stores/userStore';
import { logger } from '../utils/loggerService';

type HomeTabStackParamList = {
  HomeMain: undefined;
  LandingSiteScreen: undefined;
  ChatListScreen: undefined;
  ChatDetailScreen: { chatId?: string } | undefined;
  NewChatScreen: undefined;
  NotificationsScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  SettingsScreen: undefined;
  BookmarksScreen: undefined;
  PostsReelsScreen: undefined;
  WebViewScreen: { url?: string } | undefined;
  UserProfileScreen: { userId: string; userName: string; characterData?: any } | undefined;
  FollowersScreen: { userId?: string } | undefined;
  DiscoverPeopleScreen: undefined;
};

const Stack = createStackNavigator<HomeTabStackParamList>();

export default function HomeTabStack(): React.ReactElement {
  const { mode } = useWebMode();
  const navigation = useNavigation();
  const { resetHomeScreenTrigger, isAuthenticated, isGuestMode } = useUser();

  // Get the stack navigator reference - useNavigation() returns parent, so we need to get the stack itself
  // We'll use a ref to store the stack navigator when it's available
  const stackNavigatorRef = React.useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      logger.debug('HomeTabStack', 'Navigator focused');
      // Navigation to HomeMain is handled by BottomNavigator when tab is pressed
      // We don't need to handle it here to avoid navigation conflicts
    }, [])
  );

  // Navigate to HomeMain when resetHomeScreenTrigger changes
  // This is called when the home tab is pressed in BottomNavigator
  useEffect(() => {
    if (resetHomeScreenTrigger > 0) {
      try {
        // Get the current navigation state - navigation here is the HomeTabStack navigator itself
        const state = (navigation as any).getState();
        const currentRoute = state?.routes?.[state?.index || 0];
        const currentRouteName = currentRoute?.name;

        logger.debug('HomeTabStack', 'resetHomeScreenTrigger activated', {
          resetHomeScreenTrigger,
          currentRouteName,
          mode
        });

        // Check if we are physically at HomeMain by inspecting the nested stack state
        // currentRouteName from getState() is 'HomeScreen' (the tab name), not the inner stack route
        let isAtHomeMain = false;

        // We need to check if the current active tab is HomeScreen
        if (currentRouteName === 'HomeScreen') {
          const stackState = currentRoute?.state;
          // If stackState is undefined, it usually means no navigation has happened yet in this stack, 
          // so we are at the initial route (HomeMain)
          if (!stackState) {
            isAtHomeMain = true;
          } else {
            // Check the current route in the stack
            const stackRoute = stackState.routes?.[stackState.index || 0];
            if (stackRoute?.name === 'HomeMain') {
              isAtHomeMain = true;
            }
          }
        }

        logger.debug('HomeTabStack', 'Checking if at HomeMain', {
          isAtHomeMain,
          currentRouteName,
          topRoute: currentRoute?.state?.routes?.[currentRoute?.state?.index || 0]?.name
        });

        // Only navigate if we're not already on HomeMain
        if (!isAtHomeMain) {
          logger.debug('HomeTabStack', 'Navigating to HomeMain due to resetHomeScreenTrigger', {
            resetHomeScreenTrigger,
            mode
          });

          // Use navigate('HomeMain') which will pop back to HomeMain if it's in the stack
          // This avoids "Action RESET not handled" errors
          try {
            (navigation as any).navigate('HomeMain');
            logger.debug('HomeTabStack', 'Successfully navigated to HomeMain');
          } catch (navError) {
            logger.error('HomeTabStack', 'Navigation to HomeMain failed', { navError });
          }
        } else {
          // Already on HomeMain - just log that we're refreshing
          logger.debug('HomeTabStack', 'Already on HomeMain, trigger just refreshes the screen', {
            resetHomeScreenTrigger,
            mode
          });
        }
      } catch (error) {
        logger.error('HomeTabStack', 'Error navigating to HomeMain', { error });
        // Fallback: try to navigate directly to HomeMain
        try {
          (navigation as any).navigate('HomeMain');
        } catch (fallbackError) {
          logger.error('HomeTabStack', 'Fallback navigation also failed', { fallbackError });
        }
      }
    }
  }, [resetHomeScreenTrigger, navigation, mode]);

  // Determine initial route based on web mode
  const initialRouteName = (typeof window !== 'undefined' && mode === 'site')
    ? "LandingSiteScreen"
    : "HomeMain";

  logger.debug('HomeTabStack', 'Rendering with initial route', { initialRouteName, mode });

  // Memoize screenOptions to ensure it updates when auth state changes
  const screenOptions = useCallback(({ navigation, route }: any) => {
    // For LandingSiteScreen, hide top bar if user is not authenticated (initial route in site mode)
    // Show top bar if user is authenticated (navigated from within app)
    const isLandingScreen = route.name === 'LandingSiteScreen';
    const shouldHideTopBarForLanding = isLandingScreen && !(isAuthenticated || isGuestMode);

    return {
      headerShown: true,
      header: () => (
        <TopBarNavigator
          navigation={navigation as any}
          hideTopBar={shouldHideTopBarForLanding || (route?.params as any)?.hideTopBar === true}
          showPosts={(route?.params as any)?.showPosts === true}
        />
      ),
      // Fix for aria-hidden warning: prevent focus on inactive screens
      // detachInactiveScreens already handles this, but we keep cardStyle for web compatibility
      cardStyle: Platform.OS === 'web' ? {
        // On web, ensure inactive screens don't interfere with focus
        // This prevents elements in hidden screens from receiving focus
      } : undefined,
    };
  }, [isAuthenticated, isGuestMode]);

  return (
    <Stack.Navigator
      id="HomeTabStack"
      initialRouteName={initialRouteName as keyof HomeTabStackParamList}
      detachInactiveScreens={true}
      screenOptions={screenOptions}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="LandingSiteScreen" component={LandingSiteScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
      <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
      <Stack.Screen name="DiscoverPeopleScreen" component={DiscoverPeopleScreen} />
      <Stack.Screen
        name="PostsReelsScreen"
        component={PostsReelsScreenWrapper}
        options={{
          presentation: 'transparentModal',
          cardStyle: { backgroundColor: 'transparent' },
          headerShown: false,
        }}
      />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


