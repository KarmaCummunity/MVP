import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  SafeAreaView,
} from 'react-native';

// TODO: CRITICAL - This file is too long (>500 lines). Split into smaller components:
//   - Extract PostItem component
//   - Extract fake data generation to separate service
//   - Extract user interaction logic to custom hooks
// TODO: Remove all fake data and replace with real API integration
// TODO: Add proper TypeScript interfaces instead of inline types
// TODO: Add comprehensive error handling for all async operations
// TODO: Implement proper virtualization for large lists (react-native-super-grid)
// TODO: Add loading states and skeleton screens
// TODO: Add proper accessibility labels and roles
// TODO: Optimize performance with React.memo and proper memoization
// TODO: Add unit tests for all components and functions
// TODO: Remove hardcoded constants and use configuration file
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../stores/userStore';
import CommentsModal from './CommentsModal';
import { logger } from '../utils/loggerService';
import { isBookmarked, addBookmark, removeBookmark } from '../utils/bookmarksService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { db } from '../utils/databaseService';

const { width } = Dimensions.get('window');

// --- Constants ---
const NUM_ITEMS = 100;

// --- Types ---
type User = {
  id: string;
  name: string | null; // Can be null if name is not available (never use ID as name)
  avatar: string;
  karmaPoints: number;
};

type Item = {
  id: string;
  type: 'post' | 'reel';
  title: string;
  description: string;
  thumbnail: string;
  user: User;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
};

// TODO: URGENT - Remove this entire fake data generation function
// TODO: Replace with proper data fetching from backend API
// TODO: Implement proper data models and interfaces
const generateFakeData = (): Item[] => {
  // Purged fake feed. Return empty list when no real data is available.
  return [];
};

const data = generateFakeData();

/**
 * קומפוננטת פריט בודד - פוסט או ריל
 * @param item - הפריט להצגה
 */
