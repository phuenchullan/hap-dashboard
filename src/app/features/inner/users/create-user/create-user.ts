import { Component, inject, resource, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { PasswordInput } from '../../../../core/components/password-input/password-input';
import { Users } from '../../../../core/services/users/users';
import {
  CreateUser as CreateUserPayload,
  UserRow,
} from '../../../../core/interfaces/users.interface';
import { Land } from '../../../../core/interfaces/harvest.interface';
import { HarvestApi } from '../../../../core/services/harvest-api/harvest-api';

@Component({
  imports: [FormRoot, FormField, PasswordInput],
  selector: 'app-create-user',
  styleUrl: './create-user.css',
  templateUrl: './create-user.html',
})
export class CreateUser {
  router = inject(Router);
  usersService = inject(Users);
  api = inject(HarvestApi);

  passwordVisibility = signal<string>('password');
  lands = signal<Land[]>([]);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  userModel = signal({
    id: '',
    rut: '',
    dv: '',
    name: '',
    lastname: '',
    email: '',
    role: 'admin',
    isActive: 'true',
    password: '',
    activeLand: '',
  });

  landsResource = resource({
    loader: async () => {
      const response = await this.api.list<Land>('lands');
      this.lands.set(response.data);
      return response;
    },
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.rut, { message: 'El RUT es requerido' });
    required(schemaPath.name, { message: 'El nombre es requerido' });
    required(schemaPath.lastname, { message: 'El apellido es requerido' });
    required(schemaPath.email, { message: 'El email es requerido' });
    required(schemaPath.role, { message: 'El rol es requerido' });
    required(schemaPath.password, { message: 'La contraseña es requerida' });
  });

  togglePasswordVisibility() {
    this.passwordVisibility.update((value) => (value === 'password' ? 'text' : 'password'));
  }

  close() {
    this.router.navigate(['/users']);
  }

  async create() {
    if (this.userForm().invalid() || this.isSaving()) return;

    const value = this.userForm().value();
    const [rutPart, dvPart] = value.rut.includes('-')
      ? value.rut.split('-')
      : [value.rut, value.dv];

    const payload: CreateUserPayload = {
      rut: Number(rutPart),
      dv: (dvPart || value.dv).trim().toUpperCase(),
      name: value.name.trim(),
      lastname: value.lastname.trim(),
      email: value.email.trim(),
      role: value.role as UserRow['role'],
      password: value.password,
      activeLand: value.activeLand || null,
    };

    if (value.isActive !== '') {
      payload.isActive = String(value.isActive) === 'true';
    }

    if (value.activeLand.trim()) {
      payload.activeLand = value.activeLand.trim();
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    try {
      await this.usersService.create(payload);
      await this.router.navigate(['/users']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No fue posible crear el usuario.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}
