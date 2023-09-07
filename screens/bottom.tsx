import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './profile'; // Update the file path
import Search from './search'; // Update the file path
import Home from './home'; // Update the file path
import Login from './login'; // Update the file path

export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    Profile: undefined;
    Login: undefined;
  };
  
const Tab = createBottomTabNavigator();
function Bottom() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Login" component={Login} />
    </Tab.Navigator>
  );
}

export default Bottom