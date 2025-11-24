// File overview:
// - Purpose: Stack navigator for admin screens (dashboard, money management, people, review).
// - Reached from: `BottomNavigator` -> Tab 'AdminTab' (only visible to admins).
// - Provides: Admin dashboard and management screens.
// - Header: Uses `TopBarNavigator`; can be hidden per-screen with route param `hideTopBar`.
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminMoneyScreen from "../screens/AdminMoneyScreen";
import AdminPeopleScreen from "../screens/AdminPeopleScreen";
import AdminReviewScreen from "../screens/AdminReviewScreen";
import AdminTasksScreen from "../screens/AdminTasksScreen";
import TopBarNavigator from "./TopBarNavigator";
import { AdminStackParamList } from "../globals/types";

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  useFocusEffect(
    React.useCallback(() => {
      console.log('🛡️ AdminStack - Navigator focused');
    }, [])
  );

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="AdminDashboard"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <TopBarNavigator
            navigation={navigation as any}
            hideTopBar={(route?.params as any)?.hideTopBar === true}
          />
        ),
      })}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminMoney" component={AdminMoneyScreen} />
      <Stack.Screen name="AdminPeople" component={AdminPeopleScreen} />
      <Stack.Screen name="AdminReview" component={AdminReviewScreen} />
      <Stack.Screen name="AdminTasks" component={AdminTasksScreen} />
    </Stack.Navigator>
  );
}

