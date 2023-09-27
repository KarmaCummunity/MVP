import { createStackNavigator } from "@react-navigation/stack";
import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import BottomNavigator from "./BottomNavigator";
import TopBarNavigator from "./TopBarNavigator";
import Home from "../screens/Home";
import ChatScreen from "../screens/ChatScreen";

const Stack = createStackNavigator();

function MainNavigator() {
    return (
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="BottomNavigator" component={BottomNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="TopBarNavigator" component={TopBarNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default MainNavigator;