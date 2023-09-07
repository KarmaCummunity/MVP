

import React from 'react';
import { View, Text, Button } from 'react-native';
import {RootStackParamList} from "./bottom"

import { NavigationProp } from '@react-navigation/native'; // Import both RouteProp and NavigationProp


type ProfileScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Profile'>; // Replace YourParamList with your actual param list
};

function ProfileScreen({ navigation }: ProfileScreenProps) {
  return (
    <View>
      <Text>Profile</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')} // Assuming you have a 'Login' screen defined
      />
    </View>
  );
}

export default ProfileScreen;
