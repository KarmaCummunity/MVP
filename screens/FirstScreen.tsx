import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function FirstScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView>
      <Button title="Go to Login" onPress={() => navigation.navigate('LoginScreen')} />
    </SafeAreaView>
  );
}

  export default FirstScreen;