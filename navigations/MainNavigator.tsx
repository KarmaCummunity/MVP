import { createStackNavigator } from "@react-navigation/stack";

import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import TopBarNavigator from "./TopBarNavigator";
import Home from "../screens/Home";
import ChatScreen from "../screens/ChatScreen";



const Stack = createStackNavigator();

function MainNavigator() {

    return (
        <Stack.Navigator initialRouteName="FirstScreen">
          <Stack.Screen name="FirstScreen" component={FirstScreen}
           options={{ headerShown: false }} />

          <Stack.Screen name="LoginScreen" component={LoginScreen} />

          <Stack.Screen name="Home" component={Home}
           options={({ navigation }) => ({header: () => <TopBarNavigator title="Home" navigation={navigation} />,})}/>
         
          <Stack.Screen name="ChatScreen" component={ChatScreen}
           options={({ navigation }) => ({header: () => <TopBarNavigator title="Home" navigation={navigation} />,})}/>
        
        </Stack.Navigator>
    );
}

export default MainNavigator;