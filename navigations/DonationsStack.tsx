import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import DonationsScreen from "../bottomBarScreens/DonationsScreen";
import MoneyScreen from "../donationScreens/MoneyScreen";
import TimeScreen from "../donationScreens/TimeScreen";
import KnowledgeScreen from "../donationScreens/KnowledgeScreen";
import TrumpScreen from "../donationScreens/TrumpScreen";
import { DonationsStackParamList } from "../globals/types";

const Stack = createStackNavigator<DonationsStackParamList>();

export default function DonationsStack() {
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('💰 DonationsStack - Navigator focused, checking state...');
      // This will trigger re-renders of child screens when needed
    }, [])
  );

  return (
    <Stack.Navigator
      initialRouteName="DonationsScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DonationsScreen" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen" component={MoneyScreen} />
      <Stack.Screen name="TimeScreen" component={TimeScreen} />
      <Stack.Screen name="KnowledgeScreen" component={KnowledgeScreen} />
      <Stack.Screen name="TrumpScreen" component={TrumpScreen} />
    </Stack.Navigator>
  );
}
