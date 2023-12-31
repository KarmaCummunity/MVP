import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button } from 'react-native';

function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View>
        <Text>Login Screen</Text>
        <Button title="Go to Bottom" onPress={() => navigation.navigate('BottomNavigator')} />
        <Button title="Go to Top" onPress={() => navigation.navigate('TopBarNavigator')} />
        <Button title="Go to home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
}

export default LoginScreen;