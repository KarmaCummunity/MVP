// components/ChatListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChatConversation, ChatUser } from '../globals/fakeData'; // Adjust path
import Colors from '../globals/Colors'; // Assuming you have a Colors file

interface ChatListItemProps {
  conversation: ChatConversation;
  user: ChatUser;
  onPress: (conversationId: string) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, user, onPress }) => {
  const isUnread = conversation.messages.some(msg => msg.senderId === user.id && !msg.read);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); // Same day
    } else if (diffDays === 1) { // yesterday
      return 'אתמול';
    } else if (diffDays <= 7) {
      const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
      return days[date.getDay()]; // Day of week
    } else {
      return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }); // DD/MM
    }
  };


  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(conversation.id)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        {user.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(conversation.lastMessageTimestamp)}</Text>
        </View>
        <Text style={[styles.lastMessage, isUnread && styles.unreadMessage]} numberOfLines={1}>
          {conversation.lastMessageText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
    margin: 1,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green, // Adjust to your green color
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ChatListItem;