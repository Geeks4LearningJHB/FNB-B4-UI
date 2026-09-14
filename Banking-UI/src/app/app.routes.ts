import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'balance',
    loadComponent: () => import('./features/balance-enquiry/balance-enquiry').then(m => m.BalanceEnquiry),
  },
  {
    path: 'cards',
    loadComponent: () => import('./features/cards/cards').then(m => m.CardsPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
