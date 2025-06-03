import styles from "../navigations/styles";
import TopBarNavigator from "../navigations/TopBarNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TouchableOpacity, Text } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

export default function SearchScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstScreen")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {"Go to First\nthis is search page"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}