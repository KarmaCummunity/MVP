// BottomNavigator.tsx
'use strict';
import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import HomeTabStack from "./HomeTabStack";
import SearchTabStack from "./SearchTabStack";
import ProfileTabStack from "./ProfileTabStack";
import DonationsStack from "./DonationsStack"; 
import BookmarksScreen from "../screens/BookmarksScreen";
import SettingsScreen from "../topBarScreens/SettingsScreen";
import ChatListScreen from "../topBarScreens/ChatListScreen";
import AboutKarmaCommunityScreen from "../topBarScreens/AboutKarmaCommunityScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import colors from "../globals/colors"; // Adjust path if needed
import { vw, getScreenInfo, isLandscape } from "../globals/responsive";
import { LAYOUT_CONSTANTS } from "../globals/constants";
import { useUser } from "../context/UserContext";

// Define the type for your bottom tab navigator's route names and their parameters.
export type BottomTabNavigatorParamList = {
  DonationsScreen: undefined;
  HomeScreen: undefined;
  SearchScreen: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  ChatListScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  NotificationsScreen: undefined;
};

// Create an instance of the Bottom Tab Navigator with its parameter list type
const Tab = createBottomTabNavigator<BottomTabNavigatorParamList>();

/**
 * BottomNavigator Component.
 *
 * This component sets up the main bottom tab navigation for the application.
 * It defines the screens accessible via the tab bar, their icons, and the
 * overall styling and behavior of the tab bar itself, including responsive
 * positioning and shadow effects.
 *
 * @returns {React.FC} A React component rendering the Bottom Tab Navigator.
 */
export default function BottomNavigator(): React.ReactElement {
  console.log('📱 BottomNavigator - Component rendered');
  const { isGuestMode, resetHomeScreen } = useUser();
  const navigation = useNavigation();
  
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BottomNavigator - Navigator focused, checking state...');
      // This will trigger re-renders of child screens when needed
    }, [])
  );



  /**
   * Helper function to determine the Ionicons name based on the route and focus state.
   * @param {string} routeName - The name of the current route.
   * @param {boolean} focused - True if the tab is currently focused.
   * @returns {string} The Ionicons icon name (e.g., "home" or "home-outline").
   */
  const getTabBarIconName = (routeName: keyof BottomTabNavigatorParamList, focused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case "HomeScreen":
        return focused ? "home" : "home-outline";
      case "SearchScreen":
        return focused ? "search" : "search-outline";
      case "DonationsScreen":
        return focused ? "heart" : "heart-outline";
      case "ProfileScreen":
        return focused ? "person" : "person-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getActiveNestedParams = (route: any): Record<string, any> | undefined => {
    const state = route.state ?? route.params?.state;
    if (!state) return route.params;
    const nestedRoute = state.routes?.[state.index ?? 0];
    if (nestedRoute) return getActiveNestedParams(nestedRoute);
    return route.params;
  };

  return (
      <Tab.Navigator
        id={undefined}
        initialRouteName="HomeScreen"
        screenOptions={({ route }): BottomTabNavigationOptions => {
          const activeParams = getActiveNestedParams(route as any) || {};
          const hideBottomBar = activeParams.hideBottomBar === true;
          const { isTablet, isDesktop } = getScreenInfo();
          const landscape = isLandscape();
          const horizontalInset = isDesktop ? vw(20) : isTablet ? vw(10) : LAYOUT_CONSTANTS.SPACING.MD;
          const barHeight = landscape ? 40 : (isDesktop ? 56 : isTablet ? 54 : 46);
          return ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number; }) => {
              const iconName = getTabBarIconName(route.name, focused);
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.bottomNavActive,
            tabBarInactiveTintColor: colors.bottomNavInactive,
            tabBarShowLabel: false,
            tabBarStyle: {
              position: "absolute",
              left: horizontalInset,
              right: horizontalInset,
              borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.XLARGE,
              elevation: LAYOUT_CONSTANTS.SHADOW.MEDIUM.elevation,
              height: barHeight,
              backgroundColor: colors.bottomNavBackground,
              display: hideBottomBar ? 'none' as const : 'flex' as const,
            },
          });
        }}
      >
        {!isGuestMode && <Tab.Screen name="ProfileScreen" component={ProfileTabStack} />}
        <Tab.Screen name="DonationsScreen" component={DonationsStack} />
        <Tab.Screen name="SearchScreen" component={SearchTabStack} />
        <Tab.Screen 
          name="HomeScreen" 
          component={HomeTabStack}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              console.log('🏠 HomeScreen - Tab button pressed (even if already on home screen)');
              resetHomeScreen();
            },
          })}
        />
      
      </Tab.Navigator>
  );
}