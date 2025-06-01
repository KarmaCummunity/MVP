import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from "../screens/HomeScreen";
import DonationsScreen from "../screens/DonationsScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from 'react-native';

const Tab = createBottomTabNavigator();

function BottomNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';

            if (route.name === 'Home1Screen') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'SearchScreen') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'DonationsScreen') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'ProfileScreen') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,  // <-- hides the text labels under icons
        })}
      >
        <Tab.Screen name="Home1Screen" component={HomeScreen} />
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="DonationsScreen" component={DonationsScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default BottomNavigator;
