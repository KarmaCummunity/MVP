import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from './profile'; // Update the file path
import Search from './search'; // Update the file path
import Home from './home'; // Update the file path
import NavLogin from './navLogin'; // Update the file path
import Menu from './menu'; // Update the file path

export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    Profile: undefined;
    NavLogin: undefined;
    Menu: undefined;
  };
  
const Tab = createBottomTabNavigator();
function Bottom() {
  return (
    <Tab.Navigator
    screenOptions={({navigation}) => (getScreenOptions(navigation))}>
        
      <Tab.Screen name="NavLogin" component={NavLogin}  options={{headerShown: true, tabBarStyle: { display: "none" }  }} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Search" component={Search} />
    </Tab.Navigator>
  );
}
function getScreenOptions(navigation: any) {
    return (
        {
            swipeEdgeWidth: 0,
            labelStyle: {color: "white"},
            drawerPosition: "right",
            drawerStyle: {
                backgroundColor: '#d3e0d1',
                width: 300,
            },
            headerStyle: {
                backgroundColor: '#d9f3cb',
            },
            headerTintColor: '#425746',
            headerTitleStyle: {
                fontSize: 30,
                fontFamily: 'Heebo-bold',
                paddingLeft:5,
                paddingRight:5,
                textShadowOffset: {width: 0, height: 0},
                textShadowColor:'white',
                textShadowRadius:10,
            },
        }
    )
}
export default Bottom