import { Platform } from 'react-native';
import { sendMessageNotification } from './notificationService';
import { db, DB_COLLECTIONS, DatabaseService } from './databaseService';

// טיפוסים
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
const messageListeners: Map<string, Set<(messages: Message[]) => void>> = new Map();
const conversationListeners: Map<string, Set<(conversations: Conversation[]) => void>> = new Map();

// פונקציות עזר
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// פונקציות לשיחות
export const createConversation = async (participants: string[]): Promise<string> => {
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

    // שמירת השיחה לכל משתתף
    for (const participantId of participants) {
      await db.createChat(participantId, conversationId, newConversation);
    }
    
    console.log('✅ Conversation created (Database):', conversationId);
    
    // Notify conversation listeners for all participants
    participants.forEach(participantId => {
      notifyConversationListeners(participantId);
    });
    
    return conversationId;
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    throw error;
  }
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    console.log(`📋 Getting conversations for user: ${userId}`);
    const conversations = await db.getUserChats(userId);
    console.log(`📋 Raw conversations from DB:`, conversations.length, conversations);
    
    // Don't filter empty conversations - show all
    const sorted = (conversations as Conversation[]).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    console.log(`📋 Sorted conversations:`, sorted.length, sorted.map(c => ({ id: c.id, lastMessage: c.lastMessageText || 'שיחה חדשה' })));
    return sorted;
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    return [];
  }
};

export const getConversationById = async (conversationId: string, userId: string): Promise<Conversation | null> => {
  try {
    const conversation = await db.getChat(userId, conversationId);
    return conversation as Conversation | null;
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    return null;
  }
};

// פונקציות להודעות
export const sendMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  try {
    const messageId = generateId('msg');
    
    const newMessage: Message = {
      ...message,
      id: messageId,
      status: 'sent', // Default status for sent messages
    };

    // שמירת ההודעה לכל משתתף בשיחה
    const conversation = await getConversationById(message.conversationId, message.senderId);
    if (conversation) {
      for (const participantId of conversation.participants) {
        await db.createMessage(participantId, messageId, newMessage);
      }

      // עדכון השיחה לכל משתתף
      let displayText = message.text;
      if (message.type === 'image') {
        displayText = '📷 תמונה';
      } else if (message.type === 'video') {
        displayText = '🎥 סרטון';
      } else if (message.type === 'file') {
        displayText = '📎 קובץ';
      }
      
      const updatedConversation = {
        ...conversation,
        lastMessageText: displayText,
        lastMessageTime: message.timestamp,
        unreadCount: conversation.unreadCount + 1,
      };

      for (const participantId of conversation.participants) {
        // Use create which will overwrite if exists
        await db.createChat(participantId, message.conversationId, updatedConversation);
        console.log(`💾 Updated conversation for participant ${participantId}`);
      }
    }

    console.log('✅ Message sent (Database):', messageId);
    console.log('📢 Conversation participants:', conversation?.participants);
    
    // Notify listeners about the new message
    notifyMessageListeners(message.conversationId);
    
    // Notify conversation listeners for all participants
    if (conversation) {
      console.log('📢 Notifying conversation listeners for participants:', conversation.participants);
      conversation.participants.forEach(participantId => {
        console.log(`📢 Notifying participant ${participantId}`);
        notifyConversationListeners(participantId);
        
        // Send notification to other participants (not the sender)
        if (participantId !== message.senderId) {
          // Get sender name (in a real app, this would come from user service)
          const senderName = 'משתמש'; // TODO: Get actual sender name
          sendMessageNotification(senderName, message.text, message.conversationId, participantId);
        }
      });
    } else {
      console.log('❌ No conversation found for notifying listeners');
    }
    
    return messageId;
  } catch (error) {
    console.error('❌ Send message error:', error);
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
    console.error('❌ Get messages error:', error);
    return [];
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    console.log('🔍 Marking messages as read for conversation:', conversationId, 'user:', userId);
    
    // סימון הודעות כנקראו
    const messages = await getMessages(conversationId, userId);
    console.log('📝 Found', messages.length, 'total messages');
    
    for (const msg of messages) {
      if (msg.conversationId === conversationId && msg.senderId !== userId && !msg.read) {
        console.log('✅ Marking message as read:', msg.id);
        await DatabaseService.update(DB_COLLECTIONS.MESSAGES, userId, msg.id, { read: true });
      }
    }

    // איפוס מונה ההודעות שלא נקראו
    const conversation = await getConversationById(conversationId, userId);
    if (conversation) {
      const updatedConversation = { ...conversation, unreadCount: 0 };
      await db.createChat(userId, conversationId, updatedConversation);
      console.log('✅ Conversation unread count reset to 0');
    } else {
      console.log('⚠️ Conversation not found:', conversationId);
    }

    console.log('✅ Messages marked as read (Database)');
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    throw error;
  }
};

// Real-time listener for messages (improved with event system)
export const subscribeToMessages = (conversationId: string, userId: string, callback: (messages: Message[]) => void) => {
  // Add listener to the map
  if (!messageListeners.has(conversationId)) {
    messageListeners.set(conversationId, new Set());
  }
  messageListeners.get(conversationId)!.add(callback);
  
  // Initial call
  getMessages(conversationId, userId).then(callback);
  
  // Set up polling every 3 seconds (faster than before)
  const interval = setInterval(async () => {
    const messages = await getMessages(conversationId, userId);
    callback(messages);
  }, 3000);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    const listeners = messageListeners.get(conversationId);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        messageListeners.delete(conversationId);
      }
    }
  };
};

