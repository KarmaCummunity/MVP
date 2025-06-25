import React from "react";
import { View, Platform, StyleSheet } from "react-native"; // Add StyleSheet if needed for local styles
import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { RouteProp } from '@react-navigation/native'; // Import RouteProp
import Ionicons from "react-native-vector-icons/Ionicons";
// Import your screen components and global styles/colors
import SearchScreen from "../bottomBarScreens/SearchScreen";
import ProfileScreen from "../bottomBarScreens/ProfileScreen";
import HomeScreen from "../bottomBarScreens/HomeScreen";
import TodoListScreen from "../bottomBarScreens/TodoListScreen";
import DonationsStack from "./DonationsStack"; // Assuming this is a Stack Navigator for donations
import styles from "../globals/styles"; // Global styles
import colors from "../globals/colors"; // Assuming this file exists and defines `primary` and `backgroundPrimary`

// 1. Define the type for your bottom tab navigator's route names and their parameters.
// If a screen doesn't expect any parameters, use `undefined`.
export type BottomTabNavigatorParamList = {
  DonationsScreen: undefined;
  TodoListScreen: undefined;
  HomeScreen: undefined;
  SearchScreen: undefined;
  ProfileScreen: undefined;
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
      case "TodoListScreen":
        return focused ? "checkbox" : "checkbox-outline";
      default:
        // Fallback icon for any unhandled routes (should not happen if all cases are covered)
        return "help-circle-outline";
    }
  };

  return (
    // The parent View must have 'flex: 1' to ensure the navigator fills the entire screen
    // and correctly positions the absolutely placed tab bar at the bottom.
    <View style={styles.container_bottom_nav}>
      <Tab.Navigator
        // Explicitly set the initial route name. This screen will be active on app start.
        initialRouteName="DonationsScreen" // Adjust to "DonationsScreen" or your desired default
        screenOptions={({ route }): BottomTabNavigationOptions => ({
          headerShown: false, // Hide the header for all screens within this tab navigator
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
            // Retrieve the appropriate icon name using the helper function
            const iconName = getTabBarIconName(route.name, focused);

            // Log for debugging: Shows which route's icon is being processed and its focus state
            // Remove or comment out this console.log in production builds for performance.
            // console.log(`Processing icon for route: ${route.name}, Focused: ${focused}, Icon: ${iconName}`);

            return <Ionicons name={iconName} size={size} color={color} />;
          },

          // Customize the tint color of active and inactive tab icons.
          // Fallback to '#007AFF' (blue) if colors.primary is not defined.
          tabBarActiveTintColor: colors.black, // Type assertion for colors
          tabBarInactiveTintColor: "gray", // A clearly visible gray for inactive icons
          tabBarShowLabel: false, // Hide the text labels under the icons for a cleaner look

          // Styles for the tab bar container itself.
          tabBarStyle: {
            position: "absolute", // Position the tab bar absolutely for a floating effect
            bottom: 0,            // Anchor to the bottom edge
            left: 0,              // Anchor to the left edge
            right: 0,             // Anchor to the right edge

            borderTopLeftRadius: 20,  // Apply rounded corners to the top-left
            borderTopRightRadius: 20, // Apply rounded corners to the top-right

            // Android-specific shadow (elevation)
            elevation: 5,

            // iOS-specific shadow properties
            shadowOpacity: 0.2,       // Corrected from 10 to a valid range (0-1) for visibility
            shadowOffset: { width: 0, height: -2 }, // Shadow direction (from top edge)
            shadowRadius: 4,          // Blur radius of the shadow

            height: 60, // Increased height for better visual presence and easier tapping
            backgroundColor: (colors as { backgroundPrimary: string }).backgroundPrimary || 'white', // Type assertion for colors, fallback to white

            // Adjust padding for safe areas on iOS devices (e.g., iPhone with notch)
            paddingBottom: Platform.OS === 'ios' ? 15 : 5,
          },
        })}
      >
        {/*
          Define each screen that will be part of the bottom tab navigation.
          The order here also dictates the order of tabs visually, from left to right.
        */}
        <Tab.Screen name="DonationsScreen" component={DonationsStack} />
        <Tab.Screen name="TodoListScreen" component={TodoListScreen} />
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}