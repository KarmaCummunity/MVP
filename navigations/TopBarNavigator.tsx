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

  // Debug logs
  console.log('🔍 TopBarNavigator - Current route name:', route.name);
  console.log('🔍 TopBarNavigator - Route params:', route.params);
  console.log('🔍 TopBarNavigator - Route key:', route.key);
  console.log('🔍 TopBarNavigator - Full route object:', JSON.stringify(route, null, 2));

  // Map route names to titles
  const routeTitles: Record<string, string> = {
    HomeScreen: 'KC',
    SearchScreen: 'חיפוש',
    DonationsScreen: 'תרומות',
    ProfileScreen: 'פרופיל',
    MoneyScreen: 'כסף',
    TrumpScreen: 'טרמפים',
    KnowledgeScreen: 'תרומת ידע',
    TimeScreen: 'תרומת זמן',
    // Add HomeMain as KC (default)
    HomeMain: 'KC',
  };

  // Get the current active route from the navigation state
  const getActiveRouteName = (state: any): string => {
    const route = state?.routes?.[state?.index];
    if (route?.state) {
      return getActiveRouteName(route.state);
    }
    return route?.name;
  };

  // Try to get the active route name from navigation state
  const activeRouteName = getActiveRouteName(navigation.getState());
  console.log('🔍 TopBarNavigator - Active route name from navigation state:', activeRouteName);

  const title = routeTitles[activeRouteName] ?? routeTitles[route.name] ?? 'KC';
  
  // Debug log for title selection
  console.log('🔍 TopBarNavigator - Selected title:', title);
  console.log('🔍 TopBarNavigator - Available route names:', Object.keys(routeTitles));
  console.log('🔍 TopBarNavigator - Navigation state:', JSON.stringify(navigation.getState(), null, 2));


  return (
    <View style={styles.container_top_bar}>
      {/* Left Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')} style={{ marginRight: 5 }}>
          <Icon name="chatbubbles-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('InactiveScreen')}>
          <Icon name="notifications-circle-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {/* Right Icons Group */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('AboutKarmaCommunityScreen')} style={{ marginRight: 5 }}>
          <Icon name="information-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Icon name="settings-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TopBarNavigator;
