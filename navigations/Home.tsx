// import styles from "../globals/styles";
// import BottomNavigator from "../navigations/BottomNavigator";
// import TopBarNavigator from "../navigations/TopBarNavigator";
// import { View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { NavigationProp, ParamListBase } from "@react-navigation/native";

// export default function Home({
//   navigation,
// }: {
//   navigation: NavigationProp<ParamListBase>;
// }) {
//   return (
//     <View style={styles.container}>
//       <SafeAreaView edges={["top"]} style={styles.safeArea}>
//         <TopBarNavigator navigation={navigation} />
//       </SafeAreaView>
//       <View style={styles.container}>
//         <BottomNavigator />
//       </View>
//     </View>
//   );
// }
import styles from "../globals/styles";
import BottomNavigator from "../navigations/BottomNavigator";
import TopBarNavigator from "../navigations/TopBarNavigator";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

export default function Home({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
      <SafeAreaView style={styles.safeArea}>
        <TopBarNavigator navigation={navigation} />
        <BottomNavigator />
      </SafeAreaView>
  );
}
