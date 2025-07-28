// screens/ChatListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Platform } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import ChatListItem from '../components/ChatListItem';
import { conversations as initialConversations, users, ChatConversation } from '../globals/fakeData';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setConversations([...initialConversations].sort(() => 0.5 - Math.random()));
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePressChat = (conversationId: string) => {
    const selectedConversation = conversations.find(conv => conv.id === conversationId);
    const chattingUser = users.find(user => user.id === conversationId);

    if (selectedConversation && chattingUser) {
      navigation.navigate('ChatDetailScreen', {
        conversationId: selectedConversation.id,
        userName: chattingUser.name,
        userAvatar: chattingUser.avatar,
      });
    }
  };

  const renderItem = ({ item }: { item: ChatConversation }) => {
    const chattingUser = users.find(user => user.id === item.userId);
    if (!chattingUser) return null;
    return (
      <ChatListItem
        conversation={item}
        user={chattingUser}
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