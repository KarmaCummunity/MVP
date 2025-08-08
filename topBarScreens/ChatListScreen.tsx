// ChatListScreen – professional, concise, with in-file demo support and live updates
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import ChatListItem from '../components/ChatListItem';
import { users as allUsers, ChatUser } from '../globals/fakeData';
import { allUsers as characterUsers } from '../globals/characterTypes';
import { useUser } from '../context/UserContext';
import { getConversations, Conversation as ChatConversation, subscribeToConversations } from '../utils/chatService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import ScreenWrapper from '../components/ScreenWrapper';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Demo users (kept in-file for MVP – remove when real users are plugged in)
const DEMO_USERS: ChatUser[] = [
  { id: 'dummy_user_1', name: 'יוזר דמה 1', avatar: 'https://i.pravatar.cc/150?u=dummy_user_1', isOnline: true },
  { id: 'dummy_user_2', name: 'יוזר דמה 2', avatar: 'https://i.pravatar.cc/150?u=dummy_user_2', isOnline: false, lastSeen: new Date(Date.now() - 86400000).toISOString() },
];

// Demo conversations (merged with real ones; participant[0] will be switched to current user)
const DEMO_CONVERSATIONS: ChatConversation[] = [
  { id: 'dummy_conv_1', participants: ['user001', 'dummy_user_1'], lastMessageText: 'זוהי הודעת דמה ראשונה.', lastMessageTime: new Date().toISOString(), unreadCount: 2, createdAt: new Date().toISOString() },
  { id: 'dummy_conv_2', participants: ['user001', 'dummy_user_2'], lastMessageText: 'הודעת דמה שנייה, קצת יותר ארוכה.', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, createdAt: new Date(Date.now() - 3600000).toISOString() },
];

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { selectedUser } = useUser();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations (real + demo)
  const loadConversations = useCallback(async () => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }
    setRefreshing(true);
    try {
      const realConversations = await getConversations(selectedUser.id);
      const demoForUser = DEMO_CONVERSATIONS.map(c => ({ ...c, participants: [selectedUser.id, c.participants[1]] }));
      setConversations([...demoForUser, ...realConversations]);
    } catch (error) {
      console.error('❌ Load conversations error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת השיחות');
    } finally {
      setRefreshing(false);
    }
  }, [selectedUser]);

  // Subscribe to live updates while screen focused
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      if (!selectedUser) return;
      const unsubscribe = subscribeToConversations(selectedUser.id, updated => {
        setConversations(prev => {
          const prevReal = prev.filter(c => !c.id.startsWith('dummy_'));
          const demoForUser = DEMO_CONVERSATIONS.map(c => ({ ...c, participants: [selectedUser.id, c.participants[1]] }));
          const updatedIds = new Set(updated.map(c => c.id));
          const merged = [
            ...demoForUser,
            ...prevReal.filter(c => !updatedIds.has(c.id)),
            ...updated,
          ];
          return merged;
        });
      });
      return () => unsubscribe();
    }, [selectedUser, loadConversations])
  );

  const onRefresh = useCallback(() => loadConversations(), [loadConversations]);

  // Resolve display data for conversations (other user, last message, unread)
  const combinedUsers = useMemo(() => {
    // Merge fakeData users, demo users, and character users into ChatUser shape
    const mappedCharacterUsers: ChatUser[] = characterUsers.map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      isOnline: Boolean(u.isActive),
      lastSeen: u.lastActive || new Date().toISOString(),
      status: u.bio || '',
    }));
    return [...allUsers, ...DEMO_USERS, ...mappedCharacterUsers];
  }, []);

  const filteredSortedConversations = useMemo(() => {
    if (!selectedUser) return [] as ChatConversation[];
    const sorted = [...conversations].sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter(conv => {
      const otherId = conv.participants.find(id => id !== selectedUser.id);
      const other = combinedUsers.find(u => u.id === otherId);
      return other?.name?.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery, combinedUsers, selectedUser]);

  const handlePressChat = (conversationId: string, otherUserId: string, userName: string, userAvatar: string) => {
    navigation.navigate('ChatDetailScreen', { conversationId, otherUserId, userName, userAvatar });
  };

  // Create new chat – simple CTA next to the search bar
  const handleNewChat = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    navigation.navigate('NewChatScreen');
  };

  return (
    <ScreenWrapper navigation={navigation} style={styles.safeArea}>
      {/* Search bar for conversations */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="חפש צ'אט לפי שם"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton} activeOpacity={0.8}>
          <Icon name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {filteredSortedConversations.map(item => {
          const otherId = item.participants.find(id => id !== selectedUser?.id);
          let chattingUser = combinedUsers.find(u => u.id === otherId);
          if (!chattingUser) {
            // Fallback user if not present in any static dataset
            chattingUser = {
              id: otherId || 'unknown',
              name: `משתמש/ת`,
              avatar: 'https://i.pravatar.cc/150?u=unknown',
              isOnline: false,
              lastSeen: new Date().toISOString(),
              status: '',
            };
          }
          const chatUser: ChatUser = {
            id: chattingUser.id,
            name: chattingUser.name,
            avatar: chattingUser.avatar,
            isOnline: Boolean((chattingUser as any).isOnline),
            lastSeen: (chattingUser as any).lastActive || new Date().toISOString(),
            status: (chattingUser as any).bio || '',
          };
          const chatConversation = {
            id: item.id,
            userId: otherId || '',
            messages: [],
            lastMessageTimestamp: item.lastMessageTime,
            lastMessageText: item.lastMessageText,
            unreadCount: item.unreadCount,
          };
          return (
            <ChatListItem
              key={item.id}
              conversation={chatConversation}
              user={chatUser}
              onPress={() => handlePressChat(item.id, chatUser.id, chatUser.name, chatUser.avatar)}
            />
          );
        })}
        {filteredSortedConversations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>אין שיחות</Text>
            <Text style={styles.emptyStateSubtitle}>התחל שיחה חדשה או נקה את החיפוש</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlign: 'right',
    fontSize: FontSizes.body,
    flex: 1,
  },
  newChatButton: {
    marginLeft: 10,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
});
