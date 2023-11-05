import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Button, Alert } from 'react-native';
import styles from '../styles';
import { useNavigation } from "@react-navigation/native";

function ChatScreen() {
  const navigation = useNavigation();

    return (
      <View style={styles.container}>
        <Button title="return from chat" onPress={() => navigation.goBack()} />
      </View>
    );
  }

export default ChatScreen;