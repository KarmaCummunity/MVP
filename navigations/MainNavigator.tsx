import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import BottomNavigator from "./BottomNavigator";
import ChatScreen from "../screens/ChatScreen";
import TopBarNavigator from "./TopBarNavigator";
import SettingsScreen from "../screens/SettingsScreen";
import AboutScreen from "../screens/AboutScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

import { createStackNavigator } from "@react-navigation/stack";


const Stack = createStackNavigator();

function MainNavigator() {

    return (
        <Stack.Navigator>

          <Stack.Screen name="BottomNavigator" component={BottomNavigator} 
          options={{headerShown: false}}/>
          
          <Stack.Screen name="FirstScreen" component={FirstScreen}
           options={{ headerShown: false }} />

          <Stack.Screen name="LoginScreen" component={LoginScreen} />

          <Stack.Screen name="ChatScreen" component={ChatScreen}
           options={{header: () => <TopBarNavigator title="Chat"/>}}/>

          <Stack.Screen name="AboutScreen" component={AboutScreen}
           options={{header: () => <TopBarNavigator title="About"/>}}/>

          <Stack.Screen name="NotificationsScreen" component={NotificationsScreen}
           options={{header: () => <TopBarNavigator title="Notifications"/>}}/>

          <Stack.Screen name="SettingsScreen" component={SettingsScreen}
           options={{header: () => <TopBarNavigator title="Settings"/>}}/>  
                    
        </Stack.Navigator>
    );
}

export default MainNavigator;