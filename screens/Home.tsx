import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button, StyleSheet } from 'react-native';
import BottomNavigator from '../navigations/BottomNavigator';

function Home({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
    return (
      <View style={styles.container}>

        {/* <Button title="Go to First" onPress={() => navigation.navigate('FirstScreen')} /> */}
        <BottomNavigator/>
      </View>
    );
  }


const styles = StyleSheet.create({
    container: {
      flex: 1, // This makes the container take up the entire screen height
      justifyContent: 'flex-end', // Positions content at the top and bottom
      // backgroundColor: "#fff0f0", // 👈 Add your color here
      backgroundColor: 'transparent', // ← add this
    },
});
export default Home;