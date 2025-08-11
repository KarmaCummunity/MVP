import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen from '../bottomBarScreens/HomeScreen';
import ChatListScreen from '../topBarScreens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutKarmaCommunityScreen from '../topBarScreens/AboutKarmaCommunityScreen';
import SettingsScreen from '../topBarScreens/SettingsScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import PostsReelsScreenWrapper from '../components/PostsReelsScreenWrapper';
import WebViewScreen from '../screens/WebViewScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FollowersScreen from '../screens/FollowersScreen';

import TopBarNavigator from './TopBarNavigator';

type HomeTabStackParamList = {
  HomeMain: undefined;
  ChatListScreen: undefined;
  ChatDetailScreen: { chatId?: string } | undefined;
  NotificationsScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  SettingsScreen: undefined;
  BookmarksScreen: undefined;
  PostsReelsScreen: undefined;
  WebViewScreen: { url?: string } | undefined;
  UserProfileScreen: { userId?: string } | undefined;
  FollowersScreen: { userId?: string } | undefined;
};

const Stack = createStackNavigator<HomeTabStackParamList>();

export default function HomeTabStack(): React.ReactElement {
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 HomeTabStack - focused');
    }, [])
  );

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="HomeMain"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <TopBarNavigator
            navigation={navigation as any}
            hideTopBar={(route?.params as any)?.hideTopBar === true}
            showPosts={(route?.params as any)?.showPosts === true}
          />
        ),
      })}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
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


