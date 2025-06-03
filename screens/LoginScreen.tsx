import TopBarNavigator from "../navigations/TopBarNavigator";
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button } from 'react-native';

export default function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View>
        <Button title="Go to home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
}
