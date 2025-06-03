import React from 'react';
import styles from './styles'; // your styles file
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface TopBarNavigatorProps {
  navigation: NavigationProp<ParamListBase>;
  title: string;
}

function TopBarNavigator({ navigation, title }: TopBarNavigatorProps) {
  const settingspushed = () => {
    alert("SettingsScreen1");
  };

  return (
    <View style={styles.container_top_bar}>
      {/* Left Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={{ marginRight: 5 }}>
          <Icon name="chatbubbles-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('notificationsScreen')}>
          <Icon name="notifications-circle-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>KC</Text>
        {title && <Text style={styles.subTitle}>{title}</Text>}
      </View>

      {/* Right Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('infoScreen')} style={{ marginRight: 5 }}>
          <Icon name="information-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => settingspushed()}>
          <Icon name="settings-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TopBarNavigator;
