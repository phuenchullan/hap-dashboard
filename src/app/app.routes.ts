import { Routes } from '@angular/router';
import { innerRoutes } from './features/inner/inner.routes';
import { authRoutes } from './features/auth/sign-in/auth.routes';
import { Main } from './core/layout/main/main';
import { authGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
    {
        path: 'auth',
        children: authRoutes
    },
    {
        path: '',
        component: Main,
        children: innerRoutes,
        canActivate: [authGuard]
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'inner/users'
    }
];
