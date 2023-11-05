import styles from '../styles';
import TopBarNavigator from '../navigations/TopBarNavigator';

import { View, Button } from 'react-native';


function Home(){
    return (  
      <View>
        <TopBarNavigator title="Home"/> 
        <Button title="Go to First" onPress={() => alert('FirstScreen')} />
      </View>
    );
  }

export default Home;