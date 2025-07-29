import React from 'react';
import styles from '../globals/styles'; // your styles file
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';



interface TopBarNavigatorProps {
  navigation: NavigationProp<ParamListBase>;
  hideTopBar?: boolean;
}

function TopBarNavigator({ navigation, hideTopBar = false }: TopBarNavigatorProps) {
  
  const route = useRoute();
  const translateY = useSharedValue(0);

  // אנימציה להסתרת/הצגת הטופ בר
  React.useEffect(() => {
    translateY.value = withTiming(hideTopBar ? -100 : 0, {
      duration: 300,
    });
  }, [hideTopBar]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Debug logs
  console.log('🔍 TopBarNavigator - Current route name:', route.name);
  console.log('🔍 TopBarNavigator - Route params:', route.params);
  console.log('🔍 TopBarNavigator - Route key:', route.key);
  console.log('🔍 TopBarNavigator - Full route object:', JSON.stringify(route, null, 2));

  // Map route names to titles
  const routeTitles: Record<string, string> = {
    HomeScreen: 'חדשות',
    SearchScreen: 'חיפוש',
    DonationsScreen: 'תרומות',
    ProfileScreen: 'פרופיל',
    MoneyScreen: 'כסף',
    TrumpScreen: 'טרמפים',
    KnowledgeScreen: 'תרומת ידע',
    TimeScreen: 'תרומת זמן',
    // Add HomeMain as חדשות (default)
    HomeMain: 'חדשות',
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
    <Animated.View style={[styles.container_top_bar, animatedStyle]}>
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
    </Animated.View>
  );
}

export default TopBarNavigator;
