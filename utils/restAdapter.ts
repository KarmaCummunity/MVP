// utils/restAdapter.ts
import { API_BASE_URL } from './dbConfig';

export class RestAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text();
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
}

export const restAdapter = new RestAdapter();


