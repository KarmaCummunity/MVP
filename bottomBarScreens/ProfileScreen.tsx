// screens/ProfileScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { currentUser } from '../globals/fakeData';
import { useUser } from '../context/UserContext';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import { createShadowStyle } from '../globals/styles';
import { scaleSize } from '../globals/responsive';
import { users } from '../globals/fakeData';
import { allUsers } from '../globals/characterTypes';
import { getFollowStats, followUser, unfollowUser, createSampleFollowData } from '../utils/followService';
import { createSampleChatData } from '../utils/chatService';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

// --- Tab Components ---
const PostsRoute = () => {
  const { t } = useTranslation(['profile']);
  return (
    <View style={styles.postsGrid}>
      {Array.from({ length: 18 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          style={styles.postContainer}
          onPress={() => Alert.alert(t('profile:alerts.post'), t('profile:alerts.postNumber', { number: (i + 1).toString() }))}
        >
          <Image
            source={{ uri: `https://picsum.photos/300/300?random=${i}` }}
            style={styles.postImage}
          />
          <View style={styles.postOverlay}>
            <View style={styles.postStats}>
              <Ionicons name="heart" size={16} color={colors.white} />
              <Text style={styles.postStatsText}>{Math.floor(Math.random() * 100) + 10}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReelsRoute = () => {
  const { t } = useTranslation(['profile']);
  return (
    <View style={styles.tabContentPlaceholder}>
      <Ionicons name="videocam-outline" size={60} color={colors.textSecondary} />
      <Text style={styles.placeholderText}>{t('profile:reels.noReelsYet')}</Text>
      <Text style={styles.placeholderSubtext}>{t('profile:reels.createFirstReel')}</Text>
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.createButtonText}>{t('profile:reels.createReel')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const TaggedRoute = () => {
  const { t } = useTranslation(['profile']);
  return (
    <View style={styles.tabContentPlaceholder}>
      <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
      <Text style={styles.placeholderText}>{t('profile:tagged.noTagsYet')}</Text>
      <Text style={styles.placeholderSubtext}>{t('profile:tagged.tagsAppearHere')}</Text>
    </View>
  );
};

// --- Main Component ---
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { t } = useTranslation(['profile', 'common']);
  const { selectedUser, setSelectedUser } = useUser();
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    karmaPoints: 0,
    completedTasks: 0,
    totalDonations: 0,
  });

  // Function to update user statistics
  const updateUserStats = async () => {
    try {
      const currentUserStats = await getFollowStats(selectedUser?.id || currentUser.id, selectedUser?.id || currentUser.id);
      const character = selectedUser || allUsers.find(u => u.id === currentUser.id);
      
      setUserStats({
        posts: character?.postsCount || 24,
        followers: currentUserStats.followersCount,
        following: currentUserStats.followingCount,
        karmaPoints: character?.karmaPoints || currentUser.karmaPoints,
        completedTasks: (character as any)?.completedTasks || 0,
        totalDonations: (character as any)?.totalDonations || 0,
      });
    } catch (error) {
      console.error('❌ Update user stats error:', error);
    }
  };

  // Function to select a random user
  const selectRandomUser = () => {
    if (allUsers.length > 0) {
      const randomIndex = Math.floor(Math.random() * allUsers.length);
      const randomUser = allUsers[randomIndex];
      setSelectedUser(randomUser as any);
      setShowMenu(false);
      Alert.alert(t('profile:alerts.newUser'), t('profile:alerts.selectedUser', { name: randomUser.name }));
    }
  };

  // Function to create sample follow data
  const handleCreateSampleData = async () => {
    await createSampleFollowData();
    await createSampleChatData(selectedUser?.id || currentUser.id);
    updateUserStats();
    const { t } = require('i18next');
    Alert.alert(t('profile:alerts.sampleDataTitle'), t('profile:alerts.sampleDataCreated'));
  };
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'posts' },
    { key: 'reels', title: 'reels' },
    { key: 'tagged', title: 'tagged' },
  ]);

  // Update stats when selectedUser changes
  useEffect(() => {
    const updateStats = async () => {
      await updateUserStats();
    };
    updateStats();
  }, [selectedUser]);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshStats = async () => {
        console.log('👤 ProfileScreen - Screen focused, refreshing stats...');
        await updateUserStats();
        
        // Force re-render by updating a timestamp
        const refreshTimestamp = Date.now();
        setUserStats(prevStats => ({
          ...prevStats,
          refreshTimestamp
        }));
      };
      refreshStats();
    }, [selectedUser])
  );

  const renderScene = SceneMap({
    posts: PostsRoute,
    reels: ReelsRoute,
    tagged: TaggedRoute,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabBarIndicator}
      style={styles.tabBar}
      activeColor={colors.pink}
      inactiveColor={colors.textSecondary}
      pressColor={colors.backgroundSecondary}
      tabStyle={{ flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' }}
      scrollEnabled={false}
      renderTabBarItem={({ route, key }) => {
        const routeIndex = props.navigationState.routes.findIndex(r => r.key === route.key);
        const isFocused = props.navigationState.index === routeIndex;

        return (
          <TouchableOpacity
            key={key}
            style={styles.tabBarItem}
            onPress={() => props.jumpTo(route.key)}
          >
            <Text
              style={[
                styles.tabBarText,
                { 
                  color: isFocused ? colors.pink : colors.textSecondary,
                  fontWeight: isFocused ? 'bold' : 'normal',
                }
              ]}
            >
              {t(`profile:tabs.${route.key}`, route.title)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  // User Statistics are now managed by state and updated via useFocusEffect

  // Recent Activities
  const recentActivities = [
    {
      id: '1',
      type: 'task',
      title: 'השלמת משימה: איסוף מזון',
      time: 'לפני שעה',
      icon: 'checkmark-circle',
      color: colors.success
    },
    {
      id: '2',
      type: 'donation',
      title: 'תרמת 200 ₪ לקניית ציוד',
      time: 'לפני 3 שעות',
      icon: 'heart',
      color: colors.error
    },
    {
      id: '3',
      type: 'event',
      title: 'הצטרפת לאירוע: יום קהילה',
      time: 'לפני יום',
      icon: 'calendar',
      color: colors.info
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.webScrollContainer}>
          <View 
            style={[styles.webScrollContent, { paddingBottom: tabBarHeight + scaleSize(24) }]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              console.log('🧭 ProfileScreen[WEB] content layout height:', h, 'window:', SCREEN_HEIGHT);
            }}
          >
        {/* Completion Banner */}
        <ProfileCompletionBanner />
        {/* Profile Info with Menu Icon */}
        <View style={styles.profileInfo}>
            <TouchableOpacity 
              style={styles.menuIcon}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="menu" size={scaleSize(24)} color={colors.textPrimary} />
            </TouchableOpacity>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: selectedUser?.avatar || currentUser.avatar }}
              style={styles.profilePicture}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.posts}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                (navigation as any).navigate('FollowersScreen', {
                  userId: selectedUser?.id || currentUser.id,
                  type: 'followers',
                  title: t('profile:followersTitle')
                });
              }}
            >
              <Text style={styles.statNumber}>{userStats.followers}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.followers')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                (navigation as any).navigate('FollowersScreen', {
                  userId: selectedUser?.id || currentUser.id,
                  type: 'following',
                  title: t('profile:followingTitle')
                });
              }}
            >
              <Text style={styles.statNumber}>{userStats.following}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.following')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Modal with Backdrop */}
        {showMenu && (
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={styles.menuBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.menuOverlay}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      navigation.navigate('BookmarksScreen' as never);
                    }}
                  >
              <Ionicons name="bookmark-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.bookmarks')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
              
                    }}
                  >
                      <Ionicons name="analytics-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.communityStats')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.shareProfile'), t('profile:alerts.shareProfileDesc'));
                    }}
                  >
                      <Ionicons name="share-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.shareProfile')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      (navigation as any).navigate('EditProfileScreen');
                    }}
                  >
                      <Ionicons name="create-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.editProfile')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.settings'), t('profile:alerts.openSettings'));
                    }}
                  >
                      <Ionicons name="settings-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.settings')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.help'), t('profile:alerts.openHelp'));
                    }}
                  >
                      <Ionicons name="help-circle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.help')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      navigation.navigate('LoginScreen' as never);
                    }}
                  >
                      <Ionicons name="log-in-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.login')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={selectRandomUser}
                  >
                      <Ionicons name="shuffle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.switchUser')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={handleCreateSampleData}
                  >
                      <Ionicons name="add-circle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.createSampleData')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.fullName}>{selectedUser?.name || currentUser.name}</Text>
          <Text style={styles.bioText}>{selectedUser?.bio || currentUser.bio}</Text>
          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />
            {' '}{typeof selectedUser?.location === 'string' ? selectedUser.location : selectedUser?.location?.city || currentUser.location}
          </Text>
          
          {/* Karma Points */}
          <View style={styles.karmaSection}>
            <View style={styles.karmaCard}>
              <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
              <Text style={styles.karmaText}>{selectedUser?.karmaPoints || userStats.karmaPoints} {t('profile:stats.karmaPointsSuffix')}</Text>
            </View>
          </View>

          {/* Activity Icons */}
          <View style={styles.activityIcons}>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.activity'), t('profile:alerts.viewActivity'))}
            >
              <Ionicons name="star-outline" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:activity')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.history'), t('profile:alerts.activityHistory'))}
            >
              <MaterialCommunityIcons name="history" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:history')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.favorites'), t('profile:alerts.yourFavorites'))}
            >
              <Ionicons name="heart-outline" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:favorites')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.discoverPeopleButton}
            onPress={() => {
              navigation.navigate('DiscoverPeopleScreen' as never);
            }}
          >
              <Ionicons name="person-add-outline" size={scaleSize(18)} color={colors.white} />
            <Text style={styles.discoverPeopleText}>{t('profile:discoverPeople')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationsButton}
            onPress={() => {
              navigation.navigate('NotificationsScreen' as never);
            }}
          >
              <Ionicons name="notifications-outline" size={scaleSize(18)} color={colors.white} />
            <Text style={styles.notificationsButtonText}>{t('profile:notifications')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>{t('profile:sections.recentActivity')}</Text>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => Alert.alert(activity.title, activity.time)}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={16} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story Highlights */}
        <View style={styles.highlightsSection}>
          <Text style={styles.sectionTitle}>{t('profile:sections.highlights')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyHighlightsContentContainer}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.storyHighlightItem}
                onPress={() => Alert.alert(t('profile:alerts.highlight'), t('profile:highlights.highlightIndex', { index: (i + 1).toString() }))}
              >
                <View style={styles.storyHighlightCircle}>
                  {i === 0 ? (
                     <Ionicons name="add" size={scaleSize(24)} color={colors.pink} />
                  ) : (
                    <Image
                      source={{ uri: `https://picsum.photos/60/60?random=${i + 10}` }}
                      style={styles.highlightImage}
                    />
                  )}
                </View>
                <Text style={styles.storyHighlightText}>
                  {i === 0 ? t('profile:highlights.new') : t('profile:highlights.highlightIndex', { index: i })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab View Container */}
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
          />
        </View>
          </View>
        </View>
      ) : (
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: tabBarHeight + scaleSize(24) }]}
      >
        {/* Completion Banner */}
        <ProfileCompletionBanner />
        {/* Profile Info with Menu Icon */}
        <View style={styles.profileInfo}>
            <TouchableOpacity 
              style={styles.menuIcon}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="menu" size={scaleSize(24)} color={colors.textPrimary} />
            </TouchableOpacity>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: selectedUser?.avatar || currentUser.avatar }}
              style={styles.profilePicture}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.posts}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                (navigation as any).navigate('FollowersScreen', {
                  userId: selectedUser?.id || currentUser.id,
                  type: 'followers',
                  title: t('profile:followersTitle')
                });
              }}
            >
              <Text style={styles.statNumber}>{userStats.followers}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.followers')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                (navigation as any).navigate('FollowersScreen', {
                  userId: selectedUser?.id || currentUser.id,
                  type: 'following',
                  title: t('profile:followingTitle')
                });
              }}
            >
              <Text style={styles.statNumber}>{userStats.following}</Text>
              <Text style={styles.statLabel}>{t('profile:stats.following')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Modal with Backdrop */}
        {showMenu && (
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={styles.menuBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.menuOverlay}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      navigation.navigate('BookmarksScreen' as never);
                    }}
                  >
              <Ionicons name="bookmark-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.bookmarks')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
              
                    }}
                  >
                      <Ionicons name="analytics-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.communityStats')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.shareProfile'), t('profile:alerts.shareProfileDesc'));
                    }}
                  >
                      <Ionicons name="share-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.shareProfile')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      (navigation as any).navigate('EditProfileScreen');
                    }}
                  >
                      <Ionicons name="create-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.editProfile')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.settings'), t('profile:alerts.openSettings'));
                    }}
                  >
                      <Ionicons name="settings-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.settings')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      Alert.alert(t('profile:alerts.help'), t('profile:alerts.openHelp'));
                    }}
                  >
                      <Ionicons name="help-circle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.help')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      navigation.navigate('LoginScreen' as never);
                    }}
                  >
                      <Ionicons name="log-in-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.login')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={selectRandomUser}
                  >
                      <Ionicons name="shuffle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.switchUser')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={handleCreateSampleData}
                  >
                      <Ionicons name="add-circle-outline" size={scaleSize(20)} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>{t('profile:menu.createSampleData')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.fullName}>{selectedUser?.name || currentUser.name}</Text>
          <Text style={styles.bioText}>{selectedUser?.bio || currentUser.bio}</Text>
          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />
            {' '}{typeof selectedUser?.location === 'string' ? selectedUser.location : selectedUser?.location?.city || currentUser.location}
          </Text>
          
          {/* Karma Points */}
          <View style={styles.karmaSection}>
            <View style={styles.karmaCard}>
              <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
              <Text style={styles.karmaText}>{selectedUser?.karmaPoints || userStats.karmaPoints} {t('profile:stats.karmaPointsSuffix')}</Text>
            </View>
          </View>

          {/* Activity Icons */}
          <View style={styles.activityIcons}>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.activity'), t('profile:alerts.viewActivity'))}
            >
              <Ionicons name="star-outline" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:activity')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.history'), t('profile:alerts.activityHistory'))}
            >
              <MaterialCommunityIcons name="history" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:history')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert(t('profile:alerts.favorites'), t('profile:alerts.yourFavorites'))}
            >
              <Ionicons name="heart-outline" size={scaleSize(24)} color={colors.pink} />
              <Text style={styles.activityIconText}>{t('profile:favorites')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.discoverPeopleButton}
            onPress={() => {
              navigation.navigate('DiscoverPeopleScreen' as never);
            }}
          >
              <Ionicons name="person-add-outline" size={scaleSize(18)} color={colors.white} />
            <Text style={styles.discoverPeopleText}>{t('profile:discoverPeople')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationsButton}
            onPress={() => {
              navigation.navigate('NotificationsScreen' as never);
            }}
          >
              <Ionicons name="notifications-outline" size={scaleSize(18)} color={colors.white} />
            <Text style={styles.notificationsButtonText}>{t('profile:notifications')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>{t('profile:sections.recentActivity')}</Text>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => Alert.alert(activity.title, activity.time)}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={16} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story Highlights */}
        <View style={styles.highlightsSection}>
          <Text style={styles.sectionTitle}>{t('profile:sections.highlights')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyHighlightsContentContainer}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.storyHighlightItem}
                onPress={() => Alert.alert(t('profile:alerts.highlight'), t('profile:highlights.highlightIndex', { index: (i + 1).toString() }))}
              >
                <View style={styles.storyHighlightCircle}>
                  {i === 0 ? (
                     <Ionicons name="add" size={scaleSize(24)} color={colors.pink} />
                  ) : (
                    <Image
                      source={{ uri: `https://picsum.photos/60/60?random=${i + 10}` }}
                      style={styles.highlightImage}
                    />
                  )}
                </View>
                <Text style={styles.storyHighlightText}>
                  {i === 0 ? t('profile:highlights.new') : t('profile:highlights.highlightIndex', { index: i })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab View Container */}
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
          />
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.backgroundPrimary 
  },
  mainScrollView: {
    flex: 1,
  },
  // Web-specific scroll wrappers
  webScrollContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      overflow: 'auto' as any,
      WebkitOverflowScrolling: 'touch' as any,
      overscrollBehavior: 'contain' as any,
      height: SCREEN_HEIGHT as any,
      maxHeight: SCREEN_HEIGHT as any,
      width: '100%' as any,
      touchAction: 'auto' as any,
    }),
  } as any,
  webScrollContent: {
    minHeight: SCREEN_HEIGHT * 1.2,
  },
  mainScrollContent: {
    paddingBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.LG,
  },
  profileSection: {
    position: 'relative',
  },
  profilePicture: {
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(80) / 2,
    borderWidth: 3,
    borderColor: colors.pink,
  },
  menuIcon: { 
    position: 'absolute',
    top: LAYOUT_CONSTANTS.SPACING.SM,
    right: LAYOUT_CONSTANTS.SPACING.SM,
    padding: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: colors.backgroundSecondary,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.1, 4),
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: LAYOUT_CONSTANTS.SPACING.LG,
  },
  statItem: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: FontSizes.medium, 
    fontWeight: 'bold', 
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  statLabel: { 
    fontSize: FontSizes.small, 
    color: colors.textSecondary,
  },
  bioSection: { 
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG, 
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG 
  },
  fullName: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  bioText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: Math.round(FontSizes.body * 1.4),
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  locationText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  karmaSection: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  karmaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    alignSelf: 'flex-start',
  },
  karmaText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activityIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activityIconItem: { 
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activityIconText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.XS,
  },
  actionButtonsContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  discoverPeopleButton: {
    backgroundColor: colors.pink,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverPeopleText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: LAYOUT_CONSTANTS.SPACING.SM,
  },
  notificationsButton: {
    backgroundColor: colors.primary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  notificationsButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activitiesSection: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    padding: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.1, 2),
    elevation: 2,
  },
  activityIcon: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  highlightsSection: {
    marginBottom: 20,
  },
  storyHighlightsContentContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
  },
  storyHighlightItem: { 
    alignItems: 'center', 
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.XS 
  },
  storyHighlightCircle: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  highlightImage: {
    width: scaleSize(56),
    height: scaleSize(56),
    borderRadius: scaleSize(28),
  },
  storyHighlightText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabViewContainer: {
    height: scaleSize(600), // Fixed baseline, scaled per screen
  },
  tabBar: {
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarIndicator: {
    backgroundColor: colors.pink,
    height: scaleSize(2),
  },
  tabBarItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarText: {
    fontSize: FontSizes.body,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
    paddingTop: 10,
  },
  postContainer: {
    width: '32%',
    aspectRatio: 1,
    margin: 2,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  postOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postStatsText: {
    color: colors.white,
    fontSize: FontSizes.small,
    marginLeft: 4,
  },
  tabContentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  placeholderText: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.pink,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  menuOverlay: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 8,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 4 }, 0.2, 8),
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginLeft: 12,
  },
});
