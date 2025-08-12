// utils/restAdapter.ts
import { API_BASE_URL } from './dbConfig';

export class RestAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
    return (await res.json()) as T;
  }

  async create<T>(collection: string, userId: string, itemId: string, data: T): Promise<void> {
    await this.http(`/api/${collection}`, {
      method: 'POST',
      body: JSON.stringify({ id: itemId, userId, data }),
    });
  }

  async read<T>(collection: string, userId: string, itemId: string): Promise<T | null> {
    return this.http<T | null>(`/api/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`);
  }

  async update<T>(collection: string, userId: string, itemId: string, data: Partial<T>): Promise<void> {
    await this.http(`/api/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async delete(collection: string, userId: string, itemId: string): Promise<void> {
    await this.http(`/api/${collection}/${encodeURIComponent(userId)}/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  }

  async list<T>(collection: string, userId: string): Promise<T[]> {
    return this.http<T[]>(`/api/${collection}?userId=${encodeURIComponent(userId)}`);
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


