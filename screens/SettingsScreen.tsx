import styles from '../styles';

import { View, Button } from 'react-native';
import { useNavigation } from "@react-navigation/native";

function SettingsScreen() {
  const navigation = useNavigation();

    return (
      <View style={styles.container}>
        <Button title="return from Settings" onPress={() => navigation.goBack()} />
      </View>
    );
  }

export default SettingsScreen;