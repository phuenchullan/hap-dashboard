import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { PasswordInput } from '../../../../core/components/password-input/password-input';
import { Users } from '../../../../core/services/users/users';
import { UserRow } from '../../../../core/interfaces/users.interface';

@Component({
  imports: [FormRoot, FormField, PasswordInput],
  selector: 'app-create-user',
  styleUrl: './create-user.css',
  templateUrl: './create-user.html',
})
export class CreateUser {

  router = inject(Router);
  usersService = inject(Users);
  passwordVisibility = signal<string>('password');

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
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.rut, { message: 'El nombre de usuario es requerido' });
    required(schemaPath.dv, { message: 'El DV es requerido' });
    required(schemaPath.name, { message: 'El nombre es requerido' });
    required(schemaPath.lastname, { message: 'El apellido es requerido' });
    required(schemaPath.email, { message: 'El email es requerido' });
    required(schemaPath.role, { message: 'El rol es requerido' });
    required(schemaPath.isActive, { message: 'El estado es requerido' });
    required(schemaPath.password, { message: 'La contraseña es requerida' });
  });



  togglePasswordVisibility(){
    if(this.passwordVisibility() === 'password'){
      this.passwordVisibility.set('text');
    }else{
      this.passwordVisibility.set('password');
    }
  }

  close(){
    this.router.navigate(['/users']);
  }

  create(){
    const separatedRut = this.userForm().value().rut.split('-');
    this.userForm().value().dv = separatedRut[1];
    this.userForm().value().rut = separatedRut[0];
    console.log(this.userForm().invalid());
    const newUser: UserRow = {
      id: '',
      rut: Number(this.userForm().value().rut),
      dv: this.userForm().value().dv,
      name: this.userForm().value().name,
      lastname: this.userForm().value().lastname,
      email: this.userForm().value().email,
      role: this.userForm().value().role as 'superadmin' | 'admin' | 'supervisor' | 'viewer' | 'supervisor_harvest',
      isActive: this.userForm().value().isActive === 'true',
      password: this.userForm().value().password,
    }
    this.usersService.create(newUser).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  }
}
