import Home from "../screens/Home";
import DonationsScreen from "../screens/DonationsScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Icon from 'react-native-vector-icons/Ionicons';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";


const Tab = createBottomTabNavigator();

function BottomNavigator() {

    return (
    <Tab.Navigator>

      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: () => <Icon name="ios-home" size={24} color="black" />,
          headerShown: false,}}/>

      <Tab.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{
          tabBarIcon: () => <Icon name="ios-search" size={24} color="black" />,
          headerShown: false,}}/>

      <Tab.Screen
        name="DonationsScreen"
        component={DonationsScreen}
        options={{
          tabBarIcon: () => <Icon name="ios-heart" size={24} color="black" />,
          headerShown: false,}}/>
          
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{tabBarIcon: () => <Icon name="ios-person" size={24} color="black" />,
        headerShown: false,}}/>

    </Tab.Navigator>    
    );
}

export default BottomNavigator;