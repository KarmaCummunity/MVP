import styles from "../globals/styles";
import BottomNavigator from "../navigations/BottomNavigator";
import TopBarNavigator from "../navigations/TopBarNavigator";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export default function Home({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const route = useRoute();
  console.log('🏠 Home - Component rendered');
  console.log('🏠 Home - Navigation object:', navigation);
  
  // קבלת hideTopBar מה-route params
  const hideTopBar = (route.params as any)?.hideTopBar || false;
  console.log('🏠 Home - hideTopBar from params:', hideTopBar);
  
  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ overflow: 'hidden' }}>
          <TopBarNavigator navigation={navigation} hideTopBar={hideTopBar} />
        </View>
        <BottomNavigator />
      </SafeAreaView>
  );
}
