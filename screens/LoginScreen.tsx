import { View, Text, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";

function LoginScreen() {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();


    return (
      <View style={{ paddingTop: insets.top }}>
        <Text>Login Screen</Text>
        <Button title="Go to home" onPress={() => navigation.getParent()?.navigate('BottomNavigator')} />
      </View>
    );
}

export default LoginScreen;