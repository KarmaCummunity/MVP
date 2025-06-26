import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack";
import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import LocationSearchComp from "../components/LocationSearchComp";
import Next_Home_Screen from "../bottomBarScreens/Next_Home_Screen";
const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
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
      <Stack.Screen name="InactiveScreen" component={InactiveScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      {/* <Stack.Screen name="LocationSearchComp" component={LocationSearchComp} /> */}
      {/* Add other screens as needed */}
    </Stack.Navigator>
  );
}
