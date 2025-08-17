// File overview:
// - Purpose: Higher-level data access with caching and offline queue, built on `apiService`.
// - Reached from: `EnhancedStatsService` and screens that need cached lists (donations, rides, stats).
// - Provides: Cached getters, offline queue for mutations, periodic sync, and convenience utilities.
// Enhanced Database Service - Connects frontend to new backend

// TODO: CRITICAL - This file is complex (462+ lines). Split into specialized services:
//   - CacheService for caching operations
//   - OfflineQueueService for offline queue management  
//   - SyncService for data synchronization
//   - UserDataService for user-specific operations
// TODO: Add comprehensive error handling and retry mechanisms
// TODO: Implement proper cache invalidation strategies
// TODO: Add comprehensive TypeScript interfaces with strict typing
// TODO: Implement proper memory management for cache and queue
// TODO: Add comprehensive logging and monitoring for all operations
// TODO: Remove console.log statements and use proper logging service
// TODO: Add comprehensive unit tests for all service operations
// TODO: Implement proper data encryption for sensitive cached data
// TODO: Add comprehensive performance optimization and monitoring
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiResponse } from './apiService';
import { USE_BACKEND, CACHE_CONFIG, OFFLINE_CONFIG, STORAGE_KEYS } from './dbConfig';

// TODO: Move all interfaces to proper types directory
// TODO: Add comprehensive validation for all interface fields
// TODO: Replace 'any' types with proper generic constraints
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineAction {
  id: string;
  action: string;
  data: any; // TODO: Replace with proper generic type
  timestamp: number;
  retryCount: number;
}

// Enhanced Database Service with caching and offline support
// TODO: Implement proper dependency injection instead of singleton pattern
// TODO: Add proper connection state management
// TODO: Implement proper service lifecycle management
export class EnhancedDatabaseService {
  private static instance: EnhancedDatabaseService;
  private offlineQueue: OfflineAction[] = [];
  private syncInProgress = false;

  static getInstance(): EnhancedDatabaseService {
    if (!EnhancedDatabaseService.instance) {
      EnhancedDatabaseService.instance = new EnhancedDatabaseService();
    }
    return EnhancedDatabaseService.instance;
  }

  constructor() {
    this.loadOfflineQueue();
    this.setupSyncInterval();
  }

  // ==================== User Management ====================

