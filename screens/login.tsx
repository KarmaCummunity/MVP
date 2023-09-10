import * as React from "react";
// import {RootStackParamList} from "./bottom"
import { View, Text, Button } from 'react-native';

import { NavigationProp } from '@react-navigation/native'; // Import both RouteProp and NavigationProp

export type RootStackParamList = {
    Login: undefined;
    Register: undefined
    Profile: undefined;
  };

type loginProps = {
  navigation: NavigationProp<RootStackParamList, 'Register'>; // Replace YourParamList with your actual param list
};

function login({ navigation }: loginProps) {
  return (
    <div>
        <Text>login</Text>
        <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Register')} // Assuming you have a 'Login' screen defined
        />
        <Button
        title="Go to profile"
        onPress={() => navigation.navigate('Profile')} // Assuming you have a 'Login' screen defined
      />
    </div>
  );
}

export default login;
