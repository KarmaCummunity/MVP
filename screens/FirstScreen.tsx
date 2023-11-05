import { View, Text, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FirstScreen() {

  const insets = useSafeAreaInsets();


  return (
    <View style={{ paddingTop: insets.top }}>
      <Text>First Screen</Text>
      <Button title="Go to Login" onPress={() => alert('LoginScreen')} />
    </View>
  );
}

  export default FirstScreen;