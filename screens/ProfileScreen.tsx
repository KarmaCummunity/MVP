import styles from '../navigations/styles';
import TopBarNavigator from "../navigations/TopBarNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, TouchableOpacity, Text } from "react-native";

function ProfileScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBarNavigator navigation={navigation} title="profile"/>

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstScreen")}
          style={styles.button}>
            
          <Text style={styles.buttonText}>
            {"Go to First\nthis is profile page"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;
