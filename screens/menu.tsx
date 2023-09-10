import * as React from "react";
import { View, Text, Button } from 'react-native';
import {RootStackParamList} from "./bottom"

import { NavigationProp } from '@react-navigation/native'; // Import both RouteProp and NavigationProp


// type ProfileScreenProps = {
//   navigation: NavigationProp<RootStackParamList, 'Login'>; // Replace YourParamList with your actual param list
// };

function menu({ navigation }: {navigation: any} ) {
  return (
    <div>
        <Text>menu</Text>
        {/* <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')} // Assuming you have a 'Login' screen defined
        /> */}
    </div>
  );
}

export default menu;
