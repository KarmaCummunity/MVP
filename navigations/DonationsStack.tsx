import DonationsScreen from '../bottomBarScreens/DonationsScreen';
import MoneyScreen from '../screens/MoneyScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DonationsScreen1" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen"     component={MoneyScreen} />
    </Stack.Navigator>
  );
}
