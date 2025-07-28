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
  console.log('🏠 Home - Component rendered');
  console.log('🏠 Home - Navigation object:', navigation);
  
  return (
      <SafeAreaView style={styles.safeArea}>
        <TopBarNavigator navigation={navigation} />
        <BottomNavigator />
      </SafeAreaView>
  );
}
