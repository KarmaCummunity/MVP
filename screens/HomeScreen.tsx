import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';

function HomeScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View>
        <Text>Home Screen</Text>
        <Button title="Go to First" onPress={() => navigation.navigate('FirstScreen')} />
      </View>
    );
  }
export default HomeScreen;