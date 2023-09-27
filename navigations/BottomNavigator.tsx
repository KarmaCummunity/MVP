import HomeScreen from "../screens/HomeScreen";
import DonationsScreen from "../screens/DonationsScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

import styles from "../styles";

const Tab = createBottomTabNavigator();


function BottomNavigator() {

  const insets = useSafeAreaInsets();

    return (
      <View style={[styles.bottomContainer, { paddingTop: insets.bottom }]}>
      <Tab.Navigator>
        <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}/>
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="DonationsScreen" component={DonationsScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
      </View>
    );
}

export default BottomNavigator;