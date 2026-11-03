import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Storage } from '../../services/storage/storage';

export const authGuard: CanActivateFn = async (route, state) => {

  const storage = inject(Storage);
  const router = inject(Router);

  const token = await storage.getItem('accessToken');
  if(!token) {
    router.navigate(['/auth/sign-in']);
    return false;
  }
  return true;
};