// File overview:
// - Purpose: Stack navigator for the Profile tab.
// - Reached from: `BottomNavigator` -> Tab 'ProfileScreen' (hidden when guest mode is active).
// - Provides: Routes for Profile, Settings, ChatList, Notifications, About.
// - Header: Uses `TopBarNavigator` for a consistent top bar across the app.
// - Params: None for initial route; other screens use their own optional params.
// - External deps: react-navigation stack, TopBarNavigator, common top-bar screens.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import ProfileScreen from '../bottomBarScreens/ProfileScreen';
import SettingsScreen from '../topBarScreens/SettingsScreen';
import ChatListScreen from '../topBarScreens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutKarmaCommunityScreen from '../topBarScreens/AboutKarmaCommunityScreen';
import TopBarNavigator from './TopBarNavigator';

type ProfileTabStackParamList = {
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  ChatListScreen: undefined;
  NotificationsScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
};

const Stack = createStackNavigator<ProfileTabStackParamList>();

export default function ProfileTabStack(): React.ReactElement {
  useFocusEffect(
    React.useCallback(() => {
      // console removed
    }, [])
  );

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="ProfileScreen"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        header: () => <TopBarNavigator navigation={navigation as any} />,
      })}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
    </Stack.Navigator>
  );
}


