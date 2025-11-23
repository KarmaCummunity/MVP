// File overview:
// - Purpose: Root stack navigator controlling auth vs app flows, with web mode support.
// - Reached from: `App.tsx` renders `<MainNavigator />` inside `NavigationContainer`.
// - Provides: Stack with routes that depend on web mode:
//   * Site mode: Shows 'LandingSiteScreen' as entry point
//   * App mode: Shows 'LoginScreen' -> 'HomeStack' (BottomNavigator tabs)
// - Decides: Based on web mode and authentication state which screen to show initially
// - Web Mode Logic:
//   * 'site' mode: LandingSiteScreen is initial route, toggle switches to app mode (Login/Home)
//   * 'app' mode: Normal app flow with persistent toggle button above content
// - Reads from context: `useUser()`, `useWebMode()` for controlling navigation flow
// - Navigation params in common: Many screens expect optional ids (e.g., chatId, userId, url).
// - Downstream flows:
//   - LandingSiteScreen -> toggle to app mode -> Login/Home
//   - LoginScreen -> on success/guest: `navigation.reset({ routes: [{ name: 'HomeStack' }] })`.
//   - Notifications -> may navigate to 'ChatDetailScreen' with `conversationId`.
// - External deps: react-navigation stack, i18n for titles, shared colors/styles.

// TODO: Add proper navigation state persistence for deep linking
// TODO: Implement proper screen pre-loading for better performance
// TODO: Add navigation analytics and tracking
// TODO: Simplify complex navigation logic - too many conditional renders
// TODO: Add proper TypeScript typing for all navigation params
// TODO: Implement proper loading states during navigation transitions
// TODO: Add navigation guards for protected routes
// TODO: Remove hardcoded console.log statements - use proper logging
// TODO: Add navigation error boundaries and fallback screens
// TODO: Optimize navigation performance with lazy loading
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import BottomNavigator from "./BottomNavigator";
// InactiveScreen was removed; replace with LoginScreen to avoid missing module
// import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import PostsReelsScreenWrapper from "../components/PostsReelsScreenWrapper";
import BookmarksScreen from "../screens/BookmarksScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import FollowersScreen from "../screens/FollowersScreen";
import DiscoverPeopleScreen from "../screens/DiscoverPeopleScreen";
import LoginScreen from "../screens/LoginScreen";
import { useUser } from '../stores/userStore';
import colors from '../globals/colors';
import styles from '../globals/styles';
import NewChatScreen from '../screens/NewChatScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import SettingsScreen from '../topBarScreens/SettingsScreen';
import ChatListScreen from '../topBarScreens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutKarmaCommunityScreen from '../topBarScreens/AboutKarmaCommunityScreen';
import OrgOnboardingScreen from '../screens/OrgOnboardingScreen';
import AdminOrgApprovalsScreen from '../screens/AdminOrgApprovalsScreen';
import OrgDashboardScreen from '../screens/OrgDashboardScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LandingSiteScreen from '../screens/LandingSiteScreen';
import { useWebMode } from '../stores/webModeStore';

import { RootStackParamList } from '../globals/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  const { selectedUser, isLoading, isGuestMode, isAuthenticated } = useUser();
  const { t } = useTranslation(['common','profile']);
  const { mode } = useWebMode();

  // TODO: Replace console.log with proper logging service
  // TODO: Add proper state validation and error handling
  // console removed

  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // console removed
      // This will trigger re-renders of child screens when needed
    }, [])
  );

  // Automatic update when authentication state changes
  useEffect(() => {
    // console removed
  }, [selectedUser, isLoading, isGuestMode, isAuthenticated]);

  // Loading screen
  if (isLoading) {
    // console removed
    return (
      <View style={styles.centeredScreen as any}>
        <ActivityIndicator size="large" color={colors.info} />
        <Text style={styles.loadingText as any}>{t('common:loading')}</Text>
      </View>
    );
  }

  // console removed

  // Determine initial route based on web mode and authentication state
  let initialRouteName: string;
  
  if (Platform.OS === 'web' && mode === 'site') {
    // Site mode: always start with landing page
    initialRouteName = 'LandingSiteScreen';
    // console removed
  } else {
    // App mode: determine based on authentication
    if (isAuthenticated || isGuestMode) {
      initialRouteName = 'HomeStack';
      // console removed
    } else {
      initialRouteName = 'LoginScreen';
      // console removed
    }
  }

  return (
    <Stack.Navigator 
      key={`stack-${mode}-${isAuthenticated}-${isGuestMode}`}
      id={undefined}
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName as any}
    >
      {Platform.OS === 'web' ? (
        <Stack.Screen name="LandingSiteScreen" component={LandingSiteScreen} />
      ) : null}
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeStack" component={BottomNavigator} />
      <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
      <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
      {/* InactiveScreen removed - redirect to LoginScreen */}
      <Stack.Screen name="InactiveScreen" component={LoginScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen
        name="PostsReelsScreen"
        component={PostsReelsScreenWrapper}
        options={{
          cardStyle: { backgroundColor: 'transparent' },
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen
        name="BookmarksScreen"
        component={BookmarksScreen}
        options={{
          title: t('profile:menu.bookmarks'),
          headerTitleAlign: 'center',
          headerShown: true,
        }}
      />
      {/* Screen we see that opens when user looks at another user */}
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
      <Stack.Screen name="DiscoverPeopleScreen" component={DiscoverPeopleScreen} />
      
      {/* Top Bar Screens */}
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
     
{/* Org Screens */}     
      <Stack.Screen name="OrgOnboardingScreen" component={OrgOnboardingScreen} />
      <Stack.Screen name="AdminOrgApprovalsScreen" component={AdminOrgApprovalsScreen} />
      <Stack.Screen name="OrgDashboardScreen" component={OrgDashboardScreen} />
      {/* User Profile Screens */}
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}