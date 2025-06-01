import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBarNavigator from "../navigations/TopBarNavigator";

function DonationsScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBarNavigator navigation={navigation} />

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstScreen")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {"Go to First\nthis is donation page"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f0",
  },
  content: {
    flex: 1,
    justifyContent: "center", // centers the button vertically
    alignItems: "center",     // centers the button horizontally
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default DonationsScreen;
