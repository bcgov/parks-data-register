import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedAreaComponent } from './protected-area.component';

const routes: Routes = [
  {
    path: '',
    component: ProtectedAreaComponent,
    data: {
      breadcrumb: 'Protected Areas',
    },
    children: [
      {
        path: ':id',
        loadChildren: () =>
          import('./protected-area-manage/protected-area-manage.module').then((m) => m.ProtectedAreaManageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedAreaRoutingModule {}
