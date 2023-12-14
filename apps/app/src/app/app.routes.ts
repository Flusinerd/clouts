import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((c) => c.HomePage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((c) => c.RegisterComponent),
  },
  {
    path: 'profile/edit',
    loadComponent: () =>
      import('./profile/edit/edit-profile.component').then(
        (c) => c.EditProfileComponent
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
