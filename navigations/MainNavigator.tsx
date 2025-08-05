import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import HomeStack from "./HomeStack";
import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import PostsReelsScreen from "../components/PostsReelsScreen";
import BookmarksScreen from "../bottomBarScreens/BookmarksScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import FollowersScreen from "../screens/FollowersScreen";
import DiscoverPeopleScreen from "../screens/DiscoverPeopleScreen";
import LoginScreen from "../screens/LoginScreen";
import { useUser } from '../context/UserContext';
import colors from '../globals/colors';
import SettingsScreen from '../topBarScreens/SettingsScreen';

import { RootStackParamList } from '../globals/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  const { selectedUser, isLoading, isGuestMode, isAuthenticated } = useUser();

  console.log('🧭 MainNavigator - Render state:', {
    selectedUser: selectedUser?.name || 'null',
    isLoading,
    isGuestMode,
    isAuthenticated
  });

  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🧭 MainNavigator - Navigator focused, checking state...');
      // This will trigger re-renders of child screens when needed
    }, [])
  );

  // Automatic update when authentication state changes
  useEffect(() => {
    console.log('🧭 MainNavigator - Auth state changed:', {
      selectedUser: selectedUser?.name || 'null',
      isLoading,
      isGuestMode,
      isAuthenticated
    });
  }, [selectedUser, isLoading, isGuestMode, isAuthenticated]);

  // אם טוען – מציג מסך טעינה
  if (isLoading) {
    console.log('🧭 MainNavigator - Showing loading screen');
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

  // If not authenticated and not in guest mode - show login screen
  if (!isAuthenticated && !isGuestMode) {
    console.log('🧭 MainNavigator - User not authenticated, showing LoginScreen');
  } else {
    console.log('🧭 MainNavigator - User authenticated or guest mode, showing HomeStack');
  }
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={"LoginScreen"}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeStack" component={HomeStack} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
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
      {/* Screen we see that opens when user looks at another user */}
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
      <Stack.Screen name="DiscoverPeopleScreen" component={DiscoverPeopleScreen} />
    </Stack.Navigator>
  );
}