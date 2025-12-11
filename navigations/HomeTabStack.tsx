// File overview:
// - Purpose: Stack navigator for the Home tab.
// - Reached from: `BottomNavigator` -> Tab 'HomeScreen'.
// - Provides: Custom header via `TopBarNavigator` that can be hidden with route param `hideTopBar`; initial route 'HomeMain'.
// - Screens: HomeMain (HomeScreen), ChatList, ChatDetail, Notifications, About, Settings, Bookmarks, UserProfile, Followers, PostsReels (modal), WebView.
// - Params of interest: `hideTopBar`, `showPosts` passed by HomeScreen to control header and content.
// - External deps: react-navigation stack, TopBarNavigator wrapper.
import React, { useEffect } from 'react';
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
import CommunityStatsScreen from '../screens/CommunityStatsScreen';

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
  CommunityStatsScreen: undefined;
  WebViewScreen: { url?: string } | undefined;
  UserProfileScreen: { userId: string; userName: string; characterData?: any } | undefined;
  FollowersScreen: { userId?: string } | undefined;
  DiscoverPeopleScreen: undefined;
};

const Stack = createStackNavigator<HomeTabStackParamList>();

export default function HomeTabStack(): React.ReactElement {
  const { mode } = useWebMode();
  const navigation = useNavigation();
  const { resetHomeScreenTrigger } = useUser();

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

        // Always navigate to HomeMain when reset is triggered
        if (currentRouteName !== 'HomeMain') {
          logger.debug('HomeTabStack', 'Navigating to HomeMain due to resetHomeScreenTrigger', {
            resetHomeScreenTrigger,
            currentRoute: currentRouteName,
            mode
          });

          // Use CommonActions.reset to reset the stack to HomeMain
          // This ensures we pop all screens and go back to HomeMain
          try {
            (navigation as any).dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HomeMain' }],
              })
            );
            logger.debug('HomeTabStack', 'Successfully reset to HomeMain');
          } catch (resetError) {
            logger.error('HomeTabStack', 'Error resetting to HomeMain', { resetError });
            // Fallback: try to navigate directly
            try {
              (navigation as any).navigate('HomeMain');
            } catch (navError) {
              logger.error('HomeTabStack', 'Fallback navigation also failed', { navError });
            }
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

  return (
    <Stack.Navigator
      id="HomeTabStack"
      initialRouteName={initialRouteName as keyof HomeTabStackParamList}
      detachInactiveScreens={true}
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <TopBarNavigator
            navigation={navigation as any}
            hideTopBar={(route?.params as any)?.hideTopBar === true}
            showPosts={(route?.params as any)?.showPosts === true}
          />
        ),
        // Fix for aria-hidden warning: prevent focus on inactive screens
        // detachInactiveScreens already handles this, but we keep cardStyle for web compatibility
        cardStyle: Platform.OS === 'web' ? {
          // On web, ensure inactive screens don't interfere with focus
          // This prevents elements in hidden screens from receiving focus
        } : undefined,
      })}
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
      <Stack.Screen name="CommunityStatsScreen" component={CommunityStatsScreen} />
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


