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
import { logger } from './loggerService';
// Removed console.log statements - using proper logging service
// TODO: Add comprehensive unit tests for all service operations
// TODO: Implement proper data encryption for sensitive cached data
// TODO: Add comprehensive performance optimization and monitoring
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiResponse } from './apiService';
import { USE_BACKEND, CACHE_CONFIG, OFFLINE_CONFIG, STORAGE_KEYS } from './dbConfig';

// TODO: Move all interfaces to proper types directory
// TODO: Add comprehensive validation for all interface fields
// TODO: Replace 'any' types with proper generic constraints

// User authentication interfaces
export interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  [key: string]: unknown; // Allow additional registration fields
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}

// Donation interfaces
export interface DonationData {
  id: string;
  type: 'money' | 'time' | 'items' | 'rides';
  title: string;
  description?: string;
  amount?: number;
  category?: string;
  createdBy: string;
  createdAt: string;
  status?: string;
  [key: string]: unknown; // Allow additional fields
}

export interface CreateDonationData {
  type: 'money' | 'time' | 'items' | 'rides';
  title: string;
  description?: string;
  amount?: number;
  category?: string;
  [key: string]: unknown; // Allow additional fields
}

// Ride interfaces
export interface RideData {
  id: string;
  from: string;
  to: string;
  departure_time: string;
  available_seats: number;
  price?: number;
  createdBy: string;
  createdAt: string;
  status?: string;
  [key: string]: unknown; // Allow additional fields
}

export interface CreateRideData {
  from: string;
  to: string;
  departure_time: string;
  available_seats: number;
  price?: number;
  [key: string]: unknown; // Allow additional fields
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineAction {
  id: string;
  action: string;
  data: Record<string, unknown>; // Generic object data for offline actions
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

  async registerUser(userData: UserRegistrationData): Promise<ApiResponse> {
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
      logger.error('EnhancedDatabaseService', 'Register user error', { error });
      return { success: false, error: 'Failed to register user' };
    }
  }

