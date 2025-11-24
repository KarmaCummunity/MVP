import React, { useState } from 'react';
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
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../stores/userStore';
import CommentsModal from './CommentsModal';
import logger from '../utils/logger';
import { isBookmarked, addBookmark, removeBookmark } from '../utils/bookmarksService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import ScreenWrapper from './ScreenWrapper';
import { db } from '../utils/databaseService';

const { width } = Dimensions.get('window');

// --- Constants ---
const NUM_ITEMS = 100;

// --- Types ---
type User = {
  id: string;
  name: string;
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    logger.logUserAction('like-post', 'PostsReelsScreen', { postId: item.id, isLiked: !isLiked, userId: selectedUser?.id });
  };

  const handleProfilePress = () => {
    logger.logScreenNavigation('PostsReelsScreen', 'UserProfileScreen', selectedUser?.id);
    (navigation as any).navigate('UserProfileScreen', { 
      userId: item.user.id,
      userName: item.user.name,
      // Pass additional character data for better profile display
      characterData: null // Removed fake character data
    });
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
    Alert.alert(
      'פתיחת פוסט',
      'האם ברצונך לפתוח את הפוסט במסך מלא?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'פתח', 
          onPress: () => {
            logger.logUserAction('open-full-post', 'PostsReelsScreen', { postId: item.id });
          }
        }
      ]
    );
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
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userKarma}>קארמה: {item.user.karmaPoints}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      {/* Content */}
      <TouchableOpacity onPress={handlePostPress} activeOpacity={0.9}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      </TouchableOpacity>
      
      {/* Description */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
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
  const insets = useSafeAreaInsets();
  const { selectedUser, isRealAuth } = useUser();
  const [realFeed, setRealFeed] = useState<Item[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);

  const mapPostToItem = (
    post: any,
    user: { id: string; name?: string; avatar?: string; karmaPoints?: number }
  ): Item => {
    const id = String(post.id || post.itemId || `${user.id}_${Math.random().toString(36).slice(2)}`);
    const title = String(post.title || post.text || 'פוסט');
    const description = String(post.description || post.text || '');
    const thumbnail = String(post.thumbnail || post.image || `https://picsum.photos/seed/${id}/300/200`);
    const likes = Number(post.likes || 0);
    const comments = Number(post.comments || 0);
    const timestamp = String(post.timestamp || post.createdAt || new Date().toISOString());
    return {
      id,
      type: (post.type === 'reel' ? 'reel' : 'post') as Item['type'],
      title,
      description,
      thumbnail,
      user: {
        id: user.id,
        name: user.name || user.id,
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
    if (!selectedUser) { setRealFeed([]); return; }
    setIsLoadingReal(true);
    try {
      const followingRels = await db.getFollowing(selectedUser.id);
      const followingIds: string[] = Array.isArray(followingRels)
        ? (followingRels as any[]).map((r) => String(r.followingId)).filter(Boolean)
        : [];
      const userIds = Array.from(new Set([selectedUser.id, ...followingIds]));

      const userIdToUser: Record<string, any> = {};
      await Promise.all(
        userIds.map(async (uid) => {
          try { userIdToUser[uid] = (await db.getUser(uid)) || { id: uid }; } catch { userIdToUser[uid] = { id: uid }; }
        })
      );

      const postsLists = await Promise.all(
        userIds.map(async (uid) => {
          try { return await db.getUserPosts(uid); } catch { return []; }
        })
      );

      const merged: Item[] = [];
      postsLists.forEach((posts, idx) => {
        const uid = userIds[idx];
        const user = userIdToUser[uid] || { id: uid };
        (posts as any[]).forEach((p) => merged.push(mapPostToItem(p, user)));
      });

      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRealFeed(merged);
    } catch (e) {
      setRealFeed([]);
    } finally {
      setIsLoadingReal(false);
    }
  }, [selectedUser]);

  useFocusEffect(
    React.useCallback(() => {
      if (isRealAuth) {
        loadRealFeed();
      } else {
        setRealFeed([]);
      }
    }, [isRealAuth, loadRealFeed])
  );
  
  const animatedStyle = useAnimatedStyle(() => {
    console.log('📱 PostsReelsScreen - animatedStyle - hideTopBar:', hideTopBar);
    return {
      flex: 1,
      paddingTop: hideTopBar ? insets.top : 0,
      marginTop: withTiming(hideTopBar ? -60 : 0, {
        duration: 200,
      }),
    };
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      logger.logUserAction('screen-focused', 'PostsReelsScreen', { hideTopBar, showTopBar });
    }, [])
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

  const content = (
    <FlatList
      data={isRealAuth ? realFeed : data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostReelItem item={item} />}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    />
  );

  return showTopBar ? (
    <ScreenWrapper style={[styles.container, animatedStyle]}>
      {content}
    </ScreenWrapper>
  ) : (
    <Animated.View style={[styles.container, animatedStyle]}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: 20,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userKarma: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  timestamp: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  contentContainer: {
    padding: 12,
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
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
});
