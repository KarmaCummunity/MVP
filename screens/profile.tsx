import React from 'react';
import { View, Text, Button } from 'react-native';
import {RootStackParamList} from "./bottom"

import { NavigationProp } from '@react-navigation/native'; // Import both RouteProp and NavigationProp


// type ProfileScreenProps = {
//   navigation: NavigationProp<RootStackParamList, 'NavLogin'>; // Replace YourParamList with your actual param list
// };



type ProfileProps = {
  navigation: NavigationProp<RootStackParamList, 'Menu'>; // Replace YourParamList with your actual param list
};


function ProfileScreen({ navigation }: ProfileProps) {
  return (
    <View>
      <Text>Profile</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Menu')} // Assuming you have a 'Login' screen defined
      />
    </View>
  );
}

export default ProfileScreen;

// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';

// import Register from './register'; // Update the file path


// const Stack = createStackNavigator();

// function ProfileScreen() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="Register"
//         component={Register}
//         options={{ headerShown: false }} // Hide the header for the Profile screen
//       />
//     </Stack.Navigator>
//   );
// }
// export default ProfileScreen;
