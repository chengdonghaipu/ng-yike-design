import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/docs/introduce/zh'},
  { path: 'docs', loadChildren: () => import('./introduces/introduce.routes').then(mod => mod.routes)},
  { path: 'components', loadChildren: () => import('./demo-module/demo.routes').then(mod => mod.routes)},
  { path: '**', redirectTo: '/docs/introduce/zh', pathMatch: 'full' }
];
