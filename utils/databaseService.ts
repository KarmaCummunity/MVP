// utils/databaseService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Database Collections
export const DB_COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  FOLLOWERS: 'followers',
  FOLLOWING: 'following',
  CHATS: 'chats',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  BOOKMARKS: 'bookmarks',
  DONATIONS: 'donations',
  TASKS: 'tasks',
  SETTINGS: 'settings',
  MEDIA: 'media',
  BLOCKED_USERS: 'blocked_users',
  MESSAGE_REACTIONS: 'message_reactions',
  TYPING_STATUS: 'typing_status',
  READ_RECEIPTS: 'read_receipts',
  VOICE_MESSAGES: 'voice_messages',
  CONVERSATION_METADATA: 'conversation_metadata',
  RIDES: 'rides',
} as const;

// Database Keys Generator
export const getDBKey = (collection: string, userId: string, itemId?: string) => {
  if (itemId) {
    return `${collection}_${userId}_${itemId}`;
  }
  return `${collection}_${userId}`;
};

// Generic Database Service
export class DatabaseService {
  // Simple key-space versioning for future migrations
  private static DB_VERSION = 1;
  private static VERSION_KEY = 'db_version';

  static async ensureVersion(): Promise<void> {
    const v = await AsyncStorage.getItem(DatabaseService.VERSION_KEY);
    if (!v) {
      await AsyncStorage.setItem(DatabaseService.VERSION_KEY, String(DatabaseService.DB_VERSION));
      return;
    }
    const current = Number(v);
    if (current < DatabaseService.DB_VERSION) {
      // Place for future migrations per version
      await AsyncStorage.setItem(DatabaseService.VERSION_KEY, String(DatabaseService.DB_VERSION));
    }
  }
  // Generic CRUD operations
  static async create<T>(
    collection: string,
    userId: string,
    itemId: string,
    data: T
  ): Promise<void> {
    try {
      await this.ensureVersion();
      const key = getDBKey(collection, userId, itemId);
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ DatabaseService - Created ${collection} item:`, itemId);
    } catch (error) {
      console.error(`❌ DatabaseService - Create ${collection} error:`, error);
      throw error;
    }
  }

  static async read<T>(
    collection: string,
    userId: string,
    itemId: string
  ): Promise<T | null> {
    try {
      await this.ensureVersion();
      const key = getDBKey(collection, userId, itemId);
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`❌ DatabaseService - Read ${collection} error:`, error);
      return null;
    }
  }

  static async update<T>(
    collection: string,
    userId: string,
    itemId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const existing = await this.read<T>(collection, userId, itemId);
      if (existing) {
        const updated = { ...existing, ...data };
        await this.create(collection, userId, itemId, updated);
        console.log(`✅ DatabaseService - Updated ${collection} item:`, itemId);
      }
    } catch (error) {
      console.error(`❌ DatabaseService - Update ${collection} error:`, error);
      throw error;
    }
  }

  static async delete(
    collection: string,
    userId: string,
    itemId: string
  ): Promise<void> {
    try {
      const key = getDBKey(collection, userId, itemId);
      await AsyncStorage.removeItem(key);
      console.log(`✅ DatabaseService - Deleted ${collection} item:`, itemId);
    } catch (error) {
      console.error(`❌ DatabaseService - Delete ${collection} error:`, error);
      throw error;
    }
  }

  // List operations
  static async list<T>(
    collection: string,
    userId: string
  ): Promise<T[]> {
    try {
      await this.ensureVersion();
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => 
        key.startsWith(`${collection}_${userId}_`)
      );
      
      if (userKeys.length === 0) return [];

      const items = await AsyncStorage.multiGet(userKeys);
      return items
        .map(([key, value]) => value ? JSON.parse(value) : null)
        .filter((item): item is T => item !== null)
        .sort((a, b) => {
          // Sort by timestamp if available
          if ((a as any).timestamp && (b as any).timestamp) {
            return new Date((b as any).timestamp).getTime() - new Date((a as any).timestamp).getTime();
          }
          return 0;
        });
    } catch (error) {
      console.error(`❌ DatabaseService - List ${collection} error:`, error);
      return [];
    }
  }

  // Count operations
  static async count(collection: string, userId: string): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => 
        key.startsWith(`${collection}_${userId}_`)
      );
      return userKeys.length;
    } catch (error) {
      console.error(`❌ DatabaseService - Count ${collection} error:`, error);
      return 0;
    }
  }

  // Search operations
  static async search<T>(
    collection: string,
    userId: string,
    query: (item: T) => boolean
  ): Promise<T[]> {
    try {
      const items = await this.list<T>(collection, userId);
      return items.filter(query);
    } catch (error) {
      console.error(`❌ DatabaseService - Search ${collection} error:`, error);
      return [];
    }
  }

  // Batch operations
  static async batchCreate<T>(
    collection: string,
    userId: string,
    items: Array<{ id: string; data: T }>
  ): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = items.map(({ id, data }) => [
        getDBKey(collection, userId, id),
        JSON.stringify(data)
      ]);
      await AsyncStorage.multiSet(keyValuePairs);
      console.log(`✅ DatabaseService - Batch created ${items.length} ${collection} items`);
    } catch (error) {
      console.error(`❌ DatabaseService - Batch create ${collection} error:`, error);
      throw error;
    }
  }

  static async batchDelete(
    collection: string,
    userId: string,
    itemIds: string[]
  ): Promise<void> {
    try {
      const keys = itemIds.map(id => getDBKey(collection, userId, id));
      await AsyncStorage.multiRemove(keys);
      console.log(`✅ DatabaseService - Batch deleted ${itemIds.length} ${collection} items`);
    } catch (error) {
      console.error(`❌ DatabaseService - Batch delete ${collection} error:`, error);
      throw error;
    }
  }

  // User-specific operations
  static async getUserData(userId: string) {
    try {
      const collections = Object.values(DB_COLLECTIONS);
      const userData: Record<string, any> = {};

      for (const collection of collections) {
        userData[collection] = await this.list(collection, userId);
      }

      return userData;
    } catch (error) {
      console.error('❌ DatabaseService - Get user data error:', error);
      return {};
    }
  }

  static async deleteUserData(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(`_${userId}_`) || key.endsWith(`_${userId}`));
      await AsyncStorage.multiRemove(userKeys);
      console.log(`✅ DatabaseService - Deleted all data for user: ${userId}`);
    } catch (error) {
      console.error('❌ DatabaseService - Delete user data error:', error);
      throw error;
    }
  }

  // Migration and maintenance
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ DatabaseService - Cleared all data');
    } catch (error) {
      console.error('❌ DatabaseService - Clear all data error:', error);
      throw error;
    }
  }

  static async getDatabaseSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.length;
    } catch (error) {
      console.error('❌ DatabaseService - Get database size error:', error);
      return 0;
    }
  }

  static async exportUserData(userId: string): Promise<string> {
    try {
      const userData = await this.getUserData(userId);
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('❌ DatabaseService - Export user data error:', error);
      throw error;
    }
  }

  static async importUserData(userId: string, dataJson: string): Promise<void> {
    try {
      const userData = JSON.parse(dataJson);
      const collections = Object.keys(userData);

      for (const collection of collections) {
        const items = userData[collection];
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.id) {
              await this.create(collection, userId, item.id, item);
            }
          }
        }
      }

      console.log(`✅ DatabaseService - Imported data for user: ${userId}`);
    } catch (error) {
      console.error('❌ DatabaseService - Import user data error:', error);
      throw error;
    }
  }
}

// Convenience functions for common operations
export const db = {
  // Users
  createUser: (userId: string, userData: any) => 
    DatabaseService.create(DB_COLLECTIONS.USERS, userId, userId, userData),
  
  getUser: (userId: string) => 
    DatabaseService.read(DB_COLLECTIONS.USERS, userId, userId),
  
  updateUser: (userId: string, userData: Partial<any>) => 
    DatabaseService.update(DB_COLLECTIONS.USERS, userId, userId, userData),

  // Posts
  createPost: (userId: string, postId: string, postData: any) => 
    DatabaseService.create(DB_COLLECTIONS.POSTS, userId, postId, postData),
  
  getPost: (userId: string, postId: string) => 
    DatabaseService.read(DB_COLLECTIONS.POSTS, userId, postId),
  
  getUserPosts: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.POSTS, userId),
  
  deletePost: (userId: string, postId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.POSTS, userId, postId),

  // Followers
  addFollower: (userId: string, followerId: string, followerData: any) => 
    DatabaseService.create(DB_COLLECTIONS.FOLLOWERS, userId, followerId, followerData),
  
  removeFollower: (userId: string, followerId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.FOLLOWERS, userId, followerId),
  
  getFollowers: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.FOLLOWERS, userId),

  // Following
  addFollowing: (userId: string, followingId: string, followingData: any) => 
    DatabaseService.create(DB_COLLECTIONS.FOLLOWING, userId, followingId, followingData),
  
  removeFollowing: (userId: string, followingId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.FOLLOWING, userId, followingId),
  
  getFollowing: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.FOLLOWING, userId),

  // Chats
  createChat: (userId: string, chatId: string, chatData: any) => 
    DatabaseService.create(DB_COLLECTIONS.CHATS, userId, chatId, chatData),
  
  getChat: (userId: string, chatId: string) => 
    DatabaseService.read(DB_COLLECTIONS.CHATS, userId, chatId),
  
  getUserChats: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.CHATS, userId),

  // Messages
  createMessage: (userId: string, messageId: string, messageData: any) => 
    DatabaseService.create(DB_COLLECTIONS.MESSAGES, userId, messageId, messageData),
  
  getChatMessages: (userId: string, conversationId: string) => 
    DatabaseService.search(DB_COLLECTIONS.MESSAGES, userId, (msg: any) => msg.conversationId === conversationId),

  // Notifications
  createNotification: (userId: string, notificationId: string, notificationData: any) => 
    DatabaseService.create(DB_COLLECTIONS.NOTIFICATIONS, userId, notificationId, notificationData),
  
  getUserNotifications: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.NOTIFICATIONS, userId),
  
  markNotificationAsRead: (userId: string, notificationId: string) => 
    DatabaseService.update(DB_COLLECTIONS.NOTIFICATIONS, userId, notificationId, { read: true }),
  
  deleteNotification: (userId: string, notificationId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.NOTIFICATIONS, userId, notificationId),

  // Bookmarks
  addBookmark: (userId: string, bookmarkId: string, bookmarkData: any) => 
    DatabaseService.create(DB_COLLECTIONS.BOOKMARKS, userId, bookmarkId, bookmarkData),
  
  removeBookmark: (userId: string, bookmarkId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.BOOKMARKS, userId, bookmarkId),
  
  getUserBookmarks: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.BOOKMARKS, userId),

  // Settings
  getUserSettings: (userId: string) => 
    DatabaseService.read(DB_COLLECTIONS.SETTINGS, userId, 'settings'),
  
  updateUserSettings: (userId: string, settings: any) => 
    DatabaseService.create(DB_COLLECTIONS.SETTINGS, userId, 'settings', settings),

  // Media
  saveMedia: (userId: string, mediaId: string, mediaData: any) => 
    DatabaseService.create(DB_COLLECTIONS.MEDIA, userId, mediaId, mediaData),
  
  getMedia: (userId: string, mediaId: string) => 
    DatabaseService.read(DB_COLLECTIONS.MEDIA, userId, mediaId),
  
  deleteMedia: (userId: string, mediaId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.MEDIA, userId, mediaId),

  // Blocked Users
  blockUser: (userId: string, blockedUserId: string, blockedData: any) => 
    DatabaseService.create(DB_COLLECTIONS.BLOCKED_USERS, userId, blockedUserId, blockedData),
  
  unblockUser: (userId: string, blockedUserId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.BLOCKED_USERS, userId, blockedUserId),
  
  getBlockedUsers: (userId: string) => 
    DatabaseService.list(DB_COLLECTIONS.BLOCKED_USERS, userId),
  
  isUserBlocked: async (userId: string, targetUserId: string) => {
    const blocked = await DatabaseService.read(DB_COLLECTIONS.BLOCKED_USERS, userId, targetUserId);
    return blocked !== null;
  },

  // Message Reactions
  addReaction: (userId: string, reactionId: string, reactionData: any) => 
    DatabaseService.create(DB_COLLECTIONS.MESSAGE_REACTIONS, userId, reactionId, reactionData),
  
  removeReaction: (userId: string, reactionId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.MESSAGE_REACTIONS, userId, reactionId),
  
  getMessageReactions: (userId: string, messageId: string) => 
    DatabaseService.search(DB_COLLECTIONS.MESSAGE_REACTIONS, userId, (reaction: any) => reaction.messageId === messageId),

  // Typing Status
  setTypingStatus: (userId: string, conversationId: string, typingData: any) => 
    DatabaseService.create(DB_COLLECTIONS.TYPING_STATUS, userId, conversationId, typingData),
  
  clearTypingStatus: (userId: string, conversationId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.TYPING_STATUS, userId, conversationId),
  
  getTypingStatus: (userId: string, conversationId: string) => 
    DatabaseService.read(DB_COLLECTIONS.TYPING_STATUS, userId, conversationId),

  // Read Receipts
  markAsRead: (userId: string, receiptId: string, receiptData: any) => 
    DatabaseService.create(DB_COLLECTIONS.READ_RECEIPTS, userId, receiptId, receiptData),
  
  getReadReceipts: (userId: string, messageId: string) => 
    DatabaseService.search(DB_COLLECTIONS.READ_RECEIPTS, userId, (receipt: any) => receipt.messageId === messageId),

  // Voice Messages
  saveVoiceMessage: (userId: string, voiceId: string, voiceData: any) => 
    DatabaseService.create(DB_COLLECTIONS.VOICE_MESSAGES, userId, voiceId, voiceData),
  
  getVoiceMessage: (userId: string, voiceId: string) => 
    DatabaseService.read(DB_COLLECTIONS.VOICE_MESSAGES, userId, voiceId),
  
  deleteVoiceMessage: (userId: string, voiceId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.VOICE_MESSAGES, userId, voiceId),

  // Conversation Metadata
  updateConversationMetadata: (userId: string, conversationId: string, metadata: any) => 
    DatabaseService.create(DB_COLLECTIONS.CONVERSATION_METADATA, userId, conversationId, metadata),
  
  getConversationMetadata: (userId: string, conversationId: string) => 
    DatabaseService.read(DB_COLLECTIONS.CONVERSATION_METADATA, userId, conversationId),

  // Advanced Message Operations
  updateMessage: (userId: string, messageId: string, messageData: any) => 
    DatabaseService.update(DB_COLLECTIONS.MESSAGES, userId, messageId, messageData),
  
  deleteMessage: (userId: string, messageId: string) => 
    DatabaseService.delete(DB_COLLECTIONS.MESSAGES, userId, messageId),
  
  searchMessages: (userId: string, searchQuery: string) => 
    DatabaseService.search(DB_COLLECTIONS.MESSAGES, userId, (msg: any) => 
      msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
    ),

  // Batch Message Operations
  batchCreateMessages: (userId: string, messages: Array<{ id: string; data: any }>) => 
    DatabaseService.batchCreate(DB_COLLECTIONS.MESSAGES, userId, messages),
  
  batchDeleteMessages: (userId: string, messageIds: string[]) => 
    DatabaseService.batchDelete(DB_COLLECTIONS.MESSAGES, userId, messageIds),

  // Rides (Trump)
  createRide: (userId: string, rideId: string, rideData: any) =>
    DatabaseService.create(DB_COLLECTIONS.RIDES, userId, rideId, rideData),

  getRide: (userId: string, rideId: string) =>
    DatabaseService.read(DB_COLLECTIONS.RIDES, userId, rideId),

  listRides: (userId: string) =>
    DatabaseService.list(DB_COLLECTIONS.RIDES, userId),

  updateRide: (userId: string, rideId: string, rideData: Partial<any>) =>
    DatabaseService.update(DB_COLLECTIONS.RIDES, userId, rideId, rideData),

  deleteRide: (userId: string, rideId: string) =>
    DatabaseService.delete(DB_COLLECTIONS.RIDES, userId, rideId),

  // Donations / Items (generic items postings)
  createDonation: (userId: string, donationId: string, donationData: any) =>
    DatabaseService.create(DB_COLLECTIONS.DONATIONS, userId, donationId, donationData),

  getDonation: (userId: string, donationId: string) =>
    DatabaseService.read(DB_COLLECTIONS.DONATIONS, userId, donationId),

  listDonations: (userId: string) =>
    DatabaseService.list(DB_COLLECTIONS.DONATIONS, userId),

  updateDonation: (userId: string, donationId: string, donationData: Partial<any>) =>
    DatabaseService.update(DB_COLLECTIONS.DONATIONS, userId, donationId, donationData),

  deleteDonation: (userId: string, donationId: string) =>
    DatabaseService.delete(DB_COLLECTIONS.DONATIONS, userId, donationId),
};

export default DatabaseService; 