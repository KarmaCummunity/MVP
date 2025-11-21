// File overview:
// - Purpose: Unified client-side data access with backends: REST, Firestore, or AsyncStorage fallback.
// - Reached from: Many screens/services via `db` helpers and `DatabaseService` static methods.
// - Provides: CRUD/list/search/batch across logical collections; export/import; user-wide operations.
// - Behavior: Delegates to `restAdapter` when `USE_BACKEND` is true, else Firestore/AsyncStorage.
// utils/databaseService.ts

// TODO: CRITICAL - This file is extremely complex (800+ lines). Split into specialized services:
//   - UserDataService, PostDataService, ChatDataService, etc.
// TODO: Add comprehensive error handling and retry mechanisms
// TODO: Implement proper caching strategy and cache invalidation
// TODO: Add comprehensive TypeScript interfaces for all data models
// TODO: Remove duplicate code between different adapters
// TODO: Add comprehensive data validation and sanitization
// TODO: Implement proper offline sync and conflict resolution
// TODO: Add comprehensive logging and monitoring for all operations
// TODO: Add unit tests for all CRUD operations and edge cases
// TODO: Implement proper migration system for data schema changes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_BACKEND, USE_FIRESTORE, CACHE_CONFIG, OFFLINE_CONFIG, STORAGE_KEYS } from './dbConfig';
import { apiService, ApiResponse } from './apiService';
import { restAdapter } from './restAdapter';
import { firestoreAdapter } from './firestoreAdapter';
import { DB_COLLECTIONS } from './dbCollections';

export { DB_COLLECTIONS };
let enhancedDbInstance: any = null;

async function loadEnhancedDB() {
  if (enhancedDbInstance) return enhancedDbInstance;
  const module = await import('./enhancedDatabaseService');
  enhancedDbInstance = module.enhancedDB;
  return enhancedDbInstance;
}

// Database Keys Generator
export const getDBKey = (collection: string, userId: string, itemId?: string) => {
  if (itemId) {
    return `${collection}_${userId}_${itemId}`;
  }
  return `${collection}_${userId}`;
};

// Generic Database Service
// TODO: Convert to proper class instance instead of static methods
// TODO: Add proper dependency injection for different adapters
// TODO: Implement proper connection management and pooling
export class DatabaseService {
  // Simple key-space versioning for future migrations
  // TODO: Implement proper migration system with rollback support
  // TODO: Add schema validation and versioning
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

  // Aliases for backward compatibility
  static async getItem<T>(collection: string, userId: string, itemId: string): Promise<T | null> {
    return this.read<T>(collection, userId, itemId);
  }

  static async setItem<T>(collection: string, userId: string, itemId: string, data: T): Promise<void> {
    try {
      // Try to update first, if it fails then create
      await this.update<T>(collection, userId, itemId, data);
    } catch (error) {
      // If update fails, create new item
      await this.create<T>(collection, userId, itemId, data);
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
      if (USE_BACKEND) {
        await restAdapter.create(collection, userId, itemId, data);
      } else if (USE_FIRESTORE) {
        await firestoreAdapter.create(collection, userId, itemId, data);
      } else {
        await this.ensureVersion();
        const key = getDBKey(collection, userId, itemId);
        await AsyncStorage.setItem(key, JSON.stringify(data));
      }
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
      if (USE_BACKEND) {
        return await restAdapter.read<T>(collection, userId, itemId);
      } else if (USE_FIRESTORE) {
        return await firestoreAdapter.read<T>(collection, userId, itemId);
      } else {
        await this.ensureVersion();
        const key = getDBKey(collection, userId, itemId);
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
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
      if (USE_BACKEND) {
        await restAdapter.update(collection, userId, itemId, data);
        console.log(`✅ DatabaseService - Updated ${collection} item:`, itemId);
      } else if (USE_FIRESTORE) {
        await firestoreAdapter.update(collection, userId, itemId, data);
        console.log(`✅ DatabaseService - Updated ${collection} item:`, itemId);
      } else {
        const existing = await this.read<T>(collection, userId, itemId);
        if (existing) {
          const updated = { ...existing, ...data };
          await this.create(collection, userId, itemId, updated);
          console.log(`✅ DatabaseService - Updated ${collection} item:`, itemId);
        }
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
      if (USE_BACKEND) {
        await restAdapter.delete(collection, userId, itemId);
      } else if (USE_FIRESTORE) {
        await firestoreAdapter.delete(collection, userId, itemId);
      } else {
        const key = getDBKey(collection, userId, itemId);
        await AsyncStorage.removeItem(key);
      }
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
      if (USE_BACKEND) {
        return await restAdapter.list<T>(collection, userId);
      } else if (USE_FIRESTORE) {
        return await firestoreAdapter.list<T>(collection, userId);
      } else {
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
            if ((a as any).timestamp && (b as any).timestamp) {
              return new Date((b as any).timestamp).getTime() - new Date((a as any).timestamp).getTime();
            }
            return 0;
          });
      }
    } catch (error) {
      console.error(`❌ DatabaseService - List ${collection} error:`, error);
      return [];
    }
  }

