import { Platform } from 'react-native';
import { USE_FIRESTORE } from './dbConfig';
import { getFirebase } from './firebaseClient';
import { collection as fsCollection, query as fsQuery, where as fsWhere, onSnapshot } from 'firebase/firestore';
import { sendMessageNotification } from './notificationService';
import { db, DB_COLLECTIONS, DatabaseService } from './databaseService';

// TODO: CRITICAL - This file is extremely complex (735 lines). Split into specialized services:
//   - ConversationService for conversation management
//   - MessageService for message operations
//   - RealtimeService for listeners and subscriptions
//   - NotificationService integration for chat notifications
// TODO: Add comprehensive error handling and retry mechanisms for all operations
// TODO: Implement proper message queuing system for offline support
// TODO: Add comprehensive TypeScript interfaces with strict typing
// TODO: Implement proper connection management and reconnection logic
// TODO: Add comprehensive message validation and sanitization
import { logger } from './loggerService';
// Removed console.log statements - using proper logging service
// TODO: Add comprehensive unit tests for all chat operations
// TODO: Implement proper memory management for listeners and subscriptions
// TODO: Add message encryption and security measures

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  fileData?: {
    id: string;
    name: string;
    uri: string;
    type: 'image' | 'video' | 'file' | 'voice';
    size?: number;
    mimeType?: string;
    thumbnail?: string;
    duration?: number; // for audio/video
    dimensions?: { width: number; height: number }; // for images/videos
  };
  replyTo?: string; // ID of message being replied to
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: string;
  }>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

// Event listeners for real-time updates
// Messages: key is `${conversationId}_${userId}` to scope polling per-user
// TODO: Implement proper listener lifecycle management to prevent memory leaks
// TODO: Add listener cleanup on app backgrounding/foregrounding
// TODO: Implement proper error handling for failed listeners
// TODO: Add connection state management and reconnection logic
const messageListeners: Map<string, Set<(messages: Message[]) => void>> = new Map();
// Conversations: key is `userId`
const conversationListeners: Map<string, Set<(conversations: Conversation[]) => void>> = new Map();

const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createConversation = async (participants: string[]): Promise<string> => {
  // TODO: Add comprehensive input validation for participants array
  // TODO: Check for duplicate conversations between same participants
  // TODO: Add proper error handling with specific error types
  // TODO: Implement rate limiting to prevent conversation spam
  // TODO: Add proper logging and monitoring for conversation creation
  try {
    const conversationId = generateId('conv');
    
    const newConversation: Conversation = {
      id: conversationId,
      participants,
      lastMessageText: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    for (const participantId of participants) {
      await db.createChat(participantId, conversationId, { ...newConversation, unreadCount: 0 });
    }
    
    logger.info('ChatService', 'Conversation created', { conversationId });
    
    // Notify conversation listeners for all participants
    participants.forEach(participantId => {
      notifyConversationListeners(participantId);
    });
    
    return conversationId;
  } catch (error) {
    logger.error('ChatService', 'Create conversation error', { error });
    throw error;
  }
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    logger.info('ChatService', 'Getting conversations for user', { userId });
    const conversations = await db.getUserChats(userId);
    logger.debug('ChatService', 'Raw conversations from DB', { count: conversations.length, conversations });
    
    // Don't filter empty conversations - show all
    const sorted = (conversations as Conversation[]).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    logger.debug('ChatService', 'Sorted conversations', { count: sorted.length, conversations: sorted.map(c => ({ id: c.id, lastMessage: c.lastMessageText || 'שיחה חדשה' })) });
    return sorted;
  } catch (error) {
    logger.error('ChatService', 'Get conversations error', { error });
    return [];
  }
};

export const getConversationById = async (conversationId: string, userId: string): Promise<Conversation | null> => {
  try {
    const conversation = await db.getChat(userId, conversationId);
    return conversation as Conversation | null;
  } catch (error) {
    logger.error('ChatService', 'Get conversation error', { error });
    return null;
  }
};