  async loginUser(credentials: UserLoginCredentials): Promise<ApiResponse> {
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
      logger.error('EnhancedDatabaseService', 'Login user error', { error });
      return { success: false, error: 'Failed to login' };
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Get current user error', { error });
      return null;
    }
  }

  async updateUserProfile(userId: string, updateData: Partial<UserRegistrationData>): Promise<ApiResponse> {
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
      logger.error('EnhancedDatabaseService', 'Update user profile error', { error });
      
      // Queue for offline sync
      await this.queueOfflineAction('update_user_profile', { userId, updateData });
      return { success: false, error: 'Failed to update profile, queued for later' };
    }
  }

  // ==================== Donations Management ====================

  async getDonationCategories(): Promise<any[]> {
    try {
      logger.info('EnhancedDatabaseService', 'Fetching donation categories', { useBackend: USE_BACKEND });
      // Try cache first
      const cached = await this.getCache('donation_categories', 'all');
      if (cached) {
        logger.debug('EnhancedDatabaseService', 'Donation categories cache hit', {
          count: Array.isArray(cached) ? cached.length : 0,
        });
        return cached as any[]; // Type assertion for cached data
      }

      if (!USE_BACKEND) {
        logger.warn('EnhancedDatabaseService', 'Backend disabled - returning default donation categories');
        // Return default categories
        const defaultCategories = [
          { id: '1', slug: 'money', name_he: 'כסף', name_en: 'Money', icon: '💰' },
          { id: '2', slug: 'trump', name_he: 'טרמפים', name_en: 'Rides', icon: '🚗' },
          { id: '3', slug: 'food', name_he: 'אוכל', name_en: 'Food', icon: '🍞' },
          { id: '4', slug: 'clothes', name_he: 'בגדים', name_en: 'Clothes', icon: '👕' },
          { id: '5', slug: 'books', name_he: 'ספרים', name_en: 'Books', icon: '📖' },
        ];
        await this.setCache('donation_categories', 'all', defaultCategories);
        logger.info('EnhancedDatabaseService', 'Default donation categories cached', {
          count: defaultCategories.length,
        });
        return defaultCategories;
      }

      const response = await apiService.getDonationCategories();
      
      if (response.success && response.data) {
        await this.setCache('donation_categories', 'all', response.data);
        logger.info('EnhancedDatabaseService', 'Donation categories fetched from backend', {
          count: Array.isArray(response.data) ? response.data.length : 0,
        });
        return response.data;
      }

      logger.warn('EnhancedDatabaseService', 'Donation categories response empty');
      return [];
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Get donation categories error', { error });
      return [];
    }
  }

  async getDonations(filters: Record<string, unknown> = {}, forceRefresh = false): Promise<DonationData[]> {
    try {
      const cacheKey = `donations_${JSON.stringify(filters)}`;
      if (!forceRefresh) {
        const cached = await this.getCache('donations_list', cacheKey);
        if (cached) {
          logger.debug('EnhancedDatabaseService', 'Donations cache hit', {
            cacheKey,
            count: Array.isArray(cached) ? cached.length : 0,
          });
          return cached as DonationData[]; // Type assertion for cached data
        }
      } else {
        logger.info('EnhancedDatabaseService', 'Force refresh - skipping cache', { cacheKey });
        // Clear cache for donations_list pattern
        await this.clearCachePattern('donations_list');
      }

      if (!USE_BACKEND) {
        logger.warn('EnhancedDatabaseService', 'Backend disabled - returning sample donations');
        // Return sample donations
        const sampleDonations: DonationData[] = [];
        await this.setCache('donations_list', cacheKey, sampleDonations);
        logger.info('EnhancedDatabaseService', 'Sample donations cached (no backend)', {
          count: sampleDonations.length,
        });
        return sampleDonations;
      }

      const response = await apiService.getDonations(filters);
      logger.debug('EnhancedDatabaseService', 'Requested donations from backend', {
        filters,
        success: response.success,
      });
      
      if (response.success && response.data) {
        await this.setCache('donations_list', cacheKey, response.data);
        logger.info('EnhancedDatabaseService', 'Donations fetched from backend', {
          count: Array.isArray(response.data) ? response.data.length : 0,
        });
        return response.data;
      }

      logger.warn('EnhancedDatabaseService', 'Donations response empty');
      return [];
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Get donations error', { error });
      return [];
    }
  }

  async createDonation(donationData: CreateDonationData): Promise<ApiResponse> {
    try {
      logger.info('EnhancedDatabaseService', 'Creating donation', {
        type: donationData.type,
        amount: donationData.amount,
        category: donationData.category,
      });
      if (!USE_BACKEND) {
        const donation = {
          id: Date.now().toString(),
          ...donationData,
          created_at: new Date().toISOString(),
          status: 'active',
        };
        logger.debug('EnhancedDatabaseService', 'Donation created locally (no backend)');
        return { success: true, data: donation };
      }

      const response = await apiService.createDonation(donationData);
      
      if (response.success) {
        // Clear relevant caches
        await this.clearCachePattern('donations_list');
        await this.clearCachePattern('user_donations');
        logger.info('EnhancedDatabaseService', 'Donation created via backend and caches cleared');
      } else {
        logger.warn('EnhancedDatabaseService', 'Donation creation failed via backend', { error: response.error });
      }

      return response;
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Create donation error', { error });
      
      // Queue for offline sync
      await this.queueOfflineAction('create_donation', donationData);
      return { success: false, error: 'Failed to create donation, queued for later' };
    }
  }

  async updateDonation(donationId: string, updateData: Partial<DonationData>): Promise<ApiResponse> {
    try {
      logger.info('EnhancedDatabaseService', 'Updating donation', {
        donationId,
        fields: Object.keys(updateData || {}),
      });
      if (!USE_BACKEND) {
        // Local-only success fallback
        logger.debug('EnhancedDatabaseService', 'Donation update completed locally (no backend)');
        return { success: true, data: { id: donationId, ...updateData } as any };
      }
      const response = await apiService.updateDonation(donationId, updateData);
      if (response.success) {
        await this.clearCachePattern('donations_list');
        await this.clearCachePattern('user_donations');
        logger.info('EnhancedDatabaseService', 'Donation updated via backend and caches cleared', { donationId });
      } else {
        logger.warn('EnhancedDatabaseService', 'Donation update failed via backend', { donationId, error: response.error });
      }
      return response;
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Update donation error', { error });
      return { success: false, error: 'Failed to update donation' };
    }
  }

  async deleteDonation(donationId: string): Promise<ApiResponse> {
    try {
      logger.info('EnhancedDatabaseService', 'Deleting donation', { donationId });
      if (!USE_BACKEND) {
        // Local-only success fallback
        logger.debug('EnhancedDatabaseService', 'Donation deletion completed locally (no backend)');
        return { success: true };
      }
      const response = await apiService.deleteDonation(donationId);
      if (response.success) {
        await this.clearCachePattern('donations_list');
        await this.clearCachePattern('user_donations');
        logger.info('EnhancedDatabaseService', 'Donation deleted via backend and caches cleared', { donationId });
      } else {
        logger.warn('EnhancedDatabaseService', 'Donation deletion failed via backend', { donationId, error: response.error });
      }
      return response;
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Delete donation error', { error });
      return { success: false, error: 'Failed to delete donation' };
    }
  }

  // ==================== Community Stats ====================

  async getCommunityStats(filters: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    try {
      const cacheKey = `community_stats_${JSON.stringify(filters)}`;
      const cached = await this.getCache('community_stats', cacheKey);
      if (cached) {
        return cached as Record<string, unknown>; // Type assertion for cached data
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
        return response.data as Record<string, unknown>;
      }

      return {} as Record<string, unknown>;
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Get community stats error', { error });
      return {} as Record<string, unknown>;
    }
  }

  async incrementStat(statType: string, value: number = 1, city?: string): Promise<void> {
    try {
      if (!USE_BACKEND) {
        logger.info('EnhancedDatabaseService', 'Increment stat', { statType, value, city: city || 'globally' });
        return;
      }

      await apiService.incrementStat({ stat_type: statType, value, city });
      
      // Clear stats cache to force refresh
      await this.clearCachePattern('community_stats');
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Increment stat error', { error });
      
      // Queue for offline sync
      await this.queueOfflineAction('increment_stat', { statType, value, city });
    }
  }

  // ==================== Rides Management ====================

  async getRides(filters: Record<string, unknown> = {}): Promise<RideData[]> {
    try {
      const cacheKey = `rides_${JSON.stringify(filters)}`;
      const cached = await this.getCache('rides_list', cacheKey);
      if (cached) {
        return cached as RideData[]; // Type assertion for cached data
      }

      if (!USE_BACKEND) {
        return [] as RideData[];
      }

      const response = await apiService.getRides(filters);
      
      if (response.success && response.data) {
        await this.setCache('rides_list', cacheKey, response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Get rides error', { error });
      return [] as RideData[];
    }
  }

  async createRide(rideData: CreateRideData): Promise<ApiResponse> {
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
      logger.error('EnhancedDatabaseService', 'Create ride error', { error });
      
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
      logger.error('EnhancedDatabaseService', 'Get cache error', { error });
      return null;
    }
  }

  private async setCache<T>(collection: string, key: string, data: T): Promise<void> {
    try {
      const cacheKey = `${collection}_${key}`;
      const expiryDuration = (CACHE_CONFIG as any)[collection as string] || 5 * 60 * 1000; // Default 5 minutes
      
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiryDuration,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Set cache error', { error });
    }
  }

  private async clearCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      await AsyncStorage.multiRemove(matchingKeys);
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Clear cache pattern error', { error });
    }
  }

  // ==================== Offline Queue Management ====================

  private async queueOfflineAction(action: string, data: Record<string, unknown>): Promise<void> {
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
      logger.error('EnhancedDatabaseService', 'Queue offline action error', { error });
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Load offline queue error', { error });
      this.offlineQueue = [];
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Save offline queue error', { error });
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    logger.info('EnhancedDatabaseService', 'Processing offline actions', { count: this.offlineQueue.length });

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
            const updateResponse = await apiService.updateUser(action.data.userId as string, action.data.updateData as any);
            success = updateResponse.success;
            break;
          case 'increment_stat':
            await apiService.incrementStat(action.data as { stat_type: string; value?: number; city?: string });
            success = true;
            break;
        }

        if (success) {
          processedActions.push(action.id);
          logger.info('EnhancedDatabaseService', 'Offline action processed', { action: action.action });
        } else {
          action.retryCount++;
          if (action.retryCount >= 3) {
            processedActions.push(action.id);
            logger.warn('EnhancedDatabaseService', 'Offline action failed after 3 retries', { action: action.action });
          }
        }
      } catch (error) {
        logger.error('EnhancedDatabaseService', 'Error processing offline action', { action: action.action, error });
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
    logger.info('EnhancedDatabaseService', 'Offline sync completed', { processedCount: processedActions.length });
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
      logger.info('EnhancedDatabaseService', 'All cache cleared');
    } catch (error) {
      logger.error('EnhancedDatabaseService', 'Clear all cache error', { error });
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

// Admin utilities
export async function wipeAllDataAdmin(): Promise<ApiResponse> {
  try {
    logger.warn('EnhancedDatabaseService', 'Admin requested wipe all data', { useBackend: USE_BACKEND });
    if (!USE_BACKEND) {
      // Local purge only
      try {
        const { DatabaseService } = await import('./databaseService');
        await DatabaseService.clearLocalCollections?.();
      } catch {}
      try {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
      } catch {}
      logger.info('EnhancedDatabaseService', 'Local data cleared (no backend)');
      return { success: true, message: 'Local data cleared (no backend enabled)' };
    }
    const result = await apiService.adminWipeAllData();
    if (result.success) {
      // Clear all local caches and queues after server wipe
      try {
        const { DatabaseService } = await import('./databaseService');
        await DatabaseService.clearLocalCollections?.();
      } catch {}
      try {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
      } catch {}
      logger.info('EnhancedDatabaseService', 'Backend wipe successful - local caches cleared');
    } else {
      logger.warn('EnhancedDatabaseService', 'Backend wipe failed', { error: result.error });
    }
    return result;
  } catch (error) {
    logger.error('EnhancedDatabaseService', 'Admin wipe all data error', { error });
    return { success: false, error: 'Failed to wipe all data' };
  }
}