  // Count operations
  static async count(collection: string, userId: string): Promise<number> {
    try {
      if (USE_BACKEND) {
        const items = await restAdapter.list(collection, userId);
        return items.length;
      } else if (USE_FIRESTORE) {
        const items = await firestoreAdapter.list(collection, userId);
        return items.length;
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const userKeys = keys.filter(key => 
          key.startsWith(`${collection}_${userId}_`)
        );
        return userKeys.length;
      }
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
      if (USE_BACKEND) {
        for (const { id, data } of items) {
          // eslint-disable-next-line no-await-in-loop
          await restAdapter.create(collection, userId, id, data);
        }
        console.log(`✅ DatabaseService - Batch created ${items.length} ${collection} items (Backend)`);
      } else if (USE_FIRESTORE) {
        await firestoreAdapter.batchCreate(collection, userId, items);
        console.log(`✅ DatabaseService - Batch created ${items.length} ${collection} items (Firestore)`);
      } else {
        const keyValuePairs: [string, string][] = items.map(({ id, data }) => [
          getDBKey(collection, userId, id),
          JSON.stringify(data)
        ]);
        await AsyncStorage.multiSet(keyValuePairs);
        console.log(`✅ DatabaseService - Batch created ${items.length} ${collection} items`);
      }
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
      if (USE_BACKEND) {
        for (const id of itemIds) {
          // eslint-disable-next-line no-await-in-loop
          await restAdapter.delete(collection, userId, id);
        }
        console.log(`✅ DatabaseService - Batch deleted ${itemIds.length} ${collection} items (Backend)`);
      } else if (USE_FIRESTORE) {
        await firestoreAdapter.batchDelete(collection, userId, itemIds);
        console.log(`✅ DatabaseService - Batch deleted ${itemIds.length} ${collection} items (Firestore)`);
      } else {
        const keys = itemIds.map(id => getDBKey(collection, userId, id));
        await AsyncStorage.multiRemove(keys);
        console.log(`✅ DatabaseService - Batch deleted ${itemIds.length} ${collection} items`);
      }
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

  /**
   * Clear only local collection keys created by DatabaseService
   * Preserves app preferences like language, recent emails, etc.
   */
  static async clearLocalCollections(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const collectionPrefixes = Object.values(DB_COLLECTIONS).map((c) => `${c}_`);
      const keysToRemove = keys.filter((k) =>
        collectionPrefixes.some((prefix) => k.startsWith(prefix)) || k === DatabaseService.VERSION_KEY
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      console.log('✅ DatabaseService - Cleared local collection keys:', keysToRemove.length);
    } catch (error) {
      console.error('❌ DatabaseService - Clear local collections error:', error);
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
  createRide: async (userId: string, rideId: string, rideData: any) => {
    try {
      if (USE_BACKEND) {
        const departureIso = (() => {
          try {
            const dateStr = typeof rideData?.date === 'string' ? rideData.date : new Date().toISOString().split('T')[0];
            const timeStr = typeof rideData?.time === 'string' ? rideData.time : new Date().toTimeString().slice(0, 5);
            
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              throw new Error('Invalid date format');
            }
            
            // Validate time format (HH:MM)
            if (!/^\d{2}:\d{2}$/.test(timeStr)) {
              throw new Error('Invalid time format');
            }
            
            // Create date without Z suffix to avoid timezone issues
            const dateTimeStr = `${dateStr}T${timeStr}:00`;
            const date = new Date(dateTimeStr);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
              throw new Error('Invalid datetime');
            }
            
            return date.toISOString();
          } catch (error) {
            console.error('Date parsing error:', error);
            // Fallback to current time if date parsing fails
            return new Date().toISOString();
          }
        })();
        // Validate required fields before sending to server
        if (!rideData.from || !rideData.to) {
          throw new Error('From and to locations are required');
        }
        
        const driverId = rideData.driverId || userId;
        if (!driverId) {
          throw new Error('Driver ID is required');
        }
        
        const payload = {
          driver_id: driverId,
          title: rideData.title || `${rideData.from} → ${rideData.to}`,
          from_location: { 
            name: rideData.from, 
            city: rideData.from, 
            address: rideData.from 
          },
          to_location: { 
            name: rideData.to, 
            city: rideData.to, 
            address: rideData.to 
          },
          departure_time: departureIso,
          arrival_time: null,
          available_seats: Math.max(1, Math.min(8, typeof rideData.seats === 'number' ? rideData.seats : 1)),
          price_per_seat: Math.max(0, Number(rideData.price || 0)),
          description: rideData.description || null,
          requirements: (() => {
            const reqs: string[] = [];
            if (rideData.noSmoking) reqs.push('no-smoking');
            if (rideData.petsAllowed) reqs.push('pets-allowed');
            if (rideData.kidsFriendly) reqs.push('kids-friendly');
            return reqs.length > 0 ? reqs.join(', ') : null;
          })(),
          metadata: { source: 'legacy-app', legacy_id: rideId },
        };
        
        console.log('🚗 Creating ride with payload:', JSON.stringify(payload, null, 2));
        const res = await apiService.createRide(payload);
        if (!res.success) throw new Error(res.error || 'Failed to create ride');
        return;
      }
      return DatabaseService.create(DB_COLLECTIONS.RIDES, userId, rideId, rideData);
    } catch (error) {
      console.error('❌ DatabaseService.db.createRide error:', error);
      throw error;
    }
  },

  getRide: async (_userId: string, rideId: string) => {
    try {
      if (USE_BACKEND) {
        const res = await apiService.getRideById(rideId);
        if (!res.success || !res.data) return null;
        const r: any = res.data;
        return {
          id: r.id,
          driverName: r.driver_name || '',
          from: r.from_location?.name || r.from_location?.city || '',
          to: r.to_location?.name || r.to_location?.city || '',
          date: new Date(r.departure_time).toISOString().slice(0, 10),
          time: new Date(r.departure_time).toISOString().slice(11, 16),
          seats: r.available_seats,
          price: Number(r.price_per_seat) || 0,
          rating: 5,
          image: '🚗',
        };
      }
      return DatabaseService.read(DB_COLLECTIONS.RIDES, _userId, rideId);
    } catch (error) {
      console.error('❌ DatabaseService.db.getRide error:', error);
      return null;
    }
  },

  listRides: async (_userId: string) => {
    try {
      if (USE_BACKEND) {
        const enhancedDB = await loadEnhancedDB();
        const apiRides = await enhancedDB.getRides();
        return (apiRides || []).map((r: any) => ({
          id: r.id,
          driverName: r.driver_name || r.driverId || 'Driver',
          from: r.from_location?.name || r.from || '',
          to: r.to_location?.name || r.to || '',
          date: r.departure_time ? new Date(r.departure_time).toISOString().slice(0, 10) : (r.date || new Date().toISOString().slice(0, 10)),
          time: r.departure_time ? new Date(r.departure_time).toISOString().slice(11, 16) : (r.time || '00:00'),
          seats: r.available_seats ?? r.seats ?? 1,
          price: Number(r.price_per_seat ?? r.price ?? 0),
          rating: r.rating ?? 5,
          image: r.image ?? '🚗',
          category: r.category ?? 'ride',
        }));
      }
      return DatabaseService.list(DB_COLLECTIONS.RIDES, _userId);
    } catch (error) {
      console.error('❌ DatabaseService.db.listRides error:', error);
      return [];
    }
  },

  updateRide: async (_userId: string, rideId: string, rideData: Partial<any>) => {
    try {
      if (USE_BACKEND) {
        const payload: any = {};
        if (rideData.title) payload.title = rideData.title;
        if (rideData.seats !== undefined) payload.available_seats = rideData.seats;
        if (rideData.price !== undefined) payload.price_per_seat = Number(rideData.price);
        if (rideData.status) payload.status = rideData.status;
        const res = await apiService.updateDonation(rideId as any, payload as any); // reuse generic update if exists
        if (!res.success) throw new Error(res.error || 'Failed to update ride');
        return;
      }
      return DatabaseService.update(DB_COLLECTIONS.RIDES, _userId, rideId, rideData);
    } catch (error) {
      console.error('❌ DatabaseService.db.updateRide error:', error);
      throw error;
    }
  },

  deleteRide: async (_userId: string, rideId: string) => {
    try {
      if (USE_BACKEND) {
        // RidesController uses status update for cancel; no direct delete endpoint in apiService
        await apiService.updateBookingStatus(rideId as any, 'cancelled');
        return;
      }
      return DatabaseService.delete(DB_COLLECTIONS.RIDES, _userId, rideId);
    } catch (error) {
      console.error('❌ DatabaseService.db.deleteRide error:', error);
      throw error;
    }
  },

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

  // Organizations
  createOrganization: (ownerUserId: string, orgId: string, orgData: any) =>
    DatabaseService.create(DB_COLLECTIONS.ORGANIZATIONS, ownerUserId, orgId, orgData),

  getOrganization: (ownerUserId: string, orgId: string) =>
    DatabaseService.read(DB_COLLECTIONS.ORGANIZATIONS, ownerUserId, orgId),

  updateOrganization: (ownerUserId: string, orgId: string, orgData: Partial<any>) =>
    DatabaseService.update(DB_COLLECTIONS.ORGANIZATIONS, ownerUserId, orgId, orgData),

  listOrganizations: (ownerUserId: string) =>
    DatabaseService.list(DB_COLLECTIONS.ORGANIZATIONS, ownerUserId),

  // Org Applications (onboarding requests)
  createOrgApplication: (ownerUserId: string, applicationId: string, applicationData: any) =>
    DatabaseService.create(DB_COLLECTIONS.ORG_APPLICATIONS, ownerUserId, applicationId, applicationData),

  getOrgApplication: (ownerUserId: string, applicationId: string) =>
    DatabaseService.read(DB_COLLECTIONS.ORG_APPLICATIONS, ownerUserId, applicationId),

  updateOrgApplication: (ownerUserId: string, applicationId: string, applicationData: Partial<any>) =>
    DatabaseService.update(DB_COLLECTIONS.ORG_APPLICATIONS, ownerUserId, applicationId, applicationData),

  listOrgApplications: (ownerUserId: string) =>
    DatabaseService.list(DB_COLLECTIONS.ORG_APPLICATIONS, ownerUserId),
};

export default DatabaseService; 