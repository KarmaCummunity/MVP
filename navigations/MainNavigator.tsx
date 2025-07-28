import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack";
import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import PostsReelsScreen from "../components/PostsReelsScreen";
import { RootStackParamList } from '../globals/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="InactiveScreen" component={InactiveScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen
        name="PostsReelsScreen"
        component={PostsReelsScreen}
        options={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          presentation: 'transparentModal',
        }}
      />
    </Stack.Navigator>
  );
}