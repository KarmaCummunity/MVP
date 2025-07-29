import AsyncStorage from '@react-native-async-storage/async-storage';

// טיפוסים
export interface Conversation {
  id: string;
  participants: string[];
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

// מפתחות לאחסון
const CONVERSATIONS_KEY = 'chat_conversations';
const MESSAGES_KEY = 'chat_messages';

// פונקציות עזר
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getStoredData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`❌ Error getting data for key ${key}:`, error);
    return defaultValue;
  }
};

const setStoredData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`❌ Error setting data for key ${key}:`, error);
  }
};

// פונקציות לשיחות
export const createConversation = async (participants: string[]): Promise<string> => {
  try {
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    const conversationId = generateId('conv');
    
    const newConversation: Conversation = {
      id: conversationId,
      participants,
      lastMessageText: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };

    conversations.push(newConversation);
    await setStoredData(CONVERSATIONS_KEY, conversations);
    
    console.log('✅ Conversation created:', conversationId);
    return conversationId;
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    throw error;
  }
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    return conversations.filter(conv => 
      conv.participants.includes(userId)
    ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    return [];
  }
};

export const getConversationById = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    return null;
  }
};

// פונקציות להודעות
export const sendMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  try {
    const messages = await getStoredData<Message[]>(MESSAGES_KEY, []);
    const messageId = generateId('msg');
    
    const newMessage: Message = {
      ...message,
      id: messageId,
    };

    messages.push(newMessage);
    await setStoredData(MESSAGES_KEY, messages);

    // עדכון השיחה
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    const conversationIndex = conversations.findIndex(conv => conv.id === message.conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessageText = message.text;
      conversations[conversationIndex].lastMessageTime = message.timestamp;
      conversations[conversationIndex].unreadCount += 1;
      await setStoredData(CONVERSATIONS_KEY, conversations);
    }

    console.log('✅ Message sent:', messageId);
    return messageId;
  } catch (error) {
    console.error('❌ Send message error:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messages = await getStoredData<Message[]>(MESSAGES_KEY, []);
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('❌ Get messages error:', error);
    return [];
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // סימון הודעות כנקראו
    const messages = await getStoredData<Message[]>(MESSAGES_KEY, []);
    const updatedMessages = messages.map(msg => 
      msg.conversationId === conversationId && msg.senderId !== userId && !msg.read
        ? { ...msg, read: true }
        : msg
    );
    await setStoredData(MESSAGES_KEY, updatedMessages);

    // איפוס מונה ההודעות שלא נקראו
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].unreadCount = 0;
      await setStoredData(CONVERSATIONS_KEY, conversations);
    }

    console.log('✅ Messages marked as read');
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    throw error;
  }
};

// פונקציות נוספות
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // מחיקת השיחה
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
    await setStoredData(CONVERSATIONS_KEY, filteredConversations);

    // מחיקת כל ההודעות של השיחה
    const messages = await getStoredData<Message[]>(MESSAGES_KEY, []);
    const filteredMessages = messages.filter(msg => msg.conversationId !== conversationId);
    await setStoredData(MESSAGES_KEY, filteredMessages);

    console.log('✅ Conversation deleted');
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([CONVERSATIONS_KEY, MESSAGES_KEY]);
    console.log('✅ All chat data cleared');
  } catch (error) {
    console.error('❌ Clear data error:', error);
    throw error;
  }
};

// יצירת נתונים לדוגמה
export const createSampleData = async (): Promise<void> => {
  try {
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_KEY, []);
    
    if (conversations.length === 0) {
      // יצירת שיחות לדוגמה
      const sampleConversations: Conversation[] = [
        {
          id: 'conv_sample_1',
          participants: ['u1', 'u2'],
          lastMessageText: 'היי! איך אתה?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // לפני 5 דקות
          unreadCount: 1,
        },
        {
          id: 'conv_sample_2',
          participants: ['u1', 'u3'],
          lastMessageText: 'תודה על העזרה!',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // לפני 30 דקות
          unreadCount: 0,
        },
        {
          id: 'conv_sample_3',
          participants: ['u1', 'u4'],
          lastMessageText: 'מתי ניפגש?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // לפני שעתיים
          unreadCount: 2,
        },
      ];

      await setStoredData(CONVERSATIONS_KEY, sampleConversations);

      // יצירת הודעות לדוגמה
      const sampleMessages: Message[] = [
        {
          id: 'msg_sample_1',
          conversationId: 'conv_sample_1',
          senderId: 'u2',
          text: 'היי! איך אתה?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          type: 'text',
        },
        {
          id: 'msg_sample_2',
          conversationId: 'conv_sample_1',
          senderId: 'u1',
          text: 'טוב תודה! איך אתה?',
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'msg_sample_3',
          conversationId: 'conv_sample_2',
          senderId: 'u3',
          text: 'תודה על העזרה!',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: true,
          type: 'text',
        },
        {
          id: 'msg_sample_4',
          conversationId: 'conv_sample_3',
          senderId: 'u4',
          text: 'מתי ניפגש?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          type: 'text',
        },
        {
          id: 'msg_sample_5',
          conversationId: 'conv_sample_3',
          senderId: 'u4',
          text: 'יש לך זמן היום?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          read: false,
          type: 'text',
        },
      ];

      await setStoredData(MESSAGES_KEY, sampleMessages);
      console.log('✅ Sample data created');
    }
  } catch (error) {
    console.error('❌ Create sample data error:', error);
  }
}; 