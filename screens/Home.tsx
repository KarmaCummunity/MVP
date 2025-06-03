import styles from '../navigations/styles';
import BottomNavigator from '../navigations/BottomNavigator';
import TopBarNavigator from '../navigations/TopBarNavigator';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

export default function Home({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View style={styles.container}>
        <SafeAreaView>
      <TopBarNavigator navigation={navigation} />
          </SafeAreaView>
      <View style={styles.container}>
        <BottomNavigator />
      </View>
    </View>
    );
}