import DonationsScreen from '../bottomBarScreens/DonationsScreen';
import TrumpScreen from '../donationScreens/TrumpScreen';
import MoneyScreen from '../donationScreens/MoneyScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DonationsMainScreen" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen"         component={MoneyScreen} />
      <Stack.Screen name="TrumpScreen"         component={TrumpScreen} />
    </Stack.Navigator>
  );
}
