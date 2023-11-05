import { View, Button } from 'react-native';
import styles from '../styles';
import { useNavigation } from "@react-navigation/native";

function AboutScreen() {
  const navigation = useNavigation();

    return (
      <View style={styles.container}>
        <Button title="return from AboutScreen" onPress={() => navigation.goBack()} />
      </View>
    );
  }

export default AboutScreen;