import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, Button, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatScreen from '../screens/ChatScreen';
import { useNavigation } from '@react-navigation/native';
//import logo from '../assets/favicon.png'; 
import styles from '../styles';
function TopBarNavigator({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  const settingspushed = () => {
    alert("SettingsScreen")
  } 
  return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
      <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
        <Icon name="chatbubbles-outline" size={30} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('notificationsScreen')}>
        <Icon name="notifications-circle-outline" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>KC</Text>
      <TouchableOpacity onPress={() => navigation.navigate('settingsScreen')}>
        <Icon name="information-circle-sharp" size={30} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => settingspushed()}>
        <Icon name="settings" size={30} color="black" />
      </TouchableOpacity>
    </View> 
    );
}

export default TopBarNavigator;