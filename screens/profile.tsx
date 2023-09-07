import * as React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator"


type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const Profile: React.FC<ProfileScreenProps> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Profile Screen</Text>
      <Button title='Go to Settings' onPress={() => navigation.navigate("Settings")} />
    </View>
  );
};

export default Profile;
