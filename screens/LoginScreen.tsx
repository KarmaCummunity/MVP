import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';

function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View>
        <Text>Login Screen</Text>
        <Button title="Go to Bottom" onPress={() => navigation.navigate('BottomNavigator')} />
      </View>
    );
}

export default LoginScreen;