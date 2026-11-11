import { Service, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PageResponse } from '../../interfaces/harvest.interface';
import { Storage } from '../storage/storage';

@Service()
export class HarvestApi {
  private readonly storage = inject(Storage);

  async list<T>(
    resource: string,
    params: Record<string, string | number | undefined> = {},
  ): Promise<PageResponse<T>> {
    const query = new URLSearchParams({ page: '1', limit: '100' });
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query.set(key, String(value));
    }
    return this.request<PageResponse<T>>(`/${resource}?${query.toString()}`);
  }

  async listAll<T>(
    resource: string,
    params: Record<string, string | number | undefined> = {},
  ): Promise<T[]> {
    const limit = Number(params['limit']) || 100;
    const items: T[] = [];
    let page = 1;

    while (page <= 50) {
      const response = await this.list<T>(resource, { ...params, page, limit });
      items.push(...response.data);
      const total = response.meta.totalRecords ?? items.length;
      if (items.length >= total || response.data.length < limit) break;
      page += 1;
    }

    return items;
  }
  async getMe(): Promise<any> {
    return this.request('/users/me');
  }

  async get<T>(resource: string, id: string): Promise<T> {
    return this.request<T>(`/${resource}/${id}`);
  }

  async create<TResponse, TPayload>(resource: string, payload: TPayload): Promise<TResponse> {
    return this.request<TResponse>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async update<TResponse, TPayload>(
    resource: string,
    id: string,
    payload: TPayload,
  ): Promise<TResponse> {
    return this.request<TResponse>(`/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await this.storage.getItem('accessToken');
    const response = await fetch(`${environment.apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? ''}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message =
        typeof error?.message === 'string'
          ? error.message
          : 'No fue posible completar la solicitud.';
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }
}
