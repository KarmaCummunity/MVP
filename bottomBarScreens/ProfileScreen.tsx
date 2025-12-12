// File overview:
// - Purpose: Unified profile screen that works for both own profile and other users' profiles.
// - Reached from: `ProfileTabStack` initial route 'ProfileScreen' via `BottomNavigator` (own profile) or via navigation with params (other user's profile).
// - Provides: Navigation to Followers lists, Bookmarks, Notifications, Edit Profile, Discover People, Follow/Unfollow, Message, and (in demo) random persona selection and sample data creation.
// - Reads from context: `useUser()` -> `selectedUser`, `setSelectedUserWithMode`, `isRealAuth`.
// - Route params: Optional `{ userId?: string, userName?: string, characterData?: CharacterType }` for viewing other users' profiles.
// - External deps/services: `followService` (stats and sample), `chatService` (sample chats), `apiService` (load user data), i18n translations.
// - Notes: Hides or adapts certain demo-only features when `isRealAuth` is true. Shows different UI elements based on whether viewing own profile or other user's profile.
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
import { useNavigation, useFocusEffect, useRoute, useNavigationState } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '../stores/userStore';
import ScrollContainer from '../components/ScrollContainer';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import ItemDetailsModal from '../components/ItemDetailsModal';
import { createShadowStyle } from '../globals/styles';
import { scaleSize } from '../globals/responsive';
import { getFollowStats, followUser, unfollowUser, createSampleFollowData, getUpdatedFollowCounts } from '../utils/followService';
import { createSampleChatData, createConversation, conversationExists } from '../utils/chatService';
import { enhancedDB } from '../utils/enhancedDatabaseService';
import { apiService } from '../utils/apiService';
import { USE_BACKEND } from '../utils/dbConfig';
import { UserPreview as CharacterType } from '../globals/types';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

