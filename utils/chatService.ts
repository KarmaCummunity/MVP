import AsyncStorage from '@react-native-async-storage/async-storage';

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
  type: 'text' | 'image' | 'file';
}

// Storage keys
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

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
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
    const conversationId = generateId('conv');
    
    const newConversation: Conversation = {
      id: conversationId,
      participants,
      lastMessageText: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    conversations.push(newConversation);
    await setStoredData(CONVERSATIONS_COLLECTION, conversations);
    
    console.log('✅ Conversation created (AsyncStorage):', conversationId);
    return conversationId;
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    throw error;
  }
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
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
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    return null;
  }
};

// פונקציות להודעות
export const sendMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  try {
    const messages = await getStoredData<Message[]>(MESSAGES_COLLECTION, []);
    const messageId = generateId('msg');
    
    const newMessage: Message = {
      ...message,
      id: messageId,
    };

    messages.push(newMessage);
    await setStoredData(MESSAGES_COLLECTION, messages);

    // עדכון השיחה
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
    const conversationIndex = conversations.findIndex(conv => conv.id === message.conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].lastMessageText = message.text;
      conversations[conversationIndex].lastMessageTime = message.timestamp;
      conversations[conversationIndex].unreadCount += 1;
      await setStoredData(CONVERSATIONS_COLLECTION, conversations);
    }

    console.log('✅ Message sent (AsyncStorage):', messageId);
    return messageId;
  } catch (error) {
    console.error('❌ Send message error:', error);
    throw error;
  }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messages = await getStoredData<Message[]>(MESSAGES_COLLECTION, []);
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
    const messages = await getStoredData<Message[]>(MESSAGES_COLLECTION, []);
    const updatedMessages = messages.map(msg => 
      msg.conversationId === conversationId && msg.senderId !== userId && !msg.read
        ? { ...msg, read: true }
        : msg
    );
    await setStoredData(MESSAGES_COLLECTION, updatedMessages);

    // איפוס מונה ההודעות שלא נקראו
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].unreadCount = 0;
      await setStoredData(CONVERSATIONS_COLLECTION, conversations);
    }

    console.log('✅ Messages marked as read (AsyncStorage)');
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    throw error;
  }
};

// Real-time listener for messages (simplified for AsyncStorage)
export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  console.warn('Real-time messages not available without Firebase - using polling instead');
  
  // Simple polling implementation
  const pollMessages = async () => {
    const messages = await getMessages(conversationId);
    callback(messages);
  };
  
  // Initial call
  pollMessages();
  
  // Set up polling every 5 seconds
  const interval = setInterval(pollMessages, 5000);
  
  // Return cleanup function
  return () => clearInterval(interval);
};

// פונקציות נוספות
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // מחיקת השיחה
    const conversations = await getStoredData<Conversation[]>(CONVERSATIONS_COLLECTION, []);
    const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
    await setStoredData(CONVERSATIONS_COLLECTION, filteredConversations);

    // מחיקת כל ההודעות של השיחה
    const messages = await getStoredData<Message[]>(MESSAGES_COLLECTION, []);
    const filteredMessages = messages.filter(msg => msg.conversationId !== conversationId);
    await setStoredData(MESSAGES_COLLECTION, filteredMessages);

    console.log('✅ Conversation deleted (AsyncStorage)');
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([CONVERSATIONS_COLLECTION, MESSAGES_COLLECTION]);
    console.log('✅ All chat data cleared (AsyncStorage)');
  } catch (error) {
    console.error('❌ Clear data error:', error);
    throw error;
  }
};

// יצירת נתונים לדוגמה - כרגע ריק
export const createSampleData = async (): Promise<void> => {
  // לא יוצרים נתונים אוטומטיים
  console.log('✅ No automatic sample data created');
}; 