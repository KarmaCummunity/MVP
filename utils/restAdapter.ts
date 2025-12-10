// File overview:
// - Purpose: Low-level REST adapter used by `DatabaseService` to call generic /api collection endpoints and auth.
// - Reached from: `DatabaseService` when `USE_BACKEND` is true, and some direct auth flows.
// - Provides: create/read/update/delete/list for collections; auth check/register/login; generic POST helper.
// utils/restAdapter.ts
import { API_BASE_URL } from './config.constants';

export class RestAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async post<T>(path: string, body?: any): Promise<T> {
    return this.http<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  private async http<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const method = (init?.method || 'GET').toUpperCase();
    const startedAt = Date.now();
    // High-signal client log for production debugging
    // eslint-disable-next-line no-console
    console.log(`🌐 REST → ${method} ${url}`, init?.body ? { body: init?.body } : '');
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      ...init,
    });
    const ms = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(`🌐 REST ← ${method} ${url} ${res.status} (${ms}ms)`);
    if (!res.ok) {
      const text = await res.text();
      // eslint-disable-next-line no-console
      console.error(`❌ REST ${method} ${url} -> HTTP ${res.status}:`, text);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    
    // Check if response has content before parsing JSON
    const contentLength = res.headers.get('content-length');
    const contentType = res.headers.get('content-type');
    
    if (contentLength === '0' || (!contentType?.includes('application/json') && !contentType?.includes('text/json'))) {
      // Return empty object for non-JSON or empty responses
      return {} as unknown as T;
    }
    
    const text = await res.text();
    if (!text.trim()) {
      // Return empty object for empty responses
      return {} as unknown as T;
    }
    
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.error(`❌ JSON Parse Error for ${method} ${url}:`, error, 'Response text:', text);
      return {} as unknown as T;
    }
  }

  async create<T>(collection: string, userId: string, itemId: string, data: T): Promise<void> {
    await this.http(`/api/collections/${collection}`, {
      method: 'POST',
      body: JSON.stringify({ id: itemId, userId, data }),
    });
  }

  async read<T>(collection: string, userId: string, itemId: string): Promise<T | null> {
    return this.http<T | null>(`/api/collections/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`);
  }

  async update<T>(collection: string, userId: string, itemId: string, data: Partial<T>): Promise<void> {
    await this.http(`/api/collections/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async delete(collection: string, userId: string, itemId: string): Promise<void> {
    await this.http(`/api/collections/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  }

  async list<T>(collection: string, userId: string): Promise<T[]> {
    return this.http<T[]>(`/api/collections/${collection}?userId=${encodeURIComponent(userId)}`);
  }

  // Auth endpoints
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    return this.http(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  async register(email: string, password: string, name?: string): Promise<{ ok?: boolean; user?: any; error?: string }> {
    return this.http(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<{ ok?: boolean; user?: any; error?: string }> {
    return this.http(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export const restAdapter = new RestAdapter();


