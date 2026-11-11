import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Storage } from '../../services/storage/storage';

const SIGN_IN_PATH = '/auth/sign-in';
let redirecting = false;

function isSignInUrl(url: string) {
  return url.includes('/auth/sign-in');
}

async function redirectToSignIn(storage: Storage, router: Router) {
  if (redirecting || router.url.startsWith(SIGN_IN_PATH)) return;

  redirecting = true;
  try {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    await router.navigate([SIGN_IN_PATH]);
  } finally {
    redirecting = false;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  const router = inject(Router);

  return from(storage.getItem('accessToken')).pipe(
    switchMap((accessToken) => {
      const authorizedRequest = accessToken
        ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
        : req;

      return next(authorizedRequest).pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401 && !isSignInUrl(req.url)) {
            void redirectToSignIn(storage, router);
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};

export function provideAuthInterceptor() {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      const storage = inject(Storage);
      const router = inject(Router);
      const originalFetch = window.fetch.bind(window);

      window.fetch = async (input, init) => {
        const response = await originalFetch(input, init);
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        if (response.status === 401 && !isSignInUrl(url)) {
          void redirectToSignIn(storage, router);
        }

        return response;
      };
    },
  };
}
