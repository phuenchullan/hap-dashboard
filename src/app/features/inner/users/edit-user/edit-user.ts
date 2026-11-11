import { Component, computed, inject, resource, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateUser, UserPermission, UserRow } from '../../../../core/interfaces/users.interface';
import { Storage } from '../../../../core/services/storage/storage';
import { FormField, FormRoot, required } from '@angular/forms/signals';
import { form } from '@angular/forms/signals';
import { Users as UsersService } from '../../../../core/services/users/users';
import { Land } from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';
import { environment } from '../../../../../environments/environment';

interface EditablePermission extends UserPermission {
  uid: number;
}

@Component({
  imports: [FormRoot, FormField],
  selector: 'app-edit-user',
  styleUrl: './edit-user.css',
  templateUrl: './edit-user.html',
})
export class EditUser {
  
  api = inject(HarvestApi);
  router = inject(Router);
  route = inject(ActivatedRoute);
  storage = inject(Storage);
  usersService = inject(UsersService);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  userSelected = signal<UserRow | null>(null);

  lands = signal<Land[]>([]);
  landsResource = resource({
    loader: async () => {
      const response = await this.api.list<Land>('lands');
      this.lands.set(response.data || []);
      return response;
    },
  });

  roles = signal<{ key: string; value: string }[]>([
    { key: 'superadmin', value: 'SuperAdmin' },
    { key: 'admin', value: 'Admin' },
    { key: 'supervisor', value: 'Supervisor' },
    { key: 'viewer', value: 'Viewer' },
  ]);
  permissionModules = signal([
    { key: 'users', value: 'Users' },
    { key: 'lands', value: 'Lands' },
    { key: 'harvests', value: 'Harvests' },
    { key: 'reports', value: 'Reports' },
    { key: 'settings', value: 'Settings' },
  ]);
  permissions = signal<EditablePermission[]>([]);
  private permissionUid = 0;

  permissionPayload = computed<UserPermission[]>(() =>
    this.permissions().map(({ uid: _uid, ...permission }) => permission),
  );

  hasPermissionErrors = computed(() => {
    const modules = this.permissions().map((permission) => permission.module);
    return modules.some((module) => !module) || new Set(modules).size !== modules.length;
  });

  userModel = signal({
    id: '',
    rut: '',
    dv: '',
    name: '',
    lastname: '',
    email: '',
    role: 'admin',
    isActive: 'true',
    activeLand: '',
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.rut, { message: 'El RUT es requerido' });
    required(schemaPath.dv, { message: 'El DV es requerido' });
    required(schemaPath.name, { message: 'El nombre es requerido' });
    required(schemaPath.lastname, { message: 'El apellido es requerido' });
    required(schemaPath.email, { message: 'El email es requerido' });
    required(schemaPath.role, { message: 'El rol es requerido' });
  });

  userResource = resource({
    loader: async () => {
      const id = this.route.snapshot.params['id'];
      const response = await this.api.get<UserRow>(`users`, id);
      this.userModel.set({
        id: response.id,
        rut: String(response.rut ?? ''),
        dv: response.dv ?? '',
        name: response.name ?? '',
        lastname: response.lastname ?? '',
        email: response.email ?? '',
        role: response.role ?? 'admin',
        isActive: response.isActive === false ? 'false' : 'true',
        activeLand: response.activeLand ?? '',
      });
      return response;
    },
  });

  addPermission() {
    this.permissions.update((permissions) => [...permissions, this.createPermission()]);
  }

  removePermission(index: number) {
    this.permissions.update((permissions) =>
      permissions.filter((_, permissionIndex) => permissionIndex !== index),
    );
  }

  updatePermission<K extends keyof UserPermission>(
    index: number,
    field: K,
    value: UserPermission[K],
  ) {
    this.permissions.update((permissions) =>
      permissions.map((permission, permissionIndex) =>
        permissionIndex === index ? { ...permission, [field]: value } : permission,
      ),
    );
  }

  close() {
    this.router.navigate(['/users']);
  }

  async update() {
    const id = this.route.snapshot.params['id'];
    if (!id || this.userForm().invalid() || this.isSaving()) return;

    const value = this.userForm().value();
    const payload: UpdateUser = {
      rut: Number(value.rut),
      dv: value.dv.trim().toUpperCase(),
      name: value.name.trim(),
      lastname: value.lastname.trim(),
      email: value.email.trim(),
      role: value.role as UserRow['role'],
    };

    if (value.isActive !== '') {
      payload.isActive = String(value.isActive) === 'true';
    }

    if (value.activeLand.trim()) {
      payload.activeLand = value.activeLand.trim();
    } else {
      payload.activeLand = null;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    try {
      await this.usersService.update(id, payload);
      await this.router.navigate(['/users']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No fue posible actualizar el usuario.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  private createPermission(permission: Partial<UserPermission> = {}): EditablePermission {
    return {
      uid: ++this.permissionUid,
      module: permission.module ?? '',
      canRead: permission.canRead ?? false,
      canCreate: permission.canCreate ?? false,
      canUpdate: permission.canUpdate ?? false,
      canDelete: permission.canDelete ?? false,
    };
  }
}