type ProfileScreenRouteParams = {
  userId?: string;
  userName?: string;
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
const PostsRoute = ({ userId }: { userId?: string }) => {
  const { t } = useTranslation(['profile']);
  const { selectedUser } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { db } = require('../utils/databaseService');

  // Use provided userId or fallback to selectedUser.id
  const targetUserId = userId || selectedUser?.id;

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📱 PostsRoute - Loading posts for userId:', targetUserId);

        // Load posts from database
        let userPosts: any[] = [];
        try {
          userPosts = await db.getUserPosts(targetUserId) || [];
          console.log('📱 PostsRoute - Loaded posts from DB:', userPosts.length);
        } catch (error) {
          console.error('Error loading posts from DB:', error);
        }

        // Load items from API
        const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
        let userItems: any[] = [];
        if (USE_BACKEND && API_BASE_URL) {
          try {
            const axios = (await import('axios')).default;
            console.log('📱 PostsRoute - Loading items from API for owner_id:', targetUserId);
            const response = await axios.get(`${API_BASE_URL}/api/items-delivery/search`, {
              params: {
                owner_id: targetUserId,
                status: 'available',
                limit: 50,
              }
            });
            if (response.data?.success && Array.isArray(response.data.data)) {
              userItems = response.data.data;
              console.log('📱 PostsRoute - Loaded items from API:', userItems.length);
            } else {
              console.warn('📱 PostsRoute - API response not successful or not array:', response.data);
            }
          } catch (error) {
            console.error('Error loading items from API:', error);
          }
        } else {
          // Fallback to local database
          try {
            userItems = await db.getDedicatedItemsByOwner(targetUserId) || [];
            console.log('📱 PostsRoute - Loaded items from local DB:', userItems.length);
          } catch (error) {
            console.error('Error loading items from local DB:', error);
          }
        }

        // Load rides
        let userRides: any[] = [];
        try {
          const allRides = await enhancedDB.getRides({});
          userRides = allRides.filter((ride: any) => {
            const createdBy = ride.createdBy || ride.created_by || ride.driver_id || ride.driverId;
            return createdBy === targetUserId;
          });
          console.log('📱 PostsRoute - Loaded rides:', userRides.length);
        } catch (error) {
          console.error('Error loading rides:', error);
        }

        // Combine posts, items, and rides
        const allPosts = [
          ...(userPosts || []),
          ...userItems.map((item: any) => {
            // Process image_base64 - check if prefix already exists
            let thumbnail = '';
            if (item.image_base64) {
              const imageData = item.image_base64;
              // Check if it's already a data URI or URL
              if (imageData.startsWith('data:image') || imageData.startsWith('http')) {
                // Already has prefix or is a URL - use as is
                thumbnail = imageData;
              } else if (imageData.length > 100) {
                // Valid base64 string without prefix - add prefix
                thumbnail = `data:image/jpeg;base64,${imageData}`;
              }
              // If image_base64 is too short or invalid, thumbnail remains empty
            }
            
            return {
              id: `item_${item.id}`,
              title: item.title,
              thumbnail: thumbnail,
              likes: 0,
              type: 'item'
            };
          }),
          ...userRides.map((ride: any) => {
            const fromLocation = ride.from || ride.from_location?.name || ride.from_location?.city || '';
            const toLocation = ride.to || ride.to_location?.name || ride.to_location?.city || '';
            return {
              id: `ride_${ride.id}`,
              title: `טרמפ: ${fromLocation} ➝ ${toLocation}`,
              thumbnail: ride.image || '', // Rides usually don't have images
              likes: 0,
              type: 'ride',
              from: fromLocation,
              to: toLocation,
              rawData: ride
            };
          })
        ];

        console.log('📱 PostsRoute - Total posts/items:', allPosts.length);
        setPosts(allPosts);
        setItems(userItems);
      } catch (error) {
        console.error('Error loading user posts:', error);
        setPosts([]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserPosts();
  }, [targetUserId]);

  if (loading) {
    return (
      <View style={styles.tabContentPlaceholder}>
        <Text style={styles.placeholderText}>{t('profile:posts.loading', 'טוען פוסטים...')}</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.tabContentPlaceholder}>
        <Ionicons name="images-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.placeholderText}>{t('profile:posts.noPostsYet', 'אין פוסטים עדיין')}</Text>
        <Text style={styles.placeholderSubtext}>{t('profile:posts.createFirstPost', 'הפוסטים שלך יופיעו כאן')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tabContentContainer}>
      <View style={styles.postsGrid}>
        {posts.map((post, i) => (
          <TouchableOpacity
            key={post.id || i}
            style={styles.postContainer}
            onPress={() => Alert.alert(t('profile:alerts.post'), post.title || t('profile:alerts.postNumber', { number: (i + 1).toString() }))}
          >
            {post.thumbnail || post.image ? (
              <Image
                source={{ uri: post.thumbnail || post.image }}
                style={styles.postImage}
              />
            ) : post.type === 'ride' ? (
              // Special display for rides without image
              <View style={[styles.postImage, styles.ridePlaceholder]}>
                <Ionicons name="car-sport" size={scaleSize(32)} color={colors.info} />
                {post.from && post.to && (
                  <View style={styles.rideDetailsContainer}>
                    <Text style={styles.rideDetailsText} numberOfLines={1}>
                      {post.from}
                    </Text>
                    <Ionicons name="arrow-forward" size={scaleSize(12)} color={colors.textSecondary} style={styles.rideArrow} />
                    <Text style={styles.rideDetailsText} numberOfLines={1}>
                      {post.to}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.postImage, { backgroundColor: colors.backgroundTertiary, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.postOverlay}>
              <View style={styles.postStats}>
                <Ionicons name="heart" size={16} color={colors.white} />
                <Text style={styles.postStatsText}>{post.likes || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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

// Internal component that contains all the logic
// It receives tabBarHeight as a prop so we can control it from outside
function ProfileScreenContent({ tabBarHeight }: { tabBarHeight: number }) {
  const route = useRoute();
  const { t } = useTranslation(['profile', 'common']);
  const { selectedUser, setSelectedUserWithMode, isRealAuth } = useUser();
  const navigation = useNavigation();
  const defaultLogo = require('../assets/images/android-chrome-192x192.png');
  
  // Get route params for viewing other users' profiles
  const routeParams = route.params as ProfileScreenRouteParams | undefined;
  const { userId: externalUserId, userName: externalUserName, characterData: externalCharacterData } = routeParams || {};
  
  // Determine if viewing own profile or other user's profile
  // CRITICAL: If externalUserId exists and equals selectedUser.id, it's OWN profile!
  // Only if externalUserId exists and is DIFFERENT from selectedUser.id, it's another user's profile
  // If no externalUserId, it's own profile (default)
  
  // Normalize IDs to strings for comparison (in case one is number and one is string)
  const normalizedExternalUserId = externalUserId ? String(externalUserId).trim() : null;
  const normalizedSelectedUserId = selectedUser?.id ? String(selectedUser.id).trim() : null;
  
  // Check if viewing own profile: no externalUserId OR externalUserId equals selectedUser.id
  const isOwnProfile = !normalizedExternalUserId || 
                       (normalizedExternalUserId === normalizedSelectedUserId);
  const targetUserId = externalUserId || selectedUser?.id;
  
  // Debug log to help identify the issue
  console.log('👤 ProfileScreenContent - Profile check:', {
    externalUserId,
    normalizedExternalUserId,
    selectedUserId: selectedUser?.id,
    normalizedSelectedUserId,
    isOwnProfile,
    areEqual: normalizedExternalUserId === normalizedSelectedUserId,
    hasExternalUserId: !!externalUserId,
    hasSelectedUser: !!selectedUser
  });
  
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
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // State for viewing other user's profile
  const [viewingUser, setViewingUser] = useState<CharacterType | null>(externalCharacterData || null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [updatedCounts, setUpdatedCounts] = useState({ followersCount: 0, followingCount: 0 });
  const [loadingUser, setLoadingUser] = useState(!isOwnProfile && !externalCharacterData);
  
  // The user to display (either selectedUser for own profile, or viewingUser for other user's profile)
  const displayUser = isOwnProfile ? selectedUser : viewingUser;

  // Load user data from backend if viewing other user's profile
  useEffect(() => {
    const loadUser = async () => {
      if (isOwnProfile || !externalUserId) return;
      
      if (!externalCharacterData && externalUserId && USE_BACKEND) {
        try {
          setLoadingUser(true);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileScreen.tsx:315',message:'Loading user profile',data:{externalUserId,externalUserIdType:typeof externalUserId,selectedUserId:selectedUser?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          const response = await apiService.getUserById(externalUserId);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileScreen.tsx:316',message:'User profile response',data:{success:response.success,hasData:!!response.data,userId:response.data?.id,userEmail:response.data?.email,userAvatar:response.data?.avatar_url,externalUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          if (response.success && response.data) {
            const userData = response.data as any;
            const mappedUser: CharacterType = {
              id: userData.id,
              name: userData.name || externalUserName || 'ללא שם',
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
            setViewingUser(mappedUser);
          } else {
            console.warn('User not found:', externalUserId);
            setViewingUser(null);
          }
        } catch (error) {
          console.error('❌ Load user error:', error);
          if (externalUserName && externalUserName !== 'משתמש לא ידוע') {
            setViewingUser({
              id: externalUserId,
              name: externalUserName || 'ללא שם',
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
            setViewingUser(null);
          }
        } finally {
          setLoadingUser(false);
        }
      } else if (externalCharacterData) {
        setViewingUser(externalCharacterData);
        setLoadingUser(false);
      } else if (!USE_BACKEND && externalUserId && externalUserName) {
        setViewingUser({
          id: externalUserId,
          name: externalUserName || 'ללא שם',
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
        setLoadingUser(false);
      }
    };
    
    loadUser();
  }, [externalUserId, externalUserName, externalCharacterData, isOwnProfile]);

  // Load follow stats when viewing other user's profile
  useEffect(() => {
    const loadFollowStats = async () => {
      if (isOwnProfile || !viewingUser || !selectedUser || !viewingUser.id) return;
      
      try {
        console.log('👤 ProfileScreen - Loading follow stats for user:', viewingUser.name);
        const stats = await getFollowStats(viewingUser.id, selectedUser.id);
        const counts = await getUpdatedFollowCounts(viewingUser.id);
        setFollowStats(stats);
        setUpdatedCounts(counts);
        setIsFollowing(stats.isFollowing);
      } catch (error) {
        console.error('❌ Load follow stats error:', error);
      }
    };
    
    loadFollowStats();
  }, [viewingUser, selectedUser, isOwnProfile]);

  // Function to update user statistics
  const updateUserStats = async () => {
    try {
      const userIdToUse = isOwnProfile ? selectedUser?.id : viewingUser?.id;
      if (!userIdToUse) {
        console.warn('⚠️ No user ID, skipping stats update');
        return;
      }
      
      const currentUserStats = await getFollowStats(userIdToUse, userIdToUse);
      const userToUse = isOwnProfile ? selectedUser : viewingUser;

      setUserStats({
        posts: (userToUse as any)?.postsCount || 0,
        followers: currentUserStats.followersCount,
        following: currentUserStats.followingCount,
        karmaPoints: userToUse?.karmaPoints || 0,
        completedTasks: (userToUse as any)?.completedTasks || 0,
        totalDonations: (userToUse as any)?.totalDonations || 0,
      });
    } catch (error) {
      console.error('❌ Update user stats error:', error);
    }
  };

  // Function to load recent user activities from database (only for own profile)
  const loadRecentActivities = async () => {
    try {
      if (!isOwnProfile) {
        setRecentActivities([]);
        return;
      }
      
      if (!selectedUser?.id) {
        setRecentActivities([]);
        return;
      }

      const activities: any[] = [];
      const userId = selectedUser.id;

      // Load posts
      try {
        const { db } = require('../utils/databaseService');
        const userPosts = await db.getUserPosts(userId) || [];
        userPosts.forEach((post: any) => {
          activities.push({
            id: `post_${post.id}`,
            type: 'post',
            title: post.title || post.content || 'פוסט חדש',
            time: post.created_at || post.createdAt || new Date().toISOString(),
            icon: 'image-outline',
            color: colors.info,
            rawData: post
          });
        });
      } catch (error) {
        console.error('Error loading posts:', error);
      }

      // Load items/donations
      try {
        const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
        let userItems: any[] = [];
        
        if (USE_BACKEND && API_BASE_URL) {
          try {
            const axios = (await import('axios')).default;
            const response = await axios.get(`${API_BASE_URL}/api/items-delivery/search`, {
              params: {
                owner_id: userId,
                limit: 20,
              }
            });
            if (response.data?.success && Array.isArray(response.data.data)) {
              userItems = response.data.data;
            }
          } catch (error) {
            console.error('Error loading items from API:', error);
          }
        } else {
          const { db } = require('../utils/databaseService');
          userItems = await db.getDedicatedItemsByOwner(userId) || [];
        }

        userItems.forEach((item: any) => {
          activities.push({
            id: `item_${item.id}`,
            type: 'item',
            title: item.title || 'פריט חדש',
            time: item.created_at || item.createdAt || new Date().toISOString(),
            icon: 'cube-outline',
            color: colors.pink,
            rawData: item
          });
        });
      } catch (error) {
        console.error('Error loading items:', error);
      }

      // Load donations - filter by createdBy after loading
      try {
        const allDonations = await enhancedDB.getDonations({});
        const userDonations = allDonations.filter((donation: any) => {
          const createdBy = donation.createdBy || donation.created_by || donation.donor_id || donation.donorId;
          return createdBy === userId;
        });
        
        userDonations.forEach((donation: any) => {
          const donationTitle = donation.type === 'money' 
            ? `תרומה: ${donation.amount || 0} ₪`
            : donation.type === 'time'
            ? `התנדבות: ${donation.title || ''}`
            : donation.type === 'trump'
            ? `טרמפ: ${donation.title || ''}`
            : donation.title || 'תרומה חדשה';
          
          activities.push({
            id: `donation_${donation.id}`,
            type: 'donation',
            title: donationTitle,
            time: donation.created_at || donation.createdAt || new Date().toISOString(),
            icon: 'heart-outline',
            color: colors.error,
            rawData: donation
          });
        });
      } catch (error) {
        console.error('Error loading donations:', error);
      }

      // Load rides - filter by createdBy after loading
      try {
        const allRides = await enhancedDB.getRides({});
        const userRides = allRides.filter((ride: any) => {
          const createdBy = ride.createdBy || ride.created_by || ride.driver_id || ride.driverId;
          return createdBy === userId;
        });
        
        userRides.forEach((ride: any) => {
          const fromLocation = ride.from || ride.from_location?.name || ride.from_location?.city || 'לא צויין';
          const toLocation = ride.to || ride.to_location?.name || ride.to_location?.city || 'לא צויין';
          activities.push({
            id: `ride_${ride.id}`,
            type: 'ride',
            title: `טרמפ: ${fromLocation} ➝ ${toLocation}`,
            time: ride.created_at || ride.createdAt || new Date().toISOString(),
            icon: 'car-sport-outline',
            color: colors.info,
            rawData: ride
          });
        });
      } catch (error) {
        console.error('Error loading rides:', error);
      }

      // Sort by time (newest first) and limit to 10
      activities.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });

      // Format time for display
      const formattedActivities = activities.slice(0, 10).map(activity => {
        const activityTime = new Date(activity.time);
        const now = new Date();
        const diffMs = now.getTime() - activityTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeText = '';
        if (diffMins < 1) {
          timeText = 'לפני רגע';
        } else if (diffMins < 60) {
          timeText = `לפני ${diffMins} דקות`;
        } else if (diffHours < 24) {
          timeText = `לפני ${diffHours} שעות`;
        } else if (diffDays < 7) {
          timeText = `לפני ${diffDays} ימים`;
        } else {
          timeText = activityTime.toLocaleDateString('he-IL');
        }

        return {
          ...activity,
          time: timeText
        };
      });

      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('❌ Load recent activities error:', error);
      setRecentActivities([]);
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
    { key: 'tagged', title: 'tagged' },
  ]);

  // Update stats when user changes
  useEffect(() => {
    const updateStats = async () => {
      await updateUserStats();
    };
    updateStats();
  }, [selectedUser, viewingUser, isOwnProfile]);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshStats = async () => {
        console.log('👤 ProfileScreen - Screen focused, refreshing stats...', { isOwnProfile, targetUserId });
        await updateUserStats();
        if (isOwnProfile) {
          await loadRecentActivities();
        } else if (viewingUser && selectedUser) {
          // Refresh follow stats for other user's profile
          try {
            const stats = await getFollowStats(viewingUser.id, selectedUser.id);
            const counts = await getUpdatedFollowCounts(viewingUser.id);
            setFollowStats(stats);
            setUpdatedCounts(counts);
            setIsFollowing(stats.isFollowing);
          } catch (error) {
            console.error('❌ Refresh follow stats error:', error);
          }
        }

        // Force re-render by updating a timestamp
        const refreshTimestamp = Date.now();
        setUserStats(prevStats => ({
          ...prevStats,
          refreshTimestamp
        }));
      };
      refreshStats();
    }, [selectedUser, viewingUser, isOwnProfile, targetUserId])
  );

  // Load activities when selectedUser changes (only for own profile)
  useEffect(() => {
    if (isOwnProfile) {
      loadRecentActivities();
    }
  }, [selectedUser, isOwnProfile]);

  const renderScene = ({ route: sceneRoute }: SceneRendererProps & { route: TabRoute }) => {
    switch (sceneRoute.key) {
      case 'posts':
        return <PostsRoute userId={targetUserId} />;
      case 'reels':
        return <ReelsRoute />;
      case 'tagged':
        return <TaggedRoute />;
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarInner}>
        {props.navigationState.routes.map((route, index) => {
          const isFocused = props.navigationState.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabBarItem}
              onPress={() => props.jumpTo(route.key)}
            >
              <Text
                style={[
                  styles.tabBarText,
                  {
                    color: isFocused ? colors.secondary : colors.textSecondary,
                    fontWeight: isFocused ? 'bold' : 'normal',
                  }
                ]}
              >
                {t(`profile:tabs.${route.key}`, route.title)}
              </Text>
              {isFocused && <View style={styles.tabBarIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // User Statistics are now managed by state and updated via useFocusEffect
  // Recent Activities are now loaded from database (see loadRecentActivities function)

  // Derived display values
  // #region agent log
  const logAvatar = () => {
    fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileScreen.tsx:734',message:'Avatar source determination',data:{displayUserId:displayUser?.id,displayUserAvatar:displayUser?.avatar,hasAvatar:!!displayUser?.avatar,isOwnProfile,selectedUserAvatar:selectedUser?.avatar},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  };
  logAvatar();
  // #endregion
  const avatarSource = displayUser?.avatar ? { uri: displayUser.avatar } : defaultLogo;
  
  // Show error if viewing other user's profile and user not found
  if (!isOwnProfile && !loadingUser && !viewingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>משתמש לא נמצא</Text>
          <Text style={styles.errorSubtext}>userId: {externalUserId}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                (navigation as any).navigate('HomeStack');
              }
            }}
          >
            <Ionicons name="home" size={20} color={colors.white} />
            <Text style={styles.backButtonText}>חזרה לעמוד הבית</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show loading if loading other user's profile
  if (!isOwnProfile && loadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="hourglass-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {/* Header for other user's profile */}
            {!isOwnProfile && (
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.headerIcon}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.username}>{displayUser?.name || externalUserName || 'ללא שם'}</Text>
                <TouchableOpacity 
                  style={styles.headerIcon}
                  onPress={() => Alert.alert('אפשרויות', 'פתיחת אפשרויות')}
                >
                  <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Completion Banner - only for own profile */}
            {isOwnProfile && <ProfileCompletionBanner />}
            
            {/* Profile Info with Menu Icon */}
            <View style={styles.profileInfo}>
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.menuIcon}
                  onPress={() => setShowMenu(!showMenu)}
                >
                  <Ionicons name="menu" size={scaleSize(24)} color={colors.textPrimary} />
                </TouchableOpacity>
              )}
              <View style={styles.profileSection}>
                <Image source={avatarSource} style={styles.profilePicture} />
              </View>

              <View style={styles.statsContainer}>
                {isOwnProfile && !isRealAuth && (
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userStats.posts}</Text>
                    <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                  </View>
                )}
                {!isOwnProfile && (
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{(displayUser as any)?.postsCount || 0}</Text>
                    <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => {
                    if (!targetUserId) return;
                    (navigation as any).navigate('FollowersScreen', {
                      userId: targetUserId,
                      type: 'followers',
                      title: t('profile:followersTitle')
                    });
                  }}
                >
                  <Text style={styles.statNumber}>{isOwnProfile ? userStats.followers : updatedCounts.followersCount}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.followers')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => {
                    if (!targetUserId) return;
                    (navigation as any).navigate('FollowersScreen', {
                      userId: targetUserId,
                      type: 'following',
                      title: t('profile:followingTitle')
                    });
                  }}
                >
                  <Text style={styles.statNumber}>{isOwnProfile ? userStats.following : updatedCounts.followingCount}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.following')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Modal with Backdrop - only for own profile */}
            {isOwnProfile && showMenu && (
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
              <Text style={styles.fullName}>{displayUser?.name || externalUserName || ''}</Text>
              {!!displayUser?.bio && (
                <Text style={styles.bioText}>{displayUser.bio}</Text>
              )}
              {!!(typeof displayUser?.location === 'string' ? displayUser?.location : displayUser?.location?.city) && (
                <Text style={styles.locationText}>
                  <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />{' '}
                  {typeof displayUser?.location === 'string' ? displayUser?.location : displayUser?.location?.city || ''}
                </Text>
              )}
              
              {/* Additional user details for other user's profile */}
              {!isOwnProfile && displayUser && (
                <View style={styles.characterDetails}>
                  {/* Verification badge */}
                  {(displayUser as CharacterType).isVerified && (
                    <View style={styles.verificationBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.info} />
                      <Text style={styles.verifiedText}>מאומת</Text>
                    </View>
                  )}
                  
                  {/* Roles */}
                  {displayUser.roles && displayUser.roles.length > 0 && (
                    <View style={styles.rolesContainer}>
                      {displayUser.roles.map((role, index) => (
                        <View key={index} style={styles.roleTag}>
                          <Text style={styles.roleText}>{getRoleDisplayName(role)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Interests */}
                  {displayUser.interests && displayUser.interests.length > 0 && (
                    <View style={styles.interestsContainer}>
                      <Text style={styles.sectionTitle}>תחומי עניין:</Text>
                      <View style={styles.interestsList}>
                        {displayUser.interests.slice(0, 4).map((interest, index) => (
                          <Text key={index} style={styles.interestTag}>#{interest}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {/* Join date */}
                  {displayUser.joinDate && (
                    <Text style={styles.joinDate}>
                      הצטרף ב-{new Date(displayUser.joinDate).toLocaleDateString('he-IL')}
                    </Text>
                  )}
                </View>
              )}

              {/* Karma Points */}
              <View style={styles.karmaSection}>
                <View style={styles.karmaCard}>
                  <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
                  <Text style={styles.karmaText}>{(displayUser?.karmaPoints || userStats.karmaPoints)} {t('profile:stats.karmaPointsSuffix')}</Text>
                </View>
              </View>

              {/* Activity Icons - only for own profile */}
              {isOwnProfile && !isRealAuth && (
                <View style={styles.activityIcons}>
                  <TouchableOpacity
                    style={styles.activityIconItem}
                    onPress={() => Alert.alert(t('profile:alerts.activity'), t('profile:alerts.viewActivity'))}
                  >
                    <Ionicons name="star-outline" size={scaleSize(24)} color={colors.secondary} />
                    <Text style={styles.activityIconText}>{t('profile:activity')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.activityIconItem}
                    onPress={() => Alert.alert(t('profile:alerts.history'), t('profile:alerts.activityHistory'))}
                  >
                    <MaterialCommunityIcons name="history" size={scaleSize(24)} color={colors.secondary} />
                    <Text style={styles.activityIconText}>{t('profile:history')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.activityIconItem}
                    onPress={() => Alert.alert(t('profile:alerts.favorites'), t('profile:alerts.yourFavorites'))}
                  >
                    <Ionicons name="heart-outline" size={scaleSize(24)} color={colors.secondary} />
                    <Text style={styles.activityIconText}>{t('profile:favorites')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {isOwnProfile ? (
                <>
                  <TouchableOpacity
                    style={styles.discoverPeopleButton}
                    onPress={() => {
                      navigation.navigate('DiscoverPeopleScreen' as never);
                    }}
                  >
                    <Ionicons name="person-add-outline" size={scaleSize(18)} color={colors.white} />
                    <Text style={styles.discoverPeopleText}>{t('profile:discoverPeople')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {selectedUser && displayUser && selectedUser.id !== displayUser.id && (
                    <>
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
                            if (!displayUser?.id) {
                              Alert.alert('שגיאה', 'משתמש לא נמצא');
                              return;
                            }
                            
                            if (isFollowing) {
                              const success = await unfollowUser(selectedUser.id, displayUser.id);
                              if (success) {
                                setIsFollowing(false);
                                const newCounts = await getUpdatedFollowCounts(displayUser.id);
                                setUpdatedCounts(newCounts);
                                setFollowStats(prev => ({ ...prev, isFollowing: false }));
                                Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
                              }
                            } else {
                              const success = await followUser(selectedUser.id, displayUser.id);
                              if (success) {
                                setIsFollowing(true);
                                const newCounts = await getUpdatedFollowCounts(displayUser.id);
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
                      
                      <TouchableOpacity 
                        style={styles.messageButton}
                        onPress={async () => {
                          if (!selectedUser) {
                            Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
                            return;
                          }

                          try {
                            const existingConvId = await conversationExists(selectedUser.id, displayUser.id!);
                            let conversationId: string;
                            
                            if (existingConvId) {
                              console.log('💬 Conversation already exists:', existingConvId);
                              conversationId = existingConvId;
                            } else {
                              console.log('💬 Creating new conversation...');
                              conversationId = await createConversation([selectedUser.id, displayUser.id!]);
                            }
                            
                            (navigation as any).navigate('ChatDetailScreen', {
                              conversationId,
                              otherUserId: displayUser.id,
                              userName: displayUser.name || externalUserName || 'ללא שם',
                              userAvatar: displayUser.avatar || 'https://i.pravatar.cc/150?img=1',
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
                    </>
                  )}
                </>
              )}
            </View>

            {/* Recent Activities - only for own profile */}
            {isOwnProfile && (
              <View style={styles.activitiesSection}>
              <Text style={styles.sectionTitle}>{t('profile:sections.recentActivity')}</Text>
              {recentActivities.length === 0 ? (
                <View style={styles.emptyActivitiesContainer}>
                  <Ionicons name="time-outline" size={scaleSize(40)} color={colors.textSecondary} />
                  <Text style={styles.emptyActivitiesText}>{t('profile:recent.noActivityYet', 'אין פעילויות עדיין')}</Text>
                  <Text style={styles.emptyActivitiesSubtext}>{t('profile:recent.startCreating', 'התחל ליצור תוכן כדי לראות את הפעילויות שלך כאן')}</Text>
                </View>
              ) : (
                recentActivities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.activityItem}
                    onPress={() => {
                      // Open modal for item and ride types
                      if (activity.type === 'item' || activity.type === 'ride') {
                        setSelectedActivity(activity);
                        setShowActivityModal(true);
                      } else {
                        // For post and donation, show alert for now
                        Alert.alert(activity.title, activity.time);
                      }
                    }}
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
            )}

            {/* Story Highlights - only for own profile */}
            {isOwnProfile && (
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
                        <Ionicons name="add" size={scaleSize(24)} color={colors.secondary} />
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
            )}

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
          {/* Header for other user's profile */}
          {!isOwnProfile && (
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.username}>{displayUser?.name || externalUserName || 'ללא שם'}</Text>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => Alert.alert('אפשרויות', 'פתיחת אפשרויות')}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Completion Banner - only for own profile */}
          {isOwnProfile && <ProfileCompletionBanner />}
          
          {/* Profile Info with Menu Icon */}
          <View style={styles.profileInfo}>
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.menuIcon}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Ionicons name="menu" size={scaleSize(24)} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.profileSection}>
              <Image source={avatarSource} style={styles.profilePicture} />
            </View>

            <View style={styles.statsContainer}>
              {isOwnProfile && !isRealAuth && (
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.posts}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                </View>
              )}
              {!isOwnProfile && (
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{(displayUser as any)?.postsCount || 0}</Text>
                  <Text style={styles.statLabel}>{t('profile:stats.posts')}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  if (!targetUserId) return;
                  (navigation as any).navigate('FollowersScreen', {
                    userId: targetUserId,
                    type: 'followers',
                    title: t('profile:followersTitle')
                  });
                }}
              >
                <Text style={styles.statNumber}>{isOwnProfile ? userStats.followers : updatedCounts.followersCount}</Text>
                <Text style={styles.statLabel}>{t('profile:stats.followers')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => {
                  if (!targetUserId) return;
                  (navigation as any).navigate('FollowersScreen', {
                    userId: targetUserId,
                    type: 'following',
                    title: t('profile:followingTitle')
                  });
                }}
              >
                <Text style={styles.statNumber}>{isOwnProfile ? userStats.following : updatedCounts.followingCount}</Text>
                <Text style={styles.statLabel}>{t('profile:stats.following')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Modal with Backdrop - only for own profile */}
          {isOwnProfile && showMenu && (
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
            <Text style={styles.fullName}>{displayUser?.name || externalUserName || ''}</Text>
            {!!displayUser?.bio && (
              <Text style={styles.bioText}>{displayUser.bio}</Text>
            )}
            {!!(typeof displayUser?.location === 'string' ? displayUser?.location : displayUser?.location?.city) && (
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={scaleSize(14)} color={colors.textSecondary} />{' '}
                {typeof displayUser?.location === 'string' ? displayUser?.location : displayUser?.location?.city || ''}
              </Text>
            )}
            
            {/* Additional user details for other user's profile */}
            {!isOwnProfile && displayUser && (
              <View style={styles.characterDetails}>
                {/* Verification badge */}
                {(displayUser as CharacterType).isVerified && (
                  <View style={styles.verificationBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.info} />
                    <Text style={styles.verifiedText}>מאומת</Text>
                  </View>
                )}
                
                {/* Roles */}
                {displayUser.roles && displayUser.roles.length > 0 && (
                  <View style={styles.rolesContainer}>
                    {displayUser.roles.map((role, index) => (
                      <View key={index} style={styles.roleTag}>
                        <Text style={styles.roleText}>{getRoleDisplayName(role)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Interests */}
                {displayUser.interests && displayUser.interests.length > 0 && (
                  <View style={styles.interestsContainer}>
                    <Text style={styles.sectionTitle}>תחומי עניין:</Text>
                    <View style={styles.interestsList}>
                      {displayUser.interests.slice(0, 4).map((interest, index) => (
                        <Text key={index} style={styles.interestTag}>#{interest}</Text>
                      ))}
                    </View>
                  </View>
                )}
                
                {/* Join date */}
                {displayUser.joinDate && (
                  <Text style={styles.joinDate}>
                    הצטרף ב-{new Date(displayUser.joinDate).toLocaleDateString('he-IL')}
                  </Text>
                )}
              </View>
            )}

            {/* Karma Points */}
            <View style={styles.karmaSection}>
              <View style={styles.karmaCard}>
                <Ionicons name="star" size={scaleSize(20)} color={colors.warning} />
                <Text style={styles.karmaText}>{(displayUser?.karmaPoints || userStats.karmaPoints)} {t('profile:stats.karmaPointsSuffix')}</Text>
              </View>
            </View>

            {/* Activity Icons - only for own profile */}
            {isOwnProfile && !isRealAuth && (
              <View style={styles.activityIcons}>
                <TouchableOpacity
                  style={styles.activityIconItem}
                  onPress={() => Alert.alert(t('profile:alerts.activity'), t('profile:alerts.viewActivity'))}
                >
                  <Ionicons name="star-outline" size={scaleSize(24)} color={colors.secondary} />
                  <Text style={styles.activityIconText}>{t('profile:activity')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityIconItem}
                  onPress={() => Alert.alert(t('profile:alerts.history'), t('profile:alerts.activityHistory'))}
                >
                  <MaterialCommunityIcons name="history" size={scaleSize(24)} color={colors.secondary} />
                  <Text style={styles.activityIconText}>{t('profile:history')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.activityIconItem}
                  onPress={() => Alert.alert(t('profile:alerts.favorites'), t('profile:alerts.yourFavorites'))}
                >
                  <Ionicons name="heart-outline" size={scaleSize(24)} color={colors.secondary} />
                  <Text style={styles.activityIconText}>{t('profile:favorites')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {isOwnProfile ? (
              <>
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
              </>
            ) : (
              <>
                {selectedUser && displayUser && selectedUser.id !== displayUser.id && (
                  <>
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
                          if (!displayUser?.id) {
                            Alert.alert('שגיאה', 'משתמש לא נמצא');
                            return;
                          }
                          
                          if (isFollowing) {
                            const success = await unfollowUser(selectedUser.id, displayUser.id);
                            if (success) {
                              setIsFollowing(false);
                              const newCounts = await getUpdatedFollowCounts(displayUser.id);
                              setUpdatedCounts(newCounts);
                              setFollowStats(prev => ({ ...prev, isFollowing: false }));
                              Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
                            }
                          } else {
                            const success = await followUser(selectedUser.id, displayUser.id);
                            if (success) {
                              setIsFollowing(true);
                              const newCounts = await getUpdatedFollowCounts(displayUser.id);
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
                    
                    <TouchableOpacity 
                      style={styles.messageButton}
                      onPress={async () => {
                        if (!selectedUser) {
                          Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
                          return;
                        }

                        try {
                          const existingConvId = await conversationExists(selectedUser.id, displayUser.id!);
                          let conversationId: string;
                          
                          if (existingConvId) {
                            console.log('💬 Conversation already exists:', existingConvId);
                            conversationId = existingConvId;
                          } else {
                            console.log('💬 Creating new conversation...');
                            conversationId = await createConversation([selectedUser.id, displayUser.id!]);
                          }
                          
                          (navigation as any).navigate('ChatDetailScreen', {
                            conversationId,
                            otherUserId: displayUser.id,
                            userName: displayUser.name || externalUserName || 'ללא שם',
                            userAvatar: displayUser.avatar || 'https://i.pravatar.cc/150?img=1',
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
                  </>
                )}
              </>
            )}
          </View>

          {/* Recent Activities - only for own profile */}
          {isOwnProfile && (
            <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>{t('profile:sections.recentActivity')}</Text>
            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivitiesContainer}>
                <Ionicons name="time-outline" size={scaleSize(40)} color={colors.textSecondary} />
                <Text style={styles.emptyActivitiesText}>{t('profile:recent.noActivityYet', 'אין פעילויות עדיין')}</Text>
                <Text style={styles.emptyActivitiesSubtext}>{t('profile:recent.startCreating', 'התחל ליצור תוכן כדי לראות את הפעילויות שלך כאן')}</Text>
              </View>
            ) : (
              recentActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityItem}
                  onPress={() => {
                    // Open modal for item and ride types
                    if (activity.type === 'item' || activity.type === 'ride') {
                      setSelectedActivity(activity);
                      setShowActivityModal(true);
                    } else {
                      // For post and donation, show alert for now
                      Alert.alert(activity.title, activity.time);
                    }
                  }}
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
          )}

          {/* Story Highlights - only for own profile */}
          {isOwnProfile && (
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
                      <Ionicons name="add" size={scaleSize(24)} color={colors.secondary} />
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
          )}

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

      {/* Activity Details Modal */}
      {selectedActivity && (selectedActivity.type === 'item' || selectedActivity.type === 'ride') && (
        <ItemDetailsModal
          visible={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedActivity(null);
          }}
          item={selectedActivity.rawData}
          type={selectedActivity.type}
          navigation={navigation as any}
          showOwnerInfo={false}
        />
      )}
    </SafeAreaView>
  );
}

// Wrapper component that calls useBottomTabBarHeight
// This is used when viewing own profile (in bottom tab navigator)
function ProfileScreenWithTabBar() {
  const tabBarHeight = useBottomTabBarHeight();
  return <ProfileScreenContent tabBarHeight={tabBarHeight} />;
}

// Main export - uses the hook for own profile
export default function ProfileScreen() {
  const route = useRoute();
  const routeParams = route.params as ProfileScreenRouteParams | undefined;
  const { userId: externalUserId } = routeParams || {};
  const { selectedUser } = useUser();
  
  // Determine if viewing own profile or other user's profile
  // CRITICAL: If externalUserId exists and equals selectedUser.id, it's OWN profile!
  // Only if externalUserId exists and is DIFFERENT from selectedUser.id, it's another user's profile
  // If no externalUserId, it's own profile (default - viewing from ProfileTabStack)
  
  // Normalize IDs to strings for comparison (in case one is number and one is string)
  const normalizedExternalUserId = externalUserId ? String(externalUserId).trim() : null;
  const normalizedSelectedUserId = selectedUser?.id ? String(selectedUser.id).trim() : null;
  
  // Check if viewing other user: externalUserId exists AND it's different from selectedUser.id
  const isViewingOtherUser = normalizedExternalUserId && 
                              normalizedSelectedUserId && 
                              normalizedExternalUserId !== normalizedSelectedUserId;
  
  // Debug log to help identify the issue
  console.log('👤 ProfileScreen - Route check:', {
    externalUserId,
    normalizedExternalUserId,
    selectedUserId: selectedUser?.id,
    normalizedSelectedUserId,
    isViewingOtherUser,
    areEqual: normalizedExternalUserId === normalizedSelectedUserId,
    hasExternalUserId: !!externalUserId,
    hasSelectedUser: !!selectedUser
  });
  
  if (isViewingOtherUser) {
    // Viewing another user's profile - not in bottom tab navigator
    // Use ProfileScreenContent directly with tabBarHeight = 0 (no hook call)
    console.log('👤 ProfileScreen - Using ProfileScreenContent (other user)');
    return <ProfileScreenContent tabBarHeight={0} />;
  }
  
  // Viewing own profile (either no externalUserId, or externalUserId === selectedUser.id)
  // In bottom tab navigator, can use the hook
  console.log('👤 ProfileScreen - Using ProfileScreenWithTabBar (own profile)');
  return <ProfileScreenWithTabBar />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
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
    borderColor: colors.secondary,
  },
  menuIcon: {
    position: 'absolute',
    top: LAYOUT_CONSTANTS.SPACING.SM,
    right: LAYOUT_CONSTANTS.SPACING.SM,
    padding: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: colors.backgroundSecondary,
    ...createShadowStyle(colors.shadow, { width: 0, height: 2 }, 0.1, 4),
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
    backgroundColor: colors.secondary,
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
    backgroundColor: colors.background,
    padding: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    ...createShadowStyle(colors.shadow, { width: 0, height: 1 }, 0.1, 2),
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
  emptyActivitiesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XL,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
  },
  emptyActivitiesText: {
    fontSize: FontSizes.heading3,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'center',
  },
  emptyActivitiesSubtext: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: 'center',
    lineHeight: Math.round(FontSizes.body * 1.4),
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
  tabBarContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
  },
  tabBarIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.secondary,
    height: scaleSize(2),
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    position: 'relative',
  },
  tabBarText: {
    fontSize: FontSizes.body,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
  },
  tabContentContainer: {
    paddingBottom: 20,
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
  ridePlaceholder: {
    backgroundColor: colors.info + '20',
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.SM,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  rideDetailsContainer: {
    marginTop: LAYOUT_CONSTANTS.SPACING.XS + 2,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  rideDetailsText: {
    fontSize: FontSizes.small - 1,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '90%',
  },
  rideArrow: {
    marginVertical: 3,
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
    backgroundColor: colors.secondary,
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
    ...createShadowStyle(colors.shadow, { width: 0, height: 4 }, 0.2, 8),
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
  // Styles for other user's profile
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
  followButton: {
    flex: 1,
    backgroundColor: colors.secondary,
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
    marginLeft: 12,
  },
  messageButtonText: {
    color: colors.textPrimary,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
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
  joinDate: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 4,
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
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
});
