import styles from '../navigations/styles';
import BottomNavigator from '../navigations/BottomNavigator';
import { View } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
function Home({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View style={styles.container}>
        <BottomNavigator/>
      </View>
    );
}
export default Home;