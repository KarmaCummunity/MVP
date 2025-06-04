import ChatScreen from '../topBarScreens/ChatScreen';
import Home from '../navigations/Home';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}
