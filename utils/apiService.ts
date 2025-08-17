// File overview:
// - Purpose: Typed API client for the new backend (users, donations, rides, stats, chat).
// - Reached from: Higher-level services/components when `USE_BACKEND` is enabled.
// - Provides: request helpers and endpoint-specific methods returning ApiResponse<T>.
// - Env: Base URL derived from `dbConfig` (EXPO_PUBLIC_API_BASE_URL).
// Enhanced API service for connecting to the new backend

// TODO: Add comprehensive error handling with retry logic and exponential backoff
// TODO: Implement proper TypeScript interfaces for all API requests/responses
// TODO: Add request/response interceptors for authentication and logging
// TODO: Add request caching mechanism for GET requests
// TODO: Implement proper timeout handling and abort controllers
// TODO: Add network connectivity checks before making requests
// TODO: Add comprehensive unit tests for all API methods
// TODO: Implement proper API versioning support
// TODO: Add request/response transformation middleware
// TODO: Add comprehensive logging and monitoring
import { USE_BACKEND, API_BASE_URL as CONFIG_API_BASE_URL } from './dbConfig';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = CONFIG_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // TODO: Add request timeout configuration
    // TODO: Add authentication token to headers automatically
    // TODO: Add request ID for tracing and debugging
    // TODO: Add retry logic for failed requests
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        return {
          success: false,
          error: data.message || data.error || 'Network error',
        };
      }

      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Network Error:`, error);
      return {
        success: false,
        error: 'Network error - please check your connection',
      };
    }
  }

  // User APIs
  async registerUser(userData: any): Promise<ApiResponse> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: any): Promise<ApiResponse> {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}`);
  }

  async updateUser(userId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getUserStats(userId: string): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/stats`);
  }

  async getUserActivities(userId: string, limit = 50): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/activities?limit=${limit}`);
  }

  async followUser(userId: string, followerId: string): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ follower_id: followerId }),
    });
  }

  async unfollowUser(userId: string, followerId: string): Promise<ApiResponse> {
    return this.request(`/api/users/${userId}/follow`, {
      method: 'DELETE',
      body: JSON.stringify({ follower_id: followerId }),
    });
  }

  // Donations APIs
  async getDonationCategories(): Promise<ApiResponse> {
    return this.request('/api/donations/categories');
  }

  async getDonations(filters: {
    type?: string;
    category?: string;
    city?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/donations?${params.toString()}`);
  }

  async createDonation(donationData: any): Promise<ApiResponse> {
    return this.request('/api/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonationById(donationId: string): Promise<ApiResponse> {
    return this.request(`/api/donations/${donationId}`);
  }

  async updateDonation(donationId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/api/donations/${donationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteDonation(donationId: string): Promise<ApiResponse> {
    return this.request(`/api/donations/${donationId}`, {
      method: 'DELETE',
    });
  }

  async getUserDonations(userId: string): Promise<ApiResponse> {
    return this.request(`/api/donations/user/${userId}`);
  }

  async getDonationStats(): Promise<ApiResponse> {
    return this.request('/api/donations/stats/summary');
  }

  // Rides APIs
  async getRides(filters: {
    from_city?: string;
    to_city?: string;
    date?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/rides?${params.toString()}`);
  }

  async createRide(rideData: any): Promise<ApiResponse> {
    return this.request('/api/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async getRideById(rideId: string): Promise<ApiResponse> {
    return this.request(`/api/rides/${rideId}`);
  }

  async bookRide(rideId: string, bookingData: any): Promise<ApiResponse> {
    return this.request(`/api/rides/${rideId}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse> {
    return this.request(`/api/rides/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getUserRides(userId: string, type?: 'driver' | 'passenger'): Promise<ApiResponse> {
    const params = type ? `?type=${type}` : '';
    return this.request(`/api/rides/user/${userId}${params}`);
  }

  async getRideStats(): Promise<ApiResponse> {
    return this.request('/api/rides/stats/summary');
  }

  // Stats APIs
  async getCommunityStats(filters: {
    city?: string;
    period?: string;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/stats/community?${params.toString()}`);
  }

  async getCommunityTrends(statType: string, city?: string, days = 30): Promise<ApiResponse> {
    const params = new URLSearchParams({ stat_type: statType, days: days.toString() });
    if (city) {
      params.append('city', city);
    }
    
    return this.request(`/api/stats/community/trends?${params.toString()}`);
  }

  async getStatsByCity(statType?: string): Promise<ApiResponse> {
    const params = statType ? `?stat_type=${statType}` : '';
    return this.request(`/api/stats/community/cities${params}`);
  }

  async incrementStat(statData: {
    stat_type: string;
    value?: number;
    city?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/stats/increment', {
      method: 'POST',
      body: JSON.stringify(statData),
    });
  }

  async getCategoryAnalytics(): Promise<ApiResponse> {
    return this.request('/api/stats/analytics/categories');
  }

  async getUserAnalytics(): Promise<ApiResponse> {
    return this.request('/api/stats/analytics/users');
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/api/stats/dashboard');
  }

  async getRealTimeStats(): Promise<ApiResponse> {
    return this.request('/api/stats/real-time');
  }

  // Chat APIs
  async getUserConversations(userId: string): Promise<ApiResponse> {
    return this.request(`/api/chat/conversations/user/${userId}`);
  }

  async createConversation(conversationData: any): Promise<ApiResponse> {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  }

  async sendMessage(messageData: any): Promise<ApiResponse> {
    return this.request('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<ApiResponse> {
    return this.request(
      `/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<ApiResponse> {
    return this.request(`/api/chat/messages/${messageId}/read`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async markAllMessagesAsRead(conversationId: string, userId: string): Promise<ApiResponse> {
    return this.request(`/api/chat/conversations/${conversationId}/read-all`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async searchMessages(query: string, userId: string): Promise<ApiResponse> {
    return this.request(`/api/chat/search?q=${encodeURIComponent(query)}&user_id=${userId}`);
  }

  // Legacy API fallback
  async legacyRequest<T>(collection: string, userId: string, itemId?: string): Promise<T | null> {
    if (!USE_BACKEND) {
      return null;
    }

    try {
      const endpoint = itemId 
        ? `/api/items/${collection}/${userId}/${itemId}`
        : `/api/items/${collection}/${userId}`;
        
      const response = await this.request<T>(endpoint);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Legacy API request failed:', error);
      return null;
    }
  }

  // Utility methods
  isBackendAvailable(): boolean {
    return USE_BACKEND;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/health/redis`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