  async registerUser(userData: any): Promise<ApiResponse> {
    // TODO: Replace 'any' with proper user registration interface
    // TODO: Add comprehensive input validation and sanitization
    // TODO: Implement proper error classification and handling
    // TODO: Add proper logging and monitoring for registration attempts
    try {
      if (!USE_BACKEND) {
        // Fallback to local storage
        // TODO: Improve fallback user ID generation (use UUID instead of timestamp)
        const user = {
          id: Date.now().toString(),
          ...userData,
          created_at: new Date().toISOString(),
        };
        await this.setCache('user_profile', user.id, user);
        return { success: true, data: user };
      }

      const response = await apiService.registerUser(userData);
      
      if (response.success && response.data) {
        await this.setCache('user_profile', response.data.id, response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      }

      return response;
    } catch (error) {
      console.error('Register user error:', error);
      return { success: false, error: 'Failed to register user' };
    }
  }

  async loginUser(credentials: any): Promise<ApiResponse> {
    try {
      if (!USE_BACKEND) {
        // Fallback authentication logic
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const user = JSON.parse(userData);
          return { success: true, data: user };
        }
        return { success: false, error: 'User not found' };
      }

      const response = await apiService.loginUser(credentials);
      
      if (response.success && response.data) {
        await this.setCache('user_profile', response.data.id, response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      }

      return response;
    } catch (error) {
      console.error('Login user error:', error);
      return { success: false, error: 'Failed to login' };
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updateData: any): Promise<ApiResponse> {
    try {
      if (!USE_BACKEND) {
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          const updatedUser = { ...currentUser, ...updateData };
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          await this.setCache('user_profile', userId, updatedUser);
          return { success: true, data: updatedUser };
        }
        return { success: false, error: 'User not found' };
      }

      const response = await apiService.updateUser(userId, updateData);
      
      if (response.success && response.data) {
        await this.setCache('user_profile', userId, response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      }

      return response;
    } catch (error) {
      console.error('Update user profile error:', error);
      
      // Queue for offline sync
      await this.queueOfflineAction('update_user_profile', { userId, updateData });
      return { success: false, error: 'Failed to update profile, queued for later' };
    }
  }

  // ==================== Donations Management ====================

  async getDonationCategories(): Promise<any[]> {
    try {
      // Try cache first
      const cached = await this.getCache('donation_categories', 'all');
      if (cached) {
        return cached;
      }

      if (!USE_BACKEND) {
        // Return default categories
        const defaultCategories = [
          { id: '1', slug: 'money', name_he: 'כסף', name_en: 'Money', icon: '💰' },
          { id: '2', slug: 'trump', name_he: 'טרמפים', name_en: 'Rides', icon: '🚗' },
          { id: '3', slug: 'food', name_he: 'אוכל', name_en: 'Food', icon: '🍞' },
          { id: '4', slug: 'clothes', name_he: 'בגדים', name_en: 'Clothes', icon: '👕' },
          { id: '5', slug: 'books', name_he: 'ספרים', name_en: 'Books', icon: '📖' },
        ];
        await this.setCache('donation_categories', 'all', defaultCategories);
        return defaultCategories;
      }

      const response = await apiService.getDonationCategories();
      
      if (response.success && response.data) {
        await this.setCache('donation_categories', 'all', response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Get donation categories error:', error);
      return [];
    }
  }

  async getDonations(filters: any = {}): Promise<any[]> {
    try {
      const cacheKey = `donations_${JSON.stringify(filters)}`;
      const cached = await this.getCache('donations_list', cacheKey);
      if (cached) {
        return cached;
      }

      if (!USE_BACKEND) {
        // Return sample donations
        const sampleDonations = [];
        await this.setCache('donations_list', cacheKey, sampleDonations);
        return sampleDonations;
      }

      const response = await apiService.getDonations(filters);
      
      if (response.success && response.data) {
        await this.setCache('donations_list', cacheKey, response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Get donations error:', error);
      return [];
    }
  }

  async createDonation(donationData: any): Promise<ApiResponse> {
    try {
      if (!USE_BACKEND) {
        const donation = {
          id: Date.now().toString(),
          ...donationData,
          created_at: new Date().toISOString(),
          status: 'active',
        };
        return { success: true, data: donation };
      }

      const response = await apiService.createDonation(donationData);
      
      if (response.success) {
        // Clear relevant caches
        await this.clearCachePattern('donations_list');
        await this.clearCachePattern('user_donations');
      }

      return response;
    } catch (error) {
      console.error('Create donation error:', error);
      
      // Queue for offline sync
      await this.queueOfflineAction('create_donation', donationData);
      return { success: false, error: 'Failed to create donation, queued for later' };
    }
  }

  // ==================== Community Stats ====================

  async getCommunityStats(filters: any = {}): Promise<any> {
    try {
      const cacheKey = `community_stats_${JSON.stringify(filters)}`;
      const cached = await this.getCache('community_stats', cacheKey);
      if (cached) {
        return cached;
      }

      if (!USE_BACKEND) {
        const defaultStats = {
          money_donations: { value: 50000, days_tracked: 30 },
          volunteer_hours: { value: 1200, days_tracked: 30 },
          rides_completed: { value: 350, days_tracked: 30 },
          active_members: { value: 800, days_tracked: 1 },
        };
        await this.setCache('community_stats', cacheKey, defaultStats);
        return defaultStats;
      }

      const response = await apiService.getCommunityStats(filters);
      
      if (response.success && response.data) {
        await this.setCache('community_stats', cacheKey, response.data);
        return response.data;
      }

      return {};
    } catch (error) {
      console.error('Get community stats error:', error);
      return {};
    }
  }

  async incrementStat(statType: string, value: number = 1, city?: string): Promise<void> {
    try {
      if (!USE_BACKEND) {
        console.log(`📊 Increment stat: ${statType} += ${value} ${city ? `in ${city}` : 'globally'}`);
        return;
      }

      await apiService.incrementStat({ stat_type: statType, value, city });
      
      // Clear stats cache to force refresh
      await this.clearCachePattern('community_stats');
    } catch (error) {
      console.error('Increment stat error:', error);
      
      // Queue for offline sync
      await this.queueOfflineAction('increment_stat', { statType, value, city });
    }
  }

  // ==================== Rides Management ====================

  async getRides(filters: any = {}): Promise<any[]> {
    try {
      const cacheKey = `rides_${JSON.stringify(filters)}`;
      const cached = await this.getCache('rides_list', cacheKey);
      if (cached) {
        return cached;
      }

      if (!USE_BACKEND) {
        return [];
      }

      const response = await apiService.getRides(filters);
      
      if (response.success && response.data) {
        await this.setCache('rides_list', cacheKey, response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Get rides error:', error);
      return [];
    }
  }

  async createRide(rideData: any): Promise<ApiResponse> {
    try {
      if (!USE_BACKEND) {
        const ride = {
          id: Date.now().toString(),
          ...rideData,
          created_at: new Date().toISOString(),
          status: 'active',
        };
        return { success: true, data: ride };
      }

      const response = await apiService.createRide(rideData);
      
      if (response.success) {
        await this.clearCachePattern('rides_list');
      }

      return response;
    } catch (error) {
      console.error('Create ride error:', error);
      
      // Queue for offline sync
      await this.queueOfflineAction('create_ride', rideData);
      return { success: false, error: 'Failed to create ride, queued for later' };
    }
  }

  // ==================== Cache Management ====================

  private async getCache<T>(collection: string, key: string): Promise<T | null> {
    try {
      const cacheKey = `${collection}_${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Get cache error:', error);
      return null;
    }
  }

  private async setCache<T>(collection: string, key: string, data: T): Promise<void> {
    try {
      const cacheKey = `${collection}_${key}`;
      const expiryDuration = CACHE_CONFIG.CACHE_EXPIRY[collection] || 5 * 60 * 1000; // Default 5 minutes
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryDuration,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Set cache error:', error);
    }
  }

  private async clearCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      await AsyncStorage.multiRemove(matchingKeys);
    } catch (error) {
      console.error('Clear cache pattern error:', error);
    }
  }

  // ==================== Offline Queue Management ====================

  private async queueOfflineAction(action: string, data: any): Promise<void> {
    try {
      if (this.offlineQueue.length >= OFFLINE_CONFIG.MAX_QUEUE_SIZE) {
        this.offlineQueue.shift(); // Remove oldest action
      }

      const offlineAction: OfflineAction = {
        id: Date.now().toString(),
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.offlineQueue.push(offlineAction);
      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Queue offline action error:', error);
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Load offline queue error:', error);
      this.offlineQueue = [];
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Save offline queue error:', error);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Processing ${this.offlineQueue.length} offline actions`);

    const processedActions: string[] = [];

    for (const action of this.offlineQueue) {
      try {
        let success = false;

        switch (action.action) {
          case 'create_donation':
            const donationResponse = await apiService.createDonation(action.data);
            success = donationResponse.success;
            break;
          case 'create_ride':
            const rideResponse = await apiService.createRide(action.data);
            success = rideResponse.success;
            break;
          case 'update_user_profile':
            const updateResponse = await apiService.updateUser(action.data.userId, action.data.updateData);
            success = updateResponse.success;
            break;
          case 'increment_stat':
            await apiService.incrementStat(action.data);
            success = true;
            break;
        }

        if (success) {
          processedActions.push(action.id);
          console.log(`✅ Offline action processed: ${action.action}`);
        } else {
          action.retryCount++;
          if (action.retryCount >= 3) {
            processedActions.push(action.id);
            console.log(`❌ Offline action failed after 3 retries: ${action.action}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing offline action ${action.action}:`, error);
        action.retryCount++;
        if (action.retryCount >= 3) {
          processedActions.push(action.id);
        }
      }
    }

    // Remove processed actions
    this.offlineQueue = this.offlineQueue.filter(action => !processedActions.includes(action.id));
    await this.saveOfflineQueue();

    this.syncInProgress = false;
    console.log(`✅ Offline sync completed. ${processedActions.length} actions processed.`);
  }

  private setupSyncInterval(): void {
    // Process offline queue every 30 seconds
    setInterval(() => {
      this.processOfflineQueue();
    }, 30000);
  }

  // ==================== Public Utility Methods ====================

  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.includes('donation') || 
        key.includes('rides') || 
        key.includes('community_stats') ||
        key.includes('user_profile')
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ All cache cleared');
    } catch (error) {
      console.error('Clear all cache error:', error);
    }
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  async forceSync(): Promise<void> {
    await this.processOfflineQueue();
  }

  isBackendAvailable(): boolean {
    return USE_BACKEND;
  }
}

// Export singleton instance
export const enhancedDB = EnhancedDatabaseService.getInstance();
export default enhancedDB;
