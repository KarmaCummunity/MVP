// import * as React from "react";
// import { View, Text, Button } from "react-native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../AppNavigator"

// type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;

// const Settings: React.FC<SettingsScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Settings Screen</Text>
//       <Button title='Go to Profile' onPress={() => props.navigation.push("Profile")} />
//     </View>
//   );
// };
// export default Settings;


import React from 'react';
import { Text, View } from 'react-native';

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

export default SettingsScreen;
