// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// // import Home from "../home";
// // import Settings from "../settings";
// // import Profile from "../profile";

// const Tab = createBottomTabNavigator();

// function bottom() {
//   return (
//     <Tab.Navigator>
//       <Tab.Screen name="Home" component={Home} />
//       <Tab.Screen name="Settings" component={Settings} />
//     </Tab.Navigator>
//   );
// }
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../home'; // Update the file path
import SettingsScreen from '../settings'; // Update the file path


const Tab = createBottomTabNavigator();
function Bottom() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default Bottom