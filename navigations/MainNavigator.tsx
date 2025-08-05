import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack";
import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import PostsReelsScreen from "../components/PostsReelsScreen";
import BookmarksScreen from "../bottomBarScreens/BookmarksScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import { useUser } from '../context/UserContext';
import colors from '../globals/colors';

import { RootStackParamList } from '../globals/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  const { selectedUser, isLoading, isGuestMode } = useUser();

  // אם טוען – מציג מסך טעינה
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundPrimary,
      }}>
        <ActivityIndicator size="large" color={colors.info} />
        <Text style={{
          marginTop: 10,
          fontSize: 16,
          color: colors.textPrimary,
        }}>
          טוען...
        </Text>
      </View>
    );
  }
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="LoginScreen"
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeStack} />
      <Stack.Screen name="InactiveScreen" component={InactiveScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen
        name="PostsReelsScreen"
        component={PostsReelsScreen}
        options={{
          cardStyle: { backgroundColor: 'transparent' },
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen
        name="BookmarksScreen"
        component={BookmarksScreen}
        options={{
          title: 'מועדפים',
          headerTitleAlign: 'center',
          headerShown: true,
        }}
      />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}