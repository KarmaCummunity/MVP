import React from 'react';
import styles from '../globals/styles'; // your styles file
import { Ionicons as Icon } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useRoute, useFocusEffect, useNavigationState } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import colors from '../globals/colors';
import { useUser } from '../context/UserContext';
import logger from '../utils/logger';
import { rowDirection } from '../globals/responsive';
import { useTranslation } from 'react-i18next';


interface TopBarNavigatorProps {
  navigation: NavigationProp<ParamListBase>;
  hideTopBar?: boolean;
  showPosts?: boolean;
}

function TopBarNavigator({ navigation, hideTopBar = false, showPosts = false }: TopBarNavigatorProps) {
  const { t } = useTranslation(['home','common','settings','donations','notifications','profile']);
  
  const route = useRoute();
  const { isGuestMode } = useUser();
  const translateY = useSharedValue(0);
  const [measuredHeight, setMeasuredHeight] = React.useState(56);
  
  // Get the current active route name from navigation state
  const activeRouteName = useNavigationState(state => {
    if (!state) return 'HomeMain';
    
    const findActiveRoute = (routes: any[], index: number): string => {
      const currentRoute = routes[index];
      if (currentRoute?.state?.routes) {
        // This route has nested navigation, go deeper
        return findActiveRoute(currentRoute.state.routes, currentRoute.state.index || 0);
      }
      return currentRoute?.name || 'HomeMain';
    };
    
    return findActiveRoute(state.routes, state.index || 0);
  });
  
  console.log('🔝 TopBarNavigator - Component rendered, route name:', route.name, 'isGuestMode:', isGuestMode);
  
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔝 TopBarNavigator - Navigator focused, checking state...');
      console.log('🔝 TopBarNavigator - Current route on focus:', route.name);
    }, [route.name])
  );

  ////console.log('🔝 TopBarNavigator - hideTopBar prop:', hideTopBar);

  // מאפשר הסתרת טופ-בר דרך פרמטר מסך: route.params?.hideTopBar === true
  const shouldHideTopBar = hideTopBar || (route?.params as any)?.hideTopBar === true;

  React.useEffect(() => {
    translateY.value = withTiming(shouldHideTopBar ? -measuredHeight : 0, { duration: 200 });
  }, [shouldHideTopBar, measuredHeight]);



  const animatedStyle = useAnimatedStyle(() => {
    //console.log('🔝 TopBarNavigator - translateY value:', translateY.value);
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Debug logs
  //console.log('🔍 TopBarNavigator - Current route name:', route.name);
  //console.log('🔍 TopBarNavigator - Route params:', route.params);
  //console.log('🔍 TopBarNavigator - Route key:', route.key);
  //console.log('🔍 TopBarNavigator - Full route object:', JSON.stringify(route, null, 2));

  // Map route names to titles using translations
  const routeTitles: Record<string, string> = {
    SearchScreen: t('common:search', 'חיפוש'),
    DonationsScreen: t('donations:title', 'הקהילה במעשים'),
    ProfileScreen: t('profile:title', 'פרופיל'),
    // Donation Stack Screens
    MoneyScreen: t('donations:money', 'כסף'),
    TrumpScreen: t('donations:rides', 'טרמפים'),
    KnowledgeScreen: t('donations:knowledge', 'תרומת ידע'),
    TimeScreen: t('donations:time', 'תרומת זמן'),
    CategoryScreen: t('donations:categories', 'קטגוריות תרומות'),
    ItemsScreen: t('donations:items', 'פריטים'),
    FoodScreen: 'אוכל',
    ClothesScreen: 'בגדים',
    BooksScreen: 'ספרים',
    FurnitureScreen: 'רהיטים',
    MedicalScreen: 'רפואה',
    AnimalsScreen: 'בעלי חיים',
    HousingScreen: 'דיור',
    SupportScreen: 'תמיכה',
    EducationScreen: 'חינוך',
    EnvironmentScreen: 'סביבה',
    TechnologyScreen: 'טכנולוגיה',
    MusicScreen: 'מוזיקה',
    GamesScreen: 'משחקים',
    RiddlesScreen: 'חידות',
    RecipesScreen: 'מתכונים',
    PlantsScreen: 'צמחים',
    WasteScreen: 'פסולת',
    ArtScreen: 'אמנות',
    SportsScreen: 'ספורט',
    
    
    // Top Bar Navigation Screens
    SettingsScreen: t('settings:title', 'הגדרות'),
    ChatListScreen: t('common:chats', 'צ\'אטים'),
    NotificationsScreen: t('notifications:title', 'התראות'),
    AboutKarmaCommunityScreen: t('settings:about', 'אודות KC'),
    
    // Other Screens
    UserProfileScreen: t('profile:title', 'פרופיל משתמש'),
    FollowersScreen: 'עוקבים',
    DiscoverPeopleScreen: 'גלה אנשים',
    NewChatScreen: 'צ\'אט חדש',
    ChatDetailScreen: 'צ\'אט',
    BookmarksScreen: t('common:favorites', 'מועדפים'),
    PostsReelsScreen: 'פוסטים',
    InactiveScreen: t('common:inactive', 'לא פעיל'),
    WebViewScreen: 'דף אינטרנט',
    LoginScreen: t('auth:login', 'התחברות'),
  };

  // Get current route name
  const currentRouteName = activeRouteName || route.name;
  
  // Determine title based on current route
  let title = 'KC';
  
  if (currentRouteName === 'HomeScreen' || currentRouteName === 'HomeMain') {
    title = showPosts ? t('home:newsTitle', 'חדשות') : t('home:numbersTitle', 'הקהילה במספרים');
  } else {
    // Use the routeTitles mapping for all other screens
    title = routeTitles[currentRouteName] ?? 'KC';
  }
  
  // Log important state changes
  React.useEffect(() => {
    logger.logUserAction('state-change', 'TopBarNavigator', {
      currentRouteName,
      activeRouteName,
      title,
      isGuestMode,
      hideTopBar,
      showPosts
    });
  }, [title, currentRouteName, activeRouteName, showPosts, hideTopBar, isGuestMode]);


  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
      <Animated.View
        style={[styles.container_top_bar, animatedStyle]}
        onLayout={(e) => setMeasuredHeight(e.nativeEvent.layout.height)}
      >

      <View style={{ flexDirection: rowDirection('row'), gap: 5 }}>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={{ padding: 4 }}>
          <Icon name="settings-outline" size={24} color={colors.topNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationsScreen')} style={{ padding: 4 }}>
          <Icon name="notifications-circle-outline" size={24} color={colors.topNavIcon} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>
      {/* Left Icons Group: Notifications + Settings */}
            {/* Right Icons Group: Chat OR About (guest) */}
            <View style={{ flexDirection: rowDirection('row'), gap: 5 }}>
        {isGuestMode ? (
          <TouchableOpacity onPress={() => navigation.navigate('AboutKarmaCommunityScreen')} style={{ padding: 4 }}>
            <Icon name="information-circle-outline" size={24} color={colors.topNavIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')} style={{ padding: 4 }}>
            <Icon name="chatbubbles-outline" size={24} color={colors.topNavIcon} />
          </TouchableOpacity>
        )}
      </View>
      </Animated.View>
    </SafeAreaView>
  );
}

export default TopBarNavigator;