// Real-time listener for conversations
export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  // Add listener to the map
  if (!conversationListeners.has(userId)) {
    conversationListeners.set(userId, new Set());
  }
  conversationListeners.get(userId)!.add(callback);
  
  // Initial call
  getConversations(userId).then((conversations) => {
    // Conversations are already sorted by getConversations
    callback(conversations);
  });
  
  // Set up polling every 5 seconds
  const interval = setInterval(async () => {
    const conversations = await getConversations(userId);
    // Conversations are already sorted by getConversations
    callback(conversations);
  }, 5000);
  
  // Return cleanup function
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
};

// Notify listeners when data changes
const notifyMessageListeners = async (conversationId: string) => {
  const listeners = messageListeners.get(conversationId);
  if (listeners) {
    // Get messages for all participants in the conversation
    const conversation = await getConversationById(conversationId, 'temp'); // We need to get the conversation first
    if (conversation) {
      const messages = await getMessages(conversationId, conversation.participants[0]); // Use first participant as default
      listeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(messages);
        }
      });
    }
  }
};

const notifyConversationListeners = async (userId: string) => {
  const listeners = conversationListeners.get(userId);
  console.log(`🔔 Notifying conversation listeners for user ${userId}, has listeners: ${!!listeners}`);
  if (listeners && listeners.size > 0) {
    const conversations = await getConversations(userId);
    console.log(`🔔 Found ${conversations.length} conversations for user ${userId}`);
    // Conversations are already sorted by getConversations
    listeners.forEach(callback => {
      if (typeof callback === 'function') {
        callback(conversations);
      }
    });
  }
};

// פונקציות נוספות
export const deleteConversation = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // מחיקת השיחה מהמשתמש
    await DatabaseService.delete(DB_COLLECTIONS.CHATS, userId, conversationId);

    // מחיקת כל ההודעות של השיחה מהמשתמש
    const messages = await getMessages(conversationId, userId);
    const messageIds = messages.map(msg => msg.id);
    await DatabaseService.batchDelete(DB_COLLECTIONS.MESSAGES, userId, messageIds);

    console.log('✅ Conversation deleted (Database)');
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    throw error;
  }
};

export const clearAllData = async (userId?: string): Promise<void> => {
  try {
    if (userId) {
      // מחיקת כל הנתונים של משתמש ספציפי
      await DatabaseService.deleteUserData(userId);
      console.log('✅ All chat data cleared for user (Database):', userId);
    } else {
      // מחיקת כל הנתונים
      await DatabaseService.clearAllData();
      console.log('✅ All chat data cleared (Database)');
    }
  } catch (error) {
    console.error('❌ Clear data error:', error);
    throw error;
  }
};

// יצירת נתונים לדוגמה - כרגע ריק
export const createSampleData = async (): Promise<void> => {
  try {
    console.log('📊 Sample data creation disabled to prevent overwriting real conversations');
    
    // Disabled to prevent overwriting real conversations
    // await createSampleChatData('char1');
    
    // console.log('✅ Sample chat data created successfully');
  } catch (error) {
    console.error('❌ Create sample data error:', error);
  }
};

// פונקציה ליצירת נתוני צ'אט לדוגמה
export const createSampleChatData = async (userId: string): Promise<void> => {
  try {
    console.log('📊 Creating sample chat data for user:', userId);
    
    // יצירת שיחות לדוגמה
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

    // יצירת הודעות לדוגמה
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

    // שמירת הנתונים למסד הנתונים
    for (const conversation of sampleConversations) {
      await db.createChat(userId, conversation.id, conversation);
    }
    
    for (const message of sampleMessages) {
      await db.createMessage(userId, message.id, message);
    }
    
    console.log('✅ Sample chat data created for user:', userId, sampleConversations.length, 'conversations,', sampleMessages.length, 'messages');
  } catch (error) {
    console.error('❌ Create sample chat data error:', error);
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
    
    console.log('✅ Message edited:', messageId);
  } catch (error) {
    console.error('❌ Edit message error:', error);
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
    
    console.log('✅ Message deleted:', messageId);
  } catch (error) {
    console.error('❌ Delete message error:', error);
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
    
    console.log('✅ Reaction added:', reactionId);
  } catch (error) {
    console.error('❌ Add reaction error:', error);
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
    console.log('✅ Reaction removed:', reactionId);
  } catch (error) {
    console.error('❌ Remove reaction error:', error);
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
    console.error('❌ Send voice message error:', error);
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
    console.error('❌ Search messages error:', error);
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
    console.error('❌ Get reactions error:', error);
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
    console.error('❌ Set typing status error:', error);
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
    console.error('❌ Get all conversations error:', error);
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
    console.error('❌ Check conversation exists error:', error);
    return null;
  }
};

// Debug function to check database content
export const debugDatabaseContent = async (userId: string) => {
  try {
    console.log('🔍 === DATABASE DEBUG ===');
    console.log('🔍 User ID:', userId);
    
    // Get all chats
    const chats = await db.getUserChats(userId);
    console.log('🔍 Total Chats:', chats.length);
    chats.forEach((chat: any) => {
      console.log('🔍 Chat:', {
        id: chat.id,
        participants: chat.participants,
        lastMessage: chat.lastMessageText,
        lastTime: chat.lastMessageTime,
      });
    });
    
    // Get all messages
    const messages = await DatabaseService.list(DB_COLLECTIONS.MESSAGES, userId);
    console.log('🔍 Total Messages:', messages.length);
    
    console.log('🔍 === END DEBUG ===');
  } catch (error) {
    console.error('🔍 Debug error:', error);
  }
}; 