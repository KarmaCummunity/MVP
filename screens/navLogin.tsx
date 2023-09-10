import React from 'react';
import Login from './login'; // Import your screen components
import Register from './register'; // Update the file path
import { createStackNavigator } from '@react-navigation/stack';
import { Button, TouchableOpacity } from 'react-native'; // Import TouchableOpacity for button behavior
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon component
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import the icon component
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu from './menu';


const Stack = createStackNavigator();

const NavLogin = ({navigation}: {navigation: any}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: true,
          title: 'KC', // Set a custom title
          headerTitleAlign: 'center',
          headerStyle: {
            display: "flex",
            flexDirection: "row",
            direction: "ltr",
            backgroundColor: '#CB997E', // Change the header background color
          },
          headerTintColor: 'white', // Change the header text color
          headerTitleStyle: {
            fontWeight: 'bold', // Change the title's text style
          },
          headerRight: () => (
            <TouchableOpacity
            onPress={() => {
              alert("settings")
            }}
            style={{ marginRight: 15, flexDirection: 'row' }}
          >
            <Icon style={{marginEnd: 10}} name="info-circle" size={24} color="black" />
            <Icon style={{marginEnd: 10}} name="cog" size={24} color="black" />
          </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
            onPress={() => {
                navigation.navigate('Menu')
            }}
            style={{ marginLeft: 15, flexDirection: 'row' }}
          >
            <MaterialIcons style={{marginEnd: 10}} name="notifications-on" size={24} color="black" />
            <MaterialCommunityIcons style={{marginEnd: 10}} name="chat-processing" size={24} color="black" />
          </TouchableOpacity>
          ),
        }}
      />
      {/* <Stack.Screen name="Login" component={Login} /> */}
      {/* Add more screens for the profile section */}
    </Stack.Navigator>
  );
};

export default NavLogin;





// //import {IconButton} from "react-native-paper";
// //import ForgotPassword from "../screens/forgotPassword";
// import Login from "./navLogin";
// import Register from "./register";
// //import NewPasswordScreen from "../screens/new-password";
// //import VerifyMail from "../screens/verify-mail";
// import {createDrawerNavigator} from "@react-navigation/drawer";
// //import FirstHomePageScreen from "../screens/first-home-page-app-screen";
// import {Image, Platform, StyleSheet} from "react-native";
// //import headerBackground from '../assets/bg.png';
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';

// const NavLogin = () => {
//     const Drawer = createDrawerNavigator();

//     return (
//         // <Drawer.Navigator
//         //     // screenOptions={({navigation}) => (getScreenOptions(navigation))}
//         //     initialRouteName="Home"
//         //     backBehavior={'history'}>
//         //     <Drawer.Screen
//         //         options={{title: 'כניסה'}}
//         //         name="Login"
//         //         component={Login}/>
//         //     <Drawer.Screen
//         //         options={{title: 'הרשמה'}}
//         //         name="Registration"
//         //         component={Register}/>
//         //  </Drawer.Navigator>
//         <NavigationContainer>
//         <Drawer.Navigator
//           initialRouteName="Home"
//           drawerPosition="left" // or "right" as needed
//           drawerStyle={{
//               // Your custom drawer styles
//               backgroundColor: 'white',
//               width: 250, // Adjust the width as needed
//             }}
//             drawerContentOptions={{
//                 swipeEdgeWidth: 50,
//                 labelStyle: {
//                     color: 'black',
//                 },
//             // Other options...
//           }}
//           >
//           <Drawer.Screen name="Home" component={Login} />
//           <Drawer.Screen name="Profile" component={Register} />
//         </Drawer.Navigator>
//       </NavigationContainer>
//     )
// }
// export default NavLogin;

// function getScreenOptions(navigation) {
//     return (
//         {
//             swipeEdgeWidth: 0,
//             labelStyle: {color: "white"},
//             drawerPosition: "right",
//             drawerStyle: {
//                 backgroundColor: '#d3e0d1',
//                 width: 300,
//             },
//             headerStyle: {
//                 backgroundColor: '#d9f3cb',
//             },
//             headerTintColor: '#425746',
//             headerTitleStyle: {
//                 fontSize: 30,
//                 fontFamily: 'Heebo-bold',
//                 paddingLeft:5,
//                 paddingRight:5,
//                 textShadowOffset: {width: 0, height: 0},
//                 textShadowColor:'white',
//                 textShadowRadius:10,
//             },
//             headerBackground: () => getHeaderBackground(),
//             headerLeft: () => Platform.OS==='ios' ? getLeftButton(navigation):getRightButton(navigation),
//             headerRight: () => Platform.OS==='ios' ? getRightButton(navigation):getLeftButton(navigation),
//         }
//     )
// }

// function getHeaderBackground() {
//     return (
//         <Image
//             style={{ width: '110%', height: '100%'}}
//             source={headerBackground}
//         />
//     )
// }

// function getLeftButton(navigation) {
//     return (
//         <IconButton
//             icon="chevron-left"
//             color={'#425746'}
//             size={45}
//             onPress={() => navigation.goBack()}
//         />
//     )
// }

// function getRightButton() {
//     return (<></>)
// }


// import * as React from "react";
// import { View, Text, Button } from "react-native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// //import { RootStackParamList } from "../AppNavigator"

// export type RootStackParamList = {
//       login: undefined;
//       mainScreen: undefined;
//     };

//  type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "login">;

// const Login: React.FC<SettingsScreenProps> = (props) => {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Settings Screen</Text>
//       <Button title='Login' onPress={() => props.navigation.push("mainScreen")} />
//     </View>
//   );
// };
// export default Login;





// import * as React from "react";
// import { View, Text, Button, StyleSheet } from "react-native";

// function login() {
//   return (
//     <div>
//         <Text style={styles.bigText}>login</Text>
//     </div>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//   },
//   bottomComponent: {
//     backgroundColor: 'blue', // Example background color
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 10,
//   },
//   bigText: {
//     fontSize: 24, // Adjust the font size as needed
//     color: 'white', // Example text color
//   },
// });

// export default login;
