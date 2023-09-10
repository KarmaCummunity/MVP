import * as React from "react";
import { View, Text, Button } from 'react-native';
// import {RootStackParamList} from "./bottom"

import { NavigationProp } from '@react-navigation/native'; // Import both RouteProp and NavigationProp

export type RootStackParamList = {
    Login: undefined;
    Register: undefined
  };


type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Login'>; // Replace YourParamList with your actual param list
};

function register({ navigation }: ProfileScreenProps) {
  return (
    <div>
        <Text>register</Text>
        <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')} // Assuming you have a 'Login' screen defined
        />
    </div>
  );
}

export default register;
