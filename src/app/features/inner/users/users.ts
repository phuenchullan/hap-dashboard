import { Component, computed, inject, resource, signal } from '@angular/core';
import { LucideSquarePen, LucideEye, LucidePlus, LucideTrash } from '@lucide/angular';
import { CustomTable, TableRowDirective } from '../../../core/components/custom-table/custom-table';
import type { TableColumn } from '../../../core/components/custom-table/custom-table';
import { UserRow } from '../../../core/interfaces/users.interface';
import { Router } from '@angular/router';
import { Modal } from '../../../core/components/modal/modal';
import { Storage } from '../../../core/services/storage/storage';
import { Users as UsersService } from '../../../core/services/users/users';

@Component({
  imports: [
    LucidePlus,
    LucideEye,
    LucideSquarePen,
    LucideTrash,
    CustomTable,
    TableRowDirective,
    Modal,
  ],
  selector: 'app-users',
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users {
  pageSize = signal(10);
  router = inject(Router);
  storage = inject(Storage);
  usersService = inject(UsersService);
  isOpenViewUser = signal(false);
  isOpenDeleteUserModal = signal(false);
  isDeleting = signal(false);
  deleteErrorMessage = signal<string | null>(null);

  userSelected = signal<UserRow | null>(null);
  deleteUserModal = signal<UserRow | null>(null);
  dataViewModal: any = computed(() => {
    return this.userSelected()
      ? [
          { key: 'rut', value: this.userSelected()?.rut || null },
          { key: 'dv', value: this.userSelected()?.dv || '' },
          { key: 'name', value: this.userSelected()?.name || '' },
          { key: 'lastname', value: this.userSelected()?.lastname || '' },
          { key: 'email', value: this.userSelected()?.email || '' },
          { key: 'role', value: this.userSelected()?.role || '' },
          { key: 'status', value: this.userSelected()?.isActive || '' },
        ]
      : [];
  });

  readonly headers = signal<TableColumn[]>([
    { key: 'rut', label: 'Rut' },
    { key: 'dv', label: 'Dv' },
    { key: 'name', label: 'Name' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'View', searchable: false },
  ]);

  users = signal<UserRow[]>([]);

  usersResource = resource({
    loader: async () => {
      const accessToken = await this.storage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      this.users.set(data);
      return data;
    },
  });

  createUser() {
    this.router.navigate(['/users/create']);
  }

  statusClass(status: UserRow['isActive']) {
    const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize';
    return status
      ? `${base} bg-[#39a188]/15 text-[#39a188]`
      : `${base} bg-[#c46b72]/15 text-[#c46b72]`;
  }

  openViewUser(user: UserRow) {
    this.isOpenViewUser.set(true);
    this.userSelected.set(user);
  }

  editUser(user: UserRow) {
    this.router.navigate(['/users', user.id]);
  }

  deleteUser(user: UserRow) {
    this.deleteErrorMessage.set(null);
    this.isOpenDeleteUserModal.set(true);
    this.deleteUserModal.set(user);
  }

  async confirmDeleteUser() {
    const user = this.deleteUserModal();
    if (!user || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);
    try {
      await this.usersService.delete(user.id);
      this.users.update((users) => users.filter((item) => item.id !== user.id));
      this.isOpenDeleteUserModal.set(false);
      this.deleteUserModal.set(null);
    } catch (error) {
      this.deleteErrorMessage.set(
        error instanceof Error ? error.message : 'No fue posible eliminar el usuario.',
      );
    } finally {
      this.isDeleting.set(false);
    }
  }

  closeViewUserModal(close: boolean) {
    this.isOpenViewUser.set(!close);
  }
}