export const sendMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  try {
    const messageId = generateId('msg');
    
    const newMessage: Message = {
      ...message,
      id: messageId,
      status: 'sent', // Default status for sent messages
    };

    const senderView = await getConversationById(message.conversationId, message.senderId);
    const participants = senderView?.participants || [];
    if (participants.length === 0) {
      throw new Error('Conversation not found or has no participants');
    }

    for (const participantId of participants) {
      await db.createMessage(participantId, messageId, newMessage);
    }

    let displayText = message.text;
    if (message.type === 'image') displayText = '📷 תמונה';
    else if (message.type === 'video') displayText = '🎥 סרטון';
    else if (message.type === 'file') displayText = '📎 קובץ';

    for (const participantId of participants) {
      const existing = await db.getChat(participantId, message.conversationId);
      const baseConv: Conversation = (existing as Conversation) || {
        id: message.conversationId,
        participants,
        lastMessageText: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };

      const isRecipient = participantId !== message.senderId;
      const unreadCount = isRecipient ? (baseConv.unreadCount || 0) + 1 : 0;

      const updatedConversation: Conversation = {
        ...baseConv,
        lastMessageText: displayText,
        lastMessageTime: message.timestamp,
        unreadCount,
      };

      await db.createChat(participantId, message.conversationId, updatedConversation);
      logger.debug('ChatService', 'Updated conversation for participant', { participantId });
    }

    logger.info('ChatService', 'Message sent', { messageId });
    logger.debug('ChatService', 'Conversation participants', { participants });
    
    // Notify listeners about the new message for each participant
    for (const participantId of participants) {
      notifyMessageListeners(message.conversationId, participantId);
    }
    
    // Notify conversation listeners for all participants
    logger.debug('ChatService', 'Notifying conversation listeners', { participants });
    participants.forEach(participantId => {
      logger.debug('ChatService', 'Notifying participant', { participantId });
      notifyConversationListeners(participantId);
      
      // Send notification to other participants (not the sender)
      if (participantId !== message.senderId) {
        const senderName = 'משתמש'; // TODO: Get actual sender name
        sendMessageNotification(senderName, message.text, message.conversationId, participantId);
      }
    });
    
    return messageId;
  } catch (error) {
    logger.error('ChatService', 'Send message error', { error });
    throw error;
  }
};

export const getMessages = async (conversationId: string, userId: string): Promise<Message[]> => {
  try {
    const messages = await db.getChatMessages(userId, conversationId);
    return (messages as Message[]).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    logger.error('ChatService', 'Get messages error', { error });
    return [];
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    logger.info('ChatService', 'Marking messages as read', { conversationId, userId });
    
    const messages = await getMessages(conversationId, userId);
    logger.debug('ChatService', 'Found total messages', { count: messages.length });
    
    for (const msg of messages) {
      if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
        logger.debug('ChatService', 'Marking message as read', { messageId: msg.id });
        await DatabaseService.update(DB_COLLECTIONS.MESSAGES, userId, msg.id, { read: true });
      }
    }

    const conversation = await getConversationById(conversationId, userId);
    if (conversation) {
      const updatedConversation = { ...conversation, unreadCount: 0 };
      await db.createChat(userId, conversationId, updatedConversation);
      logger.debug('ChatService', 'Conversation unread count reset to 0');
    } else {
      logger.warn('ChatService', 'Conversation not found', { conversationId });
    }

    logger.info('ChatService', 'Messages marked as read');
  } catch (error) {
    logger.error('ChatService', 'Mark as read error', { error });
    throw error;
  }
};

