// File overview:
// - Purpose: User's own profile screen in the Profile tab (stats, bio, actions, tabbed Posts/Reels/Tagged, quick menus).
// - Reached from: `ProfileTabStack` initial route 'ProfileScreen' via `BottomNavigator`.
// - Provides: Navigation to Followers lists, Bookmarks, Notifications, Edit Profile, Discover People, and (in demo) random persona selection and sample data creation.
// - Reads from context: `useUser()` -> `selectedUser`, `setSelectedUserWithMode`, `isRealAuth`.
// - Route params: None (internal state only; navigates to other screens with params).
// - External deps/services: `followService` (stats and sample), `chatService` (sample chats), i18n translations.
// - Notes: Hides or adapts certain demo-only features when `isRealAuth` is true.
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
  ActivityIndicator,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '../stores/userStore';
import ScrollContainer from '../components/ScrollContainer';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import { createShadowStyle } from '../globals/styles';
import { scaleSize } from '../globals/responsive';
import { getFollowStats, followUser, unfollowUser, createSampleFollowData } from '../utils/followService';
import { createSampleChatData } from '../utils/chatService';
import { db } from '../utils/databaseService';

// --- Type Definitions ---
interface Activity {
  id: string;
  type: string;
  title: string;
  time: string;
  icon: string;
  color: string;
}

type TabRoute = {
  key: string;
  title: string;
};

