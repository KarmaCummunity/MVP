import ChatScreen from '../screens/ChatScreen';
import Home from '../screens/Home';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={Home} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}
