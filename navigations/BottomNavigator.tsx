// BottomNavigator.tsx
'use strict';
import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "../bottomBarScreens/SearchScreen";
import ProfileScreen from "../bottomBarScreens/ProfileScreen";
import HomeScreen from "../bottomBarScreens/HomeScreen"; // This is your HomeScreen with the drag handle
import DonationsStack from "./DonationsStack"; // Assuming this is another stack navigator
// import UsersScreen from "../bottomBarScreens/UsersScreen"; // הסתרה לבדיקות
import BookmarksScreen from "../bottomBarScreens/BookmarksScreen";
import styles from "../globals/styles"; // Adjust path if needed
import colors from "../globals/colors"; // Adjust path if needed
import { useUser } from "../context/UserContext";

// Define the type for your bottom tab navigator's route names and their parameters.
export type BottomTabNavigatorParamList = {
  DonationsScreen: undefined; // Assuming DonationsStack is just a wrapper for its root screen here
  HomeScreen: undefined;
  SearchScreen: undefined;
  ProfileScreen: undefined;
  // UsersScreen: undefined; // הסתרה לבדיקות
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
  const { isGuestMode } = useUser();
  
  /**
   * Helper function to determine the Ionicons name based on the route and focus state.
   * @param {string} routeName - The name of the current route.
   * @param {boolean} focused - True if the tab is currently focused.
   * @returns {string} The Ionicons icon name (e.g., "home" or "home-outline").
   */
  const getTabBarIconName = (routeName: keyof BottomTabNavigatorParamList, focused: boolean): string => {
    switch (routeName) {
      case "HomeScreen":
        return focused ? "home" : "home-outline";
      case "SearchScreen":
        return focused ? "search" : "search-outline";
      case "DonationsScreen":
        return focused ? "heart" : "heart-outline";
      case "ProfileScreen":
        return focused ? "person" : "person-outline";
      // case "UsersScreen": // הסתרה לבדיקות
      //   return focused ? "people" : "people-outline";

      // case "LocationSearchScreen": // Uncomment if you add this screen to the navigator
      //   return focused ? "globe" : "globe-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <View style={styles.container_bottom_nav}>
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={({ route }): BottomTabNavigationOptions => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
            const iconName = getTabBarIconName(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.bottomNavActive,
          tabBarInactiveTintColor: colors.bottomNavInactive,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            left: 20,
            right: 20,
            borderRadius: 25,
            elevation: 8,
            height: 40,
            backgroundColor: colors.bottomNavBackground,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 6,
          },
        })}
      >
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="DonationsScreen" component={DonationsStack} />
        {/* <Tab.Screen name="UsersScreen" component={UsersScreen} /> הסתרה לבדיקות */}
        {!isGuestMode && <Tab.Screen name="ProfileScreen" component={ProfileScreen} />}
      </Tab.Navigator>
    </View>
  );
}