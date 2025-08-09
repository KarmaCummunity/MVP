// screens/NewChatScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { getFollowing, getFollowers, getFollowSuggestions } from '../utils/followService';
import { createConversation, getAllConversations, conversationExists, sendMessage } from '../utils/chatService';
import { CharacterType } from '../globals/characterTypes';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons as Icon } from '@expo/vector-icons';

type FilterType = 'all' | 'online' | 'highKarma' | 'recentFollowers';
type SortType = 'name' | 'karma' | 'followers' | 'recent';

type NewChatRouteParams = {
  // No specific params needed
};

export default function NewChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, NewChatRouteParams>, string>>();
  const { selectedUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<CharacterType[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<CharacterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [existingConversations, setExistingConversations] = useState<string[]>([]);

  // טעינת רשימת החברים ושיחות קיימות
  const loadFriends = useCallback(async () => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }

    try {
      setIsLoading(true);
      
      // קבלת רשימת האנשים שמשתמש עוקב אחריהם
      const following = await getFollowing(selectedUser.id);
      
      // קבלת רשימת העוקבים של המשתמש
      const followers = await getFollowers(selectedUser.id);
      
      // איחוד הרשימות (חברים = עוקבים + עוקבים אחריהם)
      const allFriends = [...following, ...followers];
      
      // הסרת כפילויות
      const uniqueFriends = allFriends.filter((friend, index, self) => 
        index === self.findIndex(f => f.id === friend.id)
      );
      
      // קבלת שיחות קיימות (כולל ריקות)
      const conversations = await getAllConversations(selectedUser.id);
      const existingUserIds = conversations.flatMap(conv => 
        conv.participants.filter(id => id !== selectedUser.id)
      );
      setExistingConversations(existingUserIds);
      
      // אם אין חברים, הצג המלצות
      if (uniqueFriends.length === 0) {
        const suggestions = await getFollowSuggestions(selectedUser.id, 10);
        setFriends(suggestions);
      } else {
        setFriends(uniqueFriends);
      }
      
    } catch (error) {
      console.error('❌ Load friends error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת רשימת החברים');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedUser]);

  // פונקציית סינון
  const applyFilters = useCallback((friendsList: CharacterType[]) => {
    let filtered = [...friendsList];
    
    // סינון לפי סוג
    switch (activeFilter) {
      case 'online':
        filtered = filtered.filter(friend => friend.isActive);
        break;
      case 'highKarma':
        filtered = filtered.filter(friend => friend.karmaPoints >= 100);
        break;
      case 'recentFollowers':
        // הצגת רק עוקבים חדשים (נניח שיש תאריך בעתיד)
        filtered = filtered.filter(friend => friend.followersCount > 0);
        break;
    }
    
    // סינון לפי חיפוש
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // מיון
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'he'));
        break;
      case 'karma':
        filtered.sort((a, b) => b.karmaPoints - a.karmaPoints);
        break;
      case 'followers':
        filtered.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
        break;
      case 'recent':
        // מיון לפי פעילות אחרונה (נשתמש בשדה isActive כדוגמה)
        filtered.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return 0;
        });
        break;
    }
    
    return filtered;
  }, [activeFilter, sortBy, searchQuery]);

  // עדכון רשימה מסוננת
  useEffect(() => {
    const filtered = applyFilters(friends);
    setFilteredFriends(filtered);
  }, [friends, applyFilters]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFriends();
  }, [loadFriends]);

  // יצירת שיחה חדשה או ניווט לשיחה קיימת
  const handleCreateChat = async (friend: CharacterType) => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }

    try {
      // בדיקה אם קיימת שיחה
      const existingConvId = await conversationExists(selectedUser.id, friend.id);
      let conversationId: string;
      
      if (existingConvId) {
        console.log('💬 Conversation already exists:', existingConvId);
        conversationId = existingConvId;
      } else {
        console.log('💬 Creating new conversation...');
        conversationId = await createConversation([selectedUser.id, friend.id]);
        
        // שליחת הודעת ברוך הבא אוטומטית
        const welcomeMessage = {
          conversationId,
          senderId: selectedUser.id,
          text: `היי ${friend.name}! 👋`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'text' as const,
          status: 'sent' as const,
        };
        
        await sendMessage(welcomeMessage);
        console.log('💬 Sent welcome message');
      }
      
      // ניווט למסך הצ'אט
      (navigation as any).navigate('ChatDetailScreen', {
        conversationId,
        userName: friend.name,
        userAvatar: friend.avatar,
        otherUserId: friend.id,
      });
      
    } catch (error) {
      console.error('❌ Create chat error:', error);
      Alert.alert('שגיאה', 'שגיאה ביצירת השיחה');
    }
  };

  const renderFriend = ({ item }: { item: CharacterType }) => {
    const hasExistingChat = existingConversations.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.friendItem, hasExistingChat && styles.friendItemWithChat]} 
        onPress={() => handleCreateChat(item)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.isActive && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.friendInfo}>
          <View style={styles.friendHeader}>
            <Text style={styles.friendName}>{item.name}</Text>
            {hasExistingChat && (
              <View style={styles.existingChatBadge}>
                <Text style={styles.existingChatText}>שיחה קיימת</Text>
              </View>
            )}
          </View>
          <Text style={styles.friendBio} numberOfLines={1}>
            {item.bio || 'אין תיאור'}
          </Text>
          <View style={styles.friendStats}>
            <Text style={styles.karmaPoints}>⭐ {item.karmaPoints} נקודות קארמה</Text>
            <Text style={styles.followersCount}>
              👥 {item.followersCount || 0} עוקבים
            </Text>
          </View>
        </View>
        <Icon 
          name={hasExistingChat ? "chatbubble" : "chatbubble-outline"} 
          size={24} 
          color={hasExistingChat ? colors.success : colors.primary} 
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>אין חברים עדיין</Text>
      <Text style={styles.emptyStateSubtitle}>
        התחל לעקוב אחרי אנשים כדי ליצור שיחות חדשות
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => (navigation as any).navigate('DiscoverPeopleScreen')}
      >
        <Text style={styles.exploreButtonText}>גלה אנשים חדשים</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>שיחה חדשה</Text>
        <TouchableOpacity 
          onPress={() => (navigation as any).navigate('DiscoverPeopleScreen')}
          style={styles.headerButton}
        >
          <Icon name="people-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש חברים..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="funnel-outline" size={20} color={colors.primary} />
          <Text style={styles.filterButtonText}>סינון</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
                הכל
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === 'online' && styles.filterChipActive]}
              onPress={() => setActiveFilter('online')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'online' && styles.filterChipTextActive]}>
                מחוברים
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === 'highKarma' && styles.filterChipActive]}
              onPress={() => setActiveFilter('highKarma')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'highKarma' && styles.filterChipTextActive]}>
                קארמה גבוהה
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterChip, activeFilter === 'recentFollowers' && styles.filterChipActive]}
              onPress={() => setActiveFilter('recentFollowers')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'recentFollowers' && styles.filterChipTextActive]}>
                עוקבים חדשים
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>מיון:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScrollView}>
              <TouchableOpacity 
                style={[styles.sortChip, sortBy === 'name' && styles.sortChipActive]}
                onPress={() => setSortBy('name')}
              >
                <Text style={[styles.sortChipText, sortBy === 'name' && styles.sortChipTextActive]}>
                  שם
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortChip, sortBy === 'karma' && styles.sortChipActive]}
                onPress={() => setSortBy('karma')}
              >
                <Text style={[styles.sortChipText, sortBy === 'karma' && styles.sortChipTextActive]}>
                  קארמה
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortChip, sortBy === 'followers' && styles.sortChipActive]}
                onPress={() => setSortBy('followers')}
              >
                <Text style={[styles.sortChipText, sortBy === 'followers' && styles.sortChipTextActive]}>
                  עוקבים
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortChip, sortBy === 'recent' && styles.sortChipActive]}
                onPress={() => setSortBy('recent')}
              >
                <Text style={[styles.sortChipText, sortBy === 'recent' && styles.sortChipTextActive]}>
                  פעילות
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {isLoading && filteredFriends.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>טוען חברים...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSizes.body,
    color: colors.text,
    textAlign: 'right',
  },
  clearButton: {
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundPrimary,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  friendBio: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  karmaPoints: {
    fontSize: FontSizes.caption,
    color: colors.primary,
    marginRight: 12,
  },
  followersCount: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  filterButtonText: {
    color: colors.primary,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScrollView: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundPrimary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.caption,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: FontSizes.body,
    color: colors.text,
    fontWeight: '600',
    marginRight: 12,
  },
  sortScrollView: {
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundPrimary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortChipText: {
    fontSize: FontSizes.caption,
    color: colors.text,
  },
  sortChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.backgroundPrimary,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  existingChatBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: colors.success + '20',
  },
  existingChatText: {
    fontSize: FontSizes.caption - 2,
    color: colors.success,
    fontWeight: '600',
  },
  friendItemWithChat: {
    borderColor: colors.success + '30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
}); 