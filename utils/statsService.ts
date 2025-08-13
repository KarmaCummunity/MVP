// utils/statsService.ts
import { DatabaseService, DB_COLLECTIONS } from './databaseService';
import { enhancedDB } from './enhancedDatabaseService';
import { apiService } from './apiService';
import { USE_BACKEND } from './dbConfig';

export type CommunityStats = Record<string, number>;

export const DEFAULT_STATS: CommunityStats = {
  // Core stats
  moneyDonations: 0,
  volunteerHours: 0,
  rides: 0,
  events: 0,
  activeMembers: 0,
  monthlyDonations: 0,
  monthlyGrowthPct: 0,
  activeCities: 0,
  // Extended baseline (15 more types)
  foodKg: 0,
  clothingKg: 0,
  bloodLiters: 0,
  courses: 0,
  treesPlanted: 0,
  animalsAdopted: 0,
  recyclingBags: 0,
  culturalEvents: 0,
  appActiveUsers: 0,
  appDownloads: 0,
  activeVolunteers: 0,
  kmCarpooled: 0,
  fundsRaised: 0,
  mealsServed: 0,
  booksDonated: 0,
};

export async function getGlobalStats(): Promise<CommunityStats> {
  try {
    const data = await DatabaseService.read<CommunityStats>(DB_COLLECTIONS.SETTINGS, 'global', 'community_stats');
    if (!data || typeof data !== 'object') return { ...DEFAULT_STATS };
    // Ensure defaults for missing keys
    const merged: CommunityStats = { ...DEFAULT_STATS, ...data };
    return merged;
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveGlobalStats(partial: Partial<CommunityStats>): Promise<void> {
  const current = await getGlobalStats();
  const next = { ...current, ...partial };
  await DatabaseService.create(DB_COLLECTIONS.SETTINGS, 'global', 'community_stats', next);
}

export function getStat(stats: CommunityStats, key: string, fallback = 0): number {
  const v = stats?.[key];
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

export function formatShortNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

export function parseShortNumber(s: string): number {
  if (!s) return 0;
  const m = String(s).trim().toUpperCase();
  const factor = m.endsWith('B') ? 1_000_000_000 : m.endsWith('M') ? 1_000_000 : m.endsWith('K') ? 1_000 : 1;
  const num = parseFloat(m.replace(/[BMK]/g, ''));
  return isFinite(num) ? num * factor : 0;
}

// Enhanced Stats Service with Backend Integration
export class EnhancedStatsService {
  // Get community stats from backend or fallback to local
  static async getCommunityStats(filters: { city?: string; period?: string } = {}): Promise<CommunityStats> {
    try {
      if (USE_BACKEND) {
        const stats = await enhancedDB.getCommunityStats(filters);
        return this.mapBackendStats(stats);
      }

      // Fallback to local stats
      const localStats = await DatabaseService.getItem<CommunityStats>(DB_COLLECTIONS.ANALYTICS, 'global', 'community_stats');
      return localStats || DEFAULT_STATS;
    } catch (error) {
      console.error('Get community stats error:', error);
      return DEFAULT_STATS;
    }
  }

  // Get real-time dashboard statistics
  static async getDashboardStats(): Promise<any> {
    try {
      if (USE_BACKEND) {
        const response = await apiService.getDashboardStats();
        return response.success ? response.data : null;
      }

      return null;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return null;
    }
  }

  // Get category analytics with engagement metrics
  static async getCategoryAnalytics(): Promise<any[]> {
    try {
      if (USE_BACKEND) {
        const response = await apiService.getCategoryAnalytics();
        return response.success ? response.data : [];
      }

      return [];
    } catch (error) {
      console.error('Get category analytics error:', error);
      return [];
    }
  }

  // Increment a specific statistic
  static async incrementStat(statType: string, value: number = 1, city?: string): Promise<void> {
    try {
      if (USE_BACKEND) {
        await enhancedDB.incrementStat(statType, value, city);
        return;
      }

      // Fallback to local increment
      const currentStats = await DatabaseService.getItem<CommunityStats>(DB_COLLECTIONS.ANALYTICS, 'global', 'community_stats') || DEFAULT_STATS;
      
      // Map new stat types to legacy format
      const legacyKey = this.mapStatToLegacyKey(statType);
      if (legacyKey && currentStats.hasOwnProperty(legacyKey)) {
        currentStats[legacyKey] = (currentStats[legacyKey] || 0) + value;
        await DatabaseService.setItem(DB_COLLECTIONS.ANALYTICS, 'global', 'community_stats', currentStats);
      }
    } catch (error) {
      console.error('Increment stat error:', error);
    }
  }

  // Track user activity for analytics
  static async trackActivity(userId: string, activityType: string, activityData: any = {}): Promise<void> {
    try {
      if (USE_BACKEND) {
        // Activity tracking is handled automatically in the backend
        console.log(`📊 Activity tracked: ${activityType} for user ${userId}`);
        return;
      }

      // Fallback to local tracking
      const activity = {
        id: Date.now().toString(),
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData,
        timestamp: new Date().toISOString(),
      };

      const activities = await DatabaseService.getItem<any[]>(DB_COLLECTIONS.ANALYTICS, userId, 'activities') || [];
      activities.push(activity);
      
      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
      }

      await DatabaseService.setItem(DB_COLLECTIONS.ANALYTICS, userId, 'activities', activities);
    } catch (error) {
      console.error('Track activity error:', error);
    }
  }

  // Track category engagement
  static async trackCategoryView(categoryId: string, userId?: string): Promise<void> {
    try {
      await this.incrementStat('category_views', 1);
      
      if (userId) {
        await this.trackActivity(userId, 'category_viewed', { category_id: categoryId });
      }

      // Legacy analytics tracking
      const analytics = await DatabaseService.getItem<{count: number, lastViewed?: string}>(DB_COLLECTIONS.ANALYTICS, 'global', categoryId) || { count: 0 };
      analytics.count = (analytics.count || 0) + 1;
      analytics.lastViewed = new Date().toISOString();
      
      await DatabaseService.setItem(DB_COLLECTIONS.ANALYTICS, 'global', categoryId, analytics);
    } catch (error) {
      console.error('Track category view error:', error);
    }
  }

  // Track donation creation
  static async trackDonationCreated(donation: any): Promise<void> {
    try {
      const statType = donation.type === 'money' ? 'money_donations' : 
                      donation.type === 'time' ? 'volunteer_hours' :
                      donation.type === 'trump' ? 'rides_created' : 'other_donations';

      const value = donation.type === 'money' ? (donation.amount || 0) : 1;
      
      await this.incrementStat(statType, value, donation.city);
      
      if (donation.donor_id) {
        await this.trackActivity(donation.donor_id, 'donation_created', {
          type: donation.type,
          category: donation.category,
          amount: donation.amount,
        });
      }
    } catch (error) {
      console.error('Track donation created error:', error);
    }
  }

  // Track ride creation
  static async trackRideCreated(ride: any): Promise<void> {
    try {
      await this.incrementStat('rides_created', 1, ride.from_city);
      
      if (ride.driver_id) {
        await this.trackActivity(ride.driver_id, 'ride_created', {
          from: ride.from_location?.name,
          to: ride.to_location?.name,
          seats: ride.available_seats,
        });
      }
    } catch (error) {
      console.error('Track ride created error:', error);
    }
  }

  // Get user personal statistics
  static async getUserStats(userId: string): Promise<any> {
    try {
      if (USE_BACKEND) {
        const response = await apiService.getUserStats(userId);
        return response.success ? response.data : null;
      }

      // Fallback to local calculation
      const userDonations: any[] = await DatabaseService.getItem(DB_COLLECTIONS.DONATIONS, userId, 'all') || [];
      const userRides: any[] = await DatabaseService.getItem(DB_COLLECTIONS.RIDES, userId, 'all') || [];
      
      return {
        donations: {
          total_donations: userDonations.length,
          total_money_donated: userDonations
            .filter((d: any) => d.type === 'money')
            .reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
          volunteer_activities: userDonations.filter((d: any) => d.type === 'time').length,
          rides_offered: userDonations.filter((d: any) => d.type === 'trump').length,
        },
        rides: {
          rides_created: userRides.length,
          total_seats_offered: userRides.reduce((sum: number, r: any) => sum + (r.available_seats || 0), 0),
          completed_rides: userRides.filter((r: any) => r.status === 'completed').length,
        },
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }

  // Helper methods
  private static mapBackendStats(backendStats: any): CommunityStats {
    const mapped: CommunityStats = { ...DEFAULT_STATS };

    if (backendStats.money_donations) {
      mapped.moneyDonations = backendStats.money_donations.value || 0;
    }
    if (backendStats.volunteer_hours) {
      mapped.volunteerHours = backendStats.volunteer_hours.value || 0;
    }
    if (backendStats.rides_completed) {
      mapped.rides = backendStats.rides_completed.value || 0;
    }
    if (backendStats.active_members) {
      mapped.activeMembers = backendStats.active_members.value || 0;
    }
    if (backendStats.food_kg) {
      mapped.foodKg = backendStats.food_kg.value || 0;
    }
    if (backendStats.clothing_kg) {
      mapped.clothingKg = backendStats.clothing_kg.value || 0;
    }

    return mapped;
  }

  private static mapStatToLegacyKey(statType: string): string | null {
    const mapping: { [key: string]: string } = {
      'money_donations': 'moneyDonations',
      'volunteer_hours': 'volunteerHours',
      'rides_completed': 'rides',
      'rides_created': 'rides',
      'events_created': 'events',
      'active_members': 'activeMembers',
      'food_kg': 'foodKg',
      'clothing_kg': 'clothingKg',
      'books_donated': 'booksShared',
    };

    return mapping[statType] || null;
  }
}


