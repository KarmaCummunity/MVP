import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { allUsers, CharacterType } from '../globals/characterTypes';
import { getFollowStats, followUser, unfollowUser } from '../utils/followService';
import { useUser } from '../context/UserContext';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

type UserProfileRouteParams = {
  userId: string;
  userName: string;
  characterData?: CharacterType;
};

// --- Helper Functions ---
const getRoleDisplayName = (role: string): string => {
  const roleTranslations: Record<string, string> = {
    'user': 'משתמש',
    'donor': 'תורם',
    'volunteer': 'מתנדב',
    'recipient': 'מקבל עזרה',
    'organization': 'עמותה',
    'student': 'סטודנט'
  };
  return roleTranslations[role] || role;
};

// --- Tab Components ---
const PostsRoute = () => (
  <ScrollView contentContainerStyle={styles.tabContentContainer}>
    <View style={styles.postsGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          style={styles.postContainer}
          onPress={() => Alert.alert('פוסט', `פוסט מספר ${i + 1}`)}
        >
          <Image
            source={{ uri: `https://picsum.photos/300/300?random=${i + 100}` }}
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
  </ScrollView>
);

const ReelsRoute = () => (
  <View style={styles.tabContentPlaceholder}>
    <Ionicons name="videocam-outline" size={60} color={colors.textSecondary} />
    <Text style={styles.placeholderText}>אין סרטוני רילס עדיין</Text>
    <Text style={styles.placeholderSubtext}>המשתמש עדיין לא יצר רילס</Text>
  </View>
);

const TaggedRoute = () => (
  <View style={styles.tabContentPlaceholder}>
    <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
    <Text style={styles.placeholderText}>אין תיוגים עדיין</Text>
    <Text style={styles.placeholderSubtext}>כאשר אנשים יתייגו את המשתמש, זה יופיע כאן</Text>
  </View>
);

// --- Main Component ---
export default function UserProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, userName, characterData } = route.params as UserProfileRouteParams;
  const { selectedUser } = useUser();
  
  const [index, setIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'פוסטים' },
    { key: 'reels', title: 'רילס' },
    { key: 'tagged', title: 'תיוגים' },
  ]);

  // Find character data - use passed characterData or search in allUsers
  const character = characterData || allUsers.find(char => char.id === userId);
  // Use character data only (no fallback to old users)
  const user = character;

  // Load follow stats
  useEffect(() => {
    if (user && selectedUser) {
      const stats = getFollowStats(user.id, selectedUser.id);
      setFollowStats(stats);
      setIsFollowing(stats.isFollowing);
    }
  }, [user, selectedUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('👤 UserProfileScreen - Screen focused, refreshing follow stats...');
      if (user && selectedUser) {
        const stats = getFollowStats(user.id, selectedUser.id);
        setFollowStats(stats);
        setIsFollowing(stats.isFollowing);
        
        // Force re-render by updating a timestamp
        const refreshTimestamp = Date.now();
        setFollowStats(prevStats => ({
          ...prevStats,
          refreshTimestamp
        }));
      }
    }, [user, selectedUser])
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
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>משתמש לא נמצא</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.username}>{user.name}</Text>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => Alert.alert('אפשרויות', 'פתיחת אפשרויות')}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.postsCount || 0}</Text>
              <Text style={styles.statLabel}>פוסטים</Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                navigation.navigate('FollowersScreen' as never, {
                  userId: user.id,
                  type: 'followers',
                  title: 'עוקבים'
                } as never);
              }}
            >
              <Text style={styles.statNumber}>{followStats.followersCount}</Text>
              <Text style={styles.statLabel}>עוקבים</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                navigation.navigate('FollowersScreen' as never, {
                  userId: user.id,
                  type: 'following',
                  title: 'עוקב אחרי'
                } as never);
              }}
            >
              <Text style={styles.statNumber}>{followStats.followingCount}</Text>
              <Text style={styles.statLabel}>עוקב אחרי</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.userDetails}>
          <Text style={styles.displayName}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            {' '}{user.location.city}, {user.location.country}
          </Text>
          <Text style={styles.joinDate}>
            הצטרף ב-{new Date(user.joinDate).toLocaleDateString('he-IL')}
          </Text>
          
          {/* Character-specific details */}
          {character && (
            <View style={styles.characterDetails}>
              {/* Verification badge */}
              {character.isVerified && (
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.info} />
                  <Text style={styles.verifiedText}>מאומת</Text>
                </View>
              )}
              
              {/* Roles */}
              <View style={styles.rolesContainer}>
                {character.roles.map((role, index) => (
                  <View key={index} style={styles.roleTag}>
                    <Text style={styles.roleText}>{getRoleDisplayName(role)}</Text>
                  </View>
                ))}
              </View>
              
              {/* Interests */}
              <View style={styles.interestsContainer}>
                <Text style={styles.sectionTitle}>תחומי עניין:</Text>
                <View style={styles.interestsList}>
                  {character.interests.slice(0, 4).map((interest, index) => (
                    <Text key={index} style={styles.interestTag}>#{interest}</Text>
                  ))}
                </View>
              </View>
              
              {/* Activity stats */}
              <View style={styles.activityStats}>
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-done" size={16} color={colors.success} />
                  <Text style={styles.activityText}>{character.completedTasks} משימות הושלמו</Text>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="heart" size={16} color={colors.error} />
                  <Text style={styles.activityText}>{character.totalDonations} תרומות</Text>
                </View>
                {character.receivedDonations > 0 && (
                  <View style={styles.activityItem}>
                    <Ionicons name="gift" size={16} color={colors.warning} />
                    <Text style={styles.activityText}>{character.receivedDonations} עזרות שהתקבלו</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {selectedUser && selectedUser.id !== user.id && (
            <TouchableOpacity 
              style={[
                styles.followButton,
                isFollowing && styles.followingButton
              ]}
              onPress={() => {
                if (!selectedUser) {
                  Alert.alert('שגיאה', 'יש להתחבר תחילה');
                  return;
                }

                if (isFollowing) {
                  // ביטול עקיבה
                  const success = unfollowUser(selectedUser.id, user.id);
                  if (success) {
                    setIsFollowing(false);
                    setFollowStats(prev => ({ ...prev, followersCount: prev.followersCount - 1, isFollowing: false }));
                    Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
                  }
                } else {
                  // התחלת עקיבה
                  const success = followUser(selectedUser.id, user.id);
                  if (success) {
                    setIsFollowing(true);
                    setFollowStats(prev => ({ ...prev, followersCount: prev.followersCount + 1, isFollowing: true }));
                    Alert.alert('עקיבה', 'התחלת לעקוב בהצלחה');
                  }
                }
              }}
            >
              <Text style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText
              ]}>
                {isFollowing ? 'עוקב' : 'עקוב'}
              </Text>
            </TouchableOpacity>
          )}
          
                     <TouchableOpacity 
             style={styles.messageButton}
             onPress={() => {
               // ניווט לצ'אט עם המשתמש
               (navigation as any).navigate('ChatDetailScreen', {
                 conversationId: `conv_${userId}`,
                 otherUserId: userId,
                 otherUserName: user.name,
               });
             }}
           >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.messageButtonText}>הודעה</Text>
          </TouchableOpacity>
        </View>

        {/* Karma Points */}
        <View style={styles.karmaSection}>
          <View style={styles.karmaItem}>
            <Ionicons name="star" size={20} color={colors.orange} />
            <Text style={styles.karmaText}>נקודות קארמה: {user.karmaPoints}</Text>
          </View>
        </View>
        


        {/* Tab View */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    padding: 8,
  },
  username: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  userDetails: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  displayName: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bio: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  location: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: colors.pink,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.textPrimary,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: colors.textPrimary,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  karmaSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  karmaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  karmaText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  tabViewContainer: {
    flex: 1,
    minHeight: 400,
  },
  // New styles for character details
  characterDetails: {
    marginTop: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: FontSizes.small,
    color: colors.info,
    marginLeft: 4,
    fontWeight: '600',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  roleTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: FontSizes.small,
    color: colors.primary,
    fontWeight: '600',
  },
  interestsContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activityStats: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  tabBar: {
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBarIndicator: {
    backgroundColor: colors.pink,
    height: 2,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabBarText: {
    fontSize: FontSizes.body,
    paddingVertical: 12,
  },
  tabContentContainer: { 
    minHeight: 400 
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  postContainer: {
    width: Dimensions.get('window').width / 3 - 2,
    height: Dimensions.get('window').width / 3 - 2,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  postOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  },
}); 