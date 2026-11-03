import { Component, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  imports: [LucideEye, LucideEyeOff],
  selector: 'password-input',
  styleUrl: './password-input.css',
  templateUrl: './password-input.html',
})
export class PasswordInput implements FormValueControl<string> {

  private passwordVisibility = signal<string>('password');
  value = model('');

  togglePasswordVisibility(){
    if(this.passwordVisibility() === 'password'){
      this.passwordVisibility.set('text');
    }else{
      this.passwordVisibility.set('password');
    }
  }
}
