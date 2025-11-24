// File overview:
// - Purpose: Shared top navigation bar component for stacks; shows title and quick actions (Settings, Notifications, Chat/About).
// - Reached from: `HomeTabStack`, `SearchTabStack`, `ProfileTabStack`, `DonationsStack` as a custom header.
// - Inputs: Props `hideTopBar` and `showPosts`; also reads `route.params.hideTopBar`. Title resolves by current route with i18n.
// - Reads from context: `useUser()` for guest mode to toggle Chat/About icon.
// - Side effects: Logs focus and state changes via `logger`; animates show/hide with Reanimated.
import React from 'react';
import styles from '../globals/styles'; // your styles file
import { Ionicons as Icon } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useRoute, useFocusEffect, useNavigationState } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import colors from '../globals/colors';
import { useUser } from '../stores/userStore';
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
  
  // console removed
  
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // console removed
      // console removed
    }, [route.name])
  );

  ////// console removed

  const shouldHideTopBar = hideTopBar || (route?.params as any)?.hideTopBar === true;

  React.useEffect(() => {
    translateY.value = withTiming(shouldHideTopBar ? -measuredHeight : 0, { duration: 200 });
  }, [shouldHideTopBar, measuredHeight]);



  const animatedStyle = useAnimatedStyle(() => {
    //// console removed
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Debug logs
  //// console removed
  //// console removed
  //// console removed
  //// console removed);

  // Map route names to titles using translations
  const routeTitles: Record<string, string> = {
    SearchScreen: t('common:search'),
    DonationsTab: t('donations:title'),
    ProfileScreen: t('profile:title'),
    LandingSiteScreen: 'Karma Community',

    MoneyScreen: t('donations:categories.money.title'),
    TrumpScreen: t('donations:categories.trump.title'),
    KnowledgeScreen: t('donations:categories.knowledge.title'),
    TimeScreen: t('donations:categories.time.title'),
    CategoryScreen: t('donations:categoriesTitle'),
    ItemsScreen: t('donations:categories.items.title'),
    FoodScreen: t('donations:categories.food.title'),
    ClothesScreen: t('donations:categories.clothes.title'),
    BooksScreen: t('donations:categories.books.title'),
    FurnitureScreen: t('donations:categories.furniture.title'),
    MedicalScreen: t('donations:categories.medical.title'),
    AnimalsScreen: t('donations:categories.animals.title'),
    HousingScreen: t('donations:categories.housing.title'),
    SupportScreen: t('donations:categories.support.title'),
    EducationScreen: t('donations:categories.education.title'),
    EnvironmentScreen: t('donations:categories.environment.title'),
    TechnologyScreen: t('donations:categories.technology.title'),
    MusicScreen: t('donations:categories.music.title'),
    GamesScreen: t('donations:categories.games.title'),
    RiddlesScreen: t('donations:categories.riddles.title'),
    RecipesScreen: t('donations:categories.recipes.title'),
    PlantsScreen: t('donations:categories.plants.title'),
    WasteScreen: t('donations:categories.waste.title'),
    ArtScreen: t('donations:categories.art.title'),
    SportsScreen: t('donations:categories.sports.title'),
    DreamsScreen: t('donations:categories.dreams.title'),
    FertilityScreen: t('donations:categories.fertility.title'),
    JobsScreen: t('donations:categories.jobs.title'),

    SettingsScreen: t('settings:title'),
    ChatListScreen: t('common:chats'),
    NotificationsScreen: t('notifications:title'),
    AboutKarmaCommunityScreen: t('settings:about'),

    UserProfileScreen: t('profile:title'),
    FollowersScreen: t('profile:followers'),
    DiscoverPeopleScreen: t('profile:discover'),
    NewChatScreen: t('common:newChat'),
    ChatDetailScreen: t('common:chat'),
    BookmarksScreen: t('common:favorites'),
    PostsReelsScreen: t('common:posts'),
    InactiveScreen: t('common:inactive'),
    WebViewScreen: t('common:web'),
    LoginScreen: t('auth:login'),
  };

  // Get current route name
  const currentRouteName = activeRouteName || route.name;
  
  // Determine title based on current route
  let title = 'KC';
  
  if (currentRouteName === 'HomeScreen' || currentRouteName === 'HomeMain') {
    title = showPosts ? t('home:newsTitle') : t('home:numbersTitle');
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

      <View style={styles.topBarIconsRow}>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.topBarIconButton}>
          <Icon name="settings-outline" size={24} color={colors.topNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationsScreen')} style={styles.topBarIconButton}>
          <Icon name="notifications-circle-outline" size={24} color={colors.topNavIcon} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.topBarTitleContainer}>
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>
      {/* Left Icons Group: Notifications + Settings */}
            {/* Right Icons Group: Chat OR About (guest) */}
            <View style={styles.topBarIconsRow}>
        {isGuestMode ? (
          <TouchableOpacity onPress={() => navigation.navigate('AboutKarmaCommunityScreen')} style={styles.topBarIconButton}>
            <Icon name="information-circle-outline" size={24} color={colors.topNavIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('ChatListScreen')} style={styles.topBarIconButton}>
            <Icon name="chatbubbles-outline" size={24} color={colors.topNavIcon} />
          </TouchableOpacity>
        )}
      </View>
      </Animated.View>
    </SafeAreaView>
  );
}

export default TopBarNavigator;
