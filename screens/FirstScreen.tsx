import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';

function FirstScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <View>
      <Text>First Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('LoginScreen')} />
    </View>
  );
}

  export default FirstScreen;