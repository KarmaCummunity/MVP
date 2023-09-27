import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from '../styles';

function HomeScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {

  const insets = useSafeAreaInsets();

    return (
      <View style={styles.container}> 
      <ScrollView style={{ paddingBottom: insets.bottom }}>
        <Button title="Go to Firstrrrrrrrrrrrrr" onPress={() => navigation.navigate('FirstScreen')} />
        <Button title="Go to First" onPress={() => navigation.navigate('FirstScreen')} />
        <Button title="Go to fffffffffffffffffffff" onPress={() => navigation.navigate('FirstScreen')} />
      </ScrollView>
      </View>
    );
  }
export default HomeScreen;