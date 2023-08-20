import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/docs/introduce/zh'},




  { path: '**', redirectTo: '/docs/introduce/zh', pathMatch: 'full' }
];
