import styles from '../navigations/styles';
import TopBarNavigator from "../navigations/TopBarNavigator";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function DonationsScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBarNavigator navigation={navigation} title='donations' />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstScreen")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {"Go to First\nthis is profile page"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default DonationsScreen;
