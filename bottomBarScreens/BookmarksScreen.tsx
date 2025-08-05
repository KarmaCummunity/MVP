import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { getBookmarks, removeBookmark, Bookmark } from '../utils/bookmarksService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

export default function BookmarksScreen() {
  const { selectedUser } = useUser();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookmarks = async () => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }

    try {
      const userBookmarks = await getBookmarks(selectedUser.id);
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('❌ Load bookmarks error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת המועדפים');
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [selectedUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleRemoveBookmark = async (bookmark: Bookmark) => {
    if (!selectedUser) return;

    Alert.alert(
      'הסרת מועדף',
      'האם ברצונך להסיר את הפוסט מהמועדפים?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הסר',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(selectedUser.id, bookmark.postId);
              setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
              console.log('✅ Bookmark removed');
            } catch (error) {
              console.error('❌ Remove bookmark error:', error);
              Alert.alert('שגיאה', 'שגיאה בהסרת המועדף');
            }
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    if (!selectedUser) return;

    Alert.alert(
      'ניקוי מועדפים',
      'האם ברצונך לנקות את כל המועדפים?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'נקה הכל',
          style: 'destructive',
          onPress: () => {
            setBookmarks([]);
            console.log('✅ All bookmarks cleared');
          }
        }
      ]
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'עכשיו';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return date.toLocaleDateString('he-IL');
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <View style={styles.bookmarkContainer}>
      <Image source={{ uri: item.postData.thumbnail }} style={styles.thumbnail} />
      
      <View style={styles.contentContainer}>
        <View style={styles.bookmarkHeader}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.postData.user.avatar }} style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.postData.user.name}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveBookmark(item)}
          >
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>{item.postData.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.postData.description}
        </Text>
      </View>
    </View>
  );

  if (!selectedUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>יש לבחור יוזר</Text>
          <Text style={styles.emptySubtitle}>בחר יוזר כדי לראות את המועדפים שלו</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>מועדפים</Text>
        {bookmarks.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.clearButtonText}>נקה הכל</Text>
          </TouchableOpacity>
        )}
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>אין מועדפים</Text>
          <Text style={styles.emptySubtitle}>הפוסטים שתשמור יופיעו כאן</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    fontSize: FontSizes.small,
    color: colors.error,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  bookmarkContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    lineHeight: 16,
  },
}); 