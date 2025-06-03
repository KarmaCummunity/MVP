import DonationsScreen from '../screens/DonationsScreen';
import MoneyScreen from '../screens/MoneyScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DonationsScreen" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen"     component={MoneyScreen} />
    </Stack.Navigator>
  );
}