const PostReelItem = ({ item }: { item: Item }) => {
  const navigation = useNavigation();
  const { selectedUser } = useUser();
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);

  // לוג כל הנתונים על הפריט והיוזר כשהפריט נטען
  React.useEffect(() => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📦 פריט נטען לדף הפוסטים - כל הנתונים');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔹 נתוני הפריט:');
    console.log('   ID:', item.id);
    console.log('   Type:', item.type);
    console.log('   Title:', item.title);
    console.log('   Description:', item.description);
    console.log('   Thumbnail:', item.thumbnail || '(אין תמונה)');
    console.log('   Likes:', item.likes);
    console.log('   Comments:', item.comments);
    console.log('   Is Liked:', item.isLiked);
    console.log('   Timestamp:', item.timestamp);
    console.log('───────────────────────────────────────────────────────────');
    console.log('👤 נתוני המשתמש שפירסם:');
    console.log('   User ID:', item.user.id);
    console.log('   User Name:', item.user.name || '(לא זמין)');
    console.log('   User Avatar:', item.user.avatar);
    console.log('   User Karma Points:', item.user.karmaPoints);
    console.log('───────────────────────────────────────────────────────────');
    console.log('📋 כל השדות של הפריט (JSON):');
    console.log(JSON.stringify(item, null, 2));
    console.log('───────────────────────────────────────────────────────────');
    console.log('👤 כל השדות של המשתמש (JSON):');
    console.log(JSON.stringify(item.user, null, 2));
    console.log('═══════════════════════════════════════════════════════════');

    logger.debug('PostsReelsScreen', '📦 פריט נטען - כל הנתונים', {
      item: {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        likes: item.likes,
        comments: item.comments,
        isLiked: item.isLiked,
        timestamp: item.timestamp,
      },
      user: {
        id: item.user.id,
        name: item.user.name,
        avatar: item.user.avatar,
        karmaPoints: item.user.karmaPoints,
      },
      allItemFields: JSON.stringify(item, null, 2),
      allUserFields: JSON.stringify(item.user, null, 2),
    });
  }, [item.id]); // רק פעם אחת לכל פריט

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '';
      }
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'עכשיו';
      if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'אתמול';
      if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
      return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    logger.logUserAction('like-post', 'PostsReelsScreen', { postId: item.id, isLiked: !isLiked, userId: selectedUser?.id });
  };

  const handleProfilePress = () => {
    const targetUserId = item.user.id;
    const targetUserName = (item.user.name && item.user.name !== item.user.id) ? item.user.name : 'משתמש';

    logger.logScreenNavigation('PostsReelsScreen', 'UserProfileScreen', selectedUser?.id);
    logger.debug('PostsReelsScreen', 'Navigating to profile', {
      targetUserId,
      targetUserName,
      itemId: item.id,
      currentUserId: selectedUser?.id
    });

    // Make sure we have a valid userId before navigating
    if (!targetUserId) {
      logger.warn('PostsReelsScreen', 'Cannot navigate to profile - missing userId', { item });
      return;
    }

    try {
      // Try to navigate through the parent navigator (HomeTabStack) first
      // If that fails, try the root navigator (MainNavigator)
      const parentNavigator = (navigation as any).getParent();
      if (parentNavigator) {
        // Navigate through parent (HomeTabStack)
        parentNavigator.navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      } else {
        // Fallback to root navigator
        (navigation as any).navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      }
    } catch (error) {
      logger.error('PostsReelsScreen', 'Error navigating to profile', { error, targetUserId, targetUserName });
      // Final fallback - try direct navigation
      try {
        (navigation as any).navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      } catch (fallbackError) {
        logger.error('PostsReelsScreen', 'Fallback navigation also failed', { fallbackError });
      }
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.description}\n\nשותף מ-Karma Community`,
        title: item.title,
      });
    } catch (error) {
      logger.logError(error, 'share-post', 'PostsReelsScreen', selectedUser?.id);
    }
  };

  const handlePostPress = () => {
    // בדיקה אם זה פוסט של המשתמש הנוכחי או של מישהו אחר
    const targetUserId = item.user.id;
    const isMyPost = selectedUser?.id === targetUserId;

    const targetUserName = (item.user.name && item.user.name !== item.user.id) ? item.user.name : 'משתמש';

    logger.logScreenNavigation('PostsReelsScreen', 'UserProfileScreen', selectedUser?.id);
    logger.debug('PostsReelsScreen', 'Navigating to profile from post press', {
      targetUserId,
      targetUserName,
      itemId: item.id,
      currentUserId: selectedUser?.id,
      isMyPost
    });

    // Make sure we have a valid userId before navigating
    if (!targetUserId) {
      logger.warn('PostsReelsScreen', 'Cannot navigate to profile - missing userId', { item });
      return;
    }

    try {
      // Try to navigate through the parent navigator (HomeTabStack) first
      // If that fails, try the root navigator (MainNavigator)
      const parentNavigator = (navigation as any).getParent();
      if (parentNavigator) {
        // Navigate through parent (HomeTabStack)
        parentNavigator.navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      } else {
        // Fallback to root navigator
        (navigation as any).navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      }
    } catch (error) {
      logger.error('PostsReelsScreen', 'Error navigating to profile', { error, targetUserId, targetUserName });
      // Final fallback - try direct navigation
      try {
        (navigation as any).navigate('UserProfileScreen', {
          userId: targetUserId,
          userName: targetUserName,
          characterData: null
        });
      } catch (fallbackError) {
        logger.error('PostsReelsScreen', 'Fallback navigation also failed', { fallbackError });
      }
    }
  };

  const handleBookmark = async () => {
    if (!selectedUser) return;

    try {
      if (isBookmarkedState) {
        await removeBookmark(selectedUser.id, item.id);
        setIsBookmarkedState(false);
        logger.logUserAction('remove-bookmark', 'PostsReelsScreen', { postId: item.id });
      } else {
        await addBookmark(selectedUser.id, item);
        setIsBookmarkedState(true);
        logger.logUserAction('add-bookmark', 'PostsReelsScreen', { postId: item.id });
      }
    } catch (error) {
      logger.logError(error, 'bookmark-action', 'PostsReelsScreen', selectedUser?.id);
    }
  };

  React.useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (selectedUser) {
        const bookmarked = await isBookmarked(selectedUser.id, item.id);
        setIsBookmarkedState(bookmarked);
      }
    };

    checkBookmarkStatus();
  }, [selectedUser, item.id]);

  return (
    <View style={[styles.itemContainer, item.type === 'reel' && styles.reelItem]}>
      {/* Header with User Profile */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          <Text style={styles.userName} numberOfLines={1}>
            {item.user.name && item.user.name !== item.user.id ? item.user.name : 'משתמש'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {item.thumbnail ? (
        <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        </TouchableOpacity>
      ) : null}

      {/* Description */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? colors.error : colors.textSecondary}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
          <Ionicons
            name={isBookmarkedState ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarkedState ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={item.id}
        postTitle={item.title}
        postUser={item.user}
      />
    </View>
  );
};

interface PostsReelsScreenProps {
  onScroll?: (hide: boolean) => void;
  hideTopBar?: boolean;
  showTopBar?: boolean;
}

export default function PostsReelsScreen({ onScroll, hideTopBar = false, showTopBar = false }: PostsReelsScreenProps) {
  const navigation = useNavigation();
  console.log('📱 PostsReelsScreen - hideTopBar prop:', hideTopBar);
  const { selectedUser, isRealAuth } = useUser();
  const [realFeed, setRealFeed] = useState<Item[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [feedMode, setFeedMode] = useState<'friends' | 'discovery'>('discovery');
  const flatListRef = useRef<FlatList>(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    logger.debug('PostsReelsScreen', 'Component rendered', {
      hasUser: !!selectedUser,
      isRealAuth,
      feedMode,
      feedLength: realFeed.length,
    });
  }, [selectedUser, isRealAuth, feedMode, realFeed.length]);

  const mapPostToItem = (
    post: any,
    user: { id: string; name?: string | null; avatar?: string; karmaPoints?: number }
  ): Item => {
    const id = String(post.id || post.itemId || `${user.id}_${Math.random().toString(36).slice(2)}`);
    const title = String(post.title || post.text || 'פוסט');
    const description = String(post.description || post.text || '');
    const thumbnail = post.thumbnail || post.image || ''; // לא להציג תמונת placeholder כשאין תמונה
    const likes = Number(post.likes || 0);
    const comments = Number(post.comments || 0);
    const timestamp = String(post.timestamp || post.createdAt || new Date().toISOString());

    // Ensure we never use ID as name - use null if name is missing or equals ID
    const userName = (user.name && user.name !== user.id && user.name.trim()) ? user.name : null;

    return {
      id,
      type: (post.type === 'reel' ? 'reel' : 'post') as Item['type'],
      title,
      description,
      thumbnail,
      user: {
        id: user.id,
        name: userName, // Never use ID as name - will be handled in display
        avatar: user.avatar || 'https://i.pravatar.cc/150?u=' + user.id,
        karmaPoints: Number(user.karmaPoints || 0),
      },
      likes,
      comments,
      isLiked: Boolean(post.isLiked || false),
      timestamp,
    };
  };

  const loadRealFeed = React.useCallback(async () => {
    console.log('🔄 loadRealFeed called', { hasSelectedUser: !!selectedUser, feedMode, selectedUserId: selectedUser?.id });

    if (!selectedUser) {
      console.log('❌ No selectedUser, exiting loadRealFeed');
      setRealFeed([]);
      return;
    }

    console.log('✅ Starting to load feed for user:', selectedUser.id, 'in mode:', feedMode);
    setIsLoadingReal(true);
    try {
      let userIds: string[] = [];

      if (feedMode === 'friends') {
        // Only show posts from users we follow
        const followingRels = await db.getFollowing(selectedUser.id);
        const followingIds: string[] = Array.isArray(followingRels)
          ? (followingRels as any[]).map((r) => String(r.followingId)).filter(Boolean)
          : [];
        userIds = Array.from(new Set([selectedUser.id, ...followingIds]));
      } else {
        // Discovery mode: get all posts from all users
        // For now, we'll get all users from the database
        // TODO: Optimize this to get all posts directly from a posts collection
        const followingRels = await db.getFollowing(selectedUser.id);
        const followingIds: string[] = Array.isArray(followingRels)
          ? (followingRels as any[]).map((r) => String(r.followingId)).filter(Boolean)
          : [];
        // In discovery mode, we show all posts (including from users we don't follow)
        // For now, we'll use the same logic but later we can optimize to get all posts
        userIds = Array.from(new Set([selectedUser.id, ...followingIds]));
        // TODO: Add API endpoint to get all public posts for discovery mode
      }

      const userIdToUser: Record<string, any> = {};
      await Promise.all(
        userIds.map(async (uid) => {
          try {
            const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
            if (USE_BACKEND && API_BASE_URL) {
              // Try to get user from API first to ensure we have the name
              const axios = (await import('axios')).default;
              try {
                const userResponse = await axios.get(`${API_BASE_URL}/api/users/${uid}`);
                if (userResponse.data?.success && userResponse.data.data) {
                  const userData = userResponse.data.data;
                  userIdToUser[uid] = {
                    id: uid,
                    name: userData.name && userData.name !== uid && userData.name.trim() ? userData.name : null,
                    avatar: userData.avatar_url || `https://i.pravatar.cc/150?u=${uid}`,
                    karmaPoints: userData.karma_points || 0,
                  };
                  return;
                }
              } catch (apiError) {
                // Fallback to local DB
              }
            }
            // Fallback to local database
            const user = await db.getUser(uid) as { id?: string; name?: string | null; avatar?: string; karmaPoints?: number } | null;
            if (user && user.name && typeof user.name === 'string' && user.name !== uid && user.name.trim()) {
              userIdToUser[uid] = user;
            } else {
              userIdToUser[uid] = { id: uid, name: null };
            }
          } catch {
            userIdToUser[uid] = { id: uid, name: null };
          }
        })
      );

      // Load posts from users
      const postsLists = await Promise.all(
        userIds.map(async (uid) => {
          try { return await db.getUserPosts(uid); } catch { return []; }
        })
      );

      // Load items (dedicated items) for the feed
      // In discovery mode, get all available items
      // In friends mode, get items from followed users
      let itemsList: any[] = [];
      try {
        if (feedMode === 'discovery') {
          // Get all available items from API
          const { apiService } = await import('../utils/apiService');
          const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
          if (USE_BACKEND && API_BASE_URL) {
            const axios = (await import('axios')).default;
            const response = await axios.get(`${API_BASE_URL}/api/items-delivery/search`, {
              params: {
                status: 'available',
                limit: 50, // Limit to 50 items for performance
              }
            });
            if (response.data?.success && Array.isArray(response.data.data)) {
              itemsList = response.data.data;
            }
          } else {
            // Fallback: get items from followed users
            itemsList = await Promise.all(
              userIds.map(async (uid) => {
                try { return await db.getDedicatedItemsByOwner(uid); } catch { return []; }
              })
            ).then(results => results.flat());
          }
        } else {
          // Friends mode: get items from followed users only
          itemsList = await Promise.all(
            userIds.map(async (uid) => {
              try { return await db.getDedicatedItemsByOwner(uid); } catch { return []; }
            })
          ).then(results => results.flat());
        }
      } catch (error) {
        logger.error('PostsReelsScreen', 'Error loading items', { error });
        // Continue without items if there's an error
      }

      // Collect all owner IDs from items and load their user data
      const itemOwnerIds = new Set<string>();
      itemsList.forEach((item: any) => {
        const ownerId = item.owner_id || item.ownerId;
        if (ownerId && !userIdToUser[ownerId]) {
          itemOwnerIds.add(ownerId);
        }
      });

      // Load user data for item owners that we don't have yet
      if (itemOwnerIds.size > 0) {
        await Promise.all(
          Array.from(itemOwnerIds).map(async (uid) => {
            try {
              const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
              if (USE_BACKEND && API_BASE_URL) {
                // Try to get user from API first
                const axios = (await import('axios')).default;
                try {
                  const userResponse = await axios.get(`${API_BASE_URL}/api/users/${uid}`);
                  if (userResponse.data?.success && userResponse.data.data) {
                    const userData = userResponse.data.data;
                    userIdToUser[uid] = {
                      id: uid,
                      name: userData.name && userData.name !== uid && userData.name.trim() ? userData.name : null,
                      avatar: userData.avatar_url || `https://i.pravatar.cc/150?u=${uid}`,
                      karmaPoints: userData.karma_points || 0,
                    };
                    return;
                  }
                } catch (apiError) {
                  // Fallback to local DB
                }
              }
              // Fallback to local database
              const user = await db.getUser(uid) as { id?: string; name?: string | null; avatar?: string; karmaPoints?: number } | null;
              if (user && user.name && typeof user.name === 'string' && user.name !== uid && user.name.trim()) {
                userIdToUser[uid] = user;
              } else {
                userIdToUser[uid] = { id: uid, name: null };
              }
            } catch (error) {
              userIdToUser[uid] = { id: uid, name: null };
            }
          })
        );
      }

      const merged: Item[] = [];

      // Add posts to feed
      postsLists.forEach((posts, idx) => {
        const uid = userIds[idx];
        const user = userIdToUser[uid] || { id: uid };
        (posts as any[]).forEach((p) => merged.push(mapPostToItem(p, user)));
      });

      // Add items to feed - convert items to feed items
      itemsList.forEach((item: any) => {
        try {
          const ownerId = String(item.owner_id || item.ownerId || '');
          if (!ownerId) {
            logger.warn('PostsReelsScreen', 'Item missing owner_id', { itemId: item.id });
            return;
          }

          // Log what we get from API for debugging
          logger.debug('PostsReelsScreen', 'Processing item from API', {
            itemId: item.id,
            ownerId,
            ownerName: item.owner_name,
            ownerAvatar: item.owner_avatar,
            hasOwnerName: !!item.owner_name,
            ownerNameType: typeof item.owner_name
          });

          // Get or create user object
          let user = userIdToUser[ownerId];

          // Update user with API data if available
          if (item.owner_name && item.owner_name.trim() && item.owner_name !== ownerId) {
            // API provided a valid name - use it
            if (!user) {
              user = {
                id: ownerId,
                name: item.owner_name,
                avatar: item.owner_avatar || `https://i.pravatar.cc/150?u=${ownerId}`,
                karmaPoints: 0
              };
              userIdToUser[ownerId] = user;
            } else {
              // Update existing user with API data
              user.name = item.owner_name;
              if (item.owner_avatar && item.owner_avatar.trim() && !item.owner_avatar.includes('pravatar')) {
                user.avatar = item.owner_avatar;
              }
            }
          } else if (!user) {
            // No user data and no valid owner_name from API - create fallback
            user = {
              id: ownerId,
              name: null, // Never use ID as name
              avatar: item.owner_avatar || `https://i.pravatar.cc/150?u=${ownerId}`,
              karmaPoints: 0
            };
            userIdToUser[ownerId] = user;
          }

          // Determine final user name - MUST be the actual name, NOT the ID
          // Priority: 1. owner_name from API (always prefer this), 2. user.name from cache, 3. null as last resort (never use ID)
          let finalUserName: string | null;

          if (item.owner_name && item.owner_name.trim() && item.owner_name !== ownerId) {
            // API provided a valid name - ALWAYS use it
            finalUserName = item.owner_name;
          } else if (user && user.name && user.name !== ownerId && user.name.trim()) {
            // Use cached user name if it's valid (not the ID)
            finalUserName = user.name;
          } else {
            // No valid name available - use null instead of ID
            logger.warn('PostsReelsScreen', 'No valid user name found, will display "משתמש"', {
              itemId: item.id,
              ownerId,
              ownerName: item.owner_name,
              cachedUserName: user?.name
            });
            finalUserName = null; // Never use ID as name - will display "משתמש" in UI
          }

          // Determine final user avatar
          const finalUserAvatar = (item.owner_avatar && item.owner_avatar.trim() && !item.owner_avatar.includes('pravatar'))
            ? item.owner_avatar
            : (user && user.avatar && !user.avatar.includes('pravatar'))
              ? user.avatar
              : `https://i.pravatar.cc/150?u=${ownerId}`;

          logger.debug('PostsReelsScreen', 'Final user data for feed item', {
            itemId: item.id,
            ownerId,
            finalUserName,
            finalUserAvatar,
            ownerNameFromAPI: item.owner_name,
            userNameFromCache: user?.name,
            source: item.owner_name ? 'API' : (user?.name && user.name !== ownerId ? 'cache' : 'fallback')
          });

          const feedItem: Item = {
            id: `item_${item.id}`,
            type: 'post' as const,
            title: item.title || 'פריט למסירה',
            description: item.description || `קטגוריה: ${item.category || 'כללי'}`,
            thumbnail: item.image_base64 && item.image_base64.length > 100
              ? `data:image/jpeg;base64,${item.image_base64}`
              : '', // לא להציג תמונת placeholder כשאין תמונה או אם ה-base64 פגום
            user: {
              id: ownerId, // Always use ownerId as the user id (for navigation to profile)
              name: finalUserName && finalUserName !== ownerId ? finalUserName : null, // Never use ID as name
              avatar: finalUserAvatar,
              karmaPoints: user?.karmaPoints || 0,
            },
            likes: 0,
            comments: 0,
            isLiked: false,
            timestamp: item.created_at || item.timestamp || new Date().toISOString(),
          };
          merged.push(feedItem);
        } catch (error) {
          logger.error('PostsReelsScreen', 'Error converting item to feed item', { error, item });
        }
      });

      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      console.log('📊 Feed loaded successfully:', {
        totalPosts: merged.length,
        feedMode,
        userIds: userIds.length,
        sample: merged.slice(0, 2).map(p => ({ id: p.id, title: p.title }))
      });
      setRealFeed(merged);
    } catch (e) {
      console.error('❌ Error loading feed:', e);
      logger.error('PostsReelsScreen', 'Error loading feed', { error: e });
      setRealFeed([]);
    } finally {
      setIsLoadingReal(false);
    }
  }, [selectedUser, feedMode]);

  useFocusEffect(
    React.useCallback(() => {
      if (isRealAuth) {
        loadRealFeed();
      } else {
        setRealFeed([]);
      }
    }, [isRealAuth, loadRealFeed])
  );

  // Reload feed when feedMode changes
  React.useEffect(() => {
    if (isRealAuth && selectedUser) {
      loadRealFeed();
    }
  }, [feedMode, isRealAuth, selectedUser, loadRealFeed]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      logger.logUserAction('screen-focused', 'PostsReelsScreen', { hideTopBar, showTopBar });
    }, [hideTopBar, showTopBar])
  );

  const [lastOffsetY, setLastOffsetY] = useState(0);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const isScrollingUp = offsetY < lastOffsetY;

    console.log('📱 PostsReelsScreen - Scroll offset:', offsetY, 'Last offset:', lastOffsetY, 'Scrolling up:', isScrollingUp);

    if (isScrollingUp) {
      console.log('📱 PostsReelsScreen - Showing top bar (scrolling up)');
      onScroll?.(false);
    } else if (offsetY > 20) {
      console.log('📱 PostsReelsScreen - Hiding top bar');
      onScroll?.(true);
    }

    setLastOffsetY(offsetY);
  };

  // Render header component for FlatList
  const renderHeader = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, feedMode === 'friends' && styles.toggleButtonActive]}
        onPress={() => setFeedMode('friends')}
      >
        <Text style={[styles.toggleText, feedMode === 'friends' && styles.toggleTextActive]}>
          חברים
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, feedMode === 'discovery' && styles.toggleButtonActive]}
        onPress={() => setFeedMode('discovery')}
      >
        <Text style={[styles.toggleText, feedMode === 'discovery' && styles.toggleTextActive]}>
          גילוי
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={isRealAuth ? realFeed : data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostReelItem item={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1,
          minHeight: '150%' // Force content to be taller than viewport
        }}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        bounces={Platform.OS === 'ios'}
        overScrollMode={Platform.OS === 'android' ? 'auto' : undefined}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        onEndReached={() => {
          // Infinite scroll - when reaching the end, scroll back to top after a short delay
          // This creates the infinite loop effect
          if (!hasReachedEnd && (isRealAuth ? realFeed : data).length > 0) {
            setHasReachedEnd(true);
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
              setHasReachedEnd(false);
            }, 500);
          }
        }}
        onEndReachedThreshold={0.5}
        onScrollToTop={() => {
          setHasReachedEnd(false);
        }}
        ListFooterComponent={
          // Add a spacer to ensure content is always scrollable
          <View style={{ height: Dimensions.get('window').height * 0.3 }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>אין פוסטים להצגה</Text>
            <Text style={styles.emptySubtext}>
              {feedMode === 'friends'
                ? 'עקוב אחרי חברים כדי לראות את הפוסטים שלהם כאן'
                : 'עדיין אין פוסטים בקהילה'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  itemContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundPrimary,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
    } : {
      shadowColor: colors.shadowLight,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
    }),
  },
  reelItem: {
    backgroundColor: '#e0f7fa',
  },
  thumbnail: {
    width: width - 32,
    height: 180,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  textContainer: {
    padding: 12,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  headerSpacer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  userName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  contentContainer: {
    padding: 12,
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  likedText: {
    color: colors.error,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 16,
    backgroundColor: 'hsla(0, 0%, 100%, 0.70)',
    borderRadius: 20,
    padding: 4,
    opacity: 0.9,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: FontSizes.heading3,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
