import DonationsScreen from '../bottomBarScreens/DonationsScreen';
import TrumpScreen from '../donationScreens/TrumpScreen';
import MoneyScreen from '../donationScreens/MoneyScreen';
import KnowledgeScreen from '../donationScreens/KnowledgeScreen';
import TimeScreen from '../donationScreens/TimeScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function DonationsStack() {
  console.log('🎯 DonationsStack - Component rendered');
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DonationsMain" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen" component={MoneyScreen} />
      <Stack.Screen name="TrumpScreen" component={TrumpScreen} />
      <Stack.Screen name="KnowledgeScreen" component={KnowledgeScreen} />
      <Stack.Screen name="TimeScreen" component={TimeScreen} />
    </Stack.Navigator>
  );
}
