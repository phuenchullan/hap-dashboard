import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    {
        path: 'sign-in',
        loadComponent: () => import('./sign-in').then(m => m.SignIn)
    },
    {
        path: '**',
        pathMatch: 'prefix',
        redirectTo: 'sign-in'
    }
]