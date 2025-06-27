// //MainNavigator.tsx
// 'use strict';

// import FirstScreen from "../screens/FirstScreen";
// import LoginScreen from "../screens/LoginScreen";
// import { createStackNavigator } from "@react-navigation/stack";
// import HomeStack from "./HomeStack";
// import InactiveScreen from "../screens/InactiveScreen";
// import WebViewScreen from "../screens/WebViewScreen";
// import PostsReelsScreen from "../bottomBarScreens/PostsReelsScreen";
// import { RootStackParamList } from '../globals/types'; 
// const Stack = createStackNavigator();

// export default function MainNavigator() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="Home"
//         component={HomeStack}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="FirstScreen"
//         component={FirstScreen}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="LoginScreen"
//         component={LoginScreen}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen name="InactiveScreen" component={InactiveScreen} />
//       <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
//       {/* <Stack.Screen name="LocationSearchComp" component={LocationSearchComp} /> */}
//       {/* Add other screens as needed */}
//       <Stack.Screen
//         name="PostsReelsScreen" // The name you'll use to navigate to this modal
//         component={PostsReelsScreen}
//         options={{
//           headerShown: false, // No header for your full-screen modal
//           cardStyle: { backgroundColor: 'transparent' }, // Allows content behind to be seen initially
//           presentation: 'transparentModal', // Crucial for the transparent overlay effect
//         }}
//       />
//     </Stack.Navigator>
//   );
// }


// MainNavigator.tsx
'use strict';

import FirstScreen from "../screens/FirstScreen";
import LoginScreen from "../screens/LoginScreen";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack"; // Assuming this is your BottomTabNavigator
import InactiveScreen from "../screens/InactiveScreen";
import WebViewScreen from "../screens/WebViewScreen";
import PostsReelsScreen from "../components/PostsReelsScreen";
// Make sure the path to your RootStackParamList type definition is correct
import { RootStackParamList } from '../globals/types'; 

// Apply the RootStackParamList to createStackNavigator
const Stack = createStackNavigator<RootStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FirstScreen"
        component={FirstScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="InactiveScreen" component={InactiveScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      {/* <Stack.Screen name="LocationSearchComp" component={LocationSearchComp} /> */}
      {/* Add other screens as needed */}
      <Stack.Screen
        name="PostsReelsScreen" // This name must match a key in RootStackParamList
        component={PostsReelsScreen}
        options={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          presentation: 'transparentModal',
        }}
      />
    </Stack.Navigator>
  );
}