// Real-time listener for messages (improved with event system)
export const subscribeToMessages = (conversationId: string, userId: string, callback: (messages: Message[]) => void) => {
  const key = `${conversationId}_${userId}`;
  if (!messageListeners.has(key)) {
    messageListeners.set(key, new Set());
  }
  messageListeners.get(key)!.add(callback);

  if (USE_FIRESTORE) {
    const { db } = getFirebase();
    const col = fsCollection(db, DB_COLLECTIONS.MESSAGES);
    const q = fsQuery(col, fsWhere('_userId', '==', userId), fsWhere('conversationId', '==', conversationId));
    const unsub = onSnapshot(q, async (snap) => {
      const items = snap.docs.map((d) => d.data() as Message).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      callback(items);
    });
    return () => {
      unsub();
      const listeners = messageListeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          messageListeners.delete(key);
        }
      }
    };
  } else {
    getMessages(conversationId, userId).then(callback);
    const interval = setInterval(async () => {
      const messages = await getMessages(conversationId, userId);
      callback(messages);
    }, 2000);
    return () => {
      clearInterval(interval);
      const listeners = messageListeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          messageListeners.delete(key);
        }
      }
    };
  }
};

// Real-time listener for conversations
export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  if (!conversationListeners.has(userId)) {
    conversationListeners.set(userId, new Set());
  }
  conversationListeners.get(userId)!.add(callback);

  if (USE_FIRESTORE) {
    const { db } = getFirebase();
    const col = fsCollection(db, DB_COLLECTIONS.CHATS);
    const q = fsQuery(col, fsWhere('_userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => d.data() as Conversation)
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      callback(items);
    });
    return () => {
      unsub();
      const listeners = conversationListeners.get(userId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          conversationListeners.delete(userId);
        }
      }
    };
  } else {
    getConversations(userId).then((conversations) => {
      callback(conversations);
    });
    const interval = setInterval(async () => {
      const conversations = await getConversations(userId);
      callback(conversations);
    }, 5000);
    return () => {
      clearInterval(interval);
      const listeners = conversationListeners.get(userId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          conversationListeners.delete(userId);
        }
      }
    };
  }
};

// Notify listeners when data changes
const notifyMessageListeners = async (conversationId: string, userId: string) => {
  const key = `${conversationId}_${userId}`;
  const listeners = messageListeners.get(key);
  if (!listeners || listeners.size === 0) return;
  const messages = await getMessages(conversationId, userId);
  listeners.forEach(callback => {
    if (typeof callback === 'function') callback(messages);
  });
};

const notifyConversationListeners = async (userId: string) => {
  const listeners = conversationListeners.get(userId);
  logger.debug('ChatService', 'Notifying conversation listeners for user', { userId, hasListeners: !!listeners });
  if (listeners && listeners.size > 0) {
    const conversations = await getConversations(userId);
    logger.debug('ChatService', 'Found conversations for user', { userId, count: conversations.length });
    // Conversations are already sorted by getConversations
    listeners.forEach(callback => {
      if (typeof callback === 'function') {
        callback(conversations);
      }
    });
  }
};

export const deleteConversation = async (conversationId: string, userId: string): Promise<void> => {
  try {
    await DatabaseService.delete(DB_COLLECTIONS.CHATS, userId, conversationId);

    const messages = await getMessages(conversationId, userId);
    const messageIds = messages.map(msg => msg.id);
    await DatabaseService.batchDelete(DB_COLLECTIONS.MESSAGES, userId, messageIds);

    logger.info('ChatService', 'Conversation deleted');
  } catch (error) {
    logger.error('ChatService', 'Delete conversation error', { error });
    throw error;
  }
};

export const clearAllData = async (userId?: string): Promise<void> => {
  try {
    if (userId) {
      await DatabaseService.deleteUserData(userId);
      logger.info('ChatService', 'All chat data cleared for user', { userId });
    } else {
      await DatabaseService.clearAllData();
      logger.info('ChatService', 'All chat data cleared');
    }
  } catch (error) {
    logger.error('ChatService', 'Clear data error', { error });
    throw error;
  }
};

export const createSampleData = async (): Promise<void> => {
  try {
    logger.info('ChatService', 'Sample data creation disabled to prevent overwriting real conversations');
  } catch (error) {
    logger.error('ChatService', 'Create sample data error', { error });
  }
};

