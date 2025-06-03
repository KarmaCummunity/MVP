import TopBarNavigator from "../navigations/TopBarNavigator";
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button } from 'react-native';

function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View>
        <TopBarNavigator navigation={navigation} title="Login" />
        <Button title="Go to home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
}
export default LoginScreen;