import { TabsPage } from './tabs.page';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'suggest',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/suggest/suggest.module').then(m => m.SuggestPageModule)
          }
        ]
      },
      {
        path: 'search',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/search/search.module').then(m => m.SearchPageModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: 'changeMood',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pages/change-mood/change-mood.module').then(m => m.ChangeMoodPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tab/suggest',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tab/suggest',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