export const createSampleChatData = async (userId: string): Promise<void> => {
  try {
    logger.info('ChatService', 'Creating sample chat data for user', { userId });
    
    const sampleConversations: Conversation[] = [
      {
        id: 'conv_sample_1',
        participants: [userId, 'char2'],
        lastMessageText: 'היי! איך אתה?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'conv_sample_2',
        participants: [userId, 'char3'],
        lastMessageText: 'תודה על העזרה!',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleMessages: Message[] = [
      {
        id: 'msg_sample_1',
        conversationId: 'conv_sample_1',
        senderId: 'char2',
        text: 'היי! איך אתה?',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sent',
      },
      {
        id: 'msg_sample_2',
        conversationId: 'conv_sample_1',
        senderId: userId,
        text: 'מעולה, תודה! איך אתה?',
        timestamp: new Date().toISOString(),
        read: true,
        type: 'text',
        status: 'sent',
      },
      {
        id: 'msg_sample_3',
        conversationId: 'conv_sample_2',
        senderId: 'char3',
        text: 'תודה על העזרה!',
        timestamp: new Date().toISOString(),
        read: true,
        type: 'text',
        status: 'sent',
      },
    ];

    // Guard: do not create sample data for real-auth sessions
    const mode = await (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem('auth_mode');
      } catch (e) {
        return null;
      }
    })();
    if (mode === 'real') {
      logger.info('ChatService', 'Skipping sample chat data creation in real auth mode');
      return;
    }

    for (const conversation of sampleConversations) {
      await db.createChat(userId, conversation.id, conversation);
    }
    
    for (const message of sampleMessages) {
      await db.createMessage(userId, message.id, message);
    }
    
    logger.info('ChatService', 'Sample chat data created for user', { userId, conversationCount: sampleConversations.length, messageCount: sampleMessages.length });
  } catch (error) {
    logger.error('ChatService', 'Create sample chat data error', { error });
  }
};

// Advanced Chat Functions

// Edit message
export const editMessage = async (
  userId: string,
  messageId: string,
  newText: string
): Promise<void> => {
  try {
    await db.updateMessage(userId, messageId, {
      text: newText,
      edited: true,
      editedAt: new Date().toISOString(),
    });
    
    // Note: We would need the conversationId to notify listeners properly
    // For now, we'll skip notification as we don't have access to conversationId from messageId alone
    
    logger.info('ChatService', 'Message edited', { messageId });
  } catch (error) {
    logger.error('ChatService', 'Edit message error', { error });
    throw error;
  }
};

// Delete message
export const deleteMessage = async (
  userId: string,
  messageId: string,
  deleteForEveryone: boolean = false
): Promise<void> => {
  try {
    if (deleteForEveryone) {
      // Mark as deleted instead of removing
      await db.updateMessage(userId, messageId, {
        deleted: true,
        deletedAt: new Date().toISOString(),
        text: 'הודעה זו נמחקה',
      });
    } else {
      // Remove only for current user
      await db.deleteMessage(userId, messageId);
    }
    
    logger.info('ChatService', 'Message deleted', { messageId });
  } catch (error) {
    logger.error('ChatService', 'Delete message error', { error });
    throw error;
  }
};

// Add reaction to message
export const addMessageReaction = async (
  userId: string,
  messageId: string,
  emoji: string
): Promise<void> => {
  try {
    const reactionId = generateId('reaction');
    await db.addReaction(userId, reactionId, {
      id: reactionId,
      messageId,
      userId,
      emoji,
      timestamp: new Date().toISOString(),
    });
    
    logger.info('ChatService', 'Reaction added', { reactionId });
  } catch (error) {
    logger.error('ChatService', 'Add reaction error', { error });
    throw error;
  }
};

// Remove reaction from message
export const removeMessageReaction = async (
  userId: string,
  reactionId: string
): Promise<void> => {
  try {
    await db.removeReaction(userId, reactionId);
    logger.info('ChatService', 'Reaction removed', { reactionId });
  } catch (error) {
    logger.error('ChatService', 'Remove reaction error', { error });
    throw error;
  }
};