// --- Tab Components ---
const PostsRoute = () => {
  const { t } = useTranslation(['profile', 'common']);
  const { isRealAuth, selectedUser } = useUser();
  const navigation = useNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (!selectedUser?.id) return;
      const loadPosts = async () => {
        try {
          setLoading(true);

          // Fetch both Items (Marketplace) and Social Posts
          const [userItems, userSocialPosts] = await Promise.all([
            db.getDedicatedItemsByOwner(selectedUser.id).catch(e => { console.log('Error fetching items', e); return []; }),
            db.getUserPosts(selectedUser.id).catch(e => { console.log('Error fetching posts', e); return []; })
          ]);

          // Normalize Items
          const formattedItems = (userItems || []).map((i: any) => ({
            id: i.id || `item_${Math.random()}`,
            title: i.title,
            // Ensure base64 prefix if missing
            image: i.image_base64 ? (i.image_base64.startsWith('data:') ? i.image_base64 : `data:image/jpeg;base64,${i.image_base64}`) : null,
            type: 'item',
            description: i.description,
            createdAt: i.created_at || i.timestamp || new Date().toISOString()
          }));

          // Normalize Social Posts
          const formattedPosts = (userSocialPosts || []).map((p: any) => ({
            id: p.id || `post_${Math.random()}`,
            title: p.title || p.text || 'Post',
            image: p.thumbnail || p.image || null,
            type: 'post',
            description: p.description,
            createdAt: p.timestamp || p.createdAt || new Date().toISOString()
          }));

          // Merge and sort by newest first
          const allPosts = [...formattedItems, ...formattedPosts].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setPosts(allPosts);
        } catch (e) {
          console.error('Failed to load user posts', e);
        } finally {
          setLoading(false);
        }
      };
      loadPosts();
    }, [selectedUser?.id])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <ActivityIndicator size="small" color={colors.pink} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.tabContentPlaceholder}>
        <Ionicons name="images-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>{t('profile:posts.noPostsYet', 'אין פוסטים עדיין')}</Text>
        <Text style={styles.placeholderSubtext}>{t('profile:posts.createFirstPost', 'הפריטים שתפרסם יופיעו כאן')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.postsGrid}>
      {posts.map((item, i) => (
        <TouchableOpacity
          key={item.id || i}
          style={styles.postContainer}
          onPress={() => Alert.alert(item.title, item.description || '')}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.postImage}
            />
          ) : (
            <View style={[styles.postImage, {
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.backgroundSecondary,
              padding: 8
            }]}>
              {item.type === 'item' ? (
                <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
              ) : (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: colors.textPrimary,
                    textAlign: 'center',
                    marginBottom: 4
                  }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={{
                    fontSize: 10,
                    color: colors.textSecondary,
                    textAlign: 'center'
                  }} numberOfLines={3}>
                    {item.description}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.postOverlay}>
            {/* Optional: Add price or status here */}
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

const RidesRoute = () => {
  const { t } = useTranslation(['profile', 'trump']);
  const { selectedUser } = useUser();
  const [rides, setRides] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (!selectedUser?.id) return;
      const loadRides = async () => {
        try {
          // Use getUserRides to get full history (including past rides)
          const myRides = await db.getUserRides(selectedUser.id, 'driver');
          setRides(myRides);
        } catch (e) { console.error(e); }
      };
      loadRides();
    }, [selectedUser])
  );

  if (rides.length === 0) {
    return (
      <View style={styles.tabContentPlaceholder}>
        <Ionicons name="car-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>{t('profile:rides.noRides', 'אין טרמפים עדיין')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {rides.map((ride, i) => (
        <View key={ride.id || i} style={{
          backgroundColor: colors.moneyFormBackground || colors.backgroundSecondary,
          padding: 12,
          marginBottom: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.moneyFormBorder
        }}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: FontSizes.body, color: colors.textPrimary }}>
              {ride.from} ➝ {ride.to}
            </Text>
            <Text style={{ fontSize: FontSizes.heading2 }}>🚗</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: colors.textSecondary }}>{ride.date} @ {ride.time}</Text>
            <Text style={{ fontWeight: 'bold', color: colors.moneyHistoryAmount }}>₪{ride.price}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// --- Main Component ---
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { t } = useTranslation(['profile', 'common']);
  const { selectedUser, setSelectedUserWithMode, isRealAuth } = useUser();
  const navigation = useNavigation();
  const defaultLogo = require('../assets/images/android-chrome-192x192.png');
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

  // Update URL to unique profile URL when on web
  // This runs every time the screen is focused to ensure URL is always correct
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && selectedUser?.id && typeof window !== 'undefined') {
        const updateUrl = () => {
          const currentPath = window.location.pathname;
          const expectedPath = `/profile/${selectedUser.id}`;

          // Update URL if we're not already on the correct profile URL
          if (currentPath !== expectedPath) {
            // Use replaceState to update URL without adding to history
            window.history.replaceState(null, '', expectedPath);
            console.log('✅ ProfileScreen - URL updated from', currentPath, 'to', expectedPath);
          }
        };

        // Update immediately
        updateUrl();

        // Also update after a small delay to catch any React Navigation URL updates
        const timer = setTimeout(updateUrl, 100);

        return () => clearTimeout(timer);
      }
    }, [selectedUser?.id])
  );

  // Function to update user statistics
  const updateUserStats = async () => {
    try {
      if (!selectedUser?.id) {
        console.warn('⚠️ No user selected, skipping stats update');
        return;
      }
      const currentUserStats = await getFollowStats(selectedUser.id, selectedUser.id);

      setUserStats({
        posts: selectedUser?.postsCount || 0,
        followers: currentUserStats.followersCount,
        following: currentUserStats.followingCount,
        karmaPoints: selectedUser?.karmaPoints || 0,
        completedTasks: (selectedUser as any)?.completedTasks || 0,
        totalDonations: (selectedUser as any)?.totalDonations || 0,
      });
    } catch (error) {
      console.error('❌ Update user stats error:', error);
    }
  };

  // Function to select a random user (demo mode only - disabled)
  const selectRandomUser = () => {
    if (isRealAuth) {
      Alert.alert(t('common:errorTitle'), t('profile:alerts.disabledOnRealAuth'));
      return;
    }
    // Demo mode removed - this function is no longer available
    Alert.alert(t('common:errorTitle'), t('profile:alerts.disabledOnRealAuth'));
  };

  // Function to create sample follow data
  const handleCreateSampleData = async () => {
    if (isRealAuth) {
      Alert.alert(t('common:errorTitle'), t('profile:alerts.disabledOnRealAuth'));
      return;
    }
    if (!selectedUser?.id) {
      Alert.alert(t('common:errorTitle'), t('profile:alerts.noUserSelected'));
      return;
    }
    await createSampleFollowData();
    await createSampleChatData(selectedUser.id);
    updateUserStats();
    Alert.alert(t('profile:alerts.sampleDataTitle'), t('profile:alerts.sampleDataCreated'));
  };
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'posts' },
    { key: 'reels', title: 'reels' },
    // { key: 'rides', title: 'Tremps' }, // Removed as requested
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
    // rides: RidesRoute,
    tagged: TaggedRoute,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabBarIndicator}
      style={[styles.tabBar, { width: '100%' }]}
      activeColor={colors.pink}
      inactiveColor={colors.textSecondary}
      pressColor={colors.backgroundSecondary}
      tabStyle={{ flex: 1 }} // Ensure full width distribution
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

  // Recent Activities State
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadRecentActivity = async () => {
        if (!selectedUser?.id) return;

        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30); // Extended to 30 days to show more activity

          const activities: Activity[] = [];

          // 1. Fetch Rides (Trumps)
          try {
            const rides = await db.getUserRides(selectedUser.id, 'driver');
            const recentRides = rides.filter((r: { date: string | number | Date; }) => {
              const d = new Date(r.date);
              return d >= sevenDaysAgo;
            });

            recentRides.forEach((r: { from: any; to: any; date: any; }) => {
              activities.push({
                id: `ride_${Math.random()}`,
                type: 'event',
                title: `פרסמת טרמפ: ${r.from} ⬅️ ${r.to}`,
                time: r.date,
                icon: 'car',
                color: colors.info
              });
            });
          } catch (e) { console.log('Error fetching rides for activity', e); }

          // 2. Fetch Posts & Items
          try {
            const [userItems, userPosts] = await Promise.all([
              db.getDedicatedItemsByOwner(selectedUser.id).catch(() => []),
              db.getUserPosts(selectedUser.id).catch(() => [])
            ]);

            // Process Items
            userItems.forEach((item: any) => {
              const date = item.created_at || item.timestamp || new Date().toISOString();
              if (new Date(date) >= sevenDaysAgo) {
                activities.push({
                  id: `item_${item.id || Math.random()}`,
                  type: 'item',
                  title: `פרסמת פריט: ${item.title}`,
                  time: new Date(date).toISOString().split('T')[0],
                  icon: 'cube',
                  color: colors.primary
                });
              }
            });

            // Process Posts
            userPosts.forEach((post: any) => {
              const date = post.timestamp || post.createdAt || new Date().toISOString();
              if (new Date(date) >= sevenDaysAgo) {
                activities.push({
                  id: `post_${post.id || Math.random()}`,
                  type: 'post',
                  title: `פרסמת פוסט: ${post.title || post.text || 'פוסט חדש'}`,
                  time: new Date(date).toISOString().split('T')[0],
                  icon: 'newspaper',
                  color: colors.success
                });
              }
            });
          } catch (e) { console.log('Error fetching posts/items for activity', e); }

          // Sort by time (descending)
          activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

          setRecentActivities(activities);

        } catch (error) {
          console.error('Failed to load recent activities', error);
        }
      };
      loadRecentActivity();
    }, [selectedUser])
  );

  // Derived display values
  const avatarSource = selectedUser?.avatar ? { uri: selectedUser.avatar } : defaultLogo;

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
                <Image source={avatarSource} style={styles.profilePicture} />
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{isRealAuth ? 0 : userStats.posts}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => {
                    if (!selectedUser?.id) return;
                    (navigation as any).navigate('FollowersScreen', {
                      userId: selectedUser.id,
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
                    if (!selectedUser?.id) return;
                    (navigation as any).navigate('FollowersScreen', {
                      userId: selectedUser.id,
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
                  <TouchableWithoutFeedback onPress={() => { }}>
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

                      {!isRealAuth && (
                        <>
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
                        </>
                      )}
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Bio Section */}
            <View style={styles.bioSection}>
              <Text style={styles.fullName}>{selectedUser?.name || ''}</Text>
              {!!selectedUser?.bio && (
                <Text style={styles.bioText}>{selectedUser.bio}</Text>
              )}
              {!!(typeof selectedUser?.location === 'string' ? selectedUser?.location : selectedUser?.location?.city) && (
                <Text style={styles.locationText}>
                  <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />{' '}
                  {typeof selectedUser?.location === 'string' ? selectedUser?.location : selectedUser?.location?.city || ''}
                </Text>
              )}

              {/* Karma Points */}
              <View style={styles.karmaSection}>
                <View style={styles.karmaCard}>
                  <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
                  <Text style={styles.karmaText}>{(isRealAuth ? (selectedUser?.karmaPoints ?? userStats.karmaPoints) : (selectedUser?.karmaPoints || userStats.karmaPoints))} {t('profile:stats.karmaPointsSuffix')}</Text>
                </View>
              </View>

              {/* Activity Icons */}
              {!isRealAuth && (
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
              )}
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
              {recentActivities.length === 0 ? (
                <Text style={styles.placeholderText}>{t('profile:recent.noActivityYet', 'אין פעילויות עדיין')}</Text>
              ) : (
                recentActivities.map((activity) => (
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
                ))
              )}
            </View>

            {/* Story Highlights */}
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>{t('profile:sections.highlights')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storyHighlightsContentContainer}
              >
                {(isRealAuth ? [0] : Array.from({ length: 8 }).map((_, i) => i)).map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.storyHighlightItem}
                    onPress={() => {
                      if (i === 0) {
                        Alert.alert(t('profile:alerts.highlight'), t('profile:highlights.new'));
                      } else {
                        Alert.alert(t('profile:alerts.highlight'), t('profile:highlights.highlightIndex', { index: (i + 1).toString() }));
                      }
                    }}
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
        <ScrollContainer
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentStyle={{ ...styles.mainScrollContent, paddingBottom: tabBarHeight + scaleSize(24) }}
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
              <Image source={avatarSource} style={styles.profilePicture} />
            </View>

            <View style={styles.statsContainer}>
              {!isRealAuth && (
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.posts}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  if (!selectedUser?.id) return;
                  (navigation as any).navigate('FollowersScreen', {
                    userId: selectedUser.id,
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
                  if (!selectedUser?.id) return;
                  (navigation as any).navigate('FollowersScreen', {
                    userId: selectedUser.id,
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
                <TouchableWithoutFeedback onPress={() => { }}>
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
            <Text style={styles.fullName}>{selectedUser?.name || ''}</Text>
            {!!selectedUser?.bio && (
              <Text style={styles.bioText}>{selectedUser.bio}</Text>
            )}
            {!!(typeof selectedUser?.location === 'string' ? selectedUser?.location : selectedUser?.location?.city) && (
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />{' '}
                {typeof selectedUser?.location === 'string' ? selectedUser?.location : selectedUser?.location?.city || ''}
              </Text>
            )}

            {/* Karma Points */}
            <View style={styles.karmaSection}>
              <View style={styles.karmaCard}>
                <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
                <Text style={styles.karmaText}>{(isRealAuth ? (selectedUser?.karmaPoints ?? userStats.karmaPoints) : (selectedUser?.karmaPoints || userStats.karmaPoints))} {t('profile:stats.karmaPointsSuffix')}</Text>
              </View>
            </View>

            {/* Activity Icons */}
            {!isRealAuth && (
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
            )}
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
        </ScrollContainer>
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
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.LG,
    flexDirection: 'row-reverse', // RTL alignment for profile info
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
    left: LAYOUT_CONSTANTS.SPACING.SM,
    padding: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: colors.backgroundSecondary,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.1, 4),
    zIndex: 10,
  },
  statsContainer: {
    flexDirection: 'row-reverse', // RTL alignment for stats
    flex: 1,
    justifyContent: 'space-around',
    marginRight: LAYOUT_CONSTANTS.SPACING.LG,
    marginLeft: 0,
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
    textAlign: 'right',
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'right',
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
    textAlign: 'right', // RTL alignment
  },
  bioText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: Math.round(FontSizes.body * 1.4),
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: 'right', // RTL alignment
  },
  locationText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'right', // RTL alignment
  },
  karmaSection: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    alignItems: 'flex-end', // Align to right
  },
  karmaCard: {
    flexDirection: 'row-reverse', // RTL alignment
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    alignSelf: 'flex-end', // Align to right
  },
  karmaText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
    marginLeft: 0,
  },
  activityIcons: {
    flexDirection: 'row-reverse', // RTL alignment
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
    textAlign: 'right',
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
    textAlign: 'right', // RTL alignment
  },
  activityItem: {
    flexDirection: 'row-reverse', // RTL alignment
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
    marginLeft: LAYOUT_CONSTANTS.SPACING.SM,
    marginRight: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'right', // RTL alignment
  },
  activityTime: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'right', // RTL alignment
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

