import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Spinner } from '../../../core/components/spinner/spinner';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Storage } from '../../../core/services/storage/storage';
import { Auth } from '../../../core/services/auth/auth';

interface LoginData {
  username: string;
  password: string;
  remember: boolean;
}

@Component({
  imports: [FormRoot, FormField, Spinner],
  selector: '[app-sign-in]',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',

})
export class SignIn {

  private readonly storage = inject(Storage);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);

  isSubmitting = signal(false);

  loginModel = signal<LoginData>({
    username: '',
    password: '',
    remember: false,
  });

  loginForm = form(this.loginModel, (schemaPath) => {
      required(schemaPath.username, { message: 'El nombre de usuario es requerido' });
      required(schemaPath.password, { message: 'La contraseña es requerida' });
    }
  );

  async signIn() {
    if (this.loginForm().errors().length > 0) return;
    this.isSubmitting.set(true);
    const payload = { username: this.loginForm().value().username, password: this.loginForm().value().password };
    const response = await this.authService.signIn(Number(payload.username), payload.password).then(response => {
      if (response.error) {
        this.isSubmitting.set(false);
        return;
      }

      const { accessToken, refreshToken } = response;
      this.storage.setItem('accessToken', accessToken);
      this.storage.setItem('refreshToken', refreshToken);
      this.isSubmitting.set(false);
      this.router.navigate(['/']);
    }).catch(error => {
      console.log(error);
    });

  }
}
