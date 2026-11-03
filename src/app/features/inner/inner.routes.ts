import { Routes } from '@angular/router';

export const innerRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then((m) => m.Users),
  },
  {
    path: 'users/create',
    loadComponent: () => import('./users/create-user/create-user').then((m) => m.CreateUser),
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/edit-user/edit-user').then((m) => m.EditUser),
  },
  {
    path: 'lands',
    loadComponent: () => import('./lands/lands').then((m) => m.Lands),
  },
  {
    path: 'lands/create',
    loadComponent: () => import('./lands/create-land/create-land').then((m) => m.CreateLand),
  },
  {
    path: 'lands/:id',
    loadComponent: () => import('./lands/edit-land/edit-land').then((m) => m.EditLand),
  },
  {
    path: 'blocks',
    loadComponent: () => import('./blocks/blocks').then((m) => m.Blocks),
  },
  {
    path: 'blocks/create',
    loadComponent: () => import('./blocks/create-block/create-block').then((m) => m.CreateBlock),
  },
  {
    path: 'blocks/:id',
    loadComponent: () => import('./blocks/edit-block/edit-block').then((m) => m.EditBlock),
  },
  {
    path: 'plantations',
    loadComponent: () => import('./plantations/plantations').then((m) => m.Plantations),
  },
  {
    path: 'plantations/create',
    loadComponent: () =>
      import('./plantations/create-plantation/create-plantation').then((m) => m.CreatePlantation),
  },
  {
    path: 'plantations/:id',
    loadComponent: () =>
      import('./plantations/edit-plantation/edit-plantation').then((m) => m.EditPlantation),
  },
  {
    path: 'trays',
    loadComponent: () => import('./trays/trays').then((m) => m.Trays),
  },
  {
    path: 'trays/create',
    loadComponent: () => import('./trays/create-tray/create-tray').then((m) => m.CreateTray),
  },
  {
    path: 'trays/:id',
    loadComponent: () => import('./trays/edit-tray/edit-tray').then((m) => m.EditTray),
  },
  {
    path: 'harvesters',
    loadComponent: () => import('./harvesters/harvesters').then((m) => m.Harvesters),
  },
  {
    path: 'harvesters/create',
    loadComponent: () =>
      import('./harvesters/create-harvester/create-harvester').then((m) => m.CreateHarvester),
  },
  {
    path: 'harvesters/:id',
    loadComponent: () =>
      import('./harvesters/edit-harvester/edit-harvester').then((m) => m.EditHarvester),
  },
  {
    path: 'harvest',
    loadComponent: () => import('./harvest/harvest').then((m) => m.Harvest),
  },
  {
    path: 'layout',
    loadComponent: () => import('../../core/layout/main/main').then((m) => m.Main),
  },
  {
    path: '**',
    pathMatch: 'prefix',
    redirectTo: 'dashboard',
  },
];
