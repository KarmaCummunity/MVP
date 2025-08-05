import ChatScreen from "../topBarScreens/ChatScreen";
import Home from "../navigations/Home";
import { createStackNavigator } from "@react-navigation/stack";
import ChatListScreen from "../topBarScreens/ChatListScreen";
import ChatDetailScreen from "../screens/ChatDetailScreen";
import SettingsScreen from "../topBarScreens/SettingsScreen";
import AboutKarmaCommunityScreen from "../topBarScreens/AboutKarmaCommunityScreen";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }} // Hide default header
      />
      <Stack.Screen
        name="ChatDetailScreen"
        component={ChatDetailScreen}
        options={{ headerShown: false }} // Hide default header
      />
      <Stack.Screen
        name="SettingsScreen" // <-- Define the name for your Settings screen
        component={SettingsScreen}
        options={{ headerShown: false }} // We custom-build the header
      />
      <Stack.Screen
        name="AboutKarmaCommunityScreen"
        component={AboutKarmaCommunityScreen}
        options={{ title: "אודות קהילת קארמה" }}
      />
    </Stack.Navigator>
  );
}