// Send voice message
export const sendVoiceMessage = async (
  conversationId: string,
  senderId: string,
  voiceData: {
    uri: string;
    duration: number;
    mimeType: string;
  }
): Promise<string> => {
  try {
    const voiceId = generateId('voice');
    const messageId = generateId('msg');
    
    // Save voice data
    await db.saveVoiceMessage(senderId, voiceId, {
      id: voiceId,
      uri: voiceData.uri,
      duration: voiceData.duration,
      mimeType: voiceData.mimeType,
      timestamp: new Date().toISOString(),
    });
    
    // Create message with voice reference
    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      text: '🎤 הודעה קולית',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'voice',
      status: 'sent',
      fileData: {
        id: voiceId,
        name: 'voice_message.m4a',
        uri: voiceData.uri,
        type: 'voice',
        duration: voiceData.duration,
        mimeType: voiceData.mimeType,
      },
    };
    
    await sendMessage(message);
    return messageId;
  } catch (error) {
    logger.error('ChatService', 'Send voice message error', { error });
    throw error;
  }
};

// Search messages
export const searchMessages = async (
  userId: string,
  searchQuery: string
): Promise<Message[]> => {
  try {
    const results = await db.searchMessages(userId, searchQuery);
    return results as Message[];
  } catch (error) {
    logger.error('ChatService', 'Search messages error', { error });
    return [];
  }
};

// Get message reactions
export const getMessageReactions = async (
  userId: string,
  messageId: string
): Promise<Array<{ userId: string; emoji: string; timestamp: string }>> => {
  try {
    const reactions = await db.getMessageReactions(userId, messageId);
    return reactions as any[];
  } catch (error) {
    logger.error('ChatService', 'Get reactions error', { error });
    return [];
  }
};

// Set typing status
export const setTypingStatus = async (
  userId: string,
  conversationId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    if (isTyping) {
      await db.setTypingStatus(userId, conversationId, {
        userId,
        conversationId,
        isTyping: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      await db.clearTypingStatus(userId, conversationId);
    }
  } catch (error) {
    logger.error('ChatService', 'Set typing status error', { error });
  }
};

// Get all conversations including empty ones
export const getAllConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversations = await db.getUserChats(userId);
    return (conversations as Conversation[]).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  } catch (error) {
    logger.error('ChatService', 'Get all conversations error', { error });
    return [];
  }
};

// Check if conversation exists
export const conversationExists = async (
  userId: string,
  otherUserId: string
): Promise<string | null> => {
  try {
    // Use getAllConversations to check even empty conversations
    const conversations = await getAllConversations(userId);
    const existingConv = conversations.find(conv => 
      conv.participants.includes(userId) && 
      conv.participants.includes(otherUserId) &&
      conv.participants.length === 2
    );
    return existingConv ? existingConv.id : null;
  } catch (error) {
    logger.error('ChatService', 'Check conversation exists error', { error });
    return null;
  }
};

// Debug function to check database content
export const debugDatabaseContent = async (userId: string) => {
  try {
    logger.debug('ChatService', '=== DATABASE DEBUG ===');
    logger.debug('ChatService', 'User ID', { userId });
    
    // Get all chats
    const chats = await db.getUserChats(userId);
    logger.debug('ChatService', 'Total Chats', { count: chats.length });
    chats.forEach((chat: any) => {
      logger.debug('ChatService', 'Chat', {
        id: chat.id,
        participants: chat.participants,
        lastMessage: chat.lastMessageText,
        lastTime: chat.lastMessageTime,
      });
    });
    
    // Get all messages
    const messages = await DatabaseService.list(DB_COLLECTIONS.MESSAGES, userId);
    logger.debug('ChatService', 'Total Messages', { count: messages.length });
    
    logger.debug('ChatService', '=== END DEBUG ===');
  } catch (error) {
    logger.error('ChatService', 'Debug error', { error });
  }
}; 