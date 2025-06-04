import styles from "../globals/styles";
import BottomNavigator from "../navigations/BottomNavigator";
import TopBarNavigator from "../navigations/TopBarNavigator";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import BubblesScreen from "../components/BubbleScreen";
import SearchBar from "../components/SearchBar";
import ProfileScreen from "./ProfileScreen";
export default function HomeScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <SafeAreaView style={styles.container}>
      {/* <SearchBar /> */}
      {/* <ProfileScreen /> */}
        <BubblesScreen />
    </SafeAreaView>
  );
}
