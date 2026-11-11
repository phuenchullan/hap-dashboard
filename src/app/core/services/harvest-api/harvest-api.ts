import { Service, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PageResponse } from '../../interfaces/harvest.interface';
import { Storage } from '../storage/storage';

@Service()
export class HarvestApi {
  private readonly storage = inject(Storage);

  async list<T>(resource: string): Promise<PageResponse<T>> {
    return this.request<PageResponse<T>>(`/${resource}?page=1&limit=100`);
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
