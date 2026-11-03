import { inject, Service } from '@angular/core';
import { UpdateUser, UserRow } from '../../interfaces/users.interface';
import { environment } from '../../../../environments/environment.development';
import { Storage } from '../storage/storage';

@Service()
export class Users {
  storage = inject(Storage);

  async create(user: UserRow) {
    const accessToken = this.storage.getItem('accessToken');
    const response = fetch(`${environment.apiUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = (await response).json();
    return data;
  }

  async delete(id: string): Promise<void> {
    const accessToken = await this.storage.getItem('accessToken');
    const response = await fetch(`${environment.apiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message =
        typeof error?.message === 'string' ? error.message : 'No fue posible eliminar el usuario.';
      throw new Error(message);
    }
  }

  async update(id: string, payload: UpdateUser): Promise<UserRow> {
    const accessToken = await this.storage.getItem('accessToken');
    const response = await fetch(`${environment.apiUrl}/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const message =
        typeof error?.message === 'string'
          ? error.message
          : 'No fue posible actualizar el usuario.';
      throw new Error(message);
    }

    return response.json() as Promise<UserRow>;
  }
}
