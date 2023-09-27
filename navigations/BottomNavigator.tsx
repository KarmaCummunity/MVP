import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import DonationsScreen from "../screens/DonationsScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import {StyleSheet, View } from 'react-native';
const Tab = createBottomTabNavigator();

function BottomNavigator() {
    return (
      <View style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="DonationsScreen" component={DonationsScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
      </View>
    );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes the container take up the entire screen height
    justifyContent: 'flex-end', // Positions content at the top and bottom
  },
  content: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -100,
  },

});
export default BottomNavigator;