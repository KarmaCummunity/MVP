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
import { API_BASE_URL as CONFIG_API_BASE_URL } from './config.constants';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  version?: string;
}

class ApiService {
  private _baseURL: string | null = null;

  private get baseURL(): string {
    if (this._baseURL === null) {
      // Lazy initialization to avoid circular dependency issues
      this._baseURL = CONFIG_API_BASE_URL;
    }
    return this._baseURL;
  }

  // Tasks APIs
  async getTasks(filters: {
    status?: 'open' | 'in_progress' | 'done' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    assignee?: string;
    q?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return this.request(`/api/tasks${qs ? `?${qs}` : ''}`);
  }

  async createTask(taskData: any): Promise<ApiResponse> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  private normalizeEndpoint(endpoint: string): string {
    if (!endpoint) {
      return '/';
    }
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    if (!this.baseURL) {
      return normalizedEndpoint;
    }
    const normalizedBase = this.baseURL.replace(/\/+$/, '');
    if (!normalizedBase) {
      return normalizedEndpoint;
    }
    return `${normalizedBase}${normalizedEndpoint}`;
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
      const url = this.buildUrl(endpoint);
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

  /**
   * Resolve user ID from firebase_uid, google_id, or email to UUID
   * This is used when the client has Firebase UID or Google ID and needs the database UUID
   */
  async resolveUserId(params: { firebase_uid?: string; google_id?: string; email?: string }): Promise<ApiResponse> {
    return this.request('/api/users/resolve-id', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUsers(filters: {
    city?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/users?${params.toString()}`);
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

  async getUsersSummary(): Promise<ApiResponse> {
    return this.request('/api/users/stats/summary');
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
    include_past?: string;
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
    forceRefresh?: boolean;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'forceRefresh' && value === true) {
          params.append(key, 'true');
        } else if (key !== 'forceRefresh') {
          params.append(key, value.toString());
        }
      }
    });
    
    return this.request(`/api/stats/community?${params.toString()}`);
  }

  async getCommunityStatsVersion(city?: string): Promise<ApiResponse> {
    const params = city ? `?city=${city}` : '';
    return this.request(`/api/stats/community/version${params}`);
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

  async trackSiteVisit(): Promise<ApiResponse> {
    return this.request('/api/stats/track-visit', {
      method: 'POST',
    });
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

  async resetCommunityStats(): Promise<ApiResponse> {
    return this.request('/api/stats/community/reset', {
      method: 'POST',
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

  async getStatDetails(statType: string): Promise<ApiResponse> {
    return this.request(`/api/stats/details/${statType}`);
  }

  // Admin APIs
  async adminWipeAllData(): Promise<ApiResponse> {
    // WARNING: This should be protected by server-side admin auth
    return this.request('/api/admin/wipe', {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
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

  // Community Members APIs
  async getCommunityMembers(filters: {
    status?: 'active' | 'inactive';
    search?: string;
  } = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return this.request(`/api/community-members${qs ? `?${qs}` : ''}`);
  }

  async getCommunityMember(memberId: string): Promise<ApiResponse> {
    return this.request(`/api/community-members/${memberId}`);
  }

  async createCommunityMember(memberData: {
    name: string;
    role: string;
    description?: string;
    contact_info?: {
      email?: string;
      phone?: string;
      [key: string]: any;
    };
    status?: 'active' | 'inactive';
    created_by?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/community-members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateCommunityMember(
    memberId: string,
    updateData: {
      name?: string;
      role?: string;
      description?: string;
      contact_info?: {
        email?: string;
        phone?: string;
        [key: string]: any;
      };
      status?: 'active' | 'inactive';
    }
  ): Promise<ApiResponse> {
    return this.request(`/api/community-members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteCommunityMember(memberId: string): Promise<ApiResponse> {
    return this.request(`/api/community-members/${memberId}`, {
      method: 'DELETE',
    });
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
      const res = await fetch(this.buildUrl('/health/redis'));
      return res.ok;
    } catch {
      return false;
    }
  }
}

// Lazy singleton to avoid circular dependency issues during module initialization
let _apiServiceInstance: ApiService | null = null;

function getApiServiceInstance(): ApiService {
  if (_apiServiceInstance === null) {
    _apiServiceInstance = new ApiService();
  }
  return _apiServiceInstance;
}

// Export as a Proxy to ensure lazy initialization
export const apiService = new Proxy({} as ApiService, {
  get(target, prop) {
    const instance = getApiServiceInstance();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export default apiService;
