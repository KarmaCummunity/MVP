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

// import React from 'react';
// import { Text, View } from 'react-native';

// function HomeScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Home!</Text>
//     </View>
//   );
// }

// export default HomeScreen;
import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

function Home() {
    const openLink = () => {
        const url = 'https://example.com'; // Replace with your URL
        Linking.openURL(url);
    };
    return (
        <div>
            <Text>hello world</Text>
            <View>
                <Text>This is a clickable link:</Text>
                <TouchableOpacity onPress={openLink}>
                    <Text style={{ color: 'blue' }}>Visit Example.com</Text>
                </TouchableOpacity>
            </View>
        </div>
    );
};

export default Home
