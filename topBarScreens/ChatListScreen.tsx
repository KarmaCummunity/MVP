// screens/ChatListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView, Platform } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import ChatListItem from '../components/ChatListItem';
import { conversations as initialConversations, users, ChatConversation } from '../globals/fakeData'; // Adjust path
import Colors from '../globals/Colors'; // Assuming you have a Colors file
import Icon from 'react-native-vector-icons/Ionicons'; // Example icon

export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      // You might shuffle conversations or add new fake ones here
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>צ'אטים</Text>
        <TouchableOpacity onPress={() => alert('שלח הודעה חדשה')}>
          <Icon name="add-circle-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.instagramBlue} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 30 : 0, // Adjust for Android status bar
    marginBottom: Platform.OS === 'android' ? 40 : 0, // Adjust for Android status bar
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  listContent: {
    paddingVertical: 8,
  },
});