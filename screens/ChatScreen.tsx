import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button, Alert } from 'react-native';
import styles from '../styles';
function ChatScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    alert("ChatScreen")
    return (
      <View style={styles.container}>
        <Button title="return from chat" onPress={() => navigation.navigate('FirstScreen')} />
      </View>
    );
  }

export default ChatScreen;