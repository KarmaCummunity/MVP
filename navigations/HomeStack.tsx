import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import Home from "./Home";
import TopBarNavigator from "./TopBarNavigator";
import { RootStackParamList } from "../globals/types";

const Stack = createStackNavigator<RootStackParamList>();

export default function HomeStack() {
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 HomeStack - Navigator focused, checking state...');
      // This will trigger re-renders of child screens when needed
    }, [])
  );

  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="TopBarNavigator" component={TopBarNavigator} />
    </Stack.Navigator>
  );
}
