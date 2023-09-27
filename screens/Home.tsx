import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button } from 'react-native';

import BottomNavigator from '../navigations/BottomNavigator';
import styles from '../styles';

function Home({ navigation }: { navigation: NavigationProp<ParamListBase> }) {

    return (
      <View style={styles.container}>
        <Button title="Go to First" onPress={() => navigation.navigate('FirstScreen')} />
        <BottomNavigator/>
      </View>
    );
  }

export default Home;