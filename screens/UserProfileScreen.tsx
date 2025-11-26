// File overview:
// - Purpose: View another user's profile with tabs (Posts/Reels/Tagged), follow/unfollow, and messaging.
// - Reached from: Home/Search/Profile/Donations stacks via 'UserProfileScreen'.
// - Expects route params: `{ userId: string, userName: string, characterData?: CharacterType }`.
// - Provides: Loads follow stats and counts, toggles follow state, navigates to 'FollowersScreen' and 'ChatDetailScreen'.
// - Reads from context: `useUser()` -> `selectedUser` to check self vs other and to act on follow.
// - External deps/services: `followService` (stats/update).
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
import { getFollowStats, followUser, unfollowUser, getUpdatedFollowCounts } from '../utils/followService';
import { useUser } from '../stores/userStore';
import ScrollContainer from '../components/ScrollContainer';
import { apiService } from '../utils/apiService';
import { USE_BACKEND } from '../utils/dbConfig';
import { UserPreview as CharacterType } from '../globals/types';
import { createConversation, conversationExists } from '../utils/chatService';

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
  
  // Check if user is viewing their own profile
  useEffect(() => {
    if (selectedUser && selectedUser.id === userId) {
      // Navigate to user's own profile screen
      (navigation as any).navigate('Profile'); // Navigate to ProfileScreen instead
    }
  }, [selectedUser, userId, navigation]);
  
  const [index, setIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [updatedCounts, setUpdatedCounts] = useState({ followersCount: 0, followingCount: 0 });
  const [user, setUser] = useState<CharacterType | null>(characterData || null);
  const [loading, setLoading] = useState(!characterData);
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'פוסטים' },
    { key: 'reels', title: 'רילס' },
    { key: 'tagged', title: 'תיוגים' },
  ]);

  // Load user data from backend if not provided
  useEffect(() => {
    const loadUser = async () => {
      if (!characterData && userId && USE_BACKEND) {
        try {
          setLoading(true);
          const response = await apiService.getUserById(userId);
          if (response.success && response.data) {
            const userData = response.data as any;
            // Map backend user data to CharacterType format
            const mappedUser: CharacterType = {
              id: userData.id,
              name: userData.name || userName || 'ללא שם',
              avatar: userData.avatar_url || userData.avatar || 'https://i.pravatar.cc/150?img=1',
              bio: userData.bio || '',
              karmaPoints: userData.karma_points || 0,
              completedTasks: 0,
              roles: userData.roles || ['user'],
              isVerified: userData.is_verified || false,
              location: userData.city ? {
                city: userData.city,
                country: userData.country || 'ישראל'
              } : { city: 'ישראל', country: 'IL' },
              joinDate: userData.join_date || userData.created_at || new Date().toISOString(),
              interests: userData.interests || [],
            };
            setUser(mappedUser);
          } else {
            // User not found - set user to null to show error message
            console.warn('User not found:', userId);
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Load user error:', error);
          // Only set fallback if we have userName, otherwise show error
          if (userName && userName !== 'משתמש לא ידוע') {
            setUser({
              id: userId,
              name: userName || 'ללא שם',
              avatar: 'https://i.pravatar.cc/150?img=1',
              bio: '',
              karmaPoints: 0,
              completedTasks: 0,
              roles: ['user'],
              isVerified: false,
              location: { city: 'ישראל', country: 'IL' },
              joinDate: new Date().toISOString(),
              interests: [],
            });
          } else {
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      } else if (characterData) {
        setUser(characterData);
        setLoading(false);
      } else if (!USE_BACKEND && userId && userName) {
        // Fallback for non-backend mode
        setUser({
          id: userId,
          name: userName || 'ללא שם',
          avatar: 'https://i.pravatar.cc/150?img=1',
          bio: '',
          karmaPoints: 0,
          completedTasks: 0,
          roles: ['user'],
          isVerified: false,
          location: { city: 'ישראל', country: 'IL' },
          joinDate: new Date().toISOString(),
          interests: [],
        });
        setLoading(false);
      }
    };
    
    loadUser();
  }, [userId, userName, characterData]);

  // Reset state when userId changes
  useEffect(() => {
    console.log('👤 UserProfileScreen - userId changed:', userId);
    setIsFollowing(false);
    setFollowStats({ followersCount: 0, followingCount: 0, isFollowing: false });
    setUpdatedCounts({ followersCount: 0, followingCount: 0 });
  }, [userId]);

  // Load follow stats
  useEffect(() => {
    const loadFollowStats = async () => {
      if (user && selectedUser && user.id) {
        try {
          console.log('👤 UserProfileScreen - Loading follow stats for user:', user.name);
          const stats = await getFollowStats(user.id, selectedUser.id);
          const counts = await getUpdatedFollowCounts(user.id);
          setFollowStats(stats);
          setUpdatedCounts(counts);
          setIsFollowing(stats.isFollowing);
        } catch (error) {
          console.error('❌ Load follow stats error:', error);
        }
      }
    };
    
    loadFollowStats();
  }, [user, selectedUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshFollowStats = async () => {
        console.log('👤 UserProfileScreen - Screen focused, refreshing follow stats...');
        if (user && selectedUser && user.id) {
          try {
            const stats = await getFollowStats(user.id, selectedUser.id);
            const counts = await getUpdatedFollowCounts(user.id);
            setFollowStats(stats);
            setUpdatedCounts(counts);
            setIsFollowing(stats.isFollowing);
            
            // Force re-render by updating a timestamp
            const refreshTimestamp = Date.now();
            setFollowStats(prevStats => ({
              ...prevStats,
              refreshTimestamp
            }));
          } catch (error) {
            console.error('❌ Refresh follow stats error:', error);
          }
        }
      };
      
      refreshFollowStats();
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="hourglass-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>משתמש לא נמצא</Text>
          <Text style={styles.errorSubtext}>userId: {userId}</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('👤 UserProfileScreen - Rendering profile for user:', user?.name || userName, 'userId:', userId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.username}>{user?.name || userName || 'ללא שם'}</Text>
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
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{(user as any)?.postsCount || 0}</Text>
              <Text style={styles.statLabel}>פוסטים</Text>
            </View>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                if (user?.id) {
                  (navigation as any).navigate('FollowersScreen', {
                    userId: user.id,
                    type: 'followers',
                    title: 'עוקבים'
                  });
                }
              }}
            >
              <Text style={styles.statNumber}>{updatedCounts.followersCount}</Text>
              <Text style={styles.statLabel}>עוקבים</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => {
                if (user?.id) {
                  (navigation as any).navigate('FollowersScreen', {
                    userId: user.id,
                    type: 'following',
                    title: 'עוקב אחרי'
                  });
                }
              }}
            >
              <Text style={styles.statNumber}>{updatedCounts.followingCount}</Text>
              <Text style={styles.statLabel}>עוקב אחרי</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.userDetails}>
          <Text style={styles.displayName}>{user?.name || userName || 'ללא שם'}</Text>
          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
          {user?.location && user.location.city && (
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              {' '}{user.location.city}{user.location.country ? `, ${user.location.country}` : ''}
            </Text>
          )}
          {user?.joinDate && (
            <Text style={styles.joinDate}>
              הצטרף ב-{new Date(user.joinDate).toLocaleDateString('he-IL')}
            </Text>
          )}
          
          {/* Character-specific details */}
          {user && (
            <View style={styles.characterDetails}>
              {/* Verification badge */}
              {user.isVerified && (
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.info} />
                  <Text style={styles.verifiedText}>מאומת</Text>
                </View>
              )}
              
              {/* Roles */}
              {user.roles && user.roles.length > 0 && (
                <View style={styles.rolesContainer}>
                  {user.roles.map((role, index) => (
                    <View key={index} style={styles.roleTag}>
                      <Text style={styles.roleText}>{getRoleDisplayName(role)}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <Text style={styles.sectionTitle}>תחומי עניין:</Text>
                  <View style={styles.interestsList}>
                    {user.interests.slice(0, 4).map((interest, index) => (
                      <Text key={index} style={styles.interestTag}>#{interest}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Activity stats */}
              <View style={styles.activityStats}>
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-done" size={16} color={colors.success} />
                  <Text style={styles.activityText}>{user.completedTasks || 0} משימות הושלמו</Text>
                </View>
                {(user as any).totalDonations !== undefined && (
                  <View style={styles.activityItem}>
                    <Ionicons name="heart" size={16} color={colors.error} />
                    <Text style={styles.activityText}>{(user as any).totalDonations} תרומות</Text>
                  </View>
                )}
                {(user as any).receivedDonations > 0 && (
                  <View style={styles.activityItem}>
                    <Ionicons name="gift" size={16} color={colors.warning} />
                    <Text style={styles.activityText}>{(user as any).receivedDonations} עזרות שהתקבלו</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {selectedUser && user && selectedUser.id !== user.id && (
            <TouchableOpacity 
              style={[
                styles.followButton,
                isFollowing && styles.followingButton
              ]}
              onPress={async () => {
                if (!selectedUser) {
                  Alert.alert('שגיאה', 'יש להתחבר תחילה');
                  return;
                }

                try {
                  if (!user?.id) {
                    Alert.alert('שגיאה', 'משתמש לא נמצא');
                    return;
                  }
                  
                  if (isFollowing) {
                    const success = await unfollowUser(selectedUser.id, user.id);
                    if (success) {
                      setIsFollowing(false);
                      const newCounts = await getUpdatedFollowCounts(user.id);
                      setUpdatedCounts(newCounts);
                      setFollowStats(prev => ({ ...prev, isFollowing: false }));
                      Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
                    }
                  } else {
                    const success = await followUser(selectedUser.id, user.id);
                    if (success) {
                      setIsFollowing(true);
                      const newCounts = await getUpdatedFollowCounts(user.id);
                      setUpdatedCounts(newCounts);
                      setFollowStats(prev => ({ ...prev, isFollowing: true }));
                      Alert.alert('עקיבה', 'התחלת לעקוב בהצלחה');
                    }
                  }
                } catch (error) {
                  console.error('❌ Follow/Unfollow error:', error);
                  Alert.alert('שגיאה', 'אירעה שגיאה בביצוע הפעולה');
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
          
          {user && (
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={async () => {
                if (!selectedUser) {
                  Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
                  return;
                }

                try {
                  const existingConvId = await conversationExists(selectedUser.id, userId);
                  let conversationId: string;
                  
                  if (existingConvId) {
                    console.log('💬 Conversation already exists:', existingConvId);
                    conversationId = existingConvId;
                  } else {
                    console.log('💬 Creating new conversation...');
                    conversationId = await createConversation([selectedUser.id, userId]);
                  }
                  
                  (navigation as any).navigate('ChatDetailScreen', {
                    conversationId,
                    otherUserId: userId,
                    userName: user.name || userName || 'ללא שם',
                    userAvatar: user.avatar || 'https://i.pravatar.cc/150?img=1',
                  });
                } catch (error) {
                  console.error('❌ Create chat error:', error);
                  Alert.alert('שגיאה', 'שגיאה ביצירת השיחה');
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.messageButtonText}>הודעה</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Karma Points */}
        {user && (
          <View style={styles.karmaSection}>
            <View style={styles.karmaItem}>
              <Ionicons name="star" size={20} color={colors.orange} />
              <Text style={styles.karmaText}>נקודות קארמה: {user.karmaPoints || 0}</Text>
            </View>
          </View>
        )}
        


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
      </ScrollContainer>
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
  errorSubtext: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 8,
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