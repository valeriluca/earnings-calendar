import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/tabs/tabs.component').then(m => m.TabsComponent),
    children: [
      {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar/calendar.page').then(m => m.CalendarPage)
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/list/list.page').then(m => m.ListPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full'
      }
    ]
  }
];
