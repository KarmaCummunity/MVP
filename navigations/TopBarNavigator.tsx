// import { NavigationProp, ParamListBase } from '@react-navigation/native';
// import { View, Text, Button, TouchableOpacity, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import ChatScreen from '../screens/ChatScreen';
// import { useNavigation } from '@react-navigation/native';
// //import logo from '../assets/favicon.png'; 
// import styles from '../styles';
// function TopBarNavigator({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
//   const settingspushed = () => {
//     alert("SettingsScreen")
//   } 
//   return (
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
//       <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
//         <Icon name="chatbubbles-outline" size={30} color="black" />
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => navigation.navigate('notificationsScreen')}>
//         <Icon name="notifications-circle-outline" size={30} color="black" />
//       </TouchableOpacity>
//       <Text style={styles.title}>KC</Text>
//       <TouchableOpacity onPress={() => navigation.navigate('settingsScreen')}>
//         <Icon name="information-circle-sharp" size={30} color="black" />
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => settingspushed()}>
//         <Icon name="settings" size={30} color="black" />
//       </TouchableOpacity>
//     </View> 
//     );
// }

// export default TopBarNavigator;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
  title: string;
  navigation: StackNavigationProp<any>; // Replace 'any' with your navigation param list type
}

const TopBarNavigator: React.FC<TopBarProps> = ({ title, navigation }) => {

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChatScreen')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-chatbubbles' : 'md-chatbubbles'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Notifications')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-notifications' : 'md-notifications'} size={24} color="black" />
        </TouchableOpacity>
      </View>
                
      <Text style={styles.title}>{title}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('About')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-information-circle' : 'md-information-circle'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-settings' : 'md-settings'} size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgray',
    padding: 10,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
      },
      android: {
        elevation: 4, // For shadow on Android
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: 10,
  },
});

export default TopBarNavigator;
