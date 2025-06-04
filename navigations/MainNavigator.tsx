import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack";
import InactiveScreen from "../screens/InactiveScreen"; // ודא שהנתיב נכון

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FirstScreen"
        component={FirstScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="InactiveScreen" component={InactiveScreen} />

    </Stack.Navigator>
  );
}
