// screens/ChatListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Platform, Alert } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import ChatListItem from '../components/ChatListItem';
import { users, ChatUser } from '../globals/fakeData';
import { useUser } from '../context/UserContext';
import { getConversations, createSampleData, Conversation as ChatConversation } from '../utils/chatService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons as Icon } from '@expo/vector-icons';

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { selectedUser } = useUser();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Loading conversations
  const loadConversations = useCallback(async () => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }

    try {
      // Create sample data if none exist
      await createSampleData();
      
      const userConversations = await getConversations(selectedUser.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('❌ Load conversations error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת השיחות');
    }
  }, [selectedUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('💬 ChatListScreen - Screen focused, refreshing conversations...');
      loadConversations();
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [selectedUser])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations().finally(() => setRefreshing(false));
  }, [loadConversations]);

  const handlePressChat = (conversationId: string) => {
    const selectedConversation = conversations.find(conv => conv.id === conversationId);
    if (!selectedConversation) return;

    // Find the other user in conversation
    const otherParticipantId = selectedConversation.participants.find(id => id !== selectedUser?.id);
    const chattingUser = users.find(user => user.id === otherParticipantId);

    if (chattingUser) {
      navigation.navigate('ChatDetailScreen', {
        conversationId: selectedConversation.id,
        userName: chattingUser.name,
        userAvatar: chattingUser.avatar,
        otherUserId: otherParticipantId,
      });
    }
  };

  const renderItem = ({ item }: { item: ChatConversation }) => {
    // Find the other user in conversation
    const otherParticipantId = item.participants.find(id => id !== selectedUser?.id);
    const chattingUser = users.find(user => user.id === otherParticipantId);
    if (!chattingUser) return null;
    
    // Convert new User type to ChatUser type
    const chatUser: ChatUser = {
      id: chattingUser.id,
      name: chattingUser.name,
      avatar: chattingUser.avatar,
      isOnline: chattingUser.isActive,
      lastSeen: chattingUser.lastActive,
      status: chattingUser.bio,
    };
    
    // Create adapted ChatConversation object
    const chatConversation = {
      id: item.id,
      userId: otherParticipantId || '',
      messages: [],
      lastMessageTimestamp: item.lastMessageTime,
      lastMessage: item.lastMessageText,
      lastMessageText: item.lastMessageText,
      unreadCount: item.unreadCount,
    };
    
    return (
      <ChatListItem
        conversation={chatConversation}
        user={chatUser}
        onPress={handlePressChat}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>צ'אטים</Text>
        <TouchableOpacity onPress={() => alert('שלח הודעה חדשה')} style={styles.headerButton}>
          <Icon name="add-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
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
  listContent: {
    paddingVertical: 8,
  },
});