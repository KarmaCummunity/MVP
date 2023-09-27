import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {

  const insets = useSafeAreaInsets();


    return (
      <View style={{ paddingTop: insets.top }}>
        <Text>Login Screen</Text>
        <Button title="Go to home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
}

export default LoginScreen;