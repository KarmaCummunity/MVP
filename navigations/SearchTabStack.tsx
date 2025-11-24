// File overview:
// - Purpose: Stack navigator for the Search tab.
// - Reached from: `BottomNavigator` -> Tab 'SearchScreen'.
// - Provides: Routes for Search, UserProfile, Followers, DiscoverPeople, ChatList, Notifications, About, Settings.
// - Header: Replaces default header with `TopBarNavigator`.
// - Params of interest: Optional `userId` for profile/followers; no initial params for Search.
// - External deps: react-navigation stack, TopBarNavigator, shared screens.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import SearchScreen from '../bottomBarScreens/SearchScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FollowersScreen from '../screens/FollowersScreen';
import DiscoverPeopleScreen from '../screens/DiscoverPeopleScreen';
import ChatListScreen from '../topBarScreens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutKarmaCommunityScreen from '../topBarScreens/AboutKarmaCommunityScreen';
import SettingsScreen from '../topBarScreens/SettingsScreen';
import TopBarNavigator from './TopBarNavigator';

type SearchTabStackParamList = {
  SearchScreen: undefined;
  UserProfileScreen: { userId?: string } | undefined;
  FollowersScreen: { userId?: string } | undefined;
  DiscoverPeopleScreen: undefined;
  ChatListScreen: undefined;
  NotificationsScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  SettingsScreen: undefined;
};

const Stack = createStackNavigator<SearchTabStackParamList>();

export default function SearchTabStack(): React.ReactElement {
  useFocusEffect(
    React.useCallback(() => {
      // console removed
    }, [])
  );

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="SearchScreen"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        header: () => <TopBarNavigator navigation={navigation as any} />,
      })}
    >
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
      <Stack.Screen name="DiscoverPeopleScreen" component={DiscoverPeopleScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}


