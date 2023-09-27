import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FirstScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {

  const insets = useSafeAreaInsets();


  return (
    <View style={{ paddingTop: insets.top }}>
      <Text>First Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('LoginScreen')} />
    </View>
  );
}

  export default FirstScreen;