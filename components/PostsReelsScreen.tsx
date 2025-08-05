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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import CommentsModal from './CommentsModal';
import { isBookmarked, addBookmark, removeBookmark } from '../utils/bookmarksService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

const { width } = Dimensions.get('window');

// --- Constants ---
const NUM_ITEMS = 100; // מספר הפריטים שיוצגו

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

/**
 * יוצר נתונים מדומים לפוסטים ורילס
 * @returns מערך של פריטים עם נתונים אקראיים
 */
const generateFakeData = (): Item[] => {
  const data: Item[] = [];
  const userNames = ['אנה כהן', 'דני לוי', 'שרה אברהם', 'משה דוד', 'רחל גולדברג', 'יוסי שפירא'];
  
  for (let i = 1; i <= NUM_ITEMS; i++) {
    const type = Math.random() < 0.5 ? 'post' : 'reel';
    const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
    const randomLikes = Math.floor(Math.random() * 500) + 10;
    const randomComments = Math.floor(Math.random() * 50) + 1;
    
    data.push({
      id: `${type}-${i}`,
      type,
      title: `${type === 'post' ? 'פוסט' : 'ריל'} #${i}`,
      description: `תיאור מעניין של ${type === 'post' ? 'הפוסט' : 'הריל'} מספר ${i}. זהו תוכן קהילתי שמעודד שיתוף ודיון.`,
      thumbnail: `https://picsum.photos/seed/${type}-${i}/300/200`,
      user: {
        id: `user-${i}`,
        name: randomUser,
        avatar: `https://picsum.photos/seed/user-${i}/100/100`,
        karmaPoints: Math.floor(Math.random() * 1000) + 100,
      },
      likes: randomLikes,
      comments: randomComments,
      isLiked: Math.random() < 0.3, // 30% סיכוי שהמשתמש הנוכחי עשה לייק
      timestamp: `${Math.floor(Math.random() * 24)} שעות`,
    });
  }
  return data;
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
    
    // כאן בעתיד נוסיף API call לשמירת הלייק
    console.log(`❤️ ${isLiked ? 'Unlike' : 'Like'} post ${item.id} by user ${selectedUser?.id}`);
  };

  const handleProfilePress = () => {
    // ניווט לפרופיל היוזר
    (navigation as any).navigate('UserProfileScreen', { 
      userId: item.user.id,
      userName: item.user.name 
    });
  };

  const handleComment = () => {
    // פתיחת מודל תגובות
    setShowComments(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.description}\n\nשותף מ-Karma Community`,
        title: item.title,
      });
    } catch (error) {
      console.error('❌ Share error:', error);
    }
  };

  const handlePostPress = () => {
    // פתיחת הפוסט במסך מלא
    Alert.alert(
      'פתיחת פוסט',
      'האם ברצונך לפתוח את הפוסט במסך מלא?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'פתח', 
          onPress: () => {
            // כאן נוסיף ניווט למסך פוסט מלא
            console.log('📱 Opening full post:', item.id);
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
        console.log('📖 Bookmark removed');
      } else {
        await addBookmark(selectedUser.id, item);
        setIsBookmarkedState(true);
        console.log('📖 Bookmark added');
      }
    } catch (error) {
      console.error('❌ Bookmark error:', error);
    }
  };

  // בדיקת מצב השמירה בטעינה
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
}

/**
 * מסך פוסטים ורילס קהילתיים
 * מציג רשימה של פוסטים ורילס עם תמונות ותיאורים
 */
export default function PostsReelsScreen({ onScroll, hideTopBar = false }: PostsReelsScreenProps) {
  console.log('📱 PostsReelsScreen - hideTopBar prop:', hideTopBar);
  
  // אנימציה למסך הפוסטים
  const animatedStyle = useAnimatedStyle(() => {
    console.log('📱 PostsReelsScreen - animatedStyle - hideTopBar:', hideTopBar);
    return {
      flex: 1,
      marginTop: withTiming(hideTopBar ? -60 : 0, {
        duration: 200,
      }),
    };
  });

  const [lastOffsetY, setLastOffsetY] = useState(0);
  
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const isScrollingUp = offsetY < lastOffsetY;
    
    console.log('📱 PostsReelsScreen - Scroll offset:', offsetY, 'Last offset:', lastOffsetY, 'Scrolling up:', isScrollingUp);
    
    // הטופ בר חוזר מיד כשגוללים למעלה (אפילו טיפה)
    if (isScrollingUp) {
      // גלילה למעלה מחזירה את הטופ בר מיד
      console.log('📱 PostsReelsScreen - Showing top bar (scrolling up)');
      onScroll?.(false);
    } else if (offsetY > 20) {
      // גלילה למטה מעל 20px מסתירה את הטופ בר
      console.log('📱 PostsReelsScreen - Hiding top bar');
      onScroll?.(true);
    }
    
    setLastOffsetY(offsetY);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FlatList
        data={data}
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
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  reelItem: {
    backgroundColor: '#e0f7fa', // צבע שונה לרילס
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
  // סטיילים חדשים למסך פוסטים משופר
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
