import React from 'react';
import styles from '../globals/styles'; // your styles file
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';



interface TopBarNavigatorProps {
  navigation: NavigationProp<ParamListBase>;
}

function TopBarNavigator({ navigation }: TopBarNavigatorProps) {
  
  const route = useRoute();

  // Map route names to subtitles
  const routeSubtitles: Record<string, string> = {
    HomeScreen: 'Welcome Home',
    SearchScreen: 'Search Something',
    DonationsScreen: 'Your Donations',
    ProfileScreen: 'Your Profile',
  };

  const subtitle = routeSubtitles[route.name] ?? '';

  const settingspushed = () => {
    alert("SettingsScreen1");
  };

  return (
    <View style={styles.container_top_bar}>
      {/* Left Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('InactiveScreen')} style={{ marginRight: 5 }}>
          <Icon name="chatbubbles-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('InactiveScreen')}>
          <Icon name="notifications-circle-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>KC</Text>
        {/* { <Text style={styles.subTitle}>{subtitle}</Text>} */}
      </View>
      {/* Right Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('InactiveScreen')} style={{ marginRight: 5 }}>
          <Icon name="information-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('InactiveScreen')}>
          <Icon name="settings-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TopBarNavigator;
