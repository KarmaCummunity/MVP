import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Bottom from "./screens/bottom/bottom"


export default function App() {
  return (
    <NavigationContainer>
      <Bottom />
    </NavigationContainer>
  );
}













// import * as React from "react";
// import { View, Text, Button } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";

// export type RootStackParamList = {
//   Home: undefined;
//   Settings: undefined;
//   Profile: undefined;
// };

// type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// const HomeScreen: React.FC<HomeScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Button title='Go to Profile' onPress={() => props.navigation.push("Profile")} />
//       <Button title='Go to Settings' onPress={() => props.navigation.push("Settings")} />
//     </View>
//   );
// };

// type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;

// const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Settings Screen</Text>
//       <Button title='Go to Profile' onPress={() => props.navigation.push("Profile")} />
//     </View>
//   );
// };

// type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

// const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Profile Screen</Text>
//       <Button title='Go to Settings' onPress={() => props.navigation.push("Settings")} />
//     </View>
//   );
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name='Home' component={HomeScreen} />
//         <Stack.Screen name='Profile' component={ProfileScreen} />
//         <Stack.Screen name='Settings' component={SettingsScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default App;
// import React from "react";
// import AppNavigator from "./AppNavigator";

// export default function App() {
//   return <AppNavigator />;
// }

// import * as React from "react";
// import { View, Text, Button } from "react-native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../AppNavigator"

// type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

// const Home: React.FC<HomeScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Button title='Go to Profile' onPress={() => props.navigation.push("Profile")} />
//       <Button title='Go to Settings' onPress={() => props.navigation.push("Settings")} />
//     </View>
//   );
// };

// export default Home;

// import * as React from 'react';
// import { Text, View } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// function HomeScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Home!</Text>
//     </View>
//   );
// }

// function SettingsScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Settings!</Text>
//     </View>
//   );
// }

// const Tab = createBottomTabNavigator();

// function MyTabs() {
//   return (
//     <Tab.Navigator>
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Settings" component={SettingsScreen} />
//     </Tab.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <NavigationContainer>
//       <MyTabs />
//     </NavigationContainer>
//   );
// }

