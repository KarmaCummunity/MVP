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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
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
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likesCount, setLikesCount] = useState(item.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleProfilePress = () => {
    Alert.alert('פרופיל משתמש', `פתיחת פרופיל של ${item.user.name}`);
  };

  const handleComment = () => {
    Alert.alert('תגובה', 'פתיחת חלון תגובה');
  };

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
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      
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
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
  // אנימציה למסך הפוסטים
  const animatedStyle = useAnimatedStyle(() => {
    return {
      marginTop: withTiming(hideTopBar ? -60 : 0, {
        duration: 200,
      }),
    };
  });

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    console.log('📱 PostsReelsScreen - Scroll offset:', offsetY);
    
    // סף נמוך יותר להסתרה (30px) וסף נמוך מאוד להחזרה (5px)
    if (offsetY > 30) {
      console.log('📱 PostsReelsScreen - Hiding top bar');
      onScroll?.(true);
    } else if (offsetY < 5) {
      console.log('📱 PostsReelsScreen - Showing top bar');
      onScroll?.(false);
    }
    // בין 5-30px - שומרים על המצב הנוכחי
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
