// components/ChatListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatConversation, ChatUser } from '../types/models';
import colors from '../globals/colors'; // Assuming you have a Colors file
import { fontSizes as FontSizes } from '../globals/appConstants';

interface ChatListItemProps {
  conversation: ChatConversation;
  user: ChatUser;
  onPress: (conversationId: string) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, user, onPress }) => {
  const { t } = useTranslation(['common','chat']);
  // Use unreadCount directly instead of checking the messages array
  // This is because the messages array is not loaded in the ChatListScreen
  const isUnread = (conversation.unreadCount ?? 0) > 0;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('common:time.daysAgo', { count: 1 });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
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
          {conversation.lastMessageText || t('chat:startNewConversation')}
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
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
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
    backgroundColor: colors.success, // Adjust to your green color
    borderWidth: 2,
    borderColor: colors.white,
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
    fontSize: FontSizes.body,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  lastMessage: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default ChatListItem;