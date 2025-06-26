import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "../bottomBarScreens/SearchScreen";
import ProfileScreen from "../bottomBarScreens/ProfileScreen";
import HomeScreen from "../bottomBarScreens/HomeScreen";
import TodoListScreen from "../bottomBarScreens/TodoListScreen";
import DonationsStack from "./DonationsStack";
import styles from "../globals/styles";
import colors from "../globals/colors";

// Define the type for your bottom tab navigator's route names and their parameters.
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
      // case "LocationSearchScreen":
      //   return focused ? "globe" : "globe-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <View style={styles.container_bottom_nav}>
      <Tab.Navigator
        initialRouteName="DonationsScreen"
        screenOptions={({ route }): BottomTabNavigationOptions => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
            const iconName = getTabBarIconName(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.black,
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 5,
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 4,
            height: 45,
            backgroundColor: (colors as { backgroundPrimary: string }).backgroundPrimary || 'white',
            paddingBottom: Platform.OS === 'ios' ? 15 : 5,
          },
        })}
      >
        <Tab.Screen name="DonationsScreen" component={DonationsStack} />
        <Tab.Screen name="TodoListScreen" component={TodoListScreen} />
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